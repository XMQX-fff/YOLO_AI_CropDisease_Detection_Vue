<template>
  <div class="knowledge-chat-container">
    <div class="page-header">
      <h1 class="page-title">知识库问答</h1>
      <p class="page-subtitle">基于知识库文档的智能问答，获取更精准的专业回答</p>
    </div>

    <div class="chat-layout">
      <!-- 左侧问答区域 -->
      <div class="chat-main">
        <div class="chat-messages" ref="messageContainer">
          <div v-for="(message, index) in messages" :key="index"
            :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
            <div class="message-content">
              <div class="avatar">
                {{ message.role === 'user' ? '👤' : '📚' }}
              </div>
              <div class="message-body">
                <div class="text" v-if="message.role === 'user'">
                  {{ message.content }}
                </div>
                <div v-else>
                  <!-- 流式传输中使用纯文本，完成后使用 Markdown 渲染 -->
                  <div class="text" v-if="loading && index === messages.length - 1">{{ message.content }}</div>
                  <div class="text" v-else v-html="renderMarkdown(message.content)"></div>
                  <!-- 来源文档 -->
                  <div v-if="message.sources && message.sources.length > 0" class="sources-section">
                    <div class="sources-title" @click="toggleSources(index)">
                      <el-icon><Document /></el-icon>
                      <span>参考来源 ({{ message.sources.length }})</span>
                      <el-icon class="arrow-icon" :class="{ 'is-open': message.showSources }">
                        <ArrowDown />
                      </el-icon>
                    </div>
                    <div v-show="message.showSources" class="sources-list">
                      <div v-for="(source, sIndex) in message.sources" :key="sIndex" class="source-item">
                        <div class="source-header">
                          <span class="source-name">{{ source.documentName }}</span>
                          <el-tag size="small" type="success">相似度: {{ (source.score * 100).toFixed(2) }}%</el-tag>
                        </div>
                        <div class="source-content">{{ source.content }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="loading" class="message assistant-message">
            <div class="message-content">
              <div class="avatar">📚</div>
              <div class="text">
                <span class="loading-dots">知识库检索中</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="input-wrapper">
            <el-input v-model="userInput" type="textarea" :rows="3" placeholder="请输入您的问题，例如：如何防治番茄晚疫病？"
              @keyup.enter.ctrl="sendMessage" />
            <el-button type="primary" :loading="loading" @click="sendMessage" :disabled="!userInput.trim()">
              <el-icon><Promotion /></el-icon>
              发送
            </el-button>
          </div>
          <div class="input-tips">
            <span>Ctrl + Enter 发送</span>
          </div>
        </div>
      </div>

      <!-- 右侧设置面板 -->
      <div class="chat-sidebar">
        <div class="sidebar-section">
          <h4>使用提示</h4>
          <ul class="tips-list">
            <li>问题越具体，回答越精准</li>
            <li>可以询问特定作物的病虫害防治</li>
            <li>支持农业技术、种植方法等问题</li>
            <li>回答基于已上传的知识库文档</li>
          </ul>
        </div>

        <div class="sidebar-section">
          <h4>快捷问题</h4>
          <div class="quick-questions">
            <el-tag v-for="(q, i) in quickQuestions" :key="i" class="quick-tag" @click="useQuickQuestion(q)">
              {{ q }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, ArrowDown, Promotion } from '@element-plus/icons-vue';
import { useRagApi } from '/@/api/rag';

const ragApi = useRagApi();

// 类型定义
interface SourceDocument {
  content: string;
  documentName: string;
  score: number;
  metadata: any;
}

interface RagQueryRequest {
  question: string;
  topK?: number;
  similarityThreshold?: number;
  includeSources?: boolean;
}

const messageContainer = ref<HTMLElement>();
const userInput = ref('');
const loading = ref(false);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceDocument[];
  showSources?: boolean;
}

const messages = ref<Message[]>([
  {
    role: 'assistant',
    content: '您好！我是知识库问答助手。我可以基于知识库中的农业文档，为您解答农作物种植、病虫害防治、农业技术等方面的问题。',
    sources: [],
    showSources: false
  }
]);

