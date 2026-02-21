<template>
  <div class="smart-chat-container">
    <!-- 页面内容区域 -->
    <div class="page-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">智能助手</h1>
        <p class="page-subtitle">DeepSeek Chat 农业智能问答</p>
      </div>
      
      <!-- 聊天区域 -->
      <div class="chat-section">
        <div class="chat-messages" ref="messageContainer">
          <div v-for="(message, index) in messages" :key="index" 
               :class="['message', message.role === 'user' ? 'user-message' : 'assistant-message']">
            <div class="message-content">
              <div class="avatar">
                {{ message.role === 'user' ? '👤' : '🤖' }}
              </div>
              <div class="text" v-if="message.role === 'user'">
                {{ message.content }}
              </div>
              <div class="text" v-else v-html="renderMarkdown(message.content)"></div>
            </div>
          </div>
          <div v-if="loading" class="message assistant-message">
            <div class="message-content">
              <div class="avatar">🤖</div>
              <div class="text">
                <span class="loading-dots">思考中</span>
              </div>
            </div>
          </div>
        </div>
    
        <!-- 推荐问题 -->
        <div class="suggested-questions" v-if="messages.length === 1">
          <div class="suggested-title">猜你想问</div>
          <div class="suggested-list">
            <div v-for="(question, index) in suggestedQuestions" 
                 :key="index" 
                 class="suggested-item"
                 @click="selectQuestion(question)">
              {{ question }}
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input">
          <el-input
            v-model="userInput"
            type="textarea"
            :rows="3"
            placeholder="请输入您的问题..."
            @keyup.enter.ctrl="sendMessage"
          />
          <el-button 
            type="primary" 
            :loading="loading"
            @click="sendMessage"
            :disabled="!userInput.trim()"
          >
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';

// 定义变量
const messageContainer = ref<HTMLElement>();
const userInput = ref('');
const loading = ref(false);
const messages = ref([
  {
    role: 'assistant',
    content: '你好，我是你的农业智能小助手，你可以向我提问关于农作物种植、病虫害防治、农业技术等方面的问题！'
  }
]);

const suggestedQuestions = [
  '如何防治水稻病害？',
  '玉米常见病虫害有哪些？',
  '小麦生长周期是多少天？',
  '如何提高农作物产量？',
  '农药使用注意事项有哪些？',
  '农作物施肥的最佳时间？',
  '如何识别植物病害症状？'
];

// Markdown渲染函数
const renderMarkdown = (text: string): string => {
  if (!text) return '';
  
  // 替换标题
  text = text.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');
  
  // 替换粗体
  text = text.replace(/\*\*(.*?)\*\*/gim, '<strong class="markdown-bold">$1</strong>');
  
  // 替换列表
  text = text.replace(/^\s*\-\s+(.*$)/gim, '<li class="markdown-list-item">$1</li>');
  text = text.replace(/(<li class="markdown-list-item">[\s\S]*?<\/li>)/gim, '<ul class="markdown-list">$1</ul>');
  
  // 替换行内代码
  text = text.replace(/`(.*?)`/gim, '<code class="markdown-code">$1</code>');
  
  // 替换段落
  text = text.replace(/^(?!<h[1-6]>)(?!<li>)(?!<ul>)(?!<code>)(.*$)/gim, '<p class="markdown-paragraph">$1</p>');
  
  return text;
};

// 选择推荐问题
const selectQuestion = (question: string) => {
  userInput.value = question;
  sendMessage();
};

