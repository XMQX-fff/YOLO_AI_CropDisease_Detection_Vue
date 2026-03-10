<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, Document, VideoPlay, Phone, Message, Search } from '@element-plus/icons-vue'

// 页面标题
const pageTitle = ref('帮助文档')
const pageDesc = ref('查看系统使用指南，常见问题解答，技术支持联系方式')

// 搜索关键词
const searchKeyword = ref('')

// 当前选中的帮助分类
const activeCategory = ref('guide')

// 帮助分类
const categories = [
  { key: 'guide', label: '使用指南', icon: Document },
  { key: 'faq', label: '常见问题', icon: QuestionFilled },
  { key: 'video', label: '视频教程', icon: VideoPlay },
  { key: 'contact', label: '联系我们', icon: Phone }
]

// 使用指南内容
const guides = [
  {
    title: '温室管理',
    content: '在温室管理页面，您可以查看所有温室的基本信息、环境参数和作物种植情况。点击温室卡片可查看详细信息，包括实时环境数据、历史数据趋势和病虫害检测结果。',
    icon: 'GreenHouse'
  },
  {
    title: '环境监测',
    content: '环境监测页面提供实时的温度、湿度、光照、CO2浓度等环境参数监控。支持查看历史数据趋势，可选择不同时间范围（8小时、1天、1周、1个月）进行数据分析。',
    icon: 'Monitor'
  },
  {
    title: '设备控制',
    content: '在设备控制页面，您可以远程控制温室内的各种设备，如风机、湿帘、遮阳网、灌溉系统等。支持手动控制和自动模式切换，自动模式会根据环境参数自动调节设备状态。',
    icon: 'SetUp'
  },
  {
    title: '数据分析',
    content: '数据分析页面提供温室健康评分、异常分布统计、异常事件时间线等高级分析功能。帮助您全面了解温室运行状况，及时发现并处理异常情况。',
    icon: 'TrendCharts'
  },
  {
    title: '告警管理',
    content: '告警管理包含告警规则配置和告警历史查询。您可以设置各种环境参数的告警阈值，当参数超出范围时系统会自动发送告警通知。告警历史记录所有告警事件及其处理状态。',
    icon: 'Bell'
  },
  {
    title: '病虫害检测',
    content: '系统支持图像、视频和实时摄像头三种方式进行病虫害检测。上传图片或视频，系统将自动识别病虫害类型并给出防治建议。检测结果会保存到记录中供后续查看。',
    icon: 'View'
  }
]

// 常见问题
const faqs = [
  {
    question: '如何添加新的温室？',
    answer: '在温室管理页面点击"新增温室"按钮，填写温室名称、面积、种植作物等基本信息后保存即可。'
  },
  {
    question: '告警规则如何设置？',
    answer: '进入告警管理页面，选择"告警规则"标签，点击"新增规则"按钮。选择要监控的参数类型（温度、湿度等），设置最小值、最大值和告警级别，保存后即可生效。'
  },
  {
    question: '如何查看历史环境数据？',
    answer: '在环境监测页面，选择要查看的温室和时间范围（8小时、1天、1周、1个月），系统会自动加载并显示对应的历史数据趋势图。'
  },
  {
    question: '设备自动控制如何开启？',
    answer: '在设备控制页面，找到要设置自动控制的设备，点击"自动模式"开关即可开启。开启后设备会根据预设的环境参数阈值自动运行。'
  },
  {
    question: '病虫害检测的准确率如何？',
    answer: '系统采用先进的深度学习算法，对常见病虫害的识别准确率达到95%以上。对于识别结果不确定的情况，系统会给出多个可能的病虫害类型供参考。'
  },
  {
    question: '如何导出环境数据报表？',
    answer: '目前系统支持在数据分析页面查看统计数据，导出功能正在开发中，敬请期待。'
  },
  {
    question: '系统支持哪些浏览器？',
    answer: '系统支持Chrome、Firefox、Safari、Edge等主流浏览器的最新版本。建议使用Chrome浏览器以获得最佳体验。'
  },
  {
    question: '忘记密码怎么办？',
    answer: '请联系系统管理员重置密码，或拨打技术支持热线获取帮助。'
  }
]

