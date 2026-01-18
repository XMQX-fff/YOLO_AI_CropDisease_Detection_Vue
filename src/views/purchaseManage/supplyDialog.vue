<template>
	<div class="supply-dialog-container">
		<el-dialog :title="state.dialog.title" v-model="state.dialog.isShowDialog" width="800px" class="dia">
			<el-form ref="supplyDialogFormRef" :model="state.form" size="default" label-width="100px" :rules="rules">
				<el-row :gutter="35">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="产品名称" prop="productName" style="color: #000">
							<el-input v-model="state.form.productName" placeholder="请输入产品名称" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="价格(元)" prop="price">
							<el-input v-model="state.form.price" placeholder="请输入价格" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="库存数量" prop="stock">
							<el-input v-model="state.form.stock" placeholder="请输入库存数量" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="供货商" prop="supplier">
							<el-input v-model="state.form.supplier" placeholder="请输入供货商名称" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="地区" prop="region">
							<el-input v-model="state.form.region" placeholder="请输入地区" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="电话" prop="phone">
							<el-input v-model="state.form.phone" placeholder="请输入联系电话" clearable></el-input>
						</el-form-item>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb20">
						<el-form-item label="产品描述" prop="description">
							<el-input v-model="state.form.description" placeholder="请输入产品描述" clearable type="textarea"></el-input>
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

<script setup lang="ts" name="supplyDialog">
import { nextTick, computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { usePurchaseApi } from '/@/api/purchase';
const purchaseApi = usePurchaseApi();

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

// 定义变量内容
const supplyDialogFormRef = ref();
const rules = {
	productName: [
		{ required: true, message: '请输入产品名称', trigger: 'blur' },
		{ min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
	],
	price: [
		{ required: true, message: '请输入价格', trigger: 'blur' },
		{ type: 'number', message: '请输入有效的价格', trigger: 'blur' }
	],
	stock: [
		{ required: true, message: '请输入库存数量', trigger: 'blur' },
		{ type: 'number', message: '请输入有效的库存数量', trigger: 'blur' }
	],
	supplier: [
		{ required: true, message: '请输入供货商名称', trigger: 'blur' },
		{ min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
	],
	region: [
		{ required: true, message: '请输入地区', trigger: 'blur' },
		{ min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
	],
	phone: [
		{ required: true, message: '请输入联系电话', trigger: 'blur' },
		{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
	],
	description: [
		{ required: false, message: '请输入产品描述', trigger: 'blur' }
	]
};

const state = reactive({
	form: {} as any,
	submitTxt: '',
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
		state.form = row;
		state.dialog.title = '修改供应产品';
		state.dialog.submitTxt = '修 改';
	} else {
		state.dialog.title = '新增供应产品';
		state.dialog.submitTxt = '新 增';
		// 清空表单
		state.form = {
			productName: '',
			price: '',
			stock: '',
			supplier: '',
			region: '',
			phone: '',
			description: ''
		};
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
	if (!supplyDialogFormRef.value) return;
	supplyDialogFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			ElMessage.error('请完善必填信息');
			return false;
		}

		if (state.dialog.title == '修改供应产品') {
			purchaseApi.updateProduct(state.form).then((res) => {
				if (res.code == 0 || res.code == '0') {
					ElMessage.success('修改成功！');
					setTimeout(() => {
						closeDialog();
						emit('refresh');
					}, 500);
				} else {
					ElMessage({
						type: 'error',
						message: res.msg || '修改产品失败',
					});
				}
			}).catch(() => {
				ElMessage({
					type: 'error',
					message: '修改产品失败',
				});
			});
		} else {
			purchaseApi.addProduct(state.form).then((res) => {
				if (res.code == 0 || res.code == '0') {
					ElMessage.success('添加成功！');
				} else {
					ElMessage({
						type: 'error',
						message: res.msg || '添加产品失败',
					});
				}
				setTimeout(() => {
					closeDialog();
					emit('refresh');
				}, 500);
			}).catch(() => {
				ElMessage({
					type: 'error',
					message: '添加产品失败',
				});
			});
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
}

:deep(.el-form-item__label) {
	font-weight: 600;
	color: #2f855a;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
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

.mb20 {
	margin-bottom: 20px;
}
</style>