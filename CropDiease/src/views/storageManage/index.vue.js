import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useStorageApi } from '/@/api/storage';
// 定义变量内容
const storageDialogRef = ref();
const storageApi = useStorageApi();
const state = reactive({
    tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
            search: '',
            warehouse: '',
            storageArea: '',
            manager: '',
            phone: '',
            pageNum: 1,
            pageSize: 10,
        },
    },
});
// 使用API获取数据
const getTableData = async () => {
    state.tableData.loading = true;
    try {
        const response = await storageApi.getStorageList({
            ...state.tableData.param,
            page: state.tableData.param.pageNum,
            limit: state.tableData.param.pageSize
        });
        const data = response.data;
        if (data && data.records) {
            state.tableData.data = data.records.map((item, index) => ({
                ...item,
                num: (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize + index + 1,
                product: item.product || ''
            }));
            state.tableData.total = data.total || 0;
        }
        else {
            state.tableData.data = [];
            state.tableData.total = 0;
            ElMessage({
                type: 'warning',
                message: '未获取到数据',
            });
        }
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '获取数据失败',
        });
        console.error('获取库存数据失败:', error);
        state.tableData.data = [];
        state.tableData.total = 0;
    }
    finally {
        state.tableData.loading = false;
    }
};
// 打开新增库存弹窗
const onOpenAddStorage = async (type) => {
    try {
        // 这里可以打开添加库存的表单
        ElMessage({
            type: 'info',
            message: '添加库存信息功能开发中',
        });
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '操作失败',
        });
    }
};
// 打开修改库存弹窗
const onOpenEditStorage = async (type, row) => {
    try {
        // 这里可以打开修改库存的表单
        ElMessage({
            type: 'info',
            message: '修改库存信息功能开发中',
        });
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '操作失败',
        });
    }
};
// 删除库存
const onRowDel = async (row) => {
    ElMessageBox.confirm(`此操作将永久删除该库存信息，是否继续?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
        try {
            await storageApi.deleteStorage(row.id);
            ElMessage({
                type: 'success',
                message: '删除成功！',
            });
            getTableData();
        }
        catch (error) {
            ElMessage({
                type: 'error',
                message: '删除失败',
            });
        }
    })
        .catch(() => { });
};
// 分页改变
const onHandleSizeChange = (val) => {
    state.tableData.param.pageSize = val;
    getTableData();
};
// 分页改变
const onHandleCurrentChange = (val) => {
    state.tableData.param.pageNum = val;
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
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input']} */ ;
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
/** @type {__VLS_StyleScopedClasses['el-button']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "storage-manage-container" },
});
/** @type {__VLS_StyleScopedClasses['storage-manage-container']} */ ;
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
    ...{ class: "search-section" },
});
/** @type {__VLS_StyleScopedClasses['search-section']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.state.tableData.param.search),
    size: "default",
    placeholder: "请输入产品名称",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.state.tableData.param.search),
    size: "default",
    placeholder: "请输入产品名称",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.state.tableData.param.warehouse),
    size: "default",
    placeholder: "请输入仓库",
    ...{ class: "ml10" },
    ...{ style: {} },
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.state.tableData.param.warehouse),
    size: "default",
    placeholder: "请输入仓库",
    ...{ class: "ml10" },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
let __VLS_10;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
    modelValue: (__VLS_ctx.state.tableData.param.storageArea),
    size: "default",
    placeholder: "请输入存储区",
    ...{ class: "ml10" },
    ...{ style: {} },
}));
const __VLS_12 = __VLS_11({
    modelValue: (__VLS_ctx.state.tableData.param.storageArea),
    size: "default",
    placeholder: "请输入存储区",
    ...{ class: "ml10" },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_11));
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
let __VLS_15;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
    modelValue: (__VLS_ctx.state.tableData.param.manager),
    size: "default",
    placeholder: "请输入仓库管理员",
    ...{ class: "ml10" },
    ...{ style: {} },
}));
const __VLS_17 = __VLS_16({
    modelValue: (__VLS_ctx.state.tableData.param.manager),
    size: "default",
    placeholder: "请输入仓库管理员",
    ...{ class: "ml10" },
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_16));
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
let __VLS_20;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    size: "default",
    type: "primary",
    ...{ class: "ml10" },
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    size: "default",
    type: "primary",
    ...{ class: "ml10" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_25;
const __VLS_26 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.getTableData();
            // @ts-ignore
            [state, state, state, state, getTableData,];
        } });
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
const { default: __VLS_27 } = __VLS_23.slots;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
const { default: __VLS_33 } = __VLS_31.slots;
let __VLS_34;
/** @ts-ignore @type {typeof __VLS_components.elIconSearch | typeof __VLS_components.ElIconSearch} */
elIconSearch;
// @ts-ignore
const __VLS_35 = __VLS_asFunctionalComponent1(__VLS_34, new __VLS_34({}));
const __VLS_36 = __VLS_35({}, ...__VLS_functionalComponentArgsRest(__VLS_35));
// @ts-ignore
[];
var __VLS_31;
// @ts-ignore
[];
var __VLS_23;
var __VLS_24;
let __VLS_39;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_40 = __VLS_asFunctionalComponent1(__VLS_39, new __VLS_39({
    ...{ 'onClick': {} },
    size: "default",
    type: "success",
    ...{ class: "ml10" },
}));
const __VLS_41 = __VLS_40({
    ...{ 'onClick': {} },
    size: "default",
    type: "success",
    ...{ class: "ml10" },
}, ...__VLS_functionalComponentArgsRest(__VLS_40));
let __VLS_44;
const __VLS_45 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.onOpenAddStorage('add');
            // @ts-ignore
            [onOpenAddStorage,];
        } });
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
const { default: __VLS_46 } = __VLS_42.slots;
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({}));
const __VLS_49 = __VLS_48({}, ...__VLS_functionalComponentArgsRest(__VLS_48));
const { default: __VLS_52 } = __VLS_50.slots;
let __VLS_53;
/** @ts-ignore @type {typeof __VLS_components.elIconPlus | typeof __VLS_components.ElIconPlus} */
elIconPlus;
// @ts-ignore
const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({}));
const __VLS_55 = __VLS_54({}, ...__VLS_functionalComponentArgsRest(__VLS_54));
// @ts-ignore
[];
var __VLS_50;
// @ts-ignore
[];
var __VLS_42;
var __VLS_43;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_58;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
    data: (__VLS_ctx.state.tableData.data),
    ...{ style: {} },
}));
const __VLS_60 = __VLS_59({
    data: (__VLS_ctx.state.tableData.data),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.state.tableData.loading) }, null, null);
const { default: __VLS_63 } = __VLS_61.slots;
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    prop: "id",
    label: "ID",
    width: "80",
    align: "center",
}));
const __VLS_66 = __VLS_65({
    prop: "id",
    label: "ID",
    width: "80",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_69;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    prop: "product",
    label: "产品",
    showOverflowTooltip: true,
    width: "125",
    align: "center",
}));
const __VLS_71 = __VLS_70({
    prop: "product",
    label: "产品",
    showOverflowTooltip: true,
    width: "125",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_74;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
    prop: "warehouse",
    label: "用途",
    showOverflowTooltip: true,
    width: "180",
    align: "center",
}));
const __VLS_76 = __VLS_75({
    prop: "warehouse",
    label: "用途",
    showOverflowTooltip: true,
    width: "180",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
let __VLS_79;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
    prop: "storageArea",
    label: "存储区",
    showOverflowTooltip: true,
    width: "125",
    align: "center",
}));
const __VLS_81 = __VLS_80({
    prop: "storageArea",
    label: "存储区",
    showOverflowTooltip: true,
    width: "125",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
let __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    prop: "quantity",
    label: "数量",
    width: "125",
    align: "center",
}));
const __VLS_86 = __VLS_85({
    prop: "quantity",
    label: "数量",
    width: "125",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_89;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
    prop: "manager",
    label: "仓库管理员",
    showOverflowTooltip: true,
    width: "125",
    align: "center",
}));
const __VLS_91 = __VLS_90({
    prop: "manager",
    label: "仓库管理员",
    showOverflowTooltip: true,
    width: "125",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
let __VLS_94;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_95 = __VLS_asFunctionalComponent1(__VLS_94, new __VLS_94({
    prop: "phone",
    label: "手机号",
    showOverflowTooltip: true,
    width: "150",
    align: "center",
}));
const __VLS_96 = __VLS_95({
    prop: "phone",
    label: "手机号",
    showOverflowTooltip: true,
    width: "150",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_95));
let __VLS_99;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_100 = __VLS_asFunctionalComponent1(__VLS_99, new __VLS_99({
    prop: "remark",
    label: "备注",
    showOverflowTooltip: true,
    width: "180",
    align: "center",
}));
const __VLS_101 = __VLS_100({
    prop: "remark",
    label: "备注",
    showOverflowTooltip: true,
    width: "180",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_100));
let __VLS_104;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
    label: "操作",
    width: "180",
    fixed: "right",
    align: "center",
}));
const __VLS_106 = __VLS_105({
    label: "操作",
    width: "180",
    fixed: "right",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const { default: __VLS_109 } = __VLS_107.slots;
{
    const { default: __VLS_110 } = __VLS_107.slots;
    const [scope] = __VLS_vSlot(__VLS_110);
    let __VLS_111;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_113 = __VLS_112({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    let __VLS_116;
    const __VLS_117 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onOpenEditStorage('edit', scope.row);
                // @ts-ignore
                [state, state, vLoading, onOpenEditStorage,];
            } });
    const { default: __VLS_118 } = __VLS_114.slots;
    // @ts-ignore
    [];
    var __VLS_114;
    var __VLS_115;
    let __VLS_119;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_121 = __VLS_120({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_120));
    let __VLS_124;
    const __VLS_125 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onRowDel(scope.row);
                // @ts-ignore
                [onRowDel,];
            } });
    const { default: __VLS_126 } = __VLS_122.slots;
    // @ts-ignore
    [];
    var __VLS_122;
    var __VLS_123;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_107;
// @ts-ignore
[];
var __VLS_61;
let __VLS_127;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_128 = __VLS_asFunctionalComponent1(__VLS_127, new __VLS_127({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    ...{ class: "mt15" },
    pagerCount: (5),
    pageSizes: ([10, 20, 30]),
    currentPage: (__VLS_ctx.state.tableData.param.pageNum),
    background: true,
    pageSize: (__VLS_ctx.state.tableData.param.pageSize),
    layout: "total, sizes, prev, pager, next, jumper",
    total: (__VLS_ctx.state.tableData.total),
}));
const __VLS_129 = __VLS_128({
    ...{ 'onSizeChange': {} },
    ...{ 'onCurrentChange': {} },
    ...{ class: "mt15" },
    pagerCount: (5),
    pageSizes: ([10, 20, 30]),
    currentPage: (__VLS_ctx.state.tableData.param.pageNum),
    background: true,
    pageSize: (__VLS_ctx.state.tableData.param.pageSize),
    layout: "total, sizes, prev, pager, next, jumper",
    total: (__VLS_ctx.state.tableData.total),
}, ...__VLS_functionalComponentArgsRest(__VLS_128));
let __VLS_132;
const __VLS_133 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.onHandleSizeChange) });
const __VLS_134 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.onHandleCurrentChange) });
/** @type {__VLS_StyleScopedClasses['mt15']} */ ;
var __VLS_130;
var __VLS_131;
// @ts-ignore
[state, state, state, onHandleSizeChange, onHandleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
