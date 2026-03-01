<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGreenhouseApi } from '/@/api/greenhouse'

const greenhouseApi = useGreenhouseApi()

// 温室列表
const greenhouseList = ref<{ id: number; name: string }[]>([])
const currentGreenhouseId = ref<number>(1)

// 设备列表
const deviceList = ref<any[]>([])
const loading = ref(false)

// 防抖定时器
const debounceTimers: { [key: number]: any } = {}

// 防抖函数
const debounce = (fn: Function, delay: number, deviceId: number) => {
  if (debounceTimers[deviceId]) {
    clearTimeout(debounceTimers[deviceId])
  }
  debounceTimers[deviceId] = setTimeout(() => {
    fn()
    delete debounceTimers[deviceId]
  }, delay)
}

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
      
      if (greenhouseList.value.length > 0) {
        currentGreenhouseId.value = greenhouseList.value[0].id
        fetchDeviceList()
      }
    }
  } catch (error) {
    console.error('获取温室列表失败:', error)
  }
}

// 获取设备列表
const fetchDeviceList = async () => {
  loading.value = true
  try {
    const response = await greenhouseApi.getDevicesByGreenhouseId(currentGreenhouseId.value.toString())
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const data = response.data.records || response.data.list || response.data
      deviceList.value = Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.error('获取设备列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 温室变化
const handleGreenhouseChange = () => {
  fetchDeviceList()
}

// 控制设备开关
const handleToggleDevice = async (device: any) => {
  const newStatus = device.currentStatus === 1 ? 0 : 1
  try {
    const response = await greenhouseApi.controlDevice(device.id.toString(), {
      status: newStatus,
      operateUser: '管理员'
    })
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      device.currentStatus = newStatus
    }
  } catch (error) {
    console.error('控制设备失败:', error)
  }
}

// 切换自动模式
const handleToggleAuto = async (device: any) => {
  const newIsAuto = device.isAuto === 1 ? 0 : 1
  try {
    const response = await greenhouseApi.toggleAutoMode(device.id.toString(), {
      isAuto: newIsAuto
    })
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      device.isAuto = newIsAuto
    }
  } catch (error) {
    console.error('切换自动模式失败:', error)
  }
}

// 调节设备数值
const handleValueChange = (device: any, value: number) => {
  device.currentValue = value
  
  debounce(async () => {
    try {
      const response = await greenhouseApi.controlDevice(device.id.toString(), {
        status: device.currentStatus,
        value: value.toString(),
        operateUser: '管理员'
      })
      if (response.code !== '200' && response.code !== 200 && response.code !== '0' && response.code !== 0) {
        console.error('调节设备数值失败')
      }
    } catch (error) {
      console.error('调节设备数值失败:', error)
    }
  }, 500, device.id)
}

// 获取设备图标
const getDeviceIcon = (deviceType: string) => {
  const iconMap: { [key: string]: string } = {
    'temperature': '🌡️',
    'humidity': '💧',
    'irrigation': '🚿',
    'light': '💡',
    'shade': '☀️',
    'ventilation': '🌀',
    'co2': '🌫️'
  }
  return iconMap[deviceType] || '⚙️'
}

// 获取设备类型名称
const getDeviceTypeName = (deviceType: string) => {
  const nameMap: { [key: string]: string } = {
    'temperature': '温度控制',
    'humidity': '湿度控制',
    'irrigation': '灌溉系统',
    'light': '光照控制',
    'shade': '遮阳系统',
    'ventilation': '通风系统',
    'co2': 'CO2控制'
  }
  return nameMap[deviceType] || '未知类型'
}

onMounted(() => {
  fetchGreenhouseList()
})
</script>

<template>
  <div class="device-control-container">
    <div class="page-header">
      <h1>设备控制</h1>
      <p>控制温室设备，包括温控、湿控、光照等设备的开关和调节</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h3>设备列表</h3>
        <div class="card-actions">
          <select class="greenhouse-select" v-model="currentGreenhouseId" @change="handleGreenhouseChange">
            <option v-for="gh in greenhouseList" :key="gh.id" :value="gh.id">{{ gh.name }}</option>
          </select>
        </div>
      </div>
      <div class="card-body">
        <div v-if="loading" class="loading">
          <p>加载中...</p>
        </div>
        <div v-else-if="deviceList.length === 0" class="empty">
          <p>暂无设备数据</p>
        </div>
        <div v-else class="device-grid">
          <div v-for="device in deviceList" :key="device.id" class="device-card">
            <div class="device-header">
              <div class="device-icon">
                {{ getDeviceIcon(device.deviceType) }}
              </div>
              <div class="device-info">
                <h4>{{ device.deviceName || '未知设备' }}</h4>
                <span class="device-type">{{ getDeviceTypeName(device.deviceType) }}</span>
              </div>
              <div class="device-status">
                <span class="status-badge" :class="{ active: device.currentStatus === 1 }">
                  {{ device.currentStatus === 1 ? '开启' : '关闭' }}
                </span>
              </div>
            </div>
            <div class="device-body">
              <!-- switch_slider 模式：开关 + 滑块 -->
              <div v-if="device.controlMode === 'switch_slider'" class="device-control">
                <div class="device-value">
                  <label>数值：</label>
                  <input 
                    type="range" 
                    :min="device.minValue || 0" 
                    :max="device.maxValue || 100" 
                    :value="device.currentValue || 0" 
                    @input="handleValueChange(device, Number($event.target.value))"
                    :disabled="device.currentStatus === 0"
                    step="0.1"
                  />
                  <span class="value-display">{{ (device.currentValue || 0).toFixed(1) }}</span>
                  <span class="unit">{{ device.unit || '' }}</span>
                </div>
              </div>
              <!-- slider 模式：只有滑块 -->
              <div v-else-if="device.controlMode === 'slider'" class="device-control">
                <div class="device-value">
                  <label>数值：</label>
                  <input 
                    type="range" 
                    :min="device.minValue || 0" 
                    :max="device.maxValue || 100" 
                    :value="device.currentValue || 0" 
                    @input="handleValueChange(device, Number($event.target.value))"
                    step="0.1"
                  />
                  <span class="value-display">{{ (device.currentValue || 0).toFixed(1) }}</span>
                  <span class="unit">{{ device.unit || '' }}</span>
                </div>
              </div>
              <!-- switch 模式：只有开关 -->
              <div v-else class="device-control">
                <div class="device-info-text">
                  <span v-if="device.remark">{{ device.remark }}</span>
                  <span v-else>该设备仅支持开关控制</span>
                </div>
              </div>
              <div class="device-auto">
                <label>模式：</label>
                <span class="auto-badge" :class="{ auto: device.isAuto === 1 }">
                  {{ device.isAuto === 1 ? '自动' : '手动' }}
                </span>
              </div>
            </div>
            <div class="device-footer">
              <button 
                v-if="device.controlMode === 'switch' || device.controlMode === 'switch_slider'"
                class="btn-toggle" 
                :class="{ active: device.currentStatus === 1 }"
                @click="handleToggleDevice(device)"
              >
                {{ device.currentStatus === 1 ? '关闭' : '开启' }}
              </button>
              <button 
                class="btn-auto" 
                @click="handleToggleAuto(device)"
              >
                {{ device.isAuto === 1 ? '切换手动' : '切换自动' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-control-container {
  padding: 0;
  background-color: #fff;
  min-height: 100%;
}

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

.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.card-header h3 {
  font-size: 18px;
  color: #333;
  margin: 0;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
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

.card-body {
  padding: 20px;
}

.loading, .empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.device-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  min-height: 280px;
}

.device-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.device-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.device-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.device-info {
  flex: 1;
}

.device-info h4 {
  font-size: 16px;
  color: #333;
  margin: 0 0 4px 0;
  font-weight: 600;
}

.device-type {
  font-size: 12px;
  color: #666;
}

.device-status {
  margin-left: auto;
}

.status-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  background-color: #e0e0e0;
  color: #666;
}

.status-badge.active {
  background-color: #e8f5e8;
  color: #28a745;
}

.device-body {
  margin-bottom: 16px;
  flex: 1;
}

.device-control {
  margin-bottom: 12px;
}

.device-value {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.device-value label {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.device-value input[type="range"] {
  flex: 1;
  padding: 0;
  border: none;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.device-value input[type="range"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.device-value .value-display {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  min-width: 50px;
  text-align: right;
}

.device-value .unit {
  font-size: 12px;
  color: #666;
  min-width: 30px;
}

.device-info-text {
  font-size: 13px;
  color: #666;
  padding: 8px 12px;
  background-color: #fff;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  margin-bottom: 12px;
  min-height: 60px;
  display: flex;
  align-items: center;
}

.device-auto {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-auto label {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.auto-badge {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  background-color: #e0e0e0;
  color: #666;
}

.auto-badge.auto {
  background-color: #e3f2fd;
  color: #1976d2;
}

.device-footer {
  display: flex;
  gap: 10px;
}

.btn-toggle, .btn-auto {
  flex: 1;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-toggle {
  background-color: #6c757d;
  color: #fff;
}

.btn-toggle:hover {
  background-color: #5a6268;
}

.btn-toggle.active {
  background-color: #dc3545;
}

.btn-toggle.active:hover {
  background-color: #c82333;
}

.btn-auto {
  background-color: #007bff;
  color: #fff;
}

.btn-auto:hover {
  background-color: #0069d9;
}

@media (max-width: 768px) {
  .device-grid {
    grid-template-columns: 1fr;
  }
}
</style>
