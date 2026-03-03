<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { useGreenhouseApi } from '/@/api/greenhouse'
import { useAlertHistoryApi } from '/@/api/alertHistory'

use([
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer
])

// 页面标题
const pageTitle = ref('数据分析')
const pageDesc = ref('智能分析温室环境数据，提供预警预测和决策支持')

// API
const greenhouseApi = useGreenhouseApi()
const alertHistoryApi = useAlertHistoryApi()

// 温室数据
const greenhouses = ref([] as any[])
const loading = ref(false)

// 温室状态数据
const greenhouseStatusData = ref([] as any[])

// 异常统计数据
const abnormalStatsData = ref([] as any[])

// 告警历史数据
const alertHistoryData = ref([] as any[])

// 异常趋势数据
const anomalyData = ref([] as any[])

// 按天统计异常次数
const dailyAnomalyData = computed(() => {
  const dailyMap: { [key: string]: number } = {}
  
  // 统计每天的异常总次数
  anomalyData.value.forEach(item => {
    if (dailyMap[item.date]) {
      dailyMap[item.date] += item.value || 0
    } else {
      dailyMap[item.date] = item.value || 0
    }
  })
  
  // 转换为数组并排序
  return Object.entries(dailyMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
})

// 环境参数异常分布
const anomalyDistribution = ref([
  { name: '温度异常', value: 35, type: 'temperature' },
  { name: '湿度异常', value: 28, type: 'humidity' },
  { name: '光照不足', value: 15, type: 'light' },
  { name: 'CO2过高', value: 12, type: 'co2' },
  { name: '土壤pH异常', value: 10, type: 'ph' }
])

// 问题温室
const problemGreenhouses = computed(() => {
  return greenhouses.value.filter(g => g.status === 'warning' || g.status === 'danger')
    .sort((a, b) => a.healthScore - b.healthScore)
})

// 健康温室
const healthyGreenhouses = computed(() => {
  return greenhouses.value.filter(g => g.status === 'normal')
    .sort((a, b) => b.healthScore - a.healthScore)
})

// 温室健康评分对比图
const healthScoreOption = computed(() => {
  const sortedGreenhouses = [...greenhouses.value].sort((a, b) => a.healthScore - b.healthScore)
  return {
    title: {
      text: '温室健康评分排名',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = params[0]
        const greenhouse = sortedGreenhouses[data.dataIndex]
        return `${greenhouse.name}<br/>作物: ${greenhouse.cropType}<br/>健康评分: ${data.value}分<br/>状态: ${greenhouse.growthStatus}`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}分' }
    },
    yAxis: {
      type: 'category',
      data: sortedGreenhouses.map(g => g.name),
      axisLabel: { fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: sortedGreenhouses.map(g => ({
        value: g.healthScore,
        itemStyle: {
          color: g.healthScore >= 80 ? '#52c41a' : g.healthScore >= 60 ? '#faad14' : '#ff4d4f'
        }
      })),
      label: {
        show: true,
        position: 'right',
        formatter: '{c}分'
      },
      barWidth: '60%'
    }]
  }
})

// 异常分布图
const anomalyOption = computed(() => {
  return {
    title: {
      text: '环境参数异常分布',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}次 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 50
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '55%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      labelLine: { show: false },
      data: anomalyDistribution.value.map((item, index) => ({
        ...item,
        itemStyle: {
          color: ['#ff4d4f', '#faad14', '#1890ff', '#52c41a', '#722ed1', '#eb2f96'][index]
        }
      }))
    }]
  }
})

