<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const weatherData = ref({ temperature: '25', condition: '晴天', humidity: '65%' });

// 获取天气数据
const fetchWeatherData = async () => {
  try {
    // 固定使用广州的天气
    const city = '广州'
    const url = `https://uapis.cn/api/v1/misc/weather?city=${encodeURIComponent(city)}`
    
    const response = await fetch(url)
    const data = await response.json()
    
    // 解析UAPI返回的数据结构
    const weatherDataApi = data
    const temperature = weatherDataApi.temperature
    const weatherDesc = weatherDataApi.weather
    
    weatherData.value = {
      temperature: temperature,
      condition: weatherDesc,
      humidity: weatherDataApi.humidity + '%'
    }
  } catch (err) {
    console.error('获取天气数据失败:', err)
    // 模拟数据
    weatherData.value = {
      temperature: '25',
      condition: '晴天',
      humidity: '65%'
    }
  }
}

onMounted(() => {
  currentPath.value = route.path;
  fetchWeatherData(); // 获取天气数据
});

// 导航菜单数据
const navMenu = [
  { path: '/', name: '首页' },
  {
    path: '/dataView', 
    name: '数据大屏',
    children: [
      { path: '/dataView', name: '总览大屏' },
      { path: '/dataView/growth', name: '农作物生长监测' },
      { path: '/dataView/env', name: '环境数据监测' },
      { path: '/dataView/disease', name: '病虫害统计' },
      { path: '/dataView/yield', name: '产量预测' }
    ]
  },
  {
    path: '/infoGreenhouse', 
    name: '智能温室',
    children: [
      { path: '/infoGreenhouse', name: '温室管理' },
      { path: '/infoGreenhouse/env', name: '环境监测' },
      { path: '/infoGreenhouse/crop', name: '作物管理' },
      { path: '/infoGreenhouse/device', name: '设备控制' },
      { path: '/infoGreenhouse/analysis', name: '数据分析' },
      { path: '/infoGreenhouse/alert', name: '告警管理' },
      { path: '/infoGreenhouse/setting', name: '系统设置' },
      { path: '/infoGreenhouse/help', name: '帮助文档' }
    ]
  },
  {
    path: '/detailsEnv', 
    name: '环境检测',
    children: [
      { path: '/detailsEnv', name: '环境概览' },
      { path: '/detailsEnv/realtime', name: '实时数据' },
      { path: '/detailsEnv/history', name: '历史记录' },
      { path: '/detailsEnv/device', name: '设备管理' },
      { path: '/detailsEnv/alert', name: '告警设置' },
      { path: '/detailsEnv/analysis', name: '数据分析' },
      { path: '/detailsEnv/report', name: '报表导出' },
      { path: '/detailsEnv/setting', name: '系统设置' }
    ]
  },
  { 
    path: '/infoDisease', 
    name: '病虫害检测',
    children: [
      { path: '/infoDisease', name: '病虫害数据库' },
      { path: '/imgPredict', name: '图像预测' },
      { path: '/videoPredict', name: '视频预测' },
      { path: '/cameraPredict', name: '摄像头预测' },
      { path: '/imgRecord', name: '图像预测记录' },
      { path: '/videoRecord', name: '视频预测记录' },
      { path: '/cameraRecord', name: '摄像头预测记录' }
    ]
  },
  { path: '/purchaseManage', name: '农资采购' },
  { path: '/storageManage', name: '库存管理' },
  { path: '/smartChat', name: '智能助手' },
  { path: '/userManage', name: '用户管理' },
  { path: '/personal', name: '个人中心' }
];

// 展开状态
const expandedMenu = ref('');

// 切换菜单展开/收起
const toggleMenu = (path: string) => {
  if (expandedMenu.value === path) {
    expandedMenu.value = '';
  } else {
    expandedMenu.value = path;
  }
};

// 检查是否是子菜单的激活状态
const isChildActive = (children: any[]) => {
  return children.some(child => currentPath.value === child.path);
};

// 获取当前页面对应的二级菜单
const currentSubMenu = computed(() => {
  // 查找当前路径对应的菜单项
  for (const item of navMenu) {
    if (item.children) {
      // 检查当前路径是否是子菜单中的某个页面
      if (item.children.some((child: any) => child.path === currentPath.value)) {
        return item.children;
      }
      // 检查当前路径是否是父菜单本身
      if (item.path === currentPath.value && item.children) {
        return item.children;
      }
    }
  }
  // 默认返回空数组
  return [];
});

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path);
};

// 获取当前路由路径
const currentPath = ref('/');

// 监听路由变化
onMounted(() => {
  currentPath.value = route.path;
});

// 监听路由变化，更新当前路径
watch(
  () => route.path,
  (newPath) => {
    currentPath.value = newPath;
  }
);

