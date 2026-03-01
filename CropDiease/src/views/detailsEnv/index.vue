<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useGreenhouseApi } from '/@/api/greenhouse'

const greenhouseApi = useGreenhouseApi()

// 温室ID和时间范围
const currentGreenhouseId = ref(1)
const currentTimeRange = ref('8h')

// 温室列表
const greenhouseList = ref<{ id: number; name: string }[]>([])

// 获取温室列表
const fetchGreenhouseList = async () => {
  try {
    const response = await greenhouseApi.getGreenhouseList({})
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const data = response.data.records || response.data.list || response.data
      greenhouseList.value = data.map((item: any) => ({
        id: item.id,
        name: item.greenhouseName || `${item.id}号温室`
      }))
      
      // 设置默认选中的温室
      if (greenhouseList.value.length > 0) {
        currentGreenhouseId.value = greenhouseList.value[0].id
        // 获取该温室的历史数据
        fetchEnvironmentHistory()
      }
    }
  } catch (error) {
    console.error('获取温室列表失败:', error)
    // 使用模拟数据
    greenhouseList.value = [
      { id: 1, name: '1号温室' },
      { id: 2, name: '2号温室' },
      { id: 3, name: '3号温室' },
      { id: 4, name: '4号温室' },
      { id: 5, name: '5号温室' }
    ]
    // 获取第一个温室的历史数据
    fetchEnvironmentHistory()
  }
}

// 环境数据
const envData = ref({
  temperature: {
    value: 25.5,
    unit: '°C',
    min: 15,
    max: 30,
    status: '正常',
    trend: 'stable'
  },
  humidity: {
    value: 65,
    unit: '%',
    min: 40,
    max: 80,
    status: '正常',
    trend: 'rising'
  },
  light: {
    value: 8500,
    unit: 'lux',
    min: 5000,
    max: 12000,
    status: '正常',
    trend: 'stable'
  },
  soilMoisture: {
    value: 45,
    unit: '%',
    min: 30,
    max: 60,
    status: '正常',
    trend: 'falling'
  },
  co2: {
    value: 800,
    unit: 'ppm',
    min: 400,
    max: 1200,
    status: '正常',
    trend: 'stable'
  },
  soilPh: {
    value: 6.5,
    unit: '',
    min: 5.5,
    max: 7.5,
    status: '正常',
    trend: 'stable'
  }
})

// 历史数据
const historyData = ref([
  { time: '08:00', temperature: 22.1, humidity: 70, light: 5000, soilMoisture: 48 },
  { time: '09:00', temperature: 23.2, humidity: 68, light: 6500, soilMoisture: 47 },
  { time: '10:00', temperature: 24.5, humidity: 66, light: 7800, soilMoisture: 46 },
  { time: '11:00', temperature: 25.8, humidity: 64, light: 9200, soilMoisture: 45 },
  { time: '12:00', temperature: 26.5, humidity: 62, light: 10500, soilMoisture: 44 },
  { time: '13:00', temperature: 27.1, humidity: 60, light: 11000, soilMoisture: 43 },
  { time: '14:00', temperature: 26.8, humidity: 61, light: 10800, soilMoisture: 43 },
  { time: '15:00', temperature: 26.2, humidity: 62, light: 9500, soilMoisture: 44 },
  { time: '16:00', temperature: 25.5, humidity: 65, light: 8500, soilMoisture: 45 }
])

// 图表引用
const temperatureChartRef = ref<HTMLElement>()
const humidityChartRef = ref<HTMLElement>()
const lightChartRef = ref<HTMLElement>()
const soilMoistureChartRef = ref<HTMLElement>()
const co2ChartRef = ref<HTMLElement>()
const soilPhChartRef = ref<HTMLElement>()

// 图表实例
let temperatureChart: echarts.ECharts | null = null
let humidityChart: echarts.ECharts | null = null
let lightChart: echarts.ECharts | null = null
let soilMoistureChart: echarts.ECharts | null = null
let co2Chart: echarts.ECharts | null = null
let soilPhChart: echarts.ECharts | null = null

