import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Food, DataAnalysis, WarningFilled, ChatLineSquare, ChatDotRound, Monitor } from '@element-plus/icons-vue';
import { useLoginApi } from '/@/api/login';
// 定义变量内容
const router = useRouter();
const loginApi = useLoginApi();
const ruleFormRef = ref();
// 加载状态
const loading = ref(false);
// 密码显示状态
const showPassword = ref(false);
/*
 * 定义全局变量，等价Vue2中的data() return。
 */
const ruleForm = reactive({
    username: '',
    password: '',
});
/*
 * 校验规则。
 */
const loginRules = reactive({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在2-20个字符', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在3-20个字符', trigger: 'blur' },
    ],
});
// 登录
const submitForm = async (formEl) => {
    if (!formEl)
        return;
    await formEl.validate(async (valid) => {
        if (valid) {
            loading.value = true;
            try {
                const res = await loginApi.signIn({
                    username: ruleForm.username,
                    password: ruleForm.password
                });
                if (res.code === '0' || res.code === 0) {
                    ElMessage.success('登录成功！');
                    // 存储用户信息
                    if (res.data) {
                        localStorage.setItem('userInfo', JSON.stringify(res.data));
                        localStorage.setItem('token', res.data.id || 'token_' + Date.now());
                    }
                    // 登录成功后跳转到首页
                    setTimeout(() => {
                        router.push('/');
                    }, 500);
                }
                else {
                    ElMessage.error(res.msg || '登录失败，请检查用户名和密码');
                }
            }
            catch (err) {
                console.error('登录失败:', err);
                ElMessage.error(err.message || '登录失败，请稍后重试');
            }
            finally {
                loading.value = false;
            }
        }
        else {
            console.log('error submit!');
            return false;
        }
    });
};
// 重置表单
const resetForm = (formEl) => {
    if (!formEl)
        return;
    formEl.resetFields();
};
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brand-content']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-content']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-text']} */ ;
/** @type {__VLS_StyleScopedClasses['login-header']} */ ;
/** @type {__VLS_StyleScopedClasses['login-header']} */ ;
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
/** @type {__VLS_StyleScopedClasses['input-with-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['input-with-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['full-width-input']} */ ;
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['remember']} */ ;
/** @type {__VLS_StyleScopedClasses['remember']} */ ;
/** @type {__VLS_StyleScopedClasses['forgot-password']} */ ;
/** @type {__VLS_StyleScopedClasses['btn-login']} */ ;
/** @type {__VLS_StyleScopedClasses['social-login']} */ ;
/** @type {__VLS_StyleScopedClasses['social-login']} */ ;
/** @type {__VLS_StyleScopedClasses['social-login']} */ ;
/** @type {__VLS_StyleScopedClasses['social-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['register-link']} */ ;
/** @type {__VLS_StyleScopedClasses['register-link']} */ ;
/** @type {__VLS_StyleScopedClasses['login-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-section']} */ ;
/** @type {__VLS_StyleScopedClasses['login-section']} */ ;
/** @type {__VLS_StyleScopedClasses['login-content']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-section']} */ ;
/** @type {__VLS_StyleScopedClasses['login-section']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-content']} */ ;
/** @type {__VLS_StyleScopedClasses['remember-forgot']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-container" },
});
/** @type {__VLS_StyleScopedClasses['login-container']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "login-content" },
});
/** @type {__VLS_StyleScopedClasses['login-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['login-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "brand-section" },
});
/** @type {__VLS_StyleScopedClasses['brand-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "brand-content" },
});
/** @type {__VLS_StyleScopedClasses['brand-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
    ...{ class: "slogan" },
});
/** @type {__VLS_StyleScopedClasses['slogan']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "features" },
});
/** @type {__VLS_StyleScopedClasses['features']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature" },
});
/** @type {__VLS_StyleScopedClasses['feature']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-icon" },
});
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    size: (28),
    color: "#28a745",
}));
const __VLS_2 = __VLS_1({
    size: (28),
    color: "#28a745",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.Food} */
