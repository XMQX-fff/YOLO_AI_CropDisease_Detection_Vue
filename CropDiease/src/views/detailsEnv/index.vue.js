import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useGreenhouseApi } from '/@/api/greenhouse';
const greenhouseApi = useGreenhouseApi();
// 温室ID和时间范围
const currentGreenhouseId = ref(1);
const currentTimeRange = ref('8h');
// 温室列表
const greenhouseList = ref([]);
// 获取温室列表
const fetchGreenhouseList = async () => {
    try {
        const response = await greenhouseApi.getGreenhouseList({});
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const data = response.data.records || response.data.list || response.data;
            greenhouseList.value = data.map((item) => ({
                id: item.id,
                name: item.greenhouseName || `${item.id}号温室`
            }));
            // 设置默认选中的温室
            if (greenhouseList.value.length > 0) {
                currentGreenhouseId.value = greenhouseList.value[0].id;
                // 获取该温室的历史数据
                fetchEnvironmentHistory();
            }
        }
    }
    catch (error) {
        console.error('获取温室列表失败:', error);
        // 使用模拟数据
        greenhouseList.value = [
            { id: 1, name: '1号温室' },
            { id: 2, name: '2号温室' },
            { id: 3, name: '3号温室' },
            { id: 4, name: '4号温室' },
            { id: 5, name: '5号温室' }
        ];
        // 获取第一个温室的历史数据
        fetchEnvironmentHistory();
    }
};
// 环境数据
const envData = ref({
    temperature: {
        value: 25.5,
        unit: '°C',
        min: 15,
        max: 30,
        status: '正常',
        trend: 'stable'
    },
    humidity: {
        value: 65,
        unit: '%',
        min: 40,
        max: 80,
        status: '正常',
        trend: 'rising'
    },
    light: {
        value: 8500,
        unit: 'lux',
        min: 5000,
        max: 12000,
        status: '正常',
        trend: 'stable'
    },
    soilMoisture: {
        value: 45,
        unit: '%',
        min: 30,
        max: 60,
        status: '正常',
        trend: 'falling'
    },
    co2: {
        value: 800,
        unit: 'ppm',
        min: 400,
        max: 1200,
        status: '正常',
        trend: 'stable'
    },
    soilPh: {
        value: 6.5,
        unit: '',
        min: 5.5,
        max: 7.5,
        status: '正常',
        trend: 'stable'
    }
});
// 历史数据
const historyData = ref([
    { time: '08:00', temperature: 22.1, humidity: 70, light: 5000, soilMoisture: 48 },
    { time: '09:00', temperature: 23.2, humidity: 68, light: 6500, soilMoisture: 47 },
    { time: '10:00', temperature: 24.5, humidity: 66, light: 7800, soilMoisture: 46 },
    { time: '11:00', temperature: 25.8, humidity: 64, light: 9200, soilMoisture: 45 },
    { time: '12:00', temperature: 26.5, humidity: 62, light: 10500, soilMoisture: 44 },
    { time: '13:00', temperature: 27.1, humidity: 60, light: 11000, soilMoisture: 43 },
    { time: '14:00', temperature: 26.8, humidity: 61, light: 10800, soilMoisture: 43 },
    { time: '15:00', temperature: 26.2, humidity: 62, light: 9500, soilMoisture: 44 },
    { time: '16:00', temperature: 25.5, humidity: 65, light: 8500, soilMoisture: 45 }
]);
// 图表引用
const temperatureChartRef = ref();
const humidityChartRef = ref();
const lightChartRef = ref();
const soilMoistureChartRef = ref();
const co2ChartRef = ref();
const soilPhChartRef = ref();
// 图表实例
let temperatureChart = null;
let humidityChart = null;
let lightChart = null;
let soilMoistureChart = null;
let co2Chart = null;
let soilPhChart = null;
// 获取环境历史数据
const fetchEnvironmentHistory = async () => {
    try {
        const response = await greenhouseApi.getEnvironmentHistory({
            greenhouseId: currentGreenhouseId.value,
            timeRange: currentTimeRange.value
        });
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const data = response.data;
            // 更新图表数据
            updateCharts(data);
        }
    }
    catch (error) {
        console.error('获取环境历史数据失败:', error);
        // 使用模拟数据
        const mockData = generateEnvData();
        updateCharts(mockData);
    }
};
// 更新图表
const updateCharts = (data) => {
    // 后端返回的是数组格式
    const records = Array.isArray(data) ? data : [];
    // 根据时间范围决定X轴显示格式
    const xAxisData = records.map((item) => {
        const timeStr = item.recordTime || '';
        // 如果是1周或1个月，显示日期（如 "03-01"）
        if (currentTimeRange.value === '1w' || currentTimeRange.value === '1m') {
            const match = timeStr.match(/(\d{4}-\d{2}-\d{2})/);
            if (match) {
                const date = match[1];
                return date.substring(5); // 只显示 "03-01" 格式
            }
            return timeStr;
        }
        // 如果是8小时或1天，显示时间（如 "08:00"）
        const match = timeStr.match(/(\d{2}:\d{2})/);
        return match ? match[1] : timeStr;
    });
    const temperatures = records.map((item) => item.temperature || 0);
    const humidities = records.map((item) => item.airHumidity || 0);
    const lights = records.map((item) => item.lightIntensity || 0);
    const soilMoistures = records.map((item) => item.soilHumidity || 0);
    const co2Concentrations = records.map((item) => item.co2Concentration || 0);
    const soilPhValues = records.map((item) => item.soilPh || 0);
    // 更新温度图表
    if (temperatureChart) {
        temperatureChart.setOption({
            xAxis: { data: xAxisData },
            series: [{ data: temperatures }]
        });
    }
    // 更新湿度图表
    if (humidityChart) {
        humidityChart.setOption({
            xAxis: { data: xAxisData },
            series: [{ data: humidities }]
        });
    }
    // 更新光照图表
    if (lightChart) {
        lightChart.setOption({
            xAxis: { data: xAxisData },
            series: [{ data: lights }]
        });
    }
    // 更新土壤湿度图表
    if (soilMoistureChart) {
        soilMoistureChart.setOption({
            xAxis: { data: xAxisData },
            series: [{ data: soilMoistures }]
        });
    }
    // 更新CO2浓度图表
    if (co2Chart) {
        co2Chart.setOption({
            xAxis: { data: xAxisData },
            series: [{ data: co2Concentrations }]
        });
    }
    // 更新土壤pH值图表
    if (soilPhChart) {
        soilPhChart.setOption({
            xAxis: { data: xAxisData },
            series: [{ data: soilPhValues }]
        });
    }
};
// 生成环境监测历史数据
const generateEnvData = () => {
    const xAxisData = [];
    const temperatures = [];
    const humidities = [];
    const lights = [];
    const soilMoistures = [];
    const co2Concentrations = [];
    const soilPhValues = [];
    // 根据时间范围决定数据点数量和格式
    let dataPoints = 24;
    let isDateMode = false;
    if (currentTimeRange.value === '8h') {
        dataPoints = 8;
        isDateMode = false;
    }
    else if (currentTimeRange.value === '1d') {
        dataPoints = 24;
        isDateMode = false;
    }
    else if (currentTimeRange.value === '1w') {
        dataPoints = 7;
        isDateMode = true;
    }
    else if (currentTimeRange.value === '1m') {
        dataPoints = 30;
        isDateMode = true;
    }
    for (let i = dataPoints - 1; i >= 0; i--) {
        const now = new Date();
        if (isDateMode) {
            // 日期模式：生成日期（如 "03-01"）
            const date = new Date();
            date.setDate(date.getDate() - i);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            xAxisData.push(`${month}-${day}`);
        }
        else {
            // 时间模式：生成时间（如 "08:00"）
            const hour = new Date();
            hour.setHours(hour.getHours() - i);
            xAxisData.push(`${hour.getHours().toString().padStart(2, '0')}:00`);
        }
        // 基于当前环境数据生成合理的波动
        temperatures.push(20 + Math.random() * 10);
        humidities.push(50 + Math.random() * 30);
        lights.push(5000 + Math.random() * 5000);
        soilMoistures.push(35 + Math.random() * 20);
        co2Concentrations.push(350 + Math.random() * 200);
        soilPhValues.push(6.0 + Math.random() * 1.0);
    }
    return { xAxisData, temperatures, humidities, lights, soilMoistures, co2Concentrations, soilPhValues };
};
// 初始化图表
const initCharts = async () => {
    await nextTick();
    const envChartData = generateEnvData();
    // 温度图表
    if (temperatureChartRef.value) {
        temperatureChart = echarts.init(temperatureChartRef.value);
        temperatureChart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: envChartData.xAxisData },
            yAxis: { type: 'value', name: '温度(°C)' },
            series: [{
                    name: '温度',
                    type: 'line',
                    smooth: true,
                    data: envChartData.temperatures,
                    areaStyle: { color: 'rgba(40, 167, 69, 0.1)' },
                    lineStyle: { color: '#28a745' },
                    itemStyle: { color: '#28a745' }
                }]
        });
    }
    // 湿度图表
    if (humidityChartRef.value) {
        humidityChart = echarts.init(humidityChartRef.value);
        humidityChart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: envChartData.xAxisData },
            yAxis: { type: 'value', name: '湿度(%)' },
            series: [{
                    name: '湿度',
                    type: 'line',
                    smooth: true,
                    data: envChartData.humidities,
                    areaStyle: { color: 'rgba(0, 123, 255, 0.1)' },
                    lineStyle: { color: '#007bff' },
                    itemStyle: { color: '#007bff' }
                }]
        });
    }
    // 光照图表
    if (lightChartRef.value) {
        lightChart = echarts.init(lightChartRef.value);
        lightChart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: envChartData.xAxisData },
            yAxis: { type: 'value', name: '光照(lux)' },
            series: [{
                    name: '光照',
                    type: 'line',
                    smooth: true,
                    data: envChartData.lights,
                    areaStyle: { color: 'rgba(255, 193, 7, 0.1)' },
                    lineStyle: { color: '#ffc107' },
                    itemStyle: { color: '#ffc107' }
                }]
        });
    }
    // 土壤湿度图表
    if (soilMoistureChartRef.value) {
        soilMoistureChart = echarts.init(soilMoistureChartRef.value);
        soilMoistureChart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: envChartData.xAxisData },
            yAxis: { type: 'value', name: '土壤湿度(%)' },
            series: [{
                    name: '土壤湿度',
                    type: 'line',
                    smooth: true,
                    data: envChartData.soilMoistures,
                    areaStyle: { color: 'rgba(139, 69, 19, 0.1)' },
                    lineStyle: { color: '#8b4513' },
                    itemStyle: { color: '#8b4513' }
                }]
        });
    }
    // CO2浓度图表
    if (co2ChartRef.value) {
        co2Chart = echarts.init(co2ChartRef.value);
        co2Chart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: envChartData.xAxisData },
            yAxis: { type: 'value', name: 'CO2浓度(ppm)' },
            series: [{
                    name: 'CO2浓度',
                    type: 'line',
                    smooth: true,
                    data: envChartData.co2Concentrations || Array(24).fill(400).map(() => 350 + Math.random() * 200),
                    areaStyle: { color: 'rgba(111, 66, 193, 0.1)' },
                    lineStyle: { color: '#6f42c1' },
                    itemStyle: { color: '#6f42c1' }
                }]
        });
    }
    // 土壤pH值图表
    if (soilPhChartRef.value) {
        soilPhChart = echarts.init(soilPhChartRef.value);
        soilPhChart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: envChartData.xAxisData },
            yAxis: { type: 'value', name: '土壤pH值' },
            series: [{
                    name: '土壤pH值',
                    type: 'line',
                    smooth: true,
                    data: envChartData.soilPhValues || Array(24).fill(6.5).map(() => 6.0 + Math.random() * 1.0),
                    areaStyle: { color: 'rgba(220, 53, 69, 0.1)' },
                    lineStyle: { color: '#dc3545' },
                    itemStyle: { color: '#dc3545' }
                }]
        });
    }
};
// 处理时间范围变化
const handleTimeRangeChange = (event) => {
    const target = event.target;
    currentTimeRange.value = target.value;
    // 重新初始化图表以更新X轴格式
    initCharts();
    // 获取环境历史数据
    fetchEnvironmentHistory();
};
// 处理温室变化
const handleGreenhouseChange = (event) => {
    const target = event.target;
    currentGreenhouseId.value = Number(target.value);
    fetchEnvironmentHistory();
};
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
        const city = '广州';
        const url = `https://uapis.cn/api/v1/misc/weather?city=${encodeURIComponent(city)}`;
        const response = await fetch(url);
        const data = await response.json();
        const weatherData = data;
        const temperature = weatherData.temperature;
        const weatherDesc = weatherData.weather;
        const windDirection = weatherData.wind_direction;
        const windPower = weatherData.wind_power;
        const humidity = weatherData.humidity;
        const reportTime = weatherData.report_time;
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
    fetchWeatherData();
    fetchGreenhouseList();
    initCharts();
});
// 窗口大小变化时调整图表
window.addEventListener('resize', () => {
    temperatureChart?.resize();
    humidityChart?.resize();
    lightChart?.resize();
    soilMoistureChart?.resize();
    co2Chart?.resize();
    soilPhChart?.resize();
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
/** @type {__VLS_StyleScopedClasses['btn-refresh']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-refresh']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-settings']} */ ;
/** @type {__VLS_StyleScopedClasses['env-item']} */ ;
/** @type {__VLS_StyleScopedClasses['env-status']} */ ;
/** @type {__VLS_StyleScopedClasses['env-status']} */ ;
/** @type {__VLS_StyleScopedClasses['env-value']} */ ;
/** @type {__VLS_StyleScopedClasses['env-value']} */ ;
/** @type {__VLS_StyleScopedClasses['env-range']} */ ;
/** @type {__VLS_StyleScopedClasses['env-range']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
/** @type {__VLS_StyleScopedClasses['env-data-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['charts-container']} */ ;
/** @type {__VLS_StyleScopedClasses['env-data-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-monitoring-container" },
});
/** @type {__VLS_StyleScopedClasses['env-monitoring-container']} */ ;
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
    ...{ class: "env-overview-section" },
});
/** @type {__VLS_StyleScopedClasses['env-overview-section']} */ ;
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
    ...{ class: "btn-refresh" },
});
/** @type {__VLS_StyleScopedClasses['btn-refresh']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ class: "btn-settings" },
});
/** @type {__VLS_StyleScopedClasses['btn-settings']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-body" },
});
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-data-grid" },
});
/** @type {__VLS_StyleScopedClasses['env-data-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-item" },
});
/** @type {__VLS_StyleScopedClasses['env-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-header" },
});
/** @type {__VLS_StyleScopedClasses['env-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-name" },
});
/** @type {__VLS_StyleScopedClasses['env-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-status" },
    ...{ class: (__VLS_ctx.envData.temperature.status === '正常' ? 'normal' : 'warning') },
});
/** @type {__VLS_StyleScopedClasses['env-status']} */ ;
(__VLS_ctx.envData.temperature.status);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-value" },
});
/** @type {__VLS_StyleScopedClasses['env-value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.envData.temperature.value);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "unit" },
});
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
(__VLS_ctx.envData.temperature.unit);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-range" },
});
/** @type {__VLS_StyleScopedClasses['env-range']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "min" },
});
/** @type {__VLS_StyleScopedClasses['min']} */ ;
(__VLS_ctx.envData.temperature.min);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-bar" },
});
/** @type {__VLS_StyleScopedClasses['range-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-fill" },
    ...{ style: ({ left: ((__VLS_ctx.envData.temperature.value - __VLS_ctx.envData.temperature.min) / (__VLS_ctx.envData.temperature.max - __VLS_ctx.envData.temperature.min) * 100) + '%', width: '10px' }) },
});
/** @type {__VLS_StyleScopedClasses['range-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "max" },
});
/** @type {__VLS_StyleScopedClasses['max']} */ ;
(__VLS_ctx.envData.temperature.max);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-trend" },
});
/** @type {__VLS_StyleScopedClasses['env-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-label" },
});
/** @type {__VLS_StyleScopedClasses['trend-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-icon" },
    ...{ class: (__VLS_ctx.envData.temperature.trend) },
});
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
if (__VLS_ctx.envData.temperature.trend === 'rising') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.envData.temperature.trend === 'falling') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-item" },
});
/** @type {__VLS_StyleScopedClasses['env-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-header" },
});
/** @type {__VLS_StyleScopedClasses['env-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-name" },
});
/** @type {__VLS_StyleScopedClasses['env-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-status" },
    ...{ class: (__VLS_ctx.envData.humidity.status === '正常' ? 'normal' : 'warning') },
});
/** @type {__VLS_StyleScopedClasses['env-status']} */ ;
(__VLS_ctx.envData.humidity.status);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-value" },
});
/** @type {__VLS_StyleScopedClasses['env-value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.envData.humidity.value);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "unit" },
});
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
(__VLS_ctx.envData.humidity.unit);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-range" },
});
/** @type {__VLS_StyleScopedClasses['env-range']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "min" },
});
/** @type {__VLS_StyleScopedClasses['min']} */ ;
(__VLS_ctx.envData.humidity.min);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-bar" },
});
/** @type {__VLS_StyleScopedClasses['range-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-fill" },
    ...{ style: ({ left: ((__VLS_ctx.envData.humidity.value - __VLS_ctx.envData.humidity.min) / (__VLS_ctx.envData.humidity.max - __VLS_ctx.envData.humidity.min) * 100) + '%', width: '10px' }) },
});
/** @type {__VLS_StyleScopedClasses['range-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "max" },
});
/** @type {__VLS_StyleScopedClasses['max']} */ ;
(__VLS_ctx.envData.humidity.max);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-trend" },
});
/** @type {__VLS_StyleScopedClasses['env-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-label" },
});
/** @type {__VLS_StyleScopedClasses['trend-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-icon" },
    ...{ class: (__VLS_ctx.envData.humidity.trend) },
});
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
if (__VLS_ctx.envData.humidity.trend === 'rising') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.envData.humidity.trend === 'falling') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-item" },
});
/** @type {__VLS_StyleScopedClasses['env-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-header" },
});
/** @type {__VLS_StyleScopedClasses['env-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-name" },
});
/** @type {__VLS_StyleScopedClasses['env-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-status" },
    ...{ class: (__VLS_ctx.envData.light.status === '正常' ? 'normal' : 'warning') },
});
/** @type {__VLS_StyleScopedClasses['env-status']} */ ;
(__VLS_ctx.envData.light.status);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-value" },
});
/** @type {__VLS_StyleScopedClasses['env-value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.envData.light.value);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "unit" },
});
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
(__VLS_ctx.envData.light.unit);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-range" },
});
/** @type {__VLS_StyleScopedClasses['env-range']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "min" },
});
/** @type {__VLS_StyleScopedClasses['min']} */ ;
(__VLS_ctx.envData.light.min);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-bar" },
});
/** @type {__VLS_StyleScopedClasses['range-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-fill" },
    ...{ style: ({ left: ((__VLS_ctx.envData.light.value - __VLS_ctx.envData.light.min) / (__VLS_ctx.envData.light.max - __VLS_ctx.envData.light.min) * 100) + '%', width: '10px' }) },
});
/** @type {__VLS_StyleScopedClasses['range-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "max" },
});
/** @type {__VLS_StyleScopedClasses['max']} */ ;
(__VLS_ctx.envData.light.max);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-trend" },
});
/** @type {__VLS_StyleScopedClasses['env-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-label" },
});
/** @type {__VLS_StyleScopedClasses['trend-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-icon" },
    ...{ class: (__VLS_ctx.envData.light.trend) },
});
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
if (__VLS_ctx.envData.light.trend === 'rising') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.envData.light.trend === 'falling') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-item" },
});
/** @type {__VLS_StyleScopedClasses['env-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-header" },
});
/** @type {__VLS_StyleScopedClasses['env-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-name" },
});
/** @type {__VLS_StyleScopedClasses['env-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-status" },
    ...{ class: (__VLS_ctx.envData.soilMoisture.status === '正常' ? 'normal' : 'warning') },
});
/** @type {__VLS_StyleScopedClasses['env-status']} */ ;
(__VLS_ctx.envData.soilMoisture.status);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-value" },
});
/** @type {__VLS_StyleScopedClasses['env-value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.envData.soilMoisture.value);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "unit" },
});
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
(__VLS_ctx.envData.soilMoisture.unit);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-range" },
});
/** @type {__VLS_StyleScopedClasses['env-range']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "min" },
});
/** @type {__VLS_StyleScopedClasses['min']} */ ;
(__VLS_ctx.envData.soilMoisture.min);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-bar" },
});
/** @type {__VLS_StyleScopedClasses['range-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-fill" },
    ...{ style: ({ left: ((__VLS_ctx.envData.soilMoisture.value - __VLS_ctx.envData.soilMoisture.min) / (__VLS_ctx.envData.soilMoisture.max - __VLS_ctx.envData.soilMoisture.min) * 100) + '%', width: '10px' }) },
});
/** @type {__VLS_StyleScopedClasses['range-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "max" },
});
/** @type {__VLS_StyleScopedClasses['max']} */ ;
(__VLS_ctx.envData.soilMoisture.max);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-trend" },
});
/** @type {__VLS_StyleScopedClasses['env-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-label" },
});
/** @type {__VLS_StyleScopedClasses['trend-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-icon" },
    ...{ class: (__VLS_ctx.envData.soilMoisture.trend) },
});
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
if (__VLS_ctx.envData.soilMoisture.trend === 'rising') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.envData.soilMoisture.trend === 'falling') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-item" },
});
/** @type {__VLS_StyleScopedClasses['env-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-header" },
});
/** @type {__VLS_StyleScopedClasses['env-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-name" },
});
/** @type {__VLS_StyleScopedClasses['env-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-status" },
    ...{ class: (__VLS_ctx.envData.co2.status === '正常' ? 'normal' : 'warning') },
});
/** @type {__VLS_StyleScopedClasses['env-status']} */ ;
(__VLS_ctx.envData.co2.status);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-value" },
});
/** @type {__VLS_StyleScopedClasses['env-value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.envData.co2.value);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "unit" },
});
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
(__VLS_ctx.envData.co2.unit);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-range" },
});
/** @type {__VLS_StyleScopedClasses['env-range']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "min" },
});
/** @type {__VLS_StyleScopedClasses['min']} */ ;
(__VLS_ctx.envData.co2.min);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-bar" },
});
/** @type {__VLS_StyleScopedClasses['range-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-fill" },
    ...{ style: ({ left: ((__VLS_ctx.envData.co2.value - __VLS_ctx.envData.co2.min) / (__VLS_ctx.envData.co2.max - __VLS_ctx.envData.co2.min) * 100) + '%', width: '10px' }) },
});
/** @type {__VLS_StyleScopedClasses['range-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "max" },
});
/** @type {__VLS_StyleScopedClasses['max']} */ ;
(__VLS_ctx.envData.co2.max);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-trend" },
});
/** @type {__VLS_StyleScopedClasses['env-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-label" },
});
/** @type {__VLS_StyleScopedClasses['trend-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-icon" },
    ...{ class: (__VLS_ctx.envData.co2.trend) },
});
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
if (__VLS_ctx.envData.co2.trend === 'rising') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.envData.co2.trend === 'falling') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-item" },
});
/** @type {__VLS_StyleScopedClasses['env-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-header" },
});
/** @type {__VLS_StyleScopedClasses['env-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-name" },
});
/** @type {__VLS_StyleScopedClasses['env-name']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "env-status" },
    ...{ class: (__VLS_ctx.envData.soilPh.status === '正常' ? 'normal' : 'warning') },
});
/** @type {__VLS_StyleScopedClasses['env-status']} */ ;
(__VLS_ctx.envData.soilPh.status);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-value" },
});
/** @type {__VLS_StyleScopedClasses['env-value']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.envData.soilPh.value);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "unit" },
});
/** @type {__VLS_StyleScopedClasses['unit']} */ ;
(__VLS_ctx.envData.soilPh.unit);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-range" },
});
/** @type {__VLS_StyleScopedClasses['env-range']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "min" },
});
/** @type {__VLS_StyleScopedClasses['min']} */ ;
(__VLS_ctx.envData.soilPh.min);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-bar" },
});
/** @type {__VLS_StyleScopedClasses['range-bar']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "range-fill" },
    ...{ style: ({ left: ((__VLS_ctx.envData.soilPh.value - __VLS_ctx.envData.soilPh.min) / (__VLS_ctx.envData.soilPh.max - __VLS_ctx.envData.soilPh.min) * 100) + '%', width: '10px' }) },
});
/** @type {__VLS_StyleScopedClasses['range-fill']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "max" },
});
/** @type {__VLS_StyleScopedClasses['max']} */ ;
(__VLS_ctx.envData.soilPh.max);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "env-trend" },
});
/** @type {__VLS_StyleScopedClasses['env-trend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-label" },
});
/** @type {__VLS_StyleScopedClasses['trend-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "trend-icon" },
    ...{ class: (__VLS_ctx.envData.soilPh.trend) },
});
/** @type {__VLS_StyleScopedClasses['trend-icon']} */ ;
if (__VLS_ctx.envData.soilPh.trend === 'rising') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else if (__VLS_ctx.envData.soilPh.trend === 'falling') {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "history-section" },
});
/** @type {__VLS_StyleScopedClasses['history-section']} */ ;
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
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    ...{ onChange: (__VLS_ctx.handleGreenhouseChange) },
    ...{ class: "greenhouse-select" },
    value: (__VLS_ctx.currentGreenhouseId),
});
/** @type {__VLS_StyleScopedClasses['greenhouse-select']} */ ;
for (const [gh] of __VLS_vFor((__VLS_ctx.greenhouseList))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
        key: (gh.id),
        value: (gh.id),
    });
    (gh.name);
    // @ts-ignore
    [envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, envData, handleGreenhouseChange, currentGreenhouseId, greenhouseList,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.select, __VLS_intrinsics.select)({
    ...{ onChange: (__VLS_ctx.handleTimeRangeChange) },
    ...{ class: "time-range" },
    value: (__VLS_ctx.currentTimeRange),
});
/** @type {__VLS_StyleScopedClasses['time-range']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "8h",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "1d",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "1w",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.option, __VLS_intrinsics.option)({
    value: "1m",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card-body" },
});
/** @type {__VLS_StyleScopedClasses['card-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "charts-container" },
});
/** @type {__VLS_StyleScopedClasses['charts-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "temperatureChartRef",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "humidityChartRef",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "lightChartRef",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "soilMoistureChartRef",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "co2ChartRef",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ref: "soilPhChartRef",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
// @ts-ignore
[handleTimeRangeChange, currentTimeRange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
