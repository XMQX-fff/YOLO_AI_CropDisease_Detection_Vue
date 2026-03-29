import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/login/index.vue';
import HomePage from '../views/homePage/index.vue';
import DataView from '../views/dataView/index.vue';
import InfoGreenhouse from '../views/infoGreenhouse/index.vue';
import DetailsEnv from '../views/detailsEnv/index.vue';
import InfoDisease from '../views/infoDisease/index.vue';
import ImgPredict from '../views/imgPredict/index.vue';
import VideoPredict from '../views/videoPredict/index.vue';
import CameraPredict from '../views/cameraPredict/index.vue';
import ImgRecord from '../views/imgRecord/index.vue';
import VideoRecord from '../views/videoRecord/index.vue';
import CameraRecord from '../views/cameraRecord/index.vue';
import PurchaseManage from '../views/purchaseManage/index.vue';
import Cart from '../views/purchaseManage/cart.vue';
import SupplyManage from '../views/supplyManage/index.vue';
import ProductManage from '../views/supplyManage/productManage.vue';
import OrderManage from '../views/supplyManage/orderManage.vue';
import CategoryManage from '../views/supplyManage/categoryManage.vue';
import StorageManage from '../views/storageManage/index.vue';

import UserManage from '../views/userManage/index.vue';
import Personal from '../views/personal/index.vue';
import InfoGreenhouseDevice from '../views/infoGreenhouse/device.vue';
import InfoGreenhouseAnalysis from '../views/infoGreenhouse/analysis.vue';
import InfoGreenhouseAlert from '../views/infoGreenhouse/alert.vue';
import InfoGreenhouseHelp from '../views/infoGreenhouse/help.vue';
import InfoGreenhouseOverview from '../views/infoGreenhouse/overview.vue';
import KnowledgeChat from '../views/rag/knowledgeChat.vue';
import DocumentManage from '../views/rag/documentManage.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage,
        meta: {
            title: '首页'
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            title: '登录'
        }
    },
    {
        path: '/dataView',
        name: 'DataView',
        component: DataView,
        meta: {
            title: '数据大屏'
        }
    },
    {
        path: '/infoGreenhouse',
        name: 'InfoGreenhouse',
        component: InfoGreenhouse,
        meta: {
            title: '智能温室'
        }
    },
    {
        path: '/infoGreenhouse/overview',
        name: 'InfoGreenhouseOverview',
        component: InfoGreenhouseOverview,
        meta: {
            title: '总览大屏'
        }
    },
    {
        path: '/infoGreenhouse/device',
        name: 'InfoGreenhouseDevice',
        component: InfoGreenhouseDevice,
        meta: {
            title: '设备控制'
        }
    },
    {
        path: '/infoGreenhouse/analysis',
        name: 'InfoGreenhouseAnalysis',
        component: InfoGreenhouseAnalysis,
        meta: {
            title: '数据分析'
        }
    },
    {
        path: '/infoGreenhouse/alert',
        name: 'InfoGreenhouseAlert',
        component: InfoGreenhouseAlert,
        meta: {
            title: '告警管理'
        }
    },
    {
        path: '/infoGreenhouse/help',
        name: 'InfoGreenhouseHelp',
        component: InfoGreenhouseHelp,
        meta: {
            title: '帮助文档'
        }
    },
    {
        path: '/detailsEnv',
        name: 'DetailsEnv',
        component: DetailsEnv,
        meta: {
            title: '环境检测'
        }
    },
    {
        path: '/infoDisease',
        name: 'InfoDisease',
        component: InfoDisease,
        meta: {
            title: '病虫害检测'
        }
    },
    {
        path: '/imgPredict',
        name: 'ImgPredict',
        component: ImgPredict,
        meta: {
            title: '图像预测'
        }
    },
    {
        path: '/videoPredict',
        name: 'VideoPredict',
        component: VideoPredict,
        meta: {
            title: '视频预测'
        }
    },
    {
        path: '/cameraPredict',
        name: 'CameraPredict',
        component: CameraPredict,
        meta: {
            title: '摄像头预测'
        }
    },
    {
        path: '/imgRecord',
        name: 'ImgRecord',
        component: ImgRecord,
        meta: {
            title: '图像预测记录'
        }
    },
    {
        path: '/videoRecord',
        name: 'VideoRecord',
        component: VideoRecord,
        meta: {
            title: '视频预测记录'
        }
    },
    {
        path: '/cameraRecord',
        name: 'CameraRecord',
        component: CameraRecord,
        meta: {
            title: '摄像头预测记录'
        }
    },
    {
        path: '/purchaseManage',
        name: 'PurchaseManage',
        component: PurchaseManage,
        meta: {
            title: '农资采购'
        }
    },
    {
        path: '/supplyManage',
        name: 'SupplyManage',
        component: SupplyManage,
        meta: {
            title: '供应管理',
            requireAdminOrSupplier: true
        },
        children: [
            {
                path: '',
                redirect: '/supplyManage/product'
            },
            {
                path: 'product',
                name: 'ProductManage',
                component: ProductManage,
                meta: {
                    title: '商品管理',
                    requireAdminOrSupplier: true
                }
            },
            {
                path: 'order',
                name: 'OrderManage',
                component: OrderManage,
                meta: {
                    title: '订单管理',
                    requireAdminOrSupplier: true
                }
            },
            {
                path: 'category',
                name: 'CategoryManage',
                component: CategoryManage,
                meta: {
                    title: '分类管理',
                    requireAdmin: true
                }
            }
        ]
    },
    {
        path: '/cart',
        name: 'Cart',
        component: Cart,
        meta: {
            title: '购物车'
        }
    },
    {
        path: '/storageManage',
        name: 'StorageManage',
        component: StorageManage,
        meta: {
            title: '库存管理'
        }
    },
    {
        path: '/userManage',
        name: 'UserManage',
        component: UserManage,
        meta: {
            title: '用户管理'
        }
    },
    {
        path: '/personal',
        name: 'Personal',
        component: Personal,
        meta: {
            title: '个人中心'
        }
    },
    // RAG知识库路由
    {
        path: '/knowledgeChat',
        name: 'KnowledgeChat',
        component: KnowledgeChat,
        meta: {
            title: '知识库问答'
        }
    },
    {
        path: '/documentManage',
        name: 'DocumentManage',
        component: DocumentManage,
        meta: {
            title: '文档管理',
            requireAdmin: true
        }
    },
    // 其他路由可以在这里添加
    {
        path: '/:pathMatch(.*)*',
        redirect: '/'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    // 设置页面标题
    document.title = to.meta.title || '农业中国';

    // 获取用户信息
    const getUserInfo = () => {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            try {
                return JSON.parse(userInfoStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const user = getUserInfo();
    
    // 调试信息
    console.log('路由守卫 - 目标路径:', to.path);
    console.log('路由守卫 - 用户信息:', user);
    console.log('路由守卫 - requireAdminOrSupplier:', to.meta.requireAdminOrSupplier);

    // 判断用户角色
    const isAdmin = user && (user.role === 'admin' || user.role === 1 || user.isAdmin === true);
    const isSupplier = user && (user.role === 'supplier' || user.role === 2 || user.isSupplier === true);
    
    // 供应商只能访问特定页面（不包括分类管理）
    const supplierAllowedPaths = ['/supplyManage', '/supplyManage/product', '/supplyManage/order', '/personal', '/purchaseManage'];
    if (isSupplier && !isAdmin) {
        // 检查是否在允许的路径列表中
        const isAllowed = supplierAllowedPaths.some(path => to.path.startsWith(path));
        if (!isAllowed) {
            console.log('路由守卫 - 供应商无权访问该页面，跳转到供应管理');
            next('/supplyManage');
            return;
        }
    }

    // 检查管理员权限
    if (to.meta.requireAdmin) {
        if (user) {
            // 管理员角色为 'admin' 
            if (isAdmin) {
                next();
            } else {
                next('/');
            }
        } else {
            next('/login');
        }
        return;
    }

    // 检查管理员或供应商权限
    if (to.meta.requireAdminOrSupplier) {
        if (user) {
            console.log('路由守卫 - isAdmin:', isAdmin, 'isSupplier:', isSupplier);
            if (isAdmin || isSupplier) {
                next();
            } else {
                next('/');
            }
        } else {
            console.log('路由守卫 - 用户未登录，跳转到登录页');
            next('/login');
        }
        return;
    }

    next();
});

export default router;
