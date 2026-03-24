<template>
  <div class="smart-chat-container">
    <div class="page-content">
      <div class="page-header">
        <h1 class="page-title">智能助手</h1>
        <p class="page-subtitle">DeepSeek Chat 农业智能问答</p>
      </div>
      
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
import { ref, nextTick, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useChatApi, type ChatRequest } from '/@/api/chat';

const chatApi = useChatApi();

const messageContainer = ref<HTMLElement>();
const userInput = ref('');
const loading = ref(false);
const sessionId = ref<string>(`session-${Date.now()}`);
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

const selectQuestion = (question: string) => {
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
    const assistantMessageIndex = messages.value.length;
    messages.value.push({
      role: 'assistant',
      content: ''
    });
    
    const request: ChatRequest = {
      message: userMessage,
      sessionId: sessionId.value
    };
    
    // 使用SSE接口并逐字显示
    await chatApi.chatWithMemorySse(request, (chunk: string) => {
      // 逐字追加到消息内容
      messages.value[assistantMessageIndex].content += chunk;
      nextTick(() => {
        scrollToBottom();
      });
    });
    
    loading.value = false;
    nextTick(() => {
      scrollToBottom();
    });
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '发送消息失败，请稍后重试',
    });
    console.error('Error:', error);
    if (messages.value[messages.value.length - 1].content === '') {
      messages.value.pop();
    }
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
.smart-chat-container {
  padding: 30px;
  background-color: #ffffff;
  min-height: 100%;
}

.page-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.page-header {
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0 0;
}

.chat-section {
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 70vh;
  flex: 1;
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
    min-height: 50vh;
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
