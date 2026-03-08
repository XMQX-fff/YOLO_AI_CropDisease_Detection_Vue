import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search as ElIconSearch } from '@element-plus/icons-vue';
import { useRecordApi } from '/@/api/record';
const recordApi = useRecordApi();
const state = reactive({
    tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
            search: '',
            search3: '',
            search2: '',
            pageNum: 1,
            pageSize: 10,
        },
    },
});
// 唯一标识符，动态刷新
const uniqueKey = ref(0);
const getTableData = () => {
    state.tableData.loading = true;
    recordApi.getCameraRecordList(state.tableData.param)
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
const onRowDel = (row) => {
    ElMessageBox.confirm(`此操作将永久删除该信息，是否继续?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(() => {
        recordApi.deleteCameraRecord(row.id).then((res) => {
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
    ...{ class: "camera-record-container" },
});
/** @type {__VLS_StyleScopedClasses['camera-record-container']} */ ;
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
/** @ts-ignore @type {typeof __VLS_components.ElIconSearch} */
ElIconSearch;
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
    prop: "outVideo",
    label: "处理结果",
    width: "200",
    align: "center",
}));
const __VLS_37 = __VLS_36({
    prop: "outVideo",
    label: "处理结果",
    width: "200",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_36));
const { default: __VLS_40 } = __VLS_38.slots;
{
    const { default: __VLS_41 } = __VLS_38.slots;
    const [scope] = __VLS_vSlot(__VLS_41);
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
    [state, state, vLoading, uniqueKey,];
}
// @ts-ignore
[];
var __VLS_38;
let __VLS_42;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
    prop: "kind",
    label: "农作物种类",
    align: "center",
}));
const __VLS_44 = __VLS_43({
    prop: "kind",
    label: "农作物种类",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_43));
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    prop: "weight",
    label: "识别权重",
    align: "center",
}));
const __VLS_49 = __VLS_48({
    prop: "weight",
    label: "识别权重",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
let __VLS_52;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent1(__VLS_52, new __VLS_52({
    prop: "conf",
    label: "最小阈值",
    showOverflowTooltip: true,
    width: "100",
    align: "center",
}));
const __VLS_54 = __VLS_53({
    prop: "conf",
    label: "最小阈值",
    showOverflowTooltip: true,
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
let __VLS_57;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_58 = __VLS_asFunctionalComponent1(__VLS_57, new __VLS_57({
    prop: "username",
    label: "识别用户",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_59 = __VLS_58({
    prop: "username",
    label: "识别用户",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_58));
let __VLS_62;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
    prop: "startTime",
    label: "识别时间",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_64 = __VLS_63({
    prop: "startTime",
    label: "识别时间",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_63));
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    label: "操作",
    width: "100",
    fixed: "right",
    align: "center",
}));
const __VLS_69 = __VLS_68({
    label: "操作",
    width: "100",
    fixed: "right",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const { default: __VLS_72 } = __VLS_70.slots;
{
    const { default: __VLS_73 } = __VLS_70.slots;
    const [scope] = __VLS_vSlot(__VLS_73);
    let __VLS_74;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_76 = __VLS_75({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_75));
    let __VLS_79;
    const __VLS_80 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onRowDel(scope.row);
                // @ts-ignore
                [onRowDel,];
            } });
    const { default: __VLS_81 } = __VLS_77.slots;
    // @ts-ignore
    [];
    var __VLS_77;
    var __VLS_78;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_70;
// @ts-ignore
[];
var __VLS_27;
let __VLS_82;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_83 = __VLS_asFunctionalComponent1(__VLS_82, new __VLS_82({
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
const __VLS_84 = __VLS_83({
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
}, ...__VLS_functionalComponentArgsRest(__VLS_83));
let __VLS_87;
const __VLS_88 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.onHandleSizeChange) });
const __VLS_89 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.onHandleCurrentChange) });
/** @type {__VLS_StyleScopedClasses['mt15']} */ ;
var __VLS_85;
var __VLS_86;
// @ts-ignore
[state, state, state, onHandleSizeChange, onHandleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
