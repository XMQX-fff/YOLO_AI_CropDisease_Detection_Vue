<script setup lang="ts">
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
const greenhouseList = ref<any[]>([]);
const alertList = ref<any[]>([]);
const imgRecordList = ref<any[]>([]);
const deviceList = ref<any[]>([]);
const loading = ref(true);

// 当前选中的温室
const selectedGreenhouse = ref<any>(null);

// 病虫害类型分布数据
const diseaseTypeDistribution = ref<any[]>([]);

// 统计数据
const statistics = computed(() => {
  const total = greenhouseList.value.length;
  
  // 先判断离线状态
  const isOffline = (g: any) => !g.recordTime || 
    (new Date().getTime() - new Date(g.recordTime).getTime() > 24 * 60 * 60 * 1000);
  
  // 离线温室
  const offline = greenhouseList.value.filter(g => isOffline(g)).length;
  
  // 在线温室中判断正常和告警
  const onlineGreenhouses = greenhouseList.value.filter(g => !isOffline(g));
  
  const normal = onlineGreenhouses.filter(g => {
    const temp = g.temperature || 0;
    const humidity = g.airHumidity || 0;
    return temp >= 15 && temp <= 35 && humidity >= 40 && humidity <= 80;
  }).length;
  
  const warning = onlineGreenhouses.filter(g => {
    const temp = g.temperature || 0;
    const humidity = g.airHumidity || 0;
    return temp < 15 || temp > 35 || humidity < 40 || humidity > 80;
  }).length;
  
  return { total, normal, warning, offline };
});

// 地图相关
const mapInstance = ref<AMap.Map | null>(null);
const mapContainer = ref<HTMLElement | null>(null);
const markers = ref<AMap.Marker[]>([]);
const districtSearch = ref<AMap.DistrictSearch | null>(null);
const infoWindow = ref<AMap.InfoWindow | null>(null);
type MapLevel = 'country' | 'province' | 'city' | 'district' | 'town' | 'village';
const currentMapLevel = ref<MapLevel>('country');
const currentMapName = ref('中国');
const currentMapCode = ref('100000');
const mapStack = ref<{name: string, code: string, level: MapLevel}[]>([]);

// 省份名称到行政区划代码映射
const provinceCodeMap: Record<string, string> = {
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
const cityCodeMap: Record<string, string> = {
  '河源市': '441600',
  '广州市': '440100',
  '深圳市': '440300',
  '东莞市': '441900',
  '佛山市': '440600'
};

// 区县名称到行政区划代码映射
const districtCodeMap: Record<string, string> = {
  '源城区': '441602',
  '东源县': '441625',
  '和平县': '441624',
  '龙川县': '441622',
  '紫金县': '441621',
  '连平县': '441623'
};

// 乡镇名称到行政区划代码映射
const townCodeMap: Record<string, string> = {
  '埔前镇': '441602100'
};

// 村名到行政区划代码映射
const villageCodeMap: Record<string, string> = {
  '高围村': '441602100201'
};

// 判断温室状态
const getGreenhouseStatus = (g: any) => {
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
    if (String(response.code) === '0' || String(response.code) === '200') {
      greenhouseList.value = response.data?.records || response.data || [];
    }
  } catch (error) {
    console.error('获取温室列表失败:', error);
  }
};

// 获取告警列表
const fetchAlertList = async () => {
  try {
    const response = await alertHistoryApi.getAlertHistoryList({ pageSize: 20, pageNum: 1 });
    if (String(response.code) === '0' || String(response.code) === '200') {
      alertList.value = response.data?.records || response.data || [];
    }
  } catch (error) {
    console.error('获取告警列表失败:', error);
  }
};

// 获取识别记录
const fetchRecordList = async () => {
  try {
    const response = await recordApi.getPestDetectionList({ pageSize: 20, pageNum: 1 });
    if (String(response.code) === '0' || String(response.code) === '200') {
      imgRecordList.value = response.data?.records || response.data || [];
    }
  } catch (error) {
    console.error('获取识别记录失败:', error);
  }
};

// 获取设备列表
const fetchDeviceList = async () => {
  try {
    const response = await greenhouseApi.getAllDevices();
    if (String(response.code) === '0' || String(response.code) === '200') {
      deviceList.value = response.data || [];
    }
  } catch (error) {
    console.error('获取设备列表失败:', error);
  }
};

