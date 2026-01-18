<template>
	<div class="system-role-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="800px" class="dia">
			<el-form ref="purchaseDialogFormRef" :model="state.form" :rules="state.rules" size="default" label-width="90px">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="产品名称" prop="productName">
							<el-input v-model="state.form.productName" placeholder="请输入产品名称" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="供货商" prop="supplier">
							<el-input v-model="state.form.supplier" placeholder="请输入供货商" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="价格" prop="price">
							<el-input-number v-model="state.form.price" :precision="2" :step="0.01" :min="0" style="width: 100%" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="数量" prop="quantity">
							<el-input-number v-model="state.form.quantity" :min="0" style="width: 100%" />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="地区" prop="region">
							<el-input v-model="state.form.region" placeholder="请输入地区" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="电话" prop="phone">
							<el-input v-model="state.form.phone" placeholder="请输入电话" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
						<el-form-item label="采购人" prop="manager">
							<el-input v-model="state.form.manager" placeholder="请输入采购人" clearable />
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="备注" prop="remark">
							<el-input v-model="state.form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
import { ElMessage } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { usePurchaseApi } from '/@/api/purchase';
const purchaseApi = usePurchaseApi();

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const purchaseDialogFormRef = ref<FormInstance>();
const state = reactive({
	form: {
		id: null,
		productName: '',
		price: 0,
		quantity: 0,
		supplier: '',
		region: '',
		phone: '',
		manager: '',
		remark: ''
	},
	rules: {
		productName: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
		price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
		quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
		supplier: [{ required: true, message: '请输入供货商', trigger: 'blur' }],
		region: [{ required: true, message: '请输入地区', trigger: 'blur' }],
		phone: [
			{ required: true, message: '请输入电话', trigger: 'blur' },
		],
		manager: [{ required: true, message: '请输入采购人', trigger: 'blur' }],
		remark: [{ required: true, message: '请输入备注', trigger: 'blur' }]
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
		state.dialog.title = '修改采购信息';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增采购信息';
		state.dialog.submitTxt = '新 增';
		// 清空表单
		nextTick(() => {
			state.form = {
				id: null,
				productName: '',
				price: 0,
				quantity: 0,
				supplier: '',
				region: '',
				phone: '',
				manager: '',
				remark: ''
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
	if (!purchaseDialogFormRef.value) return;
	purchaseDialogFormRef.value.validate((valid: boolean) => {
		if (valid) {
			if (state.dialog.title === '修改采购信息') {
				purchaseApi.updatePurchase(state.form).then((res) => {
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
				});
			} else {
				purchaseApi.addPurchase(state.form).then((res) => {
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
				});
			}
		} else {
			return false;
		}
	});
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

.el-form {
	width: 100%;
	margin: 0;
	padding: 0;
}

:deep(.el-form-item__label) {
	font-weight: 600;
	color: #2f855a;
}

:deep(.el-input-number) {
	width: 100%;
	
	.el-input__wrapper {
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

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
	border-radius: 8px;
	transition: all 0.3s ease;
	
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

:deep(.el-textarea__inner) {
	min-height: 100px;
	resize: vertical;
}

.mb20 {
	margin-bottom: 20px;
}
</style>