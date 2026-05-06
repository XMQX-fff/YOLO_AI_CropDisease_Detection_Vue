<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Message, Phone } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import { useLoginApi } from '/@/api/login';

// 定义变量内容
const router = useRouter();
const loginApi = useLoginApi();
const ruleFormRef = ref<FormInstance>();

// 加载状态
const loading = ref(false);

// 密码显示状态
const showPassword = ref(false);
const showConfirmPassword = ref(false);

/*
 * 定义全局变量，等价Vue2中的data() return。
 */
const ruleForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
});

/*
 * 校验规则。
 */
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在2-20个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在3-20个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== ruleForm.password) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
});

// 注册
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const res = await loginApi.signUp({
          username: ruleForm.username,
          password: ruleForm.password,
          email: ruleForm.email,
          phone: ruleForm.phone,
          role: 'user',
        });

        if (res.code === 200) {
          ElMessage.success('注册成功！请登录');
          // 注册成功后跳转到登录页
          setTimeout(() => {
            router.push('/login');
          }, 500);
        } else {
          ElMessage.error(res.msg || '注册失败，请稍后重试');
        }
      } catch (err: any) {
        console.error('注册失败:', err);
        ElMessage.error(err.message || '注册失败，请稍后重试');
      } finally {
        loading.value = false;
      }
    } else {
      console.log('error submit!');
      return false;
    }
  });
};

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

// 返回登录页
const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="register-container">
    <!-- 注册内容 -->
    <main class="register-content">
      <div class="register-wrapper">
        <!-- 左侧品牌展示区 -->
        <div class="brand-section">
          <div class="brand-content">
            <h1>智慧农业病虫害检测平台</h1>
            <p class="slogan">加入我们，开启智慧农业之旅</p>

            <div class="features">
              <div class="feature">
                <div class="feature-icon">
                  <el-icon :size="28" color="#28a745">
                    <User />
                  </el-icon>
                </div>
                <div class="feature-text">
                  <h3>智能检测</h3>
                  <p>利用AI技术快速识别作物病虫害</p>
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">
                  <el-icon :size="28" color="#28a745">
                    <Message />
                  </el-icon>
                </div>
                <div class="feature-text">
                  <h3>知识问答</h3>
                  <p>农业专家知识库，随时解答疑问</p>
                </div>
              </div>

              <div class="feature">
                <div class="feature-icon">
                  <el-icon :size="28" color="#28a745">
                    <Phone />
                  </el-icon>
                </div>
                <div class="feature-text">
                  <h3>农资采购</h3>
                  <p>一站式农资商城，品质保障</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧注册表单 -->
        <div class="register-section">
          <div class="register-card">
            <div class="register-header">
              <h2>用户注册</h2>
              <p>创建您的账户，开始使用平台</p>
            </div>

            <el-form
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="loginRules"
              class="register-form"
              size="large"
            >
              <el-form-item prop="username">
                <div class="form-group">
                  <label for="username">用户名</label>
                  <el-input
                    id="username"
                    v-model="ruleForm.username"
                    placeholder="请输入用户名"
                    clearable
                    class="full-width-input"
                  >
                    <template #prefix>
                      <el-icon><User /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="email">
                <div class="form-group">
                  <label for="email">邮箱</label>
                  <el-input
                    id="email"
                    v-model="ruleForm.email"
                    placeholder="请输入邮箱"
                    clearable
                    class="full-width-input"
                  >
                    <template #prefix>
                      <el-icon><Message /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="phone">
                <div class="form-group">
                  <label for="phone">手机号</label>
                  <el-input
                    id="phone"
                    v-model="ruleForm.phone"
                    placeholder="请输入手机号"
                    clearable
                    class="full-width-input"
                  >
                    <template #prefix>
                      <el-icon><Phone /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="password">
                <div class="form-group">
                  <label for="password">密码</label>
                  <el-input
                    id="password"
                    v-model="ruleForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="请输入密码"
                    show-password
                    class="full-width-input"
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <div class="form-group">
                  <label for="confirmPassword">确认密码</label>
                  <el-input
                    id="confirmPassword"
                    v-model="ruleForm.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="请再次输入密码"
                    show-password
                    @keyup.enter="submitForm(ruleFormRef)"
                    class="full-width-input"
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <el-button
                type="primary"
                class="btn-register"
                :loading="loading"
                @click="submitForm(ruleFormRef)"
              >
                {{ loading ? '注册中...' : '立即注册' }}
              </el-button>
            </el-form>

            <div class="login-link">
              已有账户? <a href="javascript:void(0)" @click="goToLogin">立即登录</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 注册容器 */
.register-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
}

/* 注册内容样式 */
.register-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.register-wrapper {
  display: flex;
  width: 100%;
  max-width: 1200px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 左侧品牌展示区样式 */
.brand-section {
  flex: 1;
  padding: 60px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-content {
  max-width: 400px;
}

.brand-content h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
  line-height: 1.3;
}

.slogan {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.6;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.feature {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: #e8f5e8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.feature-text p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 右侧注册表单样式 */
.register-section {
  flex: 1;
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.register-header {
  margin-bottom: 32px;
}

.register-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.register-header p {
  font-size: 14px;
  color: #666;
}

.register-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 8px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.full-width-input {
  width: 100%;
}

.full-width-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  padding: 0 12px;
  height: 44px;
}

.full-width-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #28a745 inset;
}

.full-width-input :deep(.el-input__inner) {
  font-size: 14px;
}

.btn-register {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border: none;
  margin-top: 16px;
}

.btn-register:hover {
  background: linear-gradient(135deg, #218838 0%, #1ba87e 100%);
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #28a745;
  font-weight: 600;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-wrapper {
    flex-direction: column;
  }

  .brand-section {
    display: none;
  }

  .register-section {
    padding: 40px 24px;
  }

  .register-content {
    padding: 20px;
  }
}
</style>
