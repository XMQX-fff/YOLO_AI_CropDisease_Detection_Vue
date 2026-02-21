<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 模拟产量预测数据
const yieldData = ref([
  { name: '玉米', predictedYield: 1200, actualYield: 1150, accuracy: 95.8, trend: '上升' },
  { name: '水稻', predictedYield: 900, actualYield: 880, accuracy: 97.8, trend: '上升' },
  { name: '小麦', predictedYield: 800, actualYield: 780, accuracy: 97.5, trend: '稳定' },
  { name: '马铃薯', predictedYield: 2500, actualYield: 2450, accuracy: 98.0, trend: '上升' },
  { name: '棉花', predictedYield: 300, actualYield: 290, accuracy: 96.7, trend: '稳定' },
  { name: '苹果', predictedYield: 4000, actualYield: 3900, accuracy: 97.5, trend: '上升' },
  { name: '葡萄', predictedYield: 3500, actualYield: 3400, accuracy: 97.1, trend: '上升' },
  { name: '番茄', predictedYield: 8000, actualYield: 7800, accuracy: 97.5, trend: '上升' },
  { name: '草莓', predictedYield: 3000, actualYield: 2900, accuracy: 96.7, trend: '稳定' }
])

// 产量趋势数据
const yieldTrends = ref([
  { year: '2020', corn: 1000, rice: 800, wheat: 700, potato: 2000 },
  { year: '2021', corn: 1050, rice: 820, wheat: 720, potato: 2100 },
  { year: '2022', corn: 1100, rice: 850, wheat: 750, potato: 2200 },
  { year: '2023', corn: 1150, rice: 880, wheat: 780, potato: 2300 },
  { year: '2024', corn: 1200, rice: 900, wheat: 800, potato: 2400 },
  { year: '2025', corn: 1250, rice: 920, wheat: 820, potato: 2500 },
  { year: '2026', corn: 1300, rice: 950, wheat: 850, potato: 2600 }
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
          <h1>产量预测</h1>
          <p>基于历史数据和当前生长状态的作物产量预测</p>
        </div>
        
        <!-- 作物产量预测 -->
        <div class="yield-section">
          <div class="card">
            <div class="card-header">
              <h3>作物产量预测</h3>
            </div>
            <div class="card-body">
              <div class="yield-grid">
                <div v-for="(item, index) in yieldData" :key="index" class="yield-item">
                  <div class="yield-header">
                    <span class="crop-name">{{ item.name }}</span>
                    <span class="trend" :class="{ 'up': item.trend === '上升', 'stable': item.trend === '稳定', 'down': item.trend === '下降' }">
                      {{ item.trend }}
                    </span>
                  </div>
                  <div class="yield-content">
                    <div class="yield-parameter">
                      <span class="label">预测产量：</span>
                      <span class="value">{{ item.predictedYield }}kg/亩</span>
                    </div>
                    <div class="yield-parameter">
                      <span class="label">实际产量：</span>
                      <span class="value">{{ item.actualYield }}kg/亩</span>
                    </div>
                    <div class="yield-parameter">
                      <span class="label">预测准确率：</span>
                      <span class="value">{{ item.accuracy }}%</span>
                    </div>
                    <div class="accuracy-rate">
                      <span class="label">准确率：</span>
                      <div class="progress-bar">
                        <div class="progress" :style="{ width: item.accuracy + '%' }"></div>
                      </div>
                      <span class="value">{{ item.accuracy }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 产量趋势分析 -->
        <div class="trend-section">
          <div class="card">
            <div class="card-header">
              <h3>产量趋势分析</h3>
            </div>
            <div class="card-body">
              <div class="chart-placeholder">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=line%20chart%20crop%20yield%20trend%20over%20years%20multiple%20crops%20green%20color%20simple%20design&image_size=landscape_16_9" alt="产量趋势分析" />
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

/* 产量预测样式 */
.yield-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.yield-item {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.yield-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.yield-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.crop-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.trend {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.trend.up {
  background-color: #e8f5e8;
  color: #28a745;
}

.trend.stable {
  background-color: #e3f2fd;
  color: #1976d2;
}

.trend.down {
  background-color: #ffebee;
  color: #dc3545;
}

.yield-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.yield-parameter {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.yield-parameter .label {
  font-size: 13px;
  color: #666;
}

.yield-parameter .value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.accuracy-rate {
  display: flex;
  align-items: center;
  gap: 12px;
}

.accuracy-rate .label {
  font-size: 13px;
  color: #666;
  min-width: 60px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #4caf50;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.accuracy-rate .value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  min-width: 40px;
  text-align: right;
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
  .yield-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .yield-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-placeholder {
    height: 300px;
  }
}
</style>