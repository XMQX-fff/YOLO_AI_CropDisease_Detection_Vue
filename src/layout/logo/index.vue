<template>
	<div class="layout-logo" v-if="setShowLogo" @click="onThemeConfigChange">
		<img :src="logoMini" class="layout-logo-medium-img" />
		<!-- <span>{{ themeConfig.globalTitle }}</span> -->
	</div>
	<div class="layout-logo-size" v-else @click="onThemeConfigChange">
		<img :src="logoMini" class="layout-logo-size-img" />
	</div>
</template>

<script setup lang="ts" name="layoutLogo">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
// import logoMini from '/@/assets/logo-mini.svg';
import logoMini from '/@/assets/logo.png';

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 设置 logo 的显示。classic 经典布局默认显示 logo
const setShowLogo = computed(() => {
	let { isCollapse, layout } = themeConfig.value;
	return !isCollapse || layout === 'classic' || document.body.clientWidth < 1000;
});
// logo 点击实现菜单展开/收起
const onThemeConfigChange = () => {
	if (themeConfig.value.layout === 'transverse') return false;
	themeConfig.value.isCollapse = !themeConfig.value.isCollapse;
};
</script>

<style scoped lang="scss">
.layout-logo {
	width: 220px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
	font-size: 18px;
	font-weight: 600;
	cursor: pointer;
	animation: logoAnimation 0.3s ease-in-out;
	transition: all 0.3s ease;
	
	span {
		white-space: nowrap;
		display: inline-block;
		background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	&:hover {
		transform: scale(1.05);
		
		span {
			background: linear-gradient(135deg, #ffffff 0%, #bfdbfe 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}
	}
	
	&-medium-img {
		width: 45px;
		margin-right: 12px;
		border-radius: 10px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
	}
	
	&:hover .layout-logo-medium-img {
		transform: rotate(5deg) scale(1.1);
	}
}

.layout-logo-size {
	width: 100%;
	height: 60px;
	display: flex;
	cursor: pointer;
	animation: logoAnimation 0.3s ease-in-out;
	transition: all 0.3s ease;
	
	&-img {
		width: 32px;
		margin: auto;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
	}
	
	&:hover {
		transform: scale(1.05);
		
		img {
			animation: logoAnimation 0.3s ease-in-out;
			transform: rotate(5deg) scale(1.1);
		}
	}
}

@keyframes logoAnimation {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
	100% {
		transform: scale(1);
	}
}
</style>
