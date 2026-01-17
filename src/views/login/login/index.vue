<template>
	<div class="login-container">
		<div class="grid-bg"></div>
		<div class="glow-effect"></div>
		
		<div class="container">
			<!-- 左侧品牌展示区 -->
			<div class="brand-section">
				<div class="particles-background" id="particles"></div>
				<div class="brand-content">
					<div class="logo">
						<h1>AgriSmart</h1>
					</div>
					<div class="slogan">
						智慧农业病虫害检测平台
					</div>

					<div class="features">
						<div class="feature">
							<div class="feature-icon">
								<i class="fa-solid fa-seedling"></i>
							</div>
							<div class="feature-text">
								<h3>实时作物监测</h3>
								<p>通过AI技术实时监测作物健康状况，及时发现病虫害</p>
							</div>
						</div>

						<div class="feature">
							<div class="feature-icon">
								<i class="fa-solid fa-chart-line"></i>
							</div>
							<div class="feature-text">
								<h3>数据分析报告</h3>
								<p>深度分析作物生长趋势，生成科学种植建议</p>
							</div>
						</div>

						<div class="feature">
							<div class="feature-icon">
								<i class="fa-solid fa-shield-alt"></i>
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
				<div class="login-header">
					<h2>欢迎回来</h2>
					<p>请登录您的账户以继续</p>
				</div>

				<el-form :model="ruleForm" :rules="registerRules" ref="ruleFormRef" class="login-form">
					<el-form-item prop="username">
						<div class="form-group">
							<label for="username">用户名</label>
							<div class="input-with-icon">
								<i class="fa-solid fa-user"></i>
								<el-input v-model="ruleForm.username" placeholder="请输入用户名" prefix-icon="" class="custom-input" id="username" />
							</div>
						</div>
					</el-form-item>

					<el-form-item prop="password">
						<div class="form-group">
							<label for="password">密码</label>
							<div class="input-with-icon">
								<i class="fa-solid fa-lock"></i>
								<el-input v-model="ruleForm.password" type="password" placeholder="请输入密码" prefix-icon="" show-password class="custom-input" id="password" />
							</div>
						</div>
					</el-form-item>

					<div class="remember-forgot">
						<div class="remember">
							<input type="checkbox" id="remember">
							<label for="remember">记住我</label>
						</div>
						<a href="#" class="forgot-password">忘记密码?</a>
					</div>

					<el-form-item>
						<el-button type="primary" class="btn-login" @click="submitForm(ruleFormRef)">
							<i class="fa-solid fa-right-to-bracket"></i> 登录系统
						</el-button>
					</el-form-item>
				</el-form>

				<div class="social-login">
					<p>或使用其他方式登录</p>
					<div class="social-icons">
						<a href="#" class="social-icon">
							<i class="fa-brands fa-weixin"></i>
						</a>
						<a href="#" class="social-icon">
							<i class="fa-brands fa-qq"></i>
						</a>
						<a href="#" class="social-icon">
							<i class="fa-brands fa-microsoft"></i>
						</a>
					</div>
				</div>

				<div class="register-link">
					还没有账户? <router-link to="/register">立即注册</router-link>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { reactive, computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElButton, ElForm, ElFormItem, ElInput } from 'element-plus';
import { useI18n } from 'vue-i18n';
import Cookies from 'js-cookie';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import type { FormInstance, FormRules } from 'element-plus';
import request from '/@/utils/request';

// 定义变量内容
const { t } = useI18n();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const route = useRoute();
const router = useRouter();
const formSize = ref('default');
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

/*
 * 提交后的方法。
 */
