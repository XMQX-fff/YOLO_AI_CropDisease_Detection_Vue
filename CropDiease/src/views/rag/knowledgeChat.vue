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
                  <div class="text" v-html="renderMarkdown(message.content)"></div>
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
                          <el-tag size="small" type="success">相似度: {{ (source.score * 100).toFixed(1) }}%</el-tag>
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
          <h4>检索设置</h4>
          <div class="setting-item">
            <label>返回文档数</label>
            <el-slider v-model="settings.topK" :min="1" :max="10" :step="1" show-stops />
            <span class="setting-value">{{ settings.topK }}</span>
          </div>
          <div class="setting-item">
            <label>相似度阈值</label>
            <el-slider v-model="settings.similarityThreshold" :min="0" :max="1" :step="0.1" show-stops />
            <span class="setting-value">{{ settings.similarityThreshold }}</span>
          </div>
          <div class="setting-item">
            <el-checkbox v-model="settings.includeSources">显示参考来源</el-checkbox>
          </div>
        </div>

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
import { useRagApi, type RagQueryRequest, type SourceDocument } from '/@/api/rag';

const ragApi = useRagApi();

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
  similarityThreshold: 0.7,
  includeSources: true
});

const quickQuestions = [
  '如何防治水稻稻瘟病？',
  '番茄种植的最佳温度是多少？',
  '苹果树常见病虫害有哪些？',
  '温室大棚如何控制湿度？',
  '有机肥料的使用方法'
];

const renderMarkdown = (text: string): string => {
  if (!text) return '';

  text = text.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');

  text = text.replace(/\*\*(.*?)\*\*/gim, '<strong class="markdown-bold">$1</strong>');

  text = text.replace(/^\s*\-\s+(.*$)/gim, '<li class="markdown-list-item">$1</li>');
  text = text.replace(/(<li class="markdown-list-item">[\s\S]*?<\/li>)/gim, '<ul class="markdown-list">$1</ul>');

  text = text.replace(/`(.*?)`/gim, '<code class="markdown-code">$1</code>');

  text = text.replace(/^(?!<h[1-6]>)(?!<li>)(?!<ul>)(?!<code>)(.*$)/gim, '<p class="markdown-paragraph">$1</p>');

  return text;
};

const toggleSources = (index: number) => {
  messages.value[index].showSources = !messages.value[index].showSources;
};

const useQuickQuestion = (question: string) => {
  userInput.value = question;
  sendMessage();
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

  await nextTick();
  scrollToBottom();

  try {
    const request: RagQueryRequest = {
      question: userMessage,
      topK: settings.value.topK,
      similarityThreshold: settings.value.similarityThreshold,
      includeSources: settings.value.includeSources
    };

    const res: any = await ragApi.query(request);

    if (res.code === 200) {
      const response = res.data;
      messages.value.push({
        role: 'assistant',
        content: response.answer,
        sources: response.sources || [],
        showSources: false
      });
    } else {
      ElMessage.error(res.message || '获取回答失败');
      messages.value.push({
        role: 'assistant',
        content: '抱歉，获取回答时出现错误，请稍后重试。',
        sources: [],
        showSources: false
      });
    }
  } catch (error) {
    console.error('问答请求失败:', error);
    ElMessage.error('请求失败');
    messages.value.push({
      role: 'assistant',
      content: '抱歉，网络请求出现错误，请检查网络连接后重试。',
      sources: [],
      showSources: false
    });
  } finally {
    loading.value = false;
    nextTick(() => {
      scrollToBottom();
    });
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
