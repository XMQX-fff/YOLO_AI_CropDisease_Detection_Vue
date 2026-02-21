<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 模拟数据
const statistics = ref({
  users: 42,
  greenhouse: 9,
  diseases: 141,
  yield: 1232,
  detectionRate: 98.5,
  preventionRate: 92.3
})

// 天气信息
const weatherInfo = ref({
  date: '',
  weekday: '',
  status: '',
  temperature: '',
  weather: '',
  wind: '',
  airQuality: '',
  notice: ''
})

// 种植作物数据
const cropTypes = ref([
  { name: '1号温室', crop: '玉米', status: '生长良好', plantCount: 350, diseaseCount: 20, healthRate: 94.3 },
  { name: '2号温室', crop: '水稻', status: '生长良好', plantCount: 400, diseaseCount: 15, healthRate: 96.3 },
  { name: '3号温室', crop: '小麦', status: '需要关注', plantCount: 350, diseaseCount: 18, healthRate: 94.9 },
  { name: '4号温室', crop: '马铃薯', status: '生长良好', plantCount: 250, diseaseCount: 12, healthRate: 95.2 },
  { name: '5号温室', crop: '棉花', status: '生长良好', plantCount: 300, diseaseCount: 16, healthRate: 94.7 },
  { name: '6号温室', crop: '苹果', status: '需要关注', plantCount: 8, diseaseCount: 14, healthRate: 93.1 },
  { name: '7号温室', crop: '葡萄', status: '生长良好', plantCount: 300, diseaseCount: 17, healthRate: 94.4 },
  { name: '8号温室', crop: '番茄', status: '生长良好', plantCount: 300, diseaseCount: 14, healthRate: 95.3 },
  { name: '9号温室', crop: '草莓', status: '生长良好', plantCount: 300, diseaseCount: 15, healthRate: 95.0 }
])

