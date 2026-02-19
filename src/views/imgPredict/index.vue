<template>
	<div class="system-predict-container layout-padding">
		<div class="system-predict-padding layout-padding-auto layout-padding-view">
			<div class="header">
				<div class="weight">
					<el-select v-model="selectedGreenhouse" placeholder="请选择温室" size="large" style="width: 200px" value-key="id">
						<el-option v-for="greenhouse in greenhouses" :key="greenhouse.id" :label="greenhouse.name"
							:value="greenhouse" />
					</el-select>
				</div>
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
			<el-row :gutter="10" class="image-display">
				<el-col :span="8">
					<el-card shadow="hover" class="card">
						<div class="image-title">原图片</div>
						<el-upload v-model="state.img" ref="uploadFile" class="avatar-uploader"
				action="http://localhost:9999/files/upload" :show-file-list="false"
				:on-success="handleAvatarSuccessone">
				<div class="image-wrapper" @click.stop="triggerFileUpload">
					<el-image v-if="imageUrl" :src="imageUrl" class="preview-image" fit="contain" />
					<div v-else class="uploader-content"> 
						<el-icon class="upload-icon">
							<Plus />
						</el-icon>
						<div class="upload-text">点击上传图片</div>
					</div>
				</div>
			</el-upload>
					</el-card>
				</el-col>

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
				<el-col :span="8">
					<el-card shadow="hover" class="card">
						<div class="image-title">智能建议</div>
						<div class="suggestion-content" v-if="state.markdownContent">
							<div class="suggestion-text" v-html="state.markdownContent"></div>
						</div>
						<div v-else-if="state.suggestionLoading" class="loading-indicator">
							正在分析检测结果，生成智能建议...
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

import { usePredictApi } from '/@/api/predict';
import { useRecordApi } from '/@/api/record';
import { useGreenhouseApi } from '/@/api/greenhouse';
const predictApi = usePredictApi();
const recordApi = useRecordApi();
const { getGreenhouseList } = useGreenhouseApi();

const imageUrl = ref('');
const conf = ref('');
const weight = ref('');
const kind = ref('');
const uploadFile = ref<UploadInstance>();
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);
const predictedImageUrl = ref('');
const greenhouses = ref([]);
const selectedGreenhouse = ref(null);
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
	markdownContent: '',
});

const formatTooltip = (val: number) => {
	return val / 100
}

function renderMarkdown(text) {
  if (!text) return '';
  
  text = text.replace(/^### (.*$)/gim, '<h3 class="markdown-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="markdown-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="markdown-h1">$1</h1>');
  
  text = text.replace(/\*\*(.*)\*\*/gim, '<strong class="markdown-bold">$1</strong>');
  
  text = text.replace(/^\- (.*$)/gim, '<li class="markdown-list-item">$1</li>');
  text = text.replace(/(<li class="markdown-list-item">.*<\/li>)/s, '<ul class="markdown-list">$1</ul>');
  
  text = text.replace(/`(.*)`/gim, '<code class="markdown-code">$1</code>');
  
  text = text.replace(/^(?!<h|\<li|\<ul|\<code).*$/gim, '<p class="markdown-paragraph">$&</p>');
  
  return text;
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

				if (typeof res.data.label === 'string') {
					res.data.label = JSON.parse(res.data.label);
				}

				if (Array.isArray(res.data.label)) {
					state.predictionResult.label = res.data.label.map(item => item.replace(/\\u([\dA-Fa-f]{4})/g, (_, code) =>
						String.fromCharCode(parseInt(code, 16))
					));
				} else {
					console.error("res.data.label 不是数组:", res.data.label);
				}
				state.predictionResult.confidence = res.data.confidence;
				state.predictionResult.allTime = res.data.allTime;

				if (res.data.outImg) {
					predictedImageUrl.value = res.data.outImg;
				} else {
					imageUrl.value = imageUrl.value;
				}
				console.log(state.predictionResult);
				
				const recordData = {
					weight: weight.value,
					inputImg: state.img,
					outImg: res.data.outImg || '',
					confidence: Array.isArray(state.predictionResult.confidence) 
						? state.predictionResult.confidence.join(',') 
						: String(state.predictionResult.confidence),
					allTime: state.predictionResult.allTime,
					conf: String(state.form.conf),
					label: Array.isArray(state.predictionResult.label) 
						? state.predictionResult.label.join(',') 
						: String(state.predictionResult.label),
					username: userInfos.value.userName,
					kind: state.kind_items.find(item => item.value === kind.value)?.label || kind.value,
					startTime: state.form.startTime,
					greenhouseId: selectedGreenhouse.value?.id
				};
				
				recordApi.addImgRecord(recordData).then((recordRes) => {
					if (recordRes.code == 200 || recordRes.code == '200') {
						console.log('记录保存成功');
					} else {
						console.error('记录保存失败:', recordRes.msg);
					}
				}).catch((error) => {
					console.error('保存记录出错:', error);
				});
				
			} catch (error) {
				console.error('解析 JSON 时出错:', error);
			}
			ElMessage.success('预测成功！');
			getAISuggestion();
		} else {
			ElMessage.error(res.msg);
		}
	});
};
const getAISuggestion = async () => {
	if (!state.predictionResult.label) {
		ElMessage.warning('请先进行预测');
		return;
	}
	
	state.suggestionLoading = true;
	try {
		const apiKey = 'sk-rbwwfonuwpfdaoxcurhgdaklmyazympolaernwmsbuljzuqy';
		
		const cropType = state.kind_items.find(item => item.value === kind.value)?.label || kind.value;
		const diseases = Array.isArray(state.predictionResult.label) 
			? state.predictionResult.label.join('、') 
			: state.predictionResult.label;
		const confidences = formatConfidenceArray(state.predictionResult.confidence).join('、');
		
		const prompt = `作为农作物病害专家，针对以下情况提供简要建议：

作物类型：${cropType}
检测病害：${diseases}
置信度：${confidences}

请在200字以内简要说明：
1. 病害严重性
2. 关键防治措施
3. 日常注意事项

语言简洁明了。`;

		state.markdownContent = '';
		let fullContent = '';
		
		const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'Pro/zai-org/GLM-4.7',
				messages: [
					{ role: 'user', content: prompt }
				],
				stream: true
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			
			const chunk = decoder.decode(value, { stream: true });
			const lines = chunk.split('\n');
			
			for (const line of lines) {
				if (line.startsWith('data: ')) {
					const data = line.slice(6);
					if (data === '[DONE]') {
						continue;
					}
					
					try {
						const parsed = JSON.parse(data);
						const delta = parsed.choices[0].delta;
						if (delta.content) {
							fullContent += delta.content;
							requestAnimationFrame(() => {
								state.markdownContent = renderMarkdown(fullContent);
							});
						}
					} catch (e) {
						console.error('Error parsing chunk:', e);
					}
				}
			}
		}
		
		ElMessage.success('分析完成');
	} catch (error) {
		console.error('获取AI建议出错:', error);
		state.markdownContent = `<div class="error-message">获取建议失败：${error.message}</div>`;
		ElMessage.error('获取建议失败，请检查网络连接或API密钥是否正确');
	} finally {
		state.suggestionLoading = false;
	}
};

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