// 获取环境历史数据
const fetchEnvironmentHistory = async () => {
  try {
    const response = await greenhouseApi.getEnvironmentHistory({
      greenhouseId: currentGreenhouseId.value,
      timeRange: currentTimeRange.value
    })
    
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const data = response.data
      
      // 更新图表数据
      updateCharts(data)
    }
  } catch (error) {
    console.error('获取环境历史数据失败:', error)
    // 使用模拟数据
    const mockData = generateEnvData()
    updateCharts(mockData)
  }
}

// 更新图表
const updateCharts = (data: any) => {
  // 后端返回的是数组格式
  const records = Array.isArray(data) ? data : []
  
  // 提取时间、温度、湿度、光照、土壤湿度
  const hours = records.map((item: any) => {
    // 从 recordTime 提取时间，格式为 "2026-03-01 08:00:00"
    const timeStr = item.recordTime || ''
    const match = timeStr.match(/(\d{2}:\d{2})/)
    return match ? match[1] : timeStr
  })
  
  const temperatures = records.map((item: any) => item.temperature || 0)
  const humidities = records.map((item: any) => item.airHumidity || 0)
  const lights = records.map((item: any) => item.lightIntensity || 0)
  const soilMoistures = records.map((item: any) => item.soilHumidity || 0)
  const co2Concentrations = records.map((item: any) => item.co2Concentration || 0)
  const soilPhValues = records.map((item: any) => item.soilPh || 0)
  
  // 更新温度图表
  if (temperatureChart) {
    temperatureChart.setOption({
      xAxis: { data: hours },
      series: [{ data: temperatures }]
    })
  }
  
  // 更新湿度图表
  if (humidityChart) {
    humidityChart.setOption({
      xAxis: { data: hours },
      series: [{ data: humidities }]
    })
  }
  
  // 更新光照图表
  if (lightChart) {
    lightChart.setOption({
      xAxis: { data: hours },
      series: [{ data: lights }]
    })
  }
  
  // 更新土壤湿度图表
  if (soilMoistureChart) {
    soilMoistureChart.setOption({
      xAxis: { data: hours },
      series: [{ data: soilMoistures }]
    })
  }
  
  // 更新CO2浓度图表
  if (co2Chart) {
    co2Chart.setOption({
      xAxis: { data: hours },
      series: [{ data: co2Concentrations }]
    })
  }
  
  // 更新土壤pH值图表
  if (soilPhChart) {
    soilPhChart.setOption({
      xAxis: { data: hours },
      series: [{ data: soilPhValues }]
    })
  }
}

// 生成环境监测历史数据
const generateEnvData = () => {
  const hours = []
  const temperatures = []
  const humidities = []
  const lights = []
  const soilMoistures = []
  const co2Concentrations = []
  const soilPhValues = []
  
  for (let i = 23; i >= 0; i--) {
    const hour = new Date()
    hour.setHours(hour.getHours() - i)
    hours.push(`${hour.getHours().toString().padStart(2, '0')}:00`)
    
    // 基于当前环境数据生成合理的波动
    temperatures.push(20 + Math.random() * 10)
    humidities.push(50 + Math.random() * 30)
    lights.push(5000 + Math.random() * 5000)
    soilMoistures.push(35 + Math.random() * 20)
    co2Concentrations.push(350 + Math.random() * 200)
    soilPhValues.push(6.0 + Math.random() * 1.0)
  }
  
  return { hours, temperatures, humidities, lights, soilMoistures, co2Concentrations, soilPhValues }
}

