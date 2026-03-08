import { ref, onMounted, computed } from 'vue';
import { use } from 'echarts/core';
import { BarChart, LineChart, PieChart, RadarChart, ScatterChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent, LegendComponent, ToolboxComponent, VisualMapComponent } from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { useGreenhouseApi } from '/@/api/greenhouse';
import { useAlertHistoryApi } from '/@/api/alertHistory';
use([
    BarChart,
    LineChart,
    PieChart,
    RadarChart,
    ScatterChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LegendComponent,
    ToolboxComponent,
    VisualMapComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);
// 页面标题
const pageTitle = ref('数据分析');
const pageDesc = ref('智能分析温室环境数据，提供预警预测和决策支持');
// API
const greenhouseApi = useGreenhouseApi();
const alertHistoryApi = useAlertHistoryApi();
// 温室数据
const greenhouses = ref([]);
const loading = ref(false);
// 温室状态数据
const greenhouseStatusData = ref([]);
// 异常统计数据
const abnormalStatsData = ref([]);
// 告警历史数据
const alertHistoryData = ref([]);
// 异常趋势数据
const anomalyData = ref([]);
// 按天统计异常次数
const dailyAnomalyData = computed(() => {
    const dailyMap = {};
    // 统计每天的异常总次数
    anomalyData.value.forEach(item => {
        if (dailyMap[item.date]) {
            dailyMap[item.date] += item.value || 0;
        }
        else {
            dailyMap[item.date] = item.value || 0;
        }
    });
    // 转换为数组并排序
    return Object.entries(dailyMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
});
// 环境参数异常分布
const anomalyDistribution = ref([
    { name: '温度异常', value: 35, type: 'temperature' },
    { name: '湿度异常', value: 28, type: 'humidity' },
    { name: '光照不足', value: 15, type: 'light' },
    { name: 'CO2过高', value: 12, type: 'co2' },
    { name: '土壤pH异常', value: 10, type: 'ph' }
]);
// 问题温室
const problemGreenhouses = computed(() => {
    return greenhouses.value.filter(g => g.status === 'warning' || g.status === 'danger')
        .sort((a, b) => a.healthScore - b.healthScore);
});
// 健康温室
const healthyGreenhouses = computed(() => {
    return greenhouses.value.filter(g => g.status === 'normal')
        .sort((a, b) => b.healthScore - a.healthScore);
});
// 温室健康评分对比图
const healthScoreOption = computed(() => {
    const sortedGreenhouses = [...greenhouses.value].sort((a, b) => a.healthScore - b.healthScore);
    return {
        title: {
            text: '温室健康评分排名',
            left: 'center',
            textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            formatter: (params) => {
                const data = params[0];
                const greenhouse = sortedGreenhouses[data.dataIndex];
                return `${greenhouse.name}<br/>作物: ${greenhouse.cropType}<br/>健康评分: ${data.value}分<br/>状态: ${greenhouse.growthStatus}`;
            }
        },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'value',
            min: 0,
            max: 100,
            axisLabel: { formatter: '{value}分' }
        },
        yAxis: {
            type: 'category',
            data: sortedGreenhouses.map(g => g.name),
            axisLabel: { fontSize: 12 }
        },
        series: [{
                type: 'bar',
                data: sortedGreenhouses.map(g => ({
                    value: g.healthScore,
                    itemStyle: {
                        color: g.healthScore >= 80 ? '#52c41a' : g.healthScore >= 60 ? '#faad14' : '#ff4d4f'
                    }
                })),
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{c}分'
                },
                barWidth: '60%'
            }]
    };
});
// 异常分布图
const anomalyOption = computed(() => {
    return {
        title: {
            text: '环境参数异常分布',
            left: 'center',
            textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}次 ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 50
        },
        series: [{
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['60%', '55%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 18,
                        fontWeight: 'bold'
                    }
                },
                labelLine: { show: false },
                data: anomalyDistribution.value.map((item, index) => ({
                    ...item,
                    itemStyle: {
                        color: ['#ff4d4f', '#faad14', '#1890ff', '#52c41a', '#722ed1', '#eb2f96'][index]
                    }
                }))
            }]
    };
});
// 异常次数时间线
const timelineOption = computed(() => {
    const maxCount = Math.max(...dailyAnomalyData.value.map(item => item.count), 3);
    return {
        title: {
            text: '异常事件次数时间线',
            left: 'center',
            textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const data = params[0];
                const date = dailyAnomalyData.value[data.dataIndex].date;
                const count = data.value;
                // 查找当天的具体异常
                const dayAnomalies = anomalyData.value.filter(item => item.date === date);
                let details = '';
                dayAnomalies.forEach(item => {
                    details += `<br/>${item.greenhouse}: ${item.type} (${item.severity === 'high' ? '高' : item.severity === 'medium' ? '中' : '低'})`;
                });
                return `${date}<br/>异常次数: ${count}次${details}`;
            }
        },
        xAxis: {
            type: 'category',
            data: dailyAnomalyData.value.map(item => item.date),
            axisLabel: { rotate: 45 }
        },
        yAxis: {
            type: 'value',
            name: '异常次数',
            min: 0,
            max: maxCount
        },
        series: [{
                type: 'bar',
                data: dailyAnomalyData.value.map(item => item.count),
                itemStyle: {
                    color: function (params) {
                        const count = dailyAnomalyData.value[params.dataIndex].count;
                        return count >= 3 ? '#ff4d4f' : count >= 2 ? '#faad14' : '#1890ff';
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}次'
                },
                barWidth: '60%'
            }]
    };
});
// 温室数据对比雷达图
const greenhouseComparisonOption = computed(() => {
    return {
        title: {
            text: '温室环境数据对比',
            left: 'center',
            textStyle: { fontSize: 16, fontWeight: 'bold' }
        },
        tooltip: {},
        legend: {
            data: greenhouses.value.map(g => g.name),
            top: 30
        },
        radar: {
            indicator: [
                { name: '温度', max: 35 },
                { name: '空气湿度', max: 100 },
                { name: '土壤湿度', max: 50 },
                { name: 'CO2浓度', max: 1000 },
                { name: '土壤pH', max: 8 },
                { name: '光照强度 (万)', max: 5 }
            ]
        },
        series: greenhouses.value.map((greenhouse, index) => ({
            name: greenhouse.name,
            type: 'radar',
            data: [{
                    value: [
                        greenhouse.temperature,
                        greenhouse.airHumidity,
                        greenhouse.soilHumidity,
                        greenhouse.co2Concentration,
                        greenhouse.soilPh,
                        greenhouse.lightIntensity / 10000
                    ],
                    itemStyle: {
                        color: index === 0 ? '#52c41a' : index === 1 ? '#faad14' : index === 2 ? '#ff4d4f' : index === 3 ? '#1890ff' : '#722ed1'
                    }
                }]
        }))
    };
});
// 获取建议
const getSuggestion = (greenhouse) => {
    const suggestions = [];
    if (greenhouse.temperature > 28)
        suggestions.push('温度过高，建议开启降温设备');
    if (greenhouse.temperature < 20)
        suggestions.push('温度过低，建议开启加热设备');
    if (greenhouse.airHumidity > 70)
        suggestions.push('湿度过高，建议加强通风');
    if (greenhouse.airHumidity < 40)
        suggestions.push('湿度过低，建议开启加湿设备');
    if (greenhouse.diseaseCount > 0)
        suggestions.push(`发现${greenhouse.diseaseCount}处病虫害，建议及时处理`);
    return suggestions;
};
// 生成智能分析建议
const analysisSuggestions = computed(() => {
    const suggestions = [];
    const highTempGreenhouses = greenhouses.value.filter((g) => g.temperature > 28);
    if (highTempGreenhouses.length > 0) {
        const names = highTempGreenhouses.map((g) => g.name).join('、');
        suggestions.push({
            type: 'warning',
            title: '温度管理建议',
            description: `${names}温度偏高，建议检查温控设备并适当开启通风系统。预计未来3天温度将持续上升，需提前做好降温准备。`
        });
    }
    const highHumidityGreenhouses = greenhouses.value.filter((g) => g.airHumidity > 70);
    if (highHumidityGreenhouses.length > 0) {
        const names = highHumidityGreenhouses.map((g) => g.name).join('、');
        suggestions.push({
            type: 'info',
            title: '湿度控制建议',
            description: `${names}湿度达到${highHumidityGreenhouses[0].airHumidity}%，已超过安全阈值。建议加强通风换气，必要时开启除湿设备。`
        });
    }
    const diseaseGreenhouses = greenhouses.value.filter((g) => g.hasDisease || g.diseaseCount > 0);
    if (diseaseGreenhouses.length > 0) {
        const names = diseaseGreenhouses.map((g) => g.name).join('、');
        const totalDisease = diseaseGreenhouses.reduce((sum, g) => sum + (g.diseaseCount || 0), 0);
        suggestions.push({
            type: 'error',
            title: '病虫害防治建议',
            description: `${names}发现${totalDisease}处病虫害，建议立即进行防治处理。同时检查其他温室，防止病虫害扩散。`
        });
    }
    return suggestions;
});
// 温室健康评分配置
const healthScoreConfig = {
    // 基础分值
    baseScore: 100,
    // 各项扣分权重
    weights: {
        disease: 15, // 病虫害扣分权重
        temperature: 10, // 温度异常扣分权重
        humidity: 8, // 湿度异常扣分权重
        light: 5, // 光照异常扣分权重
        co2: 5, // CO2异常扣分权重
        ph: 5, // pH异常扣分权重
        multipleAbnormal: 2 // 多项异常叠加扣分
    },
    // 评分等级
    levels: {
        excellent: { min: 90, label: '优秀', status: 'success' },
        good: { min: 80, label: '良好', status: 'normal' },
        warning: { min: 60, label: '一般', status: 'warning' },
        danger: { min: 0, label: '较差', status: 'danger' }
    }
};
// 计算温室健康评分
const calculateHealthScore = (item) => {
    const gh = item.greenhouse || {};
    const abnormalData = item.abnormalData || {};
    const diseaseData = item.diseaseData || [];
    let score = healthScoreConfig.baseScore;
    const deductions = [];
    // 1. 病虫害扣分
    const diseaseCount = diseaseData.length;
    if (diseaseCount > 0) {
        const diseaseDeduction = Math.min(diseaseCount * healthScoreConfig.weights.disease, 30);
        score -= diseaseDeduction;
        deductions.push({ type: '病虫害', count: diseaseCount, deduction: diseaseDeduction });
    }
    // 2. 温度异常扣分
    if (abnormalData.temperature) {
        score -= healthScoreConfig.weights.temperature;
        deductions.push({ type: '温度异常', deduction: healthScoreConfig.weights.temperature });
    }
    // 3. 湿度异常扣分
    if (abnormalData.humidity) {
        score -= healthScoreConfig.weights.humidity;
        deductions.push({ type: '湿度异常', deduction: healthScoreConfig.weights.humidity });
    }
    // 4. 光照异常扣分
    if (abnormalData.light) {
        score -= healthScoreConfig.weights.light;
        deductions.push({ type: '光照异常', deduction: healthScoreConfig.weights.light });
    }
    // 5. CO2异常扣分
    if (abnormalData.co2) {
        score -= healthScoreConfig.weights.co2;
        deductions.push({ type: 'CO2异常', deduction: healthScoreConfig.weights.co2 });
    }
    // 6. pH异常扣分
    if (abnormalData.ph) {
        score -= healthScoreConfig.weights.ph;
        deductions.push({ type: 'pH异常', deduction: healthScoreConfig.weights.ph });
    }
    // 7. 多项异常叠加扣分（超过2项异常时）
    const abnormalCount = Object.values(abnormalData).filter(v => v).length;
    if (abnormalCount > 2) {
        const multipleDeduction = (abnormalCount - 2) * healthScoreConfig.weights.multipleAbnormal;
        score -= multipleDeduction;
        deductions.push({ type: '多项异常叠加', count: abnormalCount - 2, deduction: multipleDeduction });
    }
    // 确保分数在0-100之间
    score = Math.max(0, Math.min(100, score));
    return {
        score: Math.round(score),
        deductions,
        abnormalCount,
        diseaseCount
    };
};
// 根据评分获取等级信息
const getHealthLevel = (score) => {
    if (score >= healthScoreConfig.levels.excellent.min) {
        return healthScoreConfig.levels.excellent;
    }
    else if (score >= healthScoreConfig.levels.good.min) {
        return healthScoreConfig.levels.good;
    }
    else if (score >= healthScoreConfig.levels.warning.min) {
        return healthScoreConfig.levels.warning;
    }
    return healthScoreConfig.levels.danger;
};
// 获取温室数据
const fetchGreenhouseData = async () => {
    loading.value = true;
    try {
        const response = await greenhouseApi.getAllGreenhouseStatus();
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const data = response.data || [];
            greenhouseStatusData.value = data;
            greenhouses.value = data.map((item) => {
                const gh = item.greenhouse || {};
                const abnormalData = item.abnormalData || {};
                const totalAbnormalCount = item.totalAbnormalCount || 0;
                // 计算健康评分
                const healthResult = calculateHealthScore(item);
                const healthScore = healthResult.score;
                const healthLevel = getHealthLevel(healthScore);
                // 根据评分确定状态
                const status = healthLevel.status;
                //console.log('健康等级:', healthLevel)
                return {
                    id: gh.id,
                    name: gh.greenhouseName || `${gh.id}号温室`,
                    cropType: gh.cropType || '未知作物',
                    status: status,
                    temperature: gh.temperature || 25,
                    airHumidity: gh.airHumidity || 60,
                    soilHumidity: gh.soilHumidity || 30,
                    co2Concentration: gh.co2Concentration || 500,
                    soilPh: gh.soilPh || 6.5,
                    lightIntensity: gh.lightIntensity || 30000,
                    diseaseCount: healthResult.diseaseCount,
                    growthStatus: healthLevel.label,
                    healthScore: healthScore,
                    healthLevel: healthLevel,
                    healthDeductions: healthResult.deductions,
                    abnormalData: abnormalData,
                    totalAbnormalCount: totalAbnormalCount,
                    hasDisease: item.hasDisease || false
                };
            });
            // 生成异常分布数据（只生成分布，不生成趋势数据）
            generateAnomalyDistribution();
        }
    }
    catch (error) {
        console.error('获取温室数据失败:', error);
    }
    finally {
        loading.value = false;
    }
};
// 生成异常趋势数据
const generateAnomalyData = () => {
    const anomalies = [];
    const today = new Date();
    greenhouseStatusData.value.forEach((item) => {
        const gh = item.greenhouse || {};
        const abnormalData = item.abnormalData || {};
        const diseaseData = item.diseaseData || [];
        // 温度异常
        if (abnormalData.temperature) {
            anomalies.push({
                date: formatDate(today),
                greenhouse: gh.greenhouseName || `${gh.id}号温室`,
                type: '温度异常',
                value: gh.temperature,
                severity: 'high'
            });
        }
        // 湿度异常
        if (abnormalData.humidity) {
            anomalies.push({
                date: formatDate(today),
                greenhouse: gh.greenhouseName || `${gh.id}号温室`,
                type: '湿度异常',
                value: gh.airHumidity,
                severity: 'medium'
            });
        }
        // 光照异常
        if (abnormalData.light) {
            anomalies.push({
                date: formatDate(today),
                greenhouse: gh.greenhouseName || `${gh.id}号温室`,
                type: '光照异常',
                value: gh.lightIntensity,
                severity: 'medium'
            });
        }
        // CO2异常
        if (abnormalData.co2) {
            anomalies.push({
                date: formatDate(today),
                greenhouse: gh.greenhouseName || `${gh.id}号温室`,
                type: 'CO2异常',
                value: gh.co2Concentration,
                severity: 'low'
            });
        }
        // pH异常
        if (abnormalData.ph) {
            anomalies.push({
                date: formatDate(today),
                greenhouse: gh.greenhouseName || `${gh.id}号温室`,
                type: 'pH异常',
                value: gh.soilPh,
                severity: 'low'
            });
        }
        // 病虫害异常 - 从 diseaseData 数组中获取
        if (diseaseData.length > 0) {
            diseaseData.forEach((disease) => {
                anomalies.push({
                    date: formatDate(today),
                    greenhouse: gh.greenhouseName || `${gh.id}号温室`,
                    type: '病虫害',
                    value: disease.diseaseCount || 1,
                    severity: 'high',
                    diseaseName: disease.diseaseNames || '未知病害'
                });
            });
        }
    });
    anomalyData.value = anomalies;
};
// 生成异常分布数据
const generateAnomalyDistribution = () => {
    let temperatureCount = 0;
    let humidityCount = 0;
    let lightCount = 0;
    let co2Count = 0;
    let phCount = 0;
    let diseaseCount = 0;
    greenhouseStatusData.value.forEach((item) => {
        const gh = item.greenhouse || {};
        const abnormalData = item.abnormalData || {};
        const diseaseData = item.diseaseData || [];
        if (abnormalData.temperature)
            temperatureCount++;
        if (abnormalData.humidity)
            humidityCount++;
        if (abnormalData.light)
            lightCount++;
        if (abnormalData.co2)
            co2Count++;
        if (abnormalData.ph)
            phCount++;
        // 统计病虫害数量
        if (diseaseData.length > 0) {
            diseaseCount += diseaseData.length;
        }
    });
    anomalyDistribution.value = [
        { name: '温度异常', value: temperatureCount, type: 'temperature' },
        { name: '湿度异常', value: humidityCount, type: 'humidity' },
        { name: '光照异常', value: lightCount, type: 'light' },
        { name: 'CO2异常', value: co2Count, type: 'co2' },
        { name: 'pH异常', value: phCount, type: 'ph' },
        { name: '病虫害', value: diseaseCount, type: 'disease' }
    ].filter(item => item.value > 0); // 只显示有数据的异常类型
};
// 格式化日期
const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
// 格式化日期时间（用于API参数）
const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};
// 获取异常统计数据（使用告警历史接口）
const fetchAbnormalStats = async () => {
    try {
        // 固定查询2026-02-20到2026-03-03的数据
        const startTime = '2026-02-20T00:00:00';
        const endTime = '2026-03-03T23:59:59';
        const response = await alertHistoryApi.getAlertHistoryList({
            startTime,
            endTime,
            pageSize: 1000 // 获取足够多的数据
        });
        if (response.code === '200' || response.code === 200 || response.code === '0' || response.code === 0) {
            const records = response.data?.records || response.data?.list || response.data || [];
            alertHistoryData.value = records;
            // 根据告警历史数据生成异常趋势数据
            generateAnomalyDataFromAlertHistory();
            // 打印异常事件线表格绑定的数据
            console.log('异常事件线表格绑定的数据:', dailyAnomalyData.value);
        }
    }
    catch (error) {
        console.error('获取告警历史数据失败:', error);
    }
};
// 根据告警历史数据生成异常趋势数据
const generateAnomalyDataFromAlertHistory = () => {
    const anomalies = [];
    alertHistoryData.value.forEach((item) => {
        const greenhouseName = item.greenhouseId ? `${item.greenhouseId}号温室` : '未知温室';
        // 从 triggerTime 提取日期
        const triggerTime = item.triggerTime || '';
        const date = triggerTime.split(' ')[0] || formatDate(new Date());
        // 根据告警级别确定严重程度
        let severity = 'low';
        if (item.alertLevel === 'critical' || item.alertLevel === 'error') {
            severity = 'high';
        }
        else if (item.alertLevel === 'warning') {
            severity = 'medium';
        }
        // 获取异常类型文本
        const alertType = getAlertTypeText(item.dataType, item.alertType);
        // 为每条告警记录生成数据
        anomalies.push({
            date: date,
            greenhouse: greenhouseName,
            type: alertType,
            value: 1, // 每条告警记录计为1次
            severity: severity,
            alertTitle: item.alertTitle,
            alertContent: item.alertContent,
            status: item.status
        });
    });
    anomalyData.value = anomalies;
};
// 获取告警类型的中文文本
const getAlertTypeText = (dataType, alertType) => {
    const typeMap = {
        'temperature': '温度异常',
        'airHumidity': '空气湿度异常',
        'soilHumidity': '土壤湿度异常',
        'lightIntensity': '光照异常',
        'co2Concentration': 'CO2异常',
        'soilPh': 'pH异常'
    };
    // 优先使用 dataType 映射
    if (dataType && typeMap[dataType]) {
        return typeMap[dataType];
    }
    // 根据 alertType 判断
    if (alertType?.includes('temperature'))
        return '温度异常';
    if (alertType?.includes('humidity'))
        return '湿度异常';
    if (alertType?.includes('light'))
        return '光照异常';
    if (alertType?.includes('co2'))
        return 'CO2异常';
    if (alertType?.includes('ph'))
        return 'pH异常';
    if (alertType?.includes('disease') || alertType?.includes('pest'))
        return '病虫害';
    return '其他异常';
};
// 获取异常类型的中文文本
const getAbnormalTypeText = (type) => {
    const typeMap = {
        '病虫害': '病虫害',
        'temperature': '温度异常',
        'air_humidity': '空气湿度异常',
        'soil_humidity': '土壤湿度异常',
        'light': '光照异常',
        'light_intensity': '光照强度异常',
        'co2_concentration': 'CO2异常',
        'soil_ph': 'pH异常'
    };
    return typeMap[type] || type;
};
onMounted(() => {
    console.log('数据分析页面加载成功');
    fetchGreenhouseData();
    fetchAbnormalStats();
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
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['problem-card']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['problem-card']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['health-score']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['health-score']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['expand-content']} */ ;
/** @type {__VLS_StyleScopedClasses['score-value']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['score-value']} */ ;
/** @type {__VLS_StyleScopedClasses['score-value']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['score-value']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-overview']} */ ;
/** @type {__VLS_StyleScopedClasses['problem-cards']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-container" },
});
/** @type {__VLS_StyleScopedClasses['page-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
(__VLS_ctx.pageTitle);
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
(__VLS_ctx.pageDesc);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-overview" },
});
/** @type {__VLS_StyleScopedClasses['stats-overview']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card danger" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['danger']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.problemGreenhouses.filter(g => g.status === 'danger').length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card warning" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.problemGreenhouses.filter(g => g.status === 'warning').length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card success" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.healthyGreenhouses.length);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-card info" },
});
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-value" },
});
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
(__VLS_ctx.greenhouses.reduce((sum, g) => sum + (g.totalAbnormalCount || 0), 0));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stat-label" },
});
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
if (__VLS_ctx.problemGreenhouses.length > 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-section" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
        ...{ class: "section-title" },
    });
    /** @type {__VLS_StyleScopedClasses['section-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "problem-cards" },
    });
    /** @type {__VLS_StyleScopedClasses['problem-cards']} */ ;
    for (const [greenhouse] of __VLS_vFor((__VLS_ctx.problemGreenhouses))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (greenhouse.id),
            ...{ class: "problem-card" },
            ...{ class: (greenhouse.status) },
        });
        /** @type {__VLS_StyleScopedClasses['problem-card']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "card-header" },
        });
        /** @type {__VLS_StyleScopedClasses['card-header']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "greenhouse-name" },
        });
        /** @type {__VLS_StyleScopedClasses['greenhouse-name']} */ ;
        (greenhouse.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "health-score" },
            ...{ class: (greenhouse.status) },
        });
        /** @type {__VLS_StyleScopedClasses['health-score']} */ ;
        (greenhouse.healthScore);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "crop-type" },
        });
        /** @type {__VLS_StyleScopedClasses['crop-type']} */ ;
        (greenhouse.cropType);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "suggestions" },
        });
        /** @type {__VLS_StyleScopedClasses['suggestions']} */ ;
        for (const [suggestion, index] of __VLS_vFor((__VLS_ctx.getSuggestion(greenhouse)))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (index),
                ...{ class: "suggestion-item" },
            });
            /** @type {__VLS_StyleScopedClasses['suggestion-item']} */ ;
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
            (suggestion);
            // @ts-ignore
            [pageTitle, pageDesc, problemGreenhouses, problemGreenhouses, problemGreenhouses, problemGreenhouses, healthyGreenhouses, greenhouses, getSuggestion,];
        }
        // @ts-ignore
        [];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-grid" },
});
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.vChart | typeof __VLS_components.VChart} */
vChart;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ class: "chart" },
    option: (__VLS_ctx.healthScoreOption),
}));
const __VLS_2 = __VLS_1({
    ...{ class: "chart" },
    option: (__VLS_ctx.healthScoreOption),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
let __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.vChart | typeof __VLS_components.VChart} */
vChart;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ class: "chart" },
    option: (__VLS_ctx.anomalyOption),
}));
const __VLS_7 = __VLS_6({
    ...{ class: "chart" },
    option: (__VLS_ctx.anomalyOption),
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
let __VLS_10;
/** @ts-ignore @type {typeof __VLS_components.vChart | typeof __VLS_components.VChart} */
vChart;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    ...{ class: "chart" },
    option: (__VLS_ctx.timelineOption),
}));
const __VLS_12 = __VLS_11({
    ...{ class: "chart" },
    option: (__VLS_ctx.timelineOption),
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "chart-item" },
});
/** @type {__VLS_StyleScopedClasses['chart-item']} */ ;
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.vChart | typeof __VLS_components.VChart} */
vChart;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    ...{ class: "chart" },
    option: (__VLS_ctx.greenhouseComparisonOption),
}));
const __VLS_17 = __VLS_16({
    ...{ class: "chart" },
    option: (__VLS_ctx.greenhouseComparisonOption),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
/** @type {__VLS_StyleScopedClasses['chart']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "health-score-section" },
});
/** @type {__VLS_StyleScopedClasses['health-score-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['table-wrapper']} */ ;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    data: (__VLS_ctx.greenhouses),
    border: true,
    stripe: true,
}));
const __VLS_22 = __VLS_21({
    data: (__VLS_ctx.greenhouses),
    border: true,
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loading) }, null, null);
const { default: __VLS_25 } = __VLS_23.slots;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    type: "expand",
    width: "50",
}));
const __VLS_28 = __VLS_27({
    type: "expand",
    width: "50",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
const { default: __VLS_31 } = __VLS_29.slots;
{
    const { default: __VLS_32 } = __VLS_29.slots;
    const [{ row }] = __VLS_vSlot(__VLS_32);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "expand-content" },
    });
    /** @type {__VLS_StyleScopedClasses['expand-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
    if (row.healthDeductions && row.healthDeductions.length > 0) {
        let __VLS_33;
        /** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
        elTable;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
            data: (row.healthDeductions),
            border: true,
            size: "small",
        }));
        const __VLS_35 = __VLS_34({
            data: (row.healthDeductions),
            border: true,
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        const { default: __VLS_38 } = __VLS_36.slots;
        let __VLS_39;
        /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
        elTableColumn;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
            prop: "type",
            label: "异常类型",
            minWidth: "120",
        }));
        const __VLS_41 = __VLS_40({
            prop: "type",
            label: "异常类型",
            minWidth: "120",
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        let __VLS_44;
        /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
        elTableColumn;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
            prop: "count",
            label: "数量",
            width: "80",
        }));
        const __VLS_46 = __VLS_45({
            prop: "count",
            label: "数量",
            width: "80",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        const { default: __VLS_49 } = __VLS_47.slots;
        {
            const { default: __VLS_50 } = __VLS_47.slots;
            const [{ row }] = __VLS_vSlot(__VLS_50);
            (row.count || '-');
            // @ts-ignore
            [greenhouses, healthScoreOption, anomalyOption, timelineOption, greenhouseComparisonOption, vLoading, loading,];
        }
        // @ts-ignore
        [];
        var __VLS_47;
        let __VLS_51;
        /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
        elTableColumn;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            prop: "deduction",
            label: "扣分",
            width: "80",
        }));
        const __VLS_53 = __VLS_52({
            prop: "deduction",
            label: "扣分",
            width: "80",
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        const { default: __VLS_56 } = __VLS_54.slots;
        {
            const { default: __VLS_57 } = __VLS_54.slots;
            const [{ row }] = __VLS_vSlot(__VLS_57);
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ style: {} },
            });
            (row.deduction);
            // @ts-ignore
            [];
        }
        // @ts-ignore
        [];
        var __VLS_54;
        // @ts-ignore
        [];
        var __VLS_36;
    }
    else {
        let __VLS_58;
        /** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
        elAlert;
        // @ts-ignore
        const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
            title: "无扣分项",
            type: "success",
            closable: (false),
            description: "该温室运行正常，无任何扣分项。",
            showIcon: true,
        }));
        const __VLS_60 = __VLS_59({
            title: "无扣分项",
            type: "success",
            closable: (false),
            description: "该温室运行正常，无任何扣分项。",
            showIcon: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_59));
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_29;
let __VLS_63;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
    prop: "name",
    label: "温室名称",
    minWidth: "120",
}));
const __VLS_65 = __VLS_64({
    prop: "name",
    label: "温室名称",
    minWidth: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
let __VLS_68;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent1(__VLS_68, new __VLS_68({
    prop: "cropType",
    label: "作物类型",
    minWidth: "100",
}));
const __VLS_70 = __VLS_69({
    prop: "cropType",
    label: "作物类型",
    minWidth: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
let __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    label: "健康评分",
    width: "120",
    align: "center",
}));
const __VLS_75 = __VLS_74({
    label: "健康评分",
    width: "120",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
const { default: __VLS_78 } = __VLS_76.slots;
{
    const { default: __VLS_79 } = __VLS_76.slots;
    const [{ row }] = __VLS_vSlot(__VLS_79);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "score-display" },
    });
    /** @type {__VLS_StyleScopedClasses['score-display']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "score-value" },
        ...{ class: (row.healthLevel?.status) },
    });
    /** @type {__VLS_StyleScopedClasses['score-value']} */ ;
    (row.healthScore);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "score-unit" },
    });
    /** @type {__VLS_StyleScopedClasses['score-unit']} */ ;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_76;