// 获取病虫害类型分布数据
const fetchDiseaseTypeDistribution = async () => {
  try {
    const response = await recordApi.getAllGreenhouseDetections();
    if (String(response.code) === '0' || String(response.code) === '200') {
      const records = response.data || [];
      // 统计病虫害类型
      const typeCount: Record<string, number> = {};
      records.forEach((record: any) => {
        let diseaseTypes: string[] = [];
        if (record.diseaseNames) {
          // 处理可能包含多个病虫害类型的情况，按逗号分割
          diseaseTypes = record.diseaseNames.split(',').map((type: string) => type.trim());
        } else if (record.pestDiseaseName) {
          diseaseTypes = [record.pestDiseaseName];
        } else if (record.detectedDisease) {
          diseaseTypes = [record.detectedDisease];
        } else {
          diseaseTypes = ['其他'];
        }
        
        // 对每个病虫害类型进行计数
        diseaseTypes.forEach((type: string) => {
          typeCount[type] = (typeCount[type] || 0) + 1;
        });
      });
      // 转换为数组格式
      diseaseTypeDistribution.value = Object.entries(typeCount).map(([name, value]) => ({
        name,
        value
      })).sort((a, b) => b.value - a.value); // 按数量降序排序
    }
  } catch (error) {
    console.error('获取病虫害类型分布失败:', error);
    diseaseTypeDistribution.value = [];
  }
};

