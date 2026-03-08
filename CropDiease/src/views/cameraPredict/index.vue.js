import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { SocketService } from '/@/utils/socket';
import { Camera } from '@element-plus/icons-vue';
// 导入API
import { usePredictApi } from '/@/api/predict';
const predictApi = usePredictApi();
import { formatDate } from '/@/utils/formatTime';
const conf = ref(50);
const kind = ref('');
const weight = ref('');
const state = reactive({
    weight_items: [],
    kind_items: [
        {
            value: 'corn',
            label: '玉米',
        },
        {
            value: 'rice',
            label: '水稻',
        },
        {
            value: 'wheat',
            label: '小麦',
        },
        {
            value: 'potato',
            label: '马铃薯',
        },
        {
            value: 'tomato',
            label: '番茄',
        },
        {
            value: 'cotton',
            label: '棉花',
        },
        {
            value: 'apple',
            label: '苹果',
        },
        {
            value: 'grape',
            label: '葡萄',
        },
        {
            value: 'strawberry',
            label: '草莓',
        },
    ],
    data: {},
    video_path: '',
    type_text: "正在保存",
    percentage: 50,
    isShow: false,
    cameraisShow: false,
    form: {
        username: '',
        weight: '',
        conf: null,
        kind: '',
        startTime: ''
    },
});
const socketService = new SocketService();
socketService.on('message', (data) => {
    console.log('Received message:', data);
    ElMessage.success(data);
});
const formatTooltip = (val) => {
    return val / 100;
};
socketService.on('progress', (data) => {
    state.percentage = parseInt(data);
    if (parseInt(data) < 100) {
        state.isShow = true;
    }
    else {
        //两秒后隐藏进度条
        ElMessage.success("保存成功！");
        setTimeout(() => {
            state.isShow = false;
            state.percentage = 0;
        }, 2000);
    }
    console.log('Received message:', data);
});
const getData = () => {
    predictApi.getFileNames().then((res) => {
        if (res.code == 0) {
            res.data = JSON.parse(res.data);
            state.weight_items = res.data.weight_items.filter(item => item.value.includes(kind.value));
        }
        else {
            ElMessage.error(res.msg);
        }
    });
};
const start = () => {
    if (!kind.value) {
        ElMessage.error('请先选择作物种类！');
        return;
    }
    if (!weight.value) {
        ElMessage.error('请先选择模型！');
        return;
    }
    if (!conf.value) {
        ElMessage.error('请先设置置信度阈值！');
        return;
    }
    state.form.weight = weight.value;
    state.form.kind = kind.value;
    state.form.conf = conf.value / 100;
    state.form.username = 'admin'; // 暂时使用默认值
    state.form.startTime = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
    console.log(state.form);
    const queryParams = new URLSearchParams(state.form).toString();
    state.cameraisShow = true;
    state.video_path = `http://127.0.0.1:5000/predictCamera?${queryParams}`;
};
const stop = () => {
    predictApi.stopCamera().then((res) => {
        if (res.code == 0) {
            res.data = JSON.parse(res.data);
            console.log(res.data);
            state.weight_items = res.data.weight_items;
        }
        else {
            ElMessage.error(res.msg);
        }
    });
    state.cameraisShow = false;
};
onMounted(() => {
    getData();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['camera-card']} */ ;
/** @type {__VLS_StyleScopedClasses['video']} */ ;
/** @type {__VLS_StyleScopedClasses['camera-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['el-slider__button']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['slider-container']} */ ;
/** @type {__VLS_StyleScopedClasses['camera-card']} */ ;
/** @type {__VLS_StyleScopedClasses['camera-placeholder']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "camera-predict-container" },
});
/** @type {__VLS_StyleScopedClasses['camera-predict-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-content" },
});
/** @type {__VLS_StyleScopedClasses['page-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "page-header" },
});
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "page-title" },
});
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "page-subtitle" },
});
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "operation-section" },
});
/** @type {__VLS_StyleScopedClasses['operation-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-row" },
});
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.kind),
    placeholder: "请选择作物种类",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.kind),
    placeholder: "请选择作物种类",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
const __VLS_6 = ({ change: {} },
    { onChange: (__VLS_ctx.getData) });
const { default: __VLS_7 } = __VLS_3.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.state.kind_items))) {
    let __VLS_8;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent1(__VLS_8, new __VLS_8({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }));
    const __VLS_10 = __VLS_9({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    // @ts-ignore
    [kind, getData, state,];
}
// @ts-ignore
[];
var __VLS_3;
var __VLS_4;
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({
    modelValue: (__VLS_ctx.weight),
    placeholder: "请选择模型",
    ...{ style: {} },
}));
const __VLS_15 = __VLS_14({
    modelValue: (__VLS_ctx.weight),
    placeholder: "请选择模型",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_14));
const { default: __VLS_18 } = __VLS_16.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.state.weight_items))) {
    let __VLS_19;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }));
    const __VLS_21 = __VLS_20({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_20));
    // @ts-ignore
    [state, weight,];
}
// @ts-ignore
[];
var __VLS_16;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "slider-container" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['slider-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "slider-label" },
});
/** @type {__VLS_StyleScopedClasses['slider-label']} */ ;
(__VLS_ctx.conf);
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider} */
elSlider;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.conf),
    formatTooltip: (__VLS_ctx.formatTooltip),
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.conf),
    formatTooltip: (__VLS_ctx.formatTooltip),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "button-section" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