// 时间获取
const currentTime = computed(() => {
	return formatAxis(new Date());
});
// 登录
const onSignIn = async () => {
	// 存储 token 到浏览器缓存
	Session.set('token', Math.random().toString(36).substr(0));
	// 模拟数据，对接接口时，记得删除多余代码及对应依赖的引入。用于 `/src/stores/userInfo.ts` 中不同用户登录判断（模拟数据）
	Cookies.set('userName', ruleForm.username);
	if (!themeConfig.value.isRequestRoutes) {
		// 前端控制路由，2、请注意执行顺序
		const isNoPower = await initFrontEndControlRoutes();
		signInSuccess(isNoPower);
	} else {
		// 模拟后端控制路由，isRequestRoutes 为 true，则开启后端控制路由
		// 添加完动态路由，再进行 router 跳转，否则可能报错 No match found for location with path "/"
		const isNoPower = await initBackEndControlRoutes();
		// 执行完 initBackEndControlRoutes，再执行 signInSuccess
		signInSuccess(isNoPower);
	}
};
// 登录成功后的跳转
const signInSuccess = (isNoPower: boolean | undefined) => {
	if (isNoPower) {
		ElMessage.warning('抱歉，您没有登录权限');
		Session.clear();
	} else {
		// 初始化登录成功时间问候语
		let currentTimeInfo = currentTime.value;
		// 登录成功，跳到转首页
		// 如果是复制粘贴的路径，非首页/登录页，那么登录成功后重定向到对应的路径中
		if (route.query?.redirect) {
			router.push({
				path: <string>route.query?.redirect,
				query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
			});
		} else {
			router.push('/');
		}
		// 登录成功提示
		const signInText = t('message.signInText');
		ElMessage.success(`${currentTimeInfo}，${signInText}`);
		// 添加 loading，防止第一次进入界面时出现短暂空白
		NextLoading.start();
	}
};
const submitForm = (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	formEl.validate((valid) => {
		if (valid) {
			request.post('/api/user/login', ruleForm).then((res) => {
				console.log(res);
				if (res.code == 0) {
					Cookies.set('role', res.data.role); //  设置角色
					//登录成功
					onSignIn();
				} else {
					ElMessage({
						type: 'error',
						message: res.msg,
					});
				}
			});
		} else {
			console.log('error submit!');
			return false;
		}
	});
};

// 页面加载完成后初始化粒子效果
onMounted(() => {
	createParticles();
});

// 创建粒子背景
function createParticles() {
	const container = document.querySelector('.particles-background');
	const particleCount = 50;

	for (let i = 0; i < particleCount; i++) {
		const particle = document.createElement('div');
		particle.classList.add('particle');

		// 随机大小
		const size = Math.random() * 8 + 2;
		particle.style.width = `${size}px`;
		particle.style.height = `${size}px`;

		// 随机位置
		particle.style.left = `${Math.random() * 100}%`;
		particle.style.top = `${Math.random() * 100}%`;

		// 随机透明度
		const opacity = Math.random() * 0.5 + 0.2;
		particle.style.opacity = opacity;

		// 随机动画
		const animationDuration = Math.random() * 20 + 10;
		particle.style.animation = `float ${animationDuration}s infinite ease-in-out`;

		// 随机颜色变化 - 农业相关绿色调
		const hue = Math.floor(Math.random() * 60) + 90; // 绿色系范围
		particle.style.backgroundColor = `hsla(${hue}, 100%, 60%, ${opacity})`;

		if (container) {
			container.appendChild(particle);
		}
	}
}

import { onMounted } from 'vue';
</script>

<style scoped>
:root {
	--primary: #2e7d32; /* 农业绿色主题 */
	--secondary: #388e3c;
	--accent: #4caf50;
	--light: #f8f9fc;
	--dark: #0d260d;
	--gray: #6c757d;
}

.login-container {
	min-height: 100vh;
	width: 100vw;
	overflow: hidden;
	position: relative;
}

.grid-bg {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background:
		linear-gradient(rgba(46, 125, 50, 0.05) 1px, transparent 1px),
		linear-gradient(90deg, rgba(46, 125, 50, 0.05) 1px, transparent 1px);
	background-size: 30px 30px;
	z-index: -2;
}

.glow-effect {
	position: absolute;
	width: 100%;
	height: 100%;
	background: radial-gradient(circle at center, rgba(46, 125, 50, 0.15) 0%, transparent 70%);
	z-index: -1;
	animation: glowPulse 8s infinite alternate;
}