// 视频教程
const videos = [
  {
    title: '系统快速入门',
    description: '介绍系统的基本功能和操作方法，帮助您快速上手使用',
    duration: '10:25',
    thumbnail: '入门教程'
  },
  {
    title: '温室管理详解',
    description: '详细讲解温室管理页面的各项功能和操作技巧',
    duration: '15:30',
    thumbnail: '温室管理'
  },
  {
    title: '告警规则配置',
    description: '演示如何配置告警规则，设置监控参数和告警阈值',
    duration: '08:45',
    thumbnail: '告警配置'
  },
  {
    title: '设备控制操作',
    description: '介绍设备控制页面的使用方法，包括手动控制和自动模式',
    duration: '12:15',
    thumbnail: '设备控制'
  },
  {
    title: '病虫害检测使用指南',
    description: '演示如何使用图像、视频和摄像头进行病虫害检测',
    duration: '18:20',
    thumbnail: '病虫害检测'
  },
  {
    title: '数据分析与报表',
    description: '讲解数据分析页面的各项功能和数据解读方法',
    duration: '14:00',
    thumbnail: '数据分析'
  }
]

// 联系方式
const contacts = [
  {
    type: '技术支持热线',
    value: '400-888-9999',
    icon: 'Phone',
    desc: '工作日 9:00-18:00'
  },
  {
    type: '技术支持邮箱',
    value: 'support@smartgreenhouse.com',
    icon: 'Message',
    desc: '24小时内回复'
  },
  {
    type: '在线客服',
    value: '点击咨询',
    icon: 'ChatDotRound',
    desc: '工作日 9:00-21:00'
  }
]

// 搜索帮助内容
const searchResults = ref<any[]>([])
const isSearching = ref(false)

const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  
  isSearching.value = true
  const keyword = searchKeyword.value.toLowerCase()
  
  // 搜索使用指南
  const guideResults = guides.filter(g => 
    g.title.toLowerCase().includes(keyword) || 
    g.content.toLowerCase().includes(keyword)
  ).map(g => ({ ...g, type: 'guide' }))
  
  // 搜索常见问题
  const faqResults = faqs.filter(f => 
    f.question.toLowerCase().includes(keyword) || 
    f.answer.toLowerCase().includes(keyword)
  ).map(f => ({ ...f, type: 'faq' }))
  
  searchResults.value = [...guideResults, ...faqResults]
  
  if (searchResults.value.length === 0) {
    ElMessage.info('未找到相关内容，请尝试其他关键词')
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
  searchResults.value = []
}

// 播放视频
const playVideo = (video: any) => {
  ElMessage.info(`正在播放：${video.title}`)
}

// 联系客服
const contactService = () => {
  ElMessage.success('已打开在线客服窗口')
}

onMounted(() => {
  console.log('帮助文档页面加载成功')
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageDesc }}</p>
    </div>

    <div class="content-wrapper">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索帮助内容..."
          class="search-input"
          clearable
          @keyup.enter="handleSearch"
          @clear="clearSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <!-- 搜索结果 -->
      <div v-if="isSearching" class="search-results">
        <div class="section-header">
          <h3>搜索结果</h3>
          <el-button link @click="clearSearch">返回全部</el-button>
        </div>
        <div v-if="searchResults.length > 0" class="results-list">
          <div v-for="(item, index) in searchResults" :key="index" class="result-item">
            <el-tag v-if="item.type === 'guide'" type="primary" size="small">使用指南</el-tag>
            <el-tag v-else type="success" size="small">常见问题</el-tag>
            <h4>{{ item.title || item.question }}</h4>
            <p>{{ item.content || item.answer }}</p>
          </div>
        </div>
        <el-empty v-else description="未找到相关内容" />
      </div>

      <!-- 分类标签页 -->
      <div v-else class="help-content">
        <el-tabs v-model="activeCategory" type="border-card" class="help-tabs">
          <!-- 使用指南 -->
          <el-tab-pane label="使用指南" name="guide">
            <div class="guides-grid">
              <el-card v-for="(guide, index) in guides" :key="index" class="guide-card" shadow="hover">
                <div class="guide-icon">
                  <el-icon :size="40" color="#409EFF">
                    <component :is="guide.icon" />
                  </el-icon>
                </div>
                <h3>{{ guide.title }}</h3>
                <p>{{ guide.content }}</p>
              </el-card>
            </div>
          </el-tab-pane>

          <!-- 常见问题 -->
          <el-tab-pane label="常见问题" name="faq">
            <div class="faq-list">
              <el-collapse accordion>
                <el-collapse-item v-for="(faq, index) in faqs" :key="index" :title="faq.question">
                  <div class="faq-answer">
                    <p>{{ faq.answer }}</p>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-tab-pane>

          <!-- 视频教程 -->
          <el-tab-pane label="视频教程" name="video">
            <div class="videos-grid">
              <el-card v-for="(video, index) in videos" :key="index" class="video-card" shadow="hover" @click="playVideo(video)">
                <div class="video-thumbnail">
                  <div class="thumbnail-placeholder">
                    <el-icon :size="48" color="#909399"><VideoPlay /></el-icon>
                    <span>{{ video.thumbnail }}</span>
                  </div>
                  <div class="video-duration">{{ video.duration }}</div>
                </div>
                <div class="video-info">
                  <h4>{{ video.title }}</h4>
                  <p>{{ video.description }}</p>
                </div>
              </el-card>
            </div>
          </el-tab-pane>

          <!-- 联系我们 -->
          <el-tab-pane label="联系我们" name="contact">
            <div class="contact-section">
              <div class="contact-cards">
                <el-card v-for="(contact, index) in contacts" :key="index" class="contact-card" shadow="hover">
                  <div class="contact-icon">
                    <el-icon :size="32" color="#67C23A">
                      <component :is="contact.icon" />
                    </el-icon>
                  </div>
                  <div class="contact-info">
                    <h4>{{ contact.type }}</h4>
                    <p class="contact-value" :class="{ 'clickable': contact.type === '在线客服' }" @click="contact.type === '在线客服' && contactService()">
                      {{ contact.value }}
                    </p>
                    <p class="contact-desc">{{ contact.desc }}</p>
                  </div>
                </el-card>
              </div>

              <div class="feedback-section">
                <h3>意见反馈</h3>
                <p>如果您有任何建议或遇到问题，欢迎向我们反馈</p>
                <el-button type="primary" size="large" @click="ElMessage.info('反馈功能开发中')">
                  <el-icon><Message /></el-icon>
                  提交反馈
                </el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
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