// 异常次数时间线
const timelineOption = computed(() => {
  const maxCount = Math.max(...dailyAnomalyData.value.map(item => item.count), 3)
  return {
    title: {
      text: '异常事件次数时间线',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const data = params[0]
        const date = dailyAnomalyData.value[data.dataIndex].date
        const count = data.value
        // 查找当天的具体异常
        const dayAnomalies = anomalyData.value.filter(item => item.date === date)
        let details = ''
        dayAnomalies.forEach(item => {
          details += `<br/>${item.greenhouse}: ${item.type} (${item.severity === 'high' ? '高' : item.severity === 'medium' ? '中' : '低'})`
        })
        return `${date}<br/>异常次数: ${count}次${details}`
      }
    },
    xAxis: {
      type: 'category',
      data: dailyAnomalyData.value.map(item => item.date),
      axisLabel: { rotate: 45 }
    },
    yAxis: {
      type: 'value',
      name: '异常次数',
      min: 0,
      max: maxCount
    },
    series: [{
      type: 'bar',
      data: dailyAnomalyData.value.map(item => item.count),
      itemStyle: {
        color: function(params: any) {
          const count = dailyAnomalyData.value[params.dataIndex].count
          return count >= 3 ? '#ff4d4f' : count >= 2 ? '#faad14' : '#1890ff'
        }
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}次'
      },
      barWidth: '60%'
    }]
  }
})

// 温室数据对比雷达图
const greenhouseComparisonOption = computed(() => {
  return {
    title: {
      text: '温室环境数据对比',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' }
    },
    tooltip: {},
    legend: {
      data: greenhouses.value.map(g => g.name),
      top: 30
    },
    radar: {
      indicator: [
        { name: '温度', max: 35 },
        { name: '空气湿度', max: 100 },
        { name: '土壤湿度', max: 50 },
        { name: 'CO2浓度', max: 1000 },
        { name: '土壤pH', max: 8 },
        { name: '光照强度 (万)', max: 5 }
      ]
    },
    series: greenhouses.value.map((greenhouse, index) => ({
      name: greenhouse.name,
      type: 'radar',
      data: [{
        value: [
          greenhouse.temperature,
          greenhouse.airHumidity,
          greenhouse.soilHumidity,
          greenhouse.co2Concentration,
          greenhouse.soilPh,
          greenhouse.lightIntensity / 10000
        ],
        itemStyle: {
          color: index === 0 ? '#52c41a' : index === 1 ? '#faad14' : index === 2 ? '#ff4d4f' : index === 3 ? '#1890ff' : '#722ed1'
        }
      }]
    }))
  }
})

// 获取建议
const getSuggestion = (greenhouse: any) => {
  const suggestions = []
  if (greenhouse.temperature > 28) suggestions.push('温度过高，建议开启降温设备')
  if (greenhouse.temperature < 20) suggestions.push('温度过低，建议开启加热设备')
  if (greenhouse.airHumidity > 70) suggestions.push('湿度过高，建议加强通风')
  if (greenhouse.airHumidity < 40) suggestions.push('湿度过低，建议开启加湿设备')
  if (greenhouse.diseaseCount > 0) suggestions.push(`发现${greenhouse.diseaseCount}处病虫害，建议及时处理`)
  return suggestions
}

// 生成智能分析建议
const analysisSuggestions = computed(() => {
  const suggestions: any[] = []
  
  const highTempGreenhouses = greenhouses.value.filter((g: any) => g.temperature > 28)
  if (highTempGreenhouses.length > 0) {
    const names = highTempGreenhouses.map((g: any) => g.name).join('、')
    suggestions.push({
      type: 'warning',
      title: '温度管理建议',
      description: `${names}温度偏高，建议检查温控设备并适当开启通风系统。预计未来3天温度将持续上升，需提前做好降温准备。`
    })
  }
  
  const highHumidityGreenhouses = greenhouses.value.filter((g: any) => g.airHumidity > 70)
  if (highHumidityGreenhouses.length > 0) {
    const names = highHumidityGreenhouses.map((g: any) => g.name).join('、')
    suggestions.push({
      type: 'info',
      title: '湿度控制建议',
      description: `${names}湿度达到${highHumidityGreenhouses[0].airHumidity}%，已超过安全阈值。建议加强通风换气，必要时开启除湿设备。`
    })
  }
  
  const diseaseGreenhouses = greenhouses.value.filter((g: any) => g.hasDisease || g.diseaseCount > 0)
  if (diseaseGreenhouses.length > 0) {
    const names = diseaseGreenhouses.map((g: any) => g.name).join('、')
    const totalDisease = diseaseGreenhouses.reduce((sum, g) => sum + (g.diseaseCount || 0), 0)
    suggestions.push({
      type: 'error',
      title: '病虫害防治建议',
      description: `${names}发现${totalDisease}处病虫害，建议立即进行防治处理。同时检查其他温室，防止病虫害扩散。`
    })
  }
  
  return suggestions
})

