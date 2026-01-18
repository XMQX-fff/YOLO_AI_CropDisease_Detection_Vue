<template>
  <div class="container">
    <div class="left-panel">
      <el-select v-model="selectedGreenhouse" placeholder="请选择温室" class="greenhouse-select">
        <el-option
          v-for="(greenhouse, index) in greenhouses"
          :key="index"
          :label="greenhouse"
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
      <div class="suggestion-box">
        <h3>智能建议</h3>
        <el-button type="primary" @click="getSuggestions" :loading="loading">获取建议</el-button>
        <div class="suggestions" v-if="suggestions.length">
          <p v-for="(suggestion, index) in suggestions" :key="index">{{ suggestion }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const greenhouses = ref(['1号温室', '2号温室', '3号温室', '4号温室', '5号温室', '6号温室', '7号温室', '8号温室', '9号温室']);
const selectedGreenhouse = ref(greenhouses.value[0]);

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
const loading = ref(false);
const apiKey = ''; // 请替换为您的DeepSeekAPI密钥

async function getSuggestions() {
  loading.value = true;
  try {
    const cropInfo = selectedGreenhouse.value === '1号温室' ? '当前种植作物是玉米。' : '当前种植作物信息未提供。';
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '根据以下环境数据和种植作物提供当下环境应该调整的建议，如果不需要调整，则给出不需要调整的理由：' },
        { role: 'user', content: cropInfo },
        ...firstRow.value.map(item => ({ role: 'user', content: `${item.label}: ${item.value}` })),
        ...secondRow.value.map(item => ({ role: 'user', content: `${item.label}: ${item.value}` }))
      ],
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    suggestions.value = response.data.choices[0].message.content.split('\n');
  } catch (error) {
    console.error('Error:', error);
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

.suggestion-box {
  text-align: center;
  padding: 30px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.suggestion-box:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.suggestion-box h3 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 30px;
  color: #2d3748;
  background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.suggestions {
  text-align: left;
  margin-top: 25px;
  padding: 20px;
  background-color: white;
  border-radius: 12px;
  line-height: 1.8;
  font-size: 16px;
  color: #4a5568;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #48bb78;
  flex: 1;
  width: 100%;
  overflow-y: auto;
}

.suggestions p {
  margin-bottom: 15px;
  padding-left: 15px;
  position: relative;

  &:before {
    content: '•';
    position: absolute;
    left: 0;
    top: 0;
    color: #48bb78;
    font-weight: bold;
    font-size: 20px;
    line-height: 1.6;
  }
}

.suggestions p:last-child {
  margin-bottom: 0;
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