// 初始化图表
const initCharts = async () => {
  await nextTick()
  
  const envChartData = generateEnvData()
  
  // 温度图表
  if (temperatureChartRef.value) {
    temperatureChart = echarts.init(temperatureChartRef.value)
    temperatureChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: envChartData.hours },
      yAxis: { type: 'value', name: '温度(°C)' },
      series: [{
        name: '温度',
        type: 'line',
        smooth: true,
        data: envChartData.temperatures,
        areaStyle: { color: 'rgba(40, 167, 69, 0.1)' },
        lineStyle: { color: '#28a745' },
        itemStyle: { color: '#28a745' }
      }]
    })
  }
  
  // 湿度图表
  if (humidityChartRef.value) {
    humidityChart = echarts.init(humidityChartRef.value)
    humidityChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: envChartData.hours },
      yAxis: { type: 'value', name: '湿度(%)' },
      series: [{
        name: '湿度',
        type: 'line',
        smooth: true,
        data: envChartData.humidities,
        areaStyle: { color: 'rgba(0, 123, 255, 0.1)' },
        lineStyle: { color: '#007bff' },
        itemStyle: { color: '#007bff' }
      }]
    })
  }
  
  // 光照图表
  if (lightChartRef.value) {
    lightChart = echarts.init(lightChartRef.value)
    lightChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: envChartData.hours },
      yAxis: { type: 'value', name: '光照(lux)' },
      series: [{
        name: '光照',
        type: 'line',
        smooth: true,
        data: envChartData.lights,
        areaStyle: { color: 'rgba(255, 193, 7, 0.1)' },
        lineStyle: { color: '#ffc107' },
        itemStyle: { color: '#ffc107' }
      }]
    })
  }
  
  // 土壤湿度图表
  if (soilMoistureChartRef.value) {
    soilMoistureChart = echarts.init(soilMoistureChartRef.value)
    soilMoistureChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: envChartData.hours },
      yAxis: { type: 'value', name: '土壤湿度(%)' },
      series: [{
        name: '土壤湿度',
        type: 'line',
        smooth: true,
        data: envChartData.soilMoistures,
        areaStyle: { color: 'rgba(139, 69, 19, 0.1)' },
        lineStyle: { color: '#8b4513' },
        itemStyle: { color: '#8b4513' }
      }]
    })
  }
  
  // CO2浓度图表
  if (co2ChartRef.value) {
    co2Chart = echarts.init(co2ChartRef.value)
    co2Chart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: envChartData.hours },
      yAxis: { type: 'value', name: 'CO2浓度(ppm)' },
      series: [{
        name: 'CO2浓度',
        type: 'line',
        smooth: true,
        data: envChartData.co2Concentrations || Array(24).fill(400).map(() => 350 + Math.random() * 200),
        areaStyle: { color: 'rgba(111, 66, 193, 0.1)' },
        lineStyle: { color: '#6f42c1' },
        itemStyle: { color: '#6f42c1' }
      }]
    })
  }
  
  // 土壤pH值图表
  if (soilPhChartRef.value) {
    soilPhChart = echarts.init(soilPhChartRef.value)
    soilPhChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: envChartData.hours },
      yAxis: { type: 'value', name: '土壤pH值' },
      series: [{
        name: '土壤pH值',
        type: 'line',
        smooth: true,
        data: envChartData.soilPhValues || Array(24).fill(6.5).map(() => 6.0 + Math.random() * 1.0),
        areaStyle: { color: 'rgba(220, 53, 69, 0.1)' },
        lineStyle: { color: '#dc3545' },
        itemStyle: { color: '#dc3545' }
      }]
    })
  }
}

// 处理时间范围变化
const handleTimeRangeChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  currentTimeRange.value = target.value
  fetchEnvironmentHistory()
}