// 温室健康评分配置
const healthScoreConfig = {
  // 基础分值
  baseScore: 100,
  // 各项扣分权重
  weights: {
    disease: 15,        // 病虫害扣分权重
    temperature: 10,    // 温度异常扣分权重
    humidity: 8,        // 湿度异常扣分权重
    light: 5,           // 光照异常扣分权重
    co2: 5,             // CO2异常扣分权重
    ph: 5,              // pH异常扣分权重
    multipleAbnormal: 2 // 多项异常叠加扣分
  },
  // 评分等级
  levels: {
    excellent: { min: 90, label: '优秀', status: 'success' },
    good: { min: 80, label: '良好', status: 'normal' },
    warning: { min: 60, label: '一般', status: 'warning' },
    danger: { min: 0, label: '较差', status: 'danger' }
  }
}

// 计算温室健康评分
const calculateHealthScore = (item: any) => {
  const gh = item.greenhouse || {}
  const abnormalData = item.abnormalData || {}
  const diseaseData = item.diseaseData || []
  
  let score = healthScoreConfig.baseScore
  const deductions: any[] = []
  
  // 1. 病虫害扣分
  const diseaseCount = diseaseData.length
  if (diseaseCount > 0) {
    const diseaseDeduction = Math.min(diseaseCount * healthScoreConfig.weights.disease, 30)
    score -= diseaseDeduction
    deductions.push({ type: '病虫害', count: diseaseCount, deduction: diseaseDeduction })
  }
  
  // 2. 温度异常扣分
  if (abnormalData.temperature) {
    score -= healthScoreConfig.weights.temperature
    deductions.push({ type: '温度异常', deduction: healthScoreConfig.weights.temperature })
  }
  
  // 3. 湿度异常扣分
  if (abnormalData.humidity) {
    score -= healthScoreConfig.weights.humidity
    deductions.push({ type: '湿度异常', deduction: healthScoreConfig.weights.humidity })
  }
  
  // 4. 光照异常扣分
  if (abnormalData.light) {
    score -= healthScoreConfig.weights.light
    deductions.push({ type: '光照异常', deduction: healthScoreConfig.weights.light })
  }
  
  // 5. CO2异常扣分
  if (abnormalData.co2) {
    score -= healthScoreConfig.weights.co2
    deductions.push({ type: 'CO2异常', deduction: healthScoreConfig.weights.co2 })
  }
  
  // 6. pH异常扣分
  if (abnormalData.ph) {
    score -= healthScoreConfig.weights.ph
    deductions.push({ type: 'pH异常', deduction: healthScoreConfig.weights.ph })
  }
  
  // 7. 多项异常叠加扣分（超过2项异常时）
  const abnormalCount = Object.values(abnormalData).filter(v => v).length
  if (abnormalCount > 2) {
    const multipleDeduction = (abnormalCount - 2) * healthScoreConfig.weights.multipleAbnormal
    score -= multipleDeduction
    deductions.push({ type: '多项异常叠加', count: abnormalCount - 2, deduction: multipleDeduction })
  }
  
  // 确保分数在0-100之间
  score = Math.max(0, Math.min(100, score))
  
  return {
    score: Math.round(score),
    deductions,
    abnormalCount,
    diseaseCount
  }
}

// 根据评分获取等级信息
const getHealthLevel = (score: number) => {
  if (score >= healthScoreConfig.levels.excellent.min) {
    return healthScoreConfig.levels.excellent
  } else if (score >= healthScoreConfig.levels.good.min) {
    return healthScoreConfig.levels.good
  } else if (score >= healthScoreConfig.levels.warning.min) {
    return healthScoreConfig.levels.warning
  }
  return healthScoreConfig.levels.danger
}