// 根据天气状况计算对应的图标
const getWeatherIcon = computed(() => {
  const condition = weatherData.value.condition;
  if (condition.includes('晴')) {
    return '☀️';
  } else if (condition.includes('云') || condition.includes('阴')) {
    return '☁️';
  } else if (condition.includes('雨')) {
    return '🌧️';
  } else if (condition.includes('雷')) {
    return '⛈️';
  } else if (condition.includes('雪')) {
    return '❄️';
  } else if (condition.includes('雾') || condition.includes('霾')) {
    return '🌫️';
  } else if (condition.includes('风')) {
    return '💨';
  } else {
    return '☀️'; // 默认图标
  }
});
</script>

<template>
  <div class="app">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <!-- Logo -->
      <div class="logo">
        <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=agricultural%20logo%20with%20green%20color%20scheme&image_size=square" alt="农业中国" class="logo-img">
        <span class="logo-text">农业中国</span>
      </div>
      
      <!-- 主导航菜单 -->
      <nav class="main-nav">
        <ul class="nav-list">
          <li 
            v-for="item in navMenu" 
            :key="item.path"
            :class="['nav-item', (currentPath === item.path || (item.children && isChildActive(item.children))) ? 'active' : '']"
            @click="navigateTo(item.path)"
          >
            {{ item.name }}
          </li>
        </ul>
      </nav>
      
      <!-- 右侧功能区 -->
      <div class="header-right">
        <!-- 搜索栏 -->
        <div class="search-box">
          <input type="text" placeholder="搜索" class="search-input">
          <button class="search-btn">搜索</button>
        </div>
        
        <!-- 天气信息 -->
        <div class="weather-info">
          <span class="weather-icon">{{ getWeatherIcon }}</span>
          <span class="weather-text">{{ weatherData.temperature }}°C {{ weatherData.condition }}</span>
        </div>
      </div>
    </header>
    
    <!-- 主内容区域 -->
    <div class="main-container">
      <!-- 左侧二级菜单 -->
      <aside class="side-nav">
        <ul class="side-nav-list">
          <li 
            v-for="child in currentSubMenu" 
            :key="child.path"
            :class="['side-nav-item', currentPath === child.path ? 'active' : '']"
            @click="navigateTo(child.path)"
          >
            {{ child.name }}
          </li>
        </ul>
      </aside>
      
      <!-- 路由视图 -->
      <main class="app-main">
        <router-view />
      </main>
    </div>
    
    <!-- 页脚 -->
    <footer class="app-footer">
      <p>&copy; 2026 农业中国 - 智慧农业解决方案</p>
    </footer>
  </div>
</template>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.app-header {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Logo样式 */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

/* 主导航菜单 */
.main-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 24px;
  position: relative;
}

.nav-item {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
}

.nav-item:hover {
  background-color: #f7fafc;
  color: #2b6cb0;
}

.nav-item.active {
  background-color: #ebf8ff;
  color: #2b6cb0;
  font-weight: 600;
}

/* 右侧功能区 */
.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* 搜索栏 */
.search-box {
  position: relative;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.2);
}

.search-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  padding: 0 12px;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-btn:hover {
  background-color: #2c5282;
}

/* 天气信息 */
.weather-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5568;
}

.weather-icon {
  font-size: 18px;
}

/* 主内容容器 */
.main-container {
  flex: 1;
  display: flex;
  min-height: calc(100vh - 120px);
}

/* 左侧二级菜单 */
.side-nav {
  width: 200px;
  background-color: #f8f9fa;
  border-right: 1px solid #e2e8f0;
  padding: 20px 0;
  overflow-y: auto;
}

.side-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.side-nav-item {
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #4a5568;
  border-left: 3px solid transparent;
}

.side-nav-item:hover {
  background-color: #edf2f7;
  color: #2b6cb0;
  border-left-color: #2b6cb0;
}

.side-nav-item.active {
  background-color: #ebf8ff;
  color: #2b6cb0;
  font-weight: 600;
  border-left-color: #2b6cb0;
}

/* 主内容区域 */
.app-main {
  flex: 1;
  padding: 24px;
  background-color: #ffffff;
  overflow-y: auto;
}

/* 页脚 */
.app-footer {
  background-color: #f7fafc;
  padding: 16px 24px;
  text-align: center;
  border-top: 1px solid #edf2f7;
  font-size: 14px;
  color: #718096;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .nav-list {
    gap: 16px;
  }
  
  .nav-item {
    font-size: 13px;
    padding: 6px 12px;
  }
  
  .search-input {
    width: 150px;
  }
  
  .side-nav {
    width: 180px;
  }
  
  .side-nav-item {
    font-size: 13px;
    padding: 8px 16px;
  }
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    height: auto;
    padding: 16px;
    gap: 16px;
  }
  
  .main-nav {
    width: 100%;
  }
  
  .nav-list {
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .nav-item {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .main-container {
    flex-direction: column;
  }
  
  .side-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    padding: 10px 0;
  }
  
  .side-nav-list {
    display: flex;
    flex-wrap: wrap;
    padding: 0 10px;
  }
  
  .side-nav-item {
    font-size: 12px;
    padding: 6px 12px;
    margin: 0 5px 5px 0;
    border-left: none;
    border-radius: 4px;
  }
  
  .side-nav-item:hover,
  .side-nav-item.active {
    border-left: none;
  }
  
  .app-main {
    padding: 16px;
  }
}
</style>
