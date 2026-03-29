<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { User, SwitchButton } from '@element-plus/icons-vue';
import { useLoginApi } from '/@/api/login';
import { Session } from '/@/utils/storage';

const route = useRoute();
const router = useRouter();
const loginApi = useLoginApi();
const weatherData = ref({ temperature: '25', condition: '晴天', humidity: '65%' });

// 用户信息
const userInfo = ref<any>(null);

// 从 localStorage 加载用户信息
const loadUserInfo = () => {
  try {
    const storedUserInfo = localStorage.getItem('userInfo');
    console.log('App.vue - 从localStorage读取的用户信息:', storedUserInfo);
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo);
      console.log('App.vue - 解析后的userInfo:', userInfo.value);
    }
  } catch (err) {
    console.error('加载用户信息失败:', err);
  }
};

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

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    // 清除本地存储
    Session.clear();
    localStorage.removeItem('userInfo');
    userInfo.value = null;
    
    ElMessage.success('退出登录成功！');
    
    // 跳转到登录页
    setTimeout(() => {
      router.push('/login');
    }, 500);
  } catch (error) {
    console.log('取消退出登录');
  }
};

onMounted(() => {
  currentPath.value = route.path;
  fetchWeatherData(); // 获取天气数据
  loadUserInfo(); // 加载用户信息
});

// 导航菜单数据
const navMenu = [
  { path: '/', name: '首页' },
  { path: '/dataView', name: '数据大屏' },
  {
    path: '/infoGreenhouse',
    name: '智能温室',
    children: [
      { path: '/infoGreenhouse', name: '温室管理' },
      { path: '/infoGreenhouse/overview', name: '总览大屏' },
      { path: '/detailsEnv', name: '环境监测' },
      { path: '/infoGreenhouse/device', name: '设备控制' },
      { path: '/infoGreenhouse/analysis', name: '数据分析' },
      { path: '/infoGreenhouse/alert', name: '告警管理' },
      { path: '/infoGreenhouse/help', name: '帮助文档' }
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
  {
    path: '/supplyManage',
    name: '供应管理',
    requireAdminOrSupplier: true,
    children: [
      { path: '/supplyManage/product', name: '商品管理' },
      { path: '/supplyManage/order', name: '订单管理' },
      { path: '/supplyManage/category', name: '分类管理', requireAdmin: true }
    ]
  },
  { path: '/storageManage', name: '库存管理' },
  {
    path: '/knowledgeChat',
    name: '知识库问答'
  },
  {
    path: '/documentManage',
    name: '文档管理',
    requireAdmin: true
  },
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

// 判断是否是管理员
const isAdmin = computed(() => {
  if (!userInfo.value) return false;
  const result = userInfo.value.role === 'admin' || userInfo.value.role === 1 || userInfo.value.isAdmin === true;
  console.log('App.vue - isAdmin:', result, 'userInfo:', userInfo.value);
  return result;
});

// 判断是否是供应商
const isSupplier = computed(() => {
  if (!userInfo.value) return false;
  const result = userInfo.value.role === 'supplier' || userInfo.value.role === 2 || userInfo.value.isSupplier === true;
  console.log('App.vue - isSupplier:', result, 'userInfo:', userInfo.value);
  return result;
});

// 判断是否是管理员或供应商
const isAdminOrSupplier = computed(() => {
  const result = isAdmin.value || isSupplier.value;
  console.log('App.vue - isAdminOrSupplier:', result);
  return result;
});

// 供应商可见的菜单路径
const supplierAllowedPaths = ['/supplyManage', '/personal', '/purchaseManage'];

// 过滤后的导航菜单（根据权限显示）
const filteredNavMenu = computed(() => {
  return navMenu.filter((item: any) => {
    // 管理员可以看到所有页面
    if (isAdmin.value) {
      return true;
    }
    
    // 供应商只能看到特定页面
    if (isSupplier.value) {
      return supplierAllowedPaths.includes(item.path);
    }
    
    // 需要管理员权限
    if (item.requireAdmin) {
      return false; // 不是管理员，不显示
    }
    // 需要管理员或供应商权限
    if (item.requireAdminOrSupplier) {
      return false; // 不是管理员也不是供应商，不显示
    }
    return true;
  });
});

// 获取当前页面对应的二级菜单（过滤掉无权限的菜单）
const currentSubMenu = computed(() => {
  // 查找当前路径对应的菜单项
  for (const item of navMenu) {
    if (item.children) {
      // 检查当前路径是否是子菜单中的某个页面
      const hasActiveChild = item.children.some((child: any) => child.path === currentPath.value);
      if (hasActiveChild || item.path === currentPath.value) {
        // 过滤需要管理员权限的菜单
        return item.children.filter((child: any) => {
          if (child.requireAdmin) {
            return isAdmin.value;
          }
          return true;
        });
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

// 判断是否是登录页面
const isLoginPage = computed(() => {
  return route.path === '/login';
});

// 判断是否是数据大屏页面或首页
const isDataViewPage = computed(() => {
  return route.path === '/dataView' || route.path === '/';
});

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
    <!-- 登录页面 - 只显示登录内容 -->
    <router-view v-if="isLoginPage" />
    
    <!-- 主应用布局 -->
    <template v-else>
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
              v-for="item in filteredNavMenu"
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
          
          <!-- 用户头像和下拉菜单 -->
          <el-dropdown class="user-dropdown" @command="(command: string) => { if (command === 'logout') handleLogout(); else if (command === 'profile') router.push('/personal'); }">
            <div class="user-avatar-wrapper">
              <div class="user-avatar">
                <el-icon :size="20">
                  <User />
                </el-icon>
              </div>
              <span class="user-name">{{ userInfo?.username || userInfo?.name || '用户' }}</span>
              <el-icon class="dropdown-icon">
                <SwitchButton />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon class="dropdown-item-icon"><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon class="dropdown-item-icon"><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>
      
      <!-- 主内容区域 -->
      <div class="main-container">
        <!-- 左侧二级菜单（数据大屏页面不显示） -->
        <aside v-if="!isDataViewPage" class="side-nav">
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
        <main :class="['app-main', isDataViewPage ? 'full-width' : '']">
          <router-view />
        </main>
      </div>
      
      <!-- 页脚（数据大屏页面不显示） -->
      <footer v-if="!isDataViewPage" class="app-footer">
        <p>&copy; 2026 农业中国 - 智慧农业解决方案</p>
      </footer>
    </template>
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

/* 用户下拉菜单 */
.user-dropdown {
  cursor: pointer;
}

.user-avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.user-avatar-wrapper:hover {
  background-color: #f7fafc;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #3182ce;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
}

.dropdown-icon {
  font-size: 12px;
  color: #718096;
  transition: transform 0.2s ease;
}

.user-dropdown:hover .dropdown-icon {
  transform: rotate(180deg);
}

.dropdown-item-icon {
  margin-right: 8px;
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

/* 数据大屏页面的主内容区域 */
.app-main.full-width {
  width: 100%;
  padding: 0;
  margin: 0;
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