.container {
	display: flex;
	width: 100%;
	height: 100vh;
}

.brand-section {
	flex: 1;
	position: relative;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 40px;
	z-index: 1;
	overflow: hidden;
	border-right: 1px solid rgba(46, 125, 50, 0.3);
}

.particles-background {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1;
}

.brand-content {
	max-width: 600px;
	text-align: center;
	z-index: 2;
}

.logo {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 30px;
	position: relative;
}

.logo h1 {
	font-size: 6rem;
	font-weight: 700;
	letter-spacing: 2px;
	font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
	text-transform: uppercase;
	background: linear-gradient(to right, var(--accent), var(--primary));
	-webkit-text-fill-color:#388e3c;
	text-shadow: 0 0 15px rgba(46, 125, 50, 0.5);
	position: relative;

}

.logo::after {
	content: '';
	position: absolute;
	bottom: -15px;
	left: 50%;
	transform: translateX(-50%);
	width: 120px;
	height: 3px;
	background: linear-gradient(90deg, transparent, var(--accent), transparent);
}

.slogan {
	font-size: 1.8rem;
	margin: 30px 0;
	font-weight: 300;
	line-height: 1.4;
	color: rgba(163, 163, 156, 0.85);
	text-shadow: 0 0 20px rgba(49, 121, 49, 0.5);
}

.features {
	text-align: left;
	max-width: 500px;
	margin: 40px auto;
}

.feature {
	display: flex;
	align-items: flex-start;
	margin-bottom: 25px;
	padding: 20px;
	background: rgba(198, 243, 198, 0.3);
	border-radius: 10px;
	backdrop-filter: blur(5px);
	transition: all 0.4s ease;
	border: 1px solid rgba(46, 125, 50, 0.2);
	position: relative;
	overflow: hidden;
}

.feature::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(46, 125, 50, 0.2), transparent);
	transition: 0.6s;
}

.feature:hover {
	background: rgba(13, 38, 13, 0.5);
	transform: translateY(-5px);
	box-shadow: 0 10px 30px rgba(46, 125, 50, 0.2);
}

.feature:hover::before {
	left: 100%;
}

.feature-icon {
	min-width: 50px;
	height: 50px;
	background: rgba(46, 125, 50, 0.2);
	border-radius: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	margin-right: 20px;
	color: var(--accent);
	border: 1px solid var(--primary);
	box-shadow: 0 0 15px rgba(46, 125, 50, 0.3);
}

.feature-text h3 {
	font-size: 1.2rem;
	margin-bottom: 8px;
	color: var(--accent);
	font-weight: 600;
}

.feature-text p {
	font-size: 0.95rem;
	opacity: 0.8;
	line-height: 1.6;
}

.login-section {
	width: 450px;
	background: linear-gradient(rgba(13, 38, 13, 0.4), rgba(13, 38, 13, 0.3)), url('@/assets/login-bg.svg');
	background-size: cover;
	background-position: center;
	backdrop-filter: blur(8px);
	padding: 60px 50px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	box-shadow: 0 0 50px rgba(46, 125, 50, 0.3);
	z-index: 2;
	position: relative;
	overflow-y: auto;
	border-left: 1px solid rgba(46, 125, 50, 0.3);
	border-radius: 8px;
}

.login-header {
	text-align: center;
	margin-bottom: 40px;
}

.login-header h2 {
	font-size: 2.2rem;
	margin-bottom: 10px;
	background: linear-gradient(to right, var(--accent), var(--primary));
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
	letter-spacing: 1px;
}

.login-header p {
	color: rgba(255, 255, 255, 0.7);
	font-size: 1.1rem;
}

.form-group {
	margin-bottom: 28px;
	position: relative;
	width: 400px;
}

