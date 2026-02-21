<template>
	<div class="system-predict-container layout-padding">
		<div class="system-predict-padding layout-padding-auto layout-padding-view">
			<div class="header">
				<div class="kind">
					<text>作物种类：</text>
					<el-input v-model="state.form.weight" style="width: 150px" size="large" disabled />
				</div>
				<div class="model">
					<text>使用权重：</text>
					<el-input v-model="state.form.weight" style="width: 180px" size="large" disabled />
				</div>
				<div class="count">
					<text>最小阈值：</text>
					<el-input v-model="state.form.conf" style="width: 100px" size="large" disabled />
				</div>
				<div class="username">
					<text>用户：</text>
					<el-input v-model="state.form.username" style="width: 150px" size="large" disabled />
				</div>
				<div class="startTime">
					<text>开始时间：</text>
					<el-input v-model="state.form.startTime" style="width: 200px" size="large" disabled />
				</div>
				<div class="button-section">
					<el-button type="primary" @click="playVideos" class="predict-button">开始播放</el-button>
				</div>
				<div class="button-section">
					<el-button type="success" @click="pauseVideos" class="predict-button">暂停播放</el-button>
				</div>
			</div>
			<div class="cards" ref="cardsContainer">
				<!-- 左侧区域的视频 -->
				<div class="left" :style="{ width: leftWidth + '%' }">
					<video class="video" v-if="state.form.inputVideo" preload="auto" controls>
						<source :src="state.form.inputVideo" type="video/mp4" />
					</video>
				</div>

				<!-- 分割条 -->
				<div class="splitter" @mousedown="startDrag"></div>

				<!-- 右侧区域的视频 -->
				<div class="right" :style="{ width: 100 - leftWidth + '%' }">
					<video class="video" preload="auto" v-if="state.form.outVideo" controls>
						<source :src="state.form.outVideo" type="video/mp4" />
					</video>
				</div>
			</div>
		</div>
	</div>
</template>


<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useRoute } from 'vue-router';

// 导入API
import { useRecordApi } from '/@/api/record';
const recordApi = useRecordApi();

const route = useRoute();
const leftWidth = ref(50); // 左侧 div 初始宽度
const state = reactive({
	form: {} as any,
	id: '' as any
});

const getData = () => {
	recordApi.getVideoRecordDetail(state.id).then((res) => {
		if (res.code == 0) {
			// res.data = JSON.parse(res.data);
			state.form = res.data;
			console.log(state.form);
		} else {
			ElMessage.error(res.msg);
		}
	});
};

const playVideos = () => {
    const leftVideo = document.querySelector('.left .video') as HTMLVideoElement;
    const rightVideo = document.querySelector('.right .video') as HTMLVideoElement;

    if (leftVideo) leftVideo.play();
    if (rightVideo) rightVideo.play();
};

const pauseVideos = () => {
    const leftVideo = document.querySelector('.left .video') as HTMLVideoElement;
    const rightVideo = document.querySelector('.right .video') as HTMLVideoElement;

    if (leftVideo) leftVideo.pause();
    if (rightVideo) rightVideo.pause();
};


// 拖动分割条
const startDrag = (e: MouseEvent) => {
	const cardsContainer = document.querySelector('.cards') as HTMLElement; // 获取父容器
	const startX = e.clientX;
	const startLeftWidth = leftWidth.value;

	const cardsContainerLeft = cardsContainer.getBoundingClientRect().left; // 获取父容器的左边位置
	const cardsContainerWidth = cardsContainer.offsetWidth; // 获取父容器的宽度

	const onMouseMove = (moveEvent: MouseEvent) => {
		const deltaX = moveEvent.clientX - startX;
		let newLeftWidth = startLeftWidth + (deltaX / cardsContainerWidth) * 100;

		// 限制左右区域的宽度范围为 0% 到 100%
		newLeftWidth = Math.min(Math.max(newLeftWidth, 0), 100);
		leftWidth.value = newLeftWidth;
	};

	const onMouseUp = () => {
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
	};

	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);
};


onMounted(() => {
	//获取链接参数
	state.id = route.query.id;
	console.log(state.id);
	getData()
});
</script>

<style scoped lang="scss">
.system-predict-container {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
	padding: 20px;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

	.system-predict-padding {
		padding: 20px;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(72, 187, 120, 0.2);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(72, 187, 120, 0.2);
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 12px 48px rgba(72, 187, 120, 0.3);
		}
	}
}

.header {
	width: 100%;
	height: auto;
	display: flex;
	justify-content: start;
	align-items: center;
	gap: 20px;
	padding: 20px;
	margin-bottom: 20px;
	background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(47, 133, 90, 0.1) 100%);
	border-radius: 12px;
	border: 1px solid rgba(72, 187, 120, 0.2);
	font-size: 14px;
	flex-wrap: wrap;

	.kind,
	.model,
	.count,
	.username,
	.startTime {
		display: flex;
		align-items: center;
		gap: 10px;

		text {
			font-weight: 600;
			color: #2f855a;
		}
		
		.el-input {
			:deep(.el-input__wrapper) {
				border-radius: 8px;
				transition: all 0.3s ease;
				border-color: rgba(72, 187, 120, 0.3);
				
				&:hover {
					box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
					border-color: rgba(72, 187, 120, 0.4);
				}
				
				&.is-focus,
				&:focus-within {
					border-color: #48bb78;
					box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.2);
				}
			}
		}
	}
	
	.button-section {
		margin-left: auto;
	}
}

.predict-button {
	background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
	border: none;
	box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
	transition: all 0.3s ease;
	padding: 10px 24px;
	font-size: 16px;
	font-weight: 500;
	border-radius: 8px;
	
	&:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
		background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
	}
	
	&:active {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
	}
}

.cards {
	width: 100%;
	height: calc(100% - 100px); /* 减去 header 高度 */
	border-radius: 12px;
	margin-top: 15px;
	padding: 0;
	display: flex;
	flex-direction: row;
	overflow: hidden;
	background-color: rgba(255, 255, 255, 0.9);
	box-shadow: 0 4px 16px rgba(72, 187, 120, 0.2);
	border: 1px solid rgba(72, 187, 120, 0.2);
}

.left,
.right {
	flex-grow: 1;
	height: 100%;
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	background: radial-gradient(circle, rgba(72, 187, 120, 0.1) 0%, rgba(255, 255, 255, 0.95) 100%);
	border-radius: 12px;
	border: 1px solid rgba(72, 187, 120, 0.2);
	box-shadow: inset 0 2px 8px rgba(72, 187, 120, 0.1);
	transition: all 0.3s ease;
	
	&:hover {
		box-shadow: inset 0 4px 12px rgba(72, 187, 120, 0.15);
	}
}

.video {
	width: 95%;
	max-height: 95%;
	height: auto;
	object-fit: contain;
	border-radius: 12px;
	box-shadow: 0 4px 16px rgba(72, 187, 120, 0.3);
	transition: all 0.3s ease;
	
	&:hover {
		transform: scale(1.01);
		box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
	}
}

/* 分割条样式 */
.splitter {
	cursor: ew-resize;
	width: 3px;
	background: linear-gradient(to bottom, #48bb78, #2f855a);
	border-left: none;
	height: 100%;
	transition: all 0.3s ease;
	border-radius: 2px;

	&:hover {
		background: linear-gradient(to bottom, #2f855a, #48bb78);
		box-shadow: 0 0 12px rgba(72, 187, 120, 0.5);
		transform: scaleX(1.5);
	}
}

</style>