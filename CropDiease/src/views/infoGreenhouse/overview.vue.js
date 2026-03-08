import { ref, onMounted, computed } from 'vue';
import { useStatisticsApi } from '/@/api/statistics';
import { useGreenhouseApi } from '/@/api/greenhouse';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
use([
    CanvasRenderer,
    LineChart,
    BarChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent
]);
const statisticsApi = useStatisticsApi();
const greenhouseApi = useGreenhouseApi();
// 数据
const statistics = ref({
    users: 0,
    greenhouse: 0,
    diseases: 0,
    yield: 0,
    detectionRate: 0,
    preventionRate: 0
});
// 温室数据
const cropTypes = ref([]);
const loading = ref(false);
// 分页相关
const currentPage = ref(1);
const pageSize = ref(6);
const total = ref(0);
// 格式化检测率（保留两位小数）
const formattedDetectionRate = computed(() => {
    return Number(statistics.value.detectionRate).toFixed(2);
});
// 格式化预防率（保留两位小数）
const formattedPreventionRate = computed(() => {
    return Number(statistics.value.preventionRate).toFixed(2);
});
// 获取统计概览数据
const fetchStatistics = async () => {
    try {
        const res = await statisticsApi.getStatisticsOverview();
        if ((res.code === '200' || res.code === 200 || res.code === '0' || res.code === 0) && res.data) {
            statistics.value = {
                users: res.data.userCount || 0,
                greenhouse: res.data.greenhouseCount || 0,
                diseases: res.data.diseaseCount || 0,
                yield: res.data.totalProduction || 0,
                detectionRate: res.data.detectionRate || 0,
                preventionRate: res.data.preventionRate || 0
            };
        }
    }
    catch (error) {
        console.error('获取统计概览数据失败:', error);
    }
};
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
            cropTypes.value = data.map((item) => {
                const gh = item.greenhouse || {};
                const healthRate = gh.quantity > 0
                    ? Math.max(0, Math.min(100, ((gh.quantity - (item.totalDiseaseCount || 0)) / gh.quantity) * 100))
                    : 0;
                return {
                    name: gh.greenhouseName || `${gh.id}号温室`,
                    crop: gh.cropType || '未知作物',
                    status: (item.totalDiseaseCount || 0) > 5 ? '需要关注' : '生长良好',
                    plantCount: gh.quantity || 0,
                    diseaseCount: item.totalDiseaseCount || 0,
                    healthRate: Number(healthRate.toFixed(1)),
                    temperature: gh.temperature || 0,
                    airHumidity: gh.airHumidity || 0,
                    soilHumidity: gh.soilHumidity || 0,
                    co2Concentration: gh.co2Concentration || 0,
                    lightIntensity: gh.lightIntensity || 0
                };
            });
        }
    }
    catch (error) {
        console.error('获取温室数据失败:', error);
        total.value = 9;
        // 模拟数据
        cropTypes.value = [
            { name: '1号温室', crop: '玉米', status: '生长良好', plantCount: 350, diseaseCount: 20, healthRate: 94.3, temperature: 24, airHumidity: 50, soilHumidity: 24, co2Concentration: 12, lightIntensity: 23 },
            { name: '2号温室', crop: '水稻', status: '生长良好', plantCount: 400, diseaseCount: 15, healthRate: 96.3, temperature: 30, airHumidity: 75, soilHumidity: 45, co2Concentration: 15, lightIntensity: 25 },
            { name: '3号温室', crop: '小麦', status: '需要关注', plantCount: 350, diseaseCount: 18, healthRate: 94.9, temperature: 22, airHumidity: 60, soilHumidity: 30, co2Concentration: 10, lightIntensity: 20 }
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
// 温度趋势图表配置
const temperatureChartOption = computed(() => {
    const greenhouseNames = cropTypes.value.map((item) => item.name);
    const temperatures = cropTypes.value.map((item) => item.temperature);
    return {
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: greenhouseNames,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '温度(°C)'
        },
        series: [
            {
                name: '温度',
                type: 'line',
                data: temperatures,
                smooth: true,
                itemStyle: {
                    color: '#ff6b6b'
                },
                areaStyle: {
                    color: 'rgba(255, 107, 107, 0.2)'
                }
            }
        ]
    };
});
// 湿度趋势图表配置
const humidityChartOption = computed(() => {
    const greenhouseNames = cropTypes.value.map((item) => item.name);
    const airHumidity = cropTypes.value.map((item) => item.airHumidity);
    const soilHumidity = cropTypes.value.map((item) => item.soilHumidity);
    return {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['空气湿度', '土壤湿度']
        },
        xAxis: {
            type: 'category',
            data: greenhouseNames,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '湿度(%)'
        },
        series: [
            {
                name: '空气湿度',
                type: 'bar',
                data: airHumidity,
                itemStyle: {
                    color: '#4ecdc4'
                }
            },
            {
                name: '土壤湿度',
                type: 'bar',
                data: soilHumidity,
                itemStyle: {
                    color: '#45b7d1'
                }
            }
        ]
    };
});
// 病虫害数量图表配置
const diseaseChartOption = computed(() => {
    const greenhouseNames = cropTypes.value.map((item) => item.name);
    const diseaseCounts = cropTypes.value.map((item) => item.diseaseCount);
    return {
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: greenhouseNames,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '数量'
        },
        series: [
            {
                name: '病虫害数量',
                type: 'bar',
                data: diseaseCounts,
                itemStyle: {
                    color: '#ff6b6b'
                }
            }
        ]
    };
});
// 健康率图表配置
const healthChartOption = computed(() => {
    const greenhouseNames = cropTypes.value.map((item) => item.name);
    const healthRates = cropTypes.value.map((item) => item.healthRate);
    return {
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: greenhouseNames,
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: '健康率(%)',
            min: 0,
            max: 100
        },
        series: [
            {
                name: '健康率',
                type: 'line',
                data: healthRates,
                smooth: true,
                itemStyle: {
                    color: '#28a745'
                },
                areaStyle: {
                    color: 'rgba(40, 167, 69, 0.2)'
                }
            }
        ]
    };
});
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
// 获取天气数据
const fetchWeatherData = async () => {
    try {
        const response = await fetch('https://restapi.amap.com/v3/weather/weatherInfo?key=4c4e6d5b8a2c4d9e8b7a6c5d4e3f2a1b&city=440100&extensions=base');
        const data = await response.json();
        if (data.status === '1' && data.lives && data.lives.length > 0) {
            const weatherData = data.lives[0];
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
onMounted(() => {
    fetchStatistics();
    fetchGreenhouseData();
    fetchWeatherData();
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
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-item']} */ ;
/** @type {__VLS_StyleScopedClasses['status']} */ ;
/** @type {__VLS_StyleScopedClasses['health-rate']} */ ;
/** @type {__VLS_StyleScopedClasses['health-rate']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['charts-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "data-view-container" },
});
/** @type {__VLS_StyleScopedClasses['data-view-container']} */ ;
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
    ...{ class: "overview-section" },
});
/** @type {__VLS_StyleScopedClasses['overview-section']} */ ;
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
    ...{ class: "card-body" },
});
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-grid" },
});
/** @type {__VLS_StyleScopedClasses['stats-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-item" },
});
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "用户",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statistics.users);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-item" },
});
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=greenhouse%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "温室",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statistics.greenhouse);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-item" },
});
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=disease%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "病害",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statistics.diseases);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-item" },
});
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yield%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "产量",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.statistics.yield);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-item" },
});
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=detection%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "检测率",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formattedDetectionRate);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-item" },
});
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-icon" },
});
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=prevention%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "预防率",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-info" },
});
/** @type {__VLS_StyleScopedClasses['stat-info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.formattedPreventionRate);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "crop-section" },
});
/** @type {__VLS_StyleScopedClasses['crop-section']} */ ;
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
    ...{ class: "card-body" },
});
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "crop-grid" },
});
/** @type {__VLS_StyleScopedClasses['crop-grid']} */ ;
for (const [item, index] of __VLS_vFor((__VLS_ctx.cropTypes))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: "crop-item" },
    });
    /** @type {__VLS_StyleScopedClasses['crop-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "crop-header" },
    });
    /** @type {__VLS_StyleScopedClasses['crop-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "greenhouse-name" },
    });
    /** @type {__VLS_StyleScopedClasses['greenhouse-name']} */ ;
    (item.name);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "status" },
        ...{ class: ({ 'warning': item.status === '需要关注' }) },
    });
    /** @type {__VLS_StyleScopedClasses['status']} */ ;
    /** @type {__VLS_StyleScopedClasses['warning']} */ ;
    (item.status);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "crop-content" },
    });
    /** @type {__VLS_StyleScopedClasses['crop-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "crop-type" },
    });
    /** @type {__VLS_StyleScopedClasses['crop-type']} */ ;
    (item.crop);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "crop-numbers" },
    });
    /** @type {__VLS_StyleScopedClasses['crop-numbers']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "plant-count" },
    });
    /** @type {__VLS_StyleScopedClasses['plant-count']} */ ;
    (item.plantCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "disease-count" },
    });
    /** @type {__VLS_StyleScopedClasses['disease-count']} */ ;
    (item.diseaseCount);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "health-rate" },
    });
    /** @type {__VLS_StyleScopedClasses['health-rate']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "progress-bar" },
    });
    /** @type {__VLS_StyleScopedClasses['progress-bar']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "progress" },
        ...{ style: ({ width: item.healthRate + '%' }) },
    });
    /** @type {__VLS_StyleScopedClasses['progress']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (item.healthRate);
    // @ts-ignore
    [statistics, statistics, statistics, statistics, formattedDetectionRate, formattedPreventionRate, cropTypes,];
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "charts-section" },
});
/** @type {__VLS_StyleScopedClasses['charts-section']} */ ;
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
    ...{ class: "card-body" },
});
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "charts-grid" },
});
/** @type {__VLS_StyleScopedClasses['charts-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
let __VLS_8;
/** @ts-ignore @type {typeof __VLS_components.vChart | typeof __VLS_components.VChart} */
vChart;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
    option: (__VLS_ctx.temperatureChartOption),
    autoresize: true,
}));
const __VLS_10 = __VLS_9({
    option: (__VLS_ctx.temperatureChartOption),
    autoresize: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.vChart | typeof __VLS_components.VChart} */
vChart;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    option: (__VLS_ctx.humidityChartOption),
    autoresize: true,
}));
const __VLS_15 = __VLS_14({
    option: (__VLS_ctx.humidityChartOption),
    autoresize: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.vChart | typeof __VLS_components.VChart} */
vChart;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    option: (__VLS_ctx.diseaseChartOption),
    autoresize: true,
}));
const __VLS_20 = __VLS_19({
    option: (__VLS_ctx.diseaseChartOption),
    autoresize: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.vChart | typeof __VLS_components.VChart} */
vChart;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    option: (__VLS_ctx.healthChartOption),
    autoresize: true,
}));
const __VLS_25 = __VLS_24({
    option: (__VLS_ctx.healthChartOption),
    autoresize: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
// @ts-ignore
[currentPage, pageSize, total, handleSizeChange, handlePageChange, temperatureChartOption, humidityChartOption, diseaseChartOption, healthChartOption,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
