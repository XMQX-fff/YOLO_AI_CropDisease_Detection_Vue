<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGreenhouseApi } from '/@/api/greenhouse'

// 温室API
const greenhouseApi = useGreenhouseApi()

// 统计数据
const statistics = ref({
  users: 42,
  greenhouse: 9,
  diseases: 141,
  yield: 1232
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
const cropTypes = ref([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)

// 获取温室数据
const fetchGreenhouseData = async () => {
  try {
    const res = await greenhouseApi.getWithDiseaseCountPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if (res.code === '0' || res.code === 0) {
      const data = res.data.records || res.data.list || res.data
      total.value = res.data.total || data.length
      
      cropTypes.value = data.map((item: any) => {
        return {
          id: item.greenhouse?.id,
          name: item.greenhouse?.greenhouseName || `${item.greenhouse?.id}号温室`,
          crop: item.greenhouse?.cropType || '未知作物',
          status: item.totalDiseaseCount > 5 ? '需要关注' : '生长良好',
          plantCount: item.greenhouse?.quantity || 0,
          diseaseCount: item.totalDiseaseCount || 0
        }
      })
    }
  } catch (err) {
    console.error('获取温室数据失败:', err)
    total.value = 9
    cropTypes.value = [
      { name: '1号温室', crop: '玉米', status: '生长良好', plantCount: 350, diseaseCount: 20 },
      { name: '2号温室', crop: '水稻', status: '生长良好', plantCount: 400, diseaseCount: 15 },
      { name: '3号温室', crop: '小麦', status: '需要关注', plantCount: 350, diseaseCount: 18 },
      { name: '4号温室', crop: '马铃薯', status: '生长良好', plantCount: 250, diseaseCount: 12 },
      { name: '5号温室', crop: '棉花', status: '生长良好', plantCount: 300, diseaseCount: 16 },
      { name: '6号温室', crop: '苹果', status: '需要关注', plantCount: 8, diseaseCount: 14 }
    ]
  }
}

// 分页改变
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchGreenhouseData()
}

// 每页大小改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchGreenhouseData()
}

// 农业链接
const agricultureLinks = ref([
  { name: '中国农村网', url: 'https://www.crnews.net/' },
  { name: '中国农业网', url: 'https://www.zgny.com/' },
  { name: '农业气象网', url: 'http://www.nmc.cn/publish/agro/soil-moisture-monitoring-10cm.html' },
  { name: '农业病虫害服务站', url: 'https://farm.sino-eco.com/website/bingchonghai/' },
  { name: '国家农业数据中心', url: 'https://www.agridata.cn/' },
  { name: '农业病虫害研究图库', url: 'http://www.icgroupcas.cn/website_bchtk/zhenduan.aspx' },
  { name: '中国害虫防治网', url: 'http://zghcfzw.com/' },
  { name: '中国农业科学院', url: 'https://www.caas.cn/' },
  { name: '中国农业农村信息网', url: 'https://www.agri.cn/' },
  { name: '农业中国_中国网', url: 'http://agri.china.com.cn/' }
])

// 模拟登录状态
const isLoggedIn = ref(true)

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

onMounted(() => {
  fetchWeatherData() // 获取天气数据
  fetchGreenhouseData() // 获取温室数据
})
</script>

<template>
  <div class="home-container">
    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 右侧内容区 -->
      <section class="content">
        <!-- 顶部区域 -->
        <div class="top-section">
          <!-- 系统公告 -->
          <div class="card notice-card">
            <div class="card-header">
              <h3>系统公告</h3>
            </div>
            <div class="card-body">
              <div class="notice-content">
                尊敬的各位系统用户：您好！欢迎使用本智慧农业云平台系统。为确保您能够顺畅、高效地运用本系统，充分发挥其功能优势，现将首页关键使用事项公告如下，请您仔细阅读并予以配合。本智慧农业云平台集成了多项先进技术，通过首页，您可一键快速实时查看环境监测、病害生长数据分析、园林作物病虫害监控。促进病虫害及时发现及防治，助力农业智能化。科学化管理重点养殖业，提升养殖效益与质量！
              </div>
            </div>
          </div>

          <!-- 常用应用 -->
          <div class="card quick-apps-card">
            <div class="card-header">
              <h3>常用应用</h3>
            </div>
            <div class="card-body">
              <div class="apps-grid">
                <div class="app-item" @click="$router.push('/infoDisease')">
                  <div class="app-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=disease%20icon%20green%20color%20simple%20design&image_size=square" alt="病虫害数据库" />
                  </div>
                  <span>病虫害数据库</span>
                </div>
                <div class="app-item" @click="$router.push('/smartChat')">
                  <div class="app-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chat%20bot%20icon%20green%20color%20simple%20design&image_size=square" alt="智能助手" />
                  </div>
                  <span>智能助手</span>
                </div>
                <div class="app-item" @click="$router.push('/imgPredict')">
                  <div class="app-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=image%20detection%20icon%20green%20color%20simple%20design&image_size=square" alt="图片检测" />
                  </div>
                  <span>图片检测</span>
                </div>
                <div class="app-item" @click="$router.push('/imgRecord')">
                  <div class="app-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=image%20record%20icon%20green%20color%20simple%20design&image_size=square" alt="图片检测记录" />
                  </div>
                  <span>图片检测记录</span>
                </div>
                <div class="app-item" @click="$router.push('/videoPredict')">
                  <div class="app-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20detection%20icon%20green%20color%20simple%20design&image_size=square" alt="视频检测" />
                  </div>
                  <span>视频检测</span>
                </div>
                <div class="app-item" @click="$router.push('/videoRecord')">
                  <div class="app-icon">
                    <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20record%20icon%20green%20color%20simple%20design&image_size=square" alt="视频检测记录" />
                  </div>
                  <span>视频检测记录</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 天气预报 -->
          <div class="card weather-card">
            <div class="card-header">
              <h3>天气预报</h3>
            </div>
            <div class="card-body">
              <div class="weather-details">
                <div class="weather-header">
                  {{ weatherInfo.date }} {{ weatherInfo.weekday }}
                </div>
                <div class="weather-info-grid">
                  <div class="weather-item">
                    <span class="label">温度</span>
                    <span class="value">{{ weatherInfo.temperature }}</span>
                  </div>
                  <div class="weather-item">
                    <span class="label">天气</span>
                    <span class="value">{{ weatherInfo.weather }}</span>
                  </div>
                  <div class="weather-item">
                    <span class="label">风向</span>
                    <span class="value">{{ weatherInfo.wind }}</span>
                  </div>
                  <div class="weather-item">
                    <span class="label">湿度</span>
                    <span class="value">{{ weatherInfo.airQuality }}</span>
                  </div>
                </div>
                <div class="weather-notice">
                  <span class="label">注意事项：</span>
                  <span class="content">{{ weatherInfo.notice }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据统计 -->
        <div class="statistics-row">
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
        </div>

        <!-- 图表区域 -->
        <div class="charts-container">
          <!-- 温室作物信息和农业链接并排显示 -->
          <div class="content-row">
            <!-- 温室作物信息 -->
            <div class="card crop-info-card">
              <div class="card-header">
                <h3>温室作物信息</h3>
              </div>
              <div class="card-body">
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

            <!-- 农业链接 -->
            <div class="card links-card">
              <div class="card-header">
                <h3>常用农业链接</h3>
              </div>
              <div class="card-body">
                <div class="links-grid">
                  <a v-for="(link, index) in agricultureLinks" 
                     :key="index" 
                     :href="link.url" 
                     target="_blank" 
                     class="link-item">
                    <span>{{ link.name }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* 首页容器 */
.home-container {
  background-color: #fff;
}

/* 主体内容样式 */
.main-content {
  padding: 30px;
}

/* 右侧内容区样式 */
.content {
  display: flex;
  flex-direction: column;
  gap: 30px;
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

/* 顶部区域样式 */
.top-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* 系统公告样式 */
.notice-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 常用应用样式 */
.apps-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.app-item:hover {
  background-color: #e8f5e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.app-icon {
  width: 50px;
  height: 50px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-icon img {
  width: 32px;
  height: 32px;
}

.app-item span {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* 天气预报样式 */
.weather-header {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.weather-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.weather-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.weather-item .label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.weather-item .value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.weather-notice {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #28a745;
}

.weather-notice .label {
  font-weight: 500;
  color: #333;
}

/* 数据统计样式 */
.statistics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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

/* 图表区域样式 */
.content-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
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
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
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

.crop-status {
  font-size: 13px;
  font-weight: 500;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
}

.crop-status:not(.warning) {
  color: #28a745;
  background-color: rgba(40, 167, 69, 0.1);
}

.crop-status.warning {
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
}

/* 分页组件样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

/* 农业链接样式 */
.links-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.link-item:hover {
  background-color: #e8f5e8;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  color: #28a745;
}

/* 页脚样式 */
.footer {
  background-color: #f8f9fa;
  padding: 24px;
  text-align: center;
  border-top: 1px solid #e0e0e0;
  margin-top: auto;
}

.footer p {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header {
    padding: 0 20px;
  }
  
  .main-nav li {
    margin: 0 10px;
  }
  
  .main-content {
    padding: 20px;
    gap: 20px;
  }
  
  .top-section {
    grid-template-columns: 1fr;
  }
  
  .content-row {
    grid-template-columns: 1fr;
  }
  
  .crop-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header {
    flex-wrap: wrap;
    height: auto;
    padding: 16px;
    gap: 16px;
  }
  
  .main-nav {
    width: 100%;
    order: 3;
  }
  
  .main-nav ul {
    justify-content: center;
  }
  
  .main-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .sidebar-nav ul {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .sidebar-nav li {
    margin-bottom: 0;
  }
  
  .statistics-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .crop-grid {
    grid-template-columns: 1fr;
  }
}
</style>