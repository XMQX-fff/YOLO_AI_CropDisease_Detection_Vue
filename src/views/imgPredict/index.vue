<template>
	<div class="system-predict-container layout-padding">
		<div class="system-predict-padding layout-padding-auto layout-padding-view">
			<div class="header">
				<div class="weight">
					<el-select v-model="kind" placeholder="请选择作物种类" size="large" style="width: 200px" @change="getData">
						<el-option v-for="item in state.kind_items" :key="item.value" :label="item.label"
							:value="item.value" />
					</el-select>
				</div>
				<div class="weight">
					<el-select v-model="weight" placeholder="请选择模型" size="large" style="margin-left: 20px;width: 200px">
						<el-option v-for="item in state.weight_items" :key="item.value" :label="item.label"
							:value="item.value" />
					</el-select>
				</div>
				<div class="conf" style="margin-left: 20px;display: flex; flex-direction: row;">
					<div
						style="font-size: 14px;margin-right: 20px;display: flex;justify-content: start;align-items: center;color: #909399;">
						设置最小置信度阈值</div>
					<el-slider v-model="conf" :format-tooltip="formatTooltip" style="width: 300px;" />
				</div>
				<div class="button-section" style="margin-left: 20px">
					<el-button type="primary" @click="upData" class="predict-button">开始预测</el-button>
				</div>
			</div>
			<!-- 图片显示区域修改 -->
			<el-row :gutter="10" class="image-display">
				<!-- 原图展示 -->
				<el-col :span="8">
					<el-card shadow="hover" class="card">
						<div class="image-title">原图片</div>
						<el-upload v-model="state.img" ref="uploadFile" class="avatar-uploader"
							action="http://localhost:9999/files/upload" :show-file-list="false"
							:on-success="handleAvatarSuccessone">
							<el-image v-if="imageUrl" :src="imageUrl" class="preview-image" fit="contain" />
							<div v-else class="uploader-content"> 
								<el-icon class="upload-icon">
									<Plus />
								</el-icon>
								<div class="upload-text">点击上传图片</div>
							</div>
						</el-upload>
					</el-card>
				</el-col>

				<!-- 预测结果图 -->
				<el-col :span="8">
					<el-card shadow="hover" class="card">
						<div class="image-title">预测结果</div>
						<el-image v-if="predictedImageUrl" :src="predictedImageUrl" class="preview-image"
							fit="contain" />
						<div v-else class="placeholder">
							<el-icon>
								<Picture />
							</el-icon>
							<span>预测后将在此显示结果</span>
						</div>
					</el-card>
				</el-col>
				<!-- 智能建议 -->
				<el-col :span="8">
					<el-card shadow="hover" class="card">
						<div class="image-title">智能建议</div>
						<div class="suggestion-content" v-if="state.aiSuggestion">
							<div class="suggestion-text">{{ state.aiSuggestion }}</div>
						</div>
						<div v-else class="placeholder">
							<el-icon>
								<ChatLineRound />
							</el-icon>
							<span>预测完成后将自动生成智能建议</span>
						</div>
					</el-card>
				</el-col>
			</el-row>
			<el-row class="result-section">
				<el-col :span="24">
					<el-card>
						<div class="bottom" v-if="state.predictionResult.label">
							<div class="result-column">
								<div class="result-title">识别结果：</div>
								<div v-for="(label, index) in formatLabelArray(state.predictionResult.label)" :key="index" class="result-item">
									<span class="result-value">{{ label }}</span>
								</div>
							</div>
							<div class="result-column">
								<div class="result-title">预测概率：</div>
								<div v-for="(conf, index) in formatConfidenceArray(state.predictionResult.confidence)" :key="index" class="result-item">
									<span class="result-value">{{ conf }}</span>
								</div>
							</div>
							<div class="result-column">
								<div class="result-title">总时间：</div>
								<div class="result-item">
									<span class="result-value">{{ formatTime(state.predictionResult.allTime) }}</span>
								</div>
							</div>
						</div>
						<div class="bottom placeholder" v-else>
							<div style="width: 100%; text-align: center; color: #909399;">
								<el-icon style="margin-right: 8px; vertical-align: middle;"><Picture /></el-icon>
								<span>预测结果将在这里显示</span>
							</div>
						</div>
					</el-card>
				</el-col>
			</el-row>
		</div>
	</div>