let __VLS_80;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
    label: "评分等级",
    width: "100",
    align: "center",
}));
const __VLS_82 = __VLS_81({
    label: "评分等级",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const { default: __VLS_85 } = __VLS_83.slots;
{
    const { default: __VLS_86 } = __VLS_83.slots;
    const [{ row }] = __VLS_vSlot(__VLS_86);
    let __VLS_87;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
        type: (row.healthLevel?.status === 'success' ? 'success' : row.healthLevel?.status === 'normal' ? 'primary' : row.healthLevel?.status === 'warning' ? 'warning' : 'danger'),
    }));
    const __VLS_89 = __VLS_88({
        type: (row.healthLevel?.status === 'success' ? 'success' : row.healthLevel?.status === 'normal' ? 'primary' : row.healthLevel?.status === 'warning' ? 'warning' : 'danger'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    const { default: __VLS_92 } = __VLS_90.slots;
    (row.healthLevel?.label);
    // @ts-ignore
    [];
    var __VLS_90;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_83;
let __VLS_93;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_94 = __VLS_asFunctionalComponent1(__VLS_93, new __VLS_93({
    label: "状态",
    width: "80",
    align: "center",
}));
const __VLS_95 = __VLS_94({
    label: "状态",
    width: "80",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_94));
const { default: __VLS_98 } = __VLS_96.slots;
{
    const { default: __VLS_99 } = __VLS_96.slots;
    const [{ row }] = __VLS_vSlot(__VLS_99);
    let __VLS_100;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
        type: (row.status === 'normal' ? 'success' : row.status === 'warning' ? 'warning' : 'danger'),
    }));
    const __VLS_102 = __VLS_101({
        type: (row.status === 'normal' ? 'success' : row.status === 'warning' ? 'warning' : 'danger'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    const { default: __VLS_105 } = __VLS_103.slots;
    (row.status === 'normal' ? '正常' : row.status === 'warning' ? '警告' : '异常');
    // @ts-ignore
    [];
    var __VLS_103;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_96;
let __VLS_106;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
    label: "病虫害",
    width: "100",
    align: "center",
}));
const __VLS_108 = __VLS_107({
    label: "病虫害",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
const { default: __VLS_111 } = __VLS_109.slots;
{
    const { default: __VLS_112 } = __VLS_109.slots;
    const [{ row }] = __VLS_vSlot(__VLS_112);
    let __VLS_113;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
        type: (row.diseaseCount > 0 ? 'danger' : 'success'),
    }));
    const __VLS_115 = __VLS_114({
        type: (row.diseaseCount > 0 ? 'danger' : 'success'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_114));
    const { default: __VLS_118 } = __VLS_116.slots;
    (row.diseaseCount);
    // @ts-ignore
    [];
    var __VLS_116;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_109;
let __VLS_119;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
    label: "异常项",
    width: "100",
    align: "center",
}));
const __VLS_121 = __VLS_120({
    label: "异常项",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
const { default: __VLS_124 } = __VLS_122.slots;
{
    const { default: __VLS_125 } = __VLS_122.slots;
    const [{ row }] = __VLS_vSlot(__VLS_125);
    let __VLS_126;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
        type: (row.totalAbnormalCount > 0 ? 'warning' : 'success'),
    }));
    const __VLS_128 = __VLS_127({
        type: (row.totalAbnormalCount > 0 ? 'warning' : 'success'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_127));
    const { default: __VLS_131 } = __VLS_129.slots;
    (row.totalAbnormalCount);
    // @ts-ignore
    [];
    var __VLS_129;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_122;
let __VLS_132;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
    label: "温度",
    width: "100",
    align: "center",
}));
const __VLS_134 = __VLS_133({
    label: "温度",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
const { default: __VLS_137 } = __VLS_135.slots;
{
    const { default: __VLS_138 } = __VLS_135.slots;
    const [{ row }] = __VLS_vSlot(__VLS_138);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: ({ 'abnormal': row.abnormalData?.temperature }) },
    });
    /** @type {__VLS_StyleScopedClasses['abnormal']} */ ;
    (row.temperature);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_135;
