<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { ElCard } from 'element-plus'
import 'element-plus/dist/index.css'

// 统计数据
const statistics = ref({
  users: 42,
  greenhouse: 9,
  diseases: 141,
  yield: 1232
})

// 图表实例
let diseaseDistChart: echarts.ECharts
let plantingStatsChart: echarts.ECharts

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
  { name: '1号温室', crop: '玉米', status: '生长良好', plantCount: 350, diseaseCount: 20 },
  { name: '2号温室', crop: '水稻', status: '生长良好', plantCount: 400, diseaseCount: 15 },
  { name: '3号温室', crop: '小麦', status: '需要关注', plantCount: 350, diseaseCount: 18 },
  { name: '4号温室', crop: '马铃薯', status: '生长良好', plantCount: 250, diseaseCount: 12 },
  { name: '5号温室', crop: '棉花', status: '生长良好', plantCount: 300, diseaseCount: 16 },
  { name: '6号温室', crop: '苹果', status: '需要关注', plantCount: 8, diseaseCount: 14 },
  { name: '7号温室', crop: '葡萄', status: '生长良好', plantCount: 300, diseaseCount: 17 },
  { name: '8号温室', crop: '番茄', status: '生长良好', plantCount: 300, diseaseCount: 14 },
  { name: '9号温室', crop: '草莓', status: '生长良好', plantCount: 300, diseaseCount: 15 }
])

// 农业链接
const agricultureLinks = ref([
  { name: '中国农村网', url: 'https://www.crnews.net/', icon: 'icon-nongye' },
  { name: '中国农业网', url: 'https://www.zgny.com/', icon: 'icon-keji' },
  { name: '农业气象网', url: 'http://www.nmc.cn/publish/agro/soil-moisture-monitoring-10cm.html', icon: 'icon-zhihui' },
  { name: '农业病虫害服务站', url: 'https://farm.sino-eco.com/website/bingchonghai/', icon: 'icon-qixiang' },
  { name: '国家农业数据中心', url: 'https://www.agridata.cn/', icon: 'icon-qixiang' },
  { name: '农业病虫害研究图库', url: 'http://www.icgroupcas.cn/website_bchtk/zhenduan.aspx', icon: 'icon-qixiang' },
  { name: '中国害虫防治网', url: 'http://zghcfzw.com/', icon: 'icon-qixiang' },
  { name: '中国农业科学院', url: 'https://www.caas.cn/', icon: 'icon-qixiang' },
  { name: '中国农业农村信息网', url: 'https://www.agri.cn/', icon: 'icon-qixiang' },
  { name: '农业中国_中国网', url: 'http://agri.china.com.cn/', icon: 'icon-bingchonghai' }
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
  }
}

onMounted(() => {
  fetchWeatherData() // 获取天气数据
})

</script>

