<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAlertRuleApi } from '/@/api/alertRule'
import { useAlertHistoryApi } from '/@/api/alertHistory'
import { useGreenhouseApi } from '/@/api/greenhouse'

const alertRuleApi = useAlertRuleApi()
const alertHistoryApi = useAlertHistoryApi()
const greenhouseApi = useGreenhouseApi()

// 当前激活的标签页
const activeTab = ref('rules')

// 告警规则相关
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('新增告警规则')
const isEdit = ref(false)

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const alertRules = ref([] as any[])
const greenhouses = ref([] as any[])

const searchForm = reactive({
  greenhouseId: '',
  ruleName: '',
  ruleCode: '',
  dataType: '',
  alertLevel: '',
  isEnabled: ''
})

// 告警历史相关
const historyLoading = ref(false)
const historyDialogVisible = ref(false)
const historyDialogTitle = ref('处理告警')
const historyDialogType = ref('') // confirm, handle, resolve, falseAlarm

const historyCurrentPage = ref(1)
const historyPageSize = ref(10)
const historyTotal = ref(0)

const alertHistory = ref([] as any[])
const currentHistoryRow = ref<any>(null)

const historySearchForm = reactive({
  greenhouseId: '',
  alertTitle: '',
  alertLevel: '',
  status: '',
  startTime: '',
  endTime: ''
})

const historyForm = reactive({
  operator: '',
  method: '',
  action: '',
  result: '',
  remark: ''
})

const dataTypeOptions = [
  { label: '温度', value: 'temperature' },
  { label: '空气湿度', value: 'airHumidity' },
  { label: '土壤湿度', value: 'soilHumidity' },
  { label: 'CO2浓度', value: 'co2Concentration' },
  { label: '土壤pH', value: 'soilPh' },
  { label: '光照强度', value: 'lightIntensity' }
]

const alertLevelOptions = [
  { label: '提示', value: 'info' },
  { label: '一般警告', value: 'warning' },
  { label: '严重警告', value: 'error' },
  { label: '紧急', value: 'critical' }
]

const notifyTypeOptions = [
  { label: '系统通知', value: 'system' },
  { label: '邮件', value: 'email' },
  { label: '短信', value: 'sms' },
  { label: 'APP推送', value: 'app' }
]

// 告警历史状态选项
const alertStatusOptions = [
  { label: '未确认', value: 'unconfirmed' },
  { label: '已确认', value: 'confirmed' },
  { label: '处理中', value: 'handling' },
  { label: '已解决', value: 'resolved' },
  { label: '已忽略', value: 'ignored' },
  { label: '已升级', value: 'escalated' }
]

// 处理方法选项
const handleMethodOptions = [
  { label: '人工处理', value: 'manual' },
  { label: '自动处理', value: 'auto' },
  { label: '远程控制', value: 'remote' }
]

// 解决方法选项
const resolveMethodOptions = [
  { label: '人工处理', value: 'manual_handle' },
  { label: '自动恢复', value: 'auto_recover' },
  { label: '系统修复', value: 'system_fix' }
]

const ruleForm = reactive({
  id: null,
  greenhouseId: null,
  ruleName: '',
  ruleCode: '',
  dataType: '',
  alertLevel: 'warning',
  minValue: null,
  maxValue: null,
  targetValue: null,
  tolerance: null,
  enableMin: 1,
  enableMax: 1,
  alertDuration: 60,
  alertInterval: 300,
  alertMessage: '',
  notifyType: 'system',
  autoHandle: 0,
  autoHandleAction: '',
  isEnabled: 1,
  effectiveTime: '00:00-23:59',
  remark: ''
})

const formRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' }
  ],
  ruleCode: [
    { required: true, message: '请输入规则编码', trigger: 'blur' }
  ],
  dataType: [
    { required: true, message: '请选择数据类型', trigger: 'change' }
  ],
  alertLevel: [
    { required: true, message: '请选择告警级别', trigger: 'change' }
  ]
}

const formRef = ref()

