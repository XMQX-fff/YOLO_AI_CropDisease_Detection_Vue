<template>
  <div class="camera-predict-container">
    <!-- 页面内容区域 -->
    <div class="page-content">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">摄像头预测</h1>
        <p class="page-subtitle">使用摄像头实时进行农作物病虫害检测</p>
      </div>
      
      <!-- 操作区域 -->
      <div class="operation-section">
        <div class="form-row">
          <el-select v-model="kind" placeholder="请选择作物种类" style="width: 180px" @change="getData">
            <el-option v-for="item in state.kind_items" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-select v-model="weight" placeholder="请选择模型" style="width: 180px; margin-left: 16px">
            <el-option v-for="item in state.weight_items" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <div class="slider-container" style="margin-left: 16px; display: flex; align-items: center; flex: 1;">
            <span class="slider-label">置信度阈值：{{ conf }}%</span>
            <el-slider v-model="conf" :format-tooltip="formatTooltip" style="width: 280px; margin-left: 16px;" />
          </div>
          <div class="button-section" style="margin-left: 16px">
            <el-button type="primary" @click="start">开始录制</el-button>
          </div>
          <div class="button-section" style="margin-left: 16px">
            <el-button type="primary" @click="stop">结束录制</el-button>
          </div>
          <div class="demo-progress" v-if="state.isShow" style="margin-left: 16px">
            <el-progress :text-inside="true" :stroke-width="20" :percentage=state.percentage style="width: 380px;">
              <span>{{ state.type_text }} {{ state.percentage }}%</span>
            </el-progress>
          </div>
        </div>
      </div>
      
      <!-- 摄像头显示区域 -->
      <div class="camera-section">
        <div class="camera-card" v-if="state.cameraisShow">
          <img class="video" :src="state.video_path">
        </div>
        <div class="camera-placeholder" v-else>
          <el-icon><Camera /></el-icon>
          <span>点击开始录制后将实时显示摄像头画面</span>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import type { UploadInstance, UploadProps } from 'element-plus';
import { SocketService } from '/@/utils/socket';
import { Camera } from '@element-plus/icons-vue';
import { Session } from '/@/utils/storage';

// 导入API
import { usePredictApi } from '/@/api/predict';
const predictApi = usePredictApi();
import { formatDate } from '/@/utils/formatTime';

const conf = ref(50);
const kind = ref('');
const weight = ref('');

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
		startTime: '',
		userId: ''
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
		if (res.code == 0 || res.code == 200 || res.code == '200') {
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
	state.form.username = 'admin'; // 暂时使用默认值
	state.form.startTime = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
	// 添加userId
	const userInfo = Session.get('userInfo');
	state.form.userId = userInfo?.id || '';
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

<style scoped>
.camera-predict-container {
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

/* 摄像头显示区域 */
.camera-section {
  margin-bottom: 24px;
}

.camera-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 600px;
}

.camera-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.video {
  width: 100%;
  max-height: 560px;
  object-fit: contain;
  border-radius: 4px;
  transition: transform 0.2s ease;
}

.video:hover {
  transform: scale(1.02);
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6b7280;
  background-color: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 40px;
  min-height: 600px;
}

.camera-placeholder .el-icon {
  font-size: 48px;
  color: #9ca3af;
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

:deep(.el-progress) {
  & .el-progress-bar__inner {
    background-color: #3b82f6;
  }
  
  & .el-progress__text {
    color: #1f2937;
    font-weight: 500;
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .slider-container {
    min-width: auto;
  }
  
  .camera-card,
  .camera-placeholder {
    min-height: 400px;
  }
}
</style>