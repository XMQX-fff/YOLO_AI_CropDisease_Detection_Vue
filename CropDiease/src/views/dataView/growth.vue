<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 模拟数据
const growthData = ref([
  { name: '玉米', stage: '成熟期', growthRate: 95, healthStatus: '良好', yieldPrediction: '1200kg/亩' },
  { name: '水稻', stage: '抽穗期', growthRate: 85, healthStatus: '良好', yieldPrediction: '900kg/亩' },
  { name: '小麦', stage: '灌浆期', growthRate: 80, healthStatus: '一般', yieldPrediction: '800kg/亩' },
  { name: '马铃薯', stage: '膨大期', growthRate: 90, healthStatus: '良好', yieldPrediction: '2500kg/亩' },
  { name: '棉花', stage: '花铃期', growthRate: 75, healthStatus: '一般', yieldPrediction: '300kg/亩' },
  { name: '苹果', stage: '着色期', growthRate: 88, healthStatus: '良好', yieldPrediction: '4000kg/亩' }
])

// 生长趋势数据
const growthTrends = ref([
  { date: '1月', corn: 60, rice: 55, wheat: 70, potato: 65 },
  { date: '2月', corn: 65, rice: 60, wheat: 75, potato: 70 },
  { date: '3月', corn: 70, rice: 65, wheat: 80, potato: 75 },
  { date: '4月', corn: 75, rice: 70, wheat: 85, potato: 80 },
  { date: '5月', corn: 80, rice: 75, wheat: 90, potato: 85 },
  { date: '6月', corn: 85, rice: 80, wheat: 95, potato: 90 },
  { date: '7月', corn: 90, rice: 85, wheat: 100, potato: 95 }
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
          <h1>农作物生长监测</h1>
          <p>实时监测各类农作物的生长状态和趋势</p>
        </div>
        
        <!-- 作物生长状态 -->
        <div class="growth-section">
          <div class="card">
            <div class="card-header">
              <h3>作物生长状态</h3>
            </div>
            <div class="card-body">
              <div class="growth-grid">
                <div v-for="(item, index) in growthData" :key="index" class="growth-item">
                  <div class="growth-header">
                    <span class="crop-name">{{ item.name }}</span>
                    <span class="stage">{{ item.stage }}</span>
                  </div>
                  <div class="growth-content">
                    <div class="growth-rate">
                      <span class="label">生长率：</span>
                      <div class="progress-bar">
                        <div class="progress" :style="{ width: item.growthRate + '%' }"></div>
                      </div>
                      <span class="value">{{ item.growthRate }}%</span>
                    </div>
                    <div class="health-status">
                      <span class="label">健康状态：</span>
                      <span class="status" :class="{ 'good': item.healthStatus === '良好', 'normal': item.healthStatus === '一般' }">
                        {{ item.healthStatus }}
                      </span>
                    </div>
                    <div class="yield-prediction">
                      <span class="label">产量预测：</span>
                      <span class="value">{{ item.yieldPrediction }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 生长趋势分析 -->
        <div class="trend-section">
          <div class="card">
            <div class="card-header">
              <h3>生长趋势分析</h3>
            </div>
            <div class="card-body">
              <div class="chart-placeholder">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=line%20chart%20crop%20growth%20trend%20multiple%20crops%20green%20color%20simple%20design&image_size=landscape_16_9" alt="生长趋势分析" />
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

/* 生长状态样式 */
.growth-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.growth-item {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.growth-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.growth-header {
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

.stage {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.growth-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.growth-rate {
  display: flex;
  align-items: center;
  gap: 12px;
}

.growth-rate .label {
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

.growth-rate .value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  min-width: 40px;
  text-align: right;
}

.health-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.health-status .label {
  font-size: 13px;
  color: #666;
  min-width: 60px;
}

.status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status.good {
  background-color: #e8f5e8;
  color: #28a745;
}

.status.normal {
  background-color: #fff3cd;
  color: #856404;
}

.yield-prediction {
  display: flex;
  align-items: center;
  gap: 12px;
}

.yield-prediction .label {
  font-size: 13px;
  color: #666;
  min-width: 60px;
}

.yield-prediction .value {
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
  .growth-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .growth-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-placeholder {
    height: 300px;
  }
}
</style>