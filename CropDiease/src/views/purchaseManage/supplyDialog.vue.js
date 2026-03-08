import { reactive, ref, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { usePurchaseApi } from '/@/api/purchase';
// API
const purchaseApi = usePurchaseApi();
// 定义事件
const emit = defineEmits(['refresh']);
// 表单引用
const formRef = ref();
// 对话框状态
const dialogVisible = ref(false);
const dialogType = ref('add');
const dialogTitle = ref('');
const submitText = ref('');
const loading = ref(false);
// 表单数据
const form = reactive({
    id: null,
    productName: '',
    price: 0,
    stock: 0,
    supplier: '',
    region: '',
    phone: '',
    description: '',
});
// 表单验证规则
const rules = {
    productName: [
        { required: true, message: '请输入产品名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    ],
    price: [
        { required: true, message: '请输入价格', trigger: 'blur' },
        { type: 'number', min: 0, message: '价格不能小于0', trigger: 'blur' },
    ],
    stock: [
        { required: true, message: '请输入库存数量', trigger: 'blur' },
        { type: 'number', min: 0, message: '库存不能小于0', trigger: 'blur' },
    ],
    supplier: [
        { required: true, message: '请输入供货商', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
    ],
    region: [
        { required: true, message: '请输入地区', trigger: 'blur' },
    ],
    phone: [
        { required: true, message: '请输入电话', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$/, message: '请输入正确的电话号码', trigger: 'blur' },
    ],
    description: [
        { max: 200, message: '描述不能超过200个字符', trigger: 'blur' },
    ],
};
// 打开对话框
const openDialog = (type, row) => {
    dialogType.value = type;
    dialogVisible.value = true;
    if (type === 'edit' && row) {
        dialogTitle.value = '修改供应产品';
        submitText.value = '保存';
        nextTick(() => {
            Object.assign(form, {
                id: row.id,
                productName: row.productName,
                price: row.price,
                stock: row.stock,
                supplier: row.supplier,
                region: row.region,
                phone: row.phone,
                description: row.description,
            });
        });
    }
    else {
        dialogTitle.value = '新增供应产品';
        submitText.value = '添加';
        nextTick(() => {
            Object.assign(form, {
                id: null,
                productName: '',
                price: 0,
                stock: 0,
                supplier: '',
                region: '',
                phone: '',
                description: '',
            });
        });
    }
    // 重置表单验证
    nextTick(() => {
        formRef.value?.resetFields();
    });
};
// 关闭对话框
const closeDialog = () => {
    dialogVisible.value = false;
    formRef.value?.resetFields();
};
// 提交表单
const onSubmit = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                let response;
                if (dialogType.value === 'edit') {
                    response = await purchaseApi.updateProduct(form);
                }
                else {
                    response = await purchaseApi.addProduct(form);
                }
                if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
                    ElMessage.success(dialogType.value === 'edit' ? '修改成功！' : '添加成功！');
                    closeDialog();
                    emit('refresh');
                }
                else {
                    ElMessage.error(response.msg || '操作失败');
                }
            }
            catch (error) {
                console.error('提交失败:', error);
                ElMessage.error('操作失败');
            }
            finally {
                loading.value = false;
            }
        }
    });
};
// 暴露方法
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
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogTitle),
    width: "700px",
    destroyOnClose: true,
    closeOnClickModal: (false),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogTitle),
    width: "700px",
    destroyOnClose: true,
    closeOnClickModal: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5 = {};