let __VLS_29;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_31 = __VLS_30({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
let __VLS_34;
const __VLS_35 = ({ click: {} },
    { onClick: (__VLS_ctx.start) });
const { default: __VLS_36 } = __VLS_32.slots;
// @ts-ignore
[conf, conf, formatTooltip, start,];
var __VLS_32;
var __VLS_33;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "button-section" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
let __VLS_37;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_39 = __VLS_38({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
let __VLS_42;
const __VLS_43 = ({ click: {} },
    { onClick: (__VLS_ctx.stop) });
const { default: __VLS_44 } = __VLS_40.slots;
// @ts-ignore
[stop,];
var __VLS_40;
var __VLS_41;
if (__VLS_ctx.state.isShow) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "demo-progress" },
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['demo-progress']} */ ;
    let __VLS_45;
    /** @ts-ignore @type {typeof __VLS_components.elProgress | typeof __VLS_components.ElProgress | typeof __VLS_components.elProgress | typeof __VLS_components.ElProgress} */
    elProgress;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
        textInside: (true),
        strokeWidth: (20),
        percentage: (__VLS_ctx.state.percentage),
        ...{ style: {} },
    }));
    const __VLS_47 = __VLS_46({
        textInside: (true),
        strokeWidth: (20),
        percentage: (__VLS_ctx.state.percentage),
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    const { default: __VLS_50 } = __VLS_48.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    (__VLS_ctx.state.type_text);
    (__VLS_ctx.state.percentage);
    // @ts-ignore
    [state, state, state, state,];
    var __VLS_48;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "camera-section" },
});
/** @type {__VLS_StyleScopedClasses['camera-section']} */ ;
if (__VLS_ctx.state.cameraisShow) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "camera-card" },
    });
    /** @type {__VLS_StyleScopedClasses['camera-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        ...{ class: "video" },
        src: (__VLS_ctx.state.video_path),
    });
    /** @type {__VLS_StyleScopedClasses['video']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "camera-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['camera-placeholder']} */ ;
    let __VLS_51;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({}));
    const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
    const { default: __VLS_56 } = __VLS_54.slots;
    let __VLS_57;
    /** @ts-ignore @type {typeof __VLS_components.Camera} */
    Camera;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({}));
    const __VLS_59 = __VLS_58({}, ...__VLS_functionalComponentArgsRest(__VLS_58));
    // @ts-ignore
    [state, state,];
    var __VLS_54;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