// 处理温室变化
const handleGreenhouseChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  currentGreenhouseId.value = Number(target.value)
  fetchEnvironmentHistory()
}

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
    const city = '广州'
    const url = `https://uapis.cn/api/v1/misc/weather?city=${encodeURIComponent(city)}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    const weatherData = data
    const temperature = weatherData.temperature
    const weatherDesc = weatherData.weather
    const windDirection = weatherData.wind_direction
    const windPower = weatherData.wind_power
    const humidity = weatherData.humidity
    const reportTime = weatherData.report_time
    
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
  fetchWeatherData()
  fetchGreenhouseList()
  initCharts()
})

// 窗口大小变化时调整图表
window.addEventListener('resize', () => {
  temperatureChart?.resize()
  humidityChart?.resize()
  lightChart?.resize()
  soilMoistureChart?.resize()
  co2Chart?.resize()
  soilPhChart?.resize()
})


</script>

<template>
  <div class="env-monitoring-container">
    <!-- 右侧内容区 -->
    <section class="content">
        <!-- 页面标题 -->
        <div class="page-header">
          <h1>环境检测</h1>
          <p>实时监控温室环境数据，确保作物生长环境适宜</p>
        </div>
        
        <!-- 环境数据概览 -->
        <div class="env-overview-section">
          <div class="card">
            <div class="card-header">
              <h3>环境数据概览</h3>
              <div class="card-actions">
                <button class="btn-refresh">刷新数据</button>
                <button class="btn-settings">设置阈值</button>
              </div>
            </div>
            <div class="card-body">
              <div class="env-data-grid">
                <div class="env-item">
                  <div class="env-header">
                    <span class="env-name">温度</span>
                    <span class="env-status" :class="envData.temperature.status === '正常' ? 'normal' : 'warning'">{{ envData.temperature.status }}</span>
                  </div>
                  <div class="env-value">
                    <span class="value">{{ envData.temperature.value }}</span>
                    <span class="unit">{{ envData.temperature.unit }}</span>
                  </div>
                  <div class="env-range">
                    <span class="min">{{ envData.temperature.min }}</span>
                    <div class="range-bar">
                      <div class="range-fill" :style="{ left: ((envData.temperature.value - envData.temperature.min) / (envData.temperature.max - envData.temperature.min) * 100) + '%', width: '10px' }"></div>
                    </div>
                    <span class="max">{{ envData.temperature.max }}</span>
                  </div>
                  <div class="env-trend">
                    <span class="trend-label">趋势：</span>
                    <span class="trend-icon" :class="envData.temperature.trend">
                      <span v-if="envData.temperature.trend === 'rising'">↑</span>
                      <span v-else-if="envData.temperature.trend === 'falling'">↓</span>
                      <span v-else>→</span>
                    </span>
                  </div>
                </div>
                
                <div class="env-item">
                  <div class="env-header">
                    <span class="env-name">湿度</span>
                    <span class="env-status" :class="envData.humidity.status === '正常' ? 'normal' : 'warning'">{{ envData.humidity.status }}</span>
                  </div>
                  <div class="env-value">
                    <span class="value">{{ envData.humidity.value }}</span>
                    <span class="unit">{{ envData.humidity.unit }}</span>
                  </div>
                  <div class="env-range">
                    <span class="min">{{ envData.humidity.min }}</span>
                    <div class="range-bar">
                      <div class="range-fill" :style="{ left: ((envData.humidity.value - envData.humidity.min) / (envData.humidity.max - envData.humidity.min) * 100) + '%', width: '10px' }"></div>
                    </div>
                    <span class="max">{{ envData.humidity.max }}</span>
                  </div>
                  <div class="env-trend">
                    <span class="trend-label">趋势：</span>
                    <span class="trend-icon" :class="envData.humidity.trend">
                      <span v-if="envData.humidity.trend === 'rising'">↑</span>
                      <span v-else-if="envData.humidity.trend === 'falling'">↓</span>
                      <span v-else>→</span>
                    </span>
                  </div>
                </div>
                
                <div class="env-item">
                  <div class="env-header">
                    <span class="env-name">光照</span>
                    <span class="env-status" :class="envData.light.status === '正常' ? 'normal' : 'warning'">{{ envData.light.status }}</span>
                  </div>
                  <div class="env-value">
                    <span class="value">{{ envData.light.value }}</span>
                    <span class="unit">{{ envData.light.unit }}</span>
                  </div>
                  <div class="env-range">
                    <span class="min">{{ envData.light.min }}</span>
                    <div class="range-bar">
                      <div class="range-fill" :style="{ left: ((envData.light.value - envData.light.min) / (envData.light.max - envData.light.min) * 100) + '%', width: '10px' }"></div>
                    </div>
                    <span class="max">{{ envData.light.max }}</span>
                  </div>
                  <div class="env-trend">
                    <span class="trend-label">趋势：</span>
                    <span class="trend-icon" :class="envData.light.trend">
                      <span v-if="envData.light.trend === 'rising'">↑</span>
                      <span v-else-if="envData.light.trend === 'falling'">↓</span>
                      <span v-else>→</span>
                    </span>
                  </div>
                </div>
                
                <div class="env-item">
                  <div class="env-header">
                    <span class="env-name">土壤湿度</span>
                    <span class="env-status" :class="envData.soilMoisture.status === '正常' ? 'normal' : 'warning'">{{ envData.soilMoisture.status }}</span>
                  </div>
                  <div class="env-value">
                    <span class="value">{{ envData.soilMoisture.value }}</span>
                    <span class="unit">{{ envData.soilMoisture.unit }}</span>
                  </div>
                  <div class="env-range">
                    <span class="min">{{ envData.soilMoisture.min }}</span>
                    <div class="range-bar">
                      <div class="range-fill" :style="{ left: ((envData.soilMoisture.value - envData.soilMoisture.min) / (envData.soilMoisture.max - envData.soilMoisture.min) * 100) + '%', width: '10px' }"></div>
                    </div>
                    <span class="max">{{ envData.soilMoisture.max }}</span>
                  </div>
                  <div class="env-trend">
                    <span class="trend-label">趋势：</span>
                    <span class="trend-icon" :class="envData.soilMoisture.trend">
                      <span v-if="envData.soilMoisture.trend === 'rising'">↑</span>
                      <span v-else-if="envData.soilMoisture.trend === 'falling'">↓</span>
                      <span v-else>→</span>
                    </span>
                  </div>
                </div>
                
                <div class="env-item">
                  <div class="env-header">
                    <span class="env-name">CO2浓度</span>
                    <span class="env-status" :class="envData.co2.status === '正常' ? 'normal' : 'warning'">{{ envData.co2.status }}</span>
                  </div>
                  <div class="env-value">
                    <span class="value">{{ envData.co2.value }}</span>
                    <span class="unit">{{ envData.co2.unit }}</span>
                  </div>
                  <div class="env-range">
                    <span class="min">{{ envData.co2.min }}</span>
                    <div class="range-bar">
                      <div class="range-fill" :style="{ left: ((envData.co2.value - envData.co2.min) / (envData.co2.max - envData.co2.min) * 100) + '%', width: '10px' }"></div>
                    </div>
                    <span class="max">{{ envData.co2.max }}</span>
                  </div>
                  <div class="env-trend">
                    <span class="trend-label">趋势：</span>
                    <span class="trend-icon" :class="envData.co2.trend">
                      <span v-if="envData.co2.trend === 'rising'">↑</span>
                      <span v-else-if="envData.co2.trend === 'falling'">↓</span>
                      <span v-else>→</span>
                    </span>
                  </div>
                </div>
                
                <div class="env-item">
                  <div class="env-header">
                    <span class="env-name">土壤pH值</span>
                    <span class="env-status" :class="envData.soilPh.status === '正常' ? 'normal' : 'warning'">{{ envData.soilPh.status }}</span>
                  </div>
                  <div class="env-value">
                    <span class="value">{{ envData.soilPh.value }}</span>
                    <span class="unit">{{ envData.soilPh.unit }}</span>
                  </div>
                  <div class="env-range">
                    <span class="min">{{ envData.soilPh.min }}</span>
                    <div class="range-bar">
                      <div class="range-fill" :style="{ left: ((envData.soilPh.value - envData.soilPh.min) / (envData.soilPh.max - envData.soilPh.min) * 100) + '%', width: '10px' }"></div>
                    </div>
                    <span class="max">{{ envData.soilPh.max }}</span>
                  </div>
                  <div class="env-trend">
                    <span class="trend-label">趋势：</span>
                    <span class="trend-icon" :class="envData.soilPh.trend">
                      <span v-if="envData.soilPh.trend === 'rising'">↑</span>
                      <span v-else-if="envData.soilPh.trend === 'falling'">↓</span>
                      <span v-else>→</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 历史数据图表 -->
        <div class="history-section">
          <div class="card">
            <div class="card-header">
              <h3>历史数据趋势</h3>
              <div class="card-actions">
                <select class="greenhouse-select" v-model="currentGreenhouseId" @change="handleGreenhouseChange">
                  <option v-for="gh in greenhouseList" :key="gh.id" :value="gh.id">{{ gh.name }}</option>
                </select>
                <select class="time-range" v-model="currentTimeRange" @change="handleTimeRangeChange">
                  <option value="8h">8小时</option>
                  <option value="1d">1天</option>
                  <option value="1w">1周</option>
                  <option value="1m">1个月</option>
                </select>
              </div>
            </div>
            <div class="card-body">
              <div class="charts-container">
                <!-- 温度图表 -->
                <div class="chart-item">
                  <h4>温度变化趋势</h4>
                  <div ref="temperatureChartRef" class="chart-container"></div>
                </div>
                
                <!-- 湿度图表 -->
                <div class="chart-item">
                  <h4>湿度变化趋势</h4>
                  <div ref="humidityChartRef" class="chart-container"></div>
                </div>
                
                <!-- 光照图表 -->
                <div class="chart-item">
                  <h4>光照变化趋势</h4>
                  <div ref="lightChartRef" class="chart-container"></div>
                </div>
                
                <!-- 土壤湿度图表 -->
                <div class="chart-item">
                  <h4>土壤湿度变化趋势</h4>
                  <div ref="soilMoistureChartRef" class="chart-container"></div>
                </div>
                
                <!-- CO2浓度图表 -->
                <div class="chart-item">
                  <h4>CO2浓度变化趋势</h4>
                  <div ref="co2ChartRef" class="chart-container"></div>
                </div>
                
                <!-- 土壤pH值图表 -->
                <div class="chart-item">
                  <h4>土壤pH值变化趋势</h4>
                  <div ref="soilPhChartRef" class="chart-container"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  </div>
</template>

<style scoped>
/* 环境检测容器 */
.env-monitoring-container {
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
  align-items: center;
}

.btn-refresh, .btn-settings {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-refresh {
  background-color: #6c757d;
  color: #fff;
}

.btn-refresh:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.btn-settings {
  background-color: #ffc107;
  color: #212529;
}

.btn-settings:hover {
  background-color: #e0a800;
  transform: translateY(-2px);
}

.greenhouse-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  min-width: 120px;
}

.time-range {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.card-body {
  padding: 20px;
}

/* 环境数据概览样式 */
.env-data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.env-item {
  padding: 20px;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.env-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.env-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.env-status.normal {
  background-color: #e8f5e8;
  color: #28a745;
}

.env-status.warning {
  background-color: #fff3cd;
  color: #856404;
}

.env-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 16px;
}

.env-value .value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  line-height: 1;
}

.env-value .unit {
  font-size: 14px;
  color: #666;
  margin-left: 4px;
}

.env-range {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.env-range .min, .env-range .max {
  font-size: 12px;
  color: #666;
  min-width: 30px;
}

.range-bar {
  flex: 1;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  position: relative;
}

.range-fill {
  position: absolute;
  top: 0;
  height: 100%;
  background-color: #28a745;
  border-radius: 3px;
  transform: translateX(-50%);
}

.env-trend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-label {
  font-size: 12px;
  color: #666;
}

.trend-icon {
  font-size: 14px;
  font-weight: 600;
}

.trend-icon.rising {
  color: #dc3545;
}

.trend-icon.falling {
  color: #007bff;
}

.trend-icon.stable {
  color: #28a745;
}

/* 历史数据图表样式 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.chart-container {
  width: 100%;
  height: 200px;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .env-data-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .env-data-grid {
    grid-template-columns: 1fr;
  }
}
</style>