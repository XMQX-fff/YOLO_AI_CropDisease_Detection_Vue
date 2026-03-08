import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, Check, User, Lock, UserFilled, Message, Phone } from '@element-plus/icons-vue';
import { useUserApi } from '/@/api/user';
// 定义变量
const formRef = ref();
const imageUrl = ref('');
const userApi = useUserApi();
const loading = ref(false);
// 表单验证规则
const rules = {
    username: [
        { required: true, message: '请输入账号', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ],
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' }
    ],
    sex: [
        { required: true, message: '请选择性别', trigger: 'change' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    tel: [
        { required: true, message: '请输入手机号码', trigger: 'blur' }
    ]
};
// 定义表单数据
const state = reactive({
    form: {
        username: 'admin',
        password: '123456',
        name: '管理员',
        sex: '男',
        email: 'admin@example.com',
        tel: '13800138001',
        role: '管理员',
        avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar&image_size=square'
    },
});
// 获取用户信息
const getTableData = async () => {
    loading.value = true;
    try {
        // 这里假设获取当前登录用户的信息
        // 实际项目中可能需要从本地存储或状态管理中获取用户ID
        const response = await userApi.getUserDetail('admin');
        const userData = response.data;
        state.form = {
            ...userData,
            password: '' // 密码不返回
        };
        imageUrl.value = state.form.avatar;
    }
    catch (error) {
        ElMessage({
            type: 'error',
            message: '获取用户信息失败',
        });
        console.error('获取用户信息失败:', error);
        // 模拟数据
        state.form = {
            username: 'admin',
            password: '123456',
            name: '管理员',
            sex: '男',
            email: 'admin@example.com',
            tel: '13800138001',
            role: '管理员',
            avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20user%20avatar&image_size=square'
        };
        imageUrl.value = state.form.avatar;
    }
    finally {
        loading.value = false;
    }
};
// 提交表单
const submitForm = async () => {
    if (!formRef.value)
        return;
    await formRef.value.validate(async (valid, fields) => {
        if (valid) {
            loading.value = true;
            try {
                await userApi.updateUser(state.form);
                ElMessage({
                    type: 'success',
                    message: '修改成功！',
                });
            }
            catch (error) {
                ElMessage({
                    type: 'error',
                    message: '修改失败',
                });
                console.error('修改用户信息失败:', error);
            }
            finally {
                loading.value = false;
            }
        }
        else {
            ElMessage.error('请完善必填信息');
            return false;
        }
    });
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
/** @type {__VLS_StyleScopedClasses['el-input__wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['is-focus']} */ ;
/** @type {__VLS_StyleScopedClasses['personal-container']} */ ;
/** @type {__VLS_StyleScopedClasses['personal-content']} */ ;
/** @type {__VLS_StyleScopedClasses['left-section']} */ ;
/** @type {__VLS_StyleScopedClasses['avatar-card']} */ ;
/** @type {__VLS_StyleScopedClasses['right-section']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-form']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "personal-container" },
});
/** @type {__VLS_StyleScopedClasses['personal-container']} */ ;
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
    ...{ class: "personal-content" },
});
/** @type {__VLS_StyleScopedClasses['personal-content']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "left-section" },
});
/** @type {__VLS_StyleScopedClasses['left-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "avatar-card" },
});
/** @type {__VLS_StyleScopedClasses['avatar-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "avatar-wrapper" },
});
/** @type {__VLS_StyleScopedClasses['avatar-wrapper']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "avatar-content" },
});
/** @type {__VLS_StyleScopedClasses['avatar-content']} */ ;
if (__VLS_ctx.imageUrl) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        src: (__VLS_ctx.imageUrl),
        ...{ class: "avatar-image" },
    });
    /** @type {__VLS_StyleScopedClasses['avatar-image']} */ ;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "avatar-placeholder" },
    });
    /** @type {__VLS_StyleScopedClasses['avatar-placeholder']} */ ;
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        ...{ class: "upload-icon" },
    }));
    const __VLS_2 = __VLS_1({
        ...{ class: "upload-icon" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['upload-icon']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.Plus} */
    Plus;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({}));
    const __VLS_8 = __VLS_7({}, ...__VLS_functionalComponentArgsRest(__VLS_7));
    // @ts-ignore
    [imageUrl, imageUrl,];
    var __VLS_3;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
}
__VLS_asFunctionalElement1(__VLS_intrinsics.h3, __VLS_intrinsics.h3)({
    ...{ class: "welcome-text" },
});
/** @type {__VLS_StyleScopedClasses['welcome-text']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "user-role" },
});
/** @type {__VLS_StyleScopedClasses['user-role']} */ ;
(__VLS_ctx.state.form.role);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "right-section" },
});
/** @type {__VLS_StyleScopedClasses['right-section']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "info-card" },
});
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "section-title" },
});
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
let __VLS_11;
/** @ts-ignore @type {typeof __VLS_components.elForm | typeof __VLS_components.ElForm | typeof __VLS_components.elForm | typeof __VLS_components.ElForm} */
elForm;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    ref: "formRef",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rules),
    labelWidth: "100px",
    ...{ class: "info-form" },
}));
const __VLS_13 = __VLS_12({
    ref: "formRef",
    model: (__VLS_ctx.state.form),
    rules: (__VLS_ctx.rules),
    labelWidth: "100px",
    ...{ class: "info-form" },
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
var __VLS_16 = {};
/** @type {__VLS_StyleScopedClasses['info-form']} */ ;
const { default: __VLS_18 } = __VLS_14.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-grid" },
});
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
let __VLS_19;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    label: "账号",
    prop: "username",
}));
const __VLS_21 = __VLS_20({
    label: "账号",
    prop: "username",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
let __VLS_25;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_26 = __VLS_asFunctionalComponent1(__VLS_25, new __VLS_25({
    modelValue: (__VLS_ctx.state.form.username),
    placeholder: "请输入账号",
}));
const __VLS_27 = __VLS_26({
    modelValue: (__VLS_ctx.state.form.username),
    placeholder: "请输入账号",
}, ...__VLS_functionalComponentArgsRest(__VLS_26));
const { default: __VLS_30 } = __VLS_28.slots;
{
    const { prefix: __VLS_31 } = __VLS_28.slots;
    let __VLS_32;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({}));
    const __VLS_34 = __VLS_33({}, ...__VLS_functionalComponentArgsRest(__VLS_33));
    const { default: __VLS_37 } = __VLS_35.slots;
    let __VLS_38;
    /** @ts-ignore @type {typeof __VLS_components.User} */
    User;
    // @ts-ignore
    const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({}));
    const __VLS_40 = __VLS_39({}, ...__VLS_functionalComponentArgsRest(__VLS_39));
    // @ts-ignore
    [state, state, state, rules,];
    var __VLS_35;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_28;
// @ts-ignore
[];
var __VLS_22;
let __VLS_43;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
    label: "密码",
    prop: "password",
}));
const __VLS_45 = __VLS_44({
    label: "密码",
    prop: "password",
}, ...__VLS_functionalComponentArgsRest(__VLS_44));
const { default: __VLS_48 } = __VLS_46.slots;
let __VLS_49;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_50 = __VLS_asFunctionalComponent1(__VLS_49, new __VLS_49({
    modelValue: (__VLS_ctx.state.form.password),
    type: "password",
    placeholder: "请输入密码",
    showPassword: true,
}));
const __VLS_51 = __VLS_50({
    modelValue: (__VLS_ctx.state.form.password),
    type: "password",
    placeholder: "请输入密码",
    showPassword: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_50));