const settings = ref({
  topK: 5,
  similarityThreshold: 0.5,
  includeSources: true
});

const quickQuestions = [
  '请举例几个常见的柑橘树病虫害',
  '如何确诊葡萄树病虫害',
  '麦类病虫害有哪些危害'
];

const renderMarkdown = (text: string): string => {
  if (!text) return '';

  // 将文本按行处理，避免流式传输中的不完整内容被错误包装
  let result = text;

  // 处理标题（确保是行首的 #）
  result = result.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
  result = result.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
  result = result.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');

  // 处理粗体
  result = result.replace(/\*\*(.*?)\*\*/gim, '<strong class="markdown-bold">$1</strong>');

  // 处理列表项（确保是行首的 - 或数字）
  result = result.replace(/^\s*[-*]\s+(.*$)/gim, '<li class="markdown-list-item">$1</li>');
  result = result.replace(/^(\d+)\.\s+(.*$)/gim, '<li class="markdown-list-item" value="$1">$2</li>');

  // 将连续的列表项包装在 ul 中
  result = result.replace(/(<li class="markdown-list-item"[^>]*>[\s\S]*?<\/li>\n?)+/gim, (match) => {
    return '<ul class="markdown-list">' + match + '</ul>';
  });

  // 处理行内代码
  result = result.replace(/`([^`]+)`/gim, '<code class="markdown-code">$1</code>');

  // 处理段落 - 只对未被包裹的行进行包装
  // 使用更保守的策略：只包装纯文本行（不以 < 开头，不是空行）
  const lines = result.split('\n');
  const processedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    // 如果已经被 HTML 标签包裹，或者包含 HTML 标签，则不处理
    if (/^<[a-zA-Z][^>]*>/.test(trimmed) || /<[a-zA-Z][^>]*>/.test(line)) {
      return line;
    }
    return '<p class="markdown-paragraph">' + line + '</p>';
  });

  return processedLines.join('\n');
};

const toggleSources = (index: number) => {
  messages.value[index].showSources = !messages.value[index].showSources;
};

const useQuickQuestion = (question: string) => {
  userInput.value = question;
  sendMessage();
};

// 中止控制器
let streamController = null;
// 内容缓冲区，用于优化流式显示
let contentBuffer = '';
let bufferTimer = null;

const flushBuffer = (index: number) => {
  if (contentBuffer && messages.value[index]) {
    messages.value[index].content += contentBuffer;
    contentBuffer = '';
  }
};

const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return;

  const userMessage = userInput.value.trim();
  messages.value.push({
    role: 'user',
    content: userMessage
  });

  userInput.value = '';
  loading.value = true;
  contentBuffer = '';

  await nextTick();
  scrollToBottom();

  // 添加一个空的助手消息用于流式显示
  const assistantMessageIndex = messages.value.length;
  messages.value.push({
    role: 'assistant',
    content: '',
    sources: [],
    showSources: false
  });

  // 设置定时刷新缓冲区
  bufferTimer = setInterval(() => {
    flushBuffer(assistantMessageIndex);
  }, 100);

  try {
    const request: RagQueryRequest = {
      question: userMessage,
      topK: settings.value.topK,
      similarityThreshold: settings.value.similarityThreshold,
      includeSources: settings.value.includeSources
    };

    // 使用流式接口
    streamController = ragApi.queryStream(
      request,
      (data) => {
        // 收到流数据
        if (data.type === 'content') {
          // 累积到缓冲区而不是直接更新
          contentBuffer += data.content;
        } else if (data.type === 'sources') {
          // 先刷新缓冲区，确保内容已更新
          flushBuffer(assistantMessageIndex);
          messages.value[assistantMessageIndex].sources = data.sources || [];
        }
      },
      (error) => {
        // 流式传输错误
        console.error('流式传输错误:', error);
        if (bufferTimer) {
          clearInterval(bufferTimer);
          bufferTimer = null;
        }
        flushBuffer(assistantMessageIndex);
        ElMessage.error('获取回答失败');
        messages.value[assistantMessageIndex].content += '抱歉，获取回答时出现错误，请稍后重试。';
        loading.value = false;
      },
      () => {
        // 流式传输完成
        if (bufferTimer) {
          clearInterval(bufferTimer);
          bufferTimer = null;
        }
        flushBuffer(assistantMessageIndex);
        loading.value = false;
        nextTick(() => {
          scrollToBottom();
        });
      }
    );
  } catch (error) {
    console.error('问答请求失败:', error);
    if (bufferTimer) {
      clearInterval(bufferTimer);
      bufferTimer = null;
    }
    flushBuffer(assistantMessageIndex);
    ElMessage.error('请求失败');
    messages.value[assistantMessageIndex].content += '抱歉，网络请求出现错误，请检查网络连接后重试。';
    loading.value = false;
  }
};

const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.knowledge-chat-container {
  padding: 30px;
  background-color: #ffffff;
  min-height: 100%;
}

.page-header {
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0 0;
}

.chat-layout {
  display: flex;
  gap: 24px;
  height: calc(100vh - 200px);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
}

.message {
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(20px);
  animation: messageAppear 0.3s ease forwards;
  display: flex;
  justify-content: flex-start;
  width: 100%;
}

@keyframes messageAppear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  display: flex;
  align-items: flex-start;
  max-width: 85%;
  gap: 12px;
  word-break: break-word;
}

.user-message .message-content {
  flex-direction: row-reverse;
  margin-left: auto;
}

.assistant-message .message-content {
  margin-right: auto;
}

.avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 1.1rem;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.text {
  padding: 12px 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  line-height: 1.6;
  font-size: 0.95rem;
}

.user-message .text {
  background-color: #3b82f6;
  color: #fff;
  border-top-right-radius: 4px;
}

.assistant-message .text {
  border-top-left-radius: 4px;
}

.sources-section {
  margin-top: 12px;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
}

.sources-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
  cursor: pointer;
  user-select: none;
}

.arrow-icon {
  margin-left: auto;
  transition: transform 0.3s;
}

.arrow-icon.is-open {
  transform: rotate(180deg);
}

.sources-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.source-item {
  padding: 10px;
  background: #ffffff;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.source-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.source-name {
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.source-content {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.chat-input-area {
  padding: 20px 24px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-wrapper :deep(.el-textarea) {
  flex: 1;
}

.input-wrapper :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 12px;
  font-size: 14px;
  resize: none;
}

.input-wrapper :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-tips {
  margin-top: 8px;
  font-size: 12px;
  color: #9ca3af;
  text-align: right;
}

.chat-sidebar {
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
}

.sidebar-section h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.setting-item {
  margin-bottom: 16px;
}

.setting-item label {
  display: block;
  font-size: 13px;
  color: #4b5563;
  margin-bottom: 8px;
}

.setting-value {
  display: inline-block;
  margin-left: 8px;
  font-size: 13px;
  color: #3b82f6;
  font-weight: 600;
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.8;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.quick-tag:hover {
  background-color: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.loading-dots {
  display: inline-block;
  position: relative;
  color: #6b7280;
}

.loading-dots::after {
  content: '...';
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { content: '.'; }
  33% { content: '..'; }
  66% { content: '...'; }
}

.markdown-h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 12px 0 8px 0;
  color: #1f2937;
}

.markdown-h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 10px 0 6px 0;
  color: #1f2937;
}

.markdown-h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 8px 0 4px 0;
  color: #1f2937;
}

.markdown-paragraph {
  margin: 6px 0;
  line-height: 1.6;
  color: #4b5563;
}

.markdown-bold {
  font-weight: 600;
  color: #1f2937;
}

.markdown-list {
  margin: 8px 0 8px 16px;
  padding-left: 0;
}

.markdown-list-item {
  margin: 4px 0;
  line-height: 1.5;
  color: #4b5563;
  list-style-type: disc;
}

.markdown-code {
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 12px;
  color: #dc2626;
}

@media (max-width: 1024px) {
  .chat-layout {
    flex-direction: column;
    height: auto;
  }

  .chat-main {
    height: 600px;
  }

  .chat-sidebar {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .knowledge-chat-container {
    padding: 16px;
  }

  .message-content {
    max-width: 95%;
  }
}
</style>