.login-form label {
	display: block;
	margin-bottom: 10px;
	font-size: 0.95rem;
	font-weight: 500;
	color: rgba(255, 255, 255, 0.9);
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.input-with-icon {
	position: relative;
	background: rgba(13, 38, 13, 0.4);
	border-radius: 12px;
	transition: all 0.3s ease;
	backdrop-filter: blur(5px);
}

.input-with-icon:hover {
	background: rgba(13, 38, 13, 0.5);
	box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

.input-with-icon i {
	position: absolute;
	left: 18px;
	top: 50%;
	transform: translateY(-50%);
	color: var(--accent);
	font-size: 20px;
	z-index: 2;
	transition: all 0.3s ease;
}

/* 覆盖Element Plus的输入框默认样式 */
:deep(.el-input__wrapper) {
	width: 100%;
	padding: 16px 22px 16px 50px;
	background-color: transparent !important;
	border: 1px solid rgba(46, 125, 50, 0.6) !important;
	border-radius: 12px;
	color: white;
	font-size: 16px;
	transition: all 0.3s ease;
	position: relative;
	z-index: 1;
	box-shadow: none !important;
	box-sizing: border-box;
}

:deep(.el-input__wrapper):hover {
	border: 1px solid rgba(76, 175, 80, 0.9) !important;
	box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2) inset !important;
}

:deep(.el-input__wrapper).is-focus,
:deep(.el-input__wrapper):focus-within {
	border: 1px solid var(--accent) !important;
	outline: none;
	background-color: rgba(13, 38, 13, 0.3) !important;
	box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.3) !important;
	transform: translateY(-2px);
}

/* 修复浏览器自动填充时的样式问题 */
:deep(.el-input__inner) {
	background-color: transparent !important;
	color: white !important;
}

/* 针对Chrome、Safari等浏览器的自动填充样式 */
:deep(.el-input__inner:-webkit-autofill),
:deep(.el-input__inner:-webkit-autofill:hover),
:deep(.el-input__inner:-webkit-autofill:focus),
:deep(.el-input__inner:-webkit-autofill:active) {
	-webkit-box-shadow: 0 0 0 30px rgba(13, 38, 13, 0.5) inset !important;
	-webkit-text-fill-color: white !important;
	border: 1px solid rgba(46, 125, 50, 0.5) !important;
	transition: background-color 5000s ease-in-out 0s !important;
}

/* 针对Firefox浏览器的自动填充样式 */
:deep(.el-input__inner)::-moz-selection {
	background-color: transparent !important;
	color: white !important;
}




.remember-forgot {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30px;
	padding: 0 5px;
}

.remember {
	display: flex;
	align-items: center;
	cursor: pointer;
}

.remember input {
	width: 18px;
	margin-right: 10px;
	cursor: pointer;
}

.remember input:hover {
	transform: scale(1.1);
}

.remember label {
	margin: 0;
	cursor: pointer;
	transition: all 0.3s ease;
}

.remember:hover label {
	color: var(--accent);
}

.forgot-password {
	color: var(--accent);
	text-decoration: none;
	transition: all 0.3s ease;
	font-weight: 500;
	font-size: 0.9rem;
	position: relative;
	padding: 2px 0;
}

.forgot-password::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 0;
	height: 2px;
	background: var(--accent);
	transition: width 0.3s ease;
}

.forgot-password:hover {
	color: #4ddbff;
	text-decoration: none;
}

.forgot-password:hover::after {
	width: 100%;
}

.btn-login {
	width: 100%;
	padding: 16px;
	background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
	border: none;
	border-radius: 12px;
	color: white;
	font-size: 17px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.3s ease;
	margin-bottom: 28px;
	position: relative;
	overflow: hidden;
	letter-spacing: 1px;
	font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
	box-shadow: 0 6px 20px rgba(46, 125, 50, 0.4);
	height: auto;
	text-transform: uppercase;
}

.btn-login::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
	transition: 0.5s;
}

.btn-login:hover {
	transform: translateY(-3px);
	box-shadow: 0 10px 25px rgba(46, 125, 50, 0.6);
}

.btn-login:hover::before {
	left: 100%;
}

.social-login {
	text-align: center;
	margin: 30px 0;
	position: relative;
	padding: 15px 0;
}