const fetchAlertRules = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchForm.greenhouseId) params.greenhouseId = searchForm.greenhouseId
    if (searchForm.ruleName) params.ruleName = searchForm.ruleName
    if (searchForm.ruleCode) params.ruleCode = searchForm.ruleCode
    if (searchForm.dataType) params.dataType = searchForm.dataType
    if (searchForm.alertLevel) params.alertLevel = searchForm.alertLevel
    if (searchForm.isEnabled !== '') params.isEnabled = searchForm.isEnabled

    const response = await alertRuleApi.getAlertRuleList(params)
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const data = response.data.records || response.data.list || response.data
      total.value = response.data.total || data.length
      alertRules.value = data
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取告警规则失败'
    })
    console.error('获取告警规则失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchGreenhouses = async () => {
  try {
    const response = await greenhouseApi.getGreenhouseList({})
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const data = response.data.records || response.data.list || response.data
      greenhouses.value = data
    }
  } catch (error) {
    console.error('获取温室列表失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchAlertRules()
}

const handleReset = () => {
  searchForm.greenhouseId = ''
  searchForm.ruleName = ''
  searchForm.ruleCode = ''
  searchForm.dataType = ''
  searchForm.alertLevel = ''
  searchForm.isEnabled = ''
  currentPage.value = 1
  fetchAlertRules()
}

const handleAdd = () => {
  dialogTitle.value = '新增告警规则'
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑告警规则'
  isEdit.value = true
  Object.assign(ruleForm, row)
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除告警规则"${row.ruleName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await alertRuleApi.deleteAlertRule(row.id)
      if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
        fetchAlertRules()
      }
    } catch (error) {
      ElMessage({
        type: 'error',
        message: '删除失败'
      })
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

const handleToggle = async (row: any) => {
  try {
    const response = await alertRuleApi.toggleAlertRule(row.id)
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      ElMessage({
        type: 'success',
        message: row.isEnabled ? '已禁用' : '已启用'
      })
      fetchAlertRules()
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '操作失败'
    })
    console.error('操作失败:', error)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const data = { ...ruleForm }
        if (data.greenhouseId === '') {
          data.greenhouseId = null
        }
        
        let response
        if (isEdit.value) {
          response = await alertRuleApi.updateAlertRule(data)
        } else {
          response = await alertRuleApi.addAlertRule(data)
        }
        
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
          ElMessage({
            type: 'success',
            message: isEdit.value ? '更新成功' : '新增成功'
          })
          dialogVisible.value = false
          fetchAlertRules()
        }
      } catch (error) {
        ElMessage({
          type: 'error',
          message: isEdit.value ? '更新失败' : '新增失败'
        })
        console.error('提交失败:', error)
      }
    }
  })
}

const resetForm = () => {
  Object.assign(ruleForm, {
    id: null,
    greenhouseId: null,
    ruleName: '',
    ruleCode: '',
    dataType: '',
    alertLevel: 'medium',
    minValue: null,
    maxValue: null,
    targetValue: null,
    tolerance: null,
    enableMin: 1,
    enableMax: 1,
    alertDuration: 60,
    alertInterval: 300,
    alertMessage: '',
    notifyType: 'system',
    autoHandle: 0,
    autoHandleAction: '',
    isEnabled: 1,
    effectiveTime: '00:00-23:59',
    remark: ''
  })
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchAlertRules()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchAlertRules()
}

const getAlertLevelTag = (level: string) => {
  const map: any = {
    info: { type: 'info', text: '提示' },
    warning: { type: 'warning', text: '一般警告' },
    error: { type: 'danger', text: '严重警告' },
    critical: { type: 'danger', text: '紧急' }
  }
  // 去除可能的尾随点号
  const cleanLevel = level?.replace(/\.$/, '') || ''
  return map[cleanLevel] || { type: '', text: cleanLevel }
}

const getEnabledStatus = (isEnabled: any) => {
  const cleanValue = String(isEnabled || '').replace(/\.$/, '')
  return Number(cleanValue) ? '已启用' : '已禁用'
}

const getEnabledType = (isEnabled: any) => {
  const cleanValue = String(isEnabled || '').replace(/\.$/, '')
  return Number(cleanValue) ? 'success' : 'info'
}

const getDataTypeText = (type: string) => {
  const option = dataTypeOptions.find(opt => opt.value === type)
  return option ? option.label : type
}

