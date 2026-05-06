<template>
  <div class="img-predict-container">
    <!-- 页面内容区域 -->
    <div class="page-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">图像预测</h1>
        <p class="page-subtitle">上传图片进行农作物病虫害检测</p>
      </div>
      
      <!-- 操作区域 -->
      <div class="operation-section">
        <div class="form-row">
          <el-select v-model="selectedGreenhouse" placeholder="请选择温室" style="width: 200px" value-key="id">
            <el-option v-for="greenhouse in greenhouses" :key="greenhouse.id" :label="greenhouse.name" :value="greenhouse" />
          </el-select>
          <el-select v-model="kind" placeholder="请选择作物种类" style="width: 200px; margin-left: 16px" @change="getData">
            <el-option v-for="item in state.kind_items" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="weight" placeholder="请选择模型" style="width: 200px; margin-left: 16px">
            <el-option v-for="item in state.weight_items" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <div class="slider-container" style="margin-left: 24px; display: flex; align-items: center; flex: 1;">
            <span class="slider-label">置信度阈值：{{ conf }}%</span>
            <el-slider v-model="conf" :format-tooltip="formatTooltip" style="width: 300px; margin-left: 16px;" />
          </div>
          <el-button type="primary" @click="upData" style="margin-left: 24px">开始预测</el-button>
        </div>
      </div>
      
      <!-- 图片显示区域 -->
      <div class="image-section">
        <div class="image-grid">
          <!-- 原图片 -->
          <div class="image-card">
            <h3 class="card-title">原图片</h3>
            <el-upload v-model="state.img" ref="uploadFile" class="avatar-uploader" 
              action="#" :show-file-list="false" 
              :http-request="customUpload">
              <div class="upload-area" @click.stop="triggerFileUpload">
                <el-image v-if="imageUrl" :src="imageUrl" class="preview-image" fit="contain" />
                <div v-else class="upload-placeholder"> 
                  <el-icon class="upload-icon">
                    <Plus />
                  </el-icon>
                  <div class="upload-text">点击上传图片</div>
                </div>
              </div>
            </el-upload>
          </div>
          
          <!-- 预测结果 -->
          <div class="image-card">
            <h3 class="card-title">预测结果</h3>
            <div class="result-area">
              <el-image v-if="predictedImageUrl" :src="predictedImageUrl" class="preview-image" fit="contain" />
              <div v-else class="result-placeholder">
                <el-icon>
                  <Picture />
                </el-icon>
                <span>预测后将在此显示结果</span>
              </div>
            </div>
          </div>
          
          <!-- 智能建议 -->
          <div class="image-card">
            <h3 class="card-title">智能建议</h3>
            <div class="suggestion-area">
              <div v-if="state.markdownContent" class="suggestion-content" v-html="state.markdownContent"></div>
              <div v-else-if="state.suggestionLoading" class="loading-indicator">
                正在分析检测结果，生成智能建议...
              </div>
              <div v-else class="suggestion-placeholder">
                <el-icon>
                  <ChatLineRound />
                </el-icon>
                <span>预测完成后将自动生成智能建议</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 预测结果详情 -->
      <div class="result-section">
        <div class="result-card" v-if="state.predictionResult.label">
          <div class="result-grid">
            <div class="result-item">
              <h4 class="result-title">识别结果</h4>
              <div class="result-content">
                <div v-for="(label, index) in formatLabelArray(state.predictionResult.label)" :key="index" class="result-value">
                  {{ label }}
                </div>
              </div>
            </div>
            <div class="result-item">
              <h4 class="result-title">预测概率</h4>
              <div class="result-content">
                <div v-for="(conf, index) in formatConfidenceArray(state.predictionResult.confidence)" :key="index" class="result-value">
                  {{ conf }}
                </div>
              </div>
            </div>
            <div class="result-item">
              <h4 class="result-title">总时间</h4>
              <div class="result-content">
                <div class="result-value">{{ formatTime(state.predictionResult.allTime) }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="result-placeholder" v-else>
          <el-icon><Picture /></el-icon>
          <span>预测结果将在这里显示</span>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts" name="personal">
import { reactive, ref, onMounted } from 'vue';
import type { UploadInstance, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { Plus, ChatLineRound, Picture } from '@element-plus/icons-vue';
import { formatDate } from '/@/utils/formatTime';
import axios from 'axios';
import { Session } from '/@/utils/storage';

import { usePredictApi } from '/@/api/predict';
import { useRecordApi } from '/@/api/record';
import { useGreenhouseApi } from '/@/api/greenhouse';
const predictApi = usePredictApi();
const recordApi = useRecordApi();
const { getGreenhouseList } = useGreenhouseApi();

const imageUrl = ref('');
const conf = ref(50);
const weight = ref('');
const kind = ref('');
const uploadFile = ref<UploadInstance>();
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
		startTime: '',
		token: ''
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
  
  text = text.replace(/^(?!<h|<li|<ul|<code).*$/gim, '<p class="markdown-paragraph">$&</p>');
  
  return text;
}

// 自定义上传方法，使用request拦截器携带token
const customUpload = async (options: any) => {
	const { file, onProgress, onError } = options;
	const formData = new FormData();
	formData.append('file', file);
	
	try {
		const response = await request({
			url: '/api/files/upload',
			method: 'post',
			data: formData,
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
		
		console.log('上传响应:', response);
		// request拦截器返回的是响应对象，包含code/data/message等字段
		if (response && response.code === 200) {
			// 直接处理上传成功逻辑，不再调用onSuccess避免重复触发
			imageUrl.value = URL.createObjectURL(file);
			state.img = response.data;
			ElMessage.success('上传成功');
		} else {
			ElMessage.error(response?.message || '上传失败');
			onError(new Error(response?.message || '上传失败'));
		}
	} catch (error) {
		console.error('上传错误:', error);
		ElMessage.error('上传失败');
		onError(error);
	}
};

const getData = () => {
	predictApi.getFileNames().then((res) => {
		if (res.code == 0 || res.code == 200 || res.code == '200') {
			const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
			state.weight_items = data.weight_items.filter(item => item.value.includes(kind.value));
		} else {
			ElMessage.error(res.msg || res.message || '获取模型列表失败');
		}
	}).catch((error) => {
		console.error('获取模型列表失败:', error);
		ElMessage.error('获取模型列表失败');
	});
};


const upData = () => {
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
	if (!state.img) {
		ElMessage.error('请先上传图片！');
		return;
	}
	
	state.form.weight = weight.value;
	state.form.conf = conf.value / 100;
	state.form.username = 'admin'; // 暂时使用默认值
	state.form.inputImg = state.img;
	state.form.kind = kind.value;
	state.form.startTime = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
	// 添加token，供Flask后端下载图片使用
	const token = Session.get('token');
	const tokenType = Session.get('tokenType') || 'Bearer';
	state.form.token = token ? `${tokenType} ${token}` : '';
	console.log(state.form);
	predictApi.imgPredict(state.form).then((res) => {
		if (res.code == 0 || res.code == 200 || res.code == '200') {
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
					username: 'admin',
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

<style scoped>
.img-predict-container {
  padding: 24px;
  background-color: #ffffff;
  min-height: calc(100vh - 120px);
}

.page-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* 操作区域 */
.operation-section {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.form-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 300px;
}

.slider-label {
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  white-space: nowrap;
}

/* 图片显示区域 */
.image-section {
  margin-bottom: 24px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.image-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.image-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

/* 上传区域 */
.avatar-uploader {
  width: 100%;
  height: 300px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
}

.avatar-uploader:hover {
  border-color: #3b82f6;
  background-color: #f3f4f6;
}

.upload-area {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 280px;
  object-fit: contain;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.preview-image:hover {
  transform: scale(1.02);
}

.upload-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 32px;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.avatar-uploader:hover .upload-icon {
  color: #3b82f6;
}

.upload-text {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

/* 结果区域 */
.result-area {
  width: 100%;
  height: 280px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.result-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
}

.result-placeholder .el-icon {
  font-size: 32px;
  color: #9ca3af;
}

/* 建议区域 */
.suggestion-area {
  width: 100%;
  height: 280px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.suggestion-content {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.suggestion-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
}

.suggestion-placeholder .el-icon {
  font-size: 32px;
  color: #9ca3af;
}

.loading-indicator {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 14px;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 预测结果详情 */
.result-section {
  margin-bottom: 24px;
}

.result-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.result-item {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 16px;
}

.result-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-value {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.4;
}

.result-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 40px;
  color: #6b7280;
}

.result-placeholder .el-icon {
  font-size: 24px;
  color: #9ca3af;
}

/* 滚动条样式 */
.suggestion-content::-webkit-scrollbar {
  width: 6px;
}

.suggestion-content::-webkit-scrollbar-track {
  background-color: #f3f4f6;
  border-radius: 3px;
}

.suggestion-content::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.suggestion-content::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

/* 动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .image-grid {
    grid-template-columns: 1fr;
  }
  
  .result-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .slider-container {
    min-width: auto;
  }
}

/* 组件样式调整 */
:deep(.el-select),
:deep(.el-input) {
  border-radius: 6px;
  
  & .el-select__wrapper,
  & .el-input__wrapper {
    border-radius: 6px;
  }
}

:deep(.el-button) {
  border-radius: 6px;
}

:deep(.el-button--primary) {
  background-color: #3b82f6;
  border-color: #3b82f6;
  
  &:hover {
    background-color: #2563eb;
    border-color: #2563eb;
  }
}

:deep(.el-slider) {
  & .el-slider__bar {
    background-color: #3b82f6;
  }
  
  & .el-slider__button {
    border-color: #3b82f6;
    background-color: #ffffff;
  }
  
  & .el-slider__button:hover {
    border-color: #2563eb;
  }
  
  & .el-slider__runway {
    background-color: #e5e7eb;
  }
}

/* Markdown 样式 */
:deep(.markdown-h1) {
  font-size: 20px;
  font-weight: 600;
  margin: 16px 0 12px 0;
  color: #1f2937;
}

:deep(.markdown-h2) {
  font-size: 18px;
  font-weight: 600;
  margin: 14px 0 10px 0;
  color: #1f2937;
}

:deep(.markdown-h3) {
  font-size: 16px;
  font-weight: 600;
  margin: 12px 0 8px 0;
  color: #1f2937;
}

:deep(.markdown-paragraph) {
  margin: 8px 0;
  line-height: 1.6;
  color: #4b5563;
}

:deep(.markdown-bold) {
  font-weight: 600;
  color: #1f2937;
}

:deep(.markdown-list) {
  margin: 8px 0 8px 20px;
  padding-left: 0;
}

:deep(.markdown-list-item) {
  margin: 4px 0;
  line-height: 1.6;
  color: #4b5563;
  list-style-type: disc;
  list-style-position: outside;
}

:deep(.markdown-code) {
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #dc2626;
}

:deep(.error-message) {
  padding: 12px;
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
  color: #b91c1c;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 13px;
}
</style>