const { default: __VLS_54 } = __VLS_52.slots;
{
    const { prefix: __VLS_55 } = __VLS_52.slots;
    let __VLS_56;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({}));
    const __VLS_58 = __VLS_57({}, ...__VLS_functionalComponentArgsRest(__VLS_57));
    const { default: __VLS_61 } = __VLS_59.slots;
    let __VLS_62;
    /** @ts-ignore @type {typeof __VLS_components.Lock} */
    Lock;
    // @ts-ignore
    const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({}));
    const __VLS_64 = __VLS_63({}, ...__VLS_functionalComponentArgsRest(__VLS_63));
    // @ts-ignore
    [state,];
    var __VLS_59;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_52;
// @ts-ignore
[];
var __VLS_46;
let __VLS_67;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
    label: "姓名",
    prop: "name",
}));
const __VLS_69 = __VLS_68({
    label: "姓名",
    prop: "name",
}, ...__VLS_functionalComponentArgsRest(__VLS_68));
const { default: __VLS_72 } = __VLS_70.slots;
let __VLS_73;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    modelValue: (__VLS_ctx.state.form.name),
    placeholder: "请输入姓名",
}));
const __VLS_75 = __VLS_74({
    modelValue: (__VLS_ctx.state.form.name),
    placeholder: "请输入姓名",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
const { default: __VLS_78 } = __VLS_76.slots;
{
    const { prefix: __VLS_79 } = __VLS_76.slots;
    let __VLS_80;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({}));
    const __VLS_82 = __VLS_81({}, ...__VLS_functionalComponentArgsRest(__VLS_81));
    const { default: __VLS_85 } = __VLS_83.slots;
    let __VLS_86;
    /** @ts-ignore @type {typeof __VLS_components.UserFilled} */
    UserFilled;
    // @ts-ignore
    const __VLS_87 = __VLS_asFunctionalComponent1(__VLS_86, new __VLS_86({}));
    const __VLS_88 = __VLS_87({}, ...__VLS_functionalComponentArgsRest(__VLS_87));
    // @ts-ignore
    [state,];
    var __VLS_83;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_76;
// @ts-ignore
[];
var __VLS_70;
let __VLS_91;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_92 = __VLS_asFunctionalComponent1(__VLS_91, new __VLS_91({
    label: "性别",
    prop: "sex",
}));
const __VLS_93 = __VLS_92({
    label: "性别",
    prop: "sex",
}, ...__VLS_functionalComponentArgsRest(__VLS_92));
const { default: __VLS_96 } = __VLS_94.slots;
let __VLS_97;
/** @ts-ignore @type {typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect} */
elSelect;
// @ts-ignore
const __VLS_98 = __VLS_asFunctionalComponent1(__VLS_97, new __VLS_97({
    modelValue: (__VLS_ctx.state.form.sex),
    placeholder: "请选择性别",
}));
const __VLS_99 = __VLS_98({
    modelValue: (__VLS_ctx.state.form.sex),
    placeholder: "请选择性别",
}, ...__VLS_functionalComponentArgsRest(__VLS_98));
const { default: __VLS_102 } = __VLS_100.slots;
let __VLS_103;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_104 = __VLS_asFunctionalComponent1(__VLS_103, new __VLS_103({
    label: "男",
    value: "男",
}));
const __VLS_105 = __VLS_104({
    label: "男",
    value: "男",
}, ...__VLS_functionalComponentArgsRest(__VLS_104));
let __VLS_108;
/** @ts-ignore @type {typeof __VLS_components.elOption | typeof __VLS_components.ElOption} */
elOption;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
    label: "女",
    value: "女",
}));
const __VLS_110 = __VLS_109({
    label: "女",
    value: "女",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
// @ts-ignore
[state,];
var __VLS_100;
// @ts-ignore
[];
var __VLS_94;
let __VLS_113;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    label: "Email",
    prop: "email",
}));
const __VLS_115 = __VLS_114({
    label: "Email",
    prop: "email",
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
const { default: __VLS_118 } = __VLS_116.slots;
let __VLS_119;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_120 = __VLS_asFunctionalComponent1(__VLS_119, new __VLS_119({
    modelValue: (__VLS_ctx.state.form.email),
    placeholder: "请输入Email",
}));
const __VLS_121 = __VLS_120({
    modelValue: (__VLS_ctx.state.form.email),
    placeholder: "请输入Email",
}, ...__VLS_functionalComponentArgsRest(__VLS_120));
const { default: __VLS_124 } = __VLS_122.slots;
{
    const { prefix: __VLS_125 } = __VLS_122.slots;
    let __VLS_126;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_127 = __VLS_asFunctionalComponent1(__VLS_126, new __VLS_126({}));
    const __VLS_128 = __VLS_127({}, ...__VLS_functionalComponentArgsRest(__VLS_127));
    const { default: __VLS_131 } = __VLS_129.slots;
    let __VLS_132;
    /** @ts-ignore @type {typeof __VLS_components.Message} */
    Message;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent1(__VLS_132, new __VLS_132({}));
    const __VLS_134 = __VLS_133({}, ...__VLS_functionalComponentArgsRest(__VLS_133));
    // @ts-ignore
    [state,];
    var __VLS_129;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_122;
// @ts-ignore
[];
var __VLS_116;
let __VLS_137;
/** @ts-ignore @type {typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem | typeof __VLS_components.elFormItem | typeof __VLS_components.ElFormItem} */
elFormItem;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
    label: "手机号码",
    prop: "tel",
}));
const __VLS_139 = __VLS_138({
    label: "手机号码",
    prop: "tel",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
const { default: __VLS_142 } = __VLS_140.slots;
let __VLS_143;
/** @ts-ignore @type {typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components.elInput | typeof __VLS_components.ElInput} */
elInput;
// @ts-ignore
const __VLS_144 = __VLS_asFunctionalComponent1(__VLS_143, new __VLS_143({
    modelValue: (__VLS_ctx.state.form.tel),
    placeholder: "请输入手机号码",
}));
const __VLS_145 = __VLS_144({
    modelValue: (__VLS_ctx.state.form.tel),
    placeholder: "请输入手机号码",
}, ...__VLS_functionalComponentArgsRest(__VLS_144));
const { default: __VLS_148 } = __VLS_146.slots;
{
    const { prefix: __VLS_149 } = __VLS_146.slots;
    let __VLS_150;
    /** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
    elIcon;
    // @ts-ignore
    const __VLS_151 = __VLS_asFunctionalComponent1(__VLS_150, new __VLS_150({}));
    const __VLS_152 = __VLS_151({}, ...__VLS_functionalComponentArgsRest(__VLS_151));
    const { default: __VLS_155 } = __VLS_153.slots;
    let __VLS_156;
    /** @ts-ignore @type {typeof __VLS_components.Phone} */
    Phone;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent1(__VLS_156, new __VLS_156({}));
    const __VLS_158 = __VLS_157({}, ...__VLS_functionalComponentArgsRest(__VLS_157));
    // @ts-ignore
    [state,];
    var __VLS_153;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_146;
// @ts-ignore
[];
var __VLS_140;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "form-footer" },
});
/** @type {__VLS_StyleScopedClasses['form-footer']} */ ;
let __VLS_161;
/** @ts-ignore @type {typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components.elButton | typeof __VLS_components.ElButton} */
elButton;
// @ts-ignore
const __VLS_162 = __VLS_asFunctionalComponent1(__VLS_161, new __VLS_161({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "submit-button" },
    loading: (__VLS_ctx.loading),
}));
const __VLS_163 = __VLS_162({
    ...{ 'onClick': {} },
    type: "primary",
    ...{ class: "submit-button" },
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_162));
let __VLS_166;
const __VLS_167 = ({ click: {} },
    { onClick: (__VLS_ctx.submitForm) });
/** @type {__VLS_StyleScopedClasses['submit-button']} */ ;
const { default: __VLS_168 } = __VLS_164.slots;
let __VLS_169;
/** @ts-ignore @type {typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon | typeof __VLS_components.elIcon | typeof __VLS_components.ElIcon} */
elIcon;
// @ts-ignore
const __VLS_170 = __VLS_asFunctionalComponent1(__VLS_169, new __VLS_169({}));
const __VLS_171 = __VLS_170({}, ...__VLS_functionalComponentArgsRest(__VLS_170));
const { default: __VLS_174 } = __VLS_172.slots;
let __VLS_175;
/** @ts-ignore @type {typeof __VLS_components.Check} */
Check;
// @ts-ignore
const __VLS_176 = __VLS_asFunctionalComponent1(__VLS_175, new __VLS_175({}));
const __VLS_177 = __VLS_176({}, ...__VLS_functionalComponentArgsRest(__VLS_176));
// @ts-ignore
[loading, submitForm,];
var __VLS_172;
// @ts-ignore
[];
var __VLS_164;
var __VLS_165;
// @ts-ignore
[];
var __VLS_14;
// @ts-ignore
var __VLS_17 = __VLS_16;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
