<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 模拟环境数据
const envData = ref([
  { name: '1号温室', temperature: 25.5, humidity: 65, light: 8500, co2: 450, soilMoisture: 70 },
  { name: '2号温室', temperature: 24.8, humidity: 68, light: 8200, co2: 420, soilMoisture: 75 },
  { name: '3号温室', temperature: 26.2, humidity: 62, light: 8800, co2: 480, soilMoisture: 68 },
  { name: '4号温室', temperature: 25.1, humidity: 66, light: 8400, co2: 440, soilMoisture: 72 },
  { name: '5号温室', temperature: 24.9, humidity: 67, light: 8300, co2: 430, soilMoisture: 73 },
  { name: '6号温室', temperature: 25.8, humidity: 64, light: 8600, co2: 460, soilMoisture: 71 },
  { name: '7号温室', temperature: 25.3, humidity: 65, light: 8500, co2: 450, soilMoisture: 70 },
  { name: '8号温室', temperature: 25.0, humidity: 66, light: 8400, co2: 440, soilMoisture: 72 },
  { name: '9号温室', temperature: 25.4, humidity: 65, light: 8500, co2: 450, soilMoisture: 70 }
])

// 环境趋势数据
const envTrends = ref([
  { time: '00:00', temperature: 22.5, humidity: 70, light: 0, co2: 500 },
  { time: '04:00', temperature: 22.0, humidity: 72, light: 0, co2: 520 },
  { time: '08:00', temperature: 23.5, humidity: 68, light: 5000, co2: 480 },
  { time: '12:00', temperature: 26.0, humidity: 60, light: 10000, co2: 420 },
  { time: '16:00', temperature: 25.5, humidity: 62, light: 9000, co2: 430 },
  { time: '20:00', temperature: 24.0, humidity: 66, light: 2000, co2: 460 },
  { time: '24:00', temperature: 22.5, humidity: 70, light: 0, co2: 500 }
])

onMounted(() => {
  // 可以在这里添加获取真实数据的逻辑
})
</script>

<template>
  <div class="data-view-container">
    <!-- 右侧内容区 -->
    <section class="content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1>环境数据监测</h1>
          <p>实时监测温室环境数据变化</p>
        </div>
        
        <!-- 温室环境数据 -->
        <div class="env-section">
          <div class="card">
            <div class="card-header">
              <h3>温室环境数据</h3>
            </div>
            <div class="card-body">
              <div class="env-grid">
                <div v-for="(item, index) in envData" :key="index" class="env-item">
                  <div class="env-header">
                    <span class="greenhouse-name">{{ item.name }}</span>
                  </div>
                  <div class="env-content">
                    <div class="env-parameter">
                      <span class="label">温度：</span>
                      <span class="value">{{ item.temperature }}°C</span>
                    </div>
                    <div class="env-parameter">
                      <span class="label">湿度：</span>
                      <span class="value">{{ item.humidity }}%</span>
                    </div>
                    <div class="env-parameter">
                      <span class="label">光照：</span>
                      <span class="value">{{ item.light }} lux</span>
                    </div>
                    <div class="env-parameter">
                      <span class="label">CO2：</span>
                      <span class="value">{{ item.co2 }} ppm</span>
                    </div>
                    <div class="env-parameter">
                      <span class="label">土壤湿度：</span>
                      <span class="value">{{ item.soilMoisture }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 环境趋势分析 -->
        <div class="trend-section">
          <div class="card">
            <div class="card-header">
              <h3>环境趋势分析</h3>
            </div>
            <div class="card-body">
              <div class="chart-placeholder">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=line%20chart%20environment%20data%20temperature%20humidity%20light%20co2%20green%20color%20simple%20design&image_size=landscape_16_9" alt="环境趋势分析" />
              </div>
            </div>
          </div>
        </div>
    </section>
  </div>
</template>

<style scoped>
/* 数据大屏容器 */
.data-view-container {
  padding: 0;
  background-color: #fff;
  min-height: 100%;
}

/* 右侧内容区样式 */
.content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 页面标题样式 */
.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.page-header p {
  font-size: 16px;
  color: #666;
}

/* 卡片样式 */
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.card-header {
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-body {
  padding: 20px;
}

/* 环境数据样式 */
.env-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.env-item {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.env-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.env-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.greenhouse-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.env-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.env-parameter {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.env-parameter .label {
  font-size: 13px;
  color: #666;
}

.env-parameter .value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

/* 趋势分析样式 */
.chart-placeholder {
  width: 100%;
  height: 400px;
  border-radius: 4px;
  overflow: hidden;
}

.chart-placeholder img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .env-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .env-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-placeholder {
    height: 300px;
  }
}
</style>