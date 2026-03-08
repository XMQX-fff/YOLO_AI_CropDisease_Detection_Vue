import { nextTick, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useDiseaseApi } from '/@/api/disease';
const diseaseApi = useDiseaseApi();
// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);
const imageUrl = ref('');
const uploadFile = ref();
// 定义作物类型数据
const cropTypes = [
    { value: '玉米', label: '玉米' },
    { value: '小麦', label: '小麦' },
    { value: '水稻', label: '水稻' },
    { value: '马铃薯', label: '马铃薯' },
    { value: '棉花', label: '棉花' },
    { value: '苹果', label: '苹果' },
    { value: '葡萄', label: '葡萄' },
    { value: '番茄', label: '番茄' },
    { value: '草莓', label: '草莓' }
];
// 定义变量内容
const diseaseDialogFormRef = ref();
const state = reactive({
    form: {
        id: null,
        cropType: '',
        name: '',
        symptoms: '',
        causes: '',
        prevention: '',
        images: ''
    },
    dialog: {
        isShowDialog: false,
        type: '',
        title: '',
        submitTxt: '',
    },
});
// 打开弹窗
const openDialog = (type, row) => {
    if (type === 'edit') {
        state.form = { ...row };
        state.dialog.title = '修改病害信息';
        state.dialog.submitTxt = '修 改';
        imageUrl.value = state.form.images;
    }
    else {
        state.dialog.title = '新增病害信息';
        state.dialog.submitTxt = '新 增';
        // 清空表单
        nextTick(() => {
            uploadFile.value.clearFiles();
            imageUrl.value = '';
            state.form = {
                id: null,
                cropType: '',
                name: '',
                symptoms: '',
                causes: '',
                prevention: '',
                images: ''
            };
        });
    }
    state.dialog.isShowDialog = true;
};
// 关闭弹窗
const closeDialog = () => {
    state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
    closeDialog();
};
// 提交
const onSubmit = () => {
    if (state.dialog.title === '修改病害信息') {
        diseaseApi.updateDisease(state.form).then((res) => {
            if (res.code == 0) {
                ElMessage.success('修改成功！');
                setTimeout(() => {
                    closeDialog();
                    emit('refresh');
                }, 500);
            }
            else {
                ElMessage({
                    type: 'error',
                    message: res.msg,
                });
            }
        }).catch(error => {
            ElMessage({
                type: 'error',
                message: '修改失败：' + error.message,
            });
        });
    }
    else {
        diseaseApi.addDisease(state.form).then((res) => {
            if (res.code == 0) {
                ElMessage.success('添加成功！');
            }
            else {
                ElMessage({
                    type: 'error',
                    message: res.msg,
                });
            }
            setTimeout(() => {
                closeDialog();
                emit('refresh');
            }, 500);
        }).catch(error => {
            ElMessage({
                type: 'error',
                message: '添加失败：' + error.message,
            });
        });
    }
};
// 图片上传成功
const handleAvatarSuccess = (response, uploadFile) => {
    imageUrl.value = URL.createObjectURL(uploadFile.raw);
    state.form.images = response.data;
};
// 暴露变量
const __VLS_exposed = {
    openDialog,
};
defineExpose(__VLS_exposed);
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['is-focus']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "system-role-dialog-container" },
});
/** @type {__VLS_StyleScopedClasses['system-role-dialog-container']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    title: (__VLS_ctx.state.dialog.title),
    modelValue: (__VLS_ctx.state.dialog.isShowDialog),
    width: "900px",
    ...{ class: "dia" },
}));
const __VLS_2 = __VLS_1({
    title: (__VLS_ctx.state.dialog.title),
    modelValue: (__VLS_ctx.state.dialog.isShowDialog),
    width: "900px",
    ...{ class: "dia" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['dia']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    ref: "diseaseDialogFormRef",
    model: (__VLS_ctx.state.form),
    size: "default",
    labelWidth: "90px",
}));
const __VLS_8 = __VLS_7({
    ref: "diseaseDialogFormRef",
    model: (__VLS_ctx.state.form),
    size: "default",
    labelWidth: "90px",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
var __VLS_11 = {};
const { default: __VLS_13 } = __VLS_9.slots;
let __VLS_14;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    gutter: (20),
}));
const __VLS_16 = __VLS_15({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
const { default: __VLS_19 } = __VLS_17.slots;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    span: (12),
    ...{ class: "mb20" },
}));
const __VLS_22 = __VLS_21({
    span: (12),
    ...{ class: "mb20" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
/** @type {__VLS_StyleScopedClasses['mb20']} */ ;
const { default: __VLS_25 } = __VLS_23.slots;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    label: "作物类型",
}));
const __VLS_28 = __VLS_27({
    label: "作物类型",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
const { default: __VLS_31 } = __VLS_29.slots;
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    modelValue: (__VLS_ctx.state.form.cropType),
    placeholder: "请选择作物类型",
    ...{ style: {} },
}));
const __VLS_34 = __VLS_33({
    modelValue: (__VLS_ctx.state.form.cropType),
    placeholder: "请选择作物类型",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const { default: __VLS_37 } = __VLS_35.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.cropTypes))) {
    let __VLS_38;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }));
    const __VLS_40 = __VLS_39({
        key: (item.value),
        label: (item.label),
        value: (item.value),
    }, ...__VLS_functionalComponentArgsRest(__VLS_39));
    // @ts-ignore
    [state, state, state, state, cropTypes,];
}
// @ts-ignore
[];
var __VLS_35;
// @ts-ignore
[];
var __VLS_29;
// @ts-ignore
[];
var __VLS_23;
let __VLS_43;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    span: (12),
    ...{ class: "mb20" },
}));
const __VLS_45 = __VLS_44({
    span: (12),
    ...{ class: "mb20" },
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
/** @type {__VLS_StyleScopedClasses['mb20']} */ ;
const { default: __VLS_48 } = __VLS_46.slots;
let __VLS_49;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    label: "病害名称",
}));
const __VLS_51 = __VLS_50({
    label: "病害名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
const { default: __VLS_54 } = __VLS_52.slots;
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    modelValue: (__VLS_ctx.state.form.name),
    placeholder: "请输入病害名称",
    clearable: true,
}));
const __VLS_57 = __VLS_56({
    modelValue: (__VLS_ctx.state.form.name),
    placeholder: "请输入病害名称",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
// @ts-ignore
[state,];
var __VLS_52;
// @ts-ignore
[];
var __VLS_46;
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    span: (24),
    ...{ class: "mb20" },
}));
const __VLS_62 = __VLS_61({
    span: (24),
    ...{ class: "mb20" },
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
/** @type {__VLS_StyleScopedClasses['mb20']} */ ;
const { default: __VLS_65 } = __VLS_63.slots;
let __VLS_66;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
    label: "病害症状",
}));
const __VLS_68 = __VLS_67({
    label: "病害症状",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
const { default: __VLS_71 } = __VLS_69.slots;
let __VLS_72;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
    type: "textarea",
    modelValue: (__VLS_ctx.state.form.symptoms),
    placeholder: "请输入病害症状",
    rows: (6),
}));
const __VLS_74 = __VLS_73({
    type: "textarea",
    modelValue: (__VLS_ctx.state.form.symptoms),
    placeholder: "请输入病害症状",
    rows: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
// @ts-ignore
[state,];
var __VLS_69;
// @ts-ignore
[];
var __VLS_63;
let __VLS_77;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
    span: (24),
    ...{ class: "mb20" },
}));
const __VLS_79 = __VLS_78({
    span: (24),
    ...{ class: "mb20" },
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
/** @type {__VLS_StyleScopedClasses['mb20']} */ ;
const { default: __VLS_82 } = __VLS_80.slots;
let __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
    label: "发病原因",
}));
const __VLS_85 = __VLS_84({
    label: "发病原因",
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
const { default: __VLS_88 } = __VLS_86.slots;
let __VLS_89;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
    type: "textarea",
    modelValue: (__VLS_ctx.state.form.causes),
    placeholder: "请输入发病原因",
    rows: (3),
}));
const __VLS_91 = __VLS_90({
    type: "textarea",
    modelValue: (__VLS_ctx.state.form.causes),
    placeholder: "请输入发病原因",
    rows: (3),
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
// @ts-ignore
[state,];
var __VLS_86;
// @ts-ignore
[];
var __VLS_80;
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    span: (24),
    ...{ class: "mb20" },
}));
const __VLS_96 = __VLS_95({
    span: (24),
    ...{ class: "mb20" },
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
/** @type {__VLS_StyleScopedClasses['mb20']} */ ;
const { default: __VLS_99 } = __VLS_97.slots;
let __VLS_100;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent1(__VLS_100, new __VLS_100({
    label: "防治方法",
}));
const __VLS_102 = __VLS_101({
    label: "防治方法",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
const { default: __VLS_105 } = __VLS_103.slots;
let __VLS_106;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_107 = __VLS_asFunctionalComponent1(__VLS_106, new __VLS_106({
    type: "textarea",
    modelValue: (__VLS_ctx.state.form.prevention),
    placeholder: "请输入防治方法",
    rows: (6),
}));
const __VLS_108 = __VLS_107({
    type: "textarea",
    modelValue: (__VLS_ctx.state.form.prevention),
    placeholder: "请输入防治方法",
    rows: (6),
}, ...__VLS_functionalComponentArgsRest(__VLS_107));
// @ts-ignore
[state,];
var __VLS_103;
// @ts-ignore
[];
var __VLS_97;
let __VLS_111;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
    span: (24),
    ...{ class: "mb20" },
}));
const __VLS_113 = __VLS_112({
    span: (24),
    ...{ class: "mb20" },
}, ...__VLS_functionalComponentArgsRest(__VLS_112));
/** @type {__VLS_StyleScopedClasses['mb20']} */ ;
const { default: __VLS_116 } = __VLS_114.slots;
let __VLS_117;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
    label: "图片",
}));
const __VLS_119 = __VLS_118({
    label: "图片",
}, ...__VLS_functionalComponentArgsRest(__VLS_118));
const { default: __VLS_122 } = __VLS_120.slots;
let __VLS_123;
/** @ts-ignore @type {typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload | typeof __VLS_components.elUpload | typeof __VLS_components.ElUpload} */
elUpload;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
    ref: "uploadFile",
    ...{ class: "avatar-uploader" },
    action: "http://localhost:9999/files/upload",
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccess),
}));
const __VLS_125 = __VLS_124({
    ref: "uploadFile",
    ...{ class: "avatar-uploader" },
    action: "http://localhost:9999/files/upload",
    showFileList: (false),
    onSuccess: (__VLS_ctx.handleAvatarSuccess),
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
var __VLS_128 = {};
/** @type {__VLS_StyleScopedClasses['avatar-uploader']} */ ;
const { default: __VLS_130 } = __VLS_126.slots;
if (__VLS_ctx.imageUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.imageUrl),
        ...{ class: "avatar" },
    });
    /** @type {__VLS_StyleScopedClasses['avatar']} */ ;
}
else {
    let __VLS_131;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
        ...{ class: "avatar-uploader-icon" },
    }));
    const __VLS_133 = __VLS_132({
        ...{ class: "avatar-uploader-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_132));
    /** @type {__VLS_StyleScopedClasses['avatar-uploader-icon']} */ ;
    const { default: __VLS_136 } = __VLS_134.slots;
    let __VLS_137;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({}));
    const __VLS_139 = __VLS_138({}, ...__VLS_functionalComponentArgsRest(__VLS_138));
    // @ts-ignore
    [handleAvatarSuccess, imageUrl, imageUrl,];
    var __VLS_134;
}
// @ts-ignore
[];
var __VLS_126;
// @ts-ignore
[];
var __VLS_120;
// @ts-ignore
[];
var __VLS_114;
// @ts-ignore
[];
var __VLS_17;
// @ts-ignore
[];
var __VLS_9;
{
    const { footer: __VLS_142 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_143;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
        ...{ 'onClick': {} },
        size: "default",
    }));
    const __VLS_145 = __VLS_144({
        ...{ 'onClick': {} },
        size: "default",
    }, ...__VLS_functionalComponentArgsRest(__VLS_144));
    let __VLS_148;
    const __VLS_149 = ({ click: {} },
        { onClick: (__VLS_ctx.onCancel) });
    const { default: __VLS_150 } = __VLS_146.slots;
    // @ts-ignore
    [onCancel,];
    var __VLS_146;
    var __VLS_147;
    let __VLS_151;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_152 = __VLS_asFunctionalComponent1(__VLS_151, new __VLS_151({
        ...{ 'onClick': {} },
        type: "primary",
        size: "default",
    }));
    const __VLS_153 = __VLS_152({
        ...{ 'onClick': {} },
        type: "primary",
        size: "default",
    }, ...__VLS_functionalComponentArgsRest(__VLS_152));
    let __VLS_156;
    const __VLS_157 = ({ click: {} },
        { onClick: (__VLS_ctx.onSubmit) });
    const { default: __VLS_158 } = __VLS_154.slots;
    (__VLS_ctx.state.dialog.submitTxt);
    // @ts-ignore
    [state, onSubmit,];
    var __VLS_154;
    var __VLS_155;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_12 = __VLS_11, __VLS_129 = __VLS_128;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => (__VLS_exposed),
    emits: {},
});
export default {};