</template>


<script setup lang="ts" name="personal">
import { reactive, ref, onMounted } from 'vue';
import type { UploadInstance, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { Plus, ChatLineRound, Picture } from '@element-plus/icons-vue';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';
import { formatDate } from '/@/utils/formatTime';
import axios from 'axios';

// 导入API
import { usePredictApi } from '/@/api/predict';
const predictApi = usePredictApi();

const imageUrl = ref('');
const conf = ref('');
const weight = ref('');
const kind = ref('');
const uploadFile = ref<UploadInstance>();
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);
// 新增响应式变量
const predictedImageUrl = ref('');
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
	img: '',
	predictionResult: {
		label: '',
		confidence: '',
		allTime: '',
	},
	form: {
		username: '',
		inputImg: null as any,
		weight: '',
		conf: null as any,
		kind: '',
		startTime: ''
	},
	aiSuggestion: '',
	suggestionLoading: false,
});

const formatTooltip = (val: number) => {
	return val / 100
}

const handleAvatarSuccessone: UploadProps['onSuccess'] = (response, uploadFile) => {
	imageUrl.value = URL.createObjectURL(uploadFile.raw!);
	state.img = response.data;
};

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


const upData = () => {
	state.form.weight = weight.value;
	state.form.conf = (parseFloat(conf.value) / 100);
	state.form.username = userInfos.value.userName;
	state.form.inputImg = state.img;
	state.form.kind = kind.value;
	state.form.startTime = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
	console.log(state.form);
	predictApi.imgPredict(state.form).then((res) => {
		if (res.code == 0) {
			const originalImage = imageUrl.value;
			try {
				res.data = JSON.parse(res.data);

				// 如果 res.data.label 是字符串，则解析为数组
				if (typeof res.data.label === 'string') {
					res.data.label = JSON.parse(res.data.label);
				}

				// 确保 res.data.label 是数组后再调用 map
				if (Array.isArray(res.data.label)) {
					state.predictionResult.label = res.data.label.map(item => item.replace(/\\u([\dA-Fa-f]{4})/g, (_, code) =>
						String.fromCharCode(parseInt(code, 16))
					));
				} else {
					console.error("res.data.label 不是数组:", res.data.label);
				}
				state.predictionResult.confidence = res.data.confidence;
				state.predictionResult.allTime = res.data.allTime;

				// 覆盖原图片
				if (res.data.outImg) {
					// 使用服务器返回的新图片路径
					predictedImageUrl.value = res.data.outImg;
				} else {
					// 否则保留原图片路径
					imageUrl.value = imageUrl.value;
				}
				console.log(state.predictionResult);
			} catch (error) {
				console.error('解析 JSON 时出错:', error);
			}
			ElMessage.success('预测成功！');
			// 自动获取AI建议
			getAISuggestion();
		} else {
			ElMessage.error(res.msg);
		}
	});
};
// 获取AI建议
const getAISuggestion = async () => {
	if (!state.predictionResult.label) {
		ElMessage.warning('请先进行预测');
		return;
	}
	
	state.suggestionLoading = true;
	try {
		const apiKey = ''; // 请替换为您的DeepSeekAPI密钥
		
		// 构建更详细的提示信息
		const prompt = `作为一个专业的农作物病害专家，请对以下情况进行详细分析：

1. 基本信息：
- 作物类型：${state.kind_items.find(item => item.value === kind.value)?.label || kind.value}
- 检测到的病害：${state.predictionResult.label}
- 检测置信度：${state.predictionResult.confidence}

2. 请提供以下方面的专业分析：
(1) 病害危害程度：
1.当前病害的严重程度评估
2.对作物生长的影响
3.可能造成的产量损失

(2) 防治建议：
1.立即可采取的防治措施
2.推荐使用的农药或生物防治方法
3.施药注意事项和防护措施

(3) 预防措施：
1.日常管理建议
2.环境控制要点
3.预防性保护措施

请用专业但易懂的语言回答，并尽可能提供具体的操作建议。`;

const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
			model: 'deepseek-chat',
			messages: [{
				role: 'user',
				content: prompt
			}],
			stream: false
		}, {
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			}
		});

		state.aiSuggestion = response.data.choices[0].message.content;
		ElMessage.success('分析完成');
	} catch (error) {
		console.error('获取AI建议出错:', error);
		ElMessage.error('获取建议失败，请检查网络连接或API密钥是否正确');
	} finally {
		state.suggestionLoading = false;
	}
};