const { default: __VLS_6 } = __VLS_3.slots;
let __VLS_7;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelWidth: "100px",
    ...{ class: "supply-form" },
}));
const __VLS_9 = __VLS_8({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelWidth: "100px",
    ...{ class: "supply-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
var __VLS_12 = {};
/** @type {__VLS_StyleScopedClasses['supply-form']} */ ;
const { default: __VLS_14 } = __VLS_10.slots;
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    gutter: (20),
}));
const __VLS_17 = __VLS_16({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_20 } = __VLS_18.slots;
let __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    span: (12),
}));
const __VLS_23 = __VLS_22({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
const { default: __VLS_26 } = __VLS_24.slots;
let __VLS_27;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_28 = __VLS_asFunctionalComponent1(__VLS_27, new __VLS_27({
    label: "产品名称",
    prop: "productName",
}));
const __VLS_29 = __VLS_28({
    label: "产品名称",
    prop: "productName",
}, ...__VLS_functionalComponentArgsRest(__VLS_28));
const { default: __VLS_32 } = __VLS_30.slots;
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    modelValue: (__VLS_ctx.form.productName),
    placeholder: "请输入产品名称",
    clearable: true,
}));
const __VLS_35 = __VLS_34({
    modelValue: (__VLS_ctx.form.productName),
    placeholder: "请输入产品名称",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
// @ts-ignore
[dialogVisible, dialogTitle, form, form, rules,];
var __VLS_30;
// @ts-ignore
[];
var __VLS_24;
let __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    span: (12),
}));
const __VLS_40 = __VLS_39({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
const { default: __VLS_43 } = __VLS_41.slots;
let __VLS_44;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent1(__VLS_44, new __VLS_44({
    label: "供货商",
    prop: "supplier",
}));
const __VLS_46 = __VLS_45({
    label: "供货商",
    prop: "supplier",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const { default: __VLS_49 } = __VLS_47.slots;
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({
    modelValue: (__VLS_ctx.form.supplier),
    placeholder: "请输入供货商",
    clearable: true,
}));
const __VLS_52 = __VLS_51({
    modelValue: (__VLS_ctx.form.supplier),
    placeholder: "请输入供货商",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_51));
// @ts-ignore
[form,];
var __VLS_47;
// @ts-ignore
[];
var __VLS_41;
// @ts-ignore
[];
var __VLS_18;
let __VLS_55;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    gutter: (20),
}));
const __VLS_57 = __VLS_56({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
const { default: __VLS_60 } = __VLS_58.slots;
let __VLS_61;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
    span: (12),
}));
const __VLS_63 = __VLS_62({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
const { default: __VLS_66 } = __VLS_64.slots;
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    label: "价格",
    prop: "price",
}));
const __VLS_69 = __VLS_68({
    label: "价格",
    prop: "price",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const { default: __VLS_72 } = __VLS_70.slots;
let __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    modelValue: (__VLS_ctx.form.price),
    precision: (2),
    step: (0.01),
    min: (0),
    ...{ style: {} },
    placeholder: "请输入价格",
}));
const __VLS_75 = __VLS_74({
    modelValue: (__VLS_ctx.form.price),
    precision: (2),
    step: (0.01),
    min: (0),
    ...{ style: {} },
    placeholder: "请输入价格",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
// @ts-ignore
[form,];
var __VLS_70;
// @ts-ignore
[];
var __VLS_64;
let __VLS_78;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    span: (12),
}));
const __VLS_80 = __VLS_79({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
const { default: __VLS_83 } = __VLS_81.slots;
let __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    label: "库存数量",
    prop: "stock",
}));
const __VLS_86 = __VLS_85({
    label: "库存数量",
    prop: "stock",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
const { default: __VLS_89 } = __VLS_87.slots;
let __VLS_90;
/** @ts-ignore @type {typeof __VLS_components.elInputNumber | typeof __VLS_components.ElInputNumber} */
elInputNumber;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    modelValue: (__VLS_ctx.form.stock),
    min: (0),
    step: (1),
    ...{ style: {} },
    placeholder: "请输入库存",
}));
const __VLS_92 = __VLS_91({
    modelValue: (__VLS_ctx.form.stock),
    min: (0),
    step: (1),
    ...{ style: {} },
    placeholder: "请输入库存",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
// @ts-ignore
[form,];
var __VLS_87;
// @ts-ignore
[];
var __VLS_81;
// @ts-ignore
[];
var __VLS_58;
let __VLS_95;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
    gutter: (20),
}));
const __VLS_97 = __VLS_96({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_96));
const { default: __VLS_100 } = __VLS_98.slots;
let __VLS_101;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
    span: (12),
}));
const __VLS_103 = __VLS_102({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
const { default: __VLS_106 } = __VLS_104.slots;
let __VLS_107;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
    label: "地区",
    prop: "region",
}));
const __VLS_109 = __VLS_108({
    label: "地区",
    prop: "region",
}, ...__VLS_functionalComponentArgsRest(__VLS_108));
const { default: __VLS_112 } = __VLS_110.slots;
let __VLS_113;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    modelValue: (__VLS_ctx.form.region),
    placeholder: "请输入地区",
    clearable: true,
}));
const __VLS_115 = __VLS_114({
    modelValue: (__VLS_ctx.form.region),
    placeholder: "请输入地区",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
// @ts-ignore
[form,];
var __VLS_110;
// @ts-ignore
[];
var __VLS_104;
let __VLS_118;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
    span: (12),
}));
const __VLS_120 = __VLS_119({
    span: (12),
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
const { default: __VLS_123 } = __VLS_121.slots;
let __VLS_124;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent1(__VLS_124, new __VLS_124({
    label: "电话",
    prop: "phone",
}));
const __VLS_126 = __VLS_125({
    label: "电话",
    prop: "phone",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
const { default: __VLS_129 } = __VLS_127.slots;
let __VLS_130;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_131 = __VLS_asFunctionalComponent1(__VLS_130, new __VLS_130({
    modelValue: (__VLS_ctx.form.phone),
    placeholder: "请输入电话",
    clearable: true,
}));
const __VLS_132 = __VLS_131({
    modelValue: (__VLS_ctx.form.phone),
    placeholder: "请输入电话",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_131));
// @ts-ignore
[form,];
var __VLS_127;
// @ts-ignore
[];
var __VLS_121;
// @ts-ignore
[];
var __VLS_98;
let __VLS_135;
/** @ts-ignore @type {typeof __VLS_components.elRow | typeof __VLS_components.ElRow | typeof __VLS_components.elRow | typeof __VLS_components.ElRow} */
elRow;
// @ts-ignore
const __VLS_136 = __VLS_asFunctionalComponent1(__VLS_135, new __VLS_135({
    gutter: (20),
}));
const __VLS_137 = __VLS_136({
    gutter: (20),
}, ...__VLS_functionalComponentArgsRest(__VLS_136));
const { default: __VLS_140 } = __VLS_138.slots;
let __VLS_141;
/** @ts-ignore @type {typeof __VLS_components.elCol | typeof __VLS_components.ElCol | typeof __VLS_components.elCol | typeof __VLS_components.ElCol} */
elCol;
// @ts-ignore
const __VLS_142 = __VLS_asFunctionalComponent1(__VLS_141, new __VLS_141({
    span: (24),
}));
const __VLS_143 = __VLS_142({
    span: (24),
}, ...__VLS_functionalComponentArgsRest(__VLS_142));
const { default: __VLS_146 } = __VLS_144.slots;
let __VLS_147;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
    label: "产品描述",
    prop: "description",
}));
const __VLS_149 = __VLS_148({
    label: "产品描述",
    prop: "description",
}, ...__VLS_functionalComponentArgsRest(__VLS_148));
const { default: __VLS_152 } = __VLS_150.slots;
let __VLS_153;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_154 = __VLS_asFunctionalComponent1(__VLS_153, new __VLS_153({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "请输入产品描述",
    maxlength: "200",
    showWordLimit: true,
}));
const __VLS_155 = __VLS_154({
    modelValue: (__VLS_ctx.form.description),
    type: "textarea",
    rows: (3),
    placeholder: "请输入产品描述",
    maxlength: "200",
    showWordLimit: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_154));
// @ts-ignore
[form,];
var __VLS_150;
// @ts-ignore
[];
var __VLS_144;
// @ts-ignore
[];
var __VLS_138;
// @ts-ignore
[];
var __VLS_10;
{
    const { footer: __VLS_158 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_159;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({
        ...{ 'onClick': {} },
    }));
    const __VLS_161 = __VLS_160({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_160));
    let __VLS_164;
    const __VLS_165 = ({ click: {} },
        { onClick: (__VLS_ctx.closeDialog) });
    const { default: __VLS_166 } = __VLS_162.slots;
    // @ts-ignore
    [closeDialog,];
    var __VLS_162;
    var __VLS_163;
    let __VLS_167;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_168 = __VLS_asFunctionalComponent1(__VLS_167, new __VLS_167({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_169 = __VLS_168({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_168));
    let __VLS_172;
    const __VLS_173 = ({ click: {} },
        { onClick: (__VLS_ctx.onSubmit) });
    const { default: __VLS_174 } = __VLS_170.slots;
    (__VLS_ctx.submitText);
    // @ts-ignore
    [loading, onSubmit, submitText,];
    var __VLS_170;
    var __VLS_171;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_13 = __VLS_12;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => (__VLS_exposed),
    emits: {},
});
export default {};
