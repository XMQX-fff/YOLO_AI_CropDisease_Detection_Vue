import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
// 导入API
import { useRecordApi } from '/@/api/record';
const recordApi = useRecordApi();
const route = useRoute();
const leftWidth = ref(50); // 左侧 div 初始宽度
const state = reactive({
    form: {},
    id: ''
});
const getData = () => {
    recordApi.getVideoRecordDetail(state.id).then((res) => {
        if (res.code == 0) {
            // res.data = JSON.parse(res.data);
            state.form = res.data;
            console.log(state.form);
        }
        else {
            ElMessage.error(res.msg);
        }
    });
};
const playVideos = () => {
    const leftVideo = document.querySelector('.left .video');
    const rightVideo = document.querySelector('.right .video');
    if (leftVideo)
        leftVideo.play();
    if (rightVideo)
        rightVideo.play();
};
const pauseVideos = () => {
    const leftVideo = document.querySelector('.left .video');
    const rightVideo = document.querySelector('.right .video');
    if (leftVideo)
        leftVideo.pause();
    if (rightVideo)
        rightVideo.pause();
};
// 拖动分割条
const startDrag = (e) => {
    const cardsContainer = document.querySelector('.cards'); // 获取父容器
    const startX = e.clientX;
    const startLeftWidth = leftWidth.value;
    const cardsContainerLeft = cardsContainer.getBoundingClientRect().left; // 获取父容器的左边位置
    const cardsContainerWidth = cardsContainer.offsetWidth; // 获取父容器的宽度
    const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.clientX - startX;
        let newLeftWidth = startLeftWidth + (deltaX / cardsContainerWidth) * 100;
        // 限制左右区域的宽度范围为 0% 到 100%
        newLeftWidth = Math.min(Math.max(newLeftWidth, 0), 100);
        leftWidth.value = newLeftWidth;
    };
    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};
onMounted(() => {
    //获取链接参数
    state.id = route.query.id;
    console.log(state.id);
    getData();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "system-predict-container layout-padding" },
});
/** @type {__VLS_StyleScopedClasses['system-predict-container']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-padding']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "system-predict-padding layout-padding-auto layout-padding-view" },
});
/** @type {__VLS_StyleScopedClasses['system-predict-padding']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-padding-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-padding-view']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "header" },
});
/** @type {__VLS_StyleScopedClasses['header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "kind" },
});
/** @type {__VLS_StyleScopedClasses['kind']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({});
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.state.form.weight),
    ...{ style: {} },
    size: "large",
    disabled: true,
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.state.form.weight),
    ...{ style: {} },
    size: "large",
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "model" },
});
/** @type {__VLS_StyleScopedClasses['model']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({});
let __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.state.form.weight),
    ...{ style: {} },
    size: "large",
    disabled: true,
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.state.form.weight),
    ...{ style: {} },
    size: "large",
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "count" },
});
/** @type {__VLS_StyleScopedClasses['count']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({});
let __VLS_10;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    modelValue: (__VLS_ctx.state.form.conf),
    ...{ style: {} },
    size: "large",
    disabled: true,
}));
const __VLS_12 = __VLS_11({
    modelValue: (__VLS_ctx.state.form.conf),
    ...{ style: {} },
    size: "large",
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "username" },
});
/** @type {__VLS_StyleScopedClasses['username']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({});
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.state.form.username),
    ...{ style: {} },
    size: "large",
    disabled: true,
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.state.form.username),
    ...{ style: {} },
    size: "large",
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "startTime" },
});
/** @type {__VLS_StyleScopedClasses['startTime']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.text, __VLS_intrinsics.text)({});
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    modelValue: (__VLS_ctx.state.form.startTime),
    ...{ style: {} },
    size: "large",
    disabled: true,
}));
const __VLS_22 = __VLS_21({
    modelValue: (__VLS_ctx.state.form.startTime),
    ...{ style: {} },
    size: "large",
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "button-section" },
});
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "predict-button" },
}));
const __VLS_27 = __VLS_26({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "predict-button" },
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
let __VLS_30;
const __VLS_31 = ({ click: {} },
    { onClick: (__VLS_ctx.playVideos) });
/** @type {__VLS_StyleScopedClasses['predict-button']} */ ;
const { default: __VLS_32 } = __VLS_28.slots;
// @ts-ignore
[state, state, state, state, state, playVideos,];
var __VLS_28;
var __VLS_29;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "button-section" },
});
/** @type {__VLS_StyleScopedClasses['button-section']} */ ;
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    ...{ 'onClick': {} },
    type: "success",
    ...{ class: "predict-button" },
}));
const __VLS_35 = __VLS_34({
    ...{ 'onClick': {} },
    type: "success",
    ...{ class: "predict-button" },
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
let __VLS_38;
const __VLS_39 = ({ click: {} },
    { onClick: (__VLS_ctx.pauseVideos) });
/** @type {__VLS_StyleScopedClasses['predict-button']} */ ;
const { default: __VLS_40 } = __VLS_36.slots;
// @ts-ignore
[pauseVideos,];
var __VLS_36;
var __VLS_37;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "cards" },
    ref: "cardsContainer",
});
/** @type {__VLS_StyleScopedClasses['cards']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "left" },
    ...{ style: ({ width: __VLS_ctx.leftWidth + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['left']} */ ;
if (__VLS_ctx.state.form.inputVideo) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
        ...{ class: "video" },
        preload: "auto",
        controls: true,
    });
    /** @type {__VLS_StyleScopedClasses['video']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.source)({
        src: (__VLS_ctx.state.form.inputVideo),
        type: "video/mp4",
    });
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onMousedown: (__VLS_ctx.startDrag) },
    ...{ class: "splitter" },
});
/** @type {__VLS_StyleScopedClasses['splitter']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "right" },
    ...{ style: ({ width: 100 - __VLS_ctx.leftWidth + '%' }) },
});
/** @type {__VLS_StyleScopedClasses['right']} */ ;
if (__VLS_ctx.state.form.outVideo) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
        ...{ class: "video" },
        preload: "auto",
        controls: true,
    });
    /** @type {__VLS_StyleScopedClasses['video']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.source)({
        src: (__VLS_ctx.state.form.outVideo),
        type: "video/mp4",
    });
}
// @ts-ignore
[state, state, state, state, leftWidth, leftWidth, startDrag,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
