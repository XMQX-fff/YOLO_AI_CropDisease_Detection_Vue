<template>
  <div class="container">
    <div class="left-panel">
      <el-select v-model="selectedGreenhouse" placeholder="请选择温室" class="greenhouse-select" :loading="loading" value-key="id">
        <el-option
          v-for="greenhouse in greenhouses"
          :key="greenhouse.id"
          :label="greenhouse.name"
          :value="greenhouse">
        </el-option>
      </el-select>
      <el-row :gutter="20" justify="center">
        <!-- 第一行 -->
        <el-col :span="8" v-for="(item, index) in firstRow" :key="index" class="env-item">
          <i :class="`iconfontjs ${item.icon}`" class="env-icon"></i>
          <div class="env-label">{{ item.label }}</div>
          <div class="env-value">{{ item.value }}</div>
        </el-col>
        <!-- 第二行 -->
        <el-col :span="8" v-for="(item, index) in secondRow" :key="index" class="env-item">
          <i :class="`iconfontjs ${item.icon}`" class="env-icon"></i>
          <div class="env-label">{{ item.label }}</div>
          <div class="env-value">{{ item.value }}</div>
        </el-col>
        <!-- 第三行 -->
        <el-col :span="8" v-for="(item, index) in thirdRow" :key="index" class="env-item">
          <i :class="`iconfontjs ${item.icon}`" :style="{ color: item.status ? '#409EFF' : '#909399' }" class="env-icon"></i>
          <div class="env-label">{{ item.label }}</div>
          <el-switch v-model="item.status" active-color="#409EFF" inactive-color="#909399"></el-switch>
        </el-col>
      </el-row>
    </div>
    <div class="right-panel">
      <div class="chat-box">
        <div class="chat-header">
          <h3>智能建议</h3>
        </div>
        <div class="chat-body">
          <div class="message-list" v-if="markdownContent">
            <div class="message ai-message">
              <div class="message-content" v-html="markdownContent"></div>
            </div>
          </div>
          <div class="loading-indicator" v-else-if="loading">
            正在分析环境数据，生成智能建议...
          </div>
        </div>
        <div class="chat-footer">
          <el-button type="primary" @click="getSuggestions" :loading="loading" class="get-suggestion-btn">获取建议</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useGreenhouseApi } from '/@/api/greenhouse';

const { getGreenhouseList, getGreenhouseDetail } = useGreenhouseApi();

const greenhouses = ref([]);
const selectedGreenhouse = ref(null);
const greenhouseData = ref(null);
const loading = ref(false);
const apiKey = ''; // 请替换为您的DeepSeekAPI密钥

const firstRow = ref([
  { icon: 'icon-daqiwendu', label: '室内温度', value: '25.5°C' },
  { icon: 'icon-kongqishidu_kongqishidu', label: '空气湿度', value: '62.3%' },
  { icon: 'icon-turangshidu', label: '土壤湿度', value: '64.7%' },
]);

const secondRow = ref([
  { icon: 'icon-eryanghuatan', label: '二氧化碳', value: '434ppm' },
  { icon: 'icon-turangPH', label: 'PH值', value: '6.5' },
  { icon: 'icon-guangzhaoqiangdu', label: '光照强度', value: '893lux' },
]);

const thirdRow = ref([
  { icon: 'icon-shuibeng', label: '水泵', status: false },
  { icon: 'icon-a-buguangdengzidong', label: '补光灯', status: true },
  { icon: 'icon-fengshan', label: '风扇', status: false },
]);

const suggestions = ref([]);
const markdownContent = ref('');

// 简单的Markdown渲染函数
function renderMarkdown(text) {
  if (!text) return '';
  
  // 处理标题
  text = text.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');
  
  // 处理粗体
  text = text.replace(/\*\*(.*)\*\*/gim, '<strong class="markdown-bold">$1</strong>');
  
  // 处理列表
  text = text.replace(/^\- (.*$)/gim, '<li class="markdown-list-item">$1</li>');
  text = text.replace(/(<li class="markdown-list-item">.*<\/li>)/s, '<ul class="markdown-list">$1</ul>');
  
  // 处理行内代码
  text = text.replace(/`(.*)`/gim, '<code class="markdown-code">$1</code>');
  
  // 处理段落
  text = text.replace(/^(?!<h|\<li|\<ul|\<code).*$/gim, '<p class="markdown-paragraph">$&</p>');
  
  return text;
}

// 获取所有温室信息
async function fetchGreenhouses() {
  try {
    const response = await getGreenhouseList({});
    if (response.data && response.data.records) {
      greenhouses.value = response.data.records.map(item => ({
        id: item.id,
        name: item.greenhouseName
      }));
      if (greenhouses.value.length > 0) {
        selectedGreenhouse.value = greenhouses.value[0];
        fetchGreenhouseData(greenhouses.value[0].id);
      }
    }
  } catch (error) {
    console.error('获取温室列表失败:', error);
  }
}

// 根据ID获取温室数据
async function fetchGreenhouseData(id) {
  loading.value = true;
  try {
    const response = await getGreenhouseDetail(id);
    if (response.data) {
      greenhouseData.value = response.data;
      // 更新环境数据
      updateEnvData(response.data);
    }
  } catch (error) {
    console.error('获取温室数据失败:', error);
  } finally {
    loading.value = false;
  }
}

