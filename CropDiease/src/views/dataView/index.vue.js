import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useGreenhouseApi } from '/@/api/greenhouse';
import { useAlertHistoryApi } from '/@/api/alertHistory';
import { useRecordApi } from '/@/api/record';
// API
const greenhouseApi = useGreenhouseApi();
const alertHistoryApi = useAlertHistoryApi();
const recordApi = useRecordApi();
// 当前时间
const currentTime = ref('');
const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long'
    });
};
// 数据状态
const greenhouseList = ref([]);
const alertList = ref([]);
const imgRecordList = ref([]);
const deviceList = ref([]);
const loading = ref(true);
// 统计数据
const statistics = computed(() => {
    const total = greenhouseList.value.length;
    // 根据温度、湿度等判断状态
    const normal = greenhouseList.value.filter(g => {
        const temp = g.temperature || 0;
        const humidity = g.airHumidity || 0;
        return temp >= 15 && temp <= 35 && humidity >= 40 && humidity <= 80;
    }).length;
    const warning = greenhouseList.value.filter(g => {
        const temp = g.temperature || 0;
        const humidity = g.airHumidity || 0;
        return temp < 15 || temp > 35 || humidity < 40 || humidity > 80;
    }).length;
    const offline = greenhouseList.value.filter(g => !g.recordTime ||
        (new Date().getTime() - new Date(g.recordTime).getTime() > 24 * 60 * 60 * 1000)).length;
    return { total, normal, warning: Math.max(0, warning - offline), offline };
});
// 地图相关
const mapInstance = ref(null);
const mapContainer = ref(null);
const markers = ref([]);
const districtSearch = ref(null);
const infoWindow = ref(null);
const currentMapLevel = ref('country');
const currentMapName = ref('中国');
const currentMapCode = ref('100000');
const mapStack = ref([]);
// 省份名称到行政区划代码映射
const provinceCodeMap = {
    '北京市': '110000', '天津市': '120000', '河北省': '130000', '山西省': '140000',
    '内蒙古自治区': '150000', '辽宁省': '210000', '吉林省': '220000', '黑龙江省': '230000',
    '上海市': '310000', '江苏省': '320000', '浙江省': '330000', '安徽省': '340000',
    '福建省': '350000', '江西省': '360000', '山东省': '370000', '河南省': '410000',
    '湖北省': '420000', '湖南省': '430000', '广东省': '440000', '广西壮族自治区': '450000',
    '海南省': '460000', '重庆市': '500000', '四川省': '510000', '贵州省': '520000',
    '云南省': '530000', '西藏自治区': '540000', '陕西省': '610000', '甘肃省': '620000',
    '青海省': '630000', '宁夏回族自治区': '640000', '新疆维吾尔自治区': '650000',
    '台湾省': '710000', '香港特别行政区': '810000', '澳门特别行政区': '820000'
};
// 城市名称到行政区划代码映射
const cityCodeMap = {
    '河源市': '441600',
    '广州市': '440100',
    '深圳市': '440300',
    '东莞市': '441900',
    '佛山市': '440600'
};
// 区县名称到行政区划代码映射
const districtCodeMap = {
    '源城区': '441602',
    '东源县': '441625',
    '和平县': '441624',
    '龙川县': '441622',
    '紫金县': '441621',
    '连平县': '441623'
};
// 乡镇名称到行政区划代码映射
const townCodeMap = {
    '埔前镇': '441602100'
};
// 村名到行政区划代码映射
const villageCodeMap = {
    '高围村': '441602100201'
};
// 判断温室状态
const getGreenhouseStatus = (g) => {
    if (!g.recordTime || (new Date().getTime() - new Date(g.recordTime).getTime() > 24 * 60 * 60 * 1000)) {
        return 'offline';
    }
    const temp = g.temperature || 0;
    const humidity = g.airHumidity || 0;
    if (temp < 15 || temp > 35 || humidity < 40 || humidity > 80) {
        return 'warning';
    }
    return 'normal';
};
// 温室位置数据（用于地图标注）
const greenhouseLocations = computed(() => {
    return greenhouseList.value
        .filter(g => g.latitude && g.longitude)
        .map(g => ({
        name: g.greenhouseName,
        value: [g.longitude, g.latitude],
        status: getGreenhouseStatus(g),
        id: g.id,
        province: g.province || '',
        city: g.city || '',
        district: g.district || '',
        town: g.town || '',
        village: g.village || '',
        cropType: g.cropType || '',
        temperature: g.temperature || 0,
        airHumidity: g.airHumidity || 0,
        manager: g.manager || ''
    }));
});
// 获取温室列表
const fetchGreenhouseList = async () => {
    try {
        const response = await greenhouseApi.getGreenhouseList({ pageSize: 100 });
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
            greenhouseList.value = response.data?.records || response.data || [];
        }
    }
    catch (error) {
        console.error('获取温室列表失败:', error);
    }
};
// 获取告警列表
const fetchAlertList = async () => {
    try {
        const response = await alertHistoryApi.getAlertHistoryList({ pageSize: 20, pageNum: 1 });
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
            alertList.value = response.data?.records || response.data || [];
        }
    }
    catch (error) {
        console.error('获取告警列表失败:', error);
    }
};
// 获取识别记录
const fetchRecordList = async () => {
    try {
        const response = await recordApi.getImgRecordList({ pageSize: 20, pageNum: 1 });
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
            imgRecordList.value = response.data?.records || response.data || [];
        }
    }
    catch (error) {
        console.error('获取识别记录失败:', error);
    }
};
// 获取设备列表
const fetchDeviceList = async () => {
    try {
        const response = await greenhouseApi.getAllDevices();
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
            deviceList.value = response.data || [];
        }
    }
    catch (error) {
        console.error('获取设备列表失败:', error);
    }
};
// 初始化地图
const initMap = async () => {
    if (!mapContainer.value)
        return;
    // 创建高德地图实例
    mapInstance.value = new AMap.Map(mapContainer.value, {
        zoom: 4,
        center: [116.397428, 39.90923],
        mapStyle: 'amap://styles/darkblue',
        viewMode: '2D',
        pitch: 0,
        rotation: 0,
        showLabel: true,
        showBuildingBlock: false,
        features: ['bg', 'road', 'building', 'point']
    });
    // 创建行政区划查询服务
    districtSearch.value = new AMap.DistrictSearch({
        level: 'country',
        subdistrict: 1
    });
    // 创建信息窗口
    infoWindow.value = new AMap.InfoWindow({
        isCustom: true,
        autoMove: true,
        closeWhenClickMap: true,
        offset: new AMap.Pixel(0, -30)
    });
    // 分析温室分布，决定初始地图级别
    const locations = greenhouseLocations.value;
    if (locations.length > 0) {
        // 获取所有唯一的省份、城市、区县、乡镇和村
        const provinces = [...new Set(locations.map(g => g.province).filter(Boolean))];
        const cities = [...new Set(locations.map(g => g.city).filter(Boolean))];
        const districts = [...new Set(locations.map(g => g.district).filter(Boolean))];
        const towns = [...new Set(locations.map(g => g.town).filter(Boolean))];
        const villages = [...new Set(locations.map(g => g.village).filter(Boolean))];
        console.log('温室分布分析:', { provinces, cities, districts, towns, villages, total: locations.length });
        // 从最详细的级别开始检查
        if (provinces.length === 1 && provinces[0]) {
            const provinceName = provinces[0];
            const provinceCode = provinceCodeMap[provinceName];
            if (provinceCode) {
                if (cities.length === 1 && cities[0]) {
                    const cityName = cities[0];
                    const cityCode = cityCodeMap[cityName] || provinceCode.substring(0, 4) + '00';
                    if (districts.length === 1 && districts[0]) {
                        const districtName = districts[0];
                        const districtCode = districtCodeMap[districtName] || cityCode.substring(0, 6);
                        if (towns.length === 1 && towns[0]) {
                            const townName = towns[0];
                            const townCode = townCodeMap[townName] || districtCode + '100';
                            if (villages.length === 1 && villages[0]) {
                                const villageName = villages[0];
                                const villageCode = villageCodeMap[villageName] || townCode + '201';
                                // 加载村级地图
                                currentMapLevel.value = 'village';
                                currentMapName.value = villageName;
                                currentMapCode.value = villageCode;
                                mapStack.value = [
                                    { name: '中国', code: '100000', level: 'country' },
                                    { name: provinceName, code: provinceCode, level: 'province' },
                                    { name: cityName, code: cityCode, level: 'city' },
                                    { name: districtName, code: districtCode, level: 'district' },
                                    { name: townName, code: townCode, level: 'town' }
                                ];
                                await loadMapByCode(villageCode, villageName, 'village');
                                return;
                            }
                            // 加载乡镇级地图
                            currentMapLevel.value = 'town';
                            currentMapName.value = townName;
                            currentMapCode.value = townCode;
                            mapStack.value = [
                                { name: '中国', code: '100000', level: 'country' },
                                { name: provinceName, code: provinceCode, level: 'province' },
                                { name: cityName, code: cityCode, level: 'city' },
                                { name: districtName, code: districtCode, level: 'district' }
                            ];
                            await loadMapByCode(townCode, townName, 'town');
                            return;
                        }
                        // 加载区县级地图
                        currentMapLevel.value = 'district';
                        currentMapName.value = districtName;
                        currentMapCode.value = districtCode;
                        mapStack.value = [
                            { name: '中国', code: '100000', level: 'country' },
                            { name: provinceName, code: provinceCode, level: 'province' },
                            { name: cityName, code: cityCode, level: 'city' }
                        ];
                        await loadMapByCode(districtCode, districtName, 'district');
                        return;
                    }
                    // 加载市级地图
                    currentMapLevel.value = 'city';
                    currentMapName.value = cityName;
                    currentMapCode.value = cityCode;
                    mapStack.value = [
                        { name: '中国', code: '100000', level: 'country' },
                        { name: provinceName, code: provinceCode, level: 'province' }
                    ];
                    await loadMapByCode(cityCode, cityName, 'city');
                    return;
                }
                // 加载省级地图
                currentMapLevel.value = 'province';
                currentMapName.value = provinceName;
                currentMapCode.value = provinceCode;
                mapStack.value = [{ name: '中国', code: '100000', level: 'country' }];
                await loadMapByCode(provinceCode, provinceName, 'province');
                return;
            }
        }
    }
    // 默认加载中国地图
    await loadMap('china', '中国');
};
// 根据行政区划代码加载地图
const loadMapByCode = async (adcode, displayName, level) => {
    if (!districtSearch.value || !mapInstance.value)
        return;
    districtSearch.value.setLevel(level);
    districtSearch.value.setSubdistrict(0);
    districtSearch.value.search(adcode, (status, result) => {
        if (status === 'complete' && result.districtList && result.districtList.length > 0) {
            const district = result.districtList[0];
            if (district.boundaries && district.boundaries.length > 0) {
                // 清除之前的覆盖物
                mapInstance.value?.clearMap();
                // 创建多边形覆盖物
                district.boundaries.forEach((boundary) => {
                    const polygon = new AMap.Polygon({
                        path: boundary,
                        strokeColor: '#00d4ff',
                        strokeWeight: 2,
                        strokeOpacity: 1,
                        fillColor: 'rgba(10, 42, 74, 0.6)',
                        fillOpacity: 0.6,
                        zIndex: 10
                    });
                    mapInstance.value?.add(polygon);
                    // 添加点击事件
                    polygon.on('click', async () => {
                        await handleDistrictClick(district);
                    });
                });
                currentMapName.value = displayName;
                currentMapCode.value = adcode;
                // 设置地图中心和缩放级别
                if (district.center) {
                    mapInstance.value?.setCenter([district.center.getLng(), district.center.getLat()]);
                }
                // 根据级别设置缩放
                const zoomLevels = {
                    'country': 4,
                    'province': 7,
                    'city': 10,
                    'district': 12,
                    'town': 14,
                    'village': 16
                };
                mapInstance.value?.setZoom(zoomLevels[level] || 10);
                // 添加温室标记
                addGreenhouseMarkers();
            }
        }
        else {
            console.error('加载地图失败:', status);
            // 失败时回退到上一级地图
            if (mapStack.value.length > 0) {
                goBackMap();
            }
            else {
                loadMap('china', '中国');
            }
        }
    });
};
// 加载地图
const loadMap = async (mapName, displayName) => {
    if (!districtSearch.value || !mapInstance.value)
        return;
    if (mapName === 'china') {
        districtSearch.value.setLevel('country');
        districtSearch.value.setSubdistrict(1);
        districtSearch.value.search('中国', (status, result) => {
            if (status === 'complete' && result.districtList && result.districtList.length > 0) {
                const districts = result.districtList[0].districtList || [];
                // 清除之前的覆盖物
                mapInstance.value?.clearMap();
                // 创建省级多边形覆盖物
                districts.forEach((province) => {
                    if (province.boundaries && province.boundaries.length > 0) {
                        province.boundaries.forEach((boundary) => {
                            const polygon = new AMap.Polygon({
                                path: boundary,
                                strokeColor: '#00d4ff',
                                strokeWeight: 2,
                                strokeOpacity: 1,
                                fillColor: 'rgba(10, 42, 74, 0.6)',
                                fillOpacity: 0.6,
                                zIndex: 10
                            });
                            mapInstance.value?.add(polygon);
                            // 添加点击事件
                            polygon.on('click', async () => {
                                await handleDistrictClick(province);
                            });
                        });
                    }
                });
                currentMapName.value = displayName;
                currentMapCode.value = '100000';
                // 设置地图中心和缩放级别
                mapInstance.value?.setCenter([116.397428, 39.90923]);
                mapInstance.value?.setZoom(4);
                // 添加温室标记
                addGreenhouseMarkers();
            }
        });
    }
};
// 处理区域点击事件
const handleDistrictClick = async (district) => {
    if (!district.adcode)
        return;
    // 记录当前地图到历史栈
    mapStack.value.push({
        name: currentMapName.value,
        code: currentMapCode.value,
        level: currentMapLevel.value
    });
    // 根据当前级别决定下钻到哪一级
    let nextLevel = 'province';
    switch (currentMapLevel.value) {
        case 'country':
            nextLevel = 'province';
            break;
        case 'province':
            nextLevel = 'city';
            break;
        case 'city':
            nextLevel = 'district';
            break;
        case 'district':
            nextLevel = 'town';
            break;
        case 'town':
            nextLevel = 'village';
            break;
        case 'village':
            return;
    }
    currentMapLevel.value = nextLevel;
    await loadMapByCode(district.adcode, district.name, nextLevel);
};
// 添加温室标记
const addGreenhouseMarkers = () => {
    if (!mapInstance.value)
        return;
    // 清除之前的标记
    markers.value.forEach(marker => marker.setMap(null));
    markers.value = [];
    // 添加新的标记
    greenhouseLocations.value.forEach(location => {
        const marker = new AMap.Marker({
            position: [location.value[0], location.value[1]],
            title: location.name,
            content: createMarkerContent(location),
            offset: new AMap.Pixel(-12, -12),
            zIndex: 100
        });
        // 添加点击事件
        marker.on('click', () => {
            showGreenhouseInfo(location);
        });
        marker.setMap(mapInstance.value);
        markers.value.push(marker);
    });
    // 自动调整视野以包含所有标记
    if (markers.value.length > 0) {
        mapInstance.value.setFitView(markers.value);
    }
};
// 创建标记内容
const createMarkerContent = (location) => {
    const colors = {
        normal: '#00ff88',
        warning: '#ffaa00',
        offline: '#ff4444'
    };
    const color = colors[location.status] || '#00d4ff';
    return `
    <div style="
      width: 24px;
      height: 24px;
      background: ${color};
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 10px ${color};
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: #fff;
        border-radius: 50%;
      "></div>
    </div>
  `;
};
// 显示温室信息窗口
const showGreenhouseInfo = (location) => {
    if (!infoWindow.value || !mapInstance.value)
        return;
    const statusText = location.status === 'normal' ? '正常' :
        location.status === 'warning' ? '告警' : '离线';
    const statusColor = location.status === 'normal' ? '#00ff88' :
        location.status === 'warning' ? '#ffaa00' : '#ff4444';
    const content = `
    <div style="padding: 15px; min-width: 200px; background: rgba(0, 20, 40, 0.95); border: 1px solid #00d4ff; border-radius: 8px;">
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #00d4ff;">${location.name}</div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #88aacc;">状态:</span>
        <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #88aacc;">作物:</span>
        <span style="color: #fff;">${location.cropType || '-'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #88aacc;">温度:</span>
        <span style="color: #ff6b6b;">${location.temperature}°C</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
        <span style="color: #88aacc;">湿度:</span>
        <span style="color: #4ecdc4;">${location.airHumidity}%</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span style="color: #88aacc;">管理员:</span>
        <span style="color: #fff;">${location.manager || '-'}</span>
      </div>
    </div>
  `;
    infoWindow.value.setContent(content);
    infoWindow.value.open(mapInstance.value, [location.value[0], location.value[1]]);
};
// 返回上一级地图
const goBackMap = async () => {
    if (mapStack.value.length > 0) {
        const prevMap = mapStack.value.pop();
        if (prevMap) {
            currentMapLevel.value = prevMap.level;
            currentMapName.value = prevMap.name;
            currentMapCode.value = prevMap.code;
            if (prevMap.level === 'country') {
                await loadMap('china', prevMap.name);
            }
            else {
                await loadMapByCode(prevMap.code, prevMap.name, prevMap.level);
            }
        }
    }
    else {
        // 没有历史记录，返回中国地图
        currentMapLevel.value = 'country';
        currentMapName.value = '中国';
        currentMapCode.value = '100000';
        await loadMap('china', '中国');
    }
};
// 初始化左侧图表
const leftCharts = ref({
    greenhouseStatus: null,
    environment: null
});
const initLeftCharts = () => {
    // 温室状态饼图
    const statusChart = document.getElementById('greenhouse-status-chart');
    if (statusChart) {
        leftCharts.value.greenhouseStatus = echarts.init(statusChart);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 20, 40, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            legend: {
                orient: 'vertical',
                right: '5%',
                top: 'center',
                textStyle: { color: '#fff', fontSize: 12 }
            },
            series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['35%', '50%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 5,
                        borderColor: '#0a1a2a',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        position: 'center',
                        formatter: () => `{total|${statistics.value.total}}\n{label|温室总数}`,
                        rich: {
                            total: { fontSize: 28, fontWeight: 'bold', color: '#00d4ff' },
                            label: { fontSize: 12, color: '#aaa', padding: [5, 0, 0, 0] }
                        }
                    },
                    emphasis: {
                        label: { show: true, fontSize: 14, fontWeight: 'bold' }
                    },
                    labelLine: { show: false },
                    data: [
                        { value: statistics.value.normal, name: '正常', itemStyle: { color: '#00ff88' } },
                        { value: statistics.value.warning, name: '告警', itemStyle: { color: '#ffaa00' } },
                        { value: statistics.value.offline, name: '离线', itemStyle: { color: '#ff4444' } }
                    ]
                }]
        };
        leftCharts.value.greenhouseStatus.setOption(option);
    }
    // 环境数据图表
    const envChart = document.getElementById('environment-chart');
    if (envChart) {
        leftCharts.value.environment = echarts.init(envChart);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 20, 40, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: ['温度', '湿度'],
                textStyle: { color: '#fff', fontSize: 12 },
                top: 5
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
                axisLine: { lineStyle: { color: '#1a4a7a' } },
                axisLabel: { color: '#88aacc' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#1a4a7a' } },
                axisLabel: { color: '#88aacc' },
                splitLine: { lineStyle: { color: '#1a3a5a' } }
            },
            series: [
                {
                    name: '温度',
                    type: 'line',
                    smooth: true,
                    data: [22, 21, 23, 28, 32, 30, 25],
                    lineStyle: { color: '#ff6b6b', width: 2 },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
                            { offset: 1, color: 'rgba(255, 107, 107, 0)' }
                        ])
                    },
                    itemStyle: { color: '#ff6b6b' }
                },
                {
                    name: '湿度',
                    type: 'line',
                    smooth: true,
                    data: [65, 68, 70, 62, 55, 58, 64],
                    lineStyle: { color: '#4ecdc4', width: 2 },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(78, 205, 196, 0.3)' },
                            { offset: 1, color: 'rgba(78, 205, 196, 0)' }
                        ])
                    },
                    itemStyle: { color: '#4ecdc4' }
                }
            ]
        };
        leftCharts.value.environment.setOption(option);
    }
};
// 初始化右侧图表
const rightCharts = ref({
    alertTrend: null,
    diseaseType: null
});
const initRightCharts = () => {
    // 告警趋势图
    const alertChart = document.getElementById('alert-trend-chart');
    if (alertChart) {
        rightCharts.value.alertTrend = echarts.init(alertChart);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0, 20, 40, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                axisLine: { lineStyle: { color: '#1a4a7a' } },
                axisLabel: { color: '#88aacc' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#1a4a7a' } },
                axisLabel: { color: '#88aacc' },
                splitLine: { lineStyle: { color: '#1a3a5a' } }
            },
            series: [{
                    type: 'bar',
                    data: [12, 8, 15, 6, 10, 4, 7],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#ff6b6b' },
                            { offset: 1, color: '#ff6b6b33' }
                        ]),
                        borderRadius: [4, 4, 0, 0]
                    },
                    barWidth: '40%'
                }]
        };
        rightCharts.value.alertTrend.setOption(option);
    }
    // 病虫害类型饼图
    const diseaseChart = document.getElementById('disease-type-chart');
    if (diseaseChart) {
        rightCharts.value.diseaseType = echarts.init(diseaseChart);
        const option = {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(0, 20, 40, 0.9)',
                borderColor: '#00d4ff',
                textStyle: { color: '#fff' }
            },
            legend: {
                orient: 'vertical',
                right: '5%',
                top: 'center',
                textStyle: { color: '#fff', fontSize: 11 }
            },
            series: [{
                    type: 'pie',
                    radius: ['35%', '60%'],
                    center: ['35%', '50%'],
                    data: [
                        { value: 35, name: '蚜虫', itemStyle: { color: '#ff6b6b' } },
                        { value: 28, name: '白粉病', itemStyle: { color: '#4ecdc4' } },
                        { value: 20, name: '红蜘蛛', itemStyle: { color: '#ffd93d' } },
                        { value: 15, name: '霜霉病', itemStyle: { color: '#6bcb77' } },
                        { value: 12, name: '其他', itemStyle: { color: '#9b59b6' } }
                    ],
                    label: {
                        show: false
                    },
                    itemStyle: {
                        borderRadius: 3,
                        borderColor: '#0a1a2a',
                        borderWidth: 2
                    }
                }]
        };
        rightCharts.value.diseaseType.setOption(option);
    }
};
// 滚动数据
const scrollData = ref([]);
const scrollIndex = ref(0);
// 初始化滚动数据
const initScrollData = () => {
    scrollData.value = [
        { type: 'alert', content: '1号温室温度过高，当前温度35°C', time: '10:30:25' },
        { type: 'disease', content: '检测到番茄晚疫病，置信度95%', time: '10:28:15' },
        { type: 'device', content: '2号温室风机已自动开启', time: '10:25:30' },
        { type: 'alert', content: '3号温室湿度偏低，当前湿度40%', time: '10:22:10' },
        { type: 'disease', content: '检测到黄瓜霜霉病，置信度88%', time: '10:20:45' },
        { type: 'device', content: '灌溉系统已完成自动浇水', time: '10:18:20' },
        { type: 'alert', content: '4号温室CO2浓度异常', time: '10:15:30' },
        { type: 'disease', content: '检测到辣椒炭疽病，置信度92%', time: '10:12:00' }
    ];
};
// 定时器
let timeTimer = null;
let scrollTimer = null;
// 页面加载
onMounted(async () => {
    loading.value = true;
    // 更新时间
    updateTime();
    timeTimer = window.setInterval(updateTime, 1000);
    // 获取数据
    await Promise.all([
        fetchGreenhouseList(),
        fetchAlertList(),
        fetchRecordList(),
        fetchDeviceList()
    ]);
    loading.value = false;
    // 初始化图表
    await nextTick();
    initMap();
    initLeftCharts();
    initRightCharts();
    initScrollData();
    // 窗口大小变化时重新调整图表
    window.addEventListener('resize', handleResize);
});
// 处理窗口大小变化
const handleResize = () => {
    mapInstance.value?.setSize();
    Object.values(leftCharts.value).forEach(chart => chart?.resize());
    Object.values(rightCharts.value).forEach(chart => chart?.resize());
};
// 页面卸载
onUnmounted(() => {
    if (timeTimer)
        clearInterval(timeTimer);
    if (scrollTimer)
        clearInterval(scrollTimer);
    window.removeEventListener('resize', handleResize);
    mapInstance.value?.destroy();
    Object.values(leftCharts.value).forEach(chart => chart?.dispose());
    Object.values(rightCharts.value).forEach(chart => chart?.dispose());
});
// 获取告警级别样式
const getAlertLevelClass = (level) => {
    switch (level) {
        case 'critical': return 'level-critical';
        case 'error': return 'level-error';
        case 'warning': return 'level-warning';
        default: return 'level-info';
    }
};
// 获取告警级别文本
const getAlertLevelText = (level) => {
    switch (level) {
        case 'critical': return '紧急';
        case 'error': return '严重';
        case 'warning': return '警告';
        default: return '提示';
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stats-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stats-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
/** @type {__VLS_StyleScopedClasses['device-status']} */ ;
/** @type {__VLS_StyleScopedClasses['device-status']} */ ;
/** @type {__VLS_StyleScopedClasses['map-title']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-item']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-item']} */ ;
/** @type {__VLS_StyleScopedClasses['scroll-item']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-level']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-level']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-level']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-level']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "data-screen" },
});
/** @type {__VLS_StyleScopedClasses['data-screen']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-left" },
});
/** @type {__VLS_StyleScopedClasses['header-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "logo" },
});
/** @type {__VLS_StyleScopedClasses['logo']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "title" },
});
/** @type {__VLS_StyleScopedClasses['title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-center" },
});
/** @type {__VLS_StyleScopedClasses['header-center']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "time" },
});
/** @type {__VLS_StyleScopedClasses['time']} */ ;
(__VLS_ctx.currentTime);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header-right" },
});
/** @type {__VLS_StyleScopedClasses['header-right']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-item" },
});
/** @type {__VLS_StyleScopedClasses['stats-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stats-value" },
});
/** @type {__VLS_StyleScopedClasses['stats-value']} */ ;
(__VLS_ctx.statistics.total);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stats-label" },
});
/** @type {__VLS_StyleScopedClasses['stats-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-item" },
});
/** @type {__VLS_StyleScopedClasses['stats-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stats-value online" },
});
/** @type {__VLS_StyleScopedClasses['stats-value']} */ ;
/** @type {__VLS_StyleScopedClasses['online']} */ ;
(__VLS_ctx.statistics.normal);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stats-label" },
});
/** @type {__VLS_StyleScopedClasses['stats-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "stats-item" },
});
/** @type {__VLS_StyleScopedClasses['stats-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stats-value warning" },
});
/** @type {__VLS_StyleScopedClasses['stats-value']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
(__VLS_ctx.statistics.warning);
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "stats-label" },
});
/** @type {__VLS_StyleScopedClasses['stats-label']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "main-content" },
});
/** @type {__VLS_StyleScopedClasses['main-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "left-panel" },
});
/** @type {__VLS_StyleScopedClasses['left-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-item" },
});
/** @type {__VLS_StyleScopedClasses['panel-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-header" },
});
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "panel-title" },
});
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-body" },
});
/** @type {__VLS_StyleScopedClasses['panel-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    id: "greenhouse-status-chart",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-item" },
});
/** @type {__VLS_StyleScopedClasses['panel-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-header" },
});
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "panel-title" },
});
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-body" },
});
/** @type {__VLS_StyleScopedClasses['panel-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    id: "environment-chart",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-item" },
});
/** @type {__VLS_StyleScopedClasses['panel-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-header" },
});
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "panel-title" },
});
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-body" },
});
/** @type {__VLS_StyleScopedClasses['panel-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "device-list" },
});
/** @type {__VLS_StyleScopedClasses['device-list']} */ ;
for (const [device] of __VLS_vFor((__VLS_ctx.deviceList.slice(0, 6)))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (device.id),
        ...{ class: "device-item" },
    });
    /** @type {__VLS_StyleScopedClasses['device-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "device-name" },
    });
    /** @type {__VLS_StyleScopedClasses['device-name']} */ ;
    (device.deviceName);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (['device-status', device.status === 1 ? 'on' : 'off']) },
    });
    /** @type {__VLS_StyleScopedClasses['device-status']} */ ;
    (device.status === 1 ? '运行中' : '已停止');
    // @ts-ignore
    [currentTime, statistics, statistics, statistics, deviceList,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "center-panel" },
});
/** @type {__VLS_StyleScopedClasses['center-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "map-container" },
    ref: "mapContainer",
});
/** @type {__VLS_StyleScopedClasses['map-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "map-title" },
});
/** @type {__VLS_StyleScopedClasses['map-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "map-level" },
});
/** @type {__VLS_StyleScopedClasses['map-level']} */ ;
(__VLS_ctx.currentMapName);
if (__VLS_ctx.currentMapLevel !== 'country') {
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        ...{ class: "back-btn" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
        ...{ class: "back-btn" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_5;
    const __VLS_6 = ({ click: {} },
        { onClick: (__VLS_ctx.goBackMap) });
    /** @type {__VLS_StyleScopedClasses['back-btn']} */ ;
    const { default: __VLS_7 } = __VLS_3.slots;
    // @ts-ignore
    [currentMapName, currentMapLevel, goBackMap,];
    var __VLS_3;
    var __VLS_4;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "map-legend" },
});
/** @type {__VLS_StyleScopedClasses['map-legend']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "legend-item" },
});
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot normal" },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['normal']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "legend-item" },
});
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot warning" },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "legend-item" },
});
/** @type {__VLS_StyleScopedClasses['legend-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "legend-dot offline" },
});
/** @type {__VLS_StyleScopedClasses['legend-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['offline']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "scroll-panel" },
});
/** @type {__VLS_StyleScopedClasses['scroll-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "scroll-header" },
});
/** @type {__VLS_StyleScopedClasses['scroll-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "scroll-title" },
});
/** @type {__VLS_StyleScopedClasses['scroll-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "scroll-content" },
});
/** @type {__VLS_StyleScopedClasses['scroll-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "scroll-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['scroll-wrapper']} */ ;
for (const [item, index] of __VLS_vFor((__VLS_ctx.scrollData))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (index),
        ...{ class: "scroll-item" },
        ...{ class: (item.type) },
    });
    /** @type {__VLS_StyleScopedClasses['scroll-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "scroll-time" },
    });
    /** @type {__VLS_StyleScopedClasses['scroll-time']} */ ;
    (item.time);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "scroll-text" },
    });
    /** @type {__VLS_StyleScopedClasses['scroll-text']} */ ;
    (item.content);
    // @ts-ignore
    [scrollData,];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "right-panel" },
});
/** @type {__VLS_StyleScopedClasses['right-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-item" },
});
/** @type {__VLS_StyleScopedClasses['panel-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-header" },
});
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "panel-title" },
});
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-body" },
});
/** @type {__VLS_StyleScopedClasses['panel-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "alert-list" },
});
/** @type {__VLS_StyleScopedClasses['alert-list']} */ ;
for (const [alert] of __VLS_vFor((__VLS_ctx.alertList.slice(0, 5)))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (alert.id),
        ...{ class: "alert-item" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-header" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: (['alert-level', __VLS_ctx.getAlertLevelClass(alert.alertLevel)]) },
    });
    /** @type {__VLS_StyleScopedClasses['alert-level']} */ ;
    (__VLS_ctx.getAlertLevelText(alert.alertLevel));
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "alert-time" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-time']} */ ;
    (alert.alertTime?.substring(11, 19) || '--:--:--');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-content" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-content']} */ ;
    (alert.alertMessage || '暂无告警信息');
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "alert-source" },
    });
    /** @type {__VLS_StyleScopedClasses['alert-source']} */ ;
    (alert.greenhouseName || '未知温室');
    // @ts-ignore
    [alertList, getAlertLevelClass, getAlertLevelText,];
}
if (__VLS_ctx.alertList.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "no-data" },
    });
    /** @type {__VLS_StyleScopedClasses['no-data']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-item" },
});
/** @type {__VLS_StyleScopedClasses['panel-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-header" },
});
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "panel-title" },
});
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-body" },
});
/** @type {__VLS_StyleScopedClasses['panel-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    id: "alert-trend-chart",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-item" },
});
/** @type {__VLS_StyleScopedClasses['panel-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-header" },
});
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "panel-title" },
});
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-body" },
});
/** @type {__VLS_StyleScopedClasses['panel-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    id: "disease-type-chart",
    ...{ class: "chart-container" },
});
/** @type {__VLS_StyleScopedClasses['chart-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-item" },
});
/** @type {__VLS_StyleScopedClasses['panel-item']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-header" },
});
/** @type {__VLS_StyleScopedClasses['panel-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "panel-title" },
});
/** @type {__VLS_StyleScopedClasses['panel-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "panel-body" },
});
/** @type {__VLS_StyleScopedClasses['panel-body']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "record-list" },
});
/** @type {__VLS_StyleScopedClasses['record-list']} */ ;
for (const [record] of __VLS_vFor((__VLS_ctx.imgRecordList.slice(0, 5)))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (record.id),
        ...{ class: "record-item" },
    });
    /** @type {__VLS_StyleScopedClasses['record-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "record-info" },
    });
    /** @type {__VLS_StyleScopedClasses['record-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "record-disease" },
    });
    /** @type {__VLS_StyleScopedClasses['record-disease']} */ ;
    (record.diseaseName || '未知病害');
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "record-confidence" },
    });
    /** @type {__VLS_StyleScopedClasses['record-confidence']} */ ;
    ((record.confidence * 100 || 0).toFixed(1));
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "record-time" },
    });
    /** @type {__VLS_StyleScopedClasses['record-time']} */ ;
    (record.createTime?.substring(11, 19) || '--:--:--');
    // @ts-ignore
    [alertList, imgRecordList,];
}
if (__VLS_ctx.imgRecordList.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "no-data" },
    });
    /** @type {__VLS_StyleScopedClasses['no-data']} */ ;
}
// @ts-ignore
[imgRecordList,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
