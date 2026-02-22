<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { 
  User, Lock, 
  Food, DataAnalysis, WarningFilled, 
  ChatLineSquare, ChatDotRound, Monitor 
} from '@element-plus/icons-vue';
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
const loginRules = reactive<FormRules>({
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
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
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
        } else {
          ElMessage.error(res.msg || '登录失败，请检查用户名和密码');
        }
      } catch (err: any) {
        console.error('登录失败:', err);
        ElMessage.error(err.message || '登录失败，请稍后重试');
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
</script>

<template>
  <div class="login-container">
    <!-- 登录内容 -->
    <main class="login-content">
      <div class="login-wrapper">
        <!-- 左侧品牌展示区 -->
        <div class="brand-section">
          <div class="brand-content">
            
            <h1>智慧农业病虫害检测平台</h1>
            <p class="slogan">利用AI技术实时监测作物健康状况，及时发现病虫害</p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">
                  <el-icon :size="28" color="#28a745">
                    <Food />
                  </el-icon>
                </div>
                <div class="feature-text">
                  <h3>实时作物监测</h3>
                  <p>通过AI技术实时监测作物健康状况，及时发现病虫害</p>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">
                  <el-icon :size="28" color="#28a745">
                    <DataAnalysis />
                  </el-icon>
                </div>
                <div class="feature-text">
                  <h3>数据分析报告</h3>
                  <p>深度分析作物生长趋势，生成科学种植建议</p>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">
                  <el-icon :size="28" color="#28a745">
                    <WarningFilled />
                  </el-icon>
                </div>
                <div class="feature-text">
                  <h3>智能预警系统</h3>
                  <p>提前预警潜在风险，保障作物产量和品质</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧登录表单 -->
        <div class="login-section">
          <div class="login-card">
            <div class="login-header">
              <h2>欢迎登录</h2>
              <p>请输入您的账号和密码</p>
            </div>
            
            <el-form
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="loginRules"
              class="login-form"
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
              
              <el-form-item prop="password">
                <div class="form-group">
                  <label for="password">密码</label>
                  <el-input
                    id="password"
                    v-model="ruleForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="请输入密码"
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
              
              <div class="remember-forgot">
                <div class="remember">
                  <el-checkbox id="remember" />
                  <label for="remember">记住我</label>
                </div>
                <a href="#" class="forgot-password">忘记密码?</a>
              </div>
              
              <el-button
                type="primary"
                class="btn-login"
                :loading="loading"
                @click="submitForm(ruleFormRef)"
              >
                {{ loading ? '登录中...' : '登录系统' }}
              </el-button>
            </el-form>
            
            <div class="social-login">
              <p></p>
              <div class="social-icons">
                <a href="#" class="social-icon">
                  <el-icon :size="24" color="#07c160">
                    <ChatLineSquare />
                  </el-icon>
                </a>
                <a href="#" class="social-icon">
                  <el-icon :size="24" color="#12b7f5">
                    <ChatDotRound />
                  </el-icon>
                </a>
                <a href="#" class="social-icon">
                  <el-icon :size="24" color="#00a4ef">
                    <Monitor />
                  </el-icon>
                </a>
              </div>
            </div>
            
            <div class="register-link">
              还没有账户? <a href="#">立即注册</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* 登录容器 */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
}

/* 登录Logo样式 */
.login-logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background-color: #e8f5e8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 登录内容样式 */
.login-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-wrapper {
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
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
  font-weight: 600;
}

.brand-content .slogan {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
  line-height: 1.5;
}

/* 特性列表样式 */
.features {
  margin-top: 40px;
}

.feature {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

.feature-icon {
  width: 50px;
  height: 50px;
  background-color: #e8f5e8;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}



.feature-text h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

.feature-text p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* 右侧登录表单样式 */
.login-section {
  width: 450px;
  padding: 60px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
}

.login-card {
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.login-header p {
  font-size: 14px;
  color: #666;
}

/* 表单样式 */
.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: #999;
  z-index: 10;
}

.input-with-icon :deep(.el-input__wrapper) {
  padding-left: 40px;
}

.input-with-icon :deep(.el-input) {
  width: 100%;
}

.full-width-input {
  width: 100%;
}

.full-width-input :deep(.el-input__wrapper) {
  width: 100%;
}

/* 记住我和忘记密码样式 */
.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  font-size: 14px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.remember label {
  color: #666;
  cursor: pointer;
  margin: 0;
}

.forgot-password {
  color: #28a745;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #218838;
  text-decoration: underline;
}

/* 登录按钮样式 */
.btn-login {
  width: 100%;
  padding: 14px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 32px;
}

.btn-login:hover {
  background-color: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

/* 社交登录样式 */
.social-login {
  text-align: center;
  margin-bottom: 32px;
}

.social-login p {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  position: relative;
}

.social-login p::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #e0e0e0;
  z-index: 1;
}

.social-login p::after {
  content: '或使用其他方式登录';
  position: relative;
  background-color: #fff;
  padding: 0 16px;
  z-index: 2;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-icon {
  width: 48px;
  height: 48px;
  background-color: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.social-icon:hover {
  background-color: #e8f5e8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}



/* 注册链接样式 */
.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-link a {
  color: #28a745;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.register-link a:hover {
  color: #218838;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .login-wrapper {
    flex-direction: column;
  }
  
  .brand-section {
    width: 100%;
    padding: 40px;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .login-section {
    width: 100%;
    padding: 40px;
    border-left: none;
  }
}

@media (max-width: 768px) {
  .login-content {
    padding: 20px;
  }
  
  .brand-section {
    padding: 30px;
  }
  
  .login-section {
    padding: 30px;
  }
}

@media (max-width: 576px) {
  .brand-content h1 {
    font-size: 24px;
  }
  
  .remember-forgot {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>