// 格式化函数
const formatLabelArray = (label: any) => {
	if (Array.isArray(label)) {
		return label.map(item => item.replace(/[\[\]"]/g, '').trim());
	} else if (typeof label === 'string') {
		return [label.replace(/[\[\]"]/g, '').trim()];
	}
	return ['未知'];
};

const formatConfidenceArray = (confidence: string) => {
	if (!confidence) return ['0%'];
	try {
		let confidences = confidence;
		if (typeof confidence === 'string') {
			confidences = JSON.parse(confidence);
		}
		if (Array.isArray(confidences)) {
			return confidences.map(conf => {
				const confValue = parseFloat(String(conf).replace(/[\[\]"%]/g, ''));
				return confValue.toFixed(2) + '%';
			});
		} else {
			const confValue = parseFloat(String(confidence).replace(/[\[\]"%]/g, ''));
			return [confValue.toFixed(2) + '%'];
		}
	} catch (error) {
		console.error('解析置信度出错:', error);
		return ['0%'];
	}
};

const formatTime = (time: string) => {
	if (!time) return '0秒';
	return parseFloat(time).toFixed(3) + '秒';
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
		width: 200px;
		
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
			width: 300px;
			
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

.image-display {
	margin-top: 20px;
	
	.card {
		height: 100%;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		box-shadow: 0 4px 16px rgba(72, 187, 120, 0.15);
		transition: all 0.3s ease;
		border: 1px solid rgba(72, 187, 120, 0.2);
		
		&:hover {
			transform: translateY(-4px);
			box-shadow: 0 8px 24px rgba(72, 187, 120, 0.3);
		}

		.image-title {
			font-size: 18px;
			font-weight: 600;
			color: #2f855a;
			margin-bottom: 20px;
			padding-bottom: 12px;
			border-bottom: 2px solid rgba(72, 187, 120, 0.3);
			text-align: center;
		}

		.avatar-uploader {
			width: 100%;
			height: 358px;
			border: 2px dashed rgba(72, 187, 120, 0.3);
			border-radius: 12px;
			cursor: pointer;
			position: relative;
			overflow: hidden;
			transition: all 0.3s ease;
			display: flex;
			justify-content: center;
			align-items: center;
			background: rgba(72, 187, 120, 0.05);

			&:hover {
				border-color: #48bb78;
				background: rgba(72, 187, 120, 0.1);
				transform: scale(1.02);
			}
		}

		.preview-image {
			width: 100%;
			height: 358px;
			object-fit: contain;
			border-radius: 8px;
			transition: all 0.3s ease;
			box-shadow: 0 2px 12px rgba(72, 187, 120, 0.2);
		}

		.uploader-content {
			width: 100%;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			gap: 15px;
		}

		.upload-icon {
			font-size: 36px;
			color: #48bb78;
			transition: all 0.3s ease;
		}

		.upload-text {
			color: #4a5568;
			font-size: 16px;
			font-weight: 500;
		}

		.placeholder {
			height: 358px;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 15px;
			color: #718096;
			background: rgba(72, 187, 120, 0.05);
			border-radius: 12px;
			border: 2px dashed rgba(72, 187, 120, 0.2);

			.el-icon {
				font-size: 36px;
				color: #48bb78;
				transition: all 0.3s ease;
				
				&:hover {
					transform: scale(1.2);
				}
			}
			
			span {
				font-size: 16px;
				font-weight: 500;
				color: #4a5568;
			}
		}

		.suggestion-content {
			height: 358px;
			padding: 20px;
			overflow-y: auto;
			background: linear-gradient(135deg, rgba(72, 187, 120, 0.05) 0%, rgba(47, 133, 90, 0.05) 100%);
			border-radius: 12px;
			border: 1px solid rgba(72, 187, 120, 0.2);

			.suggestion-text {
				font-size: 14px;
				line-height: 1.8;
				color: #2d3748;
				white-space: pre-wrap;
				text-align: justify;
				background: rgba(255, 255, 255, 0.95);
				padding: 15px;
				border-radius: 8px;
				box-shadow: 0 2px 12px rgba(72, 187, 120, 0.15);
			}

			&::-webkit-scrollbar {
				width: 8px;
			}

			&::-webkit-scrollbar-thumb {
				background-color: rgba(72, 187, 120, 0.4);
				border-radius: 4px;
			}

			&::-webkit-scrollbar-track {
				background-color: rgba(72, 187, 120, 0.15);
				border-radius: 4px;
			}
		}
	}
}
.result-section {
	margin-top: 20px;
	padding: 0;

	:deep(.el-card) {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		box-shadow: 0 4px 16px rgba(72, 187, 120, 0.15);
		margin: 0;
		border: 1px solid rgba(72, 187, 120, 0.2);
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-4px);
			box-shadow: 0 8px 24px rgba(72, 187, 120, 0.3);
		}
		
		.el-card__body {
			padding: 0;
		}
	}

	.bottom {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 20px;
		background: linear-gradient(135deg, rgba(72, 187, 120, 0.08) 0%, rgba(47, 133, 90, 0.08) 100%);
		border-radius: 16px;
		min-height: 140px;

		.result-column {
			width: 33%;
			padding: 20px;
			background: rgba(255, 255, 255, 0.95);
			border-radius: 12px;
			box-shadow: 0 4px 12px rgba(72, 187, 120, 0.15);
			margin: 0 8px;
			border: 1px solid rgba(72, 187, 120, 0.2);
			transition: all 0.3s ease;
			
			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 16px rgba(72, 187, 120, 0.25);
			}

			&:first-child {
				margin-left: 0;
			}
			
			&:last-child {
				margin-right: 0;
			}

			.result-title {
				font-size: 16px;
				color: #2f855a;
				font-weight: 600;
				margin-bottom: 20px;
				padding-bottom: 10px;
				border-bottom: 2px solid rgba(72, 187, 120, 0.3);
				text-align: center;
			}

			.result-item {
				margin: 10px 0;
				text-align: center;
				
				.result-value {
					color: #2f855a;
					font-weight: 600;
					font-size: 18px;
					transition: all 0.3s ease;
					
					&:hover {
						color: #48bb78;
						text-shadow: 0 2px 10px rgba(72, 187, 120, 0.4);
						transform: scale(1.05);
					}
				}
			}
		}

		&.placeholder {
			color: #718096;
			justify-content: center;
			align-items: center;
			background: rgba(72, 187, 120, 0.05);
			border: 2px dashed rgba(72, 187, 120, 0.2);
			border-radius: 16px;
			min-height: 140px;
			
			.el-icon {
				margin-right: 12px;
				font-size: 24px;
				color: #48bb78;
			}
			
			> div {
				font-size: 18px;
				font-weight: 500;
			}
		}
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
</style>