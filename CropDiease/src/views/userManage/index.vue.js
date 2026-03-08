import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useUserApi } from '/@/api/user';
// 定义变量内容
const roleDialogRef = ref();
const userApi = useUserApi();
const state = reactive({
    tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
            search: '',
            pageNum: 1,
            pageSize: 10,
        },
    },
});
// 使用API获取数据
const getTableData = async () => {
    state.tableData.loading = true;
    try {
        const response = await userApi.getUserList({
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
        console.error('获取用户数据失败:', error);
        state.tableData.data = [];
        state.tableData.total = 0;
    }
    finally {
        state.tableData.loading = false;
    }
};
// 打开新增用户弹窗
const onOpenAddRole = async (type) => {
    try {
        // 这里可以打开添加用户的表单
        ElMessage({
            type: 'info',
            message: '添加用户功能开发中',
        });
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '操作失败',
        });
    }
};
// 打开修改用户弹窗
const onOpenEditRole = async (type, row) => {
    try {
        // 这里可以打开修改用户的表单
        ElMessage({
            type: 'info',
            message: '修改用户功能开发中',
        });
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '操作失败',
        });
    }
};
// 删除用户
const onRowDel = async (row) => {
    ElMessageBox.confirm(`此操作将永久删除该用户信息，是否继续?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
    })
        .then(async () => {
        try {
            await userApi.deleteUser(row.id);
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
    ...{ class: "user-manage-container" },
});
/** @type {__VLS_StyleScopedClasses['user-manage-container']} */ ;
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
    placeholder: "请输入用户名",
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.state.tableData.param.search),
    size: "default",
    placeholder: "请输入用户名",
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
/** @ts-ignore @type {typeof __VLS_components.elIconSearch | typeof __VLS_components.ElIconSearch} */
elIconSearch;
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
let __VLS_24;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    size: "default",
    type: "success",
    ...{ class: "ml10" },
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    size: "default",
    type: "success",
    ...{ class: "ml10" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_29;
const __VLS_30 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.onOpenAddRole('add');
            // @ts-ignore
            [onOpenAddRole,];
        } });
/** @type {__VLS_StyleScopedClasses['ml10']} */ ;
const { default: __VLS_31 } = __VLS_27.slots;
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({}));
const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
const { default: __VLS_37 } = __VLS_35.slots;
let __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.elIconPlus | typeof __VLS_components.ElIconPlus} */
elIconPlus;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({}));
const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
// @ts-ignore
[];
var __VLS_35;
// @ts-ignore
[];
var __VLS_27;
var __VLS_28;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "table-section" },
});
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
let __VLS_43;
/** @ts-ignore @type {typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components.elTable | typeof __VLS_components.ElTable} */
elTable;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    data: (__VLS_ctx.state.tableData.data),
    ...{ style: {} },
}));
const __VLS_45 = __VLS_44({
    data: (__VLS_ctx.state.tableData.data),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.state.tableData.loading) }, null, null);
const { default: __VLS_48 } = __VLS_46.slots;
let __VLS_49;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    prop: "num",
    label: "序号",
    width: "80",
    align: "center",
}));
const __VLS_51 = __VLS_50({
    prop: "num",
    label: "序号",
    width: "80",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
let __VLS_54;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({
    prop: "username",
    label: "账号",
    showOverflowTooltip: true,
    width: "100",
    align: "center",
}));
const __VLS_56 = __VLS_55({
    prop: "username",
    label: "账号",
    showOverflowTooltip: true,
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_55));
let __VLS_59;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_60 = __VLS_asFunctionalComponent1(__VLS_59, new __VLS_59({
    prop: "password",
    label: "密码",
    width: "100",
    align: "center",
}));
const __VLS_61 = __VLS_60({
    prop: "password",
    label: "密码",
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_60));
let __VLS_64;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent1(__VLS_64, new __VLS_64({
    prop: "name",
    label: "姓名",
    showOverflowTooltip: true,
    width: "100",
    align: "center",
}));
const __VLS_66 = __VLS_65({
    prop: "name",
    label: "姓名",
    showOverflowTooltip: true,
    width: "100",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
let __VLS_69;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_70 = __VLS_asFunctionalComponent1(__VLS_69, new __VLS_69({
    prop: "sex",
    label: "性别",
    showOverflowTooltip: true,
    width: "80",
    align: "center",
}));
const __VLS_71 = __VLS_70({
    prop: "sex",
    label: "性别",
    showOverflowTooltip: true,
    width: "80",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_70));
let __VLS_74;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_75 = __VLS_asFunctionalComponent1(__VLS_74, new __VLS_74({
    prop: "email",
    label: "邮箱",
    align: "center",
}));
const __VLS_76 = __VLS_75({
    prop: "email",
    label: "邮箱",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_75));
let __VLS_79;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_80 = __VLS_asFunctionalComponent1(__VLS_79, new __VLS_79({
    prop: "tel",
    label: "手机号码",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_81 = __VLS_80({
    prop: "tel",
    label: "手机号码",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_80));
let __VLS_84;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent1(__VLS_84, new __VLS_84({
    prop: "role",
    label: "角色",
    showOverflowTooltip: true,
    align: "center",
}));
const __VLS_86 = __VLS_85({
    prop: "role",
    label: "角色",
    showOverflowTooltip: true,
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
let __VLS_89;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_90 = __VLS_asFunctionalComponent1(__VLS_89, new __VLS_89({
    prop: "avatar",
    label: "头像",
    align: "center",
}));
const __VLS_91 = __VLS_90({
    prop: "avatar",
    label: "头像",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_90));
const { default: __VLS_94 } = __VLS_92.slots;
{
    const { default: __VLS_95 } = __VLS_92.slots;
    const [scope] = __VLS_vSlot(__VLS_95);
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (scope.row.avatar),
        width: "50",
        height: "50",
    });
    // @ts-ignore
    [state, state, vLoading,];
}
// @ts-ignore
[];
var __VLS_92;
let __VLS_96;
/** @ts-ignore @type {typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn} */
elTableColumn;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
    label: "操作",
    width: "180",
    fixed: "right",
    align: "center",
}));
const __VLS_98 = __VLS_97({
    label: "操作",
    width: "180",
    fixed: "right",
    align: "center",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
const { default: __VLS_101 } = __VLS_99.slots;
{
    const { default: __VLS_102 } = __VLS_99.slots;
    const [scope] = __VLS_vSlot(__VLS_102);
    let __VLS_103;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }));
    const __VLS_105 = __VLS_104({
        ...{ 'onClick': {} },
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_104));
    let __VLS_108;
    const __VLS_109 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onOpenEditRole('edit', scope.row);
                // @ts-ignore
                [onOpenEditRole,];
            } });
    const { default: __VLS_110 } = __VLS_106.slots;
    // @ts-ignore
    [];
    var __VLS_106;
    var __VLS_107;
    let __VLS_111;
    /** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
    elButton;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent1(__VLS_111, new __VLS_111({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_113 = __VLS_112({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    let __VLS_116;
    const __VLS_117 = ({ click: {} },
        { onClick: (...[$event]) => {
                __VLS_ctx.onRowDel(scope.row);
                // @ts-ignore
                [onRowDel,];
            } });
    const { default: __VLS_118 } = __VLS_114.slots;
    // @ts-ignore
    [];
    var __VLS_114;
    var __VLS_115;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_99;
// @ts-ignore
[];
var __VLS_46;
let __VLS_119;
/** @ts-ignore @type {typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination | typeof __VLS_components.elPagination | typeof __VLS_components.ElPagination} */
elPagination;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
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
const __VLS_121 = __VLS_120({
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
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
let __VLS_124;
const __VLS_125 = ({ sizeChange: {} },
    { onSizeChange: (__VLS_ctx.onHandleSizeChange) });
const __VLS_126 = ({ currentChange: {} },
    { onCurrentChange: (__VLS_ctx.onHandleCurrentChange) });
/** @type {__VLS_StyleScopedClasses['mt15']} */ ;
var __VLS_122;
var __VLS_123;
// @ts-ignore
[state, state, state, onHandleSizeChange, onHandleCurrentChange,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
