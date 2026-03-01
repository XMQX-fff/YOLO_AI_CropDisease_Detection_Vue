<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStatisticsApi } from '/@/api/statistics'
import { useGreenhouseApi } from '/@/api/greenhouse'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const statisticsApi = useStatisticsApi()
const greenhouseApi = useGreenhouseApi()

// 数据
const statistics = ref({
  users: 0,
  greenhouse: 0,
  diseases: 0,
  yield: 0,
  detectionRate: 0,
  preventionRate: 0
})

// 温室数据
const cropTypes = ref([] as any[])
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)

// 格式化检测率（保留两位小数）
const formattedDetectionRate = computed(() => {
  return Number(statistics.value.detectionRate).toFixed(2)
})

// 格式化预防率（保留两位小数）
const formattedPreventionRate = computed(() => {
  return Number(statistics.value.preventionRate).toFixed(2)
})

// 获取统计概览数据
const fetchStatistics = async () => {
  try {
    const res = await statisticsApi.getStatisticsOverview()
    if ((res.code === '200' || res.code === 200 || res.code === '0' || res.code === 0) && res.data) {
      statistics.value = {
        users: res.data.userCount || 0,
        greenhouse: res.data.greenhouseCount || 0,
        diseases: res.data.diseaseCount || 0,
        yield: res.data.totalProduction || 0,
        detectionRate: res.data.detectionRate || 0,
        preventionRate: res.data.preventionRate || 0
      }
    }
  } catch (error) {
    console.error('获取统计概览数据失败:', error)
  }
}

// 获取温室数据
const fetchGreenhouseData = async () => {
  loading.value = true
  try {
    const response = await greenhouseApi.getWithDiseaseCountPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const data = response.data.records || response.data.list || response.data
      total.value = response.data.total || data.length
      
      cropTypes.value = data.map((item: any) => {
        const gh = item.greenhouse || {}
        const healthRate = gh.quantity > 0 
          ? Math.max(0, Math.min(100, ((gh.quantity - (item.totalDiseaseCount || 0)) / gh.quantity) * 100))
          : 0
        return {
          name: gh.greenhouseName || `${gh.id}号温室`,
          crop: gh.cropType || '未知作物',
          status: (item.totalDiseaseCount || 0) > 5 ? '需要关注' : '生长良好',
          plantCount: gh.quantity || 0,
          diseaseCount: item.totalDiseaseCount || 0,
          healthRate: Number(healthRate.toFixed(1)),
          temperature: gh.temperature || 0,
          airHumidity: gh.airHumidity || 0,
          soilHumidity: gh.soilHumidity || 0,
          co2Concentration: gh.co2Concentration || 0,
          lightIntensity: gh.lightIntensity || 0
        }
      })
    }
  } catch (error) {
    console.error('获取温室数据失败:', error)
    total.value = 9
    // 模拟数据
    cropTypes.value = [
      { name: '1号温室', crop: '玉米', status: '生长良好', plantCount: 350, diseaseCount: 20, healthRate: 94.3, temperature: 24, airHumidity: 50, soilHumidity: 24, co2Concentration: 12, lightIntensity: 23 },
      { name: '2号温室', crop: '水稻', status: '生长良好', plantCount: 400, diseaseCount: 15, healthRate: 96.3, temperature: 30, airHumidity: 75, soilHumidity: 45, co2Concentration: 15, lightIntensity: 25 },
      { name: '3号温室', crop: '小麦', status: '需要关注', plantCount: 350, diseaseCount: 18, healthRate: 94.9, temperature: 22, airHumidity: 60, soilHumidity: 30, co2Concentration: 10, lightIntensity: 20 }
    ]
  } finally {
    loading.value = false
  }
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchGreenhouseData()
}

// 处理每页条数变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchGreenhouseData()
}

