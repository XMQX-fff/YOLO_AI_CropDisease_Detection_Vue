import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, ChatLineRound, Picture } from '@element-plus/icons-vue';
import { formatDate } from '/@/utils/formatTime';
import { usePredictApi } from '/@/api/predict';
import { useRecordApi } from '/@/api/record';
import { useGreenhouseApi } from '/@/api/greenhouse';
const predictApi = usePredictApi();
const recordApi = useRecordApi();
const { getGreenhouseList } = useGreenhouseApi();
const imageUrl = ref('');
const conf = ref(50);
const weight = ref('');
const kind = ref('');
const uploadFile = ref();
const predictedImageUrl = ref('');
const greenhouses = ref([]);
const selectedGreenhouse = ref(null);
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
    img: '',
    predictionResult: {
        label: '',
        confidence: '',
        allTime: '',
    },
    form: {
        username: '',
        inputImg: null,
        weight: '',
        conf: null,
        kind: '',
        startTime: ''
    },
    aiSuggestion: '',
    suggestionLoading: false,
    markdownContent: '',
});
const formatTooltip = (val) => {
    return val / 100;
};
function renderMarkdown(text) {
    if (!text)
        return '';
    text = text.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
    text = text.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
    text = text.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');
    text = text.replace(/\*\*(.*)\*\*/gim, '<strong class="markdown-bold">$1</strong>');
    text = text.replace(/^\- (.*$)/gim, '<li class="markdown-list-item">$1</li>');
    text = text.replace(/(<li class="markdown-list-item">.*<\/li>)/s, '<ul class="markdown-list">$1</ul>');
    text = text.replace(/`(.*)`/gim, '<code class="markdown-code">$1</code>');
    text = text.replace(/^(?!<h|<li|<ul|<code).*$/gim, '<p class="markdown-paragraph">$&</p>');
    return text;
}
const handleAvatarSuccessone = (response, uploadFile) => {
    imageUrl.value = URL.createObjectURL(uploadFile.raw);
    state.img = response.data;
};
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
const upData = () => {
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
    if (!state.img) {
        ElMessage.error('请先上传图片！');
        return;
    }
    state.form.weight = weight.value;
    state.form.conf = conf.value / 100;
    state.form.username = 'admin'; // 暂时使用默认值
    state.form.inputImg = state.img;
    state.form.kind = kind.value;
    state.form.startTime = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
    console.log(state.form);
    predictApi.imgPredict(state.form).then((res) => {
        if (res.code == 0) {
            const originalImage = imageUrl.value;
            try {
                res.data = JSON.parse(res.data);
                if (typeof res.data.label === 'string') {
                    res.data.label = JSON.parse(res.data.label);
                }
                if (Array.isArray(res.data.label)) {
                    state.predictionResult.label = res.data.label.map(item => item.replace(/\\u([\dA-Fa-f]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16))));
                }
                else {
                    console.error("res.data.label 不是数组:", res.data.label);
                }
                state.predictionResult.confidence = res.data.confidence;
                state.predictionResult.allTime = res.data.allTime;
                if (res.data.outImg) {
                    predictedImageUrl.value = res.data.outImg;
                }
                else {
                    imageUrl.value = imageUrl.value;
                }
                console.log(state.predictionResult);
                const recordData = {
                    weight: weight.value,
                    inputImg: state.img,
                    outImg: res.data.outImg || '',
                    confidence: Array.isArray(state.predictionResult.confidence)
                        ? state.predictionResult.confidence.join(',')
                        : String(state.predictionResult.confidence),
                    allTime: state.predictionResult.allTime,
                    conf: String(state.form.conf),
                    label: Array.isArray(state.predictionResult.label)
                        ? state.predictionResult.label.join(',')
                        : String(state.predictionResult.label),
                    username: 'admin',
                    kind: state.kind_items.find(item => item.value === kind.value)?.label || kind.value,
                    startTime: state.form.startTime,
                    greenhouseId: selectedGreenhouse.value?.id
                };
                recordApi.addImgRecord(recordData).then((recordRes) => {
                    if (recordRes.code == 200 || recordRes.code == '200') {
                        console.log('记录保存成功');
                    }
                    else {
                        console.error('记录保存失败:', recordRes.msg);
                    }
                }).catch((error) => {
                    console.error('保存记录出错:', error);
                });
            }
            catch (error) {
                console.error('解析 JSON 时出错:', error);
            }
            ElMessage.success('预测成功！');
            getAISuggestion();
        }
        else {
            ElMessage.error(res.msg);
        }
    });
};
const getAISuggestion = async () => {
    if (!state.predictionResult.label) {
        ElMessage.warning('请先进行预测');
        return;
    }
    state.suggestionLoading = true;
    try {
        const apiKey = 'sk-rbwwfonuwpfdaoxcurhgdaklmyazympolaernwmsbuljzuqy';
        const cropType = state.kind_items.find(item => item.value === kind.value)?.label || kind.value;
        const diseases = Array.isArray(state.predictionResult.label)
            ? state.predictionResult.label.join('、')
            : state.predictionResult.label;
        const confidences = formatConfidenceArray(state.predictionResult.confidence).join('、');
        const prompt = `作为农作物病害专家，针对以下情况提供简要建议：

作物类型：${cropType}
检测病害：${diseases}
置信度：${confidences}

请在200字以内简要说明：
1. 病害严重性
2. 关键防治措施
3. 日常注意事项

语言简洁明了。`;
        state.markdownContent = '';
        let fullContent = '';
        const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'Pro/zai-org/GLM-4.7',
                messages: [
                    { role: 'user', content: prompt }
                ],
                stream: true
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        continue;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices[0].delta;
                        if (delta.content) {
                            fullContent += delta.content;
                            requestAnimationFrame(() => {
                                state.markdownContent = renderMarkdown(fullContent);
                            });
                        }
                    }
                    catch (e) {
                        console.error('Error parsing chunk:', e);
                    }
                }
            }
        }
        ElMessage.success('分析完成');
    }
    catch (error) {
        console.error('获取AI建议出错:', error);
        state.markdownContent = `<div class="error-message">获取建议失败：${error.message}</div>`;
        ElMessage.error('获取建议失败，请检查网络连接或API密钥是否正确');
    }
    finally {
        state.suggestionLoading = false;
    }
};
const formatLabelArray = (label) => {
    if (Array.isArray(label)) {
        return label.map(item => item.replace(/[\[\]"]/g, '').trim());
    }
    else if (typeof label === 'string') {
        return [label.replace(/[\[\]"]/g, '').trim()];
    }
    return ['未知'];
};
const formatConfidenceArray = (confidence) => {
    if (!confidence)
        return ['0%'];
    try {
        let confidences = confidence;
        if (typeof confidence === 'string') {
            confidences = JSON.parse(confidence);
        }
        if (Array.isArray(confidences)) {
            return confidences.map(conf => {
                const confValue = parseFloat(String(conf).replace(/[\[\]"%]/g, ''));
                return confValue.toFixed(2) + '%';
            });
        }
        else {
            const confValue = parseFloat(String(confidence).replace(/[\[\]"%]/g, ''));
            return [confValue.toFixed(2) + '%'];
        }
    }
    catch (error) {
        console.error('解析置信度出错:', error);
        return ['0%'];
    }
};
const formatTime = (time) => {
    if (!time)
        return '0秒';
    return parseFloat(time).toFixed(3) + '秒';
};
const triggerFileUpload = () => {
    const fileInput = document.querySelector('.avatar-uploader input[type="file"]');
    if (fileInput) {
        fileInput.click();
    }
};
const fetchGreenhouses = async () => {
    try {
        const response = await getGreenhouseList({});
        if (response.data && response.data.records) {
            greenhouses.value = response.data.records.map(item => ({
                id: item.id,
                name: item.greenhouseName
            }));
        }
    }
    catch (error) {
        console.error('获取温室列表失败:', error);
    }
};
onMounted(() => {
    getData();
    fetchGreenhouses();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['image-card']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
/** @type {__VLS_StyleScopedClasses['preview-image']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
/** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['result-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['result-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['result-placeholder']} */ ;
/** @type {__VLS_StyleScopedClasses['el-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-content']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-content']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-content']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion-content']} */ ;
/** @type {__VLS_StyleScopedClasses['image-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['result-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-row']} */ ;
/** @type {__VLS_StyleScopedClasses['slider-container']} */ ;
/** @type {__VLS_StyleScopedClasses['el-slider__button']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "img-predict-container" },
});
/** @type {__VLS_StyleScopedClasses['img-predict-container']} */ ;
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
    modelValue: (__VLS_ctx.selectedGreenhouse),
    placeholder: "请选择温室",
    ...{ style: {} },
    valueKey: "id",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.selectedGreenhouse),
    placeholder: "请选择温室",
    ...{ style: {} },
    valueKey: "id",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
for (const [greenhouse] of __VLS_vFor((__VLS_ctx.greenhouses))) {
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        key: (greenhouse.id),
        label: (greenhouse.name),
        value: (greenhouse),
    }));
    const __VLS_8 = __VLS_7({
        key: (greenhouse.id),
        label: (greenhouse.name),
        value: (greenhouse),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    // @ts-ignore
    [selectedGreenhouse, greenhouses,];
}
// @ts-ignore
[];
var __VLS_3;
let __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.kind),
    placeholder: "请选择作物种类",
    ...{ style: {} },
}));
const __VLS_13 = __VLS_12({
    ...{ 'onChange': {} },
    modelValue: (__VLS_ctx.kind),
    placeholder: "请选择作物种类",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_16;
const __VLS_17 = ({ change: {} },
    { onChange: (__VLS_ctx.getData) });
const { default: __VLS_18 } = __VLS_14.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.state.kind_items))) {
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
    [kind, getData, state,];
}
// @ts-ignore
[];
var __VLS_14;
var __VLS_15;
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.weight),
    placeholder: "请选择模型",
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.weight),
    placeholder: "请选择模型",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const { default: __VLS_29 } = __VLS_27.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.state.weight_items))) {
    let __VLS_30;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }));
    const __VLS_32 = __VLS_31({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_31));
    // @ts-ignore
    [state, weight,];
}
// @ts-ignore
[];
var __VLS_27;
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
let __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.elSlider | typeof __VLS_components.ElSlider} */
elSlider;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    modelValue: (__VLS_ctx.conf),
    formatTooltip: (__VLS_ctx.formatTooltip),
    ...{ style: {} },
}));
const __VLS_37 = __VLS_36({
    modelValue: (__VLS_ctx.conf),
    formatTooltip: (__VLS_ctx.formatTooltip),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}));
