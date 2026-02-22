<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useGreenhouseApi } from '/@/api/greenhouse'

// 温室数据
const greenhouses = ref([] as any[])
const greenhouseApi = useGreenhouseApi()
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(6)
const total = ref(0)

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
    const response = await greenhouseApi.getWithDiseaseCountPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const data = response.data.records || response.data.list || response.data
      total.value = response.data.total || data.length
      
      greenhouses.value = data.map((item: any) => {
        const gh = item.greenhouse || {}
        return {
          ...gh,
          id: gh.id,
          greenhouseName: gh.greenhouseName,
          cropType: gh.cropType,
          quantity: gh.quantity,
          growthStatus: gh.growthStatus,
          temperature: gh.temperature,
          airHumidity: gh.airHumidity,
          soilHumidity: gh.soilHumidity,
          lightIntensity: gh.lightIntensity,
          co2Concentration: gh.co2Concentration,
          soilPh: gh.soilPh,
          manager: gh.manager,
          recordTime: gh.recordTime,
          createTime: gh.createTime,
          updateTime: gh.updateTime,
          totalDiseaseCount: item.totalDiseaseCount,
          name: gh.greenhouseName || `${gh.id}号温室`,
          crop: gh.cropType || '未知作物',
          status: item.totalDiseaseCount > 5 ? '需要关注' : '生长良好',
          humidity: (gh.airHumidity || 0) + '%',
          light: (gh.lightIntensity || 0) + 'lux',
          soilMoisture: (gh.soilHumidity || 0) + '%',
          lastUpdated: gh.recordTime || '-'
        }
      })
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取温室数据失败',
    })
    console.error('获取温室数据失败:', error)
    total.value = 9
    greenhouses.value = [
      { id: 1, name: '1号温室', crop: '玉米', status: '生长良好', temperature: '25°C', humidity: '65%', light: '8000lux', soilMoisture: '45%', lastUpdated: '2026-02-20 15:30' },
      { id: 2, name: '2号温室', crop: '水稻', status: '生长良好', temperature: '28°C', humidity: '75%', light: '7500lux', soilMoisture: '55%', lastUpdated: '2026-02-20 15:30' },
      { id: 3, name: '3号温室', crop: '小麦', status: '需要关注', temperature: '22°C', humidity: '60%', light: '9000lux', soilMoisture: '40%', lastUpdated: '2026-02-20 15:30' }
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
const addGreenhouse = () => {
  addForm.value = {
    greenhouseName: '',
    cropType: '',
    quantity: 0,
    growthStatus: '',
    temperature: 0,
    airHumidity: 0,
    soilHumidity: 0,
    co2Concentration: 0,
    soilPh: 0,
    lightIntensity: 0,
    manager: '',
    recordTime: ''
  }
  addDialogVisible.value = true
}

// 保存新增
const saveAdd = async () => {
  try {
    const response = await greenhouseApi.addGreenhouse(addForm.value)
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      ElMessage({
        type: 'success',
        message: '添加成功',
      })
      addDialogVisible.value = false
      fetchGreenhouseData()
    } else {
      ElMessage({
        type: 'error',
        message: response.msg || '添加失败',
      })
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '添加失败',
    })
    console.error('添加温室失败:', error)
  }
}

// 弹窗相关
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const addDialogVisible = ref(false)
const currentGreenhouse = ref<any>(null)
const greenhouseDetections = ref<any[]>([])
const editForm = ref<any>({})
const addForm = ref<any>({})

// 查看详情
const viewDetail = async (greenhouse: any) => {
  try {
    const response = await greenhouseApi.getWithDetections(greenhouse.id)
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      currentGreenhouse.value = response.data
      greenhouseDetections.value = response.data.detections || []
      detailDialogVisible.value = true
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取温室详情失败',
    })
    console.error('获取温室详情失败:', error)
  }
}

