import { reactive, ref, nextTick, computed } from 'vue';
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
const loading = ref(false);
const currentOrder = ref(null);
// 表单数据
const form = reactive({
    id: '',
    orderId: '',
    orderNo: '',
    logisticsNo: '',
    logisticsCompany: '',
    logisticsStatus: 'pending',
    logisticsInfo: '',
    shipTime: null,
});
// 表单验证规则
const rules = {
    logisticsNo: [
        { required: true, message: '请输入物流单号', trigger: 'blur' },
        { min: 5, max: 50, message: '物流单号长度在 5 到 50 个字符', trigger: 'blur' },
    ],
    logisticsCompany: [
        { required: true, message: '请输入物流公司', trigger: 'blur' },
        { min: 2, max: 20, message: '物流公司名称长度在 2 到 20 个字符', trigger: 'blur' },
    ],
    logisticsStatus: [
        { required: true, message: '请选择物流状态', trigger: 'change' },
    ],
    logisticsInfo: [
        { required: true, message: '请输入物流信息', trigger: 'blur' },
        { min: 5, message: '物流信息长度不能少于 5 个字符', trigger: 'blur' },
    ],
};
// 对话框标题
const dialogTitle = computed(() => {
    return form.id ? '编辑物流信息' : '新增物流信息';
});
// 获取订单状态文本
const getOrderStatusText = (status) => {
    const statusMap = {
        pending: '待支付',
        paid: '已支付',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消',
    };
    return statusMap[status] || status;
};
// 打开对话框
const openDialog = async (order) => {
    currentOrder.value = order;
    dialogVisible.value = true;
    // 初始化表单数据
    nextTick(() => {
        Object.assign(form, {
            id: '',
            orderId: order.id,
            orderNo: order.orderNo,
            logisticsNo: '',
            logisticsCompany: '',
            logisticsStatus: 'pending',
            logisticsInfo: '',
            shipTime: null,
        });
    });
    // 查询现有物流信息
    if (order.id) {
        try {
            const response = await purchaseApi.getLogisticsByOrderId(order.id);
            if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
                if (response.data) {
                    const logisticsData = response.data;
                    Object.assign(form, {
                        id: logisticsData.id || '',
                        logisticsNo: logisticsData.logisticsNo || '',
                        logisticsCompany: logisticsData.logisticsCompany || '',
                        logisticsStatus: logisticsData.logisticsStatus || 'pending',
                        logisticsInfo: logisticsData.logisticsInfo || '',
                        shipTime: logisticsData.shipTime ? new Date(logisticsData.shipTime) : null,
                    });
                }
            }
        }
        catch (error) {
            console.error('获取物流信息失败:', error);
        }
    }
    // 重置表单验证
    nextTick(() => {
        formRef.value?.resetFields();
    });
};
// 关闭对话框
const closeDialog = () => {
    dialogVisible.value = false;
    currentOrder.value = null;
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
                const saveData = {
                    id: form.id,
                    orderId: form.orderId,
                    logisticsNo: form.logisticsNo,
                    logisticsCompany: form.logisticsCompany,
                    logisticsStatus: form.logisticsStatus,
                    logisticsInfo: form.logisticsInfo,
                    shipTime: form.shipTime ? form.shipTime.toISOString() : null,
                };
                let response;
                if (form.id) {
                    response = await purchaseApi.updateLogistics(saveData);
                }
                else {
                    response = await purchaseApi.addLogistics(saveData);
                }
                if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
                    // 如果物流状态是已发货/运输中/已签收，更新订单状态
                    if (['shipped', 'transporting', 'delivered'].includes(form.logisticsStatus)) {
                        try {
                            await purchaseApi.updateOrderStatus(form.orderId, 'shipped');
                        }
                        catch (e) {
                            // 订单状态更新失败不影响物流信息保存
                        }
                    }
                    ElMessage.success('物流信息保存成功');
                    closeDialog();
                    emit('refresh');
                }
                else {
                    ElMessage.error(response.msg || '保存失败');
                }
            }
            catch (error) {
                console.error('保存物流信息失败:', error);
                ElMessage.error('保存失败');
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
    width: "600px",
    destroyOnClose: true,
    closeOnClickModal: (false),
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.dialogVisible),
    title: (__VLS_ctx.dialogTitle),
    width: "600px",
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
    ...{ class: "logistics-form" },
}));
const __VLS_9 = __VLS_8({
    ref: "formRef",
    model: (__VLS_ctx.form),
    rules: (__VLS_ctx.rules),
    labelWidth: "100px",
    ...{ class: "logistics-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
var __VLS_12 = {};
/** @type {__VLS_StyleScopedClasses['logistics-form']} */ ;
const { default: __VLS_14 } = __VLS_10.slots;
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    label: "订单号",
}));
const __VLS_17 = __VLS_16({
    label: "订单号",
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
const { default: __VLS_20 } = __VLS_18.slots;
let __VLS_21;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
    modelValue: (__VLS_ctx.form.orderNo),
    disabled: true,
}));
const __VLS_23 = __VLS_22({
    modelValue: (__VLS_ctx.form.orderNo),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_22));
