import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search, Plus, Edit, Delete, View, Van, Refresh } from '@element-plus/icons-vue';
import { usePurchaseApi } from '/@/api/purchase';
import SupplyDialog from './supplyDialog.vue';
import LogisticsDialog from './logisticsDialog.vue';
// API
const purchaseApi = usePurchaseApi();
// 页面标题
const pageTitle = ref('供应管理');
const pageDesc = ref('管理供应产品和订单发货');
// 当前激活的标签页
const activeTab = ref('product');
// 对话框引用
const supplyDialogRef = ref();
const logisticsDialogRef = ref();
// 订单详情弹窗
const orderDetailDialogVisible = ref(false);
const orderDetail = ref({
    order: null,
    orderItems: [],
});
// 供应产品表格数据
const productState = reactive({
    tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
            search: '',
            supplier: '',
            region: '',
            pageNum: 1,
            pageSize: 10,
        },
    },
});
// 订单发货管理数据
const orderState = reactive({
    search: {
        orderNo: '',
        status: '',
    },
    list: [],
    loading: false,
    pageNum: 1,
    pageSize: 10,
    total: 0,
});
// 获取供应产品列表
const getProductTableData = async () => {
    productState.tableData.loading = true;
    try {
        const response = await purchaseApi.getProductList({
            search: productState.tableData.param.search,
            supplier: productState.tableData.param.supplier,
            region: productState.tableData.param.region,
            pageNum: productState.tableData.param.pageNum,
            pageSize: productState.tableData.param.pageSize,
        });
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
            const data = response.data;
            if (data && data.records) {
                productState.tableData.data = data.records.map((item, index) => ({
                    ...item,
                    num: (productState.tableData.param.pageNum - 1) * productState.tableData.param.pageSize + index + 1,
                }));
                productState.tableData.total = data.total;
            }
            else {
                productState.tableData.data = [];
                productState.tableData.total = 0;
            }
        }
        else {
            ElMessage.error(response.msg || '获取产品列表失败');
            productState.tableData.data = [];
            productState.tableData.total = 0;
        }
    }
    catch (error) {
        console.error('获取产品列表失败:', error);
        ElMessage.error('获取产品列表失败');
        productState.tableData.data = [];
        productState.tableData.total = 0;
    }
    finally {
        productState.tableData.loading = false;
    }
};
// 获取订单列表
const getOrderList = async () => {
    orderState.loading = true;
    try {
        const response = await purchaseApi.getOrderList({
            orderNo: orderState.search.orderNo,
            status: orderState.search.status,
            pageNum: orderState.pageNum,
            pageSize: orderState.pageSize,
        });
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
            const data = response.data;
            if (data && data.records) {
                orderState.list = data.records;
                orderState.total = data.total;
            }
            else {
                orderState.list = [];
                orderState.total = 0;
            }
        }
        else {
            ElMessage.error(response.msg || '获取订单列表失败');
            orderState.list = [];
            orderState.total = 0;
        }
    }
    catch (error) {
        console.error('获取订单列表失败:', error);
        ElMessage.error('获取订单列表失败');
        orderState.list = [];
        orderState.total = 0;
    }
    finally {
        orderState.loading = false;
    }
};
// 打开新增供应产品弹窗
const onOpenAddSupply = () => {
    supplyDialogRef.value?.openDialog('add');
};
// 打开修改供应产品弹窗
const onOpenEditSupply = (row) => {
    supplyDialogRef.value?.openDialog('edit', row);
};
// 删除供应产品
const onRowDel = (row) => {
    ElMessageBox.confirm(`此操作将永久删除供应产品「${row.productName}」，是否继续?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
        try {
            const response = await purchaseApi.deleteProduct(row.id);
            if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
                ElMessage.success('删除成功！');
                getProductTableData();
            }
            else {
                ElMessage.error(response.msg || '删除失败');
            }
        }
        catch (error) {
            console.error('删除失败:', error);
            ElMessage.error('删除失败');
        }
    })
        .catch(() => { });
};
// 供应产品分页改变
const onProductSizeChange = (val) => {
    productState.tableData.param.pageSize = val;
    productState.tableData.param.pageNum = 1;
    getProductTableData();
};
const onProductCurrentChange = (val) => {
    productState.tableData.param.pageNum = val;
    getProductTableData();
};
// 订单分页改变
const onOrderSizeChange = (val) => {
    orderState.pageSize = val;
    orderState.pageNum = 1;
    getOrderList();
};
const onOrderCurrentChange = (val) => {
    orderState.pageNum = val;
    getOrderList();
};
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
// 获取订单状态标签类型
const getOrderStatusTagType = (status) => {
    const typeMap = {
        pending: 'warning',
        paid: 'success',
        shipped: 'info',
        completed: 'success',
        cancelled: 'danger',
    };
    return typeMap[status] || 'default';
};
// 查看订单详情
const viewOrderDetails = async (row) => {
    try {
        const response = await purchaseApi.getOrderDetail(row.id);
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
            orderDetail.value = response.data;
            orderDetailDialogVisible.value = true;
        }
        else {
            ElMessage.error(response.msg || '获取订单详情失败');
        }
    }
    catch (error) {
        console.error('获取订单详情失败:', error);
        ElMessage.error('获取订单详情失败');
    }
};
// 管理物流信息
const manageLogistics = (row) => {
    logisticsDialogRef.value?.openDialog(row);
};
// 刷新数据
const onRefresh = () => {
    if (activeTab.value === 'product') {
        getProductTableData();
    }
    else {
        getOrderList();
    }
};
// 页面加载时
onMounted(() => {
    getProductTableData();
    getOrderList();
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
/** @type {__VLS_StyleScopedClasses['supply-tabs']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['order-total']} */ ;
/** @type {__VLS_StyleScopedClasses['order-total']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
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
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs | typeof __VLS_components.elTabs | typeof __VLS_components.ElTabs} */
elTabs;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.activeTab),
    type: "border-card",
    ...{ class: "supply-tabs" },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.activeTab),
    type: "border-card",
    ...{ class: "supply-tabs" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['supply-tabs']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "供应产品管理",
    name: "product",
}));
const __VLS_8 = __VLS_7({
    label: "供应产品管理",
    name: "product",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-section" },
});
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    inline: (true),
    model: (__VLS_ctx.productState.tableData.param),
    ...{ class: "search-form" },
}));
const __VLS_14 = __VLS_13({
    inline: (true),
    model: (__VLS_ctx.productState.tableData.param),
    ...{ class: "search-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
const { default: __VLS_17 } = __VLS_15.slots;
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    label: "产品名称",
}));
const __VLS_20 = __VLS_19({
    label: "产品名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    modelValue: (__VLS_ctx.productState.tableData.param.search),
    placeholder: "请输入产品名称",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    modelValue: (__VLS_ctx.productState.tableData.param.search),
    placeholder: "请输入产品名称",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
// @ts-ignore
[pageTitle, pageDesc, activeTab, productState, productState,];
var __VLS_21;
let __VLS_29;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_30 = __VLS_asFunctionalComponent1(__VLS_29, new __VLS_29({
    label: "供货商",
}));
const __VLS_31 = __VLS_30({
    label: "供货商",
}, ...__VLS_functionalComponentArgsRest(__VLS_30));
const { default: __VLS_34 } = __VLS_32.slots;
let __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    modelValue: (__VLS_ctx.productState.tableData.param.supplier),
    placeholder: "请输入供货商",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_37 = __VLS_36({
    modelValue: (__VLS_ctx.productState.tableData.param.supplier),
    placeholder: "请输入供货商",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
// @ts-ignore
[productState,];
var __VLS_32;
let __VLS_40;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
    label: "地区",
}));
const __VLS_42 = __VLS_41({
    label: "地区",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const { default: __VLS_45 } = __VLS_43.slots;
let __VLS_46;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    modelValue: (__VLS_ctx.productState.tableData.param.region),
    placeholder: "请输入地区",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_48 = __VLS_47({
    modelValue: (__VLS_ctx.productState.tableData.param.region),
    placeholder: "请输入地区",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
// @ts-ignore
[productState,];
var __VLS_43;
let __VLS_51;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({}));
const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
const { default: __VLS_56 } = __VLS_54.slots;
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_59 = __VLS_58({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
let __VLS_62;
const __VLS_63 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.getProductTableData();
            // @ts-ignore
            [getProductTableData,];
        } });
const { default: __VLS_64 } = __VLS_60.slots;
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({}));
const __VLS_67 = __VLS_66({}, ...__VLS_functionalComponentArgsRest(__VLS_66));
const { default: __VLS_70 } = __VLS_68.slots;
let __VLS_71;
/** @ts-ignore @type {typeof __VLS_components.Search} */
Search;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({}));
const __VLS_73 = __VLS_72({}, ...__VLS_functionalComponentArgsRest(__VLS_72));
// @ts-ignore
[];
var __VLS_68;
// @ts-ignore
[];
var __VLS_60;
var __VLS_61;
let __VLS_76;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent1(__VLS_76, new __VLS_76({
    ...{ 'onClick': {} },
}));
const __VLS_78 = __VLS_77({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
let __VLS_81;
const __VLS_82 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.productState.tableData.param = { search: '', supplier: '', region: '', pageNum: 1, pageSize: 10 };
            __VLS_ctx.getProductTableData();
            // @ts-ignore
            [productState, getProductTableData,];
        } });
const { default: __VLS_83 } = __VLS_79.slots;
// @ts-ignore
[];
var __VLS_79;
var __VLS_80;
// @ts-ignore
[];
var __VLS_54;
// @ts-ignore
[];
var __VLS_15;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-section" },
});
/** @type {__VLS_StyleScopedClasses['action-section']} */ ;
let __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_86 = __VLS_85({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_89;
const __VLS_90 = ({ click: {} },
    { onClick: (__VLS_ctx.onOpenAddSupply) });
const { default: __VLS_91 } = __VLS_87.slots;
let __VLS_92;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({}));
const __VLS_94 = __VLS_93({}, ...__VLS_functionalComponentArgsRest(__VLS_93));
const { default: __VLS_97 } = __VLS_95.slots;
let __VLS_98;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({}));
const __VLS_100 = __VLS_99({}, ...__VLS_functionalComponentArgsRest(__VLS_99));
// @ts-ignore
[onOpenAddSupply,];
var __VLS_95;
// @ts-ignore
[];
var __VLS_87;
var __VLS_88;
let __VLS_103;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
    ...{ 'onClick': {} },
}));
const __VLS_105 = __VLS_104({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
let __VLS_108;
const __VLS_109 = ({ click: {} },
    { onClick: (__VLS_ctx.onRefresh) });
const { default: __VLS_110 } = __VLS_106.slots;
let __VLS_111;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({}));
const __VLS_113 = __VLS_112({}, ...__VLS_functionalComponentArgsRest(__VLS_112));
const { default: __VLS_116 } = __VLS_114.slots;
let __VLS_117;
/** @ts-ignore @type {typeof __VLS_components.Refresh} */
Refresh;
// @ts-ignore
const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({}));
const __VLS_119 = __VLS_118({}, ...__VLS_functionalComponentArgsRest(__VLS_118));
// @ts-ignore
[onRefresh,];
var __VLS_114;
// @ts-ignore
[];
var __VLS_106;
var __VLS_107;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_122;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
    data: (__VLS_ctx.productState.tableData.data),
    border: true,
    stripe: true,
    ...{ style: {} },
}));
const __VLS_124 = __VLS_123({
    data: (__VLS_ctx.productState.tableData.data),
    border: true,
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.productState.tableData.loading) }, null, null);
const { default: __VLS_127 } = __VLS_125.slots;
let __VLS_128;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
    prop: "num",
    label: "序号",
    width: "70",
    align: "center",
}));
const __VLS_130 = __VLS_129({
    prop: "num",
    label: "序号",
    width: "70",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
let __VLS_133;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
    prop: "productName",
    label: "产品名称",
    minWidth: "120",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_135 = __VLS_134({
    prop: "productName",
    label: "产品名称",
    minWidth: "120",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
let __VLS_138;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_139 = __VLS_asFunctionalComponent1(__VLS_138, new __VLS_138({
    prop: "price",
    label: "价格(元)",
    width: "100",
    align: "center",
}));
const __VLS_140 = __VLS_139({
    prop: "price",
    label: "价格(元)",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_139));
const { default: __VLS_143 } = __VLS_141.slots;
{
    const { default: __VLS_144 } = __VLS_141.slots;
    const [{ row }] = __VLS_vSlot(__VLS_144);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ style: {} },
    });
    (row.price?.toFixed(2) || '0.00');
    // @ts-ignore
    [productState, productState, vLoading,];
}
// @ts-ignore
[];
var __VLS_141;
let __VLS_145;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_146 = __VLS_asFunctionalComponent1(__VLS_145, new __VLS_145({
    prop: "stock",
    label: "库存数量",
    width: "100",
    align: "center",
}));
const __VLS_147 = __VLS_146({
    prop: "stock",
    label: "库存数量",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_146));
let __VLS_150;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({
    prop: "supplier",
    label: "供货商",
    minWidth: "120",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_152 = __VLS_151({
    prop: "supplier",
    label: "供货商",
    minWidth: "120",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_151));
let __VLS_155;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_156 = __VLS_asFunctionalComponent1(__VLS_155, new __VLS_155({
    prop: "region",
    label: "地区",
    minWidth: "100",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_157 = __VLS_156({
    prop: "region",
    label: "地区",
    minWidth: "100",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_156));
let __VLS_160;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent1(__VLS_160, new __VLS_160({
    prop: "phone",
    label: "电话",
    width: "130",
    align: "center",
}));
const __VLS_162 = __VLS_161({
    prop: "phone",
    label: "电话",
    width: "130",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
let __VLS_165;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_166 = __VLS_asFunctionalComponent1(__VLS_165, new __VLS_165({
    prop: "description",
    label: "产品描述",
    minWidth: "150",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_167 = __VLS_166({
    prop: "description",
    label: "产品描述",
    minWidth: "150",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_166));
let __VLS_170;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent1(__VLS_170, new __VLS_170({
    label: "操作",
    width: "150",
    fixed: "right",
    align: "center",
}));
const __VLS_172 = __VLS_171({
    label: "操作",
    width: "150",
    fixed: "right",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
const { default: __VLS_175 } = __VLS_173.slots;
{
    const { default: __VLS_176 } = __VLS_173.slots;
    const [{ row }] = __VLS_vSlot(__VLS_176);
    let __VLS_177;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }));
    const __VLS_179 = __VLS_178({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_178));
    let __VLS_182;
    const __VLS_183 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onOpenEditSupply(row);
                // @ts-ignore
                [onOpenEditSupply,];
            } });
    const { default: __VLS_184 } = __VLS_180.slots;
    let __VLS_185;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({}));
    const __VLS_187 = __VLS_186({}, ...__VLS_functionalComponentArgsRest(__VLS_186));
    const { default: __VLS_190 } = __VLS_188.slots;
    let __VLS_191;
    /** @ts-ignore @type {typeof __VLS_components.Edit} */
    Edit;
    // @ts-ignore
    const __VLS_192 = __VLS_asFunctionalComponent1(__VLS_191, new __VLS_191({}));
    const __VLS_193 = __VLS_192({}, ...__VLS_functionalComponentArgsRest(__VLS_192));
    // @ts-ignore
    [];
    var __VLS_188;
    // @ts-ignore
    [];
    var __VLS_180;
    var __VLS_181;
    let __VLS_196;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_197 = __VLS_asFunctionalComponent1(__VLS_196, new __VLS_196({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }));
    const __VLS_198 = __VLS_197({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_197));
    let __VLS_201;
    const __VLS_202 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onRowDel(row);
                // @ts-ignore
                [onRowDel,];
            } });
    const { default: __VLS_203 } = __VLS_199.slots;
    let __VLS_204;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_205 = __VLS_asFunctionalComponent1(__VLS_204, new __VLS_204({}));
    const __VLS_206 = __VLS_205({}, ...__VLS_functionalComponentArgsRest(__VLS_205));
    const { default: __VLS_209 } = __VLS_207.slots;
    let __VLS_210;
    /** @ts-ignore @type {typeof __VLS_components.Delete} */
    Delete;
    // @ts-ignore
    const __VLS_211 = __VLS_asFunctionalComponent1(__VLS_210, new __VLS_210({}));
    const __VLS_212 = __VLS_211({}, ...__VLS_functionalComponentArgsRest(__VLS_211));
    // @ts-ignore
    [];
    var __VLS_207;
    // @ts-ignore
    [];
    var __VLS_199;
    var __VLS_200;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_173;
// @ts-ignore
[];
var __VLS_125;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_215;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_216 = __VLS_asFunctionalComponent1(__VLS_215, new __VLS_215({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.productState.tableData.param.pageNum),
    pageSize: (__VLS_ctx.productState.tableData.param.pageSize),
    pageSizes: ([10, 20, 30, 50]),
    total: (__VLS_ctx.productState.tableData.total),
    layout: "total, sizes, prev, pager, next, jumper",
    background: true,
}));
const __VLS_217 = __VLS_216({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.productState.tableData.param.pageNum),
    pageSize: (__VLS_ctx.productState.tableData.param.pageSize),
    pageSizes: ([10, 20, 30, 50]),
    total: (__VLS_ctx.productState.tableData.total),
    layout: "total, sizes, prev, pager, next, jumper",
    background: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_216));
let __VLS_220;
const __VLS_221 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.onProductSizeChange) });
const __VLS_222 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.onProductCurrentChange) });
var __VLS_218;
var __VLS_219;
// @ts-ignore
[productState, productState, productState, onProductSizeChange, onProductCurrentChange,];
var __VLS_9;
let __VLS_223;
/** @ts-ignore @type {typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane | typeof __VLS_components.elTabPane | typeof __VLS_components.ElTabPane} */
elTabPane;
// @ts-ignore
const __VLS_224 = __VLS_asFunctionalComponent1(__VLS_223, new __VLS_223({
    label: "订单发货管理",
    name: "delivery",
}));
const __VLS_225 = __VLS_224({
    label: "订单发货管理",
    name: "delivery",
}, ...__VLS_functionalComponentArgsRest(__VLS_224));
const { default: __VLS_228 } = __VLS_226.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "tab-content" },
});
/** @type {__VLS_StyleScopedClasses['tab-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-section" },
});
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
let __VLS_229;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_230 = __VLS_asFunctionalComponent1(__VLS_229, new __VLS_229({
    inline: (true),
    model: (__VLS_ctx.orderState.search),
    ...{ class: "search-form" },
}));
const __VLS_231 = __VLS_230({
    inline: (true),
    model: (__VLS_ctx.orderState.search),
    ...{ class: "search-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_230));
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
const { default: __VLS_234 } = __VLS_232.slots;
let __VLS_235;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_236 = __VLS_asFunctionalComponent1(__VLS_235, new __VLS_235({
    label: "订单号",
}));
const __VLS_237 = __VLS_236({
    label: "订单号",
}, ...__VLS_functionalComponentArgsRest(__VLS_236));
const { default: __VLS_240 } = __VLS_238.slots;
let __VLS_241;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_242 = __VLS_asFunctionalComponent1(__VLS_241, new __VLS_241({
    modelValue: (__VLS_ctx.orderState.search.orderNo),
    placeholder: "请输入订单号",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_243 = __VLS_242({
    modelValue: (__VLS_ctx.orderState.search.orderNo),
    placeholder: "请输入订单号",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_242));
// @ts-ignore
[orderState, orderState,];
var __VLS_238;
let __VLS_246;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_247 = __VLS_asFunctionalComponent1(__VLS_246, new __VLS_246({
    label: "订单状态",
}));
const __VLS_248 = __VLS_247({
    label: "订单状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_247));
const { default: __VLS_251 } = __VLS_249.slots;
let __VLS_252;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_253 = __VLS_asFunctionalComponent1(__VLS_252, new __VLS_252({
    modelValue: (__VLS_ctx.orderState.search.status),
    placeholder: "请选择订单状态",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_254 = __VLS_253({
    modelValue: (__VLS_ctx.orderState.search.status),
    placeholder: "请选择订单状态",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_253));
const { default: __VLS_257 } = __VLS_255.slots;
let __VLS_258;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_259 = __VLS_asFunctionalComponent1(__VLS_258, new __VLS_258({
    label: "全部状态",
    value: "",
}));
const __VLS_260 = __VLS_259({
    label: "全部状态",
    value: "",
}, ...__VLS_functionalComponentArgsRest(__VLS_259));
let __VLS_263;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_264 = __VLS_asFunctionalComponent1(__VLS_263, new __VLS_263({
    label: "待支付",
    value: "pending",
}));
const __VLS_265 = __VLS_264({
    label: "待支付",
    value: "pending",
}, ...__VLS_functionalComponentArgsRest(__VLS_264));
let __VLS_268;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_269 = __VLS_asFunctionalComponent1(__VLS_268, new __VLS_268({
    label: "已支付",
    value: "paid",
}));
const __VLS_270 = __VLS_269({
    label: "已支付",
    value: "paid",
}, ...__VLS_functionalComponentArgsRest(__VLS_269));
let __VLS_273;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_274 = __VLS_asFunctionalComponent1(__VLS_273, new __VLS_273({
    label: "已发货",
    value: "shipped",
}));
const __VLS_275 = __VLS_274({
    label: "已发货",
    value: "shipped",
}, ...__VLS_functionalComponentArgsRest(__VLS_274));
let __VLS_278;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_279 = __VLS_asFunctionalComponent1(__VLS_278, new __VLS_278({
    label: "已完成",
    value: "completed",
}));
const __VLS_280 = __VLS_279({
    label: "已完成",
    value: "completed",
}, ...__VLS_functionalComponentArgsRest(__VLS_279));
let __VLS_283;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_284 = __VLS_asFunctionalComponent1(__VLS_283, new __VLS_283({
    label: "已取消",
    value: "cancelled",
}));
const __VLS_285 = __VLS_284({
    label: "已取消",
    value: "cancelled",
}, ...__VLS_functionalComponentArgsRest(__VLS_284));
// @ts-ignore
[orderState,];
var __VLS_255;
// @ts-ignore
[];
var __VLS_249;
let __VLS_288;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_289 = __VLS_asFunctionalComponent1(__VLS_288, new __VLS_288({}));
const __VLS_290 = __VLS_289({}, ...__VLS_functionalComponentArgsRest(__VLS_289));
const { default: __VLS_293 } = __VLS_291.slots;
let __VLS_294;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_295 = __VLS_asFunctionalComponent1(__VLS_294, new __VLS_294({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_296 = __VLS_295({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_295));
let __VLS_299;
const __VLS_300 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.getOrderList();
            // @ts-ignore
            [getOrderList,];
        } });
const { default: __VLS_301 } = __VLS_297.slots;
let __VLS_302;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_303 = __VLS_asFunctionalComponent1(__VLS_302, new __VLS_302({}));
const __VLS_304 = __VLS_303({}, ...__VLS_functionalComponentArgsRest(__VLS_303));
const { default: __VLS_307 } = __VLS_305.slots;
let __VLS_308;
/** @ts-ignore @type {typeof __VLS_components.Search} */
Search;
// @ts-ignore
const __VLS_309 = __VLS_asFunctionalComponent1(__VLS_308, new __VLS_308({}));
const __VLS_310 = __VLS_309({}, ...__VLS_functionalComponentArgsRest(__VLS_309));
// @ts-ignore
[];
var __VLS_305;
// @ts-ignore
[];
var __VLS_297;
var __VLS_298;
let __VLS_313;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_314 = __VLS_asFunctionalComponent1(__VLS_313, new __VLS_313({
    ...{ 'onClick': {} },
}));
const __VLS_315 = __VLS_314({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_314));
let __VLS_318;
const __VLS_319 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.orderState.search = { orderNo: '', status: '' };
            __VLS_ctx.getOrderList();
            // @ts-ignore
            [orderState, getOrderList,];
        } });
const { default: __VLS_320 } = __VLS_316.slots;
// @ts-ignore
[];
var __VLS_316;
var __VLS_317;
// @ts-ignore
[];
var __VLS_291;
// @ts-ignore
[];
var __VLS_232;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-section" },
});
/** @type {__VLS_StyleScopedClasses['action-section']} */ ;
let __VLS_321;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_322 = __VLS_asFunctionalComponent1(__VLS_321, new __VLS_321({
    ...{ 'onClick': {} },
}));
const __VLS_323 = __VLS_322({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_322));
let __VLS_326;
const __VLS_327 = ({ click: {} },
    { onClick: (__VLS_ctx.onRefresh) });
const { default: __VLS_328 } = __VLS_324.slots;
let __VLS_329;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_330 = __VLS_asFunctionalComponent1(__VLS_329, new __VLS_329({}));
const __VLS_331 = __VLS_330({}, ...__VLS_functionalComponentArgsRest(__VLS_330));
const { default: __VLS_334 } = __VLS_332.slots;
let __VLS_335;
/** @ts-ignore @type {typeof __VLS_components.Refresh} */
Refresh;
// @ts-ignore
const __VLS_336 = __VLS_asFunctionalComponent1(__VLS_335, new __VLS_335({}));
const __VLS_337 = __VLS_336({}, ...__VLS_functionalComponentArgsRest(__VLS_336));
// @ts-ignore
[onRefresh,];
var __VLS_332;
// @ts-ignore
[];
var __VLS_324;
var __VLS_325;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_340;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_341 = __VLS_asFunctionalComponent1(__VLS_340, new __VLS_340({
    data: (__VLS_ctx.orderState.list),
    border: true,
    stripe: true,
    ...{ style: {} },
}));
const __VLS_342 = __VLS_341({
    data: (__VLS_ctx.orderState.list),
    border: true,
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_341));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.orderState.loading) }, null, null);
const { default: __VLS_345 } = __VLS_343.slots;
let __VLS_346;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_347 = __VLS_asFunctionalComponent1(__VLS_346, new __VLS_346({
    prop: "orderNo",
    label: "订单号",
    minWidth: "180",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_348 = __VLS_347({
    prop: "orderNo",
    label: "订单号",
    minWidth: "180",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_347));
let __VLS_351;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_352 = __VLS_asFunctionalComponent1(__VLS_351, new __VLS_351({
    prop: "totalPrice",
    label: "总价(元)",
    width: "120",
    align: "center",
}));
const __VLS_353 = __VLS_352({
    prop: "totalPrice",
    label: "总价(元)",
    width: "120",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_352));
const { default: __VLS_356 } = __VLS_354.slots;
{
    const { default: __VLS_357 } = __VLS_354.slots;
    const [{ row }] = __VLS_vSlot(__VLS_357);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ style: {} },
    });
    (row.totalPrice?.toFixed(2) || '0.00');
    // @ts-ignore
    [vLoading, orderState, orderState,];
}
// @ts-ignore
[];
var __VLS_354;
let __VLS_358;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_359 = __VLS_asFunctionalComponent1(__VLS_358, new __VLS_358({
    prop: "status",
    label: "订单状态",
    width: "100",
    align: "center",
}));
const __VLS_360 = __VLS_359({
    prop: "status",
    label: "订单状态",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_359));
const { default: __VLS_363 } = __VLS_361.slots;
{
    const { default: __VLS_364 } = __VLS_361.slots;
    const [{ row }] = __VLS_vSlot(__VLS_364);
    let __VLS_365;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_366 = __VLS_asFunctionalComponent1(__VLS_365, new __VLS_365({
        type: (__VLS_ctx.getOrderStatusTagType(row.status)),
    }));
    const __VLS_367 = __VLS_366({
        type: (__VLS_ctx.getOrderStatusTagType(row.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_366));
    const { default: __VLS_370 } = __VLS_368.slots;
    (__VLS_ctx.getOrderStatusText(row.status));
    // @ts-ignore
    [getOrderStatusTagType, getOrderStatusText,];
    var __VLS_368;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_361;
let __VLS_371;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_372 = __VLS_asFunctionalComponent1(__VLS_371, new __VLS_371({
    prop: "orderTime",
    label: "下单时间",
    width: "180",
    align: "center",
}));
const __VLS_373 = __VLS_372({
    prop: "orderTime",
    label: "下单时间",
    width: "180",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_372));
let __VLS_376;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_377 = __VLS_asFunctionalComponent1(__VLS_376, new __VLS_376({
    prop: "logisticsStatus",
    label: "物流信息",
    minWidth: "200",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_378 = __VLS_377({
    prop: "logisticsStatus",
    label: "物流信息",
    minWidth: "200",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_377));
let __VLS_381;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_382 = __VLS_asFunctionalComponent1(__VLS_381, new __VLS_381({
    label: "操作",
    width: "200",
    fixed: "right",
    align: "center",
}));
const __VLS_383 = __VLS_382({
    label: "操作",
    width: "200",
    fixed: "right",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_382));
const { default: __VLS_386 } = __VLS_384.slots;
{
    const { default: __VLS_387 } = __VLS_384.slots;
    const [{ row }] = __VLS_vSlot(__VLS_387);
    let __VLS_388;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_389 = __VLS_asFunctionalComponent1(__VLS_388, new __VLS_388({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }));
    const __VLS_390 = __VLS_389({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_389));
    let __VLS_393;
    const __VLS_394 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.viewOrderDetails(row);
                // @ts-ignore
                [viewOrderDetails,];
            } });
    const { default: __VLS_395 } = __VLS_391.slots;
    let __VLS_396;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_397 = __VLS_asFunctionalComponent1(__VLS_396, new __VLS_396({}));
    const __VLS_398 = __VLS_397({}, ...__VLS_functionalComponentArgsRest(__VLS_397));
    const { default: __VLS_401 } = __VLS_399.slots;
    let __VLS_402;
    /** @ts-ignore @type {typeof __VLS_components.View} */
    View;
    // @ts-ignore
    const __VLS_403 = __VLS_asFunctionalComponent1(__VLS_402, new __VLS_402({}));
    const __VLS_404 = __VLS_403({}, ...__VLS_functionalComponentArgsRest(__VLS_403));
    // @ts-ignore
    [];
    var __VLS_399;
    // @ts-ignore
    [];
    var __VLS_391;
    var __VLS_392;
    if (row.status === 'paid') {
        let __VLS_407;
        /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
        elButton;
        // @ts-ignore
        const __VLS_408 = __VLS_asFunctionalComponent1(__VLS_407, new __VLS_407({
            ...{ 'onClick': {} },
            link: true,
            type: "success",
            size: "small",
        }));
        const __VLS_409 = __VLS_408({
            ...{ 'onClick': {} },
            link: true,
            type: "success",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_408));
        let __VLS_412;
        const __VLS_413 = ({ click: {} },
            { onClick: (...[$event]) => {
                    if (!(row.status === 'paid'))
                        return;
                    __VLS_ctx.manageLogistics(row);
                    // @ts-ignore
                    [manageLogistics,];
                } });
        const { default: __VLS_414 } = __VLS_410.slots;
        let __VLS_415;
        /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
        elIcon;
        // @ts-ignore
        const __VLS_416 = __VLS_asFunctionalComponent1(__VLS_415, new __VLS_415({}));
        const __VLS_417 = __VLS_416({}, ...__VLS_functionalComponentArgsRest(__VLS_416));
        const { default: __VLS_420 } = __VLS_418.slots;
        let __VLS_421;
        /** @ts-ignore @type {typeof __VLS_components.Van} */
        Van;
        // @ts-ignore
        const __VLS_422 = __VLS_asFunctionalComponent1(__VLS_421, new __VLS_421({}));
        const __VLS_423 = __VLS_422({}, ...__VLS_functionalComponentArgsRest(__VLS_422));
        // @ts-ignore
        [];
        var __VLS_418;
        // @ts-ignore
        [];
        var __VLS_410;
        var __VLS_411;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_384;
// @ts-ignore
[];
var __VLS_343;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_426;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_427 = __VLS_asFunctionalComponent1(__VLS_426, new __VLS_426({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.orderState.pageNum),
    pageSize: (__VLS_ctx.orderState.pageSize),
    pageSizes: ([10, 20, 30, 50]),
    total: (__VLS_ctx.orderState.total),
    layout: "total, sizes, prev, pager, next, jumper",
    background: true,
}));
const __VLS_428 = __VLS_427({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.orderState.pageNum),
    pageSize: (__VLS_ctx.orderState.pageSize),
    pageSizes: ([10, 20, 30, 50]),
    total: (__VLS_ctx.orderState.total),
    layout: "total, sizes, prev, pager, next, jumper",
    background: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_427));
let __VLS_431;
const __VLS_432 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.onOrderSizeChange) });
const __VLS_433 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.onOrderCurrentChange) });
var __VLS_429;
var __VLS_430;
// @ts-ignore
[orderState, orderState, orderState, onOrderSizeChange, onOrderCurrentChange,];
var __VLS_226;
// @ts-ignore
[];
var __VLS_3;
const __VLS_434 = SupplyDialog;
// @ts-ignore
const __VLS_435 = __VLS_asFunctionalComponent1(__VLS_434, new __VLS_434({
    ...{ 'onRefresh': {} },
    ref: "supplyDialogRef",
}));
const __VLS_436 = __VLS_435({
    ...{ 'onRefresh': {} },
    ref: "supplyDialogRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_435));
let __VLS_439;
const __VLS_440 = ({ refresh: {} },
    { onRefresh: (__VLS_ctx.getProductTableData) });
var __VLS_441 = {};
var __VLS_437;
var __VLS_438;
const __VLS_443 = LogisticsDialog;
// @ts-ignore
const __VLS_444 = __VLS_asFunctionalComponent1(__VLS_443, new __VLS_443({
    ...{ 'onRefresh': {} },
    ref: "logisticsDialogRef",
}));
const __VLS_445 = __VLS_444({
    ...{ 'onRefresh': {} },
    ref: "logisticsDialogRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_444));
let __VLS_448;
const __VLS_449 = ({ refresh: {} },
    { onRefresh: (__VLS_ctx.getOrderList) });
var __VLS_450 = {};
var __VLS_446;
var __VLS_447;
let __VLS_452;
/** @ts-ignore @type {typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog | typeof __VLS_components.elDialog | typeof __VLS_components.ElDialog} */
elDialog;
// @ts-ignore
const __VLS_453 = __VLS_asFunctionalComponent1(__VLS_452, new __VLS_452({
    modelValue: (__VLS_ctx.orderDetailDialogVisible),
    title: "订单详情",
    width: "800px",
    destroyOnClose: true,
}));
const __VLS_454 = __VLS_453({
    modelValue: (__VLS_ctx.orderDetailDialogVisible),
    title: "订单详情",
    width: "800px",
    destroyOnClose: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_453));
const { default: __VLS_457 } = __VLS_455.slots;
if (__VLS_ctx.orderDetail.order) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "order-detail" },
    });
    /** @type {__VLS_StyleScopedClasses['order-detail']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    let __VLS_458;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions | typeof __VLS_components.elDescriptions | typeof __VLS_components.ElDescriptions} */
    elDescriptions;
    // @ts-ignore
    const __VLS_459 = __VLS_asFunctionalComponent1(__VLS_458, new __VLS_458({
        column: (2),
        border: true,
    }));
    const __VLS_460 = __VLS_459({
        column: (2),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_459));
    const { default: __VLS_463 } = __VLS_461.slots;
    let __VLS_464;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_465 = __VLS_asFunctionalComponent1(__VLS_464, new __VLS_464({
        label: "订单号",
    }));
    const __VLS_466 = __VLS_465({
        label: "订单号",
    }, ...__VLS_functionalComponentArgsRest(__VLS_465));
    const { default: __VLS_469 } = __VLS_467.slots;
    (__VLS_ctx.orderDetail.order.id);
    // @ts-ignore
    [getProductTableData, getOrderList, orderDetailDialogVisible, orderDetail, orderDetail,];
    var __VLS_467;
    let __VLS_470;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_471 = __VLS_asFunctionalComponent1(__VLS_470, new __VLS_470({
        label: "订单状态",
    }));
    const __VLS_472 = __VLS_471({
        label: "订单状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_471));
    const { default: __VLS_475 } = __VLS_473.slots;
    let __VLS_476;
    /** @ts-ignore @type {typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components.elTag | typeof __VLS_components.ElTag} */
    elTag;
    // @ts-ignore
    const __VLS_477 = __VLS_asFunctionalComponent1(__VLS_476, new __VLS_476({
        type: (__VLS_ctx.getOrderStatusTagType(__VLS_ctx.orderDetail.order.status)),
    }));
    const __VLS_478 = __VLS_477({
        type: (__VLS_ctx.getOrderStatusTagType(__VLS_ctx.orderDetail.order.status)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_477));
    const { default: __VLS_481 } = __VLS_479.slots;
    (__VLS_ctx.getOrderStatusText(__VLS_ctx.orderDetail.order.status));
    // @ts-ignore
    [getOrderStatusTagType, getOrderStatusText, orderDetail, orderDetail,];
    var __VLS_479;
    // @ts-ignore
    [];
    var __VLS_473;
    let __VLS_482;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_483 = __VLS_asFunctionalComponent1(__VLS_482, new __VLS_482({
        label: "下单时间",
    }));
    const __VLS_484 = __VLS_483({
        label: "下单时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_483));
    const { default: __VLS_487 } = __VLS_485.slots;
    (__VLS_ctx.orderDetail.order.orderTime);
    // @ts-ignore
    [orderDetail,];
    var __VLS_485;
    let __VLS_488;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_489 = __VLS_asFunctionalComponent1(__VLS_488, new __VLS_488({
        label: "支付时间",
    }));
    const __VLS_490 = __VLS_489({
        label: "支付时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_489));
    const { default: __VLS_493 } = __VLS_491.slots;
    (__VLS_ctx.orderDetail.order.paidTime || '-');
    // @ts-ignore
    [orderDetail,];
    var __VLS_491;
    let __VLS_494;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_495 = __VLS_asFunctionalComponent1(__VLS_494, new __VLS_494({
        label: "发货时间",
    }));
    const __VLS_496 = __VLS_495({
        label: "发货时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_495));
    const { default: __VLS_499 } = __VLS_497.slots;
    (__VLS_ctx.orderDetail.order.shippedTime || '-');
    // @ts-ignore
    [orderDetail,];
    var __VLS_497;
    let __VLS_500;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_501 = __VLS_asFunctionalComponent1(__VLS_500, new __VLS_500({
        label: "完成时间",
    }));
    const __VLS_502 = __VLS_501({
        label: "完成时间",
    }, ...__VLS_functionalComponentArgsRest(__VLS_501));
    const { default: __VLS_505 } = __VLS_503.slots;
    (__VLS_ctx.orderDetail.order.completedTime || '-');
    // @ts-ignore
    [orderDetail,];
    var __VLS_503;
    let __VLS_506;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_507 = __VLS_asFunctionalComponent1(__VLS_506, new __VLS_506({
        label: "联系电话",
    }));
    const __VLS_508 = __VLS_507({
        label: "联系电话",
    }, ...__VLS_functionalComponentArgsRest(__VLS_507));
    const { default: __VLS_511 } = __VLS_509.slots;
    (__VLS_ctx.orderDetail.order.phone);
    // @ts-ignore
    [orderDetail,];
    var __VLS_509;
    let __VLS_512;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_513 = __VLS_asFunctionalComponent1(__VLS_512, new __VLS_512({
        label: "收货地址",
        span: (2),
    }));
    const __VLS_514 = __VLS_513({
        label: "收货地址",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_513));
    const { default: __VLS_517 } = __VLS_515.slots;
    (__VLS_ctx.orderDetail.order.address);
    // @ts-ignore
    [orderDetail,];
    var __VLS_515;
    let __VLS_518;
    /** @ts-ignore @type {typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem | typeof __VLS_components.elDescriptionsItem | typeof __VLS_components.ElDescriptionsItem} */
    elDescriptionsItem;
    // @ts-ignore
    const __VLS_519 = __VLS_asFunctionalComponent1(__VLS_518, new __VLS_518({
        label: "备注",
        span: (2),
    }));
    const __VLS_520 = __VLS_519({
        label: "备注",
        span: (2),
    }, ...__VLS_functionalComponentArgsRest(__VLS_519));
    const { default: __VLS_523 } = __VLS_521.slots;
    (__VLS_ctx.orderDetail.order.remark || '-');
    // @ts-ignore
    [orderDetail,];
    var __VLS_521;
    // @ts-ignore
    [];
    var __VLS_461;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "detail-section" },
    });
    /** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
    let __VLS_524;
    /** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
    elTable;
    // @ts-ignore
    const __VLS_525 = __VLS_asFunctionalComponent1(__VLS_524, new __VLS_524({
        data: (__VLS_ctx.orderDetail.orderItems),
        border: true,
        size: "small",
    }));
    const __VLS_526 = __VLS_525({
        data: (__VLS_ctx.orderDetail.orderItems),
        border: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_525));
    const { default: __VLS_529 } = __VLS_527.slots;
    let __VLS_530;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_531 = __VLS_asFunctionalComponent1(__VLS_530, new __VLS_530({
        prop: "productName",
        label: "商品名称",
        minWidth: "150",
        showOverflowTooltip: true,
    }));
    const __VLS_532 = __VLS_531({
        prop: "productName",
        label: "商品名称",
        minWidth: "150",
        showOverflowTooltip: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_531));
    let __VLS_535;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_536 = __VLS_asFunctionalComponent1(__VLS_535, new __VLS_535({
        prop: "productDescription",
        label: "商品描述",
        minWidth: "150",
        showOverflowTooltip: true,
    }));
    const __VLS_537 = __VLS_536({
        prop: "productDescription",
        label: "商品描述",
        minWidth: "150",
        showOverflowTooltip: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_536));
    let __VLS_540;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_541 = __VLS_asFunctionalComponent1(__VLS_540, new __VLS_540({
        prop: "quantity",
        label: "数量",
        width: "80",
        align: "center",
    }));
    const __VLS_542 = __VLS_541({
        prop: "quantity",
        label: "数量",
        width: "80",
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_541));
    let __VLS_545;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_546 = __VLS_asFunctionalComponent1(__VLS_545, new __VLS_545({
        prop: "price",
        label: "单价(元)",
        width: "100",
        align: "right",
    }));
    const __VLS_547 = __VLS_546({
        prop: "price",
        label: "单价(元)",
        width: "100",
        align: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_546));
    const { default: __VLS_550 } = __VLS_548.slots;
    {
        const { default: __VLS_551 } = __VLS_548.slots;
        const [{ row }] = __VLS_vSlot(__VLS_551);
        (row.price?.toFixed(2) || '0.00');
        // @ts-ignore
        [orderDetail,];
    }
    // @ts-ignore
    [];
    var __VLS_548;
    let __VLS_552;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_553 = __VLS_asFunctionalComponent1(__VLS_552, new __VLS_552({
        label: "小计(元)",
        width: "100",
        align: "right",
    }));
    const __VLS_554 = __VLS_553({
        label: "小计(元)",
        width: "100",
        align: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_553));
    const { default: __VLS_557 } = __VLS_555.slots;
    {
        const { default: __VLS_558 } = __VLS_555.slots;
        const [{ row }] = __VLS_vSlot(__VLS_558);
        ((row.price * row.quantity).toFixed(2));
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_555;
    // @ts-ignore
    [];
    var __VLS_527;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "order-total" },
    });
    /** @type {__VLS_StyleScopedClasses['order-total']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "label" },
    });
    /** @type {__VLS_StyleScopedClasses['label']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "value" },
    });
    /** @type {__VLS_StyleScopedClasses['value']} */ ;
    (__VLS_ctx.orderDetail.order.totalPrice?.toFixed(2) || '0.00');
}
{
    const { footer: __VLS_559 } = __VLS_455.slots;
    let __VLS_560;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_561 = __VLS_asFunctionalComponent1(__VLS_560, new __VLS_560({
        ...{ 'onClick': {} },
    }));
    const __VLS_562 = __VLS_561({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_561));
    let __VLS_565;
    const __VLS_566 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.orderDetailDialogVisible = false;
                // @ts-ignore
                [orderDetailDialogVisible, orderDetail,];
            } });
    const { default: __VLS_567 } = __VLS_563.slots;
    // @ts-ignore
    [];
    var __VLS_563;
    var __VLS_564;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_455;
// @ts-ignore
var __VLS_442 = __VLS_441, __VLS_451 = __VLS_450;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
