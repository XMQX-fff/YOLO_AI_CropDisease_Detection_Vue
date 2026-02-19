<template>
	<div class="system-predict-container layout-padding">
		<div class="system-predict-padding layout-padding-auto layout-padding-view">
			<div class="header">
				<div class="kind">
					<el-select v-model="kind" placeholder="请选择作物种类" size="large" style="width: 180px" @change="getData">
						<el-option v-for="item in state.kind_items" :key="item.value" :label="item.label"
							:value="item.value" />
					</el-select>
				</div>
				<div class="weight">
					<el-select v-model="weight" placeholder="请选择模型" size="large" style="margin-left: 20px;width: 180px">
						<el-option v-for="item in state.weight_items" :key="item.value" :label="item.label"
							:value="item.value" />
					</el-select>
				</div>
				<div class="conf" style="margin-left: 20px;display: flex; flex-direction: row;">
					<div
						style="font-size: 14px;margin-right: 20px;display: flex;justify-content: start;align-items: center;color: #909399;">
						设置最小置信度阈值</div>
					<el-slider v-model="conf" :format-tooltip="formatTooltip" style="width: 280px;" />
				</div>
				<div class="button-section" style="margin-left: 20px">
					<el-button type="primary" @click="start" class="predict-button">开始录制</el-button>
				</div>
                <div class="button-section" style="margin-left: 20px">
					<el-button type="primary" @click="stop" class="predict-button">结束录制</el-button>
				</div>
				<div class="demo-progress" v-if="state.isShow">
					<el-progress :text-inside="true" :stroke-width="20" :percentage=state.percentage style="width: 380px;">
						<span>{{ state.type_text }} {{ state.percentage }}%</span>
					</el-progress>
				</div>
			</div>
			<div class="cards" ref="cardsContainer">
				<img v-if="state.cameraisShow" class="video" :src="state.video_path">
			</div>
		</div>
	</div>
</template>


<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';
import type { UploadInstance, UploadProps } from 'element-plus';
import { SocketService } from '/@/utils/socket';

// 导入API
import { usePredictApi } from '/@/api/predict';
const predictApi = usePredictApi();
import { formatDate } from '/@/utils/formatTime';

const stores = useUserInfo();
const conf = ref(50);
const kind = ref('');
const weight = ref('');
const { userInfos } = storeToRefs(stores);

const state = reactive({
	weight_items: [] as any,
	kind_items: [
    {
      value: 'corn',
      label: '玉米',
    },
    {
      value: 'rice',
      label: '水稻',
    },
    {
      value: 'wheat',
      label: '小麦',
    },
    {
      value: 'potato',
      label: '马铃薯',
    },
    {
      value: 'tomato',
      label: '番茄',
    },
    {
      value: 'cotton',
      label: '棉花',
    },
    {
      value: 'apple',
      label: '苹果',
    },
    {
      value: 'grape',
      label: '葡萄',
    },
    {
      value: 'strawberry',
      label: '草莓',
    },
	],
	data: {} as any,
	video_path: '',
	type_text: "正在保存",
	percentage: 50,
	isShow: false,
	cameraisShow: false,
	form: {
		username: '',
		weight: '',
		conf: null as any,
		kind: '',
		startTime: ''
	},
});

const socketService = new SocketService();

socketService.on('message', (data) => {
	console.log('Received message:', data);
	ElMessage.success(data);
});

const formatTooltip = (val: number) => {
	return val / 100
}

socketService.on('progress', (data) => {
	state.percentage = parseInt(data);
	if (parseInt(data) < 100) {
		state.isShow = true;
	} else {
		//两秒后隐藏进度条
		ElMessage.success("保存成功！");
		setTimeout(() => {
			state.isShow = false;
			state.percentage = 0;
		}, 2000);
	}
	console.log('Received message:', data);
});

const getData = () => {
	predictApi.getFileNames().then((res) => {
		if (res.code == 0) {
			res.data = JSON.parse(res.data);
			state.weight_items = res.data.weight_items.filter(item => item.value.includes(kind.value));
		} else {
			ElMessage.error(res.msg);
		}
	});
};


