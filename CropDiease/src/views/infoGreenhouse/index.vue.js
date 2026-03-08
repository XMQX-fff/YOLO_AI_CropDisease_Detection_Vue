import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useGreenhouseApi } from '/@/api/greenhouse';
// 温室数据
const greenhouses = ref([]);
const greenhouseApi = useGreenhouseApi();
const loading = ref(false);
// 分页相关
const currentPage = ref(1);
const pageSize = ref(6);
const total = ref(0);
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
});
// 获取温室数据
const fetchGreenhouseData = async () => {
    loading.value = true;
    try {
        const response = await greenhouseApi.getWithDiseaseCountPage({
            pageNum: currentPage.value,
            pageSize: pageSize.value
        });
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const data = response.data.records || response.data.list || response.data;
            total.value = response.data.total || data.length;
            greenhouses.value = data.map((item) => {
                const gh = item.greenhouse || {};
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
                };
            });
        }
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '获取温室数据失败',
        });
        console.error('获取温室数据失败:', error);
        total.value = 9;
        greenhouses.value = [
            { id: 1, name: '1号温室', crop: '玉米', status: '生长良好', temperature: '25°C', humidity: '65%', light: '8000lux', soilMoisture: '45%', lastUpdated: '2026-02-20 15:30' },
            { id: 2, name: '2号温室', crop: '水稻', status: '生长良好', temperature: '28°C', humidity: '75%', light: '7500lux', soilMoisture: '55%', lastUpdated: '2026-02-20 15:30' },
            { id: 3, name: '3号温室', crop: '小麦', status: '需要关注', temperature: '22°C', humidity: '60%', light: '9000lux', soilMoisture: '40%', lastUpdated: '2026-02-20 15:30' }
        ];
    }
    finally {
        loading.value = false;
    }
};
// 处理页码变化
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchGreenhouseData();
};
// 处理每页条数变化
const handleSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchGreenhouseData();
};
// 获取天气数据
const fetchWeatherData = async () => {
    try {
        // 固定使用广州的天气
        const city = '广州';
        const url = `https://uapis.cn/api/v1/misc/weather?city=${encodeURIComponent(city)}`;
        const response = await fetch(url);
        const data = await response.json();
        // 解析UAPI返回的数据结构
        const weatherData = data;
        const temperature = weatherData.temperature;
        const weatherDesc = weatherData.weather;
        const windDirection = weatherData.wind_direction;
        const windPower = weatherData.wind_power;
        const humidity = weatherData.humidity;
        const reportTime = weatherData.report_time;
        // 获取当前日期和星期
        const now = new Date();
        const dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        const weekdayOptions = { weekday: 'long' };
        const date = now.toLocaleDateString('zh-CN', dateOptions);
        const weekday = now.toLocaleDateString('zh-CN', weekdayOptions);
        weatherInfo.value = {
            date: date,
            weekday: weekday,
            status: `${weatherData.province} ${weatherData.city}`,
            temperature: temperature + '°C',
            weather: weatherDesc,
            wind: `${windDirection} ${windPower}级`,
            airQuality: `湿度: ${humidity}%`,
            notice: `当前天气${weatherDesc}，温度${temperature}°C，请注意适当增减衣物。\n数据更新时间：${reportTime}`
        };
    }
    catch (err) {
        console.error('获取天气数据失败:', err);
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
        };
    }
};
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
    };
    addDialogVisible.value = true;
};
// 保存新增
const saveAdd = async () => {
    try {
        const response = await greenhouseApi.addGreenhouse(addForm.value);
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            ElMessage({
                type: 'success',
                message: '添加成功',
            });
            addDialogVisible.value = false;
            fetchGreenhouseData();
        }
        else {
            ElMessage({
                type: 'error',
                message: response.msg || '添加失败',
            });
        }
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '添加失败',
        });
        console.error('添加温室失败:', error);
    }
};
// 弹窗相关
const detailDialogVisible = ref(false);
const editDialogVisible = ref(false);
const addDialogVisible = ref(false);
const currentGreenhouse = ref(null);
const greenhouseDetections = ref([]);
const editForm = ref({});
const addForm = ref({});
// 查看详情
const viewDetail = async (greenhouse) => {
    try {
        const response = await greenhouseApi.getWithDetections(greenhouse.id);
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            currentGreenhouse.value = response.data;
            greenhouseDetections.value = response.data.detections || [];
            detailDialogVisible.value = true;
        }
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '获取温室详情失败',
        });
        console.error('获取温室详情失败:', error);
    }
};
// 编辑温室
const editGreenhouse = (greenhouse) => {
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
    };
    editDialogVisible.value = true;
};
// 保存编辑
const saveEdit = async () => {
    try {
        const response = await greenhouseApi.updateGreenhouse(editForm.value);
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            ElMessage({
                type: 'success',
                message: '更新成功',
            });
            editDialogVisible.value = false;
            fetchGreenhouseData();
        }
        else {
            ElMessage({
                type: 'error',
                message: response.msg || '更新失败',
            });
        }
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '更新失败',
        });
        console.error('更新温室失败:', error);
    }
};
// 删除温室
const deleteGreenhouse = (greenhouse) => {
    ElMessageBox.confirm(`确定要删除温室【${greenhouse.name}】吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            const response = await greenhouseApi.deleteGreenhouse(greenhouse.id.toString());
            if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
                ElMessage({
                    type: 'success',
                    message: '删除成功',
                });
                fetchGreenhouseData();
            }
            else {
                ElMessage({
                    type: 'error',
                    message: response.msg || '删除失败',
                });
            }
        }
        catch (error) {
            ElMessage({
                type: 'error',
                message: '删除失败',
            });
            console.error('删除温室失败:', error);
        }
    }).catch(() => { });
};
// 刷新数据
const refreshData = () => {
    fetchGreenhouseData();
    fetchWeatherData();
};
onMounted(() => {
    fetchGreenhouseData(); // 获取温室数据
    fetchWeatherData(); // 获取天气数据
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
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-refresh']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-refresh']} */ ;
/** @type {__VLS_StyleScopedClasses['greenhouse-item']} */ ;
/** @type {__VLS_StyleScopedClasses['status']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-info']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-info']} */ ;
/** @type {__VLS_StyleScopedClasses['env-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['env-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['last-updated']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['last-updated']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-edit']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-edit']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-delete']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-delete']} */ ;
/** @type {__VLS_StyleScopedClasses['greenhouse-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['greenhouse-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['env-data']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
/** @type {__VLS_StyleScopedClasses['detection-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['detection-detail']} */ ;
/** @type {__VLS_StyleScopedClasses['value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "greenhouse-container" },
});
/** @type {__VLS_StyleScopedClasses['greenhouse-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "content" },
});
/** @type {__VLS_StyleScopedClasses['content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "greenhouse-section" },
});
/** @type {__VLS_StyleScopedClasses['greenhouse-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-header" },
});
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-actions" },
});
/** @type {__VLS_StyleScopedClasses['card-actions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.addGreenhouse) },
    ...{ class: "btn-add" },
    disabled: (__VLS_ctx.loading),
});
/** @type {__VLS_StyleScopedClasses['btn-add']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.refreshData) },
    ...{ class: "btn-refresh" },
    disabled: (__VLS_ctx.loading),
});
/** @type {__VLS_StyleScopedClasses['btn-refresh']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-body" },
});
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "greenhouse-grid" },
});
/** @type {__VLS_StyleScopedClasses['greenhouse-grid']} */ ;
for (const [greenhouse] of __VLS_vFor((__VLS_ctx.greenhouses))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (greenhouse.id),
        ...{ class: "greenhouse-item" },
    });
    /** @type {__VLS_StyleScopedClasses['greenhouse-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "greenhouse-header" },
    });
    /** @type {__VLS_StyleScopedClasses['greenhouse-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "greenhouse-name" },
    });
    /** @type {__VLS_StyleScopedClasses['greenhouse-name']} */ ;
    (greenhouse.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status" },
        ...{ class: ({ 'warning': greenhouse.status === '需要关注' }) },
    });
    /** @type {__VLS_StyleScopedClasses['status']} */ ;
    /** @type {__VLS_StyleScopedClasses['warning']} */ ;
    (greenhouse.status);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "greenhouse-content" },
    });
    /** @type {__VLS_StyleScopedClasses['greenhouse-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "crop-info" },
    });
    /** @type {__VLS_StyleScopedClasses['crop-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (greenhouse.crop);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "env-data" },
    });
    /** @type {__VLS_StyleScopedClasses['env-data']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "env-item" },
    });
    /** @type {__VLS_StyleScopedClasses['env-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (greenhouse.temperature);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "env-item" },
    });
    /** @type {__VLS_StyleScopedClasses['env-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (greenhouse.humidity);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "env-item" },
    });
    /** @type {__VLS_StyleScopedClasses['env-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (greenhouse.light);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "env-item" },
    });
    /** @type {__VLS_StyleScopedClasses['env-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (greenhouse.soilMoisture);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "last-updated" },
    });
    /** @type {__VLS_StyleScopedClasses['last-updated']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (greenhouse.lastUpdated);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "greenhouse-actions" },
    });
    /** @type {__VLS_StyleScopedClasses['greenhouse-actions']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.viewDetail(greenhouse);
                // @ts-ignore
                [addGreenhouse, loading, loading, refreshData, greenhouses, viewDetail,];
            } },
        ...{ class: "btn-detail" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-detail']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.editGreenhouse(greenhouse);
                // @ts-ignore
                [editGreenhouse,];
            } },
        ...{ class: "btn-edit" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-edit']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.deleteGreenhouse(greenhouse);
                // @ts-ignore
                [deleteGreenhouse,];
            } },
        ...{ class: "btn-delete" },
    });
    /** @type {__VLS_StyleScopedClasses['btn-delete']} */ ;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['pagination-wrapper']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    pageSizes: ([3, 6, 9, 12]),
    total: (__VLS_ctx.total),
    layout: "total, sizes, prev, pager, next, jumper",
}));
const __VLS_2 = __VLS_1({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.currentPage),
    pageSize: (__VLS_ctx.pageSize),
    pageSizes: ([3, 6, 9, 12]),
    total: (__VLS_ctx.total),
    layout: "total, sizes, prev, pager, next, jumper",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.handleSizeChange) });
const __VLS_7 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.handlePageChange) });
var __VLS_3;
var __VLS_4;
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "温室详情",
    width: "700px",
    closeOnClickModal: (false),
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.detailDialogVisible),
    title: "温室详情",
    width: "700px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
const { default: __VLS_13 } = __VLS_11.slots;
if (__VLS_ctx.currentGreenhouse) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-content" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.greenhouseName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.cropType);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.quantity);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.growthStatus);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.manager);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.recordTime);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.totalDiseaseCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.temperature);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.airHumidity);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.soilHumidity);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.lightIntensity);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.co2Concentration);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-item" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.currentGreenhouse.greenhouse?.soilPh);
    if (__VLS_ctx.greenhouseDetections.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detail-section" },
        });
        /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "detection-list" },
        });
        /** @type {__VLS_StyleScopedClasses['detection-list']} */ ;
        for (const [detection, index] of __VLS_vFor((__VLS_ctx.greenhouseDetections))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (index),
                ...{ class: "detection-item" },
            });
            /** @type {__VLS_StyleScopedClasses['detection-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                ...{ class: "detection-header" },
            });
            /** @type {__VLS_StyleScopedClasses['detection-header']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "detection-time" },
            });
            /** @type {__VLS_StyleScopedClasses['detection-time']} */ ;
            (detection.recordTime);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "detection-count" },
            });
            /** @type {__VLS_StyleScopedClasses['detection-count']} */ ;
            (detection.diseaseCount);
            if (detection.diseaseType) {
                __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                    ...{ class: "detection-detail" },
                });
                /** @type {__VLS_StyleScopedClasses['detection-detail']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "label" },
                });
                /** @type {__VLS_StyleScopedClasses['label']} */ ;
                __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                    ...{ class: "value" },
                });
                /** @type {__VLS_StyleScopedClasses['value']} */ ;
                (detection.diseaseType);
            }
            // @ts-ignore
            [currentPage, pageSize, total, handleSizeChange, handlePageChange, detailDialogVisible, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, currentGreenhouse, greenhouseDetections, greenhouseDetections,];
        }
    }
}
// @ts-ignore
[];
var __VLS_11;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    modelValue: (__VLS_ctx.editDialogVisible),
    title: "编辑温室",
    width: "500px",
    closeOnClickModal: (false),
}));
const __VLS_16 = __VLS_15({
    modelValue: (__VLS_ctx.editDialogVisible),
    title: "编辑温室",
    width: "500px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_19 } = __VLS_17.slots;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    model: (__VLS_ctx.editForm),
    labelWidth: "100px",
}));
const __VLS_22 = __VLS_21({
    model: (__VLS_ctx.editForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
const { default: __VLS_25 } = __VLS_23.slots;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    label: "温室名称",
}));
const __VLS_28 = __VLS_27({
    label: "温室名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
const { default: __VLS_31 } = __VLS_29.slots;
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.editForm.greenhouseName),
    placeholder: "请输入温室名称",
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.editForm.greenhouseName),
    placeholder: "请输入温室名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
// @ts-ignore
[editDialogVisible, editForm, editForm,];
var __VLS_29;
let __VLS_37;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    label: "作物类型",
}));
const __VLS_39 = __VLS_38({
    label: "作物类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const { default: __VLS_42 } = __VLS_40.slots;
let __VLS_43;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    modelValue: (__VLS_ctx.editForm.cropType),
    placeholder: "请输入作物类型",
}));
const __VLS_45 = __VLS_44({
    modelValue: (__VLS_ctx.editForm.cropType),
    placeholder: "请输入作物类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
// @ts-ignore
[editForm,];
var __VLS_40;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    label: "种植数量",
}));
const __VLS_50 = __VLS_49({
    label: "种植数量",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const { default: __VLS_53 } = __VLS_51.slots;
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    modelValue: (__VLS_ctx.editForm.quantity),
    min: (0),
}));
const __VLS_56 = __VLS_55({
    modelValue: (__VLS_ctx.editForm.quantity),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
// @ts-ignore
[editForm,];
var __VLS_51;
let __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    label: "生长状态",
}));
const __VLS_61 = __VLS_60({
    label: "生长状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
const { default: __VLS_64 } = __VLS_62.slots;
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    modelValue: (__VLS_ctx.editForm.growthStatus),
    placeholder: "请输入生长状态",
}));
const __VLS_67 = __VLS_66({
    modelValue: (__VLS_ctx.editForm.growthStatus),
    placeholder: "请输入生长状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
// @ts-ignore
[editForm,];
var __VLS_62;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    label: "温度",
}));
const __VLS_72 = __VLS_71({
    label: "温度",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
let __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    modelValue: (__VLS_ctx.editForm.temperature),
    step: (0.1),
}));
const __VLS_78 = __VLS_77({
    modelValue: (__VLS_ctx.editForm.temperature),
    step: (0.1),
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
// @ts-ignore
[editForm,];
var __VLS_73;
let __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
    label: "空气湿度",
}));
const __VLS_83 = __VLS_82({
    label: "空气湿度",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
const { default: __VLS_86 } = __VLS_84.slots;
let __VLS_87;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
    modelValue: (__VLS_ctx.editForm.airHumidity),
    min: (0),
    max: (100),
}));
const __VLS_89 = __VLS_88({
    modelValue: (__VLS_ctx.editForm.airHumidity),
    min: (0),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
// @ts-ignore
[editForm,];
var __VLS_84;
let __VLS_92;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
    label: "土壤湿度",
}));
const __VLS_94 = __VLS_93({
    label: "土壤湿度",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
const { default: __VLS_97 } = __VLS_95.slots;
let __VLS_98;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
    modelValue: (__VLS_ctx.editForm.soilHumidity),
    min: (0),
    max: (100),
}));
const __VLS_100 = __VLS_99({
    modelValue: (__VLS_ctx.editForm.soilHumidity),
    min: (0),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
// @ts-ignore
[editForm,];
var __VLS_95;
let __VLS_103;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
    label: "CO2浓度",
}));
const __VLS_105 = __VLS_104({
    label: "CO2浓度",
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
const { default: __VLS_108 } = __VLS_106.slots;
let __VLS_109;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
    modelValue: (__VLS_ctx.editForm.co2Concentration),
    min: (0),
}));
const __VLS_111 = __VLS_110({
    modelValue: (__VLS_ctx.editForm.co2Concentration),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_110));
// @ts-ignore
[editForm,];
var __VLS_106;
let __VLS_114;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
    label: "土壤pH值",
}));
const __VLS_116 = __VLS_115({
    label: "土壤pH值",
}, ...__VLS_functionalComponentArgsRest(__VLS_115));
const { default: __VLS_119 } = __VLS_117.slots;
let __VLS_120;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.editForm.soilPh),
    step: (0.1),
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.editForm.soilPh),
    step: (0.1),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
// @ts-ignore
[editForm,];
var __VLS_117;
let __VLS_125;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
    label: "光照强度",
}));
const __VLS_127 = __VLS_126({
    label: "光照强度",
}, ...__VLS_functionalComponentArgsRest(__VLS_126));
const { default: __VLS_130 } = __VLS_128.slots;
let __VLS_131;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
    modelValue: (__VLS_ctx.editForm.lightIntensity),
    min: (0),
}));
const __VLS_133 = __VLS_132({
    modelValue: (__VLS_ctx.editForm.lightIntensity),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_132));
// @ts-ignore
[editForm,];
var __VLS_128;
let __VLS_136;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent1(__VLS_136, new __VLS_136({
    label: "管理员",
}));
const __VLS_138 = __VLS_137({
    label: "管理员",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
const { default: __VLS_141 } = __VLS_139.slots;
let __VLS_142;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({
    modelValue: (__VLS_ctx.editForm.manager),
    placeholder: "请输入管理员",
}));
const __VLS_144 = __VLS_143({
    modelValue: (__VLS_ctx.editForm.manager),
    placeholder: "请输入管理员",
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
// @ts-ignore
[editForm,];
var __VLS_139;
let __VLS_147;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
    label: "记录时间",
}));
const __VLS_149 = __VLS_148({
    label: "记录时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_148));
const { default: __VLS_152 } = __VLS_150.slots;
let __VLS_153;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({
    modelValue: (__VLS_ctx.editForm.recordTime),
    placeholder: "请输入记录时间",
}));
const __VLS_155 = __VLS_154({
    modelValue: (__VLS_ctx.editForm.recordTime),
    placeholder: "请输入记录时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
// @ts-ignore
[editForm,];
var __VLS_150;
// @ts-ignore
[];
var __VLS_23;
{
    const { footer: __VLS_158 } = __VLS_17.slots;
    let __VLS_159;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({
        ...{ 'onClick': {} },
    }));
    const __VLS_161 = __VLS_160({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    let __VLS_164;
    const __VLS_165 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.editDialogVisible = false;
                // @ts-ignore
                [editDialogVisible,];
            } });
    const { default: __VLS_166 } = __VLS_162.slots;
    // @ts-ignore
    [];
    var __VLS_162;
    var __VLS_163;
    let __VLS_167;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_169 = __VLS_168({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_168));
    let __VLS_172;
    const __VLS_173 = ({ click: {} },
        { onClick: (__VLS_ctx.saveEdit) });
    const { default: __VLS_174 } = __VLS_170.slots;
    // @ts-ignore
    [saveEdit,];
    var __VLS_170;
    var __VLS_171;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_17;
let __VLS_175;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({
    modelValue: (__VLS_ctx.addDialogVisible),
    title: "新增温室",
    width: "500px",
    closeOnClickModal: (false),
}));
const __VLS_177 = __VLS_176({
    modelValue: (__VLS_ctx.addDialogVisible),
    title: "新增温室",
    width: "500px",
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_176));
const { default: __VLS_180 } = __VLS_178.slots;
let __VLS_181;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
    model: (__VLS_ctx.addForm),
    labelWidth: "100px",
}));
const __VLS_183 = __VLS_182({
    model: (__VLS_ctx.addForm),
    labelWidth: "100px",
}, ...__VLS_functionalComponentArgsRest(__VLS_182));
const { default: __VLS_186 } = __VLS_184.slots;
let __VLS_187;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_188 = __VLS_asFunctionalComponent1(__VLS_187, new __VLS_187({
    label: "温室名称",
}));
const __VLS_189 = __VLS_188({
    label: "温室名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_188));
const { default: __VLS_192 } = __VLS_190.slots;
let __VLS_193;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193({
    modelValue: (__VLS_ctx.addForm.greenhouseName),
    placeholder: "请输入温室名称",
}));
const __VLS_195 = __VLS_194({
    modelValue: (__VLS_ctx.addForm.greenhouseName),
    placeholder: "请输入温室名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
// @ts-ignore
[addDialogVisible, addForm, addForm,];
var __VLS_190;
let __VLS_198;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_199 = __VLS_asFunctionalComponent1(__VLS_198, new __VLS_198({
    label: "作物类型",
}));
const __VLS_200 = __VLS_199({
    label: "作物类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_199));
const { default: __VLS_203 } = __VLS_201.slots;
let __VLS_204;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({
    modelValue: (__VLS_ctx.addForm.cropType),
    placeholder: "请输入作物类型",
}));
const __VLS_206 = __VLS_205({
    modelValue: (__VLS_ctx.addForm.cropType),
    placeholder: "请输入作物类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
// @ts-ignore
[addForm,];
var __VLS_201;
let __VLS_209;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_210 = __VLS_asFunctionalComponent1(__VLS_209, new __VLS_209({
    label: "种植数量",
}));
const __VLS_211 = __VLS_210({
    label: "种植数量",
}, ...__VLS_functionalComponentArgsRest(__VLS_210));
const { default: __VLS_214 } = __VLS_212.slots;
let __VLS_215;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_216 = __VLS_asFunctionalComponent1(__VLS_215, new __VLS_215({
    modelValue: (__VLS_ctx.addForm.quantity),
    min: (0),
}));
const __VLS_217 = __VLS_216({
    modelValue: (__VLS_ctx.addForm.quantity),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_216));
// @ts-ignore
[addForm,];
var __VLS_212;
let __VLS_220;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_221 = __VLS_asFunctionalComponent1(__VLS_220, new __VLS_220({
    label: "生长状态",
}));
const __VLS_222 = __VLS_221({
    label: "生长状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_221));
const { default: __VLS_225 } = __VLS_223.slots;
let __VLS_226;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_227 = __VLS_asFunctionalComponent1(__VLS_226, new __VLS_226({
    modelValue: (__VLS_ctx.addForm.growthStatus),
    placeholder: "请输入生长状态",
}));
const __VLS_228 = __VLS_227({
    modelValue: (__VLS_ctx.addForm.growthStatus),
    placeholder: "请输入生长状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_227));
// @ts-ignore
[addForm,];
var __VLS_223;
let __VLS_231;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_232 = __VLS_asFunctionalComponent1(__VLS_231, new __VLS_231({
    label: "温度",
}));
const __VLS_233 = __VLS_232({
    label: "温度",
}, ...__VLS_functionalComponentArgsRest(__VLS_232));
const { default: __VLS_236 } = __VLS_234.slots;
let __VLS_237;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_238 = __VLS_asFunctionalComponent1(__VLS_237, new __VLS_237({
    modelValue: (__VLS_ctx.addForm.temperature),
    step: (0.1),
}));
const __VLS_239 = __VLS_238({
    modelValue: (__VLS_ctx.addForm.temperature),
    step: (0.1),
}, ...__VLS_functionalComponentArgsRest(__VLS_238));
// @ts-ignore
[addForm,];
var __VLS_234;
let __VLS_242;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_243 = __VLS_asFunctionalComponent1(__VLS_242, new __VLS_242({
    label: "空气湿度",
}));
const __VLS_244 = __VLS_243({
    label: "空气湿度",
}, ...__VLS_functionalComponentArgsRest(__VLS_243));
const { default: __VLS_247 } = __VLS_245.slots;
let __VLS_248;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_249 = __VLS_asFunctionalComponent1(__VLS_248, new __VLS_248({
    modelValue: (__VLS_ctx.addForm.airHumidity),
    min: (0),
    max: (100),
}));
const __VLS_250 = __VLS_249({
    modelValue: (__VLS_ctx.addForm.airHumidity),
    min: (0),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_249));
// @ts-ignore
[addForm,];
var __VLS_245;
let __VLS_253;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_254 = __VLS_asFunctionalComponent1(__VLS_253, new __VLS_253({
    label: "土壤湿度",
}));
const __VLS_255 = __VLS_254({
    label: "土壤湿度",
}, ...__VLS_functionalComponentArgsRest(__VLS_254));
const { default: __VLS_258 } = __VLS_256.slots;
let __VLS_259;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_260 = __VLS_asFunctionalComponent1(__VLS_259, new __VLS_259({
    modelValue: (__VLS_ctx.addForm.soilHumidity),
    min: (0),
    max: (100),
}));
const __VLS_261 = __VLS_260({
    modelValue: (__VLS_ctx.addForm.soilHumidity),
    min: (0),
    max: (100),
}, ...__VLS_functionalComponentArgsRest(__VLS_260));
// @ts-ignore
[addForm,];
var __VLS_256;
let __VLS_264;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent1(__VLS_264, new __VLS_264({
    label: "CO2浓度",
}));
const __VLS_266 = __VLS_265({
    label: "CO2浓度",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
const { default: __VLS_269 } = __VLS_267.slots;
let __VLS_270;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_271 = __VLS_asFunctionalComponent1(__VLS_270, new __VLS_270({
    modelValue: (__VLS_ctx.addForm.co2Concentration),
    min: (0),
}));
const __VLS_272 = __VLS_271({
    modelValue: (__VLS_ctx.addForm.co2Concentration),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_271));
// @ts-ignore
[addForm,];
var __VLS_267;
let __VLS_275;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_276 = __VLS_asFunctionalComponent1(__VLS_275, new __VLS_275({
    label: "土壤pH值",
}));
const __VLS_277 = __VLS_276({
    label: "土壤pH值",
}, ...__VLS_functionalComponentArgsRest(__VLS_276));
const { default: __VLS_280 } = __VLS_278.slots;
let __VLS_281;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_282 = __VLS_asFunctionalComponent1(__VLS_281, new __VLS_281({
    modelValue: (__VLS_ctx.addForm.soilPh),
    step: (0.1),
}));
const __VLS_283 = __VLS_282({
    modelValue: (__VLS_ctx.addForm.soilPh),
    step: (0.1),
}, ...__VLS_functionalComponentArgsRest(__VLS_282));
// @ts-ignore
[addForm,];
var __VLS_278;
let __VLS_286;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_287 = __VLS_asFunctionalComponent1(__VLS_286, new __VLS_286({
    label: "光照强度",
}));
const __VLS_288 = __VLS_287({
    label: "光照强度",
}, ...__VLS_functionalComponentArgsRest(__VLS_287));
const { default: __VLS_291 } = __VLS_289.slots;
let __VLS_292;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_293 = __VLS_asFunctionalComponent1(__VLS_292, new __VLS_292({
    modelValue: (__VLS_ctx.addForm.lightIntensity),
    min: (0),
}));
const __VLS_294 = __VLS_293({
    modelValue: (__VLS_ctx.addForm.lightIntensity),
    min: (0),
}, ...__VLS_functionalComponentArgsRest(__VLS_293));
// @ts-ignore
[addForm,];
var __VLS_289;
let __VLS_297;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_298 = __VLS_asFunctionalComponent1(__VLS_297, new __VLS_297({
    label: "管理员",
}));
const __VLS_299 = __VLS_298({
    label: "管理员",
}, ...__VLS_functionalComponentArgsRest(__VLS_298));
const { default: __VLS_302 } = __VLS_300.slots;
let __VLS_303;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_304 = __VLS_asFunctionalComponent1(__VLS_303, new __VLS_303({
    modelValue: (__VLS_ctx.addForm.manager),
    placeholder: "请输入管理员",
}));
const __VLS_305 = __VLS_304({
    modelValue: (__VLS_ctx.addForm.manager),
    placeholder: "请输入管理员",
}, ...__VLS_functionalComponentArgsRest(__VLS_304));
// @ts-ignore
[addForm,];
var __VLS_300;
let __VLS_308;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent1(__VLS_308, new __VLS_308({
    label: "记录时间",
}));
const __VLS_310 = __VLS_309({
    label: "记录时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_309));
const { default: __VLS_313 } = __VLS_311.slots;
let __VLS_314;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_315 = __VLS_asFunctionalComponent1(__VLS_314, new __VLS_314({
    modelValue: (__VLS_ctx.addForm.recordTime),
    placeholder: "请输入记录时间",
}));
const __VLS_316 = __VLS_315({
    modelValue: (__VLS_ctx.addForm.recordTime),
    placeholder: "请输入记录时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_315));
// @ts-ignore
[addForm,];
var __VLS_311;
// @ts-ignore
[];
var __VLS_184;
{
    const { footer: __VLS_319 } = __VLS_178.slots;
    let __VLS_320;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_321 = __VLS_asFunctionalComponent1(__VLS_320, new __VLS_320({
        ...{ 'onClick': {} },
    }));
    const __VLS_322 = __VLS_321({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_321));
    let __VLS_325;
    const __VLS_326 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.addDialogVisible = false;
                // @ts-ignore
                [addDialogVisible,];
            } });
    const { default: __VLS_327 } = __VLS_323.slots;
    // @ts-ignore
    [];
    var __VLS_323;
    var __VLS_324;
    let __VLS_328;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_329 = __VLS_asFunctionalComponent1(__VLS_328, new __VLS_328({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_330 = __VLS_329({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_329));
    let __VLS_333;
    const __VLS_334 = ({ click: {} },
        { onClick: (__VLS_ctx.saveAdd) });
    const { default: __VLS_335 } = __VLS_331.slots;
    // @ts-ignore
    [saveAdd,];
    var __VLS_331;
    var __VLS_332;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_178;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
