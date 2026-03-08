import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { QuestionFilled, Document, VideoPlay, Phone, Message, Search } from '@element-plus/icons-vue';
// 页面标题
const pageTitle = ref('帮助文档');
const pageDesc = ref('查看系统使用指南，常见问题解答，技术支持联系方式');
// 搜索关键词
const searchKeyword = ref('');
// 当前选中的帮助分类
const activeCategory = ref('guide');
// 帮助分类
const categories = [
    { key: 'guide', label: '使用指南', icon: Document },
    { key: 'faq', label: '常见问题', icon: QuestionFilled },
    { key: 'video', label: '视频教程', icon: VideoPlay },
    { key: 'contact', label: '联系我们', icon: Phone }
];
// 使用指南内容
const guides = [
    {
        title: '温室管理',
        content: '在温室管理页面，您可以查看所有温室的基本信息、环境参数和作物种植情况。点击温室卡片可查看详细信息，包括实时环境数据、历史数据趋势和病虫害检测结果。',
        icon: 'GreenHouse'
    },
    {
        title: '环境监测',
        content: '环境监测页面提供实时的温度、湿度、光照、CO2浓度等环境参数监控。支持查看历史数据趋势，可选择不同时间范围（8小时、1天、1周、1个月）进行数据分析。',
        icon: 'Monitor'
    },
    {
        title: '设备控制',
        content: '在设备控制页面，您可以远程控制温室内的各种设备，如风机、湿帘、遮阳网、灌溉系统等。支持手动控制和自动模式切换，自动模式会根据环境参数自动调节设备状态。',
        icon: 'SetUp'
    },
    {
        title: '数据分析',
        content: '数据分析页面提供温室健康评分、异常分布统计、异常事件时间线等高级分析功能。帮助您全面了解温室运行状况，及时发现并处理异常情况。',
        icon: 'TrendCharts'
    },
    {
        title: '告警管理',
        content: '告警管理包含告警规则配置和告警历史查询。您可以设置各种环境参数的告警阈值，当参数超出范围时系统会自动发送告警通知。告警历史记录所有告警事件及其处理状态。',
        icon: 'Bell'
    },
    {
        title: '病虫害检测',
        content: '系统支持图像、视频和实时摄像头三种方式进行病虫害检测。上传图片或视频，系统将自动识别病虫害类型并给出防治建议。检测结果会保存到记录中供后续查看。',
        icon: 'View'
    }
];
// 常见问题
const faqs = [
    {
        question: '如何添加新的温室？',
        answer: '在温室管理页面点击"新增温室"按钮，填写温室名称、面积、种植作物等基本信息后保存即可。'
    },
    {
        question: '告警规则如何设置？',
        answer: '进入告警管理页面，选择"告警规则"标签，点击"新增规则"按钮。选择要监控的参数类型（温度、湿度等），设置最小值、最大值和告警级别，保存后即可生效。'
    },
    {
        question: '如何查看历史环境数据？',
        answer: '在环境监测页面，选择要查看的温室和时间范围（8小时、1天、1周、1个月），系统会自动加载并显示对应的历史数据趋势图。'
    },
    {
        question: '设备自动控制如何开启？',
        answer: '在设备控制页面，找到要设置自动控制的设备，点击"自动模式"开关即可开启。开启后设备会根据预设的环境参数阈值自动运行。'
    },
    {
        question: '病虫害检测的准确率如何？',
        answer: '系统采用先进的深度学习算法，对常见病虫害的识别准确率达到95%以上。对于识别结果不确定的情况，系统会给出多个可能的病虫害类型供参考。'
    },
    {
        question: '如何导出环境数据报表？',
        answer: '目前系统支持在数据分析页面查看统计数据，导出功能正在开发中，敬请期待。'
    },
    {
        question: '系统支持哪些浏览器？',
        answer: '系统支持Chrome、Firefox、Safari、Edge等主流浏览器的最新版本。建议使用Chrome浏览器以获得最佳体验。'
    },
    {
        question: '忘记密码怎么办？',
        answer: '请联系系统管理员重置密码，或拨打技术支持热线获取帮助。'
    }
];
// 视频教程
const videos = [
    {
        title: '系统快速入门',
        description: '介绍系统的基本功能和操作方法，帮助您快速上手使用',
        duration: '10:25',
        thumbnail: '入门教程'
    },
    {
        title: '温室管理详解',
        description: '详细讲解温室管理页面的各项功能和操作技巧',
        duration: '15:30',
        thumbnail: '温室管理'
    },
    {
        title: '告警规则配置',
        description: '演示如何配置告警规则，设置监控参数和告警阈值',
        duration: '08:45',
        thumbnail: '告警配置'
    },
    {
        title: '设备控制操作',
        description: '介绍设备控制页面的使用方法，包括手动控制和自动模式',
        duration: '12:15',
        thumbnail: '设备控制'
    },
    {
        title: '病虫害检测使用指南',
        description: '演示如何使用图像、视频和摄像头进行病虫害检测',
        duration: '18:20',
        thumbnail: '病虫害检测'
    },
    {
        title: '数据分析与报表',
        description: '讲解数据分析页面的各项功能和数据解读方法',
        duration: '14:00',
        thumbnail: '数据分析'
    }
];
// 联系方式
const contacts = [
    {
        type: '技术支持热线',
        value: '400-888-9999',
        icon: 'Phone',
        desc: '工作日 9:00-18:00'
    },
    {
        type: '技术支持邮箱',
        value: 'support@smartgreenhouse.com',
        icon: 'Message',
        desc: '24小时内回复'
    },
    {
        type: '在线客服',
        value: '点击咨询',
        icon: 'ChatDotRound',
        desc: '工作日 9:00-21:00'
    }
];
// 搜索帮助内容
const searchResults = ref([]);
const isSearching = ref(false);
const handleSearch = () => {
    if (!searchKeyword.value.trim()) {
        ElMessage.warning('请输入搜索关键词');
        return;
    }
    isSearching.value = true;
    const keyword = searchKeyword.value.toLowerCase();
    // 搜索使用指南
    const guideResults = guides.filter(g => g.title.toLowerCase().includes(keyword) ||
        g.content.toLowerCase().includes(keyword)).map(g => ({ ...g, type: 'guide' }));
    // 搜索常见问题
    const faqResults = faqs.filter(f => f.question.toLowerCase().includes(keyword) ||
        f.answer.toLowerCase().includes(keyword)).map(f => ({ ...f, type: 'faq' }));
    searchResults.value = [...guideResults, ...faqResults];
    if (searchResults.value.length === 0) {
        ElMessage.info('未找到相关内容，请尝试其他关键词');
    }
};
const clearSearch = () => {
    searchKeyword.value = '';
    isSearching.value = false;
    searchResults.value = [];
};
// 播放视频
const playVideo = (video) => {
    ElMessage.info(`正在播放：${video.title}`);
};
// 联系客服
const contactService = () => {
    ElMessage.success('已打开在线客服窗口');
};
onMounted(() => {
    console.log('帮助文档页面加载成功');
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
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['result-item']} */ ;
/** @type {__VLS_StyleScopedClasses['result-item']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-card']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-card']} */ ;
/** @type {__VLS_StyleScopedClasses['guide-card']} */ ;
/** @type {__VLS_StyleScopedClasses['faq-answer']} */ ;
/** @type {__VLS_StyleScopedClasses['video-card']} */ ;
/** @type {__VLS_StyleScopedClasses['thumbnail-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['video-info']} */ ;
/** @type {__VLS_StyleScopedClasses['video-info']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-value']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-value']} */ ;
/** @type {__VLS_StyleScopedClasses['clickable']} */ ;
/** @type {__VLS_StyleScopedClasses['feedback-section']} */ ;
/** @type {__VLS_StyleScopedClasses['feedback-section']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['guides-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['videos-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['contact-cards']} */ ;
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
    ...{ class: "content-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['content-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-section" },
});
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onKeyup': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索帮助内容...",
    ...{ class: "search-input" },
    clearable: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onKeyup': {} },
    ...{ 'onClear': {} },
    modelValue: (__VLS_ctx.searchKeyword),
    placeholder: "搜索帮助内容...",
    ...{ class: "search-input" },
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ keyup: {} },
    { onKeyup: (__VLS_ctx.handleSearch) });
