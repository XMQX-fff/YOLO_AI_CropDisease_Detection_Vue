<template>
	<div class="system-role-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="900px" class="dia">
			<el-form ref="diseaseDialogFormRef" :model="state.form" size="default" label-width="90px">
				<el-row :gutter="20">
					<el-col :span="12" class="mb20">
						<el-form-item label="作物类型">
							<el-select v-model="state.form.cropType" placeholder="请选择作物类型" style="width: 100%">
								<el-option v-for="item in cropTypes" :key="item.value" :label="item.label" :value="item.value" />
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="12" class="mb20">
						<el-form-item label="病害名称">
							<el-input v-model="state.form.name" placeholder="请输入病害名称" clearable />
						</el-form-item>
					</el-col>
					<el-col :span="24" class="mb20">
						<el-form-item label="病害症状">
							<el-input type="textarea" v-model="state.form.symptoms" placeholder="请输入病害症状" :rows="6" />
						</el-form-item>
					</el-col>
					<el-col :span="24" class="mb20">
						<el-form-item label="发病原因">
							<el-input type="textarea" v-model="state.form.causes" placeholder="请输入发病原因" :rows="3" />
						</el-form-item>
					</el-col>
					<el-col :span="24" class="mb20">
						<el-form-item label="防治方法">
							<el-input type="textarea" v-model="state.form.prevention" placeholder="请输入防治方法" :rows="6" />
						</el-form-item>
					</el-col>
					<el-col :span="24" class="mb20">
						<el-form-item label="图片">
							<el-upload
								ref="uploadFile"
								class="avatar-uploader"
								action="http://localhost:9999/files/upload"
								:show-file-list="false"
								:on-success="handleAvatarSuccess"
							>
								<img v-if="imageUrl" :src="imageUrl" class="avatar">
								<el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
							</el-upload>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="onCancel" size="default">取 消</el-button>
					<el-button type="primary" @click="onSubmit" size="default">{{ state.dialog.submitTxt }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemRoleDialog">
import { nextTick, reactive, ref } from 'vue';
import type { UploadInstance, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { useDiseaseApi } from '/@/api/disease';
const diseaseApi = useDiseaseApi();

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const imageUrl = ref('');
const uploadFile = ref<UploadInstance>();

// 定义作物类型数据
const cropTypes = [
	{ value: '玉米', label: '玉米' },
	{ value: '小麦', label: '小麦' },
	{ value: '水稻', label: '水稻' },
	{ value: '马铃薯', label: '马铃薯' },
	{ value: '棉花', label: '棉花' },
	{ value: '苹果', label: '苹果' },
	{ value: '葡萄', label: '葡萄' },
	{ value: '番茄', label: '番茄' },
	{ value: '草莓', label: '草莓' }
];

// 定义变量内容
const diseaseDialogFormRef = ref();
const state = reactive({
	form: {
		id: null,
		cropType: '',
		name: '',
		symptoms: '',
		causes: '',
		prevention: '',
		images: ''
	},
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

// 打开弹窗
const openDialog = (type: string, row: any) => {
	if (type === 'edit') {
		state.form = { ...row };
		state.dialog.title = '修改病害信息';
		state.dialog.submitTxt = '修 改';
		imageUrl.value = state.form.images;
	} else {
		state.dialog.title = '新增病害信息';
		state.dialog.submitTxt = '新 增';
		// 清空表单
		nextTick(() => {
			uploadFile.value!.clearFiles();
			imageUrl.value = '';
			state.form = {
				id: null,
				cropType: '',
				name: '',
				symptoms: '',
				causes: '',
				prevention: '',
				images: ''
			};
		});
	}
	state.dialog.isShowDialog = true;
};

// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};

// 取消
const onCancel = () => {
	closeDialog();
};

// 提交
const onSubmit = () => {
	if (state.dialog.title === '修改病害信息') {
		diseaseApi.updateDisease(state.form).then((res) => {
			if (res.code == 0) {
				ElMessage.success('修改成功！');
				setTimeout(() => {
					closeDialog();
					emit('refresh');
				}, 500);
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		}).catch(error => {
			ElMessage({
				type: 'error',
				message: '修改失败：' + error.message,
			});
		});
	} else {
		diseaseApi.addDisease(state.form).then((res) => {
			if (res.code == 0) {
				ElMessage.success('添加成功！');
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
			setTimeout(() => {
				closeDialog();
				emit('refresh');
			}, 500);
		}).catch(error => {
			ElMessage({
				type: 'error',
				message: '添加失败：' + error.message,
			});
		});
	}
};

// 图片上传成功
const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
	imageUrl.value = URL.createObjectURL(uploadFile.raw!);
	state.form.images = response.data;
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
:deep(.dia) {
	.el-dialog {
		margin-top: 8vh !important;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(72, 187, 120, 0.2);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(72, 187, 120, 0.2);
		
		.el-dialog__header {
			padding: 20px;
			margin-right: 0;
			border-bottom: 1px solid rgba(72, 187, 120, 0.2);
			
			.el-dialog__title {
				font-size: 18px;
				font-weight: 600;
				color: #2f855a;
			}
		}
		
		.el-dialog__body {
			padding: 20px;
		}
		
		.el-dialog__footer {
			padding: 20px;
			border-top: 1px solid rgba(72, 187, 120, 0.2);
			
			.dialog-footer {
				:deep(.el-button--primary) {
					background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
					border: none;
					box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
					transition: all 0.3s ease;
					
					&:hover {
						transform: translateY(-2px);
						box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
						background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
					}
				}
			}
		}
	}
}

.avatar-uploader {
	:deep(.el-upload) {
		border: 2px dashed rgba(72, 187, 120, 0.3);
		border-radius: 12px;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
		width: 200px;
		height: 200px;
		display: flex;
		justify-content: center;
		align-items: center;
		background: rgba(72, 187, 120, 0.05);

		&:hover {
			border-color: #48bb78;
			background: rgba(72, 187, 120, 0.1);
			transform: translateY(-2px);
		}
	}
}

.avatar-uploader-icon {
	font-size: 36px;
	color: #48bb78;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: all 0.3s ease;
}

.avatar {
	width: 100%;
	height: 100%;
	object-fit: contain;
	display: block;
	border-radius: 12px;
	transition: all 0.3s ease;
	box-shadow: 0 4px 16px rgba(72, 187, 120, 0.2);
}

.mb20 {
	margin-bottom: 15px;
}

:deep(.el-form-item__label) {
	font-weight: 600;
	color: #2f855a;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
	box-shadow: 0 0 0 1px rgba(72, 187, 120, 0.2) inset;
	border-radius: 8px;
	transition: all 0.3s ease;
	
	&:hover {
		box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.3) inset;
		border-color: rgba(72, 187, 120, 0.4);
	}
	
	&.is-focus,
	&:focus-within {
		box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.4) inset;
		border-color: #48bb78;
	}
}

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
</style>