.social-login::before,
.social-login::after {
	content: '';
	position: absolute;
	top: 50%;
	width: 35%;
	height: 1px;
	background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.6), transparent);
}

.social-login::before {
	left: 0;
}

.social-login::after {
	right: 0;
}

.social-login p {
	margin-bottom: 20px;
	color: rgba(255, 255, 255, 0.9);
	font-size: 0.95rem;
	position: relative;
	z-index: 1;
	display: inline-block;
	padding: 8px 16px;
	border-radius: 20px;
	border: 1px solid rgba(76, 175, 80, 0.6);
	background: transparent;
	backdrop-filter: none;
	font-weight: 500;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	transition: all 0.3s ease;
}

.social-login p:hover {
	border-color: var(--accent);
	color: var(--accent);
	transform: translateY(-2px);
}

.social-icons {
	display: flex;
	justify-content: center;
	gap: 18px;
}

.social-icon {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(13, 38, 13, 0.4);
	color: white;
	font-size: 20px;
	transition: all 0.3s ease;
	border: 1px solid rgba(46, 125, 50, 0.4);
	backdrop-filter: blur(5px);
	position: relative;
	overflow: hidden;
}

.social-icon::before {
	content: '';
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, transparent, rgba(76, 175, 80, 0.3), transparent);
	transition: 0.5s;
}

.social-icon:hover {
	transform: translateY(-5px) scale(1.05);
	background: linear-gradient(135deg, var(--primary), var(--accent));
	box-shadow: 0 8px 25px rgba(46, 125, 50, 0.5);
	border-color: rgba(76, 175, 80, 0.8);
}

.social-icon:hover::before {
	left: 100%;
}

.register-link {
	text-align: center;
	margin-top: 25px;
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.95rem;
	padding: 15px 0;
}

.register-link a {
	color: var(--accent);
	text-decoration: none;
	font-weight: 600;
	margin-left: 5px;
	transition: all 0.3s ease;
	position: relative;
	padding: 3px 0;
}

.register-link a::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 0;
	width: 0;
	height: 2px;
	background: var(--accent);
	transition: width 0.3s ease;
}

.register-link a:hover {
	text-decoration: none;
	color: #4ddbff;
}

.register-link a:hover::after {
	width: 100%;
}

/* 粒子动画 */
.particle {
	position: absolute;
	border-radius: 50%;
	background: rgba(46, 125, 50, 0.5);
	z-index: -1;
}

/* 响应式设计 */
@media (max-width: 992px) {
	.container {
		flex-direction: column;
		height: auto;
	}

	.brand-section {
		padding: 30px 20px;
		flex: none;
		height: auto;
		border-right: none;
		border-bottom: 1px solid rgba(46, 125, 50, 0.3);
	}

	.login-section {
		width: 100%;
		padding: 40px 30px;
		border-radius: 0;
		border-left: none;
	}

	.logo h1 {
		font-size: 2.8rem;
	}

	.slogan {
		font-size: 1.5rem;
	}

	.features {
		margin: 30px auto;
	}
}

@media (max-width: 576px) {
	.remember-forgot {
		flex-direction: column;
		align-items: flex-start;
		gap: 15px;
	}

	.feature {
		padding: 15px;
	}

	.login-section {
		padding: 35px 20px;
	}

	.login-header h2 {
		font-size: 1.8rem;
	}

	.social-login::before,
	.social-login::after {
		width: 25%;
	}
}

/* 动画效果 */
@keyframes glowPulse {
	0% {
		opacity: 0.3;
	}

	100% {
		opacity: 0.7;
	}
}

@keyframes float {
	0%, 100% {
		transform: translate(0, 0) rotate(0deg);
	}

	25% {
		transform: translate(15px, -15px) rotate(5deg);
	}

	50% {
		transform: translate(-10px, 10px) rotate(-5deg);
	}

	75% {
		transform: translate(5px, -5px) rotate(2deg);
	}
}

/* 加载动画 */
.spinner {
	animation: spin 1s linear infinite;
	display: inline-block;
	margin-right: 10px;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}
</style>