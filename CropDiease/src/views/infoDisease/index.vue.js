import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useDiseaseApi } from '/@/api/disease';
// 定义变量内容
const diseaseDialogRef = ref();
const diseaseApi = useDiseaseApi();
const state = reactive({
    tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
            name: '',
            cropType: '',
            pageNum: 1,
            pageSize: 10,
        },
    },
    cropTypes: ['玉米', '水稻', '小麦', '马铃薯', '棉花', '苹果', '葡萄', '番茄', '草莓'] // 作物类型选项
});
// 使用API获取数据
const getTableData = async () => {
    state.tableData.loading = true;
    try {
        const response = await diseaseApi.getDiseaseList({
            ...state.tableData.param,
            page: state.tableData.param.pageNum,
            limit: state.tableData.param.pageSize
        });
        const data = response?.data;
        if (data && data.records) {
            state.tableData.data = data.records.map((item, index) => ({
                ...item,
                num: (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize + index + 1
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
        console.error('获取病害数据失败:', error);
        state.tableData.data = [];
        state.tableData.total = 0;
    }
    finally {
        state.tableData.loading = false;
    }
};
// 打开新增病害弹窗
const onOpenAddDisease = async (type) => {
    try {
        // 这里可以打开添加病害的表单
        ElMessage({
            type: 'info',
            message: '添加病害功能开发中',
        });
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '操作失败',
        });
    }
};
// 打开修改病害弹窗
const onOpenEditDisease = async (type, row) => {
    try {
        // 这里可以打开修改病害的表单
        ElMessage({
            type: 'info',
            message: '修改病害功能开发中',
        });
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '操作失败',
        });
    }
};
// 打开详情弹窗
const onOpenDetail = async (row) => {
    try {
        const response = await diseaseApi.getDiseaseDetail(row.id);
        const detail = response.data;
        // 这里可以显示病害详情
        ElMessage({
            type: 'info',
            message: `查看病害详情: ${detail.name}`,
        });
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '获取详情失败',
        });
    }
};
// 删除病害
const onRowDel = async (row) => {
    ElMessageBox.confirm(`此操作将永久删除该病害信息，是否继续?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
        try {
            await diseaseApi.deleteDisease(row.id);
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
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "info-disease-container" },
});
/** @type {__VLS_StyleScopedClasses['info-disease-container']} */ ;
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
    modelValue: (__VLS_ctx.state.tableData.param.name),
    size: "default",
    placeholder: "请输入病害名称",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.state.tableData.param.name),
    size: "default",
    placeholder: "请输入病害名称",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    modelValue: (__VLS_ctx.state.tableData.param.cropType),
    size: "default",
    ...{ class: "ml10" },
    placeholder: "请选择作物类型",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_7 = __VLS_6({
    modelValue: (__VLS_ctx.state.tableData.param.cropType),
    size: "default",
    ...{ class: "ml10" },
    placeholder: "请选择作物类型",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
const { default: __VLS_10 } = __VLS_8.slots;
for (const [item] of __VLS_vFor((__VLS_ctx.state.cropTypes))) {
    let __VLS_11;
    /** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
    elOption;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        key: (item),
        label: (item),
        value: (item),
    }));
    const __VLS_13 = __VLS_12({
        key: (item),
        label: (item),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    // @ts-ignore
    [state, state, state,];
}
// @ts-ignore
[];
var __VLS_8;
let __VLS_16;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
    size: "default",
    type: "primary",
    ...{ class: "ml10" },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
    size: "default",
    type: "primary",
    ...{ class: "ml10" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_21;
const __VLS_22 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.getTableData();
            // @ts-ignore
            [getTableData,];
        } });
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
const { default: __VLS_23 } = __VLS_19.slots;
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({}));
const __VLS_26 = __VLS_25({}, ...__VLS_functionalComponentArgsRest(__VLS_25));
const { default: __VLS_29 } = __VLS_27.slots;
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.elIconSearch | typeof __VLS_components.ElIconSearch} */
elIconSearch;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({}));
const __VLS_32 = __VLS_31({}, ...__VLS_functionalComponentArgsRest(__VLS_31));
// @ts-ignore
[];
var __VLS_27;
// @ts-ignore
[];
var __VLS_19;
var __VLS_20;
let __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    ...{ 'onClick': {} },
    size: "default",
    type: "primary",
    ...{ class: "ml10" },
}));
const __VLS_37 = __VLS_36({
    ...{ 'onClick': {} },
    size: "default",
    type: "primary",
    ...{ class: "ml10" },
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
let __VLS_40;
const __VLS_41 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.onOpenAddDisease('add');
            // @ts-ignore
            [onOpenAddDisease,];
        } });
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
const { default: __VLS_42 } = __VLS_38.slots;
let __VLS_43;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({}));
const __VLS_45 = __VLS_44({}, ...__VLS_functionalComponentArgsRest(__VLS_44));
const { default: __VLS_48 } = __VLS_46.slots;
let __VLS_49;
/** @ts-ignore @type {typeof __VLS_components.elIconPlus | typeof __VLS_components.ElIconPlus} */
elIconPlus;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({}));
const __VLS_51 = __VLS_50({}, ...__VLS_functionalComponentArgsRest(__VLS_50));
// @ts-ignore
[];
var __VLS_46;
// @ts-ignore
[];
var __VLS_38;
var __VLS_39;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    data: (__VLS_ctx.state.tableData.data),
    ...{ style: {} },
}));
const __VLS_56 = __VLS_55({
    data: (__VLS_ctx.state.tableData.data),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.state.tableData.loading) }, null, null);
const { default: __VLS_59 } = __VLS_57.slots;
let __VLS_60;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({
    prop: "num",
    label: "序号",
    width: "80",
    align: "center",
}));
const __VLS_62 = __VLS_61({
    prop: "num",
    label: "序号",
    width: "80",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    prop: "cropType",
    label: "作物类型",
    showOverflowTooltip: true,
    width: "80",
    align: "center",
}));
const __VLS_67 = __VLS_66({
    prop: "cropType",
    label: "作物类型",
    showOverflowTooltip: true,
    width: "80",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    prop: "name",
    label: "病害名称",
    showOverflowTooltip: true,
    width: "150",
    align: "center",
}));
const __VLS_72 = __VLS_71({
    prop: "name",
    label: "病害名称",
    showOverflowTooltip: true,
    width: "150",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
let __VLS_75;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_76 = __VLS_asFunctionalComponent1(__VLS_75, new __VLS_75({
    prop: "symptoms",
    label: "病害症状",
    showOverflowTooltip: true,
    minWidth: "200",
    align: "center",
}));
const __VLS_77 = __VLS_76({
    prop: "symptoms",
    label: "病害症状",
    showOverflowTooltip: true,
    minWidth: "200",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_76));
let __VLS_80;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
    prop: "causes",
    label: "发病原因",
    showOverflowTooltip: true,
    minWidth: "200",
    align: "center",
}));
const __VLS_82 = __VLS_81({
    prop: "causes",
    label: "发病原因",
    showOverflowTooltip: true,
    minWidth: "200",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
let __VLS_85;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    prop: "prevention",
    label: "防治方法",
    showOverflowTooltip: true,
    minWidth: "200",
    align: "center",
}));
const __VLS_87 = __VLS_86({
    prop: "prevention",
    label: "防治方法",
    showOverflowTooltip: true,
    minWidth: "200",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
let __VLS_90;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_91 = __VLS_asFunctionalComponent1(__VLS_90, new __VLS_90({
    label: "图片",
    width: "100",
    align: "center",
}));
const __VLS_92 = __VLS_91({
    label: "图片",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_91));
const { default: __VLS_95 } = __VLS_93.slots;
{
    const { default: __VLS_96 } = __VLS_93.slots;
    const [scope] = __VLS_vSlot(__VLS_96);
    let __VLS_97;
    /** @ts-ignore @type {typeof __VLS_components.elImage | typeof __VLS_components.ElImage} */
    elImage;
    // @ts-ignore
    const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
        ...{ style: {} },
        src: (scope.row.image),
        previewSrcList: ([scope.row.image]),
        previewTeleported: (true),
        hideOnClickModal: (true),
        fit: "cover",
        previewOptions: ({
            zoom: false,
            closeOnPressEscape: true,
            toolbar: false
        }),
    }));
    const __VLS_99 = __VLS_98({
        ...{ style: {} },
        src: (scope.row.image),
        previewSrcList: ([scope.row.image]),
        previewTeleported: (true),
        hideOnClickModal: (true),
        fit: "cover",
        previewOptions: ({
            zoom: false,
            closeOnPressEscape: true,
            toolbar: false
        }),
    }, ...__VLS_functionalComponentArgsRest(__VLS_98));
    // @ts-ignore
    [state, state, vLoading,];
}
// @ts-ignore
[];
var __VLS_93;
let __VLS_102;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
    label: "操作",
    width: "250",
    fixed: "right",
    align: "center",
}));
const __VLS_104 = __VLS_103({
    label: "操作",
    width: "250",
    fixed: "right",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
const { default: __VLS_107 } = __VLS_105.slots;
{
    const { default: __VLS_108 } = __VLS_105.slots;
    const [scope] = __VLS_vSlot(__VLS_108);
    let __VLS_109;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent1(__VLS_109, new __VLS_109({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_111 = __VLS_110({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    let __VLS_114;
    const __VLS_115 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onOpenDetail(scope.row);
                // @ts-ignore
                [onOpenDetail,];
            } });
    const { default: __VLS_116 } = __VLS_112.slots;
    // @ts-ignore
    [];
    var __VLS_112;
    var __VLS_113;
    let __VLS_117;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_118 = __VLS_asFunctionalComponent1(__VLS_117, new __VLS_117({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_119 = __VLS_118({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_118));
    let __VLS_122;
    const __VLS_123 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onOpenEditDisease('edit', scope.row);
                // @ts-ignore
                [onOpenEditDisease,];
            } });
    const { default: __VLS_124 } = __VLS_120.slots;
    // @ts-ignore
    [];
    var __VLS_120;
    var __VLS_121;
    let __VLS_125;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_126 = __VLS_asFunctionalComponent1(__VLS_125, new __VLS_125({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_127 = __VLS_126({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_126));
    let __VLS_130;
    const __VLS_131 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onRowDel(scope.row);
                // @ts-ignore
                [onRowDel,];
            } });
    const { default: __VLS_132 } = __VLS_128.slots;
    // @ts-ignore
    [];
    var __VLS_128;
    var __VLS_129;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_105;
// @ts-ignore
[];
var __VLS_57;
let __VLS_133;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_134 = __VLS_asFunctionalComponent1(__VLS_133, new __VLS_133({
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
const __VLS_135 = __VLS_134({
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
}, ...__VLS_functionalComponentArgsRest(__VLS_134));
let __VLS_138;
const __VLS_139 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.onHandleSizeChange) });
const __VLS_140 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.onHandleCurrentChange) });
/** @type {__VLS_StyleScopedClasses['mt15']} */ ;
var __VLS_136;
var __VLS_137;
// @ts-ignore
[state, state, state, onHandleSizeChange, onHandleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