const triggerFileUpload = () => {
	const fileInput = document.querySelector('.avatar-uploader input[type="file"]') as HTMLInputElement;
	if (fileInput) {
		fileInput.click();
	}
};

const fetchGreenhouses = async () => {
	try {
		const response = await getGreenhouseList({});
		if (response.data && response.data.records) {
			greenhouses.value = response.data.records.map(item => ({
				id: item.id,
				name: item.greenhouseName
			}));
		}
	} catch (error) {
		console.error('获取温室列表失败:', error);
	}
};

onMounted(() => {
	getData();
	fetchGreenhouses();
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

				.image-wrapper {
					width: 100%;
					height: 100%;
					display: flex;
					justify-content: center;
					align-items: center;
					cursor: pointer;
					position: relative;
					z-index: 1;
					
					&:hover {
						opacity: 0.9;
						transition: opacity 0.3s ease;
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
		
		.loading-indicator {
			height: 358px;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #4a5568;
			font-size: 14px;
			animation: pulse 1.5s ease-in-out infinite;
			background: linear-gradient(135deg, rgba(72, 187, 120, 0.05) 0%, rgba(47, 133, 90, 0.05) 100%);
			border-radius: 12px;
			border: 1px solid rgba(72, 187, 120, 0.2);
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

.markdown-h1 {
	font-size: 24px;
	font-weight: 700;
	margin: 20px 0 15px 0;
	color: #2d3748;
}

.markdown-h2 {
	font-size: 20px;
	font-weight: 600;
	margin: 18px 0 12px 0;
	color: #2d3748;
}

.markdown-h3 {
	font-size: 18px;
	font-weight: 600;
	margin: 16px 0 10px 0;
	color: #2d3748;
}

.markdown-paragraph {
	margin: 10px 0;
	line-height: 1.6;
	color: #4a5568;
}

.markdown-bold {
	font-weight: 700;
	color: #2d3748;
}

.markdown-list {
	margin: 10px 0 10px 20px;
	padding-left: 0;
}

.markdown-list-item {
	margin: 5px 0;
	line-height: 1.6;
	color: #4a5568;
	list-style-type: disc;
	list-style-position: outside;
}

.markdown-code {
	background-color: #f7fafc;
	padding: 2px 6px;
	border-radius: 4px;
	font-family: 'Courier New', Courier, monospace;
	font-size: 14px;
	color: #e53e3e;
}

.error-message {
	padding: 15px;
	background-color: #fed7d7;
	border-left: 4px solid #f56565;
	color: #742a2a;
	border-radius: 4px;
	margin-top: 10px;
}

@keyframes pulse {
	0%, 100% {
		opacity: 1;
	}
	50% {
		opacity: 0.7;
	}
}
</style>
