import { reactive, onMounted, ref } from 'vue';
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
            search3: '',
            pageNum: 1,
            pageSize: 10,
        },
    },
});
// 唯一标识符，动态刷新
const uniqueKey = ref(0);
const getTableData = () => {
    state.tableData.loading = true;
    recordApi.getVideoRecordList(state.tableData.param)
        .then((res) => {
        if (res.code == 0) {
            state.tableData.data = [];
            setTimeout(() => {
                state.tableData.loading = false;
            }, 500);
            for (let i = 0; i < res.data.records.length; i++) {
                state.tableData.data[i] = res.data.records[i];
                state.tableData.data[i]['num'] = i + 1;
            }
            state.tableData.total = res.data.total;
            // 更新唯一标识符
            uniqueKey.value++;
        }
        else {
            ElMessage({
                type: 'error',
                message: res.msg,
            });
        }
    });
};
const show = (row) => {
    window.open('http://localhost:8100/#/videoShow?id=' + row.id);
};
const onRowDel = (row) => {
    ElMessageBox.confirm(`此操作将永久删除该信息，是否继续?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
        recordApi.deleteVideoRecord(row.id).then((res) => {
            if (res.code == 0) {
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
const onHandleSizeChange = (val) => {
    state.tableData.param.pageSize = val;
    getTableData();
};
const onHandleCurrentChange = (val) => {
    state.tableData.param.pageNum = val;
    getTableData();
};
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
    ...{ class: "video-record-container" },
});
/** @type {__VLS_StyleScopedClasses['video-record-container']} */ ;
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
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    prop: "num",
    label: "序号",
    width: "100",
    align: "center",
}));
const __VLS_32 = __VLS_31({
    prop: "num",
    label: "序号",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_35;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_36 = __VLS_asFunctionalComponent1(__VLS_35, new __VLS_35({
    prop: "inputVideo",
    label: "原视频",
    width: "200",
    align: "center",
}));
const __VLS_37 = __VLS_36({
    prop: "inputVideo",
    label: "原视频",
    width: "200",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
const { default: __VLS_40 } = __VLS_38.slots;
{
    const { default: __VLS_41 } = __VLS_38.slots;
    const [scope] = __VLS_vSlot(__VLS_41);
    __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
        ...{ class: "video" },
        controls: true,
        key: (scope.row.inputVideo + __VLS_ctx.uniqueKey),
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['video']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.source)({
        src: (scope.row.inputVideo),
        type: "video/mp4",
    });
    // @ts-ignore
    [state, state, vLoading, uniqueKey,];
}
// @ts-ignore
[];
var __VLS_38;
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    prop: "outVideo",
    label: "处理结果",
    width: "200",
    align: "center",
}));
const __VLS_44 = __VLS_43({
    prop: "outVideo",
    label: "处理结果",
    width: "200",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
const { default: __VLS_47 } = __VLS_45.slots;
{
    const { default: __VLS_48 } = __VLS_45.slots;
    const [scope] = __VLS_vSlot(__VLS_48);
    __VLS_asFunctionalElement1(__VLS_intrinsics.video, __VLS_intrinsics.video)({
        ...{ class: "video" },
        preload: "auto",
        controls: true,
        key: (scope.row.outVideo + __VLS_ctx.uniqueKey),
        ...{ style: {} },
    });
    /** @type {__VLS_StyleScopedClasses['video']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.source)({
        src: (scope.row.outVideo),
        type: "video/mp4",
    });
    // @ts-ignore
    [uniqueKey,];
}
// @ts-ignore
[];
var __VLS_45;
let __VLS_49;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    prop: "kind",
    label: "农作物种类",
    align: "center",
    width: "110",
}));
const __VLS_51 = __VLS_50({
    prop: "kind",
    label: "农作物种类",
    align: "center",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    prop: "weight",
    label: "识别权重",
    align: "center",
    width: "110",
}));
const __VLS_56 = __VLS_55({
    prop: "weight",
    label: "识别权重",
    align: "center",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
let __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    prop: "conf",
    label: "最小阈值",
    showOverflowTooltip: true,
    width: "110",
    align: "center",
}));
const __VLS_61 = __VLS_60({
    prop: "conf",
    label: "最小阈值",
    showOverflowTooltip: true,
    width: "110",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    prop: "username",
    label: "识别用户",
    showOverflowTooltip: true,
    align: "center",
    width: "110",
}));
const __VLS_66 = __VLS_65({
    prop: "username",
    label: "识别用户",
    showOverflowTooltip: true,
    align: "center",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_69;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    prop: "startTime",
    label: "识别时间",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_71 = __VLS_70({
    prop: "startTime",
    label: "识别时间",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_74;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
    label: "操作",
    width: "130",
    align: "center",
}));
const __VLS_76 = __VLS_75({
    label: "操作",
    width: "130",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
const { default: __VLS_79 } = __VLS_77.slots;
{
    const { default: __VLS_80 } = __VLS_77.slots;
    const [scope] = __VLS_vSlot(__VLS_80);
    let __VLS_81;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent1(__VLS_81, new __VLS_81({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_83 = __VLS_82({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    let __VLS_86;
    const __VLS_87 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onRowDel(scope.row);
                // @ts-ignore
                [onRowDel,];
            } });
    const { default: __VLS_88 } = __VLS_84.slots;
    // @ts-ignore
    [];
    var __VLS_84;
    var __VLS_85;
    let __VLS_89;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_91 = __VLS_90({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_90));
    let __VLS_94;
    const __VLS_95 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.show(scope.row);
                // @ts-ignore
                [show,];
            } });
    const { default: __VLS_96 } = __VLS_92.slots;
    // @ts-ignore
    [];
    var __VLS_92;
    var __VLS_93;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_77;
// @ts-ignore
[];
var __VLS_27;
let __VLS_97;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
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
const __VLS_99 = __VLS_98({
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
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
let __VLS_102;
const __VLS_103 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.onHandleSizeChange) });
const __VLS_104 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.onHandleCurrentChange) });
/** @type {__VLS_StyleScopedClasses['mt15']} */ ;
var __VLS_100;
var __VLS_101;
// @ts-ignore
[state, state, state, onHandleSizeChange, onHandleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