// 编辑温室
const editGreenhouse = (greenhouse: any) => {
  editForm.value = {
    id: greenhouse.id,
    greenhouseName: greenhouse.greenhouseName,
    cropType: greenhouse.cropType,
    quantity: greenhouse.quantity,
    growthStatus: greenhouse.growthStatus,
    temperature: greenhouse.temperature,
    airHumidity: greenhouse.airHumidity,
    soilHumidity: greenhouse.soilHumidity,
    lightIntensity: greenhouse.lightIntensity,
    co2Concentration: greenhouse.co2Concentration,
    soilPh: greenhouse.soilPh,
    manager: greenhouse.manager,
    recordTime: greenhouse.recordTime
  }
  editDialogVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  try {
    const response = await greenhouseApi.updateGreenhouse(editForm.value)
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      ElMessage({
        type: 'success',
        message: '更新成功',
      })
      editDialogVisible.value = false
      fetchGreenhouseData()
    } else {
      ElMessage({
        type: 'error',
        message: response.msg || '更新失败',
      })
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '更新失败',
    })
    console.error('更新温室失败:', error)
  }
}

// 删除温室
const deleteGreenhouse = (greenhouse: any) => {
  ElMessageBox.confirm(
    `确定要删除温室【${greenhouse.name}】吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      const response = await greenhouseApi.deleteGreenhouse(greenhouse.id.toString())
      if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
        ElMessage({
          type: 'success',
          message: '删除成功',
        })
        fetchGreenhouseData()
      } else {
        ElMessage({
          type: 'error',
          message: response.msg || '删除失败',
        })
      }
    } catch (error) {
      ElMessage({
        type: 'error',
        message: '删除失败',
      })
      console.error('删除温室失败:', error)
    }
  }).catch(() => {})
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
                      <button class="btn-detail" @click="viewDetail(greenhouse)">查看详情</button>
                      <button class="btn-edit" @click="editGreenhouse(greenhouse)">编辑</button>
                      <button class="btn-delete" @click="deleteGreenhouse(greenhouse)">删除</button>
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
      </section>
      
      <!-- 查看详情弹窗 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="温室详情"
        width="700px"
        :close-on-click-modal="false"
      >
        <div v-if="currentGreenhouse" class="detail-content">
          <div class="detail-section">
            <h4>基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">温室名称：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.greenhouseName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">作物类型：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.cropType }}</span>
              </div>
              <div class="detail-item">
                <span class="label">种植数量：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.quantity }}</span>
              </div>
              <div class="detail-item">
                <span class="label">生长状态：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.growthStatus }}</span>
              </div>
              <div class="detail-item">
                <span class="label">管理员：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.manager }}</span>
              </div>
              <div class="detail-item">
                <span class="label">记录时间：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.recordTime }}</span>
              </div>
              <div class="detail-item">
                <span class="label">病虫害总数：</span>
                <span class="value" style="color: #dc3545; font-weight: 600;">{{ currentGreenhouse.totalDiseaseCount }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h4>环境数据</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">温度：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.temperature }}°C</span>
              </div>
              <div class="detail-item">
                <span class="label">空气湿度：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.airHumidity }}%</span>
              </div>
              <div class="detail-item">
                <span class="label">土壤湿度：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.soilHumidity }}%</span>
              </div>
              <div class="detail-item">
                <span class="label">光照强度：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.lightIntensity }}lux</span>
              </div>
              <div class="detail-item">
                <span class="label">CO2浓度：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.co2Concentration }}</span>
              </div>
              <div class="detail-item">
                <span class="label">土壤pH值：</span>
                <span class="value">{{ currentGreenhouse.greenhouse?.soilPh }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section" v-if="greenhouseDetections.length > 0">
            <h4>病虫害检测记录</h4>
            <div class="detection-list">
              <div v-for="(detection, index) in greenhouseDetections" :key="index" class="detection-item">
                <div class="detection-header">
                  <span class="detection-time">{{ detection.recordTime }}</span>
                  <span class="detection-count">病虫害数量：{{ detection.diseaseCount }}</span>
                </div>
                <div class="detection-detail" v-if="detection.diseaseType">
                  <span class="label">病虫害类型：</span>
                  <span class="value">{{ detection.diseaseType }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-dialog>
      
      <!-- 编辑弹窗 -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑温室"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form :model="editForm" label-width="100px">
          <el-form-item label="温室名称">
            <el-input v-model="editForm.greenhouseName" placeholder="请输入温室名称" />
          </el-form-item>
          <el-form-item label="作物类型">
            <el-input v-model="editForm.cropType" placeholder="请输入作物类型" />
          </el-form-item>
          <el-form-item label="种植数量">
            <el-input-number v-model="editForm.quantity" :min="0" />
          </el-form-item>
          <el-form-item label="生长状态">
            <el-input v-model="editForm.growthStatus" placeholder="请输入生长状态" />
          </el-form-item>
          <el-form-item label="温度">
            <el-input-number v-model="editForm.temperature" :step="0.1" />
          </el-form-item>
          <el-form-item label="空气湿度">
            <el-input-number v-model="editForm.airHumidity" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="土壤湿度">
            <el-input-number v-model="editForm.soilHumidity" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="CO2浓度">
            <el-input-number v-model="editForm.co2Concentration" :min="0" />
          </el-form-item>
          <el-form-item label="土壤pH值">
            <el-input-number v-model="editForm.soilPh" :step="0.1" />
          </el-form-item>
          <el-form-item label="光照强度">
            <el-input-number v-model="editForm.lightIntensity" :min="0" />
          </el-form-item>
          <el-form-item label="管理员">
            <el-input v-model="editForm.manager" placeholder="请输入管理员" />
          </el-form-item>
          <el-form-item label="记录时间">
            <el-input v-model="editForm.recordTime" placeholder="请输入记录时间" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit">保存</el-button>
        </template>
      </el-dialog>
      
      <!-- 新增弹窗 -->
      <el-dialog
        v-model="addDialogVisible"
        title="新增温室"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form :model="addForm" label-width="100px">
          <el-form-item label="温室名称">
            <el-input v-model="addForm.greenhouseName" placeholder="请输入温室名称" />
          </el-form-item>
          <el-form-item label="作物类型">
            <el-input v-model="addForm.cropType" placeholder="请输入作物类型" />
          </el-form-item>
          <el-form-item label="种植数量">
            <el-input-number v-model="addForm.quantity" :min="0" />
          </el-form-item>
          <el-form-item label="生长状态">
            <el-input v-model="addForm.growthStatus" placeholder="请输入生长状态" />
          </el-form-item>
          <el-form-item label="温度">
            <el-input-number v-model="addForm.temperature" :step="0.1" />
          </el-form-item>
          <el-form-item label="空气湿度">
            <el-input-number v-model="addForm.airHumidity" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="土壤湿度">
            <el-input-number v-model="addForm.soilHumidity" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="CO2浓度">
            <el-input-number v-model="addForm.co2Concentration" :min="0" />
          </el-form-item>
          <el-form-item label="土壤pH值">
            <el-input-number v-model="addForm.soilPh" :step="0.1" />
          </el-form-item>
          <el-form-item label="光照强度">
            <el-input-number v-model="addForm.lightIntensity" :min="0" />
          </el-form-item>
          <el-form-item label="管理员">
            <el-input v-model="addForm.manager" placeholder="请输入管理员" />
          </el-form-item>
          <el-form-item label="记录时间">
            <el-input v-model="addForm.recordTime" placeholder="请输入记录时间" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAdd">保存</el-button>
        </template>
      </el-dialog>
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

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .greenhouse-grid {
    grid-template-columns: repeat(2, 1fr);
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

/* 详情弹窗样式 */
.detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item .label {
  font-size: 14px;
  color: #666;
  min-width: 80px;
}

.detail-item .value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.detection-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detection-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e0e0e0;
}

.detection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.detection-time {
  font-size: 13px;
  color: #666;
}

.detection-count {
  font-size: 13px;
  color: #dc3545;
  font-weight: 600;
}

.detection-detail {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detection-detail .label {
  font-size: 13px;
  color: #666;
}

.detection-detail .value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}
</style>