// @ts-ignore
[dialogVisible, dialogTitle, form, form, rules,];
var __VLS_18;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    label: "订单状态",
}));
const __VLS_28 = __VLS_27({
    label: "订单状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
const { default: __VLS_31 } = __VLS_29.slots;
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    value: (__VLS_ctx.getOrderStatusText(__VLS_ctx.currentOrder?.status)),
    disabled: true,
}));
const __VLS_34 = __VLS_33({
    value: (__VLS_ctx.getOrderStatusText(__VLS_ctx.currentOrder?.status)),
    disabled: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
// @ts-ignore
[getOrderStatusText, currentOrder,];
var __VLS_29;
let __VLS_37;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    label: "物流单号",
    prop: "logisticsNo",
}));
const __VLS_39 = __VLS_38({
    label: "物流单号",
    prop: "logisticsNo",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const { default: __VLS_42 } = __VLS_40.slots;
let __VLS_43;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    modelValue: (__VLS_ctx.form.logisticsNo),
    placeholder: "请输入物流单号",
    clearable: true,
}));
const __VLS_45 = __VLS_44({
    modelValue: (__VLS_ctx.form.logisticsNo),
    placeholder: "请输入物流单号",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
// @ts-ignore
[form,];
var __VLS_40;
let __VLS_48;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
    label: "物流公司",
    prop: "logisticsCompany",
}));
const __VLS_50 = __VLS_49({
    label: "物流公司",
    prop: "logisticsCompany",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const { default: __VLS_53 } = __VLS_51.slots;
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    modelValue: (__VLS_ctx.form.logisticsCompany),
    placeholder: "请输入物流公司",
    clearable: true,
}));
const __VLS_56 = __VLS_55({
    modelValue: (__VLS_ctx.form.logisticsCompany),
    placeholder: "请输入物流公司",
    clearable: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
// @ts-ignore
[form,];
var __VLS_51;
let __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    label: "物流状态",
    prop: "logisticsStatus",
}));
const __VLS_61 = __VLS_60({
    label: "物流状态",
    prop: "logisticsStatus",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
const { default: __VLS_64 } = __VLS_62.slots;
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    modelValue: (__VLS_ctx.form.logisticsStatus),
    placeholder: "请选择物流状态",
    ...{ style: {} },
}));
const __VLS_67 = __VLS_66({
    modelValue: (__VLS_ctx.form.logisticsStatus),
    placeholder: "请选择物流状态",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
const { default: __VLS_70 } = __VLS_68.slots;
let __VLS_71;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
    label: "待发货",
    value: "pending",
}));
const __VLS_73 = __VLS_72({
    label: "待发货",
    value: "pending",
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    label: "已发货",
    value: "shipped",
}));
const __VLS_78 = __VLS_77({
    label: "已发货",
    value: "shipped",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_81;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
    label: "运输中",
    value: "transporting",
}));
const __VLS_83 = __VLS_82({
    label: "运输中",
    value: "transporting",
}, ...__VLS_functionalComponentArgsRest(__VLS_82));
let __VLS_86;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({
    label: "已签收",
    value: "delivered",
}));
const __VLS_88 = __VLS_87({
    label: "已签收",
    value: "delivered",
}, ...__VLS_functionalComponentArgsRest(__VLS_87));
// @ts-ignore
[form,];
var __VLS_68;
// @ts-ignore
[];
var __VLS_62;
let __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
    label: "物流信息",
    prop: "logisticsInfo",
}));
const __VLS_93 = __VLS_92({
    label: "物流信息",
    prop: "logisticsInfo",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
const { default: __VLS_96 } = __VLS_94.slots;
let __VLS_97;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
    modelValue: (__VLS_ctx.form.logisticsInfo),
    type: "textarea",
    rows: (3),
    placeholder: "请输入物流信息",
}));
const __VLS_99 = __VLS_98({
    modelValue: (__VLS_ctx.form.logisticsInfo),
    type: "textarea",
    rows: (3),
    placeholder: "请输入物流信息",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
// @ts-ignore
[form,];
var __VLS_94;
let __VLS_102;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
    label: "发货时间",
}));
const __VLS_104 = __VLS_103({
    label: "发货时间",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
const { default: __VLS_107 } = __VLS_105.slots;
let __VLS_108;
/** @ts-ignore @type {typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker} */
elDatePicker;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.form.shipTime),
    type: "datetime",
    placeholder: "请选择发货时间",
    ...{ style: {} },
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.form.shipTime),
    type: "datetime",
    placeholder: "请选择发货时间",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
// @ts-ignore
[form,];
var __VLS_105;
// @ts-ignore
[];
var __VLS_10;
{
    const { footer: __VLS_113 } = __VLS_3.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "dialog-footer" },
    });
    /** @type {__VLS_StyleScopedClasses['dialog-footer']} */ ;
    let __VLS_114;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
        ...{ 'onClick': {} },
    }));
    const __VLS_116 = __VLS_115({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    let __VLS_119;
    const __VLS_120 = ({ click: {} },
        { onClick: (__VLS_ctx.closeDialog) });
    const { default: __VLS_121 } = __VLS_117.slots;
    // @ts-ignore
    [closeDialog,];
    var __VLS_117;
    var __VLS_118;
    let __VLS_122;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }));
    const __VLS_124 = __VLS_123({
        ...{ 'onClick': {} },
        type: "primary",
        loading: (__VLS_ctx.loading),
    }, ...__VLS_functionalComponentArgsRest(__VLS_123));
    let __VLS_127;
    const __VLS_128 = ({ click: {} },
        { onClick: (__VLS_ctx.onSubmit) });
    const { default: __VLS_129 } = __VLS_125.slots;
    // @ts-ignore
    [loading, onSubmit,];
    var __VLS_125;
    var __VLS_126;
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