const __VLS_42 = __VLS_41({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
let __VLS_45;
const __VLS_46 = ({ click: {} },
    { onClick: (__VLS_ctx.upData) });
const { default: __VLS_47 } = __VLS_43.slots;
// @ts-ignore
[conf, conf, formatTooltip, upData,];
var __VLS_43;
var __VLS_44;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "image-section" },
});
/** @type {__VLS_StyleScopedClasses['image-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "image-grid" },
});
/** @type {__VLS_StyleScopedClasses['image-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "image-card" },
});
/** @type {__VLS_StyleScopedClasses['image-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "card-title" },
});
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.state.img),
    ref: "uploadFile",
    ...{ class: "avatar-uploader" },
    action: "http://localhost:9999/files/upload",
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccessone),
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.state.img),
    ref: "uploadFile",
    ...{ class: "avatar-uploader" },
    action: "http://localhost:9999/files/upload",
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccessone),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
var __VLS_53 = {};
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
const { default: __VLS_55 } = __VLS_51.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.triggerFileUpload) },
    ...{ class: "upload-area" },
});
/** @type {__VLS_StyleScopedClasses['upload-area']} */ ;
if (__VLS_ctx.imageUrl) {
    let __VLS_56;
    /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
    elImage;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
        src: (__VLS_ctx.imageUrl),
        ...{ class: "preview-image" },
        fit: "contain",
    }));
    const __VLS_58 = __VLS_57({
        src: (__VLS_ctx.imageUrl),
        ...{ class: "preview-image" },
        fit: "contain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    /** @type {__VLS_StyleScopedClasses['preview-image']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "upload-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['upload-placeholder']} */ ;
    let __VLS_61;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
        ...{ class: "upload-icon" },
    }));
    const __VLS_63 = __VLS_62({
        ...{ class: "upload-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_62));
    /** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
    const { default: __VLS_66 } = __VLS_64.slots;
    let __VLS_67;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({}));
    const __VLS_69 = __VLS_68({}, ...__VLS_functionalComponentArgsRest(__VLS_68));
    // @ts-ignore
    [state, handleAvatarSuccessone, triggerFileUpload, imageUrl, imageUrl,];
    var __VLS_64;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "upload-text" },
    });
    /** @type {__VLS_StyleScopedClasses['upload-text']} */ ;
}
// @ts-ignore
[];
var __VLS_51;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "image-card" },
});
/** @type {__VLS_StyleScopedClasses['image-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "card-title" },
});
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "result-area" },
});
/** @type {__VLS_StyleScopedClasses['result-area']} */ ;
if (__VLS_ctx.predictedImageUrl) {
    let __VLS_72;
    /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
    elImage;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        src: (__VLS_ctx.predictedImageUrl),
        ...{ class: "preview-image" },
        fit: "contain",
    }));
    const __VLS_74 = __VLS_73({
        src: (__VLS_ctx.predictedImageUrl),
        ...{ class: "preview-image" },
        fit: "contain",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    /** @type {__VLS_StyleScopedClasses['preview-image']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['result-placeholder']} */ ;
    let __VLS_77;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({}));
    const __VLS_79 = __VLS_78({}, ...__VLS_functionalComponentArgsRest(__VLS_78));
    const { default: __VLS_82 } = __VLS_80.slots;
    let __VLS_83;
    /** @ts-ignore @type {typeof __VLS_components.Picture} */
    Picture;
    // @ts-ignore
    const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({}));
    const __VLS_85 = __VLS_84({}, ...__VLS_functionalComponentArgsRest(__VLS_84));
    // @ts-ignore
    [predictedImageUrl, predictedImageUrl,];
    var __VLS_80;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "image-card" },
});
/** @type {__VLS_StyleScopedClasses['image-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "card-title" },
});
/** @type {__VLS_StyleScopedClasses['card-title']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "suggestion-area" },
});
/** @type {__VLS_StyleScopedClasses['suggestion-area']} */ ;
if (__VLS_ctx.state.markdownContent) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "suggestion-content" },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vHtml, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.state.markdownContent) }, null, null);
    /** @type {__VLS_StyleScopedClasses['suggestion-content']} */ ;
}
else if (__VLS_ctx.state.suggestionLoading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "loading-indicator" },
    });
    /** @type {__VLS_StyleScopedClasses['loading-indicator']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "suggestion-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['suggestion-placeholder']} */ ;
    let __VLS_88;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent1(__VLS_88, new __VLS_88({}));
    const __VLS_90 = __VLS_89({}, ...__VLS_functionalComponentArgsRest(__VLS_89));
    const { default: __VLS_93 } = __VLS_91.slots;
    let __VLS_94;
    /** @ts-ignore @type {typeof __VLS_components.ChatLineRound} */
    ChatLineRound;
    // @ts-ignore
    const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({}));
    const __VLS_96 = __VLS_95({}, ...__VLS_functionalComponentArgsRest(__VLS_95));
    // @ts-ignore
    [state, state, state,];
    var __VLS_91;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "result-section" },
});
/** @type {__VLS_StyleScopedClasses['result-section']} */ ;
if (__VLS_ctx.state.predictionResult.label) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-card" },
    });
    /** @type {__VLS_StyleScopedClasses['result-card']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-grid" },
    });
    /** @type {__VLS_StyleScopedClasses['result-grid']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-item" },
    });
    /** @type {__VLS_StyleScopedClasses['result-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "result-title" },
    });
    /** @type {__VLS_StyleScopedClasses['result-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-content" },
    });
    /** @type {__VLS_StyleScopedClasses['result-content']} */ ;
    for (const [label, index] of __VLS_vFor((__VLS_ctx.formatLabelArray(__VLS_ctx.state.predictionResult.label)))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (index),
            ...{ class: "result-value" },
        });
        /** @type {__VLS_StyleScopedClasses['result-value']} */ ;
        (label);
        // @ts-ignore
        [state, state, formatLabelArray,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-item" },
    });
    /** @type {__VLS_StyleScopedClasses['result-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "result-title" },
    });
    /** @type {__VLS_StyleScopedClasses['result-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-content" },
    });
    /** @type {__VLS_StyleScopedClasses['result-content']} */ ;
    for (const [conf, index] of __VLS_vFor((__VLS_ctx.formatConfidenceArray(__VLS_ctx.state.predictionResult.confidence)))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (index),
            ...{ class: "result-value" },
        });
        /** @type {__VLS_StyleScopedClasses['result-value']} */ ;
        (conf);
        // @ts-ignore
        [state, formatConfidenceArray,];
    }
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-item" },
    });
    /** @type {__VLS_StyleScopedClasses['result-item']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h4, __VLS_intrinsics.h4)({
        ...{ class: "result-title" },
    });
    /** @type {__VLS_StyleScopedClasses['result-title']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-content" },
    });
    /** @type {__VLS_StyleScopedClasses['result-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-value" },
    });
    /** @type {__VLS_StyleScopedClasses['result-value']} */ ;
    (__VLS_ctx.formatTime(__VLS_ctx.state.predictionResult.allTime));
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "result-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['result-placeholder']} */ ;
    let __VLS_99;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({}));
    const __VLS_101 = __VLS_100({}, ...__VLS_functionalComponentArgsRest(__VLS_100));
    const { default: __VLS_104 } = __VLS_102.slots;
    let __VLS_105;
    /** @ts-ignore @type {typeof __VLS_components.Picture} */
    Picture;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({}));
    const __VLS_107 = __VLS_106({}, ...__VLS_functionalComponentArgsRest(__VLS_106));
    // @ts-ignore
    [state, formatTime,];
    var __VLS_102;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
// @ts-ignore
var __VLS_54 = __VLS_53;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