Food;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
var __VLS_3;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-text" },
});
/** @type {__VLS_StyleScopedClasses['feature-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature" },
});
/** @type {__VLS_StyleScopedClasses['feature']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-icon" },
});
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
let __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    size: (28),
    color: "#28a745",
}));
const __VLS_13 = __VLS_12({
    size: (28),
    color: "#28a745",
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
const { default: __VLS_16 } = __VLS_14.slots;
let __VLS_17;
/** @ts-ignore @type {typeof __VLS_components.DataAnalysis} */
DataAnalysis;
// @ts-ignore
const __VLS_18 = __VLS_asFunctionalComponent1(__VLS_17, new __VLS_17({}));
const __VLS_19 = __VLS_18({}, ...__VLS_functionalComponentArgsRest(__VLS_18));
var __VLS_14;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-text" },
});
/** @type {__VLS_StyleScopedClasses['feature-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature" },
});
/** @type {__VLS_StyleScopedClasses['feature']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-icon" },
});
/** @type {__VLS_StyleScopedClasses['feature-icon']} */ ;
let __VLS_22;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
    size: (28),
    color: "#28a745",
}));
const __VLS_24 = __VLS_23({
    size: (28),
    color: "#28a745",
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
const { default: __VLS_27 } = __VLS_25.slots;
let __VLS_28;
/** @ts-ignore @type {typeof __VLS_components.WarningFilled} */
WarningFilled;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent1(__VLS_28, new __VLS_28({}));
const __VLS_30 = __VLS_29({}, ...__VLS_functionalComponentArgsRest(__VLS_29));
var __VLS_25;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "feature-text" },
});
/** @type {__VLS_StyleScopedClasses['feature-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-section" },
});
/** @type {__VLS_StyleScopedClasses['login-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-card" },
});
/** @type {__VLS_StyleScopedClasses['login-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "login-header" },
});
/** @type {__VLS_StyleScopedClasses['login-header']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
let __VLS_33;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    ref: "ruleFormRef",
    model: (__VLS_ctx.ruleForm),
    rules: (__VLS_ctx.loginRules),
    ...{ class: "login-form" },
    size: "large",
}));
const __VLS_35 = __VLS_34({
    ref: "ruleFormRef",
    model: (__VLS_ctx.ruleForm),
    rules: (__VLS_ctx.loginRules),
    ...{ class: "login-form" },
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
var __VLS_38 = {};
/** @type {__VLS_StyleScopedClasses['login-form']} */ ;
const { default: __VLS_40 } = __VLS_36.slots;
let __VLS_41;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_42 = __VLS_asFunctionalComponent1(__VLS_41, new __VLS_41({
    prop: "username",
}));
const __VLS_43 = __VLS_42({
    prop: "username",
}, ...__VLS_functionalComponentArgsRest(__VLS_42));
const { default: __VLS_46 } = __VLS_44.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-group" },
});
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    for: "username",
});
let __VLS_47;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
    id: "username",
    modelValue: (__VLS_ctx.ruleForm.username),
    placeholder: "请输入用户名",
    clearable: true,
    ...{ class: "full-width-input" },
}));
const __VLS_49 = __VLS_48({
    id: "username",
    modelValue: (__VLS_ctx.ruleForm.username),
    placeholder: "请输入用户名",
    clearable: true,
    ...{ class: "full-width-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_48));
/** @type {__VLS_StyleScopedClasses['full-width-input']} */ ;
const { default: __VLS_52 } = __VLS_50.slots;
{
    const { prefix: __VLS_53 } = __VLS_50.slots;
    let __VLS_54;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_55 = __VLS_asFunctionalComponent1(__VLS_54, new __VLS_54({}));
    const __VLS_56 = __VLS_55({}, ...__VLS_functionalComponentArgsRest(__VLS_55));
    const { default: __VLS_59 } = __VLS_57.slots;
    let __VLS_60;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent1(__VLS_60, new __VLS_60({}));
    const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
    // @ts-ignore
    [ruleForm, ruleForm, loginRules,];
    var __VLS_57;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_50;
// @ts-ignore
[];
var __VLS_44;
let __VLS_65;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_66 = __VLS_asFunctionalComponent1(__VLS_65, new __VLS_65({
    prop: "password",
}));
const __VLS_67 = __VLS_66({
    prop: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_66));
const { default: __VLS_70 } = __VLS_68.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-group" },
});
/** @type {__VLS_StyleScopedClasses['form-group']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    for: "password",
});
let __VLS_71;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_72 = __VLS_asFunctionalComponent1(__VLS_71, new __VLS_71({
    ...{ 'onKeyup': {} },
    id: "password",
    modelValue: (__VLS_ctx.ruleForm.password),
    type: (__VLS_ctx.showPassword ? 'text' : 'password'),
    placeholder: "请输入密码",
    showPassword: true,
    ...{ class: "full-width-input" },
}));
const __VLS_73 = __VLS_72({
    ...{ 'onKeyup': {} },
    id: "password",
    modelValue: (__VLS_ctx.ruleForm.password),
    type: (__VLS_ctx.showPassword ? 'text' : 'password'),
    placeholder: "请输入密码",
    showPassword: true,
    ...{ class: "full-width-input" },
}, ...__VLS_functionalComponentArgsRest(__VLS_72));
let __VLS_76;
const __VLS_77 = ({ keyup: {} },
    { onKeyup: (...[$event]) => {
            __VLS_ctx.submitForm(__VLS_ctx.ruleFormRef);
            // @ts-ignore
            [ruleForm, showPassword, submitForm, ruleFormRef,];
        } });
/** @type {__VLS_StyleScopedClasses['full-width-input']} */ ;
const { default: __VLS_78 } = __VLS_74.slots;
{
    const { prefix: __VLS_79 } = __VLS_74.slots;
    let __VLS_80;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({}));
    const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
    const { default: __VLS_85 } = __VLS_83.slots;
    let __VLS_86;
    /** @ts-ignore @type {typeof __VLS_components.Lock} */
    Lock;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({}));
    const __VLS_88 = __VLS_87({}, ...__VLS_functionalComponentArgsRest(__VLS_87));
    // @ts-ignore
    [];
    var __VLS_83;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_74;
var __VLS_75;
// @ts-ignore
[];
var __VLS_68;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "remember-forgot" },
});
/** @type {__VLS_StyleScopedClasses['remember-forgot']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "remember" },
});
/** @type {__VLS_StyleScopedClasses['remember']} */ ;
let __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.elCheckbox | typeof __VLS_components.ElCheckbox} */
elCheckbox;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
    id: "remember",
}));
const __VLS_93 = __VLS_92({
    id: "remember",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
__VLS_asFunctionalElement1(__VLS_intrinsics.label, __VLS_intrinsics.label)({
    for: "remember",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#",
    ...{ class: "forgot-password" },
});
/** @type {__VLS_StyleScopedClasses['forgot-password']} */ ;
let __VLS_96;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent1(__VLS_96, new __VLS_96({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "btn-login" },
    loading: (__VLS_ctx.loading),
}));
const __VLS_98 = __VLS_97({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "btn-login" },
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
let __VLS_101;
const __VLS_102 = ({ click: {} },
    { onClick: (...[$event]) => {
            __VLS_ctx.submitForm(__VLS_ctx.ruleFormRef);
            // @ts-ignore
            [submitForm, ruleFormRef, loading,];
        } });
/** @type {__VLS_StyleScopedClasses['btn-login']} */ ;
const { default: __VLS_103 } = __VLS_99.slots;
(__VLS_ctx.loading ? '登录中...' : '登录系统');
// @ts-ignore
[loading,];
var __VLS_99;
var __VLS_100;
// @ts-ignore
[];
var __VLS_36;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "social-login" },
});
/** @type {__VLS_StyleScopedClasses['social-login']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "social-icons" },
});
/** @type {__VLS_StyleScopedClasses['social-icons']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#",
    ...{ class: "social-icon" },
});
/** @type {__VLS_StyleScopedClasses['social-icon']} */ ;
let __VLS_104;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent1(__VLS_104, new __VLS_104({
    size: (24),
    color: "#07c160",
}));
const __VLS_106 = __VLS_105({
    size: (24),
    color: "#07c160",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const { default: __VLS_109 } = __VLS_107.slots;
let __VLS_110;
/** @ts-ignore @type {typeof __VLS_components.ChatLineSquare} */
ChatLineSquare;
// @ts-ignore
const __VLS_111 = __VLS_asFunctionalComponent1(__VLS_110, new __VLS_110({}));
const __VLS_112 = __VLS_111({}, ...__VLS_functionalComponentArgsRest(__VLS_111));
// @ts-ignore
[];
var __VLS_107;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#",
    ...{ class: "social-icon" },
});
/** @type {__VLS_StyleScopedClasses['social-icon']} */ ;
let __VLS_115;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_116 = __VLS_asFunctionalComponent1(__VLS_115, new __VLS_115({
    size: (24),
    color: "#12b7f5",
}));
const __VLS_117 = __VLS_116({
    size: (24),
    color: "#12b7f5",
}, ...__VLS_functionalComponentArgsRest(__VLS_116));
const { default: __VLS_120 } = __VLS_118.slots;
let __VLS_121;
/** @ts-ignore @type {typeof __VLS_components.ChatDotRound} */
ChatDotRound;
// @ts-ignore
const __VLS_122 = __VLS_asFunctionalComponent1(__VLS_121, new __VLS_121({}));
const __VLS_123 = __VLS_122({}, ...__VLS_functionalComponentArgsRest(__VLS_122));
// @ts-ignore
[];
var __VLS_118;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#",
    ...{ class: "social-icon" },
});
/** @type {__VLS_StyleScopedClasses['social-icon']} */ ;
let __VLS_126;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({
    size: (24),
    color: "#00a4ef",
}));
const __VLS_128 = __VLS_127({
    size: (24),
    color: "#00a4ef",
}, ...__VLS_functionalComponentArgsRest(__VLS_127));
const { default: __VLS_131 } = __VLS_129.slots;
let __VLS_132;
/** @ts-ignore @type {typeof __VLS_components.Monitor} */
Monitor;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({}));
const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
// @ts-ignore
[];
var __VLS_129;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "register-link" },
});
/** @type {__VLS_StyleScopedClasses['register-link']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#",
});
// @ts-ignore
var __VLS_39 = __VLS_38;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