// 更新环境数据
function updateEnvData(data) {
  // 根据实际的温室数据结构更新环境数据
  firstRow.value = [
    { icon: 'icon-daqiwendu', label: '室内温度', value: `${data.temperature || 25.5}°C` },
    { icon: 'icon-kongqishidu_kongqishidu', label: '空气湿度', value: `${data.airHumidity || 62.3}%` },
    { icon: 'icon-turangshidu', label: '土壤湿度', value: `${data.soilHumidity || 64.7}%` },
  ];
  
  secondRow.value = [
    { icon: 'icon-eryanghuatan', label: '二氧化碳', value: `${data.co2Concentration || 434}ppm` },
    { icon: 'icon-turangPH', label: 'PH值', value: `${data.soilPh || 6.5}` },
    { icon: 'icon-guangzhaoqiangdu', label: '光照强度', value: `${data.lightIntensity || 893}lux` },
  ];
  
  thirdRow.value = [
    { icon: 'icon-shuibeng', label: '水泵', status: false },
    { icon: 'icon-a-buguangdengzidong', label: '补光灯', status: true },
    { icon: 'icon-fengshan', label: '风扇', status: false },
  ];
}

// 监听温室选择变化
watch(selectedGreenhouse, (newValue) => {
  if (newValue) {
    fetchGreenhouseData(newValue.id);
  }
});

// 组件加载时获取温室列表
onMounted(() => {
  fetchGreenhouses();
});

async function getSuggestions() {
  loading.value = true;
  try {
    const cropInfo = greenhouseData.value ? `当前种植作物是${greenhouseData.value.cropType || '未知'}。` : '当前种植作物信息未提供。';
    const apiKey = 'sk-rbwwfonuwpfdaoxcurhgdaklmyazympolaernwmsbuljzuqy';
    
    // 清空之前的内容
    markdownContent.value = '';
    let fullContent = '';
    const startTime = performance.now();
    console.log('[1] 开始请求:', Date.now());
    // 发送流式请求
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'Pro/zai-org/GLM-4.7',
        messages: [
          { role: 'system', content: '根据以下环境数据和种植作物提供当下环境应该调整的建议，如果不需要调整，则给出不需要调整的理由：' },
          { role: 'user', content: cropInfo },
          ...firstRow.value.map(item => ({ role: 'user', content: `${item.label}: ${item.value}` })),
          ...secondRow.value.map(item => ({ role: 'user', content: `${item.label}: ${item.value}` }))
        ],
        stream: true
      })
    });
    console.log('[2] 收到响应头:', Date.now(), '耗时:', performance.now() - startTime);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            continue;
          }
          
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices[0].delta;
            if (delta.content) {
              fullContent += delta.content;
              // 实时更新markdown内容，使用requestAnimationFrame优化渲染性能
              requestAnimationFrame(() => {
                markdownContent.value = renderMarkdown(fullContent);
              });
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
    markdownContent.value = `<div class="error-message">获取建议失败：${error.message}</div>`;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.container {
  display: flex;
  height: calc(100vh - 60px);
  background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
  padding: 20px;
  gap: 20px;
}

.left-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-y: auto;
}

.greenhouse-select {
  margin-bottom: 30px;
  width: 250px;
  display: block;

  :deep(.el-select__wrapper) {
    border-radius: 12px;
    padding: 8px 12px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }

  :deep(.el-select__input) {
    font-size: 16px;
    font-weight: 500;
  }
}

.right-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow-y: auto;
}

.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
}

.chat-header {
  padding: 15px 20px;
  background-color: #48bb78;
  color: white;
  border-bottom: 1px solid #e8e8e8;
}

.chat-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  background: none;
  -webkit-background-clip: none;
  -webkit-text-fill-color: white;
  background-clip: none;
}

.chat-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f7fafc;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  max-width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
}

.ai-message {
  align-self: flex-start;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}

.message-content {
  line-height: 1.6;
}

.chat-footer {
  padding: 15px 20px;
  background-color: #ffffff;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.get-suggestion-btn {
  min-width: 120px;
}

/* Markdown样式 */
.markdown-h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 20px 0 15px 0;
  color: #2d3748;
}

.markdown-h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 18px 0 12px 0;
  color: #2d3748;
}

.markdown-h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 16px 0 10px 0;
  color: #2d3748;
}

.markdown-paragraph {
  margin: 10px 0;
  line-height: 1.6;
  color: #4a5568;
}

.markdown-bold {
  font-weight: 700;
  color: #2d3748;
}

.markdown-list {
  margin: 10px 0 10px 20px;
  padding-left: 0;
}

.markdown-list-item {
  margin: 5px 0;
  line-height: 1.6;
  color: #4a5568;
  list-style-type: disc;
  list-style-position: outside;
}

.markdown-code {
  background-color: #f7fafc;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #e53e3e;
}

.loading-indicator {
  padding: 20px;
  text-align: center;
  color: #4a5568;
  font-size: 14px;
  animation: pulse 1.5s ease-in-out infinite;
}

.error-message {
  padding: 15px;
  background-color: #fed7d7;
  border-left: 4px solid #f56565;
  color: #742a2a;
  border-radius: 4px;
  margin-top: 10px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.el-button {
  background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
  border: none;
  color: white;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-size: 16px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.el-button:hover {
  background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.6);
}

.el-button--loading {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.6);
}

.env-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  padding: 30px 20px;
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  height: 200px;
}

.env-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #edf2f7 0%, #f7fafc 100%);
}

.env-icon {
  font-size: 50px;
  background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.env-item:hover .env-icon {
  transform: scale(1.1);
}

.env-label {
  font-size: 18px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 10px;
}

.env-value {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: all 0.3s ease;
}

.env-item:hover .env-value {
  transform: scale(1.05);
}

/* 开关样式优化 */
:deep(.el-switch) {
  margin-top: 10px;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  :deep(.el-switch__input.is-checked + .el-switch__core) {
    background-color: #48bb78;
  }
}
</style>