// 获取天气数据
const fetchWeatherData = async () => {
  try {
    // 固定使用广州的天气
    const city = '广州'
    const url = `https://uapis.cn/api/v1/misc/weather?city=${encodeURIComponent(city)}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    // 解析UAPI返回的数据结构
    const weatherData = data
    const temperature = weatherData.temperature
    const weatherDesc = weatherData.weather
    const windDirection = weatherData.wind_direction
    const windPower = weatherData.wind_power
    const humidity = weatherData.humidity
    const reportTime = weatherData.report_time
    
    // 获取当前日期和星期
    const now = new Date()
    const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' }
    const weekdayOptions = { weekday: 'long' } as Intl.DateTimeFormatOptions
    const date = now.toLocaleDateString('zh-CN', dateOptions)
    const weekday = now.toLocaleDateString('zh-CN', weekdayOptions)
    
    weatherInfo.value = {
      date: date,
      weekday: weekday,
      status: `${weatherData.province} ${weatherData.city}`,
      temperature: temperature + '°C',
      weather: weatherDesc,
      wind: `${windDirection} ${windPower}级`,
      airQuality: `湿度: ${humidity}%`,
      notice: `当前天气${weatherDesc}，温度${temperature}°C，请注意适当增减衣物。\n数据更新时间：${reportTime}`
    }
  } catch (err) {
    console.error('获取天气数据失败:', err)
    // 模拟数据
    weatherInfo.value = {
      date: '2026-02-20',
      weekday: '星期五',
      status: '广东 广州',
      temperature: '25°C',
      weather: '晴',
      wind: '南风 3级',
      airQuality: '湿度: 65%',
      notice: '当前天气晴，温度25°C，请注意适当增减衣物。\n数据更新时间：2026-02-20 08:00'
    }
  }
}

onMounted(() => {
  fetchWeatherData() // 获取天气数据
})


</script>

<template>
  <div class="data-view-container">
    <!-- 右侧内容区 -->
    <section class="content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1>数据大屏</h1>
          <p>农业生产数据实时监控与分析</p>
        </div>
        
        <!-- 数据概览 -->
        <div class="overview-section">
          <div class="card">
            <div class="card-header">
              <h3>数据概览</h3>
            </div>
            <div class="card-body">
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20icon%20green%20color%20simple%20design&image_size=square" alt="用户" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ statistics.users }}</div>
                    <div class="stat-label">用户</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=greenhouse%20icon%20green%20color%20simple%20design&image_size=square" alt="温室" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ statistics.greenhouse }}</div>
                    <div class="stat-label">温室</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=disease%20icon%20green%20color%20simple%20design&image_size=square" alt="病害" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ statistics.diseases }}</div>
                    <div class="stat-label">病害</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yield%20icon%20green%20color%20simple%20design&image_size=square" alt="产量" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ statistics.yield }}</div>
                    <div class="stat-label">产量</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=detection%20icon%20green%20color%20simple%20design&image_size=square" alt="检测率" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ statistics.detectionRate }}%</div>
                    <div class="stat-label">检测率</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=prevention%20icon%20green%20color%20simple%20design&image_size=square" alt="预防率" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ statistics.preventionRate }}%</div>
                    <div class="stat-label">预防率</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 温室作物信息 -->
        <div class="crop-section">
          <div class="card">
            <div class="card-header">
              <h3>温室作物信息</h3>
            </div>
            <div class="card-body">
              <div class="crop-grid">
                <div v-for="(item, index) in cropTypes" :key="index" class="crop-item">
                  <div class="crop-header">
                    <span class="greenhouse-name">{{ item.name }}</span>
                    <span class="status" :class="{ 'warning': item.status === '需要关注' }">
                      {{ item.status }}
                    </span>
                  </div>
                  <div class="crop-content">
                    <div class="crop-type">作物：{{ item.crop }}</div>
                    <div class="crop-numbers">
                      <span class="plant-count">种植数量：{{ item.plantCount }}</span>
                      <span class="disease-count">病害数量：{{ item.diseaseCount }}</span>
                    </div>
                    <div class="health-rate">
                      <span class="label">健康率：</span>
                      <div class="progress-bar">
                        <div class="progress" :style="{ width: item.healthRate + '%' }"></div>
                      </div>
                      <span class="value">{{ item.healthRate }}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 数据图表 -->
        <div class="charts-section">
          <div class="card">
            <div class="card-header">
              <h3>数据趋势分析</h3>
            </div>
            <div class="card-body">
              <div class="charts-grid">
                <!-- 模拟图表区域 -->
                <div class="chart-item">
                  <h4>病害检测趋势</h4>
                  <div class="chart-placeholder">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=line%20chart%20disease%20detection%20trend%20green%20color%20simple%20design&image_size=landscape_16_9" alt="病害检测趋势" />
                  </div>
                </div>
                <div class="chart-item">
                  <h4>作物产量分析</h4>
                  <div class="chart-placeholder">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bar%20chart%20crop%20yield%20analysis%20green%20color%20simple%20design&image_size=landscape_16_9" alt="作物产量分析" />
                  </div>
                </div>
                <div class="chart-item">
                  <h4>温室环境数据</h4>
                  <div class="chart-placeholder">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=area%20chart%20greenhouse%20environment%20data%20green%20color%20simple%20design&image_size=landscape_16_9" alt="温室环境数据" />
                  </div>
                </div>
                <div class="chart-item">
                  <h4>病虫害分布</h4>
                  <div class="chart-placeholder">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pie%20chart%20pest%20distribution%20green%20color%20simple%20design&image_size=landscape_16_9" alt="病虫害分布" />
                  </div>
                </div>
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

/* 数据概览样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.stat-item:hover {
  background-color: #e8f5e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
}

.stat-icon img {
  width: 24px;
  height: 24px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

/* 温室作物信息样式 */
.crop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.crop-item {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.crop-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.crop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.greenhouse-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #e8f5e8;
  color: #28a745;
  font-weight: 500;
}

.status.warning {
  background-color: #fff3cd;
  color: #856404;
}

.crop-type {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.crop-numbers {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.plant-count, .disease-count {
  font-size: 13px;
  color: #666;
}

.health-rate {
  display: flex;
  align-items: center;
  gap: 12px;
}

.health-rate .label {
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
  background-color: #28a745;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.health-rate .value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  min-width: 40px;
  text-align: right;
}

/* 数据图表样式 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.chart-item h4 {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.chart-placeholder {
  width: 100%;
  height: 200px;
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
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .crop-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .crop-grid {
    grid-template-columns: 1fr;
  }
}
</style>