<template>
  <div class="home-page">
    <!-- 顶部区域 -->
    <div class="top-section">
      <!-- 系统公告 -->
      <ElCard class="notice-card">
        <template #header>
          <div class="card-header">
            <span>系统公告</span>
          </div>
        </template>
        <div class="notice-content">
          尊敬的各位系统用户：您好！欢迎使用本智慧农业云平台系统。为确保您能够顺畅、高效地运用本系统，充分发挥其功能优势，现将首页关键使用事项公告如下，请您仔细阅读并予以配合。本智慧农业云平台集成了多项先进技术，通过首页，您可一键快速实时查看环境监测、病害生长数据分析、园林作物病虫害监控。促进病虫害及时发现及防治，助力农业智能化。科学化管理重点养殖业，提升养殖效益与质量！
        </div>
      </ElCard>

      <!-- 常用应用 -->
      <ElCard class="quick-apps-card">
        <template #header>
          <div class="card-header">
            <span>常用应用</span>
          </div>
        </template>
        <div class="apps-grid">
          <div class="app-item" @click="$router.push('/infoDisease')">
            <div class="app-icon">
              <i class="iconfontjs icon-bingchonghai-1haichong"></i>
            </div>
            <span>病虫害数据库</span>
          </div>
          <div class="app-item" @click="$router.push('/smartChat')">
            <div class="app-icon">
              <i class="iconfontjs icon-znwd"></i>
            </div>
            <span>智能助手</span>
          </div>
          <div class="app-item" @click="$router.push('/imgPredict')">
            <div class="app-icon">
              <i class="iconfontjs icon-tpjc"></i>
            </div>
            <span>图片检测</span>
          </div>
          <div class="app-item" @click="$router.push('/imgRecord')">
            <div class="app-icon">
              <i class="iconfontjs icon-tpjl"></i>
            </div>
            <span>图片检测记录</span>
          </div>
          <div class="app-item" @click="$router.push('/videoPredict')">
            <div class="app-icon">
              <i class="iconfontjs icon-spjc"></i>
            </div>
            <span>视频检测</span>
          </div>
          <div class="app-item" @click="$router.push('/videoRecord')">
            <div class="app-icon">
              <i class="iconfontjs icon-spjl"></i>
            </div>
            <span>视频检测记录</span>
          </div>
        </div>
      </ElCard>

      <!-- 天气信息 -->
      <ElCard class="weather-card">
        <template #header>
          <div class="card-header">
            <span>天气预报</span>
          </div>
        </template>
        <div class="weather-info">
          <div class="weather-header">
            {{ weatherInfo.date }} &nbsp; {{ weatherInfo.weekday }}&nbsp; {{ weatherInfo.status }}
          </div>
          <div class="weather-details">
            <div class="weather-item">温度: {{ weatherInfo.temperature }}</div>
            <div class="weather-item">天气: {{ weatherInfo.weather }}</div>
            <div class="weather-item">风向: {{ weatherInfo.wind }}</div>
            <div class="weather-item">空气质量: {{ weatherInfo.airQuality }}</div>
          </div>
          <div class="weather-notice">注意事项：
            {{ weatherInfo.notice }}
          </div>
        </div>
      </ElCard>
    </div>

    <!-- 数据统计 -->
    <div class="statistics-row">
      <div class="stat-item">
        <i class="iconfontjs icon-yh"></i>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.users }}</div>
          <div class="stat-label">用户</div>
        </div>
      </div>
      <div class="stat-item">
        <i class="iconfontjs icon-znws"></i>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.greenhouse }}</div>
          <div class="stat-label">温室</div>
        </div>
      </div>
      <div class="stat-item">
        <i class="iconfontjs icon-bingchonghai-1haichong"></i>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.diseases }}</div>
          <div class="stat-label">病害</div>
        </div>
      </div>
      <div class="stat-item">
        <i class="iconfontjs icon-cc"></i>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.yield }}</div>
          <div class="stat-label">产量</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 温室作物信息和农业链接并排显示 -->
      <div class="content-row">
        <!-- 温室作物信息 -->
        <ElCard class="crop-info-card">
          <template #header>
            <div class="card-header">
              <span>温室作物信息</span>
            </div>
          </template>
          <div class="crop-grid">
            <div v-for="(item, index) in cropTypes" :key="index" class="crop-item">
              <div class="crop-header">{{ item.name }}</div>
              <div class="crop-content">
                <div class="crop-type">作物：{{ item.crop }}</div>
                <div class="crop-numbers">
                  <span class="plant-count">种植数量：{{ item.plantCount }}</span>
                  <span class="disease-count">病害数量：{{ item.diseaseCount }}</span>
                </div>
                <div class="crop-status" :class="{ 'warning': item.status === '需要关注' }">
                  状态：{{ item.status }}
                </div>
              </div>
            </div>
          </div>
        </ElCard>

        <!-- 农业链接 -->
        <ElCard class="links-card">
          <template #header>
            <div class="card-header">
              <span>常用农业链接</span>
            </div>
          </template>
          <div class="links-grid">
            <a v-for="(link, index) in agricultureLinks" 
               :key="index" 
               :href="link.url" 
               target="_blank" 
               class="link-item">
              <i :class="link.icon"></i>
              <span>{{ link.name }}</span>
            </a>
          </div>
        </ElCard>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-page {
  padding: 20px;
  background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  .top-section {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    @media (max-width: 1200px) {
      grid-template-columns: 1fr;
    }

    .notice-card, .weather-card, .quick-apps-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      
      :deep(.el-card__header) {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(235, 238, 245, 0.8);
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .card-header {
        font-size: 18px;
        font-weight: 600;
        color: #2d3748;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
      }
    }

    .notice-card {
      .notice-content {
        font-size: 14px;
        font-weight: 500;
        color: #606266;
        line-height: 1.8;
      }
    }

    .quick-apps-card {      
        .apps-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 8px;

          .app-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
            padding: 24px 16px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
            color: white;

            .app-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 12px;
              background: rgba(255, 255, 255, 0.2);
              width: 50px;
              height: 50px;
              border-radius: 50%;

              i {
                font-size: 24px;
                color: white;
              }
            }

            span {
              color: white;
              font-size: 14px;
              font-weight: 500;
            }

            &:hover {
              transform: translateY(-4px);
              box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
              background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
            }
          }
        }
      }

      .weather-card {
        .weather-info {
          .weather-header {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 16px;
            text-align: center;
            padding: 12px;
            background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
            color: white;
            border-radius: 8px;
          }

          .weather-details {
            margin-bottom: 16px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;

            .weather-item {
              font-size: 14px;
              font-weight: 500;
              color: #4a5568;
              padding: 12px;
              background: #f7fafc;
              border-radius: 8px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              transition: all 0.2s ease;
              
              &:before {
                display: none;
              }

              &:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              }
            }
          }

          .weather-notice {
            font-size: 13px;
            font-weight: 500;
            color: #718096;
            line-height: 1.6;
            background: #f7fafc;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #48bb78;
          }
        }
      }
  }

  .statistics-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;

    .stat-item {
      background: rgba(255, 255, 255, 0.95);
      padding: 24px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;

      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, #48bb78 0%, #2f855a 100%);
      }

      i {
        font-size: 32px;
        color: white;
        background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
        padding: 16px;
        border-radius: 12px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      }

      .stat-info {
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 4px;
          line-height: 1;
        }

        .stat-label {
          font-size: 14px;
          font-weight: 500;
          color: #718096;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
        
        i {
          transform: scale(1.1);
        }
      }
    }
  }

  .charts-container {
    .content-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }

    .chart-card, .crop-info-card, .links-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      :deep(.el-card__header) {
        padding: 16px 20px;
        border-bottom: 1px solid rgba(235, 238, 245, 0.8);
      }

      :deep(.el-card__body) {
        padding: 20px;
      }

      .card-header {
        font-size: 18px;
        font-weight: 600;
        color: #2d3748;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
      }
    }

    .crop-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 8px;

      .crop-item {
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        border-radius: 12px;
        padding: 16px;
        transition: all 0.3s ease;
        border: 1px solid rgba(255, 255, 255, 0.8);

        .crop-header {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid rgba(102, 126, 234, 0.3);
        }

        .crop-content {
          .crop-type {
            font-size: 14px;
            color: #4a5568;
            margin-bottom: 8px;
            font-weight: 500;
          }

          .crop-numbers {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-bottom: 12px;
            font-size: 13px;
            
            .plant-count {
              color: #48bb78;
              background: rgba(72, 187, 120, 0.1);
              padding: 6px 10px;
              border-radius: 6px;
              text-align: center;
              font-weight: 500;
            }
            
            .disease-count {
              color: #f56565;
              background: rgba(245, 101, 101, 0.1);
              padding: 6px 10px;
              border-radius: 6px;
              text-align: center;
              font-weight: 500;
            }
          }

          .crop-status {
            font-size: 14px;
            font-weight: 600;
            padding: 8px 12px;
            border-radius: 6px;
            text-align: center;
            transition: all 0.3s ease;

            &:not(.warning) {
              color: #48bb78;
              background: rgba(72, 187, 120, 0.1);
            }

            &.warning {
              color: #ed8936;
              background: rgba(237, 137, 54, 0.1);
            }
          }
        }

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #edf2f7 0%, #f7fafc 100%);
        }
      }
    }

    .links-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      padding: 8px;

      .link-item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        padding: 16px 20px;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        border: 1px solid rgba(255, 255, 255, 0.8);
        position: relative;
        overflow: hidden;

        &:before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 4px;
          background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
        }

        i {
          font-size: 20px;
          color: #48bb78;
          margin-right: 12px;
          transition: all 0.3s ease;
        }

        span {
          color: #4a5568;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        &:hover {
          transform: translateX(4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          background: linear-gradient(135deg, #edf2f7 0%, #f7fafc 100%);
          
          i {
            color: #2f855a;
            transform: scale(1.1);
          }
          
          span {
            color: #2d3748;
          }
        }
      }
    }
  }
}
</style>