// 发送消息
const sendMessage = async () => {
  if (!userInput.value.trim() || loading.value) return;

  const userMessage = userInput.value.trim();
  messages.value.push({
    role: 'user',
    content: userMessage
  });
  
  userInput.value = '';
  loading.value = true;

  // 滚动到底部
  await nextTick();
  scrollToBottom();

  try {
    // 添加一个临时的assistant消息用于显示流式输出
    const assistantMessageIndex = messages.value.length;
    messages.value.push({
      role: 'assistant',
      content: ''
    });
    
    // 模拟API响应
    setTimeout(() => {
      let fullContent = '';
      const responses: string[] = [
        '我是农业智能助手，专注于农作物种植和病虫害防治领域。',
        '针对您的问题，我需要分析具体情况。',
        '以下是一些建议：',
        '1. 定期检查作物生长状况',
        '2. 合理施肥和灌溉',
        '3. 及时防治病虫害',
        '4. 选择适合当地气候的作物品种'
      ];
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < responses.length) {
          fullContent += responses[index] + '\n';
          messages.value[assistantMessageIndex].content = fullContent;
          nextTick(() => {
            scrollToBottom();
          });
          index++;
        } else {
          clearInterval(interval);
          loading.value = false;
          nextTick(() => {
            scrollToBottom();
          });
        }
      }, 300);
    }, 1000);
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '发送消息失败，请稍后重试',
    });
    console.error('Error:', error);
    // 移除最后一个空的assistant消息
    if (messages.value[messages.value.length - 1].content === '') {
      messages.value.pop();
    }
    loading.value = false;
  }
};

// 滚动到底部
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 页面加载时
onMounted(() => {
  // 初始化滚动位置
  scrollToBottom();
});
</script>

<style scoped>
.smart-chat-container {
  padding: 24px;
  background-color: #ffffff;
  min-height: calc(100vh - 120px);
}

.page-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.chat-section {
  background-color: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 600px;
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
  max-width: 70%;
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
  transition: transform 0.2s ease;
}

.text {
  padding: 12px 16px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  line-height: 1.6;
  font-size: 0.95rem;
  position: relative;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 0;
  white-space: normal;
  word-wrap: break-word;
}

.user-message .text {
  background-color: #3b82f6;
  color: #fff;
  border-top-right-radius: 4px;
}

.assistant-message .text {
  border-top-left-radius: 4px;
}

.suggested-questions {
  padding: 20px 24px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.suggested-title {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 12px;
}

.suggested-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggested-item {
  padding: 8px 16px;
  background-color: #f3f4f6;
  border-radius: 20px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e5e7eb;
}

.suggested-item:hover {
  background-color: #e5e7eb;
  transform: translateY(-1px);
}

.chat-input {
  padding: 20px 24px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.chat-input :deep(.el-textarea) {
  flex: 1;
}

.chat-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  padding: 12px;
  font-size: 14px;
  resize: none;
  transition: all 0.2s ease;
}

.chat-input :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.chat-input :deep(.el-button) {
  border-radius: 8px;
  padding: 0 24px;
  height: 40px;
  background-color: #3b82f6;
  border: none;
  transition: all 0.2s ease;
}

.chat-input :deep(.el-button:hover) {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.chat-input :deep(.el-button:disabled) {
  background-color: #9ca3af;
  transform: none;
  box-shadow: none;
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

/* Markdown样式 */
.markdown-h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 15px 0 10px 0;
  color: #1f2937;
}

.markdown-h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 12px 0 8px 0;
  color: #1f2937;
}

.markdown-h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 10px 0 6px 0;
  color: #1f2937;
}

.markdown-paragraph {
  margin: 8px 0;
  line-height: 1.6;
  color: #4b5563;
}

.markdown-bold {
  font-weight: 600;
  color: #1f2937;
}

.markdown-list {
  margin: 10px 0 10px 20px;
  padding-left: 0;
}

.markdown-list-item {
  margin: 5px 0;
  line-height: 1.6;
  color: #4b5563;
  list-style-type: disc;
  list-style-position: outside;
}

.markdown-code {
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #dc2626;
}

/* 自定义滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .smart-chat-container {
    padding: 16px;
  }
  
  .page-content {
    max-width: 100%;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .chat-section {
    min-height: 500px;
  }
  
  .chat-messages {
    padding: 16px;
  }
  
  .suggested-questions {
    padding: 16px;
  }
  
  .chat-input {
    padding: 16px;
  }
}
</style>