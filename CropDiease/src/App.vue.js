import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { User, SwitchButton } from '@element-plus/icons-vue';
import { useLoginApi } from '/@/api/login';
const route = useRoute();
const router = useRouter();
const loginApi = useLoginApi();
const weatherData = ref({ temperature: '25', condition: '晴天', humidity: '65%' });
// 用户信息
const userInfo = ref(null);
// 从 localStorage 加载用户信息
const loadUserInfo = () => {
    try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
            userInfo.value = JSON.parse(storedUserInfo);
        }
    }
    catch (err) {
        console.error('加载用户信息失败:', err);
    }
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
        const weatherDataApi = data;
        const temperature = weatherDataApi.temperature;
        const weatherDesc = weatherDataApi.weather;
        weatherData.value = {
            temperature: temperature,
            condition: weatherDesc,
            humidity: weatherDataApi.humidity + '%'
        };
    }
    catch (err) {
        console.error('获取天气数据失败:', err);
        // 模拟数据
        weatherData.value = {
            temperature: '25',
            condition: '晴天',
            humidity: '65%'
        };
    }
};
// 退出登录
const handleLogout = async () => {
    try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });
        // 清除本地存储
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        userInfo.value = null;
        ElMessage.success('退出登录成功！');
        // 跳转到登录页
        setTimeout(() => {
            router.push('/login');
        }, 500);
    }
    catch (error) {
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
            { path: '/infoGreenhouse/overview', name: '总览大屏' },
            { path: '/infoGreenhouse', name: '温室管理' },
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
    {
        path: '/purchaseManage',
        name: '农资采购',
        children: [
            { path: '/purchaseManage', name: '农资采购' },
            { path: '/purchaseManage/supply', name: '供应管理' }
        ]
    },
    { path: '/storageManage', name: '库存管理' },
    { path: '/smartChat', name: '智能助手' },
    { path: '/userManage', name: '用户管理' },
    { path: '/personal', name: '个人中心' }
];
// 展开状态
const expandedMenu = ref('');
// 切换菜单展开/收起
const toggleMenu = (path) => {
    if (expandedMenu.value === path) {
        expandedMenu.value = '';
    }
    else {
        expandedMenu.value = path;
    }
};
// 检查是否是子菜单的激活状态
const isChildActive = (children) => {
    return children.some(child => currentPath.value === child.path);
};
// 获取当前页面对应的二级菜单
const currentSubMenu = computed(() => {
    // 查找当前路径对应的菜单项
    for (const item of navMenu) {
        if (item.children) {
            // 检查当前路径是否是子菜单中的某个页面
            if (item.children.some((child) => child.path === currentPath.value)) {
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
const navigateTo = (path) => {
    router.push(path);
};
// 获取当前路由路径
const currentPath = ref('/');
// 监听路由变化
onMounted(() => {
    currentPath.value = route.path;
});
// 监听路由变化，更新当前路径
watch(() => route.path, (newPath) => {
    currentPath.value = newPath;
});
// 判断是否是登录页面
const isLoginPage = computed(() => {
    return route.path === '/login';
});
// 根据天气状况计算对应的图标
const getWeatherIcon = computed(() => {
    const condition = weatherData.value.condition;
    if (condition.includes('晴')) {
        return '☀️';
    }
    else if (condition.includes('云') || condition.includes('阴')) {
        return '☁️';
    }
    else if (condition.includes('雨')) {
        return '🌧️';
    }
    else if (condition.includes('雷')) {
        return '⛈️';
    }
    else if (condition.includes('雪')) {
        return '❄️';
    }
    else if (condition.includes('雾') || condition.includes('霾')) {
        return '🌫️';
    }
    else if (condition.includes('风')) {
        return '💨';
    }
    else {
        return '☀️'; // 默认图标
    }
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "app" },
});
/** @type {__VLS_StyleScopedClasses['app']} */ ;
if (__VLS_ctx.isLoginPage) {
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.routerView | typeof __VLS_components.RouterView} */
    routerView;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
    const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({
        ...{ class: "app-header" },
    });
    /** @type {__VLS_StyleScopedClasses['app-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "logo" },
    });
    /** @type {__VLS_StyleScopedClasses['logo']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img, __VLS_intrinsics.img)({
        src: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=agricultural%20logo%20with%20green%20color%20scheme&image_size=square",
        alt: "农业中国",
        ...{ class: "logo-img" },
    });
    /** @type {__VLS_StyleScopedClasses['logo-img']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "logo-text" },
    });
    /** @type {__VLS_StyleScopedClasses['logo-text']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        ...{ class: "main-nav" },
    });
    /** @type {__VLS_StyleScopedClasses['main-nav']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "nav-list" },
    });
    /** @type {__VLS_StyleScopedClasses['nav-list']} */ ;
    for (const [item] of __VLS_vFor((__VLS_ctx.navMenu))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoginPage))
                        return;
                    __VLS_ctx.navigateTo(item.path);
                    // @ts-ignore
                    [isLoginPage, navMenu, navigateTo,];
                } },
            key: (item.path),
            ...{ class: (['nav-item', (__VLS_ctx.currentPath === item.path || (item.children && __VLS_ctx.isChildActive(item.children))) ? 'active' : '']) },
        });
        /** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
        (item.name);
        // @ts-ignore
        [currentPath, isChildActive,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "header-right" },
    });
    /** @type {__VLS_StyleScopedClasses['header-right']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "search-box" },
    });
    /** @type {__VLS_StyleScopedClasses['search-box']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.input, __VLS_intrinsics.input)({
        type: "text",
        placeholder: "搜索",
        ...{ class: "search-input" },
    });
    /** @type {__VLS_StyleScopedClasses['search-input']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
        ...{ class: "search-btn" },
    });
    /** @type {__VLS_StyleScopedClasses['search-btn']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "weather-info" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-info']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "weather-icon" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-icon']} */ ;
    (__VLS_ctx.getWeatherIcon);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "weather-text" },
    });
    /** @type {__VLS_StyleScopedClasses['weather-text']} */ ;
    (__VLS_ctx.weatherData.temperature);
    (__VLS_ctx.weatherData.condition);
    let __VLS_5;
    /** @ts-ignore @type {typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown | typeof __VLS_components.elDropdown | typeof __VLS_components.ElDropdown} */
    elDropdown;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        ...{ 'onCommand': {} },
        ...{ class: "user-dropdown" },
    }));
    const __VLS_7 = __VLS_6({
        ...{ 'onCommand': {} },
        ...{ class: "user-dropdown" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    let __VLS_10;
    const __VLS_11 = ({ command: {} },
        { onCommand: ((command) => { if (command === 'logout')
                __VLS_ctx.handleLogout();
            else if (command === 'profile')
                __VLS_ctx.router.push('/personal'); }) });
    /** @type {__VLS_StyleScopedClasses['user-dropdown']} */ ;
    const { default: __VLS_12 } = __VLS_8.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-avatar-wrapper" },
    });
    /** @type {__VLS_StyleScopedClasses['user-avatar-wrapper']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "user-avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['user-avatar']} */ ;
    let __VLS_13;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
        size: (20),
    }));
    const __VLS_15 = __VLS_14({
        size: (20),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    const { default: __VLS_18 } = __VLS_16.slots;
    let __VLS_19;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
    const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
    // @ts-ignore
    [getWeatherIcon, weatherData, weatherData, handleLogout, router,];
    var __VLS_16;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "user-name" },
    });
    /** @type {__VLS_StyleScopedClasses['user-name']} */ ;
    (__VLS_ctx.userInfo?.username || __VLS_ctx.userInfo?.name || '用户');
    let __VLS_24;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
        ...{ class: "dropdown-icon" },
    }));
    const __VLS_26 = __VLS_25({
        ...{ class: "dropdown-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    /** @type {__VLS_StyleScopedClasses['dropdown-icon']} */ ;
    const { default: __VLS_29 } = __VLS_27.slots;
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.SwitchButton} */
    SwitchButton;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
    const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
    // @ts-ignore
    [userInfo, userInfo,];
    var __VLS_27;
    {
        const { dropdown: __VLS_35 } = __VLS_8.slots;
        let __VLS_36;
        /** @ts-ignore @type {typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu | typeof __VLS_components.elDropdownMenu | typeof __VLS_components.ElDropdownMenu} */
        elDropdownMenu;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent1(__VLS_36, new __VLS_36({}));
        const __VLS_38 = __VLS_37({}, ...__VLS_functionalComponentArgsRest(__VLS_37));
        const { default: __VLS_41 } = __VLS_39.slots;
        let __VLS_42;
        /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
        elDropdownItem;
        // @ts-ignore
        const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
            command: "profile",
        }));
        const __VLS_44 = __VLS_43({
            command: "profile",
        }, ...__VLS_functionalComponentArgsRest(__VLS_43));
        const { default: __VLS_47 } = __VLS_45.slots;
        let __VLS_48;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
            ...{ class: "dropdown-item-icon" },
        }));
        const __VLS_50 = __VLS_49({
            ...{ class: "dropdown-item-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        /** @type {__VLS_StyleScopedClasses['dropdown-item-icon']} */ ;
        const { default: __VLS_53 } = __VLS_51.slots;
        let __VLS_54;
        /** @ts-ignore @type {typeof __VLS_components.User} */
        User;
        // @ts-ignore
        const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({}));
        const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
        // @ts-ignore
        [];
        var __VLS_51;
        // @ts-ignore
        [];
        var __VLS_45;
        let __VLS_59;
        /** @ts-ignore @type {typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem | typeof __VLS_components.elDropdownItem | typeof __VLS_components.ElDropdownItem} */
        elDropdownItem;
        // @ts-ignore
        const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
            divided: true,
            command: "logout",
        }));
        const __VLS_61 = __VLS_60({
            divided: true,
            command: "logout",
        }, ...__VLS_functionalComponentArgsRest(__VLS_60));
        const { default: __VLS_64 } = __VLS_62.slots;
        let __VLS_65;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
            ...{ class: "dropdown-item-icon" },
        }));
        const __VLS_67 = __VLS_66({
            ...{ class: "dropdown-item-icon" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_66));
        /** @type {__VLS_StyleScopedClasses['dropdown-item-icon']} */ ;
        const { default: __VLS_70 } = __VLS_68.slots;
        let __VLS_71;
        /** @ts-ignore @type {typeof __VLS_components.SwitchButton} */
        SwitchButton;
        // @ts-ignore
        const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({}));
        const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
        // @ts-ignore
        [];
        var __VLS_68;
        // @ts-ignore
        [];
        var __VLS_62;
        // @ts-ignore
        [];
        var __VLS_39;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_8;
    var __VLS_9;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "main-container" },
    });
    /** @type {__VLS_StyleScopedClasses['main-container']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.aside, __VLS_intrinsics.aside)({
        ...{ class: "side-nav" },
    });
    /** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
        ...{ class: "side-nav-list" },
    });
    /** @type {__VLS_StyleScopedClasses['side-nav-list']} */ ;
    for (const [child] of __VLS_vFor((__VLS_ctx.currentSubMenu))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isLoginPage))
                        return;
                    __VLS_ctx.navigateTo(child.path);
                    // @ts-ignore
                    [navigateTo, currentSubMenu,];
                } },
            key: (child.path),
            ...{ class: (['side-nav-item', __VLS_ctx.currentPath === child.path ? 'active' : '']) },
        });
        /** @type {__VLS_StyleScopedClasses['side-nav-item']} */ ;
        (child.name);
        // @ts-ignore
        [currentPath,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
        ...{ class: "app-main" },
    });
    /** @type {__VLS_StyleScopedClasses['app-main']} */ ;
    let __VLS_76;
    /** @ts-ignore @type {typeof __VLS_components.routerView | typeof __VLS_components.RouterView} */
    routerView;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({}));
    const __VLS_78 = __VLS_77({}, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
        ...{ class: "app-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['app-footer']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