// 获取温室数据
const fetchGreenhouseData = async () => {
  loading.value = true
  try {
    const response = await greenhouseApi.getAllGreenhouseStatus()
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const data = response.data || []
      greenhouseStatusData.value = data
      
      greenhouses.value = data.map((item: any) => {
        const gh = item.greenhouse || {}
        const abnormalData = item.abnormalData || {}
        const totalAbnormalCount = item.totalAbnormalCount || 0
        
        // 计算健康评分
        const healthResult = calculateHealthScore(item)
        const healthScore = healthResult.score
        const healthLevel = getHealthLevel(healthScore)
        
        // 根据评分确定状态
        const status = healthLevel.status
        //console.log('健康等级:', healthLevel)
        return {
          id: gh.id,
          name: gh.greenhouseName || `${gh.id}号温室`,
          cropType: gh.cropType || '未知作物',
          status: status,
          temperature: gh.temperature || 25,
          airHumidity: gh.airHumidity || 60,
          soilHumidity: gh.soilHumidity || 30,
          co2Concentration: gh.co2Concentration || 500,
          soilPh: gh.soilPh || 6.5,
          lightIntensity: gh.lightIntensity || 30000,
          diseaseCount: healthResult.diseaseCount,
          growthStatus: healthLevel.label,
          healthScore: healthScore,
          healthLevel: healthLevel,
          healthDeductions: healthResult.deductions,
          abnormalData: abnormalData,
          totalAbnormalCount: totalAbnormalCount,
          hasDisease: item.hasDisease || false
        }
      })
      
      // 生成异常分布数据（只生成分布，不生成趋势数据）
      generateAnomalyDistribution()
    }
  } catch (error) {
    console.error('获取温室数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 生成异常趋势数据
const generateAnomalyData = () => {
  const anomalies: any[] = []
  const today = new Date()
  
  greenhouseStatusData.value.forEach((item: any) => {
    const gh = item.greenhouse || {}
    const abnormalData = item.abnormalData || {}
    const diseaseData = item.diseaseData || []
    
    // 温度异常
    if (abnormalData.temperature) {
      anomalies.push({
        date: formatDate(today),
        greenhouse: gh.greenhouseName || `${gh.id}号温室`,
        type: '温度异常',
        value: gh.temperature,
        severity: 'high'
      })
    }
    
    // 湿度异常
    if (abnormalData.humidity) {
      anomalies.push({
        date: formatDate(today),
        greenhouse: gh.greenhouseName || `${gh.id}号温室`,
        type: '湿度异常',
        value: gh.airHumidity,
        severity: 'medium'
      })
    }
    
    // 光照异常
    if (abnormalData.light) {
      anomalies.push({
        date: formatDate(today),
        greenhouse: gh.greenhouseName || `${gh.id}号温室`,
        type: '光照异常',
        value: gh.lightIntensity,
        severity: 'medium'
      })
    }
    
    // CO2异常
    if (abnormalData.co2) {
      anomalies.push({
        date: formatDate(today),
        greenhouse: gh.greenhouseName || `${gh.id}号温室`,
        type: 'CO2异常',
        value: gh.co2Concentration,
        severity: 'low'
      })
    }
    
    // pH异常
    if (abnormalData.ph) {
      anomalies.push({
        date: formatDate(today),
        greenhouse: gh.greenhouseName || `${gh.id}号温室`,
        type: 'pH异常',
        value: gh.soilPh,
        severity: 'low'
      })
    }
    
    // 病虫害异常 - 从 diseaseData 数组中获取
    if (diseaseData.length > 0) {
      diseaseData.forEach((disease: any) => {
        anomalies.push({
          date: formatDate(today),
          greenhouse: gh.greenhouseName || `${gh.id}号温室`,
          type: '病虫害',
          value: disease.diseaseCount || 1,
          severity: 'high',
          diseaseName: disease.diseaseNames || '未知病害'
        })
      })
    }
  })
  
  anomalyData.value = anomalies
}

// 生成异常分布数据
const generateAnomalyDistribution = () => {
  let temperatureCount = 0
  let humidityCount = 0
  let lightCount = 0
  let co2Count = 0
  let phCount = 0
  let diseaseCount = 0
  
  greenhouseStatusData.value.forEach((item: any) => {
    const gh = item.greenhouse || {}
    const abnormalData = item.abnormalData || {}
    const diseaseData = item.diseaseData || []
    
    if (abnormalData.temperature) temperatureCount++
    if (abnormalData.humidity) humidityCount++
    if (abnormalData.light) lightCount++
    if (abnormalData.co2) co2Count++
    if (abnormalData.ph) phCount++
    // 统计病虫害数量
    if (diseaseData.length > 0) {
      diseaseCount += diseaseData.length
    }
  })
  
  anomalyDistribution.value = [
    { name: '温度异常', value: temperatureCount, type: 'temperature' },
    { name: '湿度异常', value: humidityCount, type: 'humidity' },
    { name: '光照异常', value: lightCount, type: 'light' },
    { name: 'CO2异常', value: co2Count, type: 'co2' },
    { name: 'pH异常', value: phCount, type: 'ph' },
    { name: '病虫害', value: diseaseCount, type: 'disease' }
  ].filter(item => item.value > 0) // 只显示有数据的异常类型
}

// 格式化日期
const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 格式化日期时间（用于API参数）
const formatDateTime = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

// 获取异常统计数据（使用告警历史接口）
const fetchAbnormalStats = async () => {
  try {
    // 固定查询2026-02-20到2026-03-03的数据
    const startTime = '2026-02-20T00:00:00'
    const endTime = '2026-03-03T23:59:59'
    
    const response = await alertHistoryApi.getAlertHistoryList({ 
      startTime, 
      endTime,
      pageSize: 1000  // 获取足够多的数据
    })
    
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const records = response.data?.records || response.data?.list || response.data || []
      alertHistoryData.value = records
      
      // 根据告警历史数据生成异常趋势数据
      generateAnomalyDataFromAlertHistory()
      
      // 打印异常事件线表格绑定的数据
      console.log('异常事件线表格绑定的数据:', dailyAnomalyData.value)
    }
  } catch (error) {
    console.error('获取告警历史数据失败:', error)
  }
}

// 根据告警历史数据生成异常趋势数据
const generateAnomalyDataFromAlertHistory = () => {
  const anomalies: any[] = []
  
  alertHistoryData.value.forEach((item: any) => {
    const greenhouseName = item.greenhouseId ? `${item.greenhouseId}号温室` : '未知温室'
    // 从 triggerTime 提取日期
    const triggerTime = item.triggerTime || ''
    const date = triggerTime.split(' ')[0] || formatDate(new Date())
    
    // 根据告警级别确定严重程度
    let severity = 'low'
    if (item.alertLevel === 'critical' || item.alertLevel === 'error') {
      severity = 'high'
    } else if (item.alertLevel === 'warning') {
      severity = 'medium'
    }
    
    // 获取异常类型文本
    const alertType = getAlertTypeText(item.dataType, item.alertType)
    
    // 为每条告警记录生成数据
    anomalies.push({
      date: date,
      greenhouse: greenhouseName,
      type: alertType,
      value: 1,  // 每条告警记录计为1次
      severity: severity,
      alertTitle: item.alertTitle,
      alertContent: item.alertContent,
      status: item.status
    })
  })
  
  anomalyData.value = anomalies
}

// 获取告警类型的中文文本
const getAlertTypeText = (dataType: string, alertType: string) => {
  const typeMap: { [key: string]: string } = {
    'temperature': '温度异常',
    'airHumidity': '空气湿度异常',
    'soilHumidity': '土壤湿度异常',
    'lightIntensity': '光照异常',
    'co2Concentration': 'CO2异常',
    'soilPh': 'pH异常'
  }
  
  // 优先使用 dataType 映射
  if (dataType && typeMap[dataType]) {
    return typeMap[dataType]
  }
  
  // 根据 alertType 判断
  if (alertType?.includes('temperature')) return '温度异常'
  if (alertType?.includes('humidity')) return '湿度异常'
  if (alertType?.includes('light')) return '光照异常'
  if (alertType?.includes('co2')) return 'CO2异常'
  if (alertType?.includes('ph')) return 'pH异常'
  if (alertType?.includes('disease') || alertType?.includes('pest')) return '病虫害'
  
  return '其他异常'
}

// 获取异常类型的中文文本
const getAbnormalTypeText = (type: string) => {
  const typeMap: { [key: string]: string } = {
    '病虫害': '病虫害',
    'temperature': '温度异常',
    'air_humidity': '空气湿度异常',
    'soil_humidity': '土壤湿度异常',
    'light': '光照异常',
    'light_intensity': '光照强度异常',
    'co2_concentration': 'CO2异常',
    'soil_ph': 'pH异常'
  }
  return typeMap[type] || type
}

onMounted(() => {
  console.log('数据分析页面加载成功')
  fetchGreenhouseData()
  fetchAbnormalStats()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageDesc }}</p>
    </div>

    <!-- 统计概览卡片 -->
    <div class="stats-overview">
      <div class="stat-card danger">
        <div class="stat-value">{{ problemGreenhouses.filter(g => g.status === 'danger').length }}</div>
        <div class="stat-label">异常温室</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ problemGreenhouses.filter(g => g.status === 'warning').length }}</div>
        <div class="stat-label">警告温室</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">{{ healthyGreenhouses.length }}</div>
        <div class="stat-label">健康温室</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">{{ greenhouses.reduce((sum, g) => sum + (g.totalAbnormalCount || 0), 0) }}</div>
        <div class="stat-label">异常事件数</div>
      </div>
    </div>

    <!-- 问题温室预警 -->
    <div class="alert-section" v-if="problemGreenhouses.length > 0">
      <h3 class="section-title">⚠️ 需要关注的温室</h3>
      <div class="problem-cards">
        <div 
          v-for="greenhouse in problemGreenhouses" 
          :key="greenhouse.id"
          class="problem-card"
          :class="greenhouse.status"
        >
          <div class="card-header">
            <span class="greenhouse-name">{{ greenhouse.name }}</span>
            <span class="health-score" :class="greenhouse.status">{{ greenhouse.healthScore }}分</span>
          </div>
          <div class="crop-type">{{ greenhouse.cropType }}</div>
          <div class="suggestions">
            <div v-for="(suggestion, index) in getSuggestion(greenhouse)" :key="index" class="suggestion-item">
              <span>{{ suggestion }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-grid">
      <!-- 健康评分排名 -->
      <div class="chart-item">
        <v-chart class="chart" :option="healthScoreOption" />
      </div>

      <!-- 异常分布 -->
      <div class="chart-item">
        <v-chart class="chart" :option="anomalyOption" />
      </div>

      <!-- 异常次数时间线 -->
      <div class="chart-item">
        <v-chart class="chart" :option="timelineOption" />
      </div>

      <!-- 温室环境数据对比 -->
      <div class="chart-item">
        <v-chart class="chart" :option="greenhouseComparisonOption" />
      </div>
    </div>

    <!-- 温室健康评分表 -->
    <div class="health-score-section">
      <h3 class="section-title">📊 温室健康评分详情</h3>
      <div class="table-wrapper">
        <el-table :data="greenhouses" v-loading="loading" border stripe>
          <el-table-column type="expand" width="50">
            <template #default="{ row }">
              <div class="expand-content">
                <h4>评分详情</h4>
                <el-table v-if="row.healthDeductions && row.healthDeductions.length > 0" :data="row.healthDeductions" border size="small">
                  <el-table-column prop="type" label="异常类型" min-width="120" />
                  <el-table-column prop="count" label="数量" width="80">
                    <template #default="{ row }">
                      {{ row.count || '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="deduction" label="扣分" width="80">
                    <template #default="{ row }">
                      <span style="color: #ff4d4f">-{{ row.deduction }}</span>
                    </template>
                  </el-table-column>
                </el-table>
                <el-alert v-else title="无扣分项" type="success" :closable="false" description="该温室运行正常，无任何扣分项。" show-icon />
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="温室名称" min-width="120" />
          <el-table-column prop="cropType" label="作物类型" min-width="100" />
          <el-table-column label="健康评分" width="120" align="center">
            <template #default="{ row }">
              <div class="score-display">
                <span class="score-value" :class="row.healthLevel?.status">{{ row.healthScore }}</span>
                <span class="score-unit">分</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="评分等级" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.healthLevel?.status === 'success' ? 'success' : row.healthLevel?.status === 'normal' ? 'primary' : row.healthLevel?.status === 'warning' ? 'warning' : 'danger'">
                {{ row.healthLevel?.label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'normal' ? 'success' : row.status === 'warning' ? 'warning' : 'danger'">
                {{ row.status === 'normal' ? '正常' : row.status === 'warning' ? '警告' : '异常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="病虫害" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.diseaseCount > 0 ? 'danger' : 'success'">
                {{ row.diseaseCount }}处
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="异常项" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.totalAbnormalCount > 0 ? 'warning' : 'success'">
                {{ row.totalAbnormalCount }}项
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="温度" width="100" align="center">
            <template #default="{ row }">
              <span :class="{ 'abnormal': row.abnormalData?.temperature }">{{ row.temperature }}°C</span>
            </template>
          </el-table-column>
          <el-table-column label="湿度" width="100" align="center">
            <template #default="{ row }">
              <span :class="{ 'abnormal': row.abnormalData?.humidity }">{{ row.airHumidity }}%</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 分析建议 -->
    <div class="analysis-suggestions">
      <h3 class="section-title">📊 智能分析建议</h3>
      <div class="suggestion-list">
        <el-alert
          v-for="(suggestion, index) in analysisSuggestions"
          :key="index"
          :title="suggestion.title"
          :type="suggestion.type"
          :closable="false"
          :description="suggestion.description"
          show-icon
          class="mb-3"
        />
        <el-alert
          v-if="analysisSuggestions.length === 0"
          title="暂无异常"
          type="success"
          :closable="false"
          description="所有温室运行正常，无需特别关注。"
          show-icon
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 0;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-header {
  padding: 20px 24px;
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  margin: 0;
}

/* 统计概览 */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 0 24px 20px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid;
}

.stat-card.danger {
  border-left-color: #ff4d4f;
}

.stat-card.warning {
  border-left-color: #faad14;
}

.stat-card.success {
  border-left-color: #52c41a;
}

.stat-card.info {
  border-left-color: #1890ff;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 问题温室 */
.alert-section {
  padding: 0 24px 20px;
}

.section-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  font-weight: 600;
}

.problem-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.problem-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
  border-left: 4px solid;
}

.problem-card.danger {
  border-left-color: #ff4d4f;
}

.problem-card.warning {
  border-left-color: #faad14;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.greenhouse-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.health-score {
  font-size: 20px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
}

.health-score.danger {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.health-score.warning {
  background-color: #fffbe6;
  color: #faad14;
}

.crop-type {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-item {
  font-size: 13px;
  color: #666;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 3px solid #faad14;
}

/* 图表网格 */
.chart-grid {
  padding: 0 24px 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-item {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
  border: 1px solid #e0e0e0;
}

.chart {
  width: 100%;
  height: 350px;
}

/* 健康评分表 */
.health-score-section {
  padding: 0 24px 20px;
}

.table-wrapper {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.expand-content {
  padding: 16px;
  background-color: #f5f5f5;
}

.expand-content h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 14px;
}

.score-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
}

.score-value {
  font-size: 24px;
  font-weight: 700;
}

.score-value.success {
  color: #52c41a;
}

.score-value.normal {
  color: #1890ff;
}

.score-value.warning {
  color: #faad14;
}

.score-value.danger {
  color: #ff4d4f;
}

.score-unit {
  font-size: 14px;
  color: #999;
}

.abnormal {
  color: #ff4d4f;
  font-weight: 600;
}

/* 分析建议 */
.analysis-suggestions {
  padding: 0 24px 24px;
}

.suggestion-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
}

.mb-3 {
  margin-bottom: 12px;
}

@media (max-width: 1200px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .problem-cards {
    grid-template-columns: 1fr;
  }
}
</style>