// 初始化地图
const initMap = async () => {
  if (!mapContainer.value) return;
  
  // 创建高德地图实例
  mapInstance.value = new AMap.Map(mapContainer.value, {
    zoom: 4,
    center: [116.397428, 39.90923],
    // 暂时使用默认样式，避免样式加载错误
    // mapStyle: 'amap://styles/darkblue',
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
const loadMapByCode = async (adcode: string, displayName: string, level: 'province' | 'city' | 'district' | 'town' | 'village') => {
  if (!districtSearch.value || !mapInstance.value) return;
  
  districtSearch.value.setLevel(level);
  districtSearch.value.setSubdistrict(0);
  
  districtSearch.value.search(adcode, (status: string, result: AMap.DistrictSearchResult) => {
    if (status === 'complete' && result.districtList && result.districtList.length > 0) {
      const district = result.districtList[0];
      
      if (district.boundaries && district.boundaries.length > 0) {
        // 清除之前的覆盖物
        mapInstance.value?.clear();
        
        // 创建多边形覆盖物
        district.boundaries.forEach((boundary: any) => {
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
        const zoomLevels: Record<MapLevel, number> = {
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
    } else {
      console.error('加载地图失败:', status);
      // 失败时回退到上一级地图
      if (mapStack.value.length > 0) {
        goBackMap();
      } else {
        loadMap('china', '中国');
      }
    }
  });
};

// 加载地图
const loadMap = async (mapName: string, displayName: string) => {
  if (!districtSearch.value || !mapInstance.value) return;
  
  if (mapName === 'china') {
    districtSearch.value.setLevel('country');
    districtSearch.value.setSubdistrict(1);
    
    districtSearch.value.search('中国', (status: string, result: AMap.DistrictSearchResult) => {
      if (status === 'complete' && result.districtList && result.districtList.length > 0) {
        const districts = result.districtList[0].districtList || [];
        
        // 清除之前的覆盖物
        mapInstance.value?.clear();
        
        // 创建省级多边形覆盖物
        districts.forEach((province: AMap.District) => {
          if (province.boundaries && province.boundaries.length > 0) {
            province.boundaries.forEach((boundary: any) => {
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
const handleDistrictClick = async (district: AMap.District) => {
  if (!district.adcode) return;
  
  // 记录当前地图到历史栈
  mapStack.value.push({
    name: currentMapName.value,
    code: currentMapCode.value,
    level: currentMapLevel.value
  });
  
  // 根据当前级别决定下钻到哪一级
  let nextLevel: MapLevel = 'province';
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
  if (!mapInstance.value) return;
  
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
const createMarkerContent = (location: any) => {
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
const showGreenhouseInfo = async (location: any) => {
  if (!infoWindow.value || !mapInstance.value) return;
  
  // 设置选中的温室
  selectedGreenhouse.value = location;
  
  // 获取该温室的设备列表
  try {
    const response = await greenhouseApi.getDevicesByGreenhouseId(location.id);
    if (String(response.code) === '0' || String(response.code) === '200') {
      deviceList.value = response.data || [];
    }
  } catch (error) {
    console.error('获取温室设备列表失败:', error);
    deviceList.value = [];
  }
  
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
      } else {
        await loadMapByCode(prevMap.code, prevMap.name, prevMap.level);
      }
    }
  } else {
    // 没有历史记录，返回中国地图
    currentMapLevel.value = 'country';
    currentMapName.value = '中国';
    currentMapCode.value = '100000';
    await loadMap('china', '中国');
  }
};

// 初始化左侧图表
const leftCharts = ref<{ [key: string]: echarts.ECharts | null }>({
  greenhouseStatus: null,
  environment: null
});

const initLeftCharts = () => {
  // 温室状态饼图
  const statusChart = document.getElementById('greenhouse-status-chart');
  if (statusChart) {
    leftCharts.value.greenhouseStatus = echarts.init(statusChart);
    const option: echarts.EChartsOption = {
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
    const option: echarts.EChartsOption = {
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
const rightCharts = ref<{ [key: string]: echarts.ECharts | null }>({
  alertTrend: null,
  diseaseType: null
});

const initRightCharts = () => {
  // 告警趋势图
  const alertChart = document.getElementById('alert-trend-chart');
  if (alertChart) {
    rightCharts.value.alertTrend = echarts.init(alertChart);
    const option: echarts.EChartsOption = {
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
    
    // 颜色配置
    const colorMap: Record<string, string> = {
      '蚜虫': '#ff6b6b',
      '白粉病': '#4ecdc4',
      '红蜘蛛': '#ffd93d',
      '霜霉病': '#6bcb77',
      '其他': '#9b59b6'
    };
    const defaultColors = ['#ff6b6b', '#4ecdc4', '#ffd93d', '#6bcb77', '#9b59b6', '#f39c12', '#e74c3c', '#3498db', '#1abc9c', '#34495e'];
    
    // 使用真实数据或默认数据
    const chartData = diseaseTypeDistribution.value.length > 0 
      ? diseaseTypeDistribution.value.map((item, index) => ({
          value: item.value,
          name: item.name,
          itemStyle: { color: colorMap[item.name] || defaultColors[index % defaultColors.length] }
        }))
      : [
          { value: 35, name: '蚜虫', itemStyle: { color: '#ff6b6b' } },
          { value: 28, name: '白粉病', itemStyle: { color: '#4ecdc4' } },
          { value: 20, name: '红蜘蛛', itemStyle: { color: '#ffd93d' } },
          { value: 15, name: '霜霉病', itemStyle: { color: '#6bcb77' } },
          { value: 12, name: '其他', itemStyle: { color: '#9b59b6' } }
        ];
    
    const option: echarts.EChartsOption = {
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
        data: chartData,
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
const scrollData = ref<any[]>([]);
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
let timeTimer: number | null = null;
let scrollTimer: number | null = null;

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
    fetchDeviceList(),
    fetchDiseaseTypeDistribution()
  ]);
  
  loading.value = false;
  
  // 初始化图表
  await nextTick();
  initMap();
  initLeftCharts();
  initRightCharts();
  initScrollData();
  
  // 确保温室标记被添加
  setTimeout(() => {
    console.log('温室数据:', greenhouseList.value);
    console.log('温室位置数据:', greenhouseLocations.value);
    addGreenhouseMarkers();
  }, 1000);
  
  // 窗口大小变化时重新调整图表
  window.addEventListener('resize', handleResize);
});

// 处理窗口大小变化
const handleResize = () => {
  // 高德地图会自动适应容器大小变化
  Object.values(leftCharts.value).forEach(chart => chart?.resize());
  Object.values(rightCharts.value).forEach(chart => chart?.resize());
};

// 页面卸载
onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer);
  if (scrollTimer) clearInterval(scrollTimer);
  window.removeEventListener('resize', handleResize);
  mapInstance.value?.destroy();
  Object.values(leftCharts.value).forEach(chart => chart?.dispose());
  Object.values(rightCharts.value).forEach(chart => chart?.dispose());
});

// 获取告警级别样式
const getAlertLevelClass = (level: string) => {
  switch (level) {
    case 'critical': return 'level-critical';
    case 'error': return 'level-error';
    case 'warning': return 'level-warning';
    default: return 'level-info';
  }
};

// 获取告警级别文本
const getAlertLevelText = (level: string) => {
  switch (level) {
    case 'critical': return '紧急';
    case 'error': return '严重';
    case 'warning': return '警告';
    default: return '提示';
  }
};
</script>

<template>
  <div class="data-screen">
    <!-- 顶部标题 -->
    <div class="header">
      <div class="header-left">
        <span class="logo">🌱</span>
        <span class="title">智能温室数据监控大屏</span>
      </div>
      <div class="header-center">
        <div class="time">{{ currentTime }}</div>
      </div>
      <div class="header-right">
        <div class="stats-item">
          <span class="stats-value">{{ statistics.total }}</span>
          <span class="stats-label">温室总数</span>
        </div>
        <div class="stats-item">
          <span class="stats-value online">{{ statistics.normal }}</span>
          <span class="stats-label">正常运行</span>
        </div>
        <div class="stats-item">
          <span class="stats-value warning">{{ statistics.warning }}</span>
          <span class="stats-label">告警中</span>
        </div>
      </div>
    </div>
    
    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 温室状态统计 -->
        <div class="panel-item">
          <div class="panel-header">
            <span class="panel-title">温室状态统计</span>
          </div>
          <div class="panel-body">
            <div id="greenhouse-status-chart" class="chart-container"></div>
          </div>
        </div>
        
        <!-- 环境数据趋势 -->
        <div class="panel-item">
          <div class="panel-header">
            <span class="panel-title">环境数据趋势</span>
          </div>
          <div class="panel-body">
            <div id="environment-chart" class="chart-container"></div>
          </div>
        </div>
        
        <!-- 设备状态 -->
        <div class="panel-item">
          <div class="panel-header">
            <span class="panel-title">设备运行状态</span>
            <span v-if="selectedGreenhouse" class="panel-subtitle">{{ selectedGreenhouse.name }}</span>
          </div>
          <div class="panel-body">
            <div v-if="!selectedGreenhouse" class="no-data">
              <div class="no-data-text">暂无选取温室</div>
              <div class="no-data-hint">请点击地图上的温室查看设备状态</div>
            </div>
            <div v-else-if="deviceList.length === 0" class="no-data">
              <div class="no-data-text">该温室暂无设备</div>
            </div>
            <div v-else class="device-list">
              <div v-for="device in deviceList.slice(0, 6)" :key="device.id" class="device-item">
                <span class="device-name">{{ device.deviceName }}</span>
                <span :class="['device-status', device.currentStatus === 1 ? 'on' : 'off']">
                  {{ device.currentStatus === 1 ? '运行中' : '已停止' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 中间地图区域 -->
      <div class="center-panel">
        <div class="map-container" ref="mapContainer">
          <!-- 地图标题 -->
          <div class="map-title">
            <span>温室地理分布</span>
            <span class="map-level">{{ currentMapName }}</span>
            <el-button 
              v-if="currentMapLevel !== 'country'" 
              size="small" 
              type="primary" 
              @click="goBackMap"
              class="back-btn"
            >
              返回上级
            </el-button>
          </div>
          
          <!-- 地图图例 -->
          <div class="map-legend">
            <div class="legend-item">
              <span class="legend-dot normal"></span>
              <span>正常</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot warning"></span>
              <span>告警</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot offline"></span>
              <span>离线</span>
            </div>
          </div>
        </div>
        
        <!-- 底部滚动数据 -->
        <div class="scroll-panel">
          <div class="scroll-header">
            <span class="scroll-title">实时动态</span>
          </div>
          <div class="scroll-content">
            <div class="scroll-wrapper">
              <div 
                v-for="(item, index) in scrollData" 
                :key="index" 
                class="scroll-item"
                :class="item.type"
              >
                <span class="scroll-time">{{ item.time }}</span>
                <span class="scroll-text">{{ item.content }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧面板 -->
      <div class="right-panel">
        <!-- 最新告警 -->
        <div class="panel-item">
          <div class="panel-header">
            <span class="panel-title">最新告警信息</span>
          </div>
          <div class="panel-body">
            <div class="alert-list">
              <div v-for="alert in alertList.slice(0, 5)" :key="alert.id" class="alert-item">
                <div class="alert-header">
                  <span :class="['alert-level', getAlertLevelClass(alert.alertLevel)]">
                    {{ getAlertLevelText(alert.alertLevel) }}
                  </span>
                  <span class="alert-time">{{ alert.alertTime?.substring(11, 19) || '--:--:--' }}</span>
                </div>
                <div class="alert-content">{{ alert.alertMessage || '暂无告警信息' }}</div>
                <div class="alert-source">来源: {{ alert.greenhouseName || '未知温室' }}</div>
              </div>
              <div v-if="alertList.length === 0" class="no-data">暂无告警信息</div>
            </div>
          </div>
        </div>
        
        <!-- 告警趋势 -->
        <div class="panel-item">
          <div class="panel-header">
            <span class="panel-title">本周告警趋势</span>
          </div>
          <div class="panel-body">
            <div id="alert-trend-chart" class="chart-container"></div>
          </div>
        </div>
        
        <!-- 病虫害检测统计 -->
        <div class="panel-item">
          <div class="panel-header">
            <span class="panel-title">病虫害类型分布</span>
          </div>
          <div class="panel-body">
            <div id="disease-type-chart" class="chart-container"></div>
          </div>
        </div>
        
        <!-- 最近检测记录 -->
        <div class="panel-item">
          <div class="panel-header">
            <span class="panel-title">最近检测记录</span>
          </div>
          <div class="panel-body">
            <div class="record-list">
              <div v-for="record in imgRecordList.slice(0, 5)" :key="record.id" class="record-item">
                <div class="record-info">
                  <span class="record-disease">{{ record.kind || '未知病害' }}</span>
                  <span class="record-confidence">置信度: {{ ((parseFloat(record.confidence) || parseFloat(record.conf) || 0) * 100).toFixed(1) }}%</span>
                </div>
                <div class="record-time">{{ record.startTime?.substring(11, 19) || '--:--:--' }}</div>
              </div>
              <div v-if="imgRecordList.length === 0" class="no-data">暂无检测记录</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-screen {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a1628 0%, #0d2137 50%, #0a1628 100%);
  color: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶部标题 */
.header {
  height: 80px;
  background: linear-gradient(180deg, rgba(0, 50, 100, 0.8) 0%, rgba(0, 30, 60, 0.4) 100%);
  border-bottom: 2px solid #00d4ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  font-size: 36px;
}

.title {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(90deg, #00d4ff, #00ff88);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 4px;
}

.header-center {
  text-align: center;
}

.time {
  font-size: 20px;
  color: #88ccff;
  letter-spacing: 2px;
}

.header-right {
  display: flex;
  gap: 30px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stats-value {
  font-size: 32px;
  font-weight: bold;
  color: #00d4ff;
}

.stats-value.online {
  color: #00ff88;
}

.stats-value.warning {
  color: #ffaa00;
}

.stats-label {
  font-size: 12px;
  color: #88aacc;
}

/* 主体内容 */
.main-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 左侧面板 */
.left-panel, .right-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow-y: auto;
}

.center-panel {
  width: calc(100% - 680px);
  min-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 面板项 */
.panel-item {
  background: linear-gradient(180deg, rgba(0, 40, 80, 0.6) 0%, rgba(0, 20, 40, 0.4) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
}

.panel-header {
  height: 36px;
  background: linear-gradient(90deg, rgba(0, 100, 150, 0.4) 0%, rgba(0, 50, 100, 0.2) 100%);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.panel-title {
  font-size: 14px;
  font-weight: bold;
  color: #00d4ff;
  position: relative;
  padding-left: 12px;
}

.panel-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 14px;
  background: #00d4ff;
  border-radius: 2px;
}

.panel-body {
  padding: 15px;
}

.chart-container {
  width: 100%;
  height: 180px;
}

/* 设备列表 */
.device-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 50, 100, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.device-name {
  font-size: 13px;
  color: #aaccdd;
}

.device-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.device-status.on {
  background: rgba(0, 255, 136, 0.2);
  color: #00ff88;
}

.device-status.off {
  background: rgba(255, 68, 68, 0.2);
  color: #ff6b6b;
}

/* 面板副标题 */
.panel-subtitle {
  font-size: 12px;
  color: #88aacc;
  margin-left: 10px;
  padding: 2px 8px;
  background: rgba(0, 100, 150, 0.3);
  border-radius: 4px;
}

/* 暂无数据提示 */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  text-align: center;
}

.no-data-text {
  font-size: 14px;
  color: #88aacc;
  margin-bottom: 8px;
}

.no-data-hint {
  font-size: 12px;
  color: #557799;
}

/* 地图容器 */
.map-container {
  flex: 1;
  width: 100%;
  min-height: 400px;
  background: linear-gradient(180deg, rgba(0, 30, 60, 0.6) 0%, rgba(0, 20, 40, 0.4) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

/* 确保地图canvas不会超出容器 */
.map-container :deep(.amap-container) {
  width: 100% !important;
  height: 100% !important;
}

.map-container :deep(.amap-canvas) {
  width: 100% !important;
  height: 100% !important;
}

.map-title {
  position: absolute;
  top: 15px;
  left: 20px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 15px;
}

.map-title span:first-child {
  font-size: 18px;
  font-weight: bold;
  color: #00d4ff;
}

.map-level {
  font-size: 14px;
  color: #88aacc;
  padding: 4px 12px;
  background: rgba(0, 50, 100, 0.6);
  border-radius: 4px;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.back-btn {
  background: linear-gradient(90deg, #0066aa, #004488);
  border: 1px solid #00aaff;
}

.map-legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  gap: 20px;
  padding: 10px 15px;
  background: rgba(0, 20, 40, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #aaccdd;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.normal {
  background: #00ff88;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.legend-dot.warning {
  background: #ffaa00;
  box-shadow: 0 0 10px rgba(255, 170, 0, 0.5);
}

.legend-dot.offline {
  background: #ff4444;
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}

/* 滚动面板 */
.scroll-panel {
  height: 120px;
  background: linear-gradient(180deg, rgba(0, 40, 80, 0.6) 0%, rgba(0, 20, 40, 0.4) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.scroll-header {
  height: 32px;
  background: linear-gradient(90deg, rgba(0, 100, 150, 0.4) 0%, rgba(0, 50, 100, 0.2) 100%);
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.scroll-title {
  font-size: 14px;
  font-weight: bold;
  color: #00d4ff;
}

.scroll-content {
  height: calc(100% - 32px);
  overflow: hidden;
  padding: 10px;
}

.scroll-wrapper {
  display: flex;
  gap: 15px;
  animation: scroll-left 30s linear infinite;
}

@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.scroll-item {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 15px;
  background: rgba(0, 50, 100, 0.4);
  border-radius: 6px;
  border-left: 3px solid;
}

.scroll-item.alert {
  border-left-color: #ff6b6b;
}

.scroll-item.disease {
  border-left-color: #ffd93d;
}

.scroll-item.device {
  border-left-color: #4ecdc4;
}

.scroll-time {
  font-size: 12px;
  color: #88aacc;
}

.scroll-text {
  font-size: 13px;
  color: #fff;
  white-space: nowrap;
}

/* 告警列表 */
.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.alert-item {
  padding: 10px;
  background: rgba(0, 50, 100, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.alert-level {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 3px;
}

.alert-level.level-critical {
  background: rgba(255, 68, 68, 0.3);
  color: #ff4444;
}

.alert-level.level-error {
  background: rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
}

.alert-level.level-warning {
  background: rgba(255, 170, 0, 0.3);
  color: #ffaa00;
}

.alert-level.level-info {
  background: rgba(0, 212, 255, 0.3);
  color: #00d4ff;
}

.alert-time {
  font-size: 11px;
  color: #88aacc;
}

.alert-content {
  font-size: 13px;
  color: #fff;
  margin-bottom: 4px;
}

.alert-source {
  font-size: 11px;
  color: #88aacc;
}

/* 检测记录 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: rgba(0, 50, 100, 0.3);
  border-radius: 6px;
  border: 1px solid rgba(0, 212, 255, 0.1);
}

.record-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-disease {
  font-size: 13px;
  color: #fff;
}

.record-confidence {
  font-size: 11px;
  color: #88aacc;
}

.record-time {
  font-size: 11px;
  color: #88aacc;
}

.no-data {
  text-align: center;
  color: #88aacc;
  padding: 20px;
  font-size: 13px;
}
</style>