// 温度趋势图表配置
const temperatureChartOption = computed(() => {
  const greenhouseNames = cropTypes.value.map((item: any) => item.name)
  const temperatures = cropTypes.value.map((item: any) => item.temperature)
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: greenhouseNames,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '温度(°C)'
    },
    series: [
      {
        name: '温度',
        type: 'line',
        data: temperatures,
        smooth: true,
        itemStyle: {
          color: '#ff6b6b'
        },
        areaStyle: {
          color: 'rgba(255, 107, 107, 0.2)'
        }
      }
    ]
  }
})

// 湿度趋势图表配置
const humidityChartOption = computed(() => {
  const greenhouseNames = cropTypes.value.map((item: any) => item.name)
  const airHumidity = cropTypes.value.map((item: any) => item.airHumidity)
  const soilHumidity = cropTypes.value.map((item: any) => item.soilHumidity)
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['空气湿度', '土壤湿度']
    },
    xAxis: {
      type: 'category',
      data: greenhouseNames,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '湿度(%)'
    },
    series: [
      {
        name: '空气湿度',
        type: 'bar',
        data: airHumidity,
        itemStyle: {
          color: '#4ecdc4'
        }
      },
      {
        name: '土壤湿度',
        type: 'bar',
        data: soilHumidity,
        itemStyle: {
          color: '#45b7d1'
        }
      }
    ]
  }
})

// 病虫害数量图表配置
const diseaseChartOption = computed(() => {
  const greenhouseNames = cropTypes.value.map((item: any) => item.name)
  const diseaseCounts = cropTypes.value.map((item: any) => item.diseaseCount)
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: greenhouseNames,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '病虫害数量',
        type: 'bar',
        data: diseaseCounts,
        itemStyle: {
          color: '#ff6b6b'
        }
      }
    ]
  }
})

// 健康率图表配置
const healthChartOption = computed(() => {
  const greenhouseNames = cropTypes.value.map((item: any) => item.name)
  const healthRates = cropTypes.value.map((item: any) => item.healthRate)
  
  return {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: greenhouseNames,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '健康率(%)',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '健康率',
        type: 'line',
        data: healthRates,
        smooth: true,
        itemStyle: {
          color: '#28a745'
        },
        areaStyle: {
          color: 'rgba(40, 167, 69, 0.2)'
        }
      }
    ]
  }
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

// 获取天气数据
const fetchWeatherData = async () => {
  try {
    const response = await fetch('https://restapi.amap.com/v3/weather/weatherInfo?key=4c4e6d5b8a2c4d9e8b7a6c5d4e3f2a1b&city=440100&extensions=base')
    const data = await response.json()
    if (data.status === '1' && data.lives && data.lives.length > 0) {
      const weatherData = data.lives[0]
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
  fetchStatistics()
  fetchGreenhouseData()
  fetchWeatherData()
})
</script>

<template>
  <div class="data-view-container">
    <!-- 右侧内容区 -->
    <section class="content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1>总览大屏</h1>
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
                    <div class="stat-value">{{ formattedDetectionRate }}%</div>
                    <div class="stat-label">检测率</div>
                  </div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=prevention%20icon%20green%20color%20simple%20design&image_size=square" alt="预防率" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">{{ formattedPreventionRate }}%</div>
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
              
              <!-- 分页 -->
              <div class="pagination-wrapper">
                <el-pagination
                  v-model:current-page="currentPage"
                  v-model:page-size="pageSize"
                  :page-sizes="[3, 6, 9, 12]"
                  :total="total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handlePageChange"
                />
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
                <div class="chart-item">
                  <h4>温度趋势</h4>
                  <v-chart :option="temperatureChartOption" autoresize />
                </div>
                <div class="chart-item">
                  <h4>湿度对比</h4>
                  <v-chart :option="humidityChartOption" autoresize />
                </div>
                <div class="chart-item">
                  <h4>病虫害数量</h4>
                  <v-chart :option="diseaseChartOption" autoresize />
                </div>
                <div class="chart-item">
                  <h4>健康率趋势</h4>
                  <v-chart :option="healthChartOption" autoresize />
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

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
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

.chart-item :deep(.echarts) {
  width: 100%;
  height: 220px;
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
