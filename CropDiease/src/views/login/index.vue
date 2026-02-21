<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { FormInstance, FormRules } from 'element-plus';

// 定义变量内容
const router = useRouter();
const ruleFormRef = ref<FormInstance>();

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
const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在3-20个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在3-20个字符', trigger: 'blur' },
  ],
});

// 登录
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate((valid) => {
    if (valid) {
      // 模拟登录成功
      console.log('登录成功', ruleForm);
      // 登录成功后跳转到首页
      router.push('/');
    } else {
      console.log('error submit!');
      return false;
    }
  });
};
</script>

<template>
  <div class="login-container">
    <!-- 页首 -->
    <header class="header">
      <!-- Logo -->
      <div class="logo">
        <a href="#">
          <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=agriculture%20china%20logo%20green%20color%20simple%20design&image_size=square" alt="农业中国" />
        </a>
      </div>
      
      <!-- 一级目录 -->
      <nav class="main-nav">
        <ul>
          <li><a href="#">首页</a></li>
          <li><a href="#">农业新闻</a></li>
          <li><a href="#">政策法规</a></li>
          <li><a href="#">市场动态</a></li>
          <li><a href="#">农业科技</a></li>
        </ul>
      </nav>
      
      <!-- 搜索栏和天气信息 -->
      <div class="header-right">
        <div class="search-box">
          <input type="text" placeholder="搜索" />
          <button>搜索</button>
        </div>
        <div class="weather-info">
          <span>北京 晴 20°C</span>
        </div>
      </div>
    </header>
    
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
                  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seedling%20icon%20green%20color%20simple%20design&image_size=square" alt="实时作物监测" />
                </div>
                <div class="feature-text">
                  <h3>实时作物监测</h3>
                  <p>通过AI技术实时监测作物健康状况，及时发现病虫害</p>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">
                  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chart%20icon%20green%20color%20simple%20design&image_size=square" alt="数据分析报告" />
                </div>
                <div class="feature-text">
                  <h3>数据分析报告</h3>
                  <p>深度分析作物生长趋势，生成科学种植建议</p>
                </div>
              </div>
              
              <div class="feature">
                <div class="feature-icon">
                  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shield%20icon%20green%20color%20simple%20design&image_size=square" alt="智能预警系统" />
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
            
            <form class="login-form">
              <div class="form-group">
                <label for="username">用户名</label>
                <div class="input-with-icon">
                  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20icon%20gray%20color%20simple%20design&image_size=square" alt="用户" class="input-icon" />
                  <input type="text" id="username" v-model="ruleForm.username" placeholder="请输入用户名" required />
                </div>
              </div>
              
              <div class="form-group">
                <label for="password">密码</label>
                <div class="input-with-icon">
                  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lock%20icon%20gray%20color%20simple%20design&image_size=square" alt="密码" class="input-icon" />
                  <input type="password" id="password" v-model="ruleForm.password" placeholder="请输入密码" required />
                </div>
              </div>
              
              <div class="remember-forgot">
                <div class="remember">
                  <input type="checkbox" id="remember" />
                  <label for="remember">记住我</label>
                </div>
                <a href="#" class="forgot-password">忘记密码?</a>
              </div>
              
              <button type="button" class="btn-login" @click="submitForm">
                登录系统
              </button>
            </form>
            
            <div class="social-login">
              <p>或使用其他方式登录</p>
              <div class="social-icons">
                <a href="#" class="social-icon">
                  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wechat%20icon%20green%20color%20simple%20design&image_size=square" alt="微信" />
                </a>
                <a href="#" class="social-icon">
                  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=qq%20icon%20blue%20color%20simple%20design&image_size=square" alt="QQ" />
                </a>
                <a href="#" class="social-icon">
                  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=microsoft%20icon%20blue%20color%20simple%20design&image_size=square" alt="微软" />
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
    
    <!-- 页脚 -->
    <footer class="footer">
      <p>© 2026 农业中国 - 中国网</p>
      <p>电话：0086-10-88824995 传真：0086-10-88828231</p>
    </footer>
  </div>
</template>

<style scoped>
/* 登录容器 */
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

/* 页首样式 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  height: 80px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Logo样式 */
.logo img {
  height: 60px;
}

/* 一级目录样式 */
.main-nav ul {
  display: flex;
  list-style: none;
}

.main-nav li {
  margin: 0 15px;
}

.main-nav a {
  text-decoration: none;
  color: #333;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s;
}

.main-nav a:hover {
  color: #28a745;
}

/* 页首右侧样式 */
.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 搜索栏样式 */
.search-box {
  display: flex;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  outline: none;
}

.search-box button {
  padding: 8px 16px;
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-box button:hover {
  background-color: #218838;
}

/* 天气信息样式 */
.weather-info {
  font-size: 14px;
  color: #666;
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

.feature-icon img {
  width: 24px;
  height: 24px;
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
}

.input-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: #999;
}

.input-with-icon input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.input-with-icon input:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
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

.social-icon img {
  width: 24px;
  height: 24px;
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

/* 页脚样式 */
.footer {
  background-color: #f8f9fa;
  padding: 24px;
  text-align: center;
  border-top: 1px solid #e0e0e0;
}

.footer p {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
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
  
  .header {
    padding: 0 20px;
  }
  
  .main-nav li {
    margin: 0 10px;
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
  
  .header {
    flex-wrap: wrap;
    height: auto;
    padding: 16px;
    gap: 16px;
  }
  
  .main-nav {
    width: 100%;
    order: 3;
  }
  
  .main-nav ul {
    justify-content: center;
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