const __VLS_7 = ({ clear: {} },
    { onClear: (__VLS_ctx.clearSearch) });
/** @type {__VLS_StyleScopedClasses['search-input']} */ ;
const { default: __VLS_8 } = __VLS_3.slots;
{
    const { prefix: __VLS_9 } = __VLS_3.slots;
    let __VLS_10;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
    const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const { default: __VLS_15 } = __VLS_13.slots;
    let __VLS_16;
    /** @ts-ignore @type {typeof __VLS_components.Search} */
    Search;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({}));
    const __VLS_18 = __VLS_17({}, ...__VLS_functionalComponentArgsRest(__VLS_17));
    // @ts-ignore
    [pageTitle, pageDesc, searchKeyword, handleSearch, clearSearch,];
    var __VLS_13;
    // @ts-ignore
    [];
}
{
    const { append: __VLS_21 } = __VLS_3.slots;
    let __VLS_22;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_27;
    const __VLS_28 = ({ click: {} },
        { onClick: (__VLS_ctx.handleSearch) });
    const { default: __VLS_29 } = __VLS_25.slots;
    // @ts-ignore
    [handleSearch,];
    var __VLS_25;
    var __VLS_26;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
if (__VLS_ctx.isSearching) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "search-results" },
    });
    /** @type {__VLS_StyleScopedClasses['search-results']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "section-header" },
    });
    /** @type {__VLS_StyleScopedClasses['section-header']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        ...{ 'onClick': {} },
        link: true,
    }));
    const __VLS_32 = __VLS_31({
        ...{ 'onClick': {} },
        link: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    let __VLS_35;
    const __VLS_36 = ({ click: {} },
        { onClick: (__VLS_ctx.clearSearch) });
    const { default: __VLS_37 } = __VLS_33.slots;
    // @ts-ignore
    [clearSearch, isSearching,];
    var __VLS_33;
    var __VLS_34;
    if (__VLS_ctx.searchResults.length > 0) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "results-list" },
        });
        /** @type {__VLS_StyleScopedClasses['results-list']} */ ;
        for (const [item, index] of __VLS_vFor((__VLS_ctx.searchResults))) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
                key: (index),
                ...{ class: "result-item" },
            });
            /** @type {__VLS_StyleScopedClasses['result-item']} */ ;
            if (item.type === 'guide') {
                let __VLS_38;
                /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
                elTag;
                // @ts-ignore
                const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
                    type: "primary",
                    size: "small",
                }));
                const __VLS_40 = __VLS_39({
                    type: "primary",
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_39));
                const { default: __VLS_43 } = __VLS_41.slots;
                // @ts-ignore
                [searchResults, searchResults,];
                var __VLS_41;
            }
            else {
                let __VLS_44;
                /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
                elTag;
                // @ts-ignore
                const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
                    type: "success",
                    size: "small",
                }));
                const __VLS_46 = __VLS_45({
                    type: "success",
                    size: "small",
                }, ...__VLS_functionalComponentArgsRest(__VLS_45));
                const { default: __VLS_49 } = __VLS_47.slots;
                // @ts-ignore
                [];
                var __VLS_47;
            }
            __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
            (item.title || item.question);
            __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
            (item.content || item.answer);
            // @ts-ignore
            [];
        }
    }
    else {
        let __VLS_50;
        /** @ts-ignore @type {typeof __VLS_components.elEmpty | typeof __VLS_components.ElEmpty} */
        elEmpty;
        // @ts-ignore
        const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
            description: "未找到相关内容",
        }));
        const __VLS_52 = __VLS_51({
            description: "未找到相关内容",
        }, ...__VLS_functionalComponentArgsRest(__VLS_51));
    }
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "help-content" },
    });
    /** @type {__VLS_StyleScopedClasses['help-content']} */ ;
    let __VLS_55;
    /** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
    elTabs;
    // @ts-ignore
    const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
        modelValue: (__VLS_ctx.activeCategory),
        type: "border-card",
        ...{ class: "help-tabs" },
    }));
    const __VLS_57 = __VLS_56({
        modelValue: (__VLS_ctx.activeCategory),
        type: "border-card",
        ...{ class: "help-tabs" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_56));
    /** @type {__VLS_StyleScopedClasses['help-tabs']} */ ;
    const { default: __VLS_60 } = __VLS_58.slots;
    let __VLS_61;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        label: "使用指南",
        name: "guide",
    }));
    const __VLS_63 = __VLS_62({
        label: "使用指南",
        name: "guide",
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    const { default: __VLS_66 } = __VLS_64.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "guides-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['guides-grid']} */ ;
    for (const [guide, index] of __VLS_vFor((__VLS_ctx.guides))) {
        let __VLS_67;
        /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
        elCard;
        // @ts-ignore
        const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
            key: (index),
            ...{ class: "guide-card" },
            shadow: "hover",
        }));
        const __VLS_69 = __VLS_68({
            key: (index),
            ...{ class: "guide-card" },
            shadow: "hover",
        }, ...__VLS_functionalComponentArgsRest(__VLS_68));
        /** @type {__VLS_StyleScopedClasses['guide-card']} */ ;
        const { default: __VLS_72 } = __VLS_70.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "guide-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['guide-icon']} */ ;
        let __VLS_73;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
            size: (40),
            color: "#409EFF",
        }));
        const __VLS_75 = __VLS_74({
            size: (40),
            color: "#409EFF",
        }, ...__VLS_functionalComponentArgsRest(__VLS_74));
        const { default: __VLS_78 } = __VLS_76.slots;
        const __VLS_79 = (guide.icon);
        // @ts-ignore
        const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({}));
        const __VLS_81 = __VLS_80({}, ...__VLS_functionalComponentArgsRest(__VLS_80));
        // @ts-ignore
        [activeCategory, guides,];
        var __VLS_76;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
        (guide.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (guide.content);
        // @ts-ignore
        [];
        var __VLS_70;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_64;
    let __VLS_84;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
        label: "常见问题",
        name: "faq",
    }));
    const __VLS_86 = __VLS_85({
        label: "常见问题",
        name: "faq",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    const { default: __VLS_89 } = __VLS_87.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "faq-list" },
    });
    /** @type {__VLS_StyleScopedClasses['faq-list']} */ ;
    let __VLS_90;
    /** @ts-ignore @type {typeof __VLS_components.elCollapse | typeof __VLS_components.ElCollapse | typeof __VLS_components.elCollapse | typeof __VLS_components.ElCollapse} */
    elCollapse;
    // @ts-ignore
    const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
        accordion: true,
    }));
    const __VLS_92 = __VLS_91({
        accordion: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_91));
    const { default: __VLS_95 } = __VLS_93.slots;
    for (const [faq, index] of __VLS_vFor((__VLS_ctx.faqs))) {
        let __VLS_96;
        /** @ts-ignore @type {typeof __VLS_components.elCollapseItem | typeof __VLS_components.ElCollapseItem | typeof __VLS_components.elCollapseItem | typeof __VLS_components.ElCollapseItem} */
        elCollapseItem;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
            key: (index),
            title: (faq.question),
        }));
        const __VLS_98 = __VLS_97({
            key: (index),
            title: (faq.question),
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        const { default: __VLS_101 } = __VLS_99.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "faq-answer" },
        });
        /** @type {__VLS_StyleScopedClasses['faq-answer']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (faq.answer);
        // @ts-ignore
        [faqs,];
        var __VLS_99;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_93;
    // @ts-ignore
    [];
    var __VLS_87;
    let __VLS_102;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
        label: "视频教程",
        name: "video",
    }));
    const __VLS_104 = __VLS_103({
        label: "视频教程",
        name: "video",
    }, ...__VLS_functionalComponentArgsRest(__VLS_103));
    const { default: __VLS_107 } = __VLS_105.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "videos-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['videos-grid']} */ ;
    for (const [video, index] of __VLS_vFor((__VLS_ctx.videos))) {
        let __VLS_108;
        /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
        elCard;
        // @ts-ignore
        const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
            ...{ 'onClick': {} },
            key: (index),
            ...{ class: "video-card" },
            shadow: "hover",
        }));
        const __VLS_110 = __VLS_109({
            ...{ 'onClick': {} },
            key: (index),
            ...{ class: "video-card" },
            shadow: "hover",
        }, ...__VLS_functionalComponentArgsRest(__VLS_109));
        let __VLS_113;
        const __VLS_114 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isSearching))
                        return;
                    __VLS_ctx.playVideo(video);
                    // @ts-ignore
                    [videos, playVideo,];
                } });
        /** @type {__VLS_StyleScopedClasses['video-card']} */ ;
        const { default: __VLS_115 } = __VLS_111.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "video-thumbnail" },
        });
        /** @type {__VLS_StyleScopedClasses['video-thumbnail']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "thumbnail-placeholder" },
        });
        /** @type {__VLS_StyleScopedClasses['thumbnail-placeholder']} */ ;
        let __VLS_116;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({
            size: (48),
            color: "#909399",
        }));
        const __VLS_118 = __VLS_117({
            size: (48),
            color: "#909399",
        }, ...__VLS_functionalComponentArgsRest(__VLS_117));
        const { default: __VLS_121 } = __VLS_119.slots;
        let __VLS_122;
        /** @ts-ignore @type {typeof __VLS_components.VideoPlay} */
        VideoPlay;
        // @ts-ignore
        const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({}));
        const __VLS_124 = __VLS_123({}, ...__VLS_functionalComponentArgsRest(__VLS_123));
        // @ts-ignore
        [];
        var __VLS_119;
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (video.thumbnail);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "video-duration" },
        });
        /** @type {__VLS_StyleScopedClasses['video-duration']} */ ;
        (video.duration);
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "video-info" },
        });
        /** @type {__VLS_StyleScopedClasses['video-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        (video.title);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
        (video.description);
        // @ts-ignore
        [];
        var __VLS_111;
        var __VLS_112;
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_105;
    let __VLS_127;
    /** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
    elTabPane;
    // @ts-ignore
    const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
        label: "联系我们",
        name: "contact",
    }));
    const __VLS_129 = __VLS_128({
        label: "联系我们",
        name: "contact",
    }, ...__VLS_functionalComponentArgsRest(__VLS_128));
    const { default: __VLS_132 } = __VLS_130.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-section" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "contact-cards" },
    });
    /** @type {__VLS_StyleScopedClasses['contact-cards']} */ ;
    for (const [contact, index] of __VLS_vFor((__VLS_ctx.contacts))) {
        let __VLS_133;
        /** @ts-ignore @type {typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components.elCard | typeof __VLS_components.ElCard} */
        elCard;
        // @ts-ignore
        const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
            key: (index),
            ...{ class: "contact-card" },
            shadow: "hover",
        }));
        const __VLS_135 = __VLS_134({
            key: (index),
            ...{ class: "contact-card" },
            shadow: "hover",
        }, ...__VLS_functionalComponentArgsRest(__VLS_134));
        /** @type {__VLS_StyleScopedClasses['contact-card']} */ ;
        const { default: __VLS_138 } = __VLS_136.slots;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "contact-icon" },
        });
        /** @type {__VLS_StyleScopedClasses['contact-icon']} */ ;
        let __VLS_139;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_140 = __VLS_asFunctionalComponent1(__VLS_139, new __VLS_139({
            size: (32),
            color: "#67C23A",
        }));
        const __VLS_141 = __VLS_140({
            size: (32),
            color: "#67C23A",
        }, ...__VLS_functionalComponentArgsRest(__VLS_140));
        const { default: __VLS_144 } = __VLS_142.slots;
        const __VLS_145 = (contact.icon);
        // @ts-ignore
        const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({}));
        const __VLS_147 = __VLS_146({}, ...__VLS_functionalComponentArgsRest(__VLS_146));
        // @ts-ignore
        [contacts,];
        var __VLS_142;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "contact-info" },
        });
        /** @type {__VLS_StyleScopedClasses['contact-info']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({});
        (contact.type);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.isSearching))
                        return;
                    contact.type === '在线客服' && __VLS_ctx.contactService();
                    // @ts-ignore
                    [contactService,];
                } },
            ...{ class: "contact-value" },
            ...{ class: ({ 'clickable': contact.type === '在线客服' }) },
        });
        /** @type {__VLS_StyleScopedClasses['contact-value']} */ ;
        /** @type {__VLS_StyleScopedClasses['clickable']} */ ;
        (contact.value);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "contact-desc" },
        });
        /** @type {__VLS_StyleScopedClasses['contact-desc']} */ ;
        (contact.desc);
        // @ts-ignore
        [];
        var __VLS_136;
        // @ts-ignore
        [];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "feedback-section" },
    });
    /** @type {__VLS_StyleScopedClasses['feedback-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
    let __VLS_150;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
    }));
    const __VLS_152 = __VLS_151({
        ...{ 'onClick': {} },
        type: "primary",
        size: "large",
    }, ...__VLS_functionalComponentArgsRest(__VLS_151));
    let __VLS_155;
    const __VLS_156 = ({ click: {} },
        { onClick: (...[$event]) => {
                if (!!(__VLS_ctx.isSearching))
                    return;
                __VLS_ctx.ElMessage.info('反馈功能开发中');
                // @ts-ignore
                [ElMessage,];
            } });
    const { default: __VLS_157 } = __VLS_153.slots;
    let __VLS_158;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_159 = __VLS_asFunctionalComponent1(__VLS_158, new __VLS_158({}));
    const __VLS_160 = __VLS_159({}, ...__VLS_functionalComponentArgsRest(__VLS_159));
    const { default: __VLS_163 } = __VLS_161.slots;
    let __VLS_164;
    /** @ts-ignore @type {typeof __VLS_components.Message} */
    Message;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({}));
    const __VLS_166 = __VLS_165({}, ...__VLS_functionalComponentArgsRest(__VLS_165));
    // @ts-ignore
    [];
    var __VLS_161;
    // @ts-ignore
    [];
    var __VLS_153;
    var __VLS_154;
    // @ts-ignore
    [];
    var __VLS_130;
    // @ts-ignore
    [];
    var __VLS_58;
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
