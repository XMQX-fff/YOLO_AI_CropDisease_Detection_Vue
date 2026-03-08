import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search, Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue';
import { usePurchaseApi } from '/@/api/purchase';
import PurchaseDialog from './dialog.vue';
// API
const purchaseApi = usePurchaseApi();
// 页面标题
const pageTitle = ref('农资采购');
const pageDesc = ref('管理农作物生产所需的农资采购信息');
// 对话框引用
const purchaseDialogRef = ref();
// 表格数据状态
const state = reactive({
    tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
            search: '',
            supplier: '',
            region: '',
            manager: '',
            pageNum: 1,
            pageSize: 10,
        },
    },
});
// 获取表格数据
const getTableData = async () => {
    state.tableData.loading = true;
    try {
        const response = await purchaseApi.getPurchaseList({
            search: state.tableData.param.search,
            supplier: state.tableData.param.supplier,
            region: state.tableData.param.region,
            manager: state.tableData.param.manager,
            pageNum: state.tableData.param.pageNum,
            pageSize: state.tableData.param.pageSize,
        });
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
            const data = response.data;
            if (data && data.records) {
                state.tableData.data = data.records.map((item, index) => ({
                    ...item,
                    num: (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize + index + 1,
                }));
                state.tableData.total = data.total;
            }
            else {
                state.tableData.data = [];
                state.tableData.total = 0;
            }
        }
        else {
            ElMessage.error(response.msg || '获取数据失败');
            state.tableData.data = [];
            state.tableData.total = 0;
        }
    }
    catch (error) {
        console.error('获取采购数据失败:', error);
        ElMessage.error('获取数据失败');
        state.tableData.data = [];
        state.tableData.total = 0;
    }
    finally {
        state.tableData.loading = false;
    }
};
// 打开新增采购弹窗
const onOpenAddPurchase = () => {
    purchaseDialogRef.value?.openDialog('add');
};
// 打开修改采购弹窗
const onOpenEditPurchase = (row) => {
    purchaseDialogRef.value?.openDialog('edit', row);
};
// 删除采购
const onRowDel = (row) => {
    ElMessageBox.confirm(`此操作将永久删除采购信息「${row.productName}」，是否继续?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
        try {
            const response = await purchaseApi.deletePurchase(row.id);
            if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
                ElMessage.success('删除成功！');
                getTableData();
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
// 分页大小改变
const onHandleSizeChange = (val) => {
    state.tableData.param.pageSize = val;
    state.tableData.param.pageNum = 1;
    getTableData();
};
// 分页页码改变
const onHandleCurrentChange = (val) => {
    state.tableData.param.pageNum = val;
    getTableData();
};
// 刷新数据
const onRefresh = () => {
    getTableData();
};
// 页面加载时
onMounted(() => {
    getTableData();
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "search-section" },
});
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    inline: (true),
    model: (__VLS_ctx.state.tableData.param),
    ...{ class: "search-form" },
}));
const __VLS_2 = __VLS_1({
    inline: (true),
    model: (__VLS_ctx.state.tableData.param),
    ...{ class: "search-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['search-form']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    label: "产品名称",
}));
const __VLS_8 = __VLS_7({
    label: "产品名称",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.state.tableData.param.search),
    placeholder: "请输入产品名称",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.state.tableData.param.search),
    placeholder: "请输入产品名称",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
// @ts-ignore
[pageTitle, pageDesc, state, state,];
var __VLS_9;
let __VLS_17;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({
    label: "供货商",
}));
const __VLS_19 = __VLS_18({
    label: "供货商",
}, ...__VLS_functionalComponentArgsRest(__VLS_18));
const { default: __VLS_22 } = __VLS_20.slots;
let __VLS_23;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({
    modelValue: (__VLS_ctx.state.tableData.param.supplier),
    placeholder: "请输入供货商",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_25 = __VLS_24({
    modelValue: (__VLS_ctx.state.tableData.param.supplier),
    placeholder: "请输入供货商",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_24));
// @ts-ignore
[state,];
var __VLS_20;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({
    label: "地区",
}));
const __VLS_30 = __VLS_29({
    label: "地区",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const { default: __VLS_33 } = __VLS_31.slots;
let __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({
    modelValue: (__VLS_ctx.state.tableData.param.region),
    placeholder: "请输入地区",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_36 = __VLS_35({
    modelValue: (__VLS_ctx.state.tableData.param.region),
    placeholder: "请输入地区",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_35));
// @ts-ignore
[state,];
var __VLS_31;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    label: "采购人",
}));
const __VLS_41 = __VLS_40({
    label: "采购人",
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
const { default: __VLS_44 } = __VLS_42.slots;
let __VLS_45;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
    modelValue: (__VLS_ctx.state.tableData.param.manager),
    placeholder: "请输入采购人",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_47 = __VLS_46({
    modelValue: (__VLS_ctx.state.tableData.param.manager),
    placeholder: "请输入采购人",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_46));
// @ts-ignore
[state,];
var __VLS_42;
let __VLS_50;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_51 = __VLS_asFunctionalComponent1(__VLS_50, new __VLS_50({}));
const __VLS_52 = __VLS_51({}, ...__VLS_functionalComponentArgsRest(__VLS_51));
const { default: __VLS_55 } = __VLS_53.slots;
let __VLS_56;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_58 = __VLS_57({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
let __VLS_61;
const __VLS_62 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.getTableData();
            // @ts-ignore
            [getTableData,];
        } });
const { default: __VLS_63 } = __VLS_59.slots;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({}));
const __VLS_66 = __VLS_65({}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const { default: __VLS_69 } = __VLS_67.slots;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.Search} */
Search;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({}));
const __VLS_72 = __VLS_71({}, ...__VLS_functionalComponentArgsRest(__VLS_71));
// @ts-ignore
[];
var __VLS_67;
// @ts-ignore
[];
var __VLS_59;
var __VLS_60;
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    ...{ 'onClick': {} },
}));
const __VLS_77 = __VLS_76({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
let __VLS_80;
const __VLS_81 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.state.tableData.param = { search: '', supplier: '', region: '', manager: '', pageNum: 1, pageSize: 10 };
            __VLS_ctx.getTableData();
            // @ts-ignore
            [state, getTableData,];
        } });
const { default: __VLS_82 } = __VLS_78.slots;
// @ts-ignore
[];
var __VLS_78;
var __VLS_79;
// @ts-ignore
[];
var __VLS_53;
// @ts-ignore
[];
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "action-section" },
});
/** @type {__VLS_StyleScopedClasses['action-section']} */ ;
let __VLS_83;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_84 = __VLS_asFunctionalComponent1(__VLS_83, new __VLS_83({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_85 = __VLS_84({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_84));
let __VLS_88;
const __VLS_89 = ({ click: {} },
    { onClick: (__VLS_ctx.onOpenAddPurchase) });
const { default: __VLS_90 } = __VLS_86.slots;
let __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({}));
const __VLS_93 = __VLS_92({}, ...__VLS_functionalComponentArgsRest(__VLS_92));
const { default: __VLS_96 } = __VLS_94.slots;
let __VLS_97;
/** @ts-ignore @type {typeof __VLS_components.Plus} */
Plus;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({}));
const __VLS_99 = __VLS_98({}, ...__VLS_functionalComponentArgsRest(__VLS_98));
// @ts-ignore
[onOpenAddPurchase,];
var __VLS_94;
// @ts-ignore
[];
var __VLS_86;
var __VLS_87;
let __VLS_102;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
    ...{ 'onClick': {} },
}));
const __VLS_104 = __VLS_103({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
let __VLS_107;
const __VLS_108 = ({ click: {} },
    { onClick: (__VLS_ctx.onRefresh) });
const { default: __VLS_109 } = __VLS_105.slots;
let __VLS_110;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({}));
const __VLS_112 = __VLS_111({}, ...__VLS_functionalComponentArgsRest(__VLS_111));
const { default: __VLS_115 } = __VLS_113.slots;
let __VLS_116;
/** @ts-ignore @type {typeof __VLS_components.Refresh} */
Refresh;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent1(__VLS_116, new __VLS_116({}));
const __VLS_118 = __VLS_117({}, ...__VLS_functionalComponentArgsRest(__VLS_117));
// @ts-ignore
[onRefresh,];
var __VLS_113;
// @ts-ignore
[];
var __VLS_105;
var __VLS_106;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_121;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({
    data: (__VLS_ctx.state.tableData.data),
    border: true,
    stripe: true,
    ...{ style: {} },
}));
const __VLS_123 = __VLS_122({
    data: (__VLS_ctx.state.tableData.data),
    border: true,
    stripe: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_122));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.state.tableData.loading) }, null, null);
const { default: __VLS_126 } = __VLS_124.slots;
let __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
    prop: "num",
    label: "序号",
    width: "70",
    align: "center",
}));
const __VLS_129 = __VLS_128({
    prop: "num",
    label: "序号",
    width: "70",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
let __VLS_132;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({
    prop: "productName",
    label: "产品名称",
    minWidth: "120",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_134 = __VLS_133({
    prop: "productName",
    label: "产品名称",
    minWidth: "120",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
let __VLS_137;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
    prop: "price",
    label: "价格(元)",
    width: "100",
    align: "center",
}));
const __VLS_139 = __VLS_138({
    prop: "price",
    label: "价格(元)",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
const { default: __VLS_142 } = __VLS_140.slots;
{
    const { default: __VLS_143 } = __VLS_140.slots;
    const [{ row }] = __VLS_vSlot(__VLS_143);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ style: {} },
    });
    (row.price?.toFixed(2) || '0.00');
    // @ts-ignore
    [state, state, vLoading,];
}
// @ts-ignore
[];
var __VLS_140;
let __VLS_144;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent1(__VLS_144, new __VLS_144({
    prop: "quantity",
    label: "采购数量",
    width: "100",
    align: "center",
}));
const __VLS_146 = __VLS_145({
    prop: "quantity",
    label: "采购数量",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_149;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_150 = __VLS_asFunctionalComponent1(__VLS_149, new __VLS_149({
    prop: "supplier",
    label: "供货商",
    minWidth: "120",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_151 = __VLS_150({
    prop: "supplier",
    label: "供货商",
    minWidth: "120",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_150));
let __VLS_154;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_155 = __VLS_asFunctionalComponent1(__VLS_154, new __VLS_154({
    prop: "region",
    label: "地区",
    minWidth: "100",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_156 = __VLS_155({
    prop: "region",
    label: "地区",
    minWidth: "100",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_155));
let __VLS_159;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_160 = __VLS_asFunctionalComponent1(__VLS_159, new __VLS_159({
    prop: "phone",
    label: "电话",
    width: "130",
    align: "center",
}));
const __VLS_161 = __VLS_160({
    prop: "phone",
    label: "电话",
    width: "130",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_160));
let __VLS_164;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
    prop: "manager",
    label: "采购人",
    width: "100",
    align: "center",
}));
const __VLS_166 = __VLS_165({
    prop: "manager",
    label: "采购人",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_165));
let __VLS_169;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({
    prop: "remark",
    label: "备注",
    minWidth: "150",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_171 = __VLS_170({
    prop: "remark",
    label: "备注",
    minWidth: "150",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_170));
let __VLS_174;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_175 = __VLS_asFunctionalComponent1(__VLS_174, new __VLS_174({
    label: "操作",
    width: "150",
    fixed: "right",
    align: "center",
}));
const __VLS_176 = __VLS_175({
    label: "操作",
    width: "150",
    fixed: "right",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_175));
const { default: __VLS_179 } = __VLS_177.slots;
{
    const { default: __VLS_180 } = __VLS_177.slots;
    const [{ row }] = __VLS_vSlot(__VLS_180);
    let __VLS_181;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_182 = __VLS_asFunctionalComponent1(__VLS_181, new __VLS_181({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }));
    const __VLS_183 = __VLS_182({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_182));
    let __VLS_186;
    const __VLS_187 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onOpenEditPurchase(row);
                // @ts-ignore
                [onOpenEditPurchase,];
            } });
    const { default: __VLS_188 } = __VLS_184.slots;
    let __VLS_189;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_190 = __VLS_asFunctionalComponent1(__VLS_189, new __VLS_189({}));
    const __VLS_191 = __VLS_190({}, ...__VLS_functionalComponentArgsRest(__VLS_190));
    const { default: __VLS_194 } = __VLS_192.slots;
    let __VLS_195;
    /** @ts-ignore @type {typeof __VLS_components.Edit} */
    Edit;
    // @ts-ignore
    const __VLS_196 = __VLS_asFunctionalComponent1(__VLS_195, new __VLS_195({}));
    const __VLS_197 = __VLS_196({}, ...__VLS_functionalComponentArgsRest(__VLS_196));
    // @ts-ignore
    [];
    var __VLS_192;
    // @ts-ignore
    [];
    var __VLS_184;
    var __VLS_185;
    let __VLS_200;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_201 = __VLS_asFunctionalComponent1(__VLS_200, new __VLS_200({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }));
    const __VLS_202 = __VLS_201({
        ...{ 'onClick': {} },
        link: true,
        type: "danger",
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_201));
    let __VLS_205;
    const __VLS_206 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onRowDel(row);
                // @ts-ignore
                [onRowDel,];
            } });
    const { default: __VLS_207 } = __VLS_203.slots;
    let __VLS_208;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_209 = __VLS_asFunctionalComponent1(__VLS_208, new __VLS_208({}));
    const __VLS_210 = __VLS_209({}, ...__VLS_functionalComponentArgsRest(__VLS_209));
    const { default: __VLS_213 } = __VLS_211.slots;
    let __VLS_214;
    /** @ts-ignore @type {typeof __VLS_components.Delete} */
    Delete;
    // @ts-ignore
    const __VLS_215 = __VLS_asFunctionalComponent1(__VLS_214, new __VLS_214({}));
    const __VLS_216 = __VLS_215({}, ...__VLS_functionalComponentArgsRest(__VLS_215));
    // @ts-ignore
    [];
    var __VLS_211;
    // @ts-ignore
    [];
    var __VLS_203;
    var __VLS_204;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_177;
// @ts-ignore
[];
var __VLS_124;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "pagination" },
});
/** @type {__VLS_StyleScopedClasses['pagination']} */ ;
let __VLS_219;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_220 = __VLS_asFunctionalComponent1(__VLS_219, new __VLS_219({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.state.tableData.param.pageNum),
    pageSize: (__VLS_ctx.state.tableData.param.pageSize),
    pageSizes: ([10, 20, 30, 50]),
    total: (__VLS_ctx.state.tableData.total),
    layout: "total, sizes, prev, pager, next, jumper",
    background: true,
}));
const __VLS_221 = __VLS_220({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    currentPage: (__VLS_ctx.state.tableData.param.pageNum),
    pageSize: (__VLS_ctx.state.tableData.param.pageSize),
    pageSizes: ([10, 20, 30, 50]),
    total: (__VLS_ctx.state.tableData.total),
    layout: "total, sizes, prev, pager, next, jumper",
    background: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_220));
let __VLS_224;
const __VLS_225 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.onHandleSizeChange) });
const __VLS_226 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.onHandleCurrentChange) });
var __VLS_222;
var __VLS_223;
const __VLS_227 = PurchaseDialog;
// @ts-ignore
const __VLS_228 = __VLS_asFunctionalComponent1(__VLS_227, new __VLS_227({
    ...{ 'onRefresh': {} },
    ref: "purchaseDialogRef",
}));
const __VLS_229 = __VLS_228({
    ...{ 'onRefresh': {} },
    ref: "purchaseDialogRef",
}, ...__VLS_functionalComponentArgsRest(__VLS_228));
let __VLS_232;
const __VLS_233 = ({ refresh: {} },
    { onRefresh: (__VLS_ctx.getTableData) });
var __VLS_234 = {};
var __VLS_230;
var __VLS_231;
// @ts-ignore
var __VLS_235 = __VLS_234;
// @ts-ignore
[state, state, state, getTableData, onHandleSizeChange, onHandleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
