import { ref, onMounted, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAlertRuleApi } from '/@/api/alertRule';
import { useAlertHistoryApi } from '/@/api/alertHistory';
import { useGreenhouseApi } from '/@/api/greenhouse';
const alertRuleApi = useAlertRuleApi();
const alertHistoryApi = useAlertHistoryApi();
const greenhouseApi = useGreenhouseApi();
// 当前激活的标签页
const activeTab = ref('rules');
// 告警规则相关
const loading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('新增告警规则');
const isEdit = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const alertRules = ref([]);
const greenhouses = ref([]);
const searchForm = reactive({
    greenhouseId: '',
    ruleName: '',
    ruleCode: '',
    dataType: '',
    alertLevel: '',
    isEnabled: ''
});
// 告警历史相关
const historyLoading = ref(false);
const historyDialogVisible = ref(false);
const historyDialogTitle = ref('处理告警');
const historyDialogType = ref(''); // confirm, handle, resolve, falseAlarm
const historyCurrentPage = ref(1);
const historyPageSize = ref(10);
const historyTotal = ref(0);
const alertHistory = ref([]);
const currentHistoryRow = ref(null);
const historySearchForm = reactive({
    greenhouseId: '',
    alertTitle: '',
    alertLevel: '',
    status: '',
    startTime: '',
    endTime: ''
});
const historyForm = reactive({
    operator: '',
    method: '',
    action: '',
    result: '',
    remark: ''
});
const dataTypeOptions = [
    { label: '温度', value: 'temperature' },
    { label: '空气湿度', value: 'airHumidity' },
    { label: '土壤湿度', value: 'soilHumidity' },
    { label: 'CO2浓度', value: 'co2Concentration' },
    { label: '土壤pH', value: 'soilPh' },
    { label: '光照强度', value: 'lightIntensity' }
];
const alertLevelOptions = [
    { label: '提示', value: 'info' },
    { label: '一般警告', value: 'warning' },
    { label: '严重警告', value: 'error' },
    { label: '紧急', value: 'critical' }
];
const notifyTypeOptions = [
    { label: '系统通知', value: 'system' },
    { label: '邮件', value: 'email' },
    { label: '短信', value: 'sms' },
    { label: 'APP推送', value: 'app' }
];
// 告警历史状态选项
const alertStatusOptions = [
    { label: '未确认', value: 'unconfirmed' },
    { label: '已确认', value: 'confirmed' },
    { label: '处理中', value: 'handling' },
    { label: '已解决', value: 'resolved' },
    { label: '已忽略', value: 'ignored' },
    { label: '已升级', value: 'escalated' }
];
// 处理方法选项
const handleMethodOptions = [
    { label: '人工处理', value: 'manual' },
    { label: '自动处理', value: 'auto' },
    { label: '远程控制', value: 'remote' }
];
// 解决方法选项
const resolveMethodOptions = [
    { label: '人工处理', value: 'manual_handle' },
    { label: '自动恢复', value: 'auto_recover' },
    { label: '系统修复', value: 'system_fix' }
];
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
});
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
};
const formRef = ref();
const fetchAlertRules = async () => {
    loading.value = true;
    try {
        const params = {
            pageNum: currentPage.value,
            pageSize: pageSize.value
        };
        if (searchForm.greenhouseId)
            params.greenhouseId = searchForm.greenhouseId;
        if (searchForm.ruleName)
            params.ruleName = searchForm.ruleName;
        if (searchForm.ruleCode)
            params.ruleCode = searchForm.ruleCode;
        if (searchForm.dataType)
            params.dataType = searchForm.dataType;
        if (searchForm.alertLevel)
            params.alertLevel = searchForm.alertLevel;
        if (searchForm.isEnabled !== '')
            params.isEnabled = searchForm.isEnabled;
        const response = await alertRuleApi.getAlertRuleList(params);
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const data = response.data.records || response.data.list || response.data;
            total.value = response.data.total || data.length;
            alertRules.value = data;
        }
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '获取告警规则失败'
        });
        console.error('获取告警规则失败:', error);
    }
    finally {
        loading.value = false;
    }
};
const fetchGreenhouses = async () => {
    try {
        const response = await greenhouseApi.getGreenhouseList({});
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const data = response.data.records || response.data.list || response.data;
            greenhouses.value = data;
        }
    }
    catch (error) {
        console.error('获取温室列表失败:', error);
    }
};
const handleSearch = () => {
    currentPage.value = 1;
    fetchAlertRules();
};
const handleReset = () => {
    searchForm.greenhouseId = '';
    searchForm.ruleName = '';
    searchForm.ruleCode = '';
    searchForm.dataType = '';
    searchForm.alertLevel = '';
    searchForm.isEnabled = '';
    currentPage.value = 1;
    fetchAlertRules();
};
const handleAdd = () => {
    dialogTitle.value = '新增告警规则';
    isEdit.value = false;
    resetForm();
    dialogVisible.value = true;
};
const handleEdit = (row) => {
    dialogTitle.value = '编辑告警规则';
    isEdit.value = true;
    Object.assign(ruleForm, row);
    dialogVisible.value = true;
};
const handleDelete = (row) => {
    ElMessageBox.confirm(`确定要删除告警规则"${row.ruleName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            const response = await alertRuleApi.deleteAlertRule(row.id);
            if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
                ElMessage({
                    type: 'success',
                    message: '删除成功'
                });
                fetchAlertRules();
            }
        }
        catch (error) {
            ElMessage({
                type: 'error',
                message: '删除失败'
            });
            console.error('删除失败:', error);
        }
    }).catch(() => { });
};
const handleToggle = async (row) => {
    try {
        const response = await alertRuleApi.toggleAlertRule(row.id);
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            ElMessage({
                type: 'success',
                message: row.isEnabled ? '已禁用' : '已启用'
            });
            fetchAlertRules();
        }
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '操作失败'
        });
        console.error('操作失败:', error);
    }
};
const handleSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const data = { ...ruleForm };
                if (data.greenhouseId === '') {
                    data.greenhouseId = null;
                }
                let response;
                if (isEdit.value) {
                    response = await alertRuleApi.updateAlertRule(data);
                }
                else {
                    response = await alertRuleApi.addAlertRule(data);
                }
                if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
                    ElMessage({
                        type: 'success',
                        message: isEdit.value ? '更新成功' : '新增成功'
                    });
                    dialogVisible.value = false;
                    fetchAlertRules();
                }
            }
            catch (error) {
                ElMessage({
                    type: 'error',
                    message: isEdit.value ? '更新失败' : '新增失败'
                });
                console.error('提交失败:', error);
            }
        }
    });
};
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
    });
    if (formRef.value) {
        formRef.value.clearValidate();
    }
};
const handleCancel = () => {
    dialogVisible.value = false;
    resetForm();
};
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchAlertRules();
};
const handleSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchAlertRules();
};
const getAlertLevelTag = (level) => {
    const map = {
        info: { type: 'info', text: '提示' },
        warning: { type: 'warning', text: '一般警告' },
        error: { type: 'danger', text: '严重警告' },
        critical: { type: 'danger', text: '紧急' }
    };
    // 去除可能的尾随点号
    const cleanLevel = level?.replace(/\.$/, '') || '';
    return map[cleanLevel] || { type: '', text: cleanLevel };
};
const getEnabledStatus = (isEnabled) => {
    const cleanValue = String(isEnabled || '').replace(/\.$/, '');
    return Number(cleanValue) ? '已启用' : '已禁用';
};
const getEnabledType = (isEnabled) => {
    const cleanValue = String(isEnabled || '').replace(/\.$/, '');
    return Number(cleanValue) ? 'success' : 'info';
};
const getDataTypeText = (type) => {
    const option = dataTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
};
// 获取告警状态标签
const getAlertStatusTag = (status) => {
    const map = {
        unconfirmed: { type: 'info', text: '未确认' },
        confirmed: { type: 'warning', text: '已确认' },
        handling: { type: 'warning', text: '处理中' },
        resolved: { type: 'success', text: '已解决' },
        ignored: { type: 'info', text: '已忽略' },
        escalated: { type: 'danger', text: '已升级' }
    };
    return map[status] || { type: '', text: status };
};
// 格式化日期时间
const formatDateTime = (dateStr) => {
    if (!dateStr)
        return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN');
};
// 格式化持续时间
const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0)
        return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}小时${minutes}分钟`;
    }
    else if (minutes > 0) {
        return `${minutes}分钟${secs}秒`;
    }
    else {
        return `${secs}秒`;
    }
};
// 格式化快照数据
const formatSnapshotData = (snapshotData) => {
    if (!snapshotData)
        return '-';
    try {
        const data = typeof snapshotData === 'string' ? JSON.parse(snapshotData) : snapshotData;
        const map = {
            'co2': 'CO2浓度',
            'light': '光照强度',
            'temperature': '温度',
            'air_humidity': '空气湿度',
            'soil_humidity': '土壤湿度',
            'soil_ph': '土壤pH'
        };
        return Object.entries(data)
            .map(([key, value]) => `${map[key] || key}: ${value}`)
            .join(', ');
    }
    catch (e) {
        return String(snapshotData);
    }
};
// 获取告警历史列表
const fetchAlertHistory = async () => {
    historyLoading.value = true;
    try {
        const params = {
            pageNum: historyCurrentPage.value,
            pageSize: historyPageSize.value
        };
        if (historySearchForm.greenhouseId)
            params.greenhouseId = historySearchForm.greenhouseId;
        if (historySearchForm.alertTitle)
            params.alertTitle = historySearchForm.alertTitle;
        if (historySearchForm.alertLevel)
            params.alertLevel = historySearchForm.alertLevel;
        if (historySearchForm.status)
            params.status = historySearchForm.status;
        if (historySearchForm.startTime)
            params.startTime = historySearchForm.startTime;
        if (historySearchForm.endTime)
            params.endTime = historySearchForm.endTime;
        const response = await alertHistoryApi.getAlertHistoryList(params);
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const data = response.data.records || response.data.list || response.data;
            historyTotal.value = response.data.total || data.length;
            alertHistory.value = data;
        }
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '获取告警历史失败'
        });
        console.error('获取告警历史失败:', error);
    }
    finally {
        historyLoading.value = false;
    }
};
// 告警历史搜索
const handleHistorySearch = () => {
    historyCurrentPage.value = 1;
    fetchAlertHistory();
};
// 告警历史重置
const handleHistoryReset = () => {
    historySearchForm.greenhouseId = '';
    historySearchForm.alertTitle = '';
    historySearchForm.alertLevel = '';
    historySearchForm.status = '';
    historySearchForm.startTime = '';
    historySearchForm.endTime = '';
    historyCurrentPage.value = 1;
    fetchAlertHistory();
};
// 告警历史分页
const handleHistoryPageChange = (page) => {
    historyCurrentPage.value = page;
    fetchAlertHistory();
};
const handleHistorySizeChange = (size) => {
    historyPageSize.value = size;
    historyCurrentPage.value = 1;
    fetchAlertHistory();
};
// 打开处理对话框
const openHistoryDialog = (row, type) => {
    currentHistoryRow.value = row;
    historyDialogType.value = type;
    historyForm.operator = '';
    historyForm.method = '';
    historyForm.action = '';
    historyForm.result = '';
    historyForm.remark = '';
    switch (type) {
        case 'confirm':
            historyDialogTitle.value = '确认告警';
            break;
        case 'handle':
            historyDialogTitle.value = '开始处理';
            break;
        case 'resolve':
            historyDialogTitle.value = '解决告警';
            break;
        case 'falseAlarm':
            historyDialogTitle.value = '标记为误报';
            break;
    }
    historyDialogVisible.value = true;
};
// 提交告警处理
const handleHistorySubmit = async () => {
    if (!currentHistoryRow.value)
        return;
    const id = currentHistoryRow.value.id;
    let response;
    try {
        switch (historyDialogType.value) {
            case 'confirm':
                if (!historyForm.operator) {
                    ElMessage({ type: 'warning', message: '请输入确认人' });
                    return;
                }
                response = await alertHistoryApi.confirmAlert(id, historyForm.operator);
                break;
            case 'handle':
                if (!historyForm.operator || !historyForm.method) {
                    ElMessage({ type: 'warning', message: '请填写完整信息' });
                    return;
                }
                response = await alertHistoryApi.handleAlert(id, {
                    handleBy: historyForm.operator,
                    handleMethod: historyForm.method,
                    handleAction: historyForm.action,
                    handleResult: historyForm.result
                });
                break;
            case 'resolve':
                if (!historyForm.operator || !historyForm.method) {
                    ElMessage({ type: 'warning', message: '请填写完整信息' });
                    return;
                }
                response = await alertHistoryApi.resolveAlert(id, {
                    resolveBy: historyForm.operator,
                    resolveMethod: historyForm.method,
                    resolveRemark: historyForm.remark
                });
                break;
            case 'falseAlarm':
                if (!historyForm.remark) {
                    ElMessage({ type: 'warning', message: '请输入误报原因' });
                    return;
                }
                response = await alertHistoryApi.markFalseAlarm(id, historyForm.remark);
                break;
        }
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            ElMessage({
                type: 'success',
                message: '操作成功'
            });
            historyDialogVisible.value = false;
            fetchAlertHistory();
        }
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '操作失败'
        });
        console.error('操作失败:', error);
    }
};
// 归档告警
const handleArchive = async (row) => {
    ElMessageBox.confirm(`确定要归档该告警记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            const response = await alertHistoryApi.archiveAlert(row.id);
            if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
                ElMessage({
                    type: 'success',
                    message: '归档成功'
                });
                fetchAlertHistory();
            }
        }
        catch (error) {
            ElMessage({
                type: 'error',
                message: '归档失败'
            });
            console.error('归档失败:', error);
        }
    }).catch(() => { });
};
// 删除告警历史
const handleHistoryDelete = async (row) => {
    ElMessageBox.confirm(`确定要删除该告警记录吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(async () => {
        try {
            const response = await alertHistoryApi.deleteAlertHistory(row.id);
            if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
                ElMessage({
                    type: 'success',
                    message: '删除成功'
                });
                fetchAlertHistory();
            }
        }
        catch (error) {
            ElMessage({
                type: 'error',
                message: '删除失败'
            });
            console.error('删除失败:', error);
        }
    }).catch(() => { });
};
onMounted(() => {
    fetchAlertRules();
    fetchGreenhouses();
    fetchAlertHistory();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-content']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-container" },
});
/** @type {__VLS_StyleScopedClasses['page-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "content-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
    type: "border-card",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
    type: "border-card",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "告警规则",
    name: "rules",
}));
const __VLS_8 = __VLS_7({
    label: "告警规则",
    name: "rules",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-section" },
});
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    inline: (true),
    model: (__VLS_ctx.searchForm),
    ...{ class: "search-form" },
}));
const __VLS_14 = __VLS_13({
    inline: (true),
    model: (__VLS_ctx.searchForm),
    ...{ class: "search-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
const { default: __VLS_17 } = __VLS_15.slots;
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "温室",
}));
const __VLS_20 = __VLS_19({
    label: "温室",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.searchForm.greenhouseId),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.searchForm.greenhouseId),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const { default: __VLS_29 } = __VLS_27.slots;
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    label: "通用规则",
    value: "",
}));
const __VLS_32 = __VLS_31({
    label: "通用规则",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
for (const [gh] of __VLS_vFor((__VLS_ctx.greenhouses))) {
    let __VLS_35;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
        key: (gh.id),
        label: (gh.greenhouseName || `${gh.id}号温室`),
        value: (gh.id),
    }));
    const __VLS_37 = __VLS_36({
        key: (gh.id),
        label: (gh.greenhouseName || `${gh.id}号温室`),
        value: (gh.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_36));
    // @ts-ignore
    [activeTab, searchForm, searchForm, greenhouses,];
}
// @ts-ignore
[];
var __VLS_27;
// @ts-ignore
[];
var __VLS_21;
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    label: "规则名称",
}));
const __VLS_42 = __VLS_41({
    label: "规则名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_45 } = __VLS_43.slots;
let __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    modelValue: (__VLS_ctx.searchForm.ruleName),
    placeholder: "请输入规则名称",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_48 = __VLS_47({
    modelValue: (__VLS_ctx.searchForm.ruleName),
    placeholder: "请输入规则名称",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
// @ts-ignore
[searchForm,];
var __VLS_43;
let __VLS_51;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
    label: "规则编码",
}));
const __VLS_53 = __VLS_52({
    label: "规则编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_52));
const { default: __VLS_56 } = __VLS_54.slots;
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    modelValue: (__VLS_ctx.searchForm.ruleCode),
    placeholder: "请输入规则编码",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_59 = __VLS_58({
    modelValue: (__VLS_ctx.searchForm.ruleCode),
    placeholder: "请输入规则编码",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
// @ts-ignore
[searchForm,];
var __VLS_54;
let __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    label: "数据类型",
}));
const __VLS_64 = __VLS_63({
    label: "数据类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
const { default: __VLS_67 } = __VLS_65.slots;
let __VLS_68;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.searchForm.dataType),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.searchForm.dataType),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
const { default: __VLS_73 } = __VLS_71.slots;
for (const [opt] of __VLS_vFor((__VLS_ctx.dataTypeOptions))) {
    let __VLS_74;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }));
    const __VLS_76 = __VLS_75({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    // @ts-ignore
    [searchForm, dataTypeOptions,];
}
// @ts-ignore
[];
var __VLS_71;
// @ts-ignore
[];
var __VLS_65;
let __VLS_79;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
    label: "告警级别",
}));
const __VLS_81 = __VLS_80({
    label: "告警级别",
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
const { default: __VLS_84 } = __VLS_82.slots;
let __VLS_85;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    modelValue: (__VLS_ctx.searchForm.alertLevel),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_87 = __VLS_86({
    modelValue: (__VLS_ctx.searchForm.alertLevel),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
const { default: __VLS_90 } = __VLS_88.slots;
for (const [opt] of __VLS_vFor((__VLS_ctx.alertLevelOptions))) {
    let __VLS_91;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }));
    const __VLS_93 = __VLS_92({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_92));
    // @ts-ignore
    [searchForm, alertLevelOptions,];
}
// @ts-ignore
[];
var __VLS_88;
// @ts-ignore
[];
var __VLS_82;
let __VLS_96;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
    label: "状态",
}));
const __VLS_98 = __VLS_97({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
const { default: __VLS_101 } = __VLS_99.slots;
let __VLS_102;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
    modelValue: (__VLS_ctx.searchForm.isEnabled),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_104 = __VLS_103({
    modelValue: (__VLS_ctx.searchForm.isEnabled),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
const { default: __VLS_107 } = __VLS_105.slots;
let __VLS_108;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
    label: "已启用",
    value: (1),
}));
const __VLS_110 = __VLS_109({
    label: "已启用",
    value: (1),
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
let __VLS_113;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    label: "已禁用",
    value: (0),
}));
const __VLS_115 = __VLS_114({
    label: "已禁用",
    value: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
// @ts-ignore
[searchForm,];
var __VLS_105;
// @ts-ignore
[];
var __VLS_99;
let __VLS_118;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({}));
const __VLS_120 = __VLS_119({}, ...__VLS_functionalComponentArgsRest(__VLS_119));
const { default: __VLS_123 } = __VLS_121.slots;
let __VLS_124;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_126 = __VLS_125({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
let __VLS_129;
const __VLS_130 = ({ click: {} },
    { onClick: (__VLS_ctx.handleSearch) });
const { default: __VLS_131 } = __VLS_127.slots;
// @ts-ignore
[handleSearch,];
var __VLS_127;
var __VLS_128;
let __VLS_132;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
    ...{ 'onClick': {} },
}));
const __VLS_134 = __VLS_133({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
let __VLS_137;
const __VLS_138 = ({ click: {} },
    { onClick: (__VLS_ctx.handleReset) });
const { default: __VLS_139 } = __VLS_135.slots;
// @ts-ignore
[handleReset,];
var __VLS_135;
var __VLS_136;
// @ts-ignore
[];
var __VLS_121;
// @ts-ignore
[];
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-section" },
});
/** @type {__VLS_StyleScopedClasses['action-section']} */ ;
let __VLS_140;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent1(__VLS_140, new __VLS_140({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_142 = __VLS_141({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
let __VLS_145;
const __VLS_146 = ({ click: {} },
    { onClick: (__VLS_ctx.handleAdd) });
const { default: __VLS_147 } = __VLS_143.slots;
// @ts-ignore
[handleAdd,];
var __VLS_143;
var __VLS_144;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_148;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent1(__VLS_148, new __VLS_148({
    data: (__VLS_ctx.alertRules),
    border: true,
    stripe: true,
}));
const __VLS_150 = __VLS_149({
    data: (__VLS_ctx.alertRules),
    border: true,
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_153 } = __VLS_151.slots;
let __VLS_154;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
    prop: "id",
    label: "ID",
    width: "80",
}));
const __VLS_156 = __VLS_155({
    prop: "id",
    label: "ID",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
let __VLS_159;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({
    prop: "ruleName",
    label: "规则名称",
    minWidth: "150",
}));
const __VLS_161 = __VLS_160({
    prop: "ruleName",
    label: "规则名称",
    minWidth: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
let __VLS_164;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
    prop: "ruleCode",
    label: "规则编码",
    minWidth: "150",
}));
const __VLS_166 = __VLS_165({
    prop: "ruleCode",
    label: "规则编码",
    minWidth: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
let __VLS_169;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
    label: "温室",
    minWidth: "120",
}));
const __VLS_171 = __VLS_170({
    label: "温室",
    minWidth: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
const { default: __VLS_174 } = __VLS_172.slots;
{
    const { default: __VLS_175 } = __VLS_172.slots;
    const [{ row }] = __VLS_vSlot(__VLS_175);
    if (!row.greenhouseId) {
        let __VLS_176;
        /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
        elTag;
        // @ts-ignore
        const __VLS_177 = __VLS_asFunctionalComponent1(__VLS_176, new __VLS_176({
            type: "info",
        }));
        const __VLS_178 = __VLS_177({
            type: "info",
        }, ...__VLS_functionalComponentArgsRest(__VLS_177));
        const { default: __VLS_181 } = __VLS_179.slots;
        // @ts-ignore
        [alertRules, vLoading, loading,];
        var __VLS_179;
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (row.greenhouseName || `${row.greenhouseId}号温室`);
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_172;
let __VLS_182;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_183 = __VLS_asFunctionalComponent1(__VLS_182, new __VLS_182({
    label: "数据类型",
    minWidth: "100",
}));
const __VLS_184 = __VLS_183({
    label: "数据类型",
    minWidth: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_183));
const { default: __VLS_187 } = __VLS_185.slots;
{
    const { default: __VLS_188 } = __VLS_185.slots;
    const [{ row }] = __VLS_vSlot(__VLS_188);
    (__VLS_ctx.getDataTypeText(row.dataType));
    // @ts-ignore
    [getDataTypeText,];
}
// @ts-ignore
[];
var __VLS_185;
let __VLS_189;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_190 = __VLS_asFunctionalComponent1(__VLS_189, new __VLS_189({
    label: "告警级别",
    width: "80",
}));
const __VLS_191 = __VLS_190({
    label: "告警级别",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_190));
const { default: __VLS_194 } = __VLS_192.slots;
{
    const { default: __VLS_195 } = __VLS_192.slots;
    const [{ row }] = __VLS_vSlot(__VLS_195);
    let __VLS_196;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
        type: (__VLS_ctx.getAlertLevelTag(row.alertLevel).type),
    }));
    const __VLS_198 = __VLS_197({
        type: (__VLS_ctx.getAlertLevelTag(row.alertLevel).type),
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    const { default: __VLS_201 } = __VLS_199.slots;
    (__VLS_ctx.getAlertLevelTag(row.alertLevel).text);
    // @ts-ignore
    [getAlertLevelTag, getAlertLevelTag,];
    var __VLS_199;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_192;
let __VLS_202;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_203 = __VLS_asFunctionalComponent1(__VLS_202, new __VLS_202({
    label: "阈值范围",
    minWidth: "150",
}));
const __VLS_204 = __VLS_203({
    label: "阈值范围",
    minWidth: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_203));
const { default: __VLS_207 } = __VLS_205.slots;
{
    const { default: __VLS_208 } = __VLS_205.slots;
    const [{ row }] = __VLS_vSlot(__VLS_208);
    if (row.enableMin && row.enableMax && row.minValue !== null && row.maxValue !== null) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (row.minValue || 0);
        (row.maxValue || 0);
    }
    else if (row.enableMin || row.maxValue === null) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (row.minValue || 0);
    }
    else if (row.enableMax || row.minValue === null) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (row.maxValue || 0);
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_205;
let __VLS_209;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent1(__VLS_209, new __VLS_209({
    label: "状态",
    width: "80",
}));
const __VLS_211 = __VLS_210({
    label: "状态",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
const { default: __VLS_214 } = __VLS_212.slots;
{
    const { default: __VLS_215 } = __VLS_212.slots;
    const [{ row }] = __VLS_vSlot(__VLS_215);
    let __VLS_216;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
        type: (__VLS_ctx.getEnabledType(row.isEnabled)),
    }));
    const __VLS_218 = __VLS_217({
        type: (__VLS_ctx.getEnabledType(row.isEnabled)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_217));
    const { default: __VLS_221 } = __VLS_219.slots;
    (__VLS_ctx.getEnabledStatus(row.isEnabled));
    // @ts-ignore
    [getEnabledType, getEnabledStatus,];
    var __VLS_219;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_212;
let __VLS_222;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_223 = __VLS_asFunctionalComponent1(__VLS_222, new __VLS_222({
    label: "操作",
    width: "200",
    fixed: "right",
}));
const __VLS_224 = __VLS_223({
    label: "操作",
    width: "200",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_223));
const { default: __VLS_227 } = __VLS_225.slots;
{
    const { default: __VLS_228 } = __VLS_225.slots;
    const [{ row }] = __VLS_vSlot(__VLS_228);
    let __VLS_229;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_230 = __VLS_asFunctionalComponent1(__VLS_229, new __VLS_229({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_231 = __VLS_230({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_230));
    let __VLS_234;
    const __VLS_235 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleEdit(row);
                // @ts-ignore
                [handleEdit,];
            } });
    const { default: __VLS_236 } = __VLS_232.slots;
    // @ts-ignore
    [];
    var __VLS_232;
    var __VLS_233;
    let __VLS_237;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_238 = __VLS_asFunctionalComponent1(__VLS_237, new __VLS_237({
        ...{ 'onClick': {} },
        link: true,
        type: "warning",
    }));
    const __VLS_239 = __VLS_238({
        ...{ 'onClick': {} },
        link: true,
        type: "warning",
    }, ...__VLS_functionalComponentArgsRest(__VLS_238));
    let __VLS_242;
    const __VLS_243 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleToggle(row);
                // @ts-ignore
                [handleToggle,];
            } });
    const { default: __VLS_244 } = __VLS_240.slots;
    (row.isEnabled ? '禁用' : '启用');
    // @ts-ignore
    [];
    var __VLS_240;
    var __VLS_241;
    let __VLS_245;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_246 = __VLS_asFunctionalComponent1(__VLS_245, new __VLS_245({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }));
    const __VLS_247 = __VLS_246({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_246));
    let __VLS_250;
    const __VLS_251 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleDelete(row);
                // @ts-ignore
                [handleDelete,];
            } });
    const { default: __VLS_252 } = __VLS_248.slots;
    // @ts-ignore
    [];
    var __VLS_248;
    var __VLS_249;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_225;
// @ts-ignore
[];
var __VLS_151;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_253;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_254 = __VLS_asFunctionalComponent1(__VLS_253, new __VLS_253({
    ...{ 'onCurrentChange': {} },
    ...{ 'onSizeChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    pageSizes: ([10, 20, 50, 100]),
    total: (__VLS_ctx.total),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_255 = __VLS_254({
    ...{ 'onCurrentChange': {} },
    ...{ 'onSizeChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    pageSizes: ([10, 20, 50, 100]),
    total: (__VLS_ctx.total),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_254));
let __VLS_258;
const __VLS_259 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.handlePageChange) });
const __VLS_260 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.handleSizeChange) });
var __VLS_256;
var __VLS_257;
// @ts-ignore
[currentPage, pageSize, total, handlePageChange, handleSizeChange,];
var __VLS_9;
let __VLS_261;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_262 = __VLS_asFunctionalComponent1(__VLS_261, new __VLS_261({
    label: "告警历史",
    name: "history",
}));
const __VLS_263 = __VLS_262({
    label: "告警历史",
    name: "history",
}, ...__VLS_functionalComponentArgsRest(__VLS_262));
const { default: __VLS_266 } = __VLS_264.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-section" },
});
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
let __VLS_267;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_268 = __VLS_asFunctionalComponent1(__VLS_267, new __VLS_267({
    inline: (true),
    model: (__VLS_ctx.historySearchForm),
    ...{ class: "search-form" },
}));
const __VLS_269 = __VLS_268({
    inline: (true),
    model: (__VLS_ctx.historySearchForm),
    ...{ class: "search-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_268));
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
const { default: __VLS_272 } = __VLS_270.slots;
let __VLS_273;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent1(__VLS_273, new __VLS_273({
    label: "温室",
}));
const __VLS_275 = __VLS_274({
    label: "温室",
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
const { default: __VLS_278 } = __VLS_276.slots;
let __VLS_279;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_280 = __VLS_asFunctionalComponent1(__VLS_279, new __VLS_279({
    modelValue: (__VLS_ctx.historySearchForm.greenhouseId),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_281 = __VLS_280({
    modelValue: (__VLS_ctx.historySearchForm.greenhouseId),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_280));
const { default: __VLS_284 } = __VLS_282.slots;
for (const [gh] of __VLS_vFor((__VLS_ctx.greenhouses))) {
    let __VLS_285;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_286 = __VLS_asFunctionalComponent1(__VLS_285, new __VLS_285({
        key: (gh.id),
        label: (gh.greenhouseName || `${gh.id}号温室`),
        value: (gh.id),
    }));
    const __VLS_287 = __VLS_286({
        key: (gh.id),
        label: (gh.greenhouseName || `${gh.id}号温室`),
        value: (gh.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_286));
    // @ts-ignore
    [greenhouses, historySearchForm, historySearchForm,];
}
// @ts-ignore
[];
var __VLS_282;
// @ts-ignore
[];
var __VLS_276;
let __VLS_290;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_291 = __VLS_asFunctionalComponent1(__VLS_290, new __VLS_290({
    label: "告警标题",
}));
const __VLS_292 = __VLS_291({
    label: "告警标题",
}, ...__VLS_functionalComponentArgsRest(__VLS_291));
const { default: __VLS_295 } = __VLS_293.slots;
let __VLS_296;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_297 = __VLS_asFunctionalComponent1(__VLS_296, new __VLS_296({
    modelValue: (__VLS_ctx.historySearchForm.alertTitle),
    placeholder: "请输入告警标题",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_298 = __VLS_297({
    modelValue: (__VLS_ctx.historySearchForm.alertTitle),
    placeholder: "请输入告警标题",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_297));
// @ts-ignore
[historySearchForm,];
var __VLS_293;
let __VLS_301;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_302 = __VLS_asFunctionalComponent1(__VLS_301, new __VLS_301({
    label: "告警级别",
}));
const __VLS_303 = __VLS_302({
    label: "告警级别",
}, ...__VLS_functionalComponentArgsRest(__VLS_302));
const { default: __VLS_306 } = __VLS_304.slots;
let __VLS_307;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_308 = __VLS_asFunctionalComponent1(__VLS_307, new __VLS_307({
    modelValue: (__VLS_ctx.historySearchForm.alertLevel),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_309 = __VLS_308({
    modelValue: (__VLS_ctx.historySearchForm.alertLevel),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_308));
const { default: __VLS_312 } = __VLS_310.slots;
for (const [opt] of __VLS_vFor((__VLS_ctx.alertLevelOptions))) {
    let __VLS_313;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_314 = __VLS_asFunctionalComponent1(__VLS_313, new __VLS_313({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }));
    const __VLS_315 = __VLS_314({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_314));
    // @ts-ignore
    [alertLevelOptions, historySearchForm,];
}
// @ts-ignore
[];
var __VLS_310;
// @ts-ignore
[];
var __VLS_304;
let __VLS_318;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_319 = __VLS_asFunctionalComponent1(__VLS_318, new __VLS_318({
    label: "状态",
}));
const __VLS_320 = __VLS_319({
    label: "状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_319));
const { default: __VLS_323 } = __VLS_321.slots;
let __VLS_324;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_325 = __VLS_asFunctionalComponent1(__VLS_324, new __VLS_324({
    modelValue: (__VLS_ctx.historySearchForm.status),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_326 = __VLS_325({
    modelValue: (__VLS_ctx.historySearchForm.status),
    placeholder: "全部",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_325));
const { default: __VLS_329 } = __VLS_327.slots;
for (const [opt] of __VLS_vFor((__VLS_ctx.alertStatusOptions))) {
    let __VLS_330;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_331 = __VLS_asFunctionalComponent1(__VLS_330, new __VLS_330({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }));
    const __VLS_332 = __VLS_331({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_331));
    // @ts-ignore
    [historySearchForm, alertStatusOptions,];
}
// @ts-ignore
[];
var __VLS_327;
// @ts-ignore
[];
var __VLS_321;
let __VLS_335;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_336 = __VLS_asFunctionalComponent1(__VLS_335, new __VLS_335({
    label: "开始时间",
}));
const __VLS_337 = __VLS_336({
    label: "开始时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_336));
const { default: __VLS_340 } = __VLS_338.slots;
let __VLS_341;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_342 = __VLS_asFunctionalComponent1(__VLS_341, new __VLS_341({
    modelValue: (__VLS_ctx.historySearchForm.startTime),
    type: "datetime",
    placeholder: "选择开始时间",
    ...{ style: {} },
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}));
const __VLS_343 = __VLS_342({
    modelValue: (__VLS_ctx.historySearchForm.startTime),
    type: "datetime",
    placeholder: "选择开始时间",
    ...{ style: {} },
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}, ...__VLS_functionalComponentArgsRest(__VLS_342));
// @ts-ignore
[historySearchForm,];
var __VLS_338;
let __VLS_346;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_347 = __VLS_asFunctionalComponent1(__VLS_346, new __VLS_346({
    label: "结束时间",
}));
const __VLS_348 = __VLS_347({
    label: "结束时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_347));
const { default: __VLS_351 } = __VLS_349.slots;
let __VLS_352;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_353 = __VLS_asFunctionalComponent1(__VLS_352, new __VLS_352({
    modelValue: (__VLS_ctx.historySearchForm.endTime),
    type: "datetime",
    placeholder: "选择结束时间",
    ...{ style: {} },
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}));
const __VLS_354 = __VLS_353({
    modelValue: (__VLS_ctx.historySearchForm.endTime),
    type: "datetime",
    placeholder: "选择结束时间",
    ...{ style: {} },
    valueFormat: "YYYY-MM-DDTHH:mm:ss",
}, ...__VLS_functionalComponentArgsRest(__VLS_353));
// @ts-ignore
[historySearchForm,];
var __VLS_349;
let __VLS_357;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_358 = __VLS_asFunctionalComponent1(__VLS_357, new __VLS_357({}));
const __VLS_359 = __VLS_358({}, ...__VLS_functionalComponentArgsRest(__VLS_358));
const { default: __VLS_362 } = __VLS_360.slots;
let __VLS_363;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_364 = __VLS_asFunctionalComponent1(__VLS_363, new __VLS_363({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_365 = __VLS_364({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_364));
let __VLS_368;
const __VLS_369 = ({ click: {} },
    { onClick: (__VLS_ctx.handleHistorySearch) });
const { default: __VLS_370 } = __VLS_366.slots;
// @ts-ignore
[handleHistorySearch,];
var __VLS_366;
var __VLS_367;
let __VLS_371;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_372 = __VLS_asFunctionalComponent1(__VLS_371, new __VLS_371({
    ...{ 'onClick': {} },
}));
const __VLS_373 = __VLS_372({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_372));
let __VLS_376;
const __VLS_377 = ({ click: {} },
    { onClick: (__VLS_ctx.handleHistoryReset) });
const { default: __VLS_378 } = __VLS_374.slots;
// @ts-ignore
[handleHistoryReset,];
var __VLS_374;
var __VLS_375;
// @ts-ignore
[];
var __VLS_360;
// @ts-ignore
[];
var __VLS_270;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_379;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_380 = __VLS_asFunctionalComponent1(__VLS_379, new __VLS_379({
    data: (__VLS_ctx.alertHistory),
    border: true,
    stripe: true,
}));
const __VLS_381 = __VLS_380({
    data: (__VLS_ctx.alertHistory),
    border: true,
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_380));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.historyLoading) }, null, null);
const { default: __VLS_384 } = __VLS_382.slots;
let __VLS_385;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_386 = __VLS_asFunctionalComponent1(__VLS_385, new __VLS_385({
    type: "expand",
    width: "50",
}));
const __VLS_387 = __VLS_386({
    type: "expand",
    width: "50",
}, ...__VLS_functionalComponentArgsRest(__VLS_386));
const { default: __VLS_390 } = __VLS_388.slots;
{
    const { default: __VLS_391 } = __VLS_388.slots;
    const [{ row }] = __VLS_vSlot(__VLS_391);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "expand-content" },
    });
    /** @type {__VLS_StyleScopedClasses['expand-content']} */ ;
    let __VLS_392;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_393 = __VLS_asFunctionalComponent1(__VLS_392, new __VLS_392({
        column: (2),
        border: true,
    }));
    const __VLS_394 = __VLS_393({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_393));
    const { default: __VLS_397 } = __VLS_395.slots;
    let __VLS_398;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_399 = __VLS_asFunctionalComponent1(__VLS_398, new __VLS_398({
        label: "告警编码",
    }));
    const __VLS_400 = __VLS_399({
        label: "告警编码",
    }, ...__VLS_functionalComponentArgsRest(__VLS_399));
    const { default: __VLS_403 } = __VLS_401.slots;
    (row.alertCode);
    // @ts-ignore
    [vLoading, alertHistory, historyLoading,];
    var __VLS_401;
    let __VLS_404;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_405 = __VLS_asFunctionalComponent1(__VLS_404, new __VLS_404({
        label: "数据类型",
    }));
    const __VLS_406 = __VLS_405({
        label: "数据类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_405));
    const { default: __VLS_409 } = __VLS_407.slots;
    (__VLS_ctx.getDataTypeText(row.dataType));
    // @ts-ignore
    [getDataTypeText,];
    var __VLS_407;
    let __VLS_410;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_411 = __VLS_asFunctionalComponent1(__VLS_410, new __VLS_410({
        label: "当前值",
    }));
    const __VLS_412 = __VLS_411({
        label: "当前值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_411));
    const { default: __VLS_415 } = __VLS_413.slots;
    (row.currentValue);
    // @ts-ignore
    [];
    var __VLS_413;
    let __VLS_416;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_417 = __VLS_asFunctionalComponent1(__VLS_416, new __VLS_416({
        label: "阈值",
    }));
    const __VLS_418 = __VLS_417({
        label: "阈值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_417));
    const { default: __VLS_421 } = __VLS_419.slots;
    (row.thresholdValue);
    // @ts-ignore
    [];
    var __VLS_419;
    let __VLS_422;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_423 = __VLS_asFunctionalComponent1(__VLS_422, new __VLS_422({
        label: "标准值",
    }));
    const __VLS_424 = __VLS_423({
        label: "标准值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_423));
    const { default: __VLS_427 } = __VLS_425.slots;
    (row.standardValue);
    // @ts-ignore
    [];
    var __VLS_425;
    let __VLS_428;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_429 = __VLS_asFunctionalComponent1(__VLS_428, new __VLS_428({
        label: "偏差率",
    }));
    const __VLS_430 = __VLS_429({
        label: "偏差率",
    }, ...__VLS_functionalComponentArgsRest(__VLS_429));
    const { default: __VLS_433 } = __VLS_431.slots;
    (row.deviationRate);
    // @ts-ignore
    [];
    var __VLS_431;
    let __VLS_434;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_435 = __VLS_asFunctionalComponent1(__VLS_434, new __VLS_434({
        label: "告警类型",
    }));
    const __VLS_436 = __VLS_435({
        label: "告警类型",
    }, ...__VLS_functionalComponentArgsRest(__VLS_435));
    const { default: __VLS_439 } = __VLS_437.slots;
    (row.alertType);
    // @ts-ignore
    [];
    var __VLS_437;
    let __VLS_440;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_441 = __VLS_asFunctionalComponent1(__VLS_440, new __VLS_440({
        label: "通知渠道",
    }));
    const __VLS_442 = __VLS_441({
        label: "通知渠道",
    }, ...__VLS_functionalComponentArgsRest(__VLS_441));
    const { default: __VLS_445 } = __VLS_443.slots;
    (row.notifyChannels);
    // @ts-ignore
    [];
    var __VLS_443;
    let __VLS_446;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_447 = __VLS_asFunctionalComponent1(__VLS_446, new __VLS_446({
        label: "确认人",
    }));
    const __VLS_448 = __VLS_447({
        label: "确认人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_447));
    const { default: __VLS_451 } = __VLS_449.slots;
    (row.confirmBy || '-');
    // @ts-ignore
    [];
    var __VLS_449;
    let __VLS_452;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_453 = __VLS_asFunctionalComponent1(__VLS_452, new __VLS_452({
        label: "确认时间",
    }));
    const __VLS_454 = __VLS_453({
        label: "确认时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_453));
    const { default: __VLS_457 } = __VLS_455.slots;
    (__VLS_ctx.formatDateTime(row.confirmTime));
    // @ts-ignore
    [formatDateTime,];
    var __VLS_455;
    let __VLS_458;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_459 = __VLS_asFunctionalComponent1(__VLS_458, new __VLS_458({
        label: "处理人",
    }));
    const __VLS_460 = __VLS_459({
        label: "处理人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_459));
    const { default: __VLS_463 } = __VLS_461.slots;
    (row.handleBy || '-');
    // @ts-ignore
    [];
    var __VLS_461;
    let __VLS_464;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_465 = __VLS_asFunctionalComponent1(__VLS_464, new __VLS_464({
        label: "处理时间",
    }));
    const __VLS_466 = __VLS_465({
        label: "处理时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_465));
    const { default: __VLS_469 } = __VLS_467.slots;
    (__VLS_ctx.formatDateTime(row.handleTime));
    // @ts-ignore
    [formatDateTime,];
    var __VLS_467;
    let __VLS_470;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_471 = __VLS_asFunctionalComponent1(__VLS_470, new __VLS_470({
        label: "解决人",
    }));
    const __VLS_472 = __VLS_471({
        label: "解决人",
    }, ...__VLS_functionalComponentArgsRest(__VLS_471));
    const { default: __VLS_475 } = __VLS_473.slots;
    (row.resolveBy || '-');
    // @ts-ignore
    [];
    var __VLS_473;
    let __VLS_476;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_477 = __VLS_asFunctionalComponent1(__VLS_476, new __VLS_476({
        label: "解决时间",
    }));
    const __VLS_478 = __VLS_477({
        label: "解决时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_477));
    const { default: __VLS_481 } = __VLS_479.slots;
    (__VLS_ctx.formatDateTime(row.recoverTime));
    // @ts-ignore
    [formatDateTime,];
    var __VLS_479;
    let __VLS_482;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_483 = __VLS_asFunctionalComponent1(__VLS_482, new __VLS_482({
        label: "处理方法",
    }));
    const __VLS_484 = __VLS_483({
        label: "处理方法",
    }, ...__VLS_functionalComponentArgsRest(__VLS_483));
    const { default: __VLS_487 } = __VLS_485.slots;
    (row.handleMethod || '-');
    // @ts-ignore
    [];
    var __VLS_485;
    let __VLS_488;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_489 = __VLS_asFunctionalComponent1(__VLS_488, new __VLS_488({
        label: "解决方法",
    }));
    const __VLS_490 = __VLS_489({
        label: "解决方法",
    }, ...__VLS_functionalComponentArgsRest(__VLS_489));
    const { default: __VLS_493 } = __VLS_491.slots;
    (row.resolveMethod || '-');
    // @ts-ignore
    [];
    var __VLS_491;
    let __VLS_494;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_495 = __VLS_asFunctionalComponent1(__VLS_494, new __VLS_494({
        label: "处理结果",
        span: (2),
    }));
    const __VLS_496 = __VLS_495({
        label: "处理结果",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_495));
    const { default: __VLS_499 } = __VLS_497.slots;
    (row.handleResult || '-');
    // @ts-ignore
    [];
    var __VLS_497;
    let __VLS_500;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_501 = __VLS_asFunctionalComponent1(__VLS_500, new __VLS_500({
        label: "解决备注",
        span: (2),
    }));
    const __VLS_502 = __VLS_501({
        label: "解决备注",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_501));
    const { default: __VLS_505 } = __VLS_503.slots;
    (row.resolveRemark || '-');
    // @ts-ignore
    [];
    var __VLS_503;
    let __VLS_506;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_507 = __VLS_asFunctionalComponent1(__VLS_506, new __VLS_506({
        label: "快照数据",
        span: (2),
    }));
    const __VLS_508 = __VLS_507({
        label: "快照数据",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_507));
    const { default: __VLS_511 } = __VLS_509.slots;
    if (row.snapshotData) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.pre, __VLS_intrinsics.pre)({});
        (__VLS_ctx.formatSnapshotData(row.snapshotData));
    }
    else {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    }
    // @ts-ignore
    [formatSnapshotData,];
    var __VLS_509;
    // @ts-ignore
    [];
    var __VLS_395;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_388;
let __VLS_512;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_513 = __VLS_asFunctionalComponent1(__VLS_512, new __VLS_512({
    prop: "id",
    label: "ID",
    width: "60",
}));
const __VLS_514 = __VLS_513({
    prop: "id",
    label: "ID",
    width: "60",
}, ...__VLS_functionalComponentArgsRest(__VLS_513));
let __VLS_517;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_518 = __VLS_asFunctionalComponent1(__VLS_517, new __VLS_517({
    prop: "alertTitle",
    label: "告警标题",
    minWidth: "180",
    showOverflowTooltip: true,
}));
const __VLS_519 = __VLS_518({
    prop: "alertTitle",
    label: "告警标题",
    minWidth: "180",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_518));
let __VLS_522;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_523 = __VLS_asFunctionalComponent1(__VLS_522, new __VLS_522({
    label: "温室",
    minWidth: "100",
}));
const __VLS_524 = __VLS_523({
    label: "温室",
    minWidth: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_523));
const { default: __VLS_527 } = __VLS_525.slots;
{
    const { default: __VLS_528 } = __VLS_525.slots;
    const [{ row }] = __VLS_vSlot(__VLS_528);
    (row.greenhouseId);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_525;
let __VLS_529;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_530 = __VLS_asFunctionalComponent1(__VLS_529, new __VLS_529({
    label: "告警级别",
    width: "90",
}));
const __VLS_531 = __VLS_530({
    label: "告警级别",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_530));
const { default: __VLS_534 } = __VLS_532.slots;
{
    const { default: __VLS_535 } = __VLS_532.slots;
    const [{ row }] = __VLS_vSlot(__VLS_535);
    let __VLS_536;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_537 = __VLS_asFunctionalComponent1(__VLS_536, new __VLS_536({
        type: (__VLS_ctx.getAlertLevelTag(row.alertLevel).type),
        size: "small",
    }));
    const __VLS_538 = __VLS_537({
        type: (__VLS_ctx.getAlertLevelTag(row.alertLevel).type),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_537));
    const { default: __VLS_541 } = __VLS_539.slots;
    (__VLS_ctx.getAlertLevelTag(row.alertLevel).text);
    // @ts-ignore
    [getAlertLevelTag, getAlertLevelTag,];
    var __VLS_539;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_532;
let __VLS_542;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_543 = __VLS_asFunctionalComponent1(__VLS_542, new __VLS_542({
    label: "状态",
    width: "80",
}));
const __VLS_544 = __VLS_543({
    label: "状态",
    width: "80",
}, ...__VLS_functionalComponentArgsRest(__VLS_543));
const { default: __VLS_547 } = __VLS_545.slots;
{
    const { default: __VLS_548 } = __VLS_545.slots;
    const [{ row }] = __VLS_vSlot(__VLS_548);
    let __VLS_549;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_550 = __VLS_asFunctionalComponent1(__VLS_549, new __VLS_549({
        type: (__VLS_ctx.getAlertStatusTag(row.status).type),
        size: "small",
    }));
    const __VLS_551 = __VLS_550({
        type: (__VLS_ctx.getAlertStatusTag(row.status).type),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_550));
    const { default: __VLS_554 } = __VLS_552.slots;
    (__VLS_ctx.getAlertStatusTag(row.status).text);
    // @ts-ignore
    [getAlertStatusTag, getAlertStatusTag,];
    var __VLS_552;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_545;
let __VLS_555;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_556 = __VLS_asFunctionalComponent1(__VLS_555, new __VLS_555({
    prop: "alertContent",
    label: "告警内容",
    minWidth: "200",
    showOverflowTooltip: true,
}));
const __VLS_557 = __VLS_556({
    prop: "alertContent",
    label: "告警内容",
    minWidth: "200",
    showOverflowTooltip: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_556));
let __VLS_560;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_561 = __VLS_asFunctionalComponent1(__VLS_560, new __VLS_560({
    label: "触发时间",
    width: "150",
}));
const __VLS_562 = __VLS_561({
    label: "触发时间",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_561));
const { default: __VLS_565 } = __VLS_563.slots;
{
    const { default: __VLS_566 } = __VLS_563.slots;
    const [{ row }] = __VLS_vSlot(__VLS_566);
    (__VLS_ctx.formatDateTime(row.triggerTime));
    // @ts-ignore
    [formatDateTime,];
}
// @ts-ignore
[];
var __VLS_563;
let __VLS_567;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_568 = __VLS_asFunctionalComponent1(__VLS_567, new __VLS_567({
    label: "持续时间",
    width: "90",
}));
const __VLS_569 = __VLS_568({
    label: "持续时间",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_568));
const { default: __VLS_572 } = __VLS_570.slots;
{
    const { default: __VLS_573 } = __VLS_570.slots;
    const [{ row }] = __VLS_vSlot(__VLS_573);
    (__VLS_ctx.formatDuration(row.duration));
    // @ts-ignore
    [formatDuration,];
}
// @ts-ignore
[];
var __VLS_570;
let __VLS_574;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_575 = __VLS_asFunctionalComponent1(__VLS_574, new __VLS_574({
    label: "归档",
    width: "60",
    align: "center",
}));
const __VLS_576 = __VLS_575({
    label: "归档",
    width: "60",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_575));
const { default: __VLS_579 } = __VLS_577.slots;
{
    const { default: __VLS_580 } = __VLS_577.slots;
    const [{ row }] = __VLS_vSlot(__VLS_580);
    let __VLS_581;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_582 = __VLS_asFunctionalComponent1(__VLS_581, new __VLS_581({
        type: (row.isArchived ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_583 = __VLS_582({
        type: (row.isArchived ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_582));
    const { default: __VLS_586 } = __VLS_584.slots;
    (row.isArchived ? '已归档' : '未归档');
    // @ts-ignore
    [];
    var __VLS_584;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_577;
let __VLS_587;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_588 = __VLS_asFunctionalComponent1(__VLS_587, new __VLS_587({
    label: "操作",
    width: "200",
    fixed: "right",
}));
const __VLS_589 = __VLS_588({
    label: "操作",
    width: "200",
    fixed: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_588));
const { default: __VLS_592 } = __VLS_590.slots;
{
    const { default: __VLS_593 } = __VLS_590.slots;
    const [{ row }] = __VLS_vSlot(__VLS_593);
    if (row.status === 'unconfirmed') {
        let __VLS_594;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_595 = __VLS_asFunctionalComponent1(__VLS_594, new __VLS_594({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            size: "small",
        }));
        const __VLS_596 = __VLS_595({
            ...{ 'onClick': {} },
            link: true,
            type: "primary",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_595));
        let __VLS_599;
        const __VLS_600 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(row.status === 'unconfirmed'))
                        return;
                    __VLS_ctx.openHistoryDialog(row, 'confirm');
                    // @ts-ignore
                    [openHistoryDialog,];
                } });
        const { default: __VLS_601 } = __VLS_597.slots;
        // @ts-ignore
        [];
        var __VLS_597;
        var __VLS_598;
    }
    if (row.status === 'confirmed') {
        let __VLS_602;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_603 = __VLS_asFunctionalComponent1(__VLS_602, new __VLS_602({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
            size: "small",
        }));
        const __VLS_604 = __VLS_603({
            ...{ 'onClick': {} },
            link: true,
            type: "warning",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_603));
        let __VLS_607;
        const __VLS_608 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(row.status === 'confirmed'))
                        return;
                    __VLS_ctx.openHistoryDialog(row, 'handle');
                    // @ts-ignore
                    [openHistoryDialog,];
                } });
        const { default: __VLS_609 } = __VLS_605.slots;
        // @ts-ignore
        [];
        var __VLS_605;
        var __VLS_606;
    }
    if (row.status === 'handling') {
        let __VLS_610;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_611 = __VLS_asFunctionalComponent1(__VLS_610, new __VLS_610({
            ...{ 'onClick': {} },
            link: true,
            type: "success",
            size: "small",
        }));
        const __VLS_612 = __VLS_611({
            ...{ 'onClick': {} },
            link: true,
            type: "success",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_611));
        let __VLS_615;
        const __VLS_616 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(row.status === 'handling'))
                        return;
                    __VLS_ctx.openHistoryDialog(row, 'resolve');
                    // @ts-ignore
                    [openHistoryDialog,];
                } });
        const { default: __VLS_617 } = __VLS_613.slots;
        // @ts-ignore
        [];
        var __VLS_613;
        var __VLS_614;
    }
    if (row.status === 'unconfirmed') {
        let __VLS_618;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_619 = __VLS_asFunctionalComponent1(__VLS_618, new __VLS_618({
            ...{ 'onClick': {} },
            link: true,
            type: "info",
            size: "small",
        }));
        const __VLS_620 = __VLS_619({
            ...{ 'onClick': {} },
            link: true,
            type: "info",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_619));
        let __VLS_623;
        const __VLS_624 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(row.status === 'unconfirmed'))
                        return;
                    __VLS_ctx.openHistoryDialog(row, 'falseAlarm');
                    // @ts-ignore
                    [openHistoryDialog,];
                } });
        const { default: __VLS_625 } = __VLS_621.slots;
        // @ts-ignore
        [];
        var __VLS_621;
        var __VLS_622;
    }
    if (!row.isArchived && (row.status === 'resolved' || row.status === 'ignored')) {
        let __VLS_626;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_627 = __VLS_asFunctionalComponent1(__VLS_626, new __VLS_626({
            ...{ 'onClick': {} },
            link: true,
            type: "info",
            size: "small",
        }));
        const __VLS_628 = __VLS_627({
            ...{ 'onClick': {} },
            link: true,
            type: "info",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_627));
        let __VLS_631;
        const __VLS_632 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(!row.isArchived && (row.status === 'resolved' || row.status === 'ignored')))
                        return;
                    __VLS_ctx.handleArchive(row);
                    // @ts-ignore
                    [handleArchive,];
                } });
        const { default: __VLS_633 } = __VLS_629.slots;
        // @ts-ignore
        [];
        var __VLS_629;
        var __VLS_630;
    }
    let __VLS_634;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_635 = __VLS_asFunctionalComponent1(__VLS_634, new __VLS_634({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }));
    const __VLS_636 = __VLS_635({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_635));
    let __VLS_639;
    const __VLS_640 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.handleHistoryDelete(row);
                // @ts-ignore
                [handleHistoryDelete,];
            } });
    const { default: __VLS_641 } = __VLS_637.slots;
    // @ts-ignore
    [];
    var __VLS_637;
    var __VLS_638;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_590;
// @ts-ignore
[];
var __VLS_382;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_642;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_643 = __VLS_asFunctionalComponent1(__VLS_642, new __VLS_642({
    ...{ 'onCurrentChange': {} },
    ...{ 'onSizeChange': {} },
    currentPage: (__VLS_ctx.historyCurrentPage),
    pageSize: (__VLS_ctx.historyPageSize),
    pageSizes: ([10, 20, 50, 100]),
    total: (__VLS_ctx.historyTotal),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_644 = __VLS_643({
    ...{ 'onCurrentChange': {} },
    ...{ 'onSizeChange': {} },
    currentPage: (__VLS_ctx.historyCurrentPage),
    pageSize: (__VLS_ctx.historyPageSize),
    pageSizes: ([10, 20, 50, 100]),
    total: (__VLS_ctx.historyTotal),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_643));
let __VLS_647;
const __VLS_648 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.handleHistoryPageChange) });
const __VLS_649 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.handleHistorySizeChange) });
var __VLS_645;
var __VLS_646;
// @ts-ignore
[historyCurrentPage, historyPageSize, historyTotal, handleHistoryPageChange, handleHistorySizeChange,];
var __VLS_264;
// @ts-ignore
[];
var __VLS_3;
let __VLS_650;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_651 = __VLS_asFunctionalComponent1(__VLS_650, new __VLS_650({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogTitle),
    width: "800px",
    closeOnClickModal: (false),
}));
const __VLS_652 = __VLS_651({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogTitle),
    width: "800px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_651));
const { default: __VLS_655 } = __VLS_653.slots;
let __VLS_656;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_657 = __VLS_asFunctionalComponent1(__VLS_656, new __VLS_656({
    ref: "formRef",
    model: (__VLS_ctx.ruleForm),
    rules: (__VLS_ctx.formRules),
    labelWidth: "120px",
    labelPosition: "right",
}));
const __VLS_658 = __VLS_657({
    ref: "formRef",
    model: (__VLS_ctx.ruleForm),
    rules: (__VLS_ctx.formRules),
    labelWidth: "120px",
    labelPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_657));
var __VLS_661 = {};
const { default: __VLS_663 } = __VLS_659.slots;
let __VLS_664;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_665 = __VLS_asFunctionalComponent1(__VLS_664, new __VLS_664({
    gutter: (20),
}));
const __VLS_666 = __VLS_665({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_665));
const { default: __VLS_669 } = __VLS_667.slots;
let __VLS_670;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_671 = __VLS_asFunctionalComponent1(__VLS_670, new __VLS_670({
    span: (12),
}));
const __VLS_672 = __VLS_671({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_671));
const { default: __VLS_675 } = __VLS_673.slots;
let __VLS_676;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_677 = __VLS_asFunctionalComponent1(__VLS_676, new __VLS_676({
    label: "规则名称",
    prop: "ruleName",
}));
const __VLS_678 = __VLS_677({
    label: "规则名称",
    prop: "ruleName",
}, ...__VLS_functionalComponentArgsRest(__VLS_677));
const { default: __VLS_681 } = __VLS_679.slots;
let __VLS_682;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_683 = __VLS_asFunctionalComponent1(__VLS_682, new __VLS_682({
    modelValue: (__VLS_ctx.ruleForm.ruleName),
    placeholder: "请输入规则名称",
}));
const __VLS_684 = __VLS_683({
    modelValue: (__VLS_ctx.ruleForm.ruleName),
    placeholder: "请输入规则名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_683));
// @ts-ignore
[dialogVisible, dialogTitle, ruleForm, ruleForm, formRules,];
var __VLS_679;
// @ts-ignore
[];
var __VLS_673;
let __VLS_687;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_688 = __VLS_asFunctionalComponent1(__VLS_687, new __VLS_687({
    span: (12),
}));
const __VLS_689 = __VLS_688({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_688));
const { default: __VLS_692 } = __VLS_690.slots;
let __VLS_693;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_694 = __VLS_asFunctionalComponent1(__VLS_693, new __VLS_693({
    label: "规则编码",
    prop: "ruleCode",
}));
const __VLS_695 = __VLS_694({
    label: "规则编码",
    prop: "ruleCode",
}, ...__VLS_functionalComponentArgsRest(__VLS_694));
const { default: __VLS_698 } = __VLS_696.slots;
let __VLS_699;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_700 = __VLS_asFunctionalComponent1(__VLS_699, new __VLS_699({
    modelValue: (__VLS_ctx.ruleForm.ruleCode),
    placeholder: "请输入规则编码",
}));
const __VLS_701 = __VLS_700({
    modelValue: (__VLS_ctx.ruleForm.ruleCode),
    placeholder: "请输入规则编码",
}, ...__VLS_functionalComponentArgsRest(__VLS_700));
// @ts-ignore
[ruleForm,];
var __VLS_696;
// @ts-ignore
[];
var __VLS_690;
// @ts-ignore
[];
var __VLS_667;
let __VLS_704;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_705 = __VLS_asFunctionalComponent1(__VLS_704, new __VLS_704({
    gutter: (20),
}));
const __VLS_706 = __VLS_705({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_705));
const { default: __VLS_709 } = __VLS_707.slots;
let __VLS_710;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_711 = __VLS_asFunctionalComponent1(__VLS_710, new __VLS_710({
    span: (12),
}));
const __VLS_712 = __VLS_711({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_711));
const { default: __VLS_715 } = __VLS_713.slots;
let __VLS_716;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_717 = __VLS_asFunctionalComponent1(__VLS_716, new __VLS_716({
    label: "温室",
    prop: "greenhouseId",
}));
const __VLS_718 = __VLS_717({
    label: "温室",
    prop: "greenhouseId",
}, ...__VLS_functionalComponentArgsRest(__VLS_717));
const { default: __VLS_721 } = __VLS_719.slots;
let __VLS_722;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_723 = __VLS_asFunctionalComponent1(__VLS_722, new __VLS_722({
    modelValue: (__VLS_ctx.ruleForm.greenhouseId),
    placeholder: "选择温室（不选则为通用规则）",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_724 = __VLS_723({
    modelValue: (__VLS_ctx.ruleForm.greenhouseId),
    placeholder: "选择温室（不选则为通用规则）",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_723));
const { default: __VLS_727 } = __VLS_725.slots;
for (const [gh] of __VLS_vFor((__VLS_ctx.greenhouses))) {
    let __VLS_728;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_729 = __VLS_asFunctionalComponent1(__VLS_728, new __VLS_728({
        key: (gh.id),
        label: (gh.greenhouseName || `${gh.id}号温室`),
        value: (gh.id),
    }));
    const __VLS_730 = __VLS_729({
        key: (gh.id),
        label: (gh.greenhouseName || `${gh.id}号温室`),
        value: (gh.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_729));
    // @ts-ignore
    [greenhouses, ruleForm,];
}
// @ts-ignore
[];
var __VLS_725;
// @ts-ignore
[];
var __VLS_719;
// @ts-ignore
[];
var __VLS_713;
let __VLS_733;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_734 = __VLS_asFunctionalComponent1(__VLS_733, new __VLS_733({
    span: (12),
}));
const __VLS_735 = __VLS_734({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_734));
const { default: __VLS_738 } = __VLS_736.slots;
let __VLS_739;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_740 = __VLS_asFunctionalComponent1(__VLS_739, new __VLS_739({
    label: "数据类型",
    prop: "dataType",
}));
const __VLS_741 = __VLS_740({
    label: "数据类型",
    prop: "dataType",
}, ...__VLS_functionalComponentArgsRest(__VLS_740));
const { default: __VLS_744 } = __VLS_742.slots;
let __VLS_745;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_746 = __VLS_asFunctionalComponent1(__VLS_745, new __VLS_745({
    modelValue: (__VLS_ctx.ruleForm.dataType),
    placeholder: "请选择数据类型",
    ...{ style: {} },
}));
const __VLS_747 = __VLS_746({
    modelValue: (__VLS_ctx.ruleForm.dataType),
    placeholder: "请选择数据类型",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_746));
const { default: __VLS_750 } = __VLS_748.slots;
for (const [opt] of __VLS_vFor((__VLS_ctx.dataTypeOptions))) {
    let __VLS_751;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_752 = __VLS_asFunctionalComponent1(__VLS_751, new __VLS_751({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }));
    const __VLS_753 = __VLS_752({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_752));
    // @ts-ignore
    [dataTypeOptions, ruleForm,];
}
// @ts-ignore
[];
var __VLS_748;
// @ts-ignore
[];
var __VLS_742;
// @ts-ignore
[];
var __VLS_736;
// @ts-ignore
[];
var __VLS_707;
let __VLS_756;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_757 = __VLS_asFunctionalComponent1(__VLS_756, new __VLS_756({
    gutter: (20),
}));
const __VLS_758 = __VLS_757({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_757));
const { default: __VLS_761 } = __VLS_759.slots;
let __VLS_762;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_763 = __VLS_asFunctionalComponent1(__VLS_762, new __VLS_762({
    span: (12),
}));
const __VLS_764 = __VLS_763({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_763));
const { default: __VLS_767 } = __VLS_765.slots;
let __VLS_768;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_769 = __VLS_asFunctionalComponent1(__VLS_768, new __VLS_768({
    label: "告警级别",
    prop: "alertLevel",
}));
const __VLS_770 = __VLS_769({
    label: "告警级别",
    prop: "alertLevel",
}, ...__VLS_functionalComponentArgsRest(__VLS_769));
const { default: __VLS_773 } = __VLS_771.slots;
let __VLS_774;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_775 = __VLS_asFunctionalComponent1(__VLS_774, new __VLS_774({
    modelValue: (__VLS_ctx.ruleForm.alertLevel),
    placeholder: "请选择告警级别",
    ...{ style: {} },
}));
const __VLS_776 = __VLS_775({
    modelValue: (__VLS_ctx.ruleForm.alertLevel),
    placeholder: "请选择告警级别",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_775));
const { default: __VLS_779 } = __VLS_777.slots;
for (const [opt] of __VLS_vFor((__VLS_ctx.alertLevelOptions))) {
    let __VLS_780;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_781 = __VLS_asFunctionalComponent1(__VLS_780, new __VLS_780({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }));
    const __VLS_782 = __VLS_781({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_781));
    // @ts-ignore
    [alertLevelOptions, ruleForm,];
}
// @ts-ignore
[];
var __VLS_777;
// @ts-ignore
[];
var __VLS_771;
// @ts-ignore
[];
var __VLS_765;
let __VLS_785;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_786 = __VLS_asFunctionalComponent1(__VLS_785, new __VLS_785({
    span: (12),
}));
const __VLS_787 = __VLS_786({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_786));
const { default: __VLS_790 } = __VLS_788.slots;
let __VLS_791;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_792 = __VLS_asFunctionalComponent1(__VLS_791, new __VLS_791({
    label: "启用状态",
}));
const __VLS_793 = __VLS_792({
    label: "启用状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_792));
const { default: __VLS_796 } = __VLS_794.slots;
let __VLS_797;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_798 = __VLS_asFunctionalComponent1(__VLS_797, new __VLS_797({
    modelValue: (__VLS_ctx.ruleForm.isEnabled),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_799 = __VLS_798({
    modelValue: (__VLS_ctx.ruleForm.isEnabled),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_798));
// @ts-ignore
[ruleForm,];
var __VLS_794;
// @ts-ignore
[];
var __VLS_788;
// @ts-ignore
[];
var __VLS_759;
let __VLS_802;
/** @ts-ignore @type {typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider} */
elDivider;
// @ts-ignore
const __VLS_803 = __VLS_asFunctionalComponent1(__VLS_802, new __VLS_802({}));
const __VLS_804 = __VLS_803({}, ...__VLS_functionalComponentArgsRest(__VLS_803));
const { default: __VLS_807 } = __VLS_805.slots;
// @ts-ignore
[];
var __VLS_805;
let __VLS_808;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_809 = __VLS_asFunctionalComponent1(__VLS_808, new __VLS_808({
    gutter: (20),
}));
const __VLS_810 = __VLS_809({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_809));
const { default: __VLS_813 } = __VLS_811.slots;
let __VLS_814;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_815 = __VLS_asFunctionalComponent1(__VLS_814, new __VLS_814({
    span: (6),
}));
const __VLS_816 = __VLS_815({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_815));
const { default: __VLS_819 } = __VLS_817.slots;
let __VLS_820;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_821 = __VLS_asFunctionalComponent1(__VLS_820, new __VLS_820({
    label: "启用最小值",
}));
const __VLS_822 = __VLS_821({
    label: "启用最小值",
}, ...__VLS_functionalComponentArgsRest(__VLS_821));
const { default: __VLS_825 } = __VLS_823.slots;
let __VLS_826;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_827 = __VLS_asFunctionalComponent1(__VLS_826, new __VLS_826({
    modelValue: (__VLS_ctx.ruleForm.enableMin),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_828 = __VLS_827({
    modelValue: (__VLS_ctx.ruleForm.enableMin),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_827));
// @ts-ignore
[ruleForm,];
var __VLS_823;
// @ts-ignore
[];
var __VLS_817;
let __VLS_831;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_832 = __VLS_asFunctionalComponent1(__VLS_831, new __VLS_831({
    span: (6),
}));
const __VLS_833 = __VLS_832({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_832));
const { default: __VLS_836 } = __VLS_834.slots;
let __VLS_837;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_838 = __VLS_asFunctionalComponent1(__VLS_837, new __VLS_837({
    label: "最小值",
}));
const __VLS_839 = __VLS_838({
    label: "最小值",
}, ...__VLS_functionalComponentArgsRest(__VLS_838));
const { default: __VLS_842 } = __VLS_840.slots;
let __VLS_843;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_844 = __VLS_asFunctionalComponent1(__VLS_843, new __VLS_843({
    modelValue: (__VLS_ctx.ruleForm.minValue),
    disabled: (!__VLS_ctx.ruleForm.enableMin),
    min: (0),
    ...{ style: {} },
}));
const __VLS_845 = __VLS_844({
    modelValue: (__VLS_ctx.ruleForm.minValue),
    disabled: (!__VLS_ctx.ruleForm.enableMin),
    min: (0),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_844));
// @ts-ignore
[ruleForm, ruleForm,];
var __VLS_840;
// @ts-ignore
[];
var __VLS_834;
let __VLS_848;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_849 = __VLS_asFunctionalComponent1(__VLS_848, new __VLS_848({
    span: (6),
}));
const __VLS_850 = __VLS_849({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_849));
const { default: __VLS_853 } = __VLS_851.slots;
let __VLS_854;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_855 = __VLS_asFunctionalComponent1(__VLS_854, new __VLS_854({
    label: "启用最大值",
}));
const __VLS_856 = __VLS_855({
    label: "启用最大值",
}, ...__VLS_functionalComponentArgsRest(__VLS_855));
const { default: __VLS_859 } = __VLS_857.slots;
let __VLS_860;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_861 = __VLS_asFunctionalComponent1(__VLS_860, new __VLS_860({
    modelValue: (__VLS_ctx.ruleForm.enableMax),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_862 = __VLS_861({
    modelValue: (__VLS_ctx.ruleForm.enableMax),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_861));
// @ts-ignore
[ruleForm,];
var __VLS_857;
// @ts-ignore
[];
var __VLS_851;
let __VLS_865;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_866 = __VLS_asFunctionalComponent1(__VLS_865, new __VLS_865({
    span: (6),
}));
const __VLS_867 = __VLS_866({
    span: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_866));
const { default: __VLS_870 } = __VLS_868.slots;
let __VLS_871;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_872 = __VLS_asFunctionalComponent1(__VLS_871, new __VLS_871({
    label: "最大值",
}));
const __VLS_873 = __VLS_872({
    label: "最大值",
}, ...__VLS_functionalComponentArgsRest(__VLS_872));
const { default: __VLS_876 } = __VLS_874.slots;
let __VLS_877;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_878 = __VLS_asFunctionalComponent1(__VLS_877, new __VLS_877({
    modelValue: (__VLS_ctx.ruleForm.maxValue),
    disabled: (!__VLS_ctx.ruleForm.enableMax),
    min: (0),
    ...{ style: {} },
}));
const __VLS_879 = __VLS_878({
    modelValue: (__VLS_ctx.ruleForm.maxValue),
    disabled: (!__VLS_ctx.ruleForm.enableMax),
    min: (0),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_878));
// @ts-ignore
[ruleForm, ruleForm,];
var __VLS_874;
// @ts-ignore
[];
var __VLS_868;
// @ts-ignore
[];
var __VLS_811;
let __VLS_882;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_883 = __VLS_asFunctionalComponent1(__VLS_882, new __VLS_882({
    gutter: (20),
}));
const __VLS_884 = __VLS_883({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_883));
const { default: __VLS_887 } = __VLS_885.slots;
let __VLS_888;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_889 = __VLS_asFunctionalComponent1(__VLS_888, new __VLS_888({
    span: (12),
}));
const __VLS_890 = __VLS_889({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_889));
const { default: __VLS_893 } = __VLS_891.slots;
let __VLS_894;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_895 = __VLS_asFunctionalComponent1(__VLS_894, new __VLS_894({
    label: "目标值",
}));
const __VLS_896 = __VLS_895({
    label: "目标值",
}, ...__VLS_functionalComponentArgsRest(__VLS_895));
const { default: __VLS_899 } = __VLS_897.slots;
let __VLS_900;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_901 = __VLS_asFunctionalComponent1(__VLS_900, new __VLS_900({
    modelValue: (__VLS_ctx.ruleForm.targetValue),
    min: (0),
    ...{ style: {} },
}));
const __VLS_902 = __VLS_901({
    modelValue: (__VLS_ctx.ruleForm.targetValue),
    min: (0),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_901));
// @ts-ignore
[ruleForm,];
var __VLS_897;
// @ts-ignore
[];
var __VLS_891;
let __VLS_905;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_906 = __VLS_asFunctionalComponent1(__VLS_905, new __VLS_905({
    span: (12),
}));
const __VLS_907 = __VLS_906({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_906));
const { default: __VLS_910 } = __VLS_908.slots;
let __VLS_911;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_912 = __VLS_asFunctionalComponent1(__VLS_911, new __VLS_911({
    label: "容差范围",
}));
const __VLS_913 = __VLS_912({
    label: "容差范围",
}, ...__VLS_functionalComponentArgsRest(__VLS_912));
const { default: __VLS_916 } = __VLS_914.slots;
let __VLS_917;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_918 = __VLS_asFunctionalComponent1(__VLS_917, new __VLS_917({
    modelValue: (__VLS_ctx.ruleForm.tolerance),
    min: (0),
    ...{ style: {} },
}));
const __VLS_919 = __VLS_918({
    modelValue: (__VLS_ctx.ruleForm.tolerance),
    min: (0),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_918));
// @ts-ignore
[ruleForm,];
var __VLS_914;
// @ts-ignore
[];
var __VLS_908;
// @ts-ignore
[];
var __VLS_885;
let __VLS_922;
/** @ts-ignore @type {typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider | typeof __VLS_components.elDivider | typeof __VLS_components.ElDivider} */
elDivider;
// @ts-ignore
const __VLS_923 = __VLS_asFunctionalComponent1(__VLS_922, new __VLS_922({}));
const __VLS_924 = __VLS_923({}, ...__VLS_functionalComponentArgsRest(__VLS_923));
const { default: __VLS_927 } = __VLS_925.slots;
// @ts-ignore
[];
var __VLS_925;
let __VLS_928;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_929 = __VLS_asFunctionalComponent1(__VLS_928, new __VLS_928({
    gutter: (20),
}));
const __VLS_930 = __VLS_929({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_929));
const { default: __VLS_933 } = __VLS_931.slots;
let __VLS_934;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_935 = __VLS_asFunctionalComponent1(__VLS_934, new __VLS_934({
    span: (12),
}));
const __VLS_936 = __VLS_935({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_935));
const { default: __VLS_939 } = __VLS_937.slots;
let __VLS_940;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_941 = __VLS_asFunctionalComponent1(__VLS_940, new __VLS_940({
    label: "持续时长(秒)",
}));
const __VLS_942 = __VLS_941({
    label: "持续时长(秒)",
}, ...__VLS_functionalComponentArgsRest(__VLS_941));
const { default: __VLS_945 } = __VLS_943.slots;
let __VLS_946;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_947 = __VLS_asFunctionalComponent1(__VLS_946, new __VLS_946({
    modelValue: (__VLS_ctx.ruleForm.alertDuration),
    min: (0),
    ...{ style: {} },
}));
const __VLS_948 = __VLS_947({
    modelValue: (__VLS_ctx.ruleForm.alertDuration),
    min: (0),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_947));
// @ts-ignore
[ruleForm,];
var __VLS_943;
// @ts-ignore
[];
var __VLS_937;
let __VLS_951;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_952 = __VLS_asFunctionalComponent1(__VLS_951, new __VLS_951({
    span: (12),
}));
const __VLS_953 = __VLS_952({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_952));
const { default: __VLS_956 } = __VLS_954.slots;
let __VLS_957;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_958 = __VLS_asFunctionalComponent1(__VLS_957, new __VLS_957({
    label: "通知间隔(秒)",
}));
const __VLS_959 = __VLS_958({
    label: "通知间隔(秒)",
}, ...__VLS_functionalComponentArgsRest(__VLS_958));
const { default: __VLS_962 } = __VLS_960.slots;
let __VLS_963;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_964 = __VLS_asFunctionalComponent1(__VLS_963, new __VLS_963({
    modelValue: (__VLS_ctx.ruleForm.alertInterval),
    min: (0),
    ...{ style: {} },
}));
const __VLS_965 = __VLS_964({
    modelValue: (__VLS_ctx.ruleForm.alertInterval),
    min: (0),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_964));
// @ts-ignore
[ruleForm,];
var __VLS_960;
// @ts-ignore
[];
var __VLS_954;
// @ts-ignore
[];
var __VLS_931;
let __VLS_968;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_969 = __VLS_asFunctionalComponent1(__VLS_968, new __VLS_968({
    gutter: (20),
}));
const __VLS_970 = __VLS_969({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_969));
const { default: __VLS_973 } = __VLS_971.slots;
let __VLS_974;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_975 = __VLS_asFunctionalComponent1(__VLS_974, new __VLS_974({
    span: (12),
}));
const __VLS_976 = __VLS_975({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_975));
const { default: __VLS_979 } = __VLS_977.slots;
let __VLS_980;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_981 = __VLS_asFunctionalComponent1(__VLS_980, new __VLS_980({
    label: "通知方式",
}));
const __VLS_982 = __VLS_981({
    label: "通知方式",
}, ...__VLS_functionalComponentArgsRest(__VLS_981));
const { default: __VLS_985 } = __VLS_983.slots;
let __VLS_986;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_987 = __VLS_asFunctionalComponent1(__VLS_986, new __VLS_986({
    modelValue: (__VLS_ctx.ruleForm.notifyType),
    placeholder: "请选择通知方式",
    ...{ style: {} },
}));
const __VLS_988 = __VLS_987({
    modelValue: (__VLS_ctx.ruleForm.notifyType),
    placeholder: "请选择通知方式",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_987));
const { default: __VLS_991 } = __VLS_989.slots;
for (const [opt] of __VLS_vFor((__VLS_ctx.notifyTypeOptions))) {
    let __VLS_992;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_993 = __VLS_asFunctionalComponent1(__VLS_992, new __VLS_992({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }));
    const __VLS_994 = __VLS_993({
        key: (opt.value),
        label: (opt.label),
        value: (opt.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_993));
    // @ts-ignore
    [ruleForm, notifyTypeOptions,];
}
// @ts-ignore
[];
var __VLS_989;
// @ts-ignore
[];
var __VLS_983;
// @ts-ignore
[];
var __VLS_977;
let __VLS_997;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_998 = __VLS_asFunctionalComponent1(__VLS_997, new __VLS_997({
    span: (12),
}));
const __VLS_999 = __VLS_998({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_998));
const { default: __VLS_1002 } = __VLS_1000.slots;
let __VLS_1003;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_1004 = __VLS_asFunctionalComponent1(__VLS_1003, new __VLS_1003({
    label: "自动处理",
}));
const __VLS_1005 = __VLS_1004({
    label: "自动处理",
}, ...__VLS_functionalComponentArgsRest(__VLS_1004));
const { default: __VLS_1008 } = __VLS_1006.slots;
let __VLS_1009;
/** @ts-ignore @type {typeof __VLS_components.elSwitch | typeof __VLS_components.ElSwitch} */
elSwitch;
// @ts-ignore
const __VLS_1010 = __VLS_asFunctionalComponent1(__VLS_1009, new __VLS_1009({
    modelValue: (__VLS_ctx.ruleForm.autoHandle),
    activeValue: (1),
    inactiveValue: (0),
}));
const __VLS_1011 = __VLS_1010({
    modelValue: (__VLS_ctx.ruleForm.autoHandle),
    activeValue: (1),
    inactiveValue: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_1010));
// @ts-ignore
[ruleForm,];
var __VLS_1006;
// @ts-ignore
[];
var __VLS_1000;
// @ts-ignore
[];
var __VLS_971;
let __VLS_1014;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_1015 = __VLS_asFunctionalComponent1(__VLS_1014, new __VLS_1014({
    label: "告警消息",
}));
const __VLS_1016 = __VLS_1015({
    label: "告警消息",
}, ...__VLS_functionalComponentArgsRest(__VLS_1015));
const { default: __VLS_1019 } = __VLS_1017.slots;
let __VLS_1020;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_1021 = __VLS_asFunctionalComponent1(__VLS_1020, new __VLS_1020({
    modelValue: (__VLS_ctx.ruleForm.alertMessage),
    type: "textarea",
    rows: (2),
    placeholder: "请输入告警消息模板",
}));
const __VLS_1022 = __VLS_1021({
    modelValue: (__VLS_ctx.ruleForm.alertMessage),
    type: "textarea",
    rows: (2),
    placeholder: "请输入告警消息模板",
}, ...__VLS_functionalComponentArgsRest(__VLS_1021));
// @ts-ignore
[ruleForm,];
var __VLS_1017;
let __VLS_1025;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_1026 = __VLS_asFunctionalComponent1(__VLS_1025, new __VLS_1025({
    label: "生效时间段",
}));
const __VLS_1027 = __VLS_1026({
    label: "生效时间段",
}, ...__VLS_functionalComponentArgsRest(__VLS_1026));
const { default: __VLS_1030 } = __VLS_1028.slots;
let __VLS_1031;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_1032 = __VLS_asFunctionalComponent1(__VLS_1031, new __VLS_1031({
    modelValue: (__VLS_ctx.ruleForm.effectiveTime),
    placeholder: "例如：00:00-23:59",
}));
const __VLS_1033 = __VLS_1032({
    modelValue: (__VLS_ctx.ruleForm.effectiveTime),
    placeholder: "例如：00:00-23:59",
}, ...__VLS_functionalComponentArgsRest(__VLS_1032));
// @ts-ignore
[ruleForm,];
var __VLS_1028;
let __VLS_1036;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_1037 = __VLS_asFunctionalComponent1(__VLS_1036, new __VLS_1036({
    label: "备注",
}));
const __VLS_1038 = __VLS_1037({
    label: "备注",
}, ...__VLS_functionalComponentArgsRest(__VLS_1037));
const { default: __VLS_1041 } = __VLS_1039.slots;
let __VLS_1042;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_1043 = __VLS_asFunctionalComponent1(__VLS_1042, new __VLS_1042({
    modelValue: (__VLS_ctx.ruleForm.remark),
    type: "textarea",
    rows: (2),
    placeholder: "请输入备注信息",
}));
const __VLS_1044 = __VLS_1043({
    modelValue: (__VLS_ctx.ruleForm.remark),
    type: "textarea",
    rows: (2),
    placeholder: "请输入备注信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_1043));
// @ts-ignore
[ruleForm,];
var __VLS_1039;
// @ts-ignore
[];
var __VLS_659;
{
    const { footer: __VLS_1047 } = __VLS_653.slots;
    let __VLS_1048;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_1049 = __VLS_asFunctionalComponent1(__VLS_1048, new __VLS_1048({
        ...{ 'onClick': {} },
    }));
    const __VLS_1050 = __VLS_1049({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1049));
    let __VLS_1053;
    const __VLS_1054 = ({ click: {} },
        { onClick: (__VLS_ctx.handleCancel) });
    const { default: __VLS_1055 } = __VLS_1051.slots;
    // @ts-ignore
    [handleCancel,];
    var __VLS_1051;
    var __VLS_1052;
    let __VLS_1056;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_1057 = __VLS_asFunctionalComponent1(__VLS_1056, new __VLS_1056({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_1058 = __VLS_1057({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1057));
    let __VLS_1061;
    const __VLS_1062 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSubmit) });
    const { default: __VLS_1063 } = __VLS_1059.slots;
    // @ts-ignore
    [handleSubmit,];
    var __VLS_1059;
    var __VLS_1060;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_653;
let __VLS_1064;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_1065 = __VLS_asFunctionalComponent1(__VLS_1064, new __VLS_1064({
    modelValue: (__VLS_ctx.historyDialogVisible),
    title: (__VLS_ctx.historyDialogTitle),
    width: "600px",
    closeOnClickModal: (false),
}));
const __VLS_1066 = __VLS_1065({
    modelValue: (__VLS_ctx.historyDialogVisible),
    title: (__VLS_ctx.historyDialogTitle),
    width: "600px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1065));
const { default: __VLS_1069 } = __VLS_1067.slots;
let __VLS_1070;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_1071 = __VLS_asFunctionalComponent1(__VLS_1070, new __VLS_1070({
    labelWidth: "100px",
    labelPosition: "right",
}));
const __VLS_1072 = __VLS_1071({
    labelWidth: "100px",
    labelPosition: "right",
}, ...__VLS_functionalComponentArgsRest(__VLS_1071));
const { default: __VLS_1075 } = __VLS_1073.slots;
if (__VLS_ctx.historyDialogType === 'confirm') {
    let __VLS_1076;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_1077 = __VLS_asFunctionalComponent1(__VLS_1076, new __VLS_1076({
        label: "确认人",
        required: true,
    }));
    const __VLS_1078 = __VLS_1077({
        label: "确认人",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1077));
    const { default: __VLS_1081 } = __VLS_1079.slots;
    let __VLS_1082;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_1083 = __VLS_asFunctionalComponent1(__VLS_1082, new __VLS_1082({
        modelValue: (__VLS_ctx.historyForm.operator),
        placeholder: "请输入确认人姓名",
    }));
    const __VLS_1084 = __VLS_1083({
        modelValue: (__VLS_ctx.historyForm.operator),
        placeholder: "请输入确认人姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1083));
    // @ts-ignore
    [historyDialogVisible, historyDialogTitle, historyDialogType, historyForm,];
    var __VLS_1079;
}
if (__VLS_ctx.historyDialogType === 'handle') {
    let __VLS_1087;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_1088 = __VLS_asFunctionalComponent1(__VLS_1087, new __VLS_1087({
        label: "处理人",
        required: true,
    }));
    const __VLS_1089 = __VLS_1088({
        label: "处理人",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1088));
    const { default: __VLS_1092 } = __VLS_1090.slots;
    let __VLS_1093;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_1094 = __VLS_asFunctionalComponent1(__VLS_1093, new __VLS_1093({
        modelValue: (__VLS_ctx.historyForm.operator),
        placeholder: "请输入处理人姓名",
    }));
    const __VLS_1095 = __VLS_1094({
        modelValue: (__VLS_ctx.historyForm.operator),
        placeholder: "请输入处理人姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1094));
    // @ts-ignore
    [historyDialogType, historyForm,];
    var __VLS_1090;
    let __VLS_1098;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_1099 = __VLS_asFunctionalComponent1(__VLS_1098, new __VLS_1098({
        label: "处理方式",
        required: true,
    }));
    const __VLS_1100 = __VLS_1099({
        label: "处理方式",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1099));
    const { default: __VLS_1103 } = __VLS_1101.slots;
    let __VLS_1104;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_1105 = __VLS_asFunctionalComponent1(__VLS_1104, new __VLS_1104({
        modelValue: (__VLS_ctx.historyForm.method),
        placeholder: "请选择处理方式",
        ...{ style: {} },
    }));
    const __VLS_1106 = __VLS_1105({
        modelValue: (__VLS_ctx.historyForm.method),
        placeholder: "请选择处理方式",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1105));
    const { default: __VLS_1109 } = __VLS_1107.slots;
    for (const [opt] of __VLS_vFor((__VLS_ctx.handleMethodOptions))) {
        let __VLS_1110;
        /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
        elOption;
        // @ts-ignore
        const __VLS_1111 = __VLS_asFunctionalComponent1(__VLS_1110, new __VLS_1110({
            key: (opt.value),
            label: (opt.label),
            value: (opt.value),
        }));
        const __VLS_1112 = __VLS_1111({
            key: (opt.value),
            label: (opt.label),
            value: (opt.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1111));
        // @ts-ignore
        [historyForm, handleMethodOptions,];
    }
    // @ts-ignore
    [];
    var __VLS_1107;
    // @ts-ignore
    [];
    var __VLS_1101;
    let __VLS_1115;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_1116 = __VLS_asFunctionalComponent1(__VLS_1115, new __VLS_1115({
        label: "处理动作",
    }));
    const __VLS_1117 = __VLS_1116({
        label: "处理动作",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1116));
    const { default: __VLS_1120 } = __VLS_1118.slots;
    let __VLS_1121;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_1122 = __VLS_asFunctionalComponent1(__VLS_1121, new __VLS_1121({
        modelValue: (__VLS_ctx.historyForm.action),
        placeholder: "例如：开启风扇、调节温度等",
    }));
    const __VLS_1123 = __VLS_1122({
        modelValue: (__VLS_ctx.historyForm.action),
        placeholder: "例如：开启风扇、调节温度等",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1122));
    // @ts-ignore
    [historyForm,];
    var __VLS_1118;
    let __VLS_1126;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_1127 = __VLS_asFunctionalComponent1(__VLS_1126, new __VLS_1126({
        label: "处理结果",
    }));
    const __VLS_1128 = __VLS_1127({
        label: "处理结果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1127));
    const { default: __VLS_1131 } = __VLS_1129.slots;
    let __VLS_1132;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_1133 = __VLS_asFunctionalComponent1(__VLS_1132, new __VLS_1132({
        modelValue: (__VLS_ctx.historyForm.result),
        type: "textarea",
        rows: (2),
        placeholder: "请输入处理结果",
    }));
    const __VLS_1134 = __VLS_1133({
        modelValue: (__VLS_ctx.historyForm.result),
        type: "textarea",
        rows: (2),
        placeholder: "请输入处理结果",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1133));
    // @ts-ignore
    [historyForm,];
    var __VLS_1129;
}
if (__VLS_ctx.historyDialogType === 'resolve') {
    let __VLS_1137;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_1138 = __VLS_asFunctionalComponent1(__VLS_1137, new __VLS_1137({
        label: "解决人",
        required: true,
    }));
    const __VLS_1139 = __VLS_1138({
        label: "解决人",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1138));
    const { default: __VLS_1142 } = __VLS_1140.slots;
    let __VLS_1143;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_1144 = __VLS_asFunctionalComponent1(__VLS_1143, new __VLS_1143({
        modelValue: (__VLS_ctx.historyForm.operator),
        placeholder: "请输入解决人姓名",
    }));
    const __VLS_1145 = __VLS_1144({
        modelValue: (__VLS_ctx.historyForm.operator),
        placeholder: "请输入解决人姓名",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1144));
    // @ts-ignore
    [historyDialogType, historyForm,];
    var __VLS_1140;
    let __VLS_1148;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_1149 = __VLS_asFunctionalComponent1(__VLS_1148, new __VLS_1148({
        label: "解决方式",
        required: true,
    }));
    const __VLS_1150 = __VLS_1149({
        label: "解决方式",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1149));
    const { default: __VLS_1153 } = __VLS_1151.slots;
    let __VLS_1154;
    /** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
    elSelect;
    // @ts-ignore
    const __VLS_1155 = __VLS_asFunctionalComponent1(__VLS_1154, new __VLS_1154({
        modelValue: (__VLS_ctx.historyForm.method),
        placeholder: "请选择解决方式",
        ...{ style: {} },
    }));
    const __VLS_1156 = __VLS_1155({
        modelValue: (__VLS_ctx.historyForm.method),
        placeholder: "请选择解决方式",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1155));
    const { default: __VLS_1159 } = __VLS_1157.slots;
    for (const [opt] of __VLS_vFor((__VLS_ctx.resolveMethodOptions))) {
        let __VLS_1160;
        /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
        elOption;
        // @ts-ignore
        const __VLS_1161 = __VLS_asFunctionalComponent1(__VLS_1160, new __VLS_1160({
            key: (opt.value),
            label: (opt.label),
            value: (opt.value),
        }));
        const __VLS_1162 = __VLS_1161({
            key: (opt.value),
            label: (opt.label),
            value: (opt.value),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1161));
        // @ts-ignore
        [historyForm, resolveMethodOptions,];
    }
    // @ts-ignore
    [];
    var __VLS_1157;
    // @ts-ignore
    [];
    var __VLS_1151;
    let __VLS_1165;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_1166 = __VLS_asFunctionalComponent1(__VLS_1165, new __VLS_1165({
        label: "备注",
    }));
    const __VLS_1167 = __VLS_1166({
        label: "备注",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1166));
    const { default: __VLS_1170 } = __VLS_1168.slots;
    let __VLS_1171;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_1172 = __VLS_asFunctionalComponent1(__VLS_1171, new __VLS_1171({
        modelValue: (__VLS_ctx.historyForm.remark),
        type: "textarea",
        rows: (3),
        placeholder: "请输入解决备注",
    }));
    const __VLS_1173 = __VLS_1172({
        modelValue: (__VLS_ctx.historyForm.remark),
        type: "textarea",
        rows: (3),
        placeholder: "请输入解决备注",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1172));
    // @ts-ignore
    [historyForm,];
    var __VLS_1168;
}
if (__VLS_ctx.historyDialogType === 'falseAlarm') {
    let __VLS_1176;
    /** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
    elFormItem;
    // @ts-ignore
    const __VLS_1177 = __VLS_asFunctionalComponent1(__VLS_1176, new __VLS_1176({
        label: "误报原因",
        required: true,
    }));
    const __VLS_1178 = __VLS_1177({
        label: "误报原因",
        required: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_1177));
    const { default: __VLS_1181 } = __VLS_1179.slots;
    let __VLS_1182;
    /** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
    elInput;
    // @ts-ignore
    const __VLS_1183 = __VLS_asFunctionalComponent1(__VLS_1182, new __VLS_1182({
        modelValue: (__VLS_ctx.historyForm.remark),
        type: "textarea",
        rows: (4),
        placeholder: "请输入误报原因，例如：传感器故障、数据异常等",
    }));
    const __VLS_1184 = __VLS_1183({
        modelValue: (__VLS_ctx.historyForm.remark),
        type: "textarea",
        rows: (4),
        placeholder: "请输入误报原因，例如：传感器故障、数据异常等",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1183));
    // @ts-ignore
    [historyDialogType, historyForm,];
    var __VLS_1179;
}
// @ts-ignore
[];
var __VLS_1073;
{
    const { footer: __VLS_1187 } = __VLS_1067.slots;
    let __VLS_1188;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_1189 = __VLS_asFunctionalComponent1(__VLS_1188, new __VLS_1188({
        ...{ 'onClick': {} },
    }));
    const __VLS_1190 = __VLS_1189({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1189));
    let __VLS_1193;
    const __VLS_1194 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.historyDialogVisible = false;
                // @ts-ignore
                [historyDialogVisible,];
            } });
    const { default: __VLS_1195 } = __VLS_1191.slots;
    // @ts-ignore
    [];
    var __VLS_1191;
    var __VLS_1192;
    let __VLS_1196;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_1197 = __VLS_asFunctionalComponent1(__VLS_1196, new __VLS_1196({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_1198 = __VLS_1197({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1197));
    let __VLS_1201;
    const __VLS_1202 = ({ click: {} },
        { onClick: (__VLS_ctx.handleHistorySubmit) });
    const { default: __VLS_1203 } = __VLS_1199.slots;
    // @ts-ignore
    [handleHistorySubmit,];
    var __VLS_1199;
    var __VLS_1200;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_1067;
// @ts-ignore
var __VLS_662 = __VLS_661;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
