<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 模拟病虫害数据
const diseaseData = ref([
  { name: '玉米', diseaseCount: 12, pestCount: 8, totalCount: 20, detectionRate: 98.5, preventionRate: 92.3 },
  { name: '水稻', diseaseCount: 10, pestCount: 6, totalCount: 16, detectionRate: 97.8, preventionRate: 91.5 },
  { name: '小麦', diseaseCount: 8, pestCount: 5, totalCount: 13, detectionRate: 96.9, preventionRate: 90.8 },
  { name: '马铃薯', diseaseCount: 15, pestCount: 10, totalCount: 25, detectionRate: 99.2, preventionRate: 93.1 },
  { name: '棉花', diseaseCount: 9, pestCount: 7, totalCount: 16, detectionRate: 97.2, preventionRate: 91.2 },
  { name: '苹果', diseaseCount: 14, pestCount: 9, totalCount: 23, detectionRate: 98.8, preventionRate: 92.7 },
  { name: '葡萄', diseaseCount: 11, pestCount: 8, totalCount: 19, detectionRate: 98.1, preventionRate: 92.0 },
  { name: '番茄', diseaseCount: 13, pestCount: 9, totalCount: 22, detectionRate: 98.6, preventionRate: 92.5 },
  { name: '草莓', diseaseCount: 10, pestCount: 6, totalCount: 16, detectionRate: 97.5, preventionRate: 91.8 }
])

// 病虫害趋势数据
const diseaseTrends = ref([
  { month: '1月', disease: 15, pest: 10 },
  { month: '2月', disease: 18, pest: 12 },
  { month: '3月', disease: 22, pest: 15 },
  { month: '4月', disease: 28, pest: 20 },
  { month: '5月', disease: 35, pest: 25 },
  { month: '6月', disease: 42, pest: 30 },
  { month: '7月', disease: 48, pest: 35 },
  { month: '8月', disease: 52, pest: 38 },
  { month: '9月', disease: 45, pest: 32 },
  { month: '10月', disease: 38, pest: 28 },
  { month: '11月', disease: 25, pest: 18 },
  { month: '12月', disease: 18, pest: 12 }
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
          <h1>病虫害统计</h1>
          <p>各类作物病虫害发生情况统计</p>
        </div>
        
        <!-- 作物病虫害数据 -->
        <div class="disease-section">
          <div class="card">
            <div class="card-header">
              <h3>作物病虫害数据</h3>
            </div>
            <div class="card-body">
              <div class="disease-grid">
                <div v-for="(item, index) in diseaseData" :key="index" class="disease-item">
                  <div class="disease-header">
                    <span class="crop-name">{{ item.name }}</span>
                  </div>
                  <div class="disease-content">
                    <div class="disease-parameter">
                      <span class="label">病害数量：</span>
                      <span class="value">{{ item.diseaseCount }}</span>
                    </div>
                    <div class="disease-parameter">
                      <span class="label">虫害数量：</span>
                      <span class="value">{{ item.pestCount }}</span>
                    </div>
                    <div class="disease-parameter">
                      <span class="label">总数量：</span>
                      <span class="value">{{ item.totalCount }}</span>
                    </div>
                    <div class="detection-rate">
                      <span class="label">检测率：</span>
                      <div class="progress-bar">
                        <div class="progress" :style="{ width: item.detectionRate + '%' }"></div>
                      </div>
                      <span class="value">{{ item.detectionRate }}%</span>
                    </div>
                    <div class="prevention-rate">
                      <span class="label">预防率：</span>
                      <div class="progress-bar">
                        <div class="progress" :style="{ width: item.preventionRate + '%' }"></div>
                      </div>
                      <span class="value">{{ item.preventionRate }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 病虫害趋势分析 -->
        <div class="trend-section">
          <div class="card">
            <div class="card-header">
              <h3>病虫害趋势分析</h3>
            </div>
            <div class="card-body">
              <div class="chart-placeholder">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=line%20chart%20disease%20and%20pest%20trend%20over%20months%20green%20color%20simple%20design&image_size=landscape_16_9" alt="病虫害趋势分析" />
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

/* 病虫害数据样式 */
.disease-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.disease-item {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.disease-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.disease-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.crop-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.disease-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.disease-parameter {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.disease-parameter .label {
  font-size: 13px;
  color: #666;
}

.disease-parameter .value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.detection-rate, .prevention-rate {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detection-rate .label, .prevention-rate .label {
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
  background-color: #ff5722;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.detection-rate .value, .prevention-rate .value {
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
  .disease-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .disease-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-placeholder {
    height: 300px;
  }
}
</style>