// 获取告警状态标签
const getAlertStatusTag = (status: string) => {
  const map: any = {
    unconfirmed: { type: 'info', text: '未确认' },
    confirmed: { type: 'warning', text: '已确认' },
    handling: { type: 'warning', text: '处理中' },
    resolved: { type: 'success', text: '已解决' },
    ignored: { type: 'info', text: '已忽略' },
    escalated: { type: 'danger', text: '已升级' }
  }
  return map[status] || { type: '', text: status }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 格式化持续时间
const formatDuration = (seconds: number) => {
  if (!seconds || seconds <= 0) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${secs}秒`
  } else {
    return `${secs}秒`
  }
}

// 格式化快照数据
const formatSnapshotData = (snapshotData: string | object) => {
  if (!snapshotData) return '-'
  try {
    const data = typeof snapshotData === 'string' ? JSON.parse(snapshotData) : snapshotData
    const map: { [key: string]: string } = {
      'co2': 'CO2浓度',
      'light': '光照强度',
      'temperature': '温度',
      'air_humidity': '空气湿度',
      'soil_humidity': '土壤湿度',
      'soil_ph': '土壤pH'
    }
    return Object.entries(data)
      .map(([key, value]) => `${map[key] || key}: ${value}`)
      .join(', ')
  } catch (e) {
    return String(snapshotData)
  }
}

// 获取告警历史列表
const fetchAlertHistory = async () => {
  historyLoading.value = true
  try {
    const params: any = {
      pageNum: historyCurrentPage.value,
      pageSize: historyPageSize.value
    }
    if (historySearchForm.greenhouseId) params.greenhouseId = historySearchForm.greenhouseId
    if (historySearchForm.alertTitle) params.alertTitle = historySearchForm.alertTitle
    if (historySearchForm.alertLevel) params.alertLevel = historySearchForm.alertLevel
    if (historySearchForm.status) params.status = historySearchForm.status
    if (historySearchForm.startTime) params.startTime = historySearchForm.startTime
    if (historySearchForm.endTime) params.endTime = historySearchForm.endTime

    const response = await alertHistoryApi.getAlertHistoryList(params)
    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      const data = response.data.records || response.data.list || response.data
      historyTotal.value = response.data.total || data.length
      alertHistory.value = data
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '获取告警历史失败'
    })
    console.error('获取告警历史失败:', error)
  } finally {
    historyLoading.value = false
  }
}

// 告警历史搜索
const handleHistorySearch = () => {
  historyCurrentPage.value = 1
  fetchAlertHistory()
}

// 告警历史重置
const handleHistoryReset = () => {
  historySearchForm.greenhouseId = ''
  historySearchForm.alertTitle = ''
  historySearchForm.alertLevel = ''
  historySearchForm.status = ''
  historySearchForm.startTime = ''
  historySearchForm.endTime = ''
  historyCurrentPage.value = 1
  fetchAlertHistory()
}

// 告警历史分页
const handleHistoryPageChange = (page: number) => {
  historyCurrentPage.value = page
  fetchAlertHistory()
}

const handleHistorySizeChange = (size: number) => {
  historyPageSize.value = size
  historyCurrentPage.value = 1
  fetchAlertHistory()
}

// 打开处理对话框
const openHistoryDialog = (row: any, type: string) => {
  currentHistoryRow.value = row
  historyDialogType.value = type
  historyForm.operator = ''
  historyForm.method = ''
  historyForm.action = ''
  historyForm.result = ''
  historyForm.remark = ''

  switch (type) {
    case 'confirm':
      historyDialogTitle.value = '确认告警'
      break
    case 'handle':
      historyDialogTitle.value = '开始处理'
      break
    case 'resolve':
      historyDialogTitle.value = '解决告警'
      break
    case 'falseAlarm':
      historyDialogTitle.value = '标记为误报'
      break
  }
  historyDialogVisible.value = true
}

// 提交告警处理
const handleHistorySubmit = async () => {
  if (!currentHistoryRow.value) return

  const id = currentHistoryRow.value.id
  let response: any

  try {
    switch (historyDialogType.value) {
      case 'confirm':
        if (!historyForm.operator) {
          ElMessage({ type: 'warning', message: '请输入确认人' })
          return
        }
        response = await alertHistoryApi.confirmAlert(id, historyForm.operator)
        break
      case 'handle':
        if (!historyForm.operator || !historyForm.method) {
          ElMessage({ type: 'warning', message: '请填写完整信息' })
          return
        }
        response = await alertHistoryApi.handleAlert(id, {
          handleBy: historyForm.operator,
          handleMethod: historyForm.method,
          handleAction: historyForm.action,
          handleResult: historyForm.result
        })
        break
      case 'resolve':
        if (!historyForm.operator || !historyForm.method) {
          ElMessage({ type: 'warning', message: '请填写完整信息' })
          return
        }
        response = await alertHistoryApi.resolveAlert(id, {
          resolveBy: historyForm.operator,
          resolveMethod: historyForm.method,
          resolveRemark: historyForm.remark
        })
        break
      case 'falseAlarm':
        if (!historyForm.remark) {
          ElMessage({ type: 'warning', message: '请输入误报原因' })
          return
        }
        response = await alertHistoryApi.markFalseAlarm(id, historyForm.remark)
        break
    }

    if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
      ElMessage({
        type: 'success',
        message: '操作成功'
      })
      historyDialogVisible.value = false
      fetchAlertHistory()
    }
  } catch (error) {
    ElMessage({
      type: 'error',
      message: '操作失败'
    })
    console.error('操作失败:', error)
  }
}

// 归档告警
const handleArchive = async (row: any) => {
  ElMessageBox.confirm(
    `确定要归档该告警记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await alertHistoryApi.archiveAlert(row.id)
      if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
        ElMessage({
          type: 'success',
          message: '归档成功'
        })
        fetchAlertHistory()
      }
    } catch (error) {
      ElMessage({
        type: 'error',
        message: '归档失败'
      })
      console.error('归档失败:', error)
    }
  }).catch(() => {})
}

