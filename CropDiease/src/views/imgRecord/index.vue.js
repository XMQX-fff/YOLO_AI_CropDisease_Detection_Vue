import { reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useRecordApi } from '/@/api/record';
import { Search as eleSearch } from '@element-plus/icons-vue';
const recordApi = useRecordApi();
const state = reactive({
    tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
            search: '',
            search1: '',
            search2: '',
            pageNum: 1,
            pageSize: 10,
        },
    },
});
const getTableData = () => {
    state.tableData.loading = true;
    recordApi.getImgRecordList(state.tableData.param)
        .then((res) => {
        if (res.code == 0) {
            state.tableData.data = [];
            setTimeout(() => {
                state.tableData.loading = false;
            }, 500);
            for (let i = 0; i < res.data.records.length; i++) {
                const confidences = JSON.parse(res.data.records[i].confidence);
                const labels = JSON.parse(res.data.records[i].label);
                const transformedData = transformData(res.data.records[i], confidences, labels);
                transformedData["num"] = i + 1;
                state.tableData.data[i] = transformedData;
            }
            state.tableData.total = res.data.total;
        }
        else {
            ElMessage({
                type: 'error',
                message: res.msg,
            });
        }
    });
};
const transformData = (originalData, confidences, labels) => {
    const family = labels.map((label, index) => ({
        label: label,
        confidence: confidences[index],
        startTime: originalData.startTime
    }));
    const result = {
        id: originalData.id,
        inputImg: originalData.inputImg,
        outImg: originalData.outImg,
        cropType: originalData.kind || '-', // 使用后端返回的kind字段
        weight: originalData.weight,
        allTime: originalData.allTime,
        conf: originalData.conf,
        startTime: originalData.startTime,
        username: originalData.username,
        family: family
    };
    return result;
};
// 删除
const onRowDel = (row) => {
    ElMessageBox.confirm(`此操作将永久删除该信息，是否继续?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
        console.log(row);
        recordApi.deleteImgRecord(row.id).then((res) => {
            if (res.code == 0) {
                console.log(res.data);
                ElMessage({
                    type: 'success',
                    message: '删除成功！',
                });
            }
            else {
                ElMessage({
                    type: 'error',
                    message: res.msg,
                });
            }
        });
        setTimeout(() => {
            getTableData();
        }, 500);
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
/** @type {__VLS_StyleScopedClasses['el-table']} */ ;
/** @type {__VLS_StyleScopedClasses['el-table__row']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "img-record-container" },
});
/** @type {__VLS_StyleScopedClasses['img-record-container']} */ ;
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
    modelValue: (__VLS_ctx.state.tableData.param.search1),
    size: "default",
    placeholder: "请输入农作物类型",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.state.tableData.param.search1),
    size: "default",
    placeholder: "请输入农作物类型",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
    ...{ 'onClick': {} },
    size: "default",
    type: "primary",
    ...{ class: "ml10" },
}));
const __VLS_7 = __VLS_6({
    ...{ 'onClick': {} },
    size: "default",
    type: "primary",
    ...{ class: "ml10" },
}, ...__VLS_functionalComponentArgsRest(__VLS_6));
let __VLS_10;
const __VLS_11 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.getTableData();
            // @ts-ignore
            [state, getTableData,];
        } });
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
const { default: __VLS_12 } = __VLS_8.slots;
let __VLS_13;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_14 = __VLS_asFunctionalComponent1(__VLS_13, new __VLS_13({}));
const __VLS_15 = __VLS_14({}, ...__VLS_functionalComponentArgsRest(__VLS_14));
const { default: __VLS_18 } = __VLS_16.slots;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.eleSearch | typeof __VLS_components.EleSearch} */
eleSearch;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({}));
const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
// @ts-ignore
[];
var __VLS_16;
// @ts-ignore
[];
var __VLS_8;
var __VLS_9;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    data: (__VLS_ctx.state.tableData.data),
    ...{ style: {} },
}));
const __VLS_26 = __VLS_25({
    data: (__VLS_ctx.state.tableData.data),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.state.tableData.loading) }, null, null);
const { default: __VLS_29 } = __VLS_27.slots;
let __VLS_30;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    type: "expand",
}));
const __VLS_32 = __VLS_31({
    type: "expand",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
const { default: __VLS_35 } = __VLS_33.slots;
{
    const { default: __VLS_36 } = __VLS_33.slots;
    const [props] = __VLS_vSlot(__VLS_36);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "expand-content" },
    });
    /** @type {__VLS_StyleScopedClasses['expand-content']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "expand-title" },
    });
    /** @type {__VLS_StyleScopedClasses['expand-title']} */ ;
    let __VLS_37;
    /** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
    elTable;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
        data: (props.row.family),
    }));
    const __VLS_39 = __VLS_38({
        data: (props.row.family),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    const { default: __VLS_42 } = __VLS_40.slots;
    let __VLS_43;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
        prop: "label",
        label: "识别结果",
        align: "center",
    }));
    const __VLS_45 = __VLS_44({
        prop: "label",
        label: "识别结果",
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_44));
    let __VLS_48;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent1(__VLS_48, new __VLS_48({
        prop: "confidence",
        label: "置信度",
        showOverflowTooltip: true,
        align: "center",
    }));
    const __VLS_50 = __VLS_49({
        prop: "confidence",
        label: "置信度",
        showOverflowTooltip: true,
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    let __VLS_53;
    /** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
    elTableColumn;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        prop: "startTime",
        label: "识别时间",
        align: "center",
    }));
    const __VLS_55 = __VLS_54({
        prop: "startTime",
        label: "识别时间",
        align: "center",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    // @ts-ignore
    [state, state, vLoading,];
    var __VLS_40;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_33;
let __VLS_58;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_59 = __VLS_asFunctionalComponent1(__VLS_58, new __VLS_58({
    prop: "num",
    label: "序号",
    width: "80",
    align: "center",
}));
const __VLS_60 = __VLS_59({
    prop: "num",
    label: "序号",
    width: "80",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_59));
let __VLS_63;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_64 = __VLS_asFunctionalComponent1(__VLS_63, new __VLS_63({
    prop: "inputImg",
    label: "原始图片",
    width: "120",
    align: "center",
}));
const __VLS_65 = __VLS_64({
    prop: "inputImg",
    label: "原始图片",
    width: "120",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_64));
const { default: __VLS_68 } = __VLS_66.slots;
{
    const { default: __VLS_69 } = __VLS_66.slots;
    const [scope] = __VLS_vSlot(__VLS_69);
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (scope.row.inputImg),
        width: "120",
        height: "60",
    });
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_66;
let __VLS_70;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_71 = __VLS_asFunctionalComponent1(__VLS_70, new __VLS_70({
    prop: "outImg",
    label: "预测图片",
    width: "120",
    align: "center",
}));
const __VLS_72 = __VLS_71({
    prop: "outImg",
    label: "预测图片",
    width: "120",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_71));
const { default: __VLS_75 } = __VLS_73.slots;
{
    const { default: __VLS_76 } = __VLS_73.slots;
    const [scope] = __VLS_vSlot(__VLS_76);
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (scope.row.outImg),
        width: "120",
        height: "60",
    });
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_73;
let __VLS_77;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_78 = __VLS_asFunctionalComponent1(__VLS_77, new __VLS_77({
    prop: "cropType",
    label: "农作物种类",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_79 = __VLS_78({
    prop: "cropType",
    label: "农作物种类",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_78));
let __VLS_82;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
    prop: "weight",
    label: "识别权重",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_84 = __VLS_83({
    prop: "weight",
    label: "识别权重",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
let __VLS_87;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
    prop: "conf",
    label: "最小阈值",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_89 = __VLS_88({
    prop: "conf",
    label: "最小阈值",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_88));
let __VLS_92;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
    prop: "allTime",
    label: "总用时",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_94 = __VLS_93({
    prop: "allTime",
    label: "总用时",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
let __VLS_97;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
    prop: "startTime",
    label: "识别时间",
    width: "200",
    align: "center",
}));
const __VLS_99 = __VLS_98({
    prop: "startTime",
    label: "识别时间",
    width: "200",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
let __VLS_102;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_103 = __VLS_asFunctionalComponent1(__VLS_102, new __VLS_102({
    prop: "username",
    label: "识别用户",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_104 = __VLS_103({
    prop: "username",
    label: "识别用户",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_103));
let __VLS_107;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_108 = __VLS_asFunctionalComponent1(__VLS_107, new __VLS_107({
    label: "操作",
    width: "100",
    fixed: "right",
    align: "center",
}));
const __VLS_109 = __VLS_108({
    label: "操作",
    width: "100",
    fixed: "right",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_108));
const { default: __VLS_112 } = __VLS_110.slots;
{
    const { default: __VLS_113 } = __VLS_110.slots;
    const [scope] = __VLS_vSlot(__VLS_113);
    let __VLS_114;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_115 = __VLS_asFunctionalComponent1(__VLS_114, new __VLS_114({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_116 = __VLS_115({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_115));
    let __VLS_119;
    const __VLS_120 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onRowDel(scope.row);
                // @ts-ignore
                [onRowDel,];
            } });
    const { default: __VLS_121 } = __VLS_117.slots;
    // @ts-ignore
    [];
    var __VLS_117;
    var __VLS_118;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_110;
// @ts-ignore
[];
var __VLS_27;
let __VLS_122;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_123 = __VLS_asFunctionalComponent1(__VLS_122, new __VLS_122({
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
const __VLS_124 = __VLS_123({
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
}, ...__VLS_functionalComponentArgsRest(__VLS_123));
let __VLS_127;
const __VLS_128 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.onHandleSizeChange) });
const __VLS_129 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.onHandleCurrentChange) });
/** @type {__VLS_StyleScopedClasses['mt15']} */ ;
var __VLS_125;
var __VLS_126;
// @ts-ignore
[state, state, state, onHandleSizeChange, onHandleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