.content-wrapper {
  padding: 0 24px 24px;
}

/* 搜索区域 */
.search-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
}

/* 搜索结果 */
.search-results {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.result-item h4 {
  margin: 8px 0;
  font-size: 16px;
  color: #333;
}

.result-item p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

/* 帮助内容 */
.help-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.help-tabs :deep(.el-tabs__content) {
  padding: 20px;
}

/* 使用指南 */
.guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.guide-card {
  transition: transform 0.3s;
}

.guide-card:hover {
  transform: translateY(-4px);
}

.guide-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.guide-card h3 {
  text-align: center;
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #333;
}

.guide-card p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}

/* 常见问题 */
.faq-list {
  max-width: 800px;
  margin: 0 auto;
}

.faq-answer {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.faq-answer p {
  margin: 0;
  color: #666;
  line-height: 1.8;
}

/* 视频教程 */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.video-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.video-card:hover {
  transform: translateY(-4px);
}

.video-thumbnail {
  position: relative;
  height: 160px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.thumbnail-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.thumbnail-placeholder span {
  font-size: 14px;
  color: #909399;
}

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.video-info {
  padding: 12px 0 0 0;
}

.video-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.video-info p {
  margin: 0;
  color: #999;
  font-size: 14px;
  line-height: 1.5;
}

/* 联系我们 */
.contact-section {
  max-width: 900px;
  margin: 0 auto;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.contact-card {
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.contact-card :deep(.el-card__body) {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
  border-radius: 12px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.contact-icon .el-icon {
  color: #fff !important;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-info h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.contact-value {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  word-break: break-all;
}

.contact-value.clickable {
  cursor: pointer;
  color: #67C23A;
  text-decoration: none;
  transition: color 0.2s;
}

.contact-value.clickable:hover {
  color: #85ce61;
  text-decoration: underline;
}

.contact-desc {
  margin: 0;
  font-size: 12px;
  color: #999;
}

/* 反馈区域 */
.feedback-section {
  text-align: center;
  padding: 40px 32px;
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.feedback-section h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  color: #333;
  font-weight: 600;
}

.feedback-section p {
  margin: 0 0 24px 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.feedback-section .el-button {
  padding: 12px 32px;
  font-size: 15px;
  border-radius: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .page-header {
    padding: 16px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .content-wrapper {
    padding: 0 16px 16px;
  }

  .guides-grid,
  .videos-grid {
    grid-template-columns: 1fr;
  }

  .contact-cards {
    grid-template-columns: 1fr;
  }
}
</style>