// 删除告警历史
const handleHistoryDelete = async (row: any) => {
  ElMessageBox.confirm(
    `确定要删除该告警记录吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await alertHistoryApi.deleteAlertHistory(row.id)
      if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
        ElMessage({
          type: 'success',
          message: '删除成功'
        })
        fetchAlertHistory()
      }
    } catch (error) {
      ElMessage({
        type: 'error',
        message: '删除失败'
      })
      console.error('删除失败:', error)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchAlertRules()
  fetchGreenhouses()
  fetchAlertHistory()
})
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>告警管理</h1>
      <p>管理温室告警规则和告警历史记录</p>
    </div>

    <div class="content-wrapper">
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 告警规则标签页 -->
        <el-tab-pane label="告警规则" name="rules">
          <div class="search-section">
            <el-form :inline="true" :model="searchForm" class="search-form">
              <el-form-item label="温室">
                <el-select v-model="searchForm.greenhouseId" placeholder="全部" clearable style="width: 150px">
                  <el-option label="通用规则" value="" />
                  <el-option
                    v-for="gh in greenhouses"
                    :key="gh.id"
                    :label="gh.greenhouseName || `${gh.id}号温室`"
                    :value="gh.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="规则名称">
                <el-input v-model="searchForm.ruleName" placeholder="请输入规则名称" clearable style="width: 150px" />
              </el-form-item>
              <el-form-item label="规则编码">
                <el-input v-model="searchForm.ruleCode" placeholder="请输入规则编码" clearable style="width: 150px" />
              </el-form-item>
              <el-form-item label="数据类型">
                <el-select v-model="searchForm.dataType" placeholder="全部" clearable style="width: 120px">
                  <el-option
                    v-for="opt in dataTypeOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="告警级别">
                <el-select v-model="searchForm.alertLevel" placeholder="全部" clearable style="width: 120px">
                  <el-option
                    v-for="opt in alertLevelOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="searchForm.isEnabled" placeholder="全部" clearable style="width: 120px">
                  <el-option label="已启用" :value="1" />
                  <el-option label="已禁用" :value="0" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSearch">查询</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="action-section">
            <el-button type="primary" @click="handleAdd">新增规则</el-button>
          </div>

          <div class="table-section">
        <el-table :data="alertRules" v-loading="loading" border stripe>
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="ruleName" label="规则名称" min-width="150" />
          <el-table-column prop="ruleCode" label="规则编码" min-width="150" />
          <el-table-column label="温室" min-width="120">
            <template #default="{ row }">
              <el-tag v-if="!row.greenhouseId" type="info">通用规则</el-tag>
              <span v-else>{{ row.greenhouseName || `${row.greenhouseId}号温室` }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数据类型" min-width="100">
            <template #default="{ row }">
              {{ getDataTypeText(row.dataType) }}
            </template>
          </el-table-column>
          <el-table-column label="告警级别" width="80">
            <template #default="{ row }">
              <el-tag :type="getAlertLevelTag(row.alertLevel).type">
                {{ getAlertLevelTag(row.alertLevel).text }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="阈值范围" min-width="150">
            <template #default="{ row }">
              <span v-if="row.enableMin && row.enableMax && row.minValue !== null && row.maxValue !== null">
                {{ row.minValue || 0 }} - {{ row.maxValue || 0 }}
              </span>
              <span v-else-if="row.enableMin || row.maxValue === null">
                &gt; {{ row.minValue || 0 }}
              </span>
              <span v-else-if="row.enableMax || row.minValue === null">
                &lt; {{ row.maxValue || 0 }}
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="getEnabledType(row.isEnabled)">
                {{ getEnabledStatus(row.isEnabled) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="warning" @click="handleToggle(row)">
                {{ row.isEnabled ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
        </el-tab-pane>

        <!-- 告警历史标签页 -->
        <el-tab-pane label="告警历史" name="history">
          <div class="search-section">
            <el-form :inline="true" :model="historySearchForm" class="search-form">
              <el-form-item label="温室">
                <el-select v-model="historySearchForm.greenhouseId" placeholder="全部" clearable style="width: 150px">
                  <el-option
                    v-for="gh in greenhouses"
                    :key="gh.id"
                    :label="gh.greenhouseName || `${gh.id}号温室`"
                    :value="gh.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="告警标题">
                <el-input v-model="historySearchForm.alertTitle" placeholder="请输入告警标题" clearable style="width: 150px" />
              </el-form-item>
              <el-form-item label="告警级别">
                <el-select v-model="historySearchForm.alertLevel" placeholder="全部" clearable style="width: 120px">
                  <el-option
                    v-for="opt in alertLevelOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="状态">
                <el-select v-model="historySearchForm.status" placeholder="全部" clearable style="width: 120px">
                  <el-option
                    v-for="opt in alertStatusOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="开始时间">
                <el-date-picker
                  v-model="historySearchForm.startTime"
                  type="datetime"
                  placeholder="选择开始时间"
                  style="width: 180px"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                />
              </el-form-item>
              <el-form-item label="结束时间">
                <el-date-picker
                  v-model="historySearchForm.endTime"
                  type="datetime"
                  placeholder="选择结束时间"
                  style="width: 180px"
                  value-format="YYYY-MM-DDTHH:mm:ss"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleHistorySearch">查询</el-button>
                <el-button @click="handleHistoryReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="table-section">
            <el-table :data="alertHistory" v-loading="historyLoading" border stripe>
              <el-table-column type="expand" width="50">
                <template #default="{ row }">
                  <div class="expand-content">
                    <el-descriptions :column="2" border>
                      <el-descriptions-item label="告警编码">{{ row.alertCode }}</el-descriptions-item>
                      <el-descriptions-item label="数据类型">{{ getDataTypeText(row.dataType) }}</el-descriptions-item>
                      <el-descriptions-item label="当前值">{{ row.currentValue }}</el-descriptions-item>
                      <el-descriptions-item label="阈值">{{ row.thresholdValue }}</el-descriptions-item>
                      <el-descriptions-item label="标准值">{{ row.standardValue }}</el-descriptions-item>
                      <el-descriptions-item label="偏差率">{{ row.deviationRate }}%</el-descriptions-item>
                      <el-descriptions-item label="告警类型">{{ row.alertType }}</el-descriptions-item>
                      <el-descriptions-item label="通知渠道">{{ row.notifyChannels }}</el-descriptions-item>
                      <el-descriptions-item label="确认人">{{ row.confirmBy || '-' }}</el-descriptions-item>
                      <el-descriptions-item label="确认时间">{{ formatDateTime(row.confirmTime) }}</el-descriptions-item>
                      <el-descriptions-item label="处理人">{{ row.handleBy || '-' }}</el-descriptions-item>
                      <el-descriptions-item label="处理时间">{{ formatDateTime(row.handleTime) }}</el-descriptions-item>
                      <el-descriptions-item label="解决人">{{ row.resolveBy || '-' }}</el-descriptions-item>
                      <el-descriptions-item label="解决时间">{{ formatDateTime(row.recoverTime) }}</el-descriptions-item>
                      <el-descriptions-item label="处理方法">{{ row.handleMethod || '-' }}</el-descriptions-item>
                      <el-descriptions-item label="解决方法">{{ row.resolveMethod || '-' }}</el-descriptions-item>
                      <el-descriptions-item label="处理结果" :span="2">{{ row.handleResult || '-' }}</el-descriptions-item>
                      <el-descriptions-item label="解决备注" :span="2">{{ row.resolveRemark || '-' }}</el-descriptions-item>
                      <el-descriptions-item label="快照数据" :span="2">
                        <pre v-if="row.snapshotData">{{ formatSnapshotData(row.snapshotData) }}</pre>
                        <span v-else>-</span>
                      </el-descriptions-item>
                    </el-descriptions>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="id" label="ID" width="60" />
              <el-table-column prop="alertTitle" label="告警标题" min-width="180" show-overflow-tooltip />
              <el-table-column label="温室" min-width="100">
                <template #default="{ row }">
                  {{ row.greenhouseId }}号温室
                </template>
              </el-table-column>
              <el-table-column label="告警级别" width="90">
                <template #default="{ row }">
                  <el-tag :type="getAlertLevelTag(row.alertLevel).type" size="small">
                    {{ getAlertLevelTag(row.alertLevel).text }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-tag :type="getAlertStatusTag(row.status).type" size="small">
                    {{ getAlertStatusTag(row.status).text }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="alertContent" label="告警内容" min-width="200" show-overflow-tooltip />
              <el-table-column label="触发时间" width="150">
                <template #default="{ row }">
                  {{ formatDateTime(row.triggerTime) }}
                </template>
              </el-table-column>
              <el-table-column label="持续时间" width="90">
                <template #default="{ row }">
                  {{ formatDuration(row.duration) }}
                </template>
              </el-table-column>
              <el-table-column label="归档" width="60" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.isArchived ? 'success' : 'info'" size="small">
                    {{ row.isArchived ? '已归档' : '未归档' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button v-if="row.status === 'unconfirmed'" link type="primary" size="small" @click="openHistoryDialog(row, 'confirm')">确认</el-button>
                  <el-button v-if="row.status === 'confirmed'" link type="warning" size="small" @click="openHistoryDialog(row, 'handle')">处理</el-button>
                  <el-button v-if="row.status === 'handling'" link type="success" size="small" @click="openHistoryDialog(row, 'resolve')">解决</el-button>
                  <el-button v-if="row.status === 'unconfirmed'" link type="info" size="small" @click="openHistoryDialog(row, 'falseAlarm')">误报</el-button>
                  <el-button v-if="!row.isArchived && (row.status === 'resolved' || row.status === 'ignored')" link type="info" size="small" @click="handleArchive(row)">归档</el-button>
                  <el-button link type="danger" size="small" @click="handleHistoryDelete(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="pagination">
              <el-pagination
                v-model:current-page="historyCurrentPage"
                v-model:page-size="historyPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="historyTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="handleHistoryPageChange"
                @size-change="handleHistorySizeChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 告警规则对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="ruleForm"
        :rules="formRules"
        label-width="120px"
        label-position="right"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规则编码" prop="ruleCode">
              <el-input v-model="ruleForm.ruleCode" placeholder="请输入规则编码" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="温室" prop="greenhouseId">
              <el-select v-model="ruleForm.greenhouseId" placeholder="选择温室（不选则为通用规则）" clearable style="width: 100%">
                <el-option
                  v-for="gh in greenhouses"
                  :key="gh.id"
                  :label="gh.greenhouseName || `${gh.id}号温室`"
                  :value="gh.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据类型" prop="dataType">
              <el-select v-model="ruleForm.dataType" placeholder="请选择数据类型" style="width: 100%">
                <el-option
                  v-for="opt in dataTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="告警级别" prop="alertLevel">
              <el-select v-model="ruleForm.alertLevel" placeholder="请选择告警级别" style="width: 100%">
                <el-option
                  v-for="opt in alertLevelOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态">
              <el-switch v-model="ruleForm.isEnabled" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>阈值设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="启用最小值">
              <el-switch v-model="ruleForm.enableMin" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="最小值">
              <el-input-number v-model="ruleForm.minValue" :disabled="!ruleForm.enableMin" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="启用最大值">
              <el-switch v-model="ruleForm.enableMax" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="最大值">
              <el-input-number v-model="ruleForm.maxValue" :disabled="!ruleForm.enableMax" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="目标值">
              <el-input-number v-model="ruleForm.targetValue" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="容差范围">
              <el-input-number v-model="ruleForm.tolerance" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>告警设置</el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="持续时长(秒)">
              <el-input-number v-model="ruleForm.alertDuration" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通知间隔(秒)">
              <el-input-number v-model="ruleForm.alertInterval" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="通知方式">
              <el-select v-model="ruleForm.notifyType" placeholder="请选择通知方式" style="width: 100%">
                <el-option
                  v-for="opt in notifyTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="自动处理">
              <el-switch v-model="ruleForm.autoHandle" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="告警消息">
          <el-input v-model="ruleForm.alertMessage" type="textarea" :rows="2" placeholder="请输入告警消息模板" />
        </el-form-item>

        <el-form-item label="生效时间段">
          <el-input v-model="ruleForm.effectiveTime" placeholder="例如：00:00-23:59" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="ruleForm.remark" type="textarea" :rows="2" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 告警历史处理对话框 -->
    <el-dialog
      v-model="historyDialogVisible"
      :title="historyDialogTitle"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px" label-position="right">
        <!-- 确认告警 -->
        <template v-if="historyDialogType === 'confirm'">
          <el-form-item label="确认人" required>
            <el-input v-model="historyForm.operator" placeholder="请输入确认人姓名" />
          </el-form-item>
        </template>

        <!-- 开始处理 -->
        <template v-if="historyDialogType === 'handle'">
          <el-form-item label="处理人" required>
            <el-input v-model="historyForm.operator" placeholder="请输入处理人姓名" />
          </el-form-item>
          <el-form-item label="处理方式" required>
            <el-select v-model="historyForm.method" placeholder="请选择处理方式" style="width: 100%">
              <el-option
                v-for="opt in handleMethodOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="处理动作">
            <el-input v-model="historyForm.action" placeholder="例如：开启风扇、调节温度等" />
          </el-form-item>
          <el-form-item label="处理结果">
            <el-input v-model="historyForm.result" type="textarea" :rows="2" placeholder="请输入处理结果" />
          </el-form-item>
        </template>

        <!-- 解决告警 -->
        <template v-if="historyDialogType === 'resolve'">
          <el-form-item label="解决人" required>
            <el-input v-model="historyForm.operator" placeholder="请输入解决人姓名" />
          </el-form-item>
          <el-form-item label="解决方式" required>
            <el-select v-model="historyForm.method" placeholder="请选择解决方式" style="width: 100%">
              <el-option
                v-for="opt in resolveMethodOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="historyForm.remark" type="textarea" :rows="3" placeholder="请输入解决备注" />
          </el-form-item>
        </template>

        <!-- 标记误报 -->
        <template v-if="historyDialogType === 'falseAlarm'">
          <el-form-item label="误报原因" required>
            <el-input v-model="historyForm.remark" type="textarea" :rows="4" placeholder="请输入误报原因，例如：传感器故障、数据异常等" />
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <el-button @click="historyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleHistorySubmit">确定</el-button>
      </template>
    </el-dialog>
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

.search-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.search-form {
  margin: 0;
}

.action-section {
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.table-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.expand-content {
  padding: 20px;
  background-color: #f5f5f5;
}

.expand-content pre {
  margin: 0;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .search-form {
    display: block;
  }
  
  .search-form .el-form-item {
    display: block;
    margin-right: 0;
  }
}
</style>
