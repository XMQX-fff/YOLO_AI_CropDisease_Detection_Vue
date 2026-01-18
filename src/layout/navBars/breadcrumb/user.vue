<template>
	<div class="layout-navbars-breadcrumb-user pr15" :style="{ flex: layoutUserFlexNum }">
		<el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onComponentSizeChange" class="custom-dropdown">
			<div class="layout-navbars-breadcrumb-user-icon">
				<i class="iconfont icon-ziti" :title="$t('message.user.title0')"></i>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="large" :disabled="state.disabledSize === 'large'">{{ $t('message.user.dropdownLarge') }}</el-dropdown-item>
					<el-dropdown-item command="default" :disabled="state.disabledSize === 'default'">{{ $t('message.user.dropdownDefault') }}</el-dropdown-item>
					<el-dropdown-item command="small" :disabled="state.disabledSize === 'small'">{{ $t('message.user.dropdownSmall') }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<div class="layout-navbars-breadcrumb-user-icon" @click="onSearchClick">
			<el-icon :title="$t('message.user.title2')">
				<ele-Search />
			</el-icon>
		</div>
		<div class="layout-navbars-breadcrumb-user-icon" @click="onLayoutSetingClick">
			<i class="icon-skin iconfont" :title="$t('message.user.title3')"></i>
		</div>
		<!-- <div class="layout-navbars-breadcrumb-user-icon">
			<el-popover placement="bottom" trigger="click" transition="el-zoom-in-top" :width="300" :persistent="false">
				<template #reference>
					<el-badge :is-dot="true">
						<el-icon :title="$t('message.user.title4')">
							<ele-Bell />
						</el-icon>
					</el-badge>
				</template>
				<template #default>
					<UserNews />
				</template>
			</el-popover>
		</div> -->
		<div class="layout-navbars-breadcrumb-user-icon mr10" @click="onScreenfullClick">
			<i
				class="iconfont"
				:title="state.isScreenfull ? $t('message.user.title6') : $t('message.user.title5')"
				:class="!state.isScreenfull ? 'icon-fullscreen' : 'icon-tuichuquanping'"
			></i>
		</div>
		<el-dropdown :show-timeout="70" :hide-timeout="50" @command="onHandleCommandClick" class="custom-dropdown">
			<span class="layout-navbars-breadcrumb-user-link">
				<img :src="state.img" class="layout-navbars-breadcrumb-user-link-photo mr5" />
				{{ username }}
				<el-icon class="el-icon--right">
					<ele-ArrowDown />
				</el-icon>
			</span>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="/">{{ $t('message.user.dropdown1') }}</el-dropdown-item>
					<el-dropdown-item divided command="logOut">{{ $t('message.user.dropdown5') }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<Search ref="searchRef" />
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUser">
import { defineAsyncComponent, ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useUserInfo } from '/@/stores/userInfo';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import request from '/@/utils/request';
import { Session, Local } from '/@/utils/storage';
import Cookies from 'js-cookie';

// 导入API
import { useUserApi } from '/@/api/user';
const userApi = useUserApi();
import screenfull from 'screenfull';
import mittBus from '/@/utils/mitt';
// 引入组件
// const UserNews = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/userNews.vue'));
const Search = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/search.vue'));

// 定义变量内容
const { locale, t } = useI18n();
const router = useRouter();
const stores = useUserInfo();
const storesThemeConfig = useThemeConfig();
const { userInfos } = storeToRefs(stores);
const { themeConfig } = storeToRefs(storesThemeConfig);
const searchRef = ref();
const state = reactive({
	img: '',
	isScreenfull: false,
	disabledI18n: 'zh-cn',
	disabledSize: 'large',
});

let username: string = '';

// 设置分割样式
const layoutUserFlexNum = computed(() => {
	let num: string | number = '';
	const { layout, isClassicSplitMenu } = themeConfig.value;
	const layoutArr: string[] = ['defaults', 'columns'];
	if (layoutArr.includes(layout) || (layout === 'classic' && !isClassicSplitMenu)) num = '1';
	else num = '';
	return num;
});
// 布局配置 icon 点击时
const onLayoutSetingClick = () => {
	mittBus.emit('openSetingsDrawer');
};
// 下拉菜单点击时
const onHandleCommandClick = (path: string) => {
	if (path === 'logOut') {
		ElMessageBox({
			closeOnClickModal: false,
			closeOnPressEscape: false,
			title: t('message.user.logOutTitle'),
			message: t('message.user.logOutMessage'),
			showCancelButton: true,
			confirmButtonText: t('message.user.logOutConfirm'),
			cancelButtonText: t('message.user.logOutCancel'),
			buttonSize: 'default',
			beforeClose: (action, instance, done) => {
				if (action === 'confirm') {
					instance.confirmButtonLoading = true;
					instance.confirmButtonText = t('message.user.logOutExit');
					setTimeout(() => {
						done();
						setTimeout(() => {
							instance.confirmButtonLoading = false;
						}, 300);
					}, 700);
				} else {
					done();
				}
			},
		})
			.then(async () => {
				// 清除缓存/token等
				Session.clear();
				// 使用 reload 时，不需要调用 resetRoute() 重置路由
				window.location.reload();
			})
			.catch(() => {});
	} else {
		router.push(path);
	}
};
// 菜单搜索点击
const onSearchClick = () => {
	searchRef.value.openSearch();
};
// 组件大小改变
const onComponentSizeChange = (size: string) => {
	Local.remove('themeConfig');
	themeConfig.value.globalComponentSize = size;
	Local.set('themeConfig', themeConfig.value);
	initI18nOrSize('globalComponentSize', 'disabledSize');
	window.location.reload();
};
// 全屏点击时
const onScreenfullClick = () => {
	if (!screenfull.isEnabled) {
		ElMessage.warning('暂不不支持全屏');
		return false;
	}
	screenfull.toggle();
	screenfull.on('change', () => {
		if (screenfull.isFullscreen) state.isScreenfull = true;
		else state.isScreenfull = false;
	});
};
// 语言切换
const onLanguageChange = (lang: string) => {
	Local.remove('themeConfig');
	themeConfig.value.globalI18n = lang;
	Local.set('themeConfig', themeConfig.value);
	locale.value = lang;
	other.useTitle();
	initI18nOrSize('globalI18n', 'disabledI18n');
};
// 初始化组件大小/i18n
const initI18nOrSize = (value: string, attr: string) => {
	state[attr] = Local.get('themeConfig')[value];
};
const getTableData = () => {
	userApi.getUserDetail(userInfos.value.userName).then((res) => {
		// console.log(res);
		if (res.code == 0) {
			state.img = res.data.avatar;
		} else {
			ElMessage({
				type: 'error',
				message: res.msg,
			});
		}
	});
};
// 页面加载时
onMounted(() => {
	// console.log(userInfos.value);
	username = userInfos.value.userName
	getTableData();
	if (Local.get('themeConfig')) {
		initI18nOrSize('globalComponentSize', 'disabledSize');
		initI18nOrSize('globalI18n', 'disabledI18n');
	}
});
</script>

<style scoped lang="scss">
.tile {
	width: 100%;
	height: 100%;
	color: black;
	font-size: 20px;
	font-weight: 600;
	margin-left: -150px;
	display: flex;
	justify-content: flex-start;
	align-items: center;
	text-align: center;
}
.layout-navbars-breadcrumb-user {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	color: white;
	
	&-link {
		height: 100%;
		display: flex;
		align-items: center;
		white-space: nowrap;
		color: white;
		transition: all 0.3s ease;
		
		&:hover {
			color: white;
			text-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
		}
		
		&-photo {
			width: 40px;
			height: 40px;
			border-radius: 50%;
			margin-right: 10px;
			border: 2px solid rgba(255, 255, 255, 0.3);
			box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
			transition: all 0.3s ease;
			
			&:hover {
			transform: scale(1.1);
			box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
		}
		}
	}
	
	&-icon {
		padding: 0 10px;
		cursor: pointer;
		color: white !important;
		height: 50px;
		line-height: 50px;
		display: flex;
		align-items: center;
		transition: all 0.3s ease;
		
		&:hover {
			background: rgba(255, 255, 255, 0.2) !important;
			i {
				display: inline-block;
			}
		}
		
		i {
			font-size: 16px;
			color: white !important;
			transition: all 0.3s ease;
		}
		
		&:hover i {
			transform: scale(1.1);
			text-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
		}
	}
	
	:deep(.el-dropdown) {
		color: white;
	}
	
	:deep(.el-icon) {
		color: white;
		font-size: 16px;
		transition: all 0.3s ease;
		
		&:hover {
			transform: scale(1.1);
			text-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
		}
	}
	
	:deep(.el-badge) {
		height: 40px;
		line-height: 40px;
		display: flex;
		align-items: center;
		color: white;
	}
	
	:deep(.el-badge__content.is-fixed) {
		top: 12px;
	}
}

.custom-dropdown {
	/* 自定义 el-dropdown 的样式 */
	:deep(.el-dropdown-link) {
		color: white;
		display: flex;
		align-items: center;
		gap: 8px;
		transition: all 0.3s ease;
		cursor: pointer;
		
		&:hover {
			color: white;
			text-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
		}
	}

	:deep(.el-dropdown-menu) {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 12px;
		box-shadow: 0 10px 30px rgba(72, 187, 120, 0.3);
		overflow: hidden;
		padding: 5px;
		transition: all 0.3s ease;
	}

	:deep(.el-dropdown-item) {
		color: #4a5568 !important;
		padding: 12px 20px;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		margin: 2px 0;
		
		&:hover {
			background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%) !important;
			color: white !important;
			transform: translateX(4px);
		}
		
		&:active {
			background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%) !important;
		}
		
		&.is-disabled {
			color: #a0aec0 !important;
			background: transparent !important;
		}
	}
}
</style>
