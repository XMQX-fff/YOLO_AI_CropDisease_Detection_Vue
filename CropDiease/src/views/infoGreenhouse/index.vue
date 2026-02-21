<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useGreenhouseApi } from '/@/api/greenhouse'

// 温室数据
const greenhouses = ref([] as any[])
const greenhouseApi = useGreenhouseApi()
const loading = ref(false)

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

// 获取温室数据
const fetchGreenhouseData = async () => {
  loading.value = true
  try {
    const response = await greenhouseApi.getGreenhouseList({})
    const data = response.data
    if (data && data.records) {
      greenhouses.value = data.records.map((item: any) => ({
        ...item,
        temperature: item.temperature + '°C',
        humidity: item.humidity + '%',
        light: item.light + 'lux',
        soilMoisture: item.soilMoisture + '%'
      }))
    } else {
      // 模拟数据
      greenhouses.value = [
        { id: 1, name: '1号温室', crop: '玉米', status: '生长良好', temperature: '25°C', humidity: '65%', light: '8000lux', soilMoisture: '45%', lastUpdated: '2026-02-20 15:30' },
        { id: 2, name: '2号温室', crop: '水稻', status: '生长良好', temperature: '28°C', humidity: '75%', light: '7500lux', soilMoisture: '55%', lastUpdated: '2026-02-20 15:30' },
        { id: 3, name: '3号温室', crop: '小麦', status: '需要关注', temperature: '22°C', humidity: '60%', light: '9000lux', soilMoisture: '40%', lastUpdated: '2026-02-20 15:30' }
      ]
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取温室数据失败',
    })
    console.error('获取温室数据失败:', error)
    // 模拟数据
    greenhouses.value = [
      { id: 1, name: '1号温室', crop: '玉米', status: '生长良好', temperature: '25°C', humidity: '65%', light: '8000lux', soilMoisture: '45%', lastUpdated: '2026-02-20 15:30' },
      { id: 2, name: '2号温室', crop: '水稻', status: '生长良好', temperature: '28°C', humidity: '75%', light: '7500lux', soilMoisture: '55%', lastUpdated: '2026-02-20 15:30' },
      { id: 3, name: '3号温室', crop: '小麦', status: '需要关注', temperature: '22°C', humidity: '60%', light: '9000lux', soilMoisture: '40%', lastUpdated: '2026-02-20 15:30' }
    ]
  } finally {
    loading.value = false
  }
}

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
    const weekdayOptions = { weekday: 'long' }
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

// 添加温室
const addGreenhouse = async () => {
  try {
    ElMessage({
      type: 'info',
      message: '添加温室功能开发中',
    })
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '操作失败',
    })
  }
}

// 刷新数据
const refreshData = () => {
  fetchGreenhouseData()
  fetchWeatherData()
}

onMounted(() => {
  fetchGreenhouseData() // 获取温室数据
  fetchWeatherData() // 获取天气数据
})


</script>