let __VLS_139;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
    label: "湿度",
    width: "100",
    align: "center",
}));
const __VLS_141 = __VLS_140({
    label: "湿度",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_140));
const { default: __VLS_144 } = __VLS_142.slots;
{
    const { default: __VLS_145 } = __VLS_142.slots;
    const [{ row }] = __VLS_vSlot(__VLS_145);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: ({ 'abnormal': row.abnormalData?.humidity }) },
    });
    /** @type {__VLS_StyleScopedClasses['abnormal']} */ ;
    (row.airHumidity);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_142;
// @ts-ignore
[];
var __VLS_23;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "analysis-suggestions" },
});
/** @type {__VLS_StyleScopedClasses['analysis-suggestions']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "suggestion-list" },
});
/** @type {__VLS_StyleScopedClasses['suggestion-list']} */ ;
for (const [suggestion, index] of __VLS_vFor((__VLS_ctx.analysisSuggestions))) {
    let __VLS_146;
    /** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
    elAlert;
    // @ts-ignore
    const __VLS_147 = __VLS_asFunctionalComponent1(__VLS_146, new __VLS_146({
        key: (index),
        title: (suggestion.title),
        type: (suggestion.type),
        closable: (false),
        description: (suggestion.description),
        showIcon: true,
        ...{ class: "mb-3" },
    }));
    const __VLS_148 = __VLS_147({
        key: (index),
        title: (suggestion.title),
        type: (suggestion.type),
        closable: (false),
        description: (suggestion.description),
        showIcon: true,
        ...{ class: "mb-3" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_147));
    /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
    // @ts-ignore
    [analysisSuggestions,];
}
if (__VLS_ctx.analysisSuggestions.length === 0) {
    let __VLS_151;
    /** @ts-ignore @type {typeof __VLS_components.elAlert | typeof __VLS_components.ElAlert} */
    elAlert;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
        title: "暂无异常",
        type: "success",
        closable: (false),
        description: "所有温室运行正常，无需特别关注。",
        showIcon: true,
    }));
    const __VLS_153 = __VLS_152({
        title: "暂无异常",
        type: "success",
        closable: (false),
        description: "所有温室运行正常，无需特别关注。",
        showIcon: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
}
// @ts-ignore
[analysisSuggestions,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