const start = () => {
	if (!kind.value) {
		ElMessage.error('请先选择作物种类！');
		return;
	}
	if (!weight.value) {
		ElMessage.error('请先选择模型！');
		return;
	}
	if (!conf.value) {
		ElMessage.error('请先设置置信度阈值！');
		return;
	}
	
	state.form.weight = weight.value;
	state.form.kind = kind.value;
	state.form.conf = conf.value / 100;
	state.form.username = userInfos.value.userName;
	state.form.startTime = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
	console.log(state.form);
	const queryParams = new URLSearchParams(state.form).toString();
	state.cameraisShow = true
	state.video_path = `http://127.0.0.1:5000/predictCamera?${queryParams}`;
};

const stop = () => {
	predictApi.stopCamera().then((res) => {
		if (res.code == 0) {
			res.data = JSON.parse(res.data);
			console.log(res.data);
			state.weight_items = res.data.weight_items;
		} else {
			ElMessage.error(res.msg);
		}
	});
	state.cameraisShow = false
};

onMounted(() => {
	getData();
});
</script>

<style scoped lang="scss">
.system-predict-container {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
	padding: 20px;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

	.system-predict-padding {
		padding: 20px;
		min-height: calc(100vh - 40px);
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
	display: flex;
	align-items: center;
	flex-wrap: wrap;
	gap: 20px;
	margin-bottom: 20px;
	background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(47, 133, 90, 0.1) 100%);
	padding: 20px;
	border-radius: 12px;
	border: 1px solid rgba(72, 187, 120, 0.2);
	transition: all 0.3s ease;
	
	.el-select {
		width: 180px;
		
		:deep(.el-select__wrapper) {
			border-radius: 8px;
			transition: all 0.3s ease;
			
			&:hover {
				box-shadow: 0 4px 12px rgba(72, 187, 120, 0.2);
				border-color: rgba(72, 187, 120, 0.4);
			}
			
			&.is-focus {
				border-color: #48bb78;
				box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.2);
			}
		}
	}
	
	.conf {
		margin-left: 20px;
		display: flex;
		flex-direction: row;
		align-items: center;
		
		> div:first-child {
			font-size: 14px;
			margin-right: 20px;
			display: flex;
			justify-content: start;
			align-items: center;
			color: #4a5568;
			font-weight: 500;
		}
		
		.el-slider {
			width: 280px;
			
			:deep(.el-slider__button) {
				background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
				border-color: #48bb78;
				transition: all 0.3s ease;
				
				&:hover {
					transform: scale(1.1);
				}
			}
			
			:deep(.el-slider__bar) {
				background: linear-gradient(90deg, #48bb78 0%, #2f855a 100%);
			}
			
			:deep(.el-slider__runway) {
				background: rgba(72, 187, 120, 0.2);
			}
		}
	}
}

.cards {
	width: 100%;
	min-height: 600px;
	border-radius: 16px;
	margin-top: 20px;
	padding: 20px;
	overflow: hidden;
	display: flex;
	justify-content: center;
	align-items: center;
	background: rgba(255, 255, 255, 0.95);
	box-shadow: 0 4px 16px rgba(72, 187, 120, 0.15);
	border: 1px solid rgba(72, 187, 120, 0.2);
	transition: all 0.3s ease;
	
	&:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 24px rgba(72, 187, 120, 0.3);
	}
}

.video {
	width: 100%;
	max-height: 100%;
	height: auto;
	object-fit: contain;
	border-radius: 12px;
	box-shadow: 0 4px 16px rgba(72, 187, 120, 0.2);
	transition: all 0.3s ease;
}

.button-section {
	display: flex;
	justify-content: center;
}

.predict-button {
	width: 100%;
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

.demo-progress {
	margin-left: 20px;
	
	.el-progress--line {
		width: 380px;
		
		:deep(.el-progress-bar__inner) {
			background: linear-gradient(90deg, #48bb78 0%, #2f855a 100%);
		}
		
		:deep(.el-progress__text) {
			color: #2f855a;
			font-weight: 500;
		}
	}
}
</style>