<template>
  <div class="greenhouse-container">
    <!-- 右侧内容区 -->
    <section class="content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1>智能温室管理</h1>
          <p>实时监控温室环境数据，智能管理作物生长</p>
        </div>
        
        <!-- 温室列表 -->
        <div class="greenhouse-section">
          <div class="card">
            <div class="card-header">
              <h3>温室列表</h3>
              <div class="card-actions">
                <button class="btn-add" @click="addGreenhouse" :disabled="loading">添加温室</button>
                <button class="btn-refresh" @click="refreshData" :disabled="loading">刷新数据</button>
              </div>
            </div>
            <div class="card-body">
              <div class="greenhouse-grid">
                <div v-for="greenhouse in greenhouses" :key="greenhouse.id" class="greenhouse-item">
                  <div class="greenhouse-header">
                    <span class="greenhouse-name">{{ greenhouse.name }}</span>
                    <span class="status" :class="{ 'warning': greenhouse.status === '需要关注' }">
                      {{ greenhouse.status }}
                    </span>
                  </div>
                  <div class="greenhouse-content">
                    <div class="crop-info">
                      <span class="label">作物：</span>
                      <span class="value">{{ greenhouse.crop }}</span>
                    </div>
                    <div class="env-data">
                      <div class="env-item">
                        <span class="label">温度：</span>
                        <span class="value">{{ greenhouse.temperature }}</span>
                      </div>
                      <div class="env-item">
                        <span class="label">湿度：</span>
                        <span class="value">{{ greenhouse.humidity }}</span>
                      </div>
                      <div class="env-item">
                        <span class="label">光照：</span>
                        <span class="value">{{ greenhouse.light }}</span>
                      </div>
                      <div class="env-item">
                        <span class="label">土壤湿度：</span>
                        <span class="value">{{ greenhouse.soilMoisture }}</span>
                      </div>
                    </div>
                    <div class="last-updated">
                      <span class="label">最后更新：</span>
                      <span class="value">{{ greenhouse.lastUpdated }}</span>
                    </div>
                    <div class="greenhouse-actions">
                      <button class="btn-detail">查看详情</button>
                      <button class="btn-edit">编辑</button>
                      <button class="btn-delete">删除</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 环境监测图表 -->
        <div class="monitoring-section">
          <div class="card">
            <div class="card-header">
              <h3>环境监测数据</h3>
            </div>
            <div class="card-body">
              <div class="charts-grid">
                <!-- 温度图表 -->
                <div class="chart-item">
                  <h4>温度变化趋势</h4>
                  <div class="chart-placeholder">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=line%20chart%20temperature%20trend%20green%20color%20simple%20design&image_size=landscape_16_9" alt="温度变化趋势" />
                  </div>
                </div>
                <!-- 湿度图表 -->
                <div class="chart-item">
                  <h4>湿度变化趋势</h4>
                  <div class="chart-placeholder">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=line%20chart%20humidity%20trend%20green%20color%20simple%20design&image_size=landscape_16_9" alt="湿度变化趋势" />
                  </div>
                </div>
                <!-- 光照图表 -->
                <div class="chart-item">
                  <h4>光照变化趋势</h4>
                  <div class="chart-placeholder">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=line%20chart%20light%20trend%20green%20color%20simple%20design&image_size=landscape_16_9" alt="光照变化趋势" />
                  </div>
                </div>
                <!-- 土壤湿度图表 -->
                <div class="chart-item">
                  <h4>土壤湿度变化趋势</h4>
                  <div class="chart-placeholder">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=line%20chart%20soil%20moisture%20trend%20green%20color%20simple%20design&image_size=landscape_16_9" alt="土壤湿度变化趋势" />
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
/* 智能温室容器 */
.greenhouse-container {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 10px;
}

.btn-add, .btn-refresh {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-add {
  background-color: #28a745;
  color: #fff;
}

.btn-add:hover {
  background-color: #218838;
  transform: translateY(-2px);
}

.btn-refresh {
  background-color: #6c757d;
  color: #fff;
}

.btn-refresh:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.card-body {
  padding: 20px;
}

/* 温室列表样式 */
.greenhouse-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.greenhouse-item {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.greenhouse-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.greenhouse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
}

.greenhouse-name {
  font-size: 16px;
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

.greenhouse-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crop-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crop-info .label {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.crop-info .value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.env-data {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.env-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.env-item .label {
  font-size: 13px;
  color: #666;
  min-width: 60px;
}

.env-item .value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.last-updated .label {
  font-size: 13px;
  color: #666;
  min-width: 80px;
}

.last-updated .value {
  font-size: 13px;
  color: #999;
}

.greenhouse-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.btn-detail, .btn-edit, .btn-delete {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-detail {
  background-color: #007bff;
  color: #fff;
}

.btn-detail:hover {
  background-color: #0069d9;
  transform: translateY(-1px);
}

.btn-edit {
  background-color: #ffc107;
  color: #212529;
}

.btn-edit:hover {
  background-color: #e0a800;
  transform: translateY(-1px);
}

.btn-delete {
  background-color: #dc3545;
  color: #fff;
}

.btn-delete:hover {
  background-color: #c82333;
  transform: translateY(-1px);
}

/* 环境监测图表样式 */
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
  .greenhouse-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .greenhouse-grid {
    grid-template-columns: 1fr;
  }
  
  .env-data {
    grid-template-columns: 1fr;
  }
}
</style>