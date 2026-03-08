import { ref, onMounted } from 'vue';
import { useGreenhouseApi } from '/@/api/greenhouse';
// 温室API
const greenhouseApi = useGreenhouseApi();
// 统计数据
const statistics = ref({
    users: 42,
    greenhouse: 9,
    diseases: 141,
    yield: 1232
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
// 种植作物数据
const cropTypes = ref([]);
// 分页相关
const currentPage = ref(1);
const pageSize = ref(6);
const total = ref(0);
// 获取温室数据
const fetchGreenhouseData = async () => {
    try {
        const res = await greenhouseApi.getWithDiseaseCountPage({
            pageNum: currentPage.value,
            pageSize: pageSize.value
        });
        if (res.code === '0' || res.code === 0) {
            const data = res.data.records || res.data.list || res.data;
            total.value = res.data.total || data.length;
            cropTypes.value = data.map((item) => {
                return {
                    id: item.greenhouse?.id,
                    name: item.greenhouse?.greenhouseName || `${item.greenhouse?.id}号温室`,
                    crop: item.greenhouse?.cropType || '未知作物',
                    status: item.totalDiseaseCount > 5 ? '需要关注' : '生长良好',
                    plantCount: item.greenhouse?.quantity || 0,
                    diseaseCount: item.totalDiseaseCount || 0
                };
            });
        }
    }
    catch (err) {
        console.error('获取温室数据失败:', err);
        total.value = 9;
        cropTypes.value = [
            { name: '1号温室', crop: '玉米', status: '生长良好', plantCount: 350, diseaseCount: 20 },
            { name: '2号温室', crop: '水稻', status: '生长良好', plantCount: 400, diseaseCount: 15 },
            { name: '3号温室', crop: '小麦', status: '需要关注', plantCount: 350, diseaseCount: 18 },
            { name: '4号温室', crop: '马铃薯', status: '生长良好', plantCount: 250, diseaseCount: 12 },
            { name: '5号温室', crop: '棉花', status: '生长良好', plantCount: 300, diseaseCount: 16 },
            { name: '6号温室', crop: '苹果', status: '需要关注', plantCount: 8, diseaseCount: 14 }
        ];
    }
};
// 分页改变
const handlePageChange = (page) => {
    currentPage.value = page;
    fetchGreenhouseData();
};
// 每页大小改变
const handleSizeChange = (size) => {
    pageSize.value = size;
    currentPage.value = 1;
    fetchGreenhouseData();
};
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
]);
// 模拟登录状态
const isLoggedIn = ref(true);
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
onMounted(() => {
    fetchWeatherData(); // 获取天气数据
    fetchGreenhouseData(); // 获取温室数据
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['card-header']} */ ;
/** @type {__VLS_StyleScopedClasses['app-item']} */ ;
/** @type {__VLS_StyleScopedClasses['app-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['app-item']} */ ;
/** @type {__VLS_StyleScopedClasses['weather-item']} */ ;
/** @type {__VLS_StyleScopedClasses['weather-item']} */ ;
/** @type {__VLS_StyleScopedClasses['weather-notice']} */ ;
/** @type {__VLS_StyleScopedClasses['label']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-item']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-item']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-status']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-status']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['link-item']} */ ;
/** @type {__VLS_StyleScopedClasses['footer']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['top-section']} */ ;
/** @type {__VLS_StyleScopedClasses['content-row']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['header']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['statistics-row']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "home-container" },
});
/** @type {__VLS_StyleScopedClasses['home-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "main-content" },
});
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "content" },
});
/** @type {__VLS_StyleScopedClasses['content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "top-section" },
});
/** @type {__VLS_StyleScopedClasses['top-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card notice-card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['notice-card']} */ ;
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
    ...{ class: "notice-content" },
});
/** @type {__VLS_StyleScopedClasses['notice-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card quick-apps-card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-apps-card']} */ ;
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
    ...{ class: "apps-grid" },
});
/** @type {__VLS_StyleScopedClasses['apps-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/infoDisease');
            // @ts-ignore
            [$router,];
        } },
    ...{ class: "app-item" },
});
/** @type {__VLS_StyleScopedClasses['app-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-icon" },
});
/** @type {__VLS_StyleScopedClasses['app-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=disease%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "病虫害数据库",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/smartChat');
            // @ts-ignore
            [$router,];
        } },
    ...{ class: "app-item" },
});
/** @type {__VLS_StyleScopedClasses['app-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-icon" },
});
/** @type {__VLS_StyleScopedClasses['app-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chat%20bot%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "智能助手",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/imgPredict');
            // @ts-ignore
            [$router,];
        } },
    ...{ class: "app-item" },
});
/** @type {__VLS_StyleScopedClasses['app-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-icon" },
});
/** @type {__VLS_StyleScopedClasses['app-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=image%20detection%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "图片检测",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/imgRecord');
            // @ts-ignore
            [$router,];
        } },
    ...{ class: "app-item" },
});
/** @type {__VLS_StyleScopedClasses['app-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-icon" },
});
/** @type {__VLS_StyleScopedClasses['app-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=image%20record%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "图片检测记录",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/videoPredict');
            // @ts-ignore
            [$router,];
        } },
    ...{ class: "app-item" },
});
/** @type {__VLS_StyleScopedClasses['app-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-icon" },
});
/** @type {__VLS_StyleScopedClasses['app-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20detection%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "视频检测",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.$router.push('/videoRecord');
            // @ts-ignore
            [$router,];
        } },
    ...{ class: "app-item" },
});
/** @type {__VLS_StyleScopedClasses['app-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app-icon" },
});
/** @type {__VLS_StyleScopedClasses['app-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.img)({
    src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=video%20record%20icon%20green%20color%20simple%20design&image_size=square",
    alt: "视频检测记录",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card weather-card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['weather-card']} */ ;
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
    ...{ class: "weather-details" },
});
/** @type {__VLS_StyleScopedClasses['weather-details']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "weather-header" },
});
/** @type {__VLS_StyleScopedClasses['weather-header']} */ ;
(__VLS_ctx.weatherInfo.date);
(__VLS_ctx.weatherInfo.weekday);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "weather-info-grid" },
});
/** @type {__VLS_StyleScopedClasses['weather-info-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "weather-item" },
});
/** @type {__VLS_StyleScopedClasses['weather-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "label" },
});
/** @type {__VLS_StyleScopedClasses['label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.weatherInfo.temperature);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "weather-item" },
});
/** @type {__VLS_StyleScopedClasses['weather-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "label" },
});
/** @type {__VLS_StyleScopedClasses['label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.weatherInfo.weather);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "weather-item" },
});
/** @type {__VLS_StyleScopedClasses['weather-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "label" },
});
/** @type {__VLS_StyleScopedClasses['label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.weatherInfo.wind);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "weather-item" },
});
/** @type {__VLS_StyleScopedClasses['weather-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "label" },
});
/** @type {__VLS_StyleScopedClasses['label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "value" },
});
/** @type {__VLS_StyleScopedClasses['value']} */ ;
(__VLS_ctx.weatherInfo.airQuality);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "weather-notice" },
});
/** @type {__VLS_StyleScopedClasses['weather-notice']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "label" },
});
/** @type {__VLS_StyleScopedClasses['label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "content" },
});
/** @type {__VLS_StyleScopedClasses['content']} */ ;
(__VLS_ctx.weatherInfo.notice);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "statistics-row" },
});
/** @type {__VLS_StyleScopedClasses['statistics-row']} */ ;
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
    ...{ class: "charts-container" },
});
/** @type {__VLS_StyleScopedClasses['charts-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "content-row" },
});
/** @type {__VLS_StyleScopedClasses['content-row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "card crop-info-card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['crop-info-card']} */ ;
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
    (item.name);
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
        ...{ class: "crop-status" },
        ...{ class: ({ 'warning': item.status === '需要关注' }) },
    });
    /** @type {__VLS_StyleScopedClasses['crop-status']} */ ;
    /** @type {__VLS_StyleScopedClasses['warning']} */ ;
    (item.status);
    // @ts-ignore
    [weatherInfo, weatherInfo, weatherInfo, weatherInfo, weatherInfo, weatherInfo, weatherInfo, statistics, statistics, statistics, statistics, cropTypes,];
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
    ...{ class: "card links-card" },
});
/** @type {__VLS_StyleScopedClasses['card']} */ ;
/** @type {__VLS_StyleScopedClasses['links-card']} */ ;
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
    ...{ class: "links-grid" },
});
/** @type {__VLS_StyleScopedClasses['links-grid']} */ ;
for (const [link, index] of __VLS_vFor((__VLS_ctx.agricultureLinks))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
        key: (index),
        href: (link.url),
        target: "_blank",
        ...{ class: "link-item" },
    });
    /** @type {__VLS_StyleScopedClasses['link-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (link.name);
    // @ts-ignore
    [currentPage, pageSize, total, handleSizeChange, handlePageChange, agricultureLinks,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
