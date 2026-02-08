<template>
	<el-dialog
		v-model="dialogVisible"
		:title="dialogTitle"
		width="600px"
		:before-close="handleClose"
	>
		<el-form ref="logisticsFormRef" :model="logisticsForm" label-width="100px" class="logistics-form" :rules="formRules">
			<el-form-item label="订单号" prop="orderNo" disabled>
				<el-input v-model="logisticsForm.orderNo" placeholder="订单号" />
			</el-form-item>
			<el-form-item label="订单金额" prop="orderAmount" disabled>
				<el-input v-model="logisticsForm.orderAmount" placeholder="订单金额" />
			</el-form-item>
			<el-form-item label="订单状态" prop="orderStatus" disabled>
				<el-input v-model="logisticsForm.orderStatus" placeholder="订单状态" />
			</el-form-item>
			<el-form-item label="物流单号" prop="logisticsNo" required>
				<el-input v-model="logisticsForm.logisticsNo" placeholder="请输入物流单号" />
			</el-form-item>
			<el-form-item label="物流公司" prop="logisticsCompany" required>
				<el-input v-model="logisticsForm.logisticsCompany" placeholder="请输入物流公司" />
			</el-form-item>
			<el-form-item label="物流状态" prop="logisticsStatus" required>
				<el-select v-model="logisticsForm.logisticsStatus" placeholder="请选择物流状态">
					<el-option label="待发货" value="pending" />
					<el-option label="已发货" value="shipped" />
					<el-option label="运输中" value="transporting" />
					<el-option label="已签收" value="delivered" />
				</el-select>
			</el-form-item>
			<el-form-item label="物流信息" prop="logisticsInfo" required>
				<el-input
					v-model="logisticsForm.logisticsInfo"
					type="textarea"
					:rows="3"
					placeholder="请输入物流信息"
				/>
			</el-form-item>
			<el-form-item label="发货时间" prop="shipTime">
				<el-date-picker
					v-model="logisticsForm.shipTime"
					type="datetime"
					placeholder="请选择发货时间"
					style="width: 100%"
				/>
			</el-form-item>
		</el-form>
		
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="handleClose">取消</el-button>
				<el-button type="primary" @click="handleSave" :loading="saveLoading">保存</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup lang="ts" name="logisticsDialog">
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useLogisticsApi } from '/@/api/logistics';
import { usePurchaseApi } from '/@/api/purchase';

// 定义变量内容
const emit = defineEmits(['refresh']);
const dialogVisible = ref(false);
const saveLoading = ref(false);
const currentOrder = ref<any>(null);
const logisticsFormRef = ref();
const logisticsApi = useLogisticsApi();
const purchaseApi = usePurchaseApi();

// 物流表单数据
const logisticsForm = reactive({
	id: '',
	orderId: '',
	orderNo: '',
	orderAmount: '',
	orderStatus: '',
	logisticsNo: '',
	logisticsCompany: '',
	logisticsStatus: 'pending',
	logisticsInfo: '',
	shipTime: null,
});

// 表单验证规则
const formRules = reactive({
	logisticsNo: [
		{ required: true, message: '请输入物流单号', trigger: 'blur' },
		{ min: 5, max: 50, message: '物流单号长度在 5 到 50 个字符', trigger: 'blur' }
	],
	logisticsCompany: [
		{ required: true, message: '请输入物流公司', trigger: 'blur' },
		{ min: 2, max: 20, message: '物流公司名称长度在 2 到 20 个字符', trigger: 'blur' }
	],
	logisticsStatus: [
		{ required: true, message: '请选择物流状态', trigger: 'change' }
	],
	logisticsInfo: [
		{ required: true, message: '请输入物流信息', trigger: 'blur' },
		{ min: 5, message: '物流信息长度不能少于 5 个字符', trigger: 'blur' }
	]
});

// 对话框标题
const dialogTitle = computed(() => {
	return currentOrder.value ? '管理物流信息' : '新增物流信息';
});

// 打开对话框
const openDialog = (order: any) => {
	currentOrder.value = order;
	dialogVisible.value = true;
	
	// 初始化表单数据
	logisticsForm.id = '';
	logisticsForm.orderId = order.id;
	logisticsForm.orderNo = order.orderNo;
	logisticsForm.orderAmount = order.totalPrice;
	logisticsForm.orderStatus = getOrderStatusText(order.status);
	logisticsForm.logisticsNo = '';
	logisticsForm.logisticsCompany = '';
	logisticsForm.logisticsStatus = 'pending';
	logisticsForm.logisticsInfo = '';
	logisticsForm.shipTime = null;
	
	// 查询订单现有的物流信息
		if (order.id) {
			logisticsApi.getLogisticsByOrderId(order.id)
				.then((res) => {
					if (res.code == 0 && res.data) {
						// 填充现有物流信息
						const logisticsData = res.data.order;
						console.log('物流数据：', logisticsData);
						logisticsForm.id = logisticsData.id;
						logisticsForm.logisticsNo = logisticsData.logisticsNo;
						logisticsForm.logisticsCompany = logisticsData.logisticsCompany;
						logisticsForm.logisticsStatus = logisticsData.logisticsStatus;
						logisticsForm.logisticsInfo = logisticsData.logisticsInfo;
						logisticsForm.shipTime = logisticsData.shipTime ? new Date(logisticsData.shipTime) : null;
					} else if (res.code !== 0 && res.msg) {
						// 有错误信息但没有数据
						ElMessage({
							type: 'warning',
							message: res.msg || '当前订单没有物流信息',
						});
					}
				})
				.catch(() => {
					// 请求失败，提示用户
					ElMessage({
						type: 'error',
						message: '获取现有物流信息失败',
					});
				});
		}
};

// 关闭对话框
const handleClose = () => {
	dialogVisible.value = false;
	// 重置表单
	resetForm();
};

// 重置表单
const resetForm = () => {
	logisticsForm.id = '';
	logisticsForm.orderId = '';
	logisticsForm.orderNo = '';
	logisticsForm.orderAmount = '';
	logisticsForm.orderStatus = '';
	logisticsForm.logisticsNo = '';
	logisticsForm.logisticsCompany = '';
	logisticsForm.logisticsStatus = 'pending';
	logisticsForm.logisticsInfo = '';
	logisticsForm.shipTime = null;
	currentOrder.value = null;
};

// 保存物流信息
const handleSave = () => {
	// 验证表单
	logisticsFormRef.value.validate((valid: boolean) => {
		if (!valid) {
			return;
		}
		
		saveLoading.value = true;
		
		// 准备保存的数据
		const saveData = {
			id: logisticsForm.id.trim(),
			orderId: logisticsForm.orderId.trim(),
			logisticsNo: logisticsForm.logisticsNo.trim(),
			logisticsCompany: logisticsForm.logisticsCompany.trim(),
			logisticsStatus: logisticsForm.logisticsStatus.trim(),
			logisticsInfo: logisticsForm.logisticsInfo.trim(),
			shipTime: logisticsForm.shipTime ? new Date(logisticsForm.shipTime).toISOString() : null,
		};
		
		// 调用API保存物流信息
		const apiPromise = logisticsForm.id 
			? logisticsApi.updateLogistics(saveData) 
			: logisticsApi.addLogistics(saveData);

		apiPromise
			.then((res) => {
				if (res.code == 0 || res.code == '0') {
					// 更新订单状态为已发货
					if (logisticsForm.logisticsStatus === 'shipped' || logisticsForm.logisticsStatus === 'transporting' || logisticsForm.logisticsStatus === 'delivered') {
						purchaseApi.updateOrderStatus(logisticsForm.orderId, 'shipped')
							.then(() => {
								// 订单状态更新成功
							})
							.catch(() => {
								// 订单状态更新失败，不影响物流信息保存
							});
					}
					
					ElMessage({
						type: 'success',
						message: '物流信息保存成功',
					});
					handleClose();
					emit('refresh');
				} else {
					ElMessage({
						type: 'error',
						message: res.msg || '物流信息保存失败',
					});
				}
			})
			.catch(() => {
				ElMessage({
					type: 'error',
					message: '物流信息保存失败',
				});
			})
			.finally(() => {
				saveLoading.value = false;
			});
	});
};

// 获取订单状态文本
const getOrderStatusText = (status: string): string => {
	const statusMap: Record<string, string> = {
		pending: '待支付',
		paid: '已支付',
		shipped: '已发货',
		completed: '已完成',
		cancelled: '已取消',
	};
	return statusMap[status] || status;
};

// 导出组件方法
defineExpose({
	openDialog
});
</script>

<style scoped lang="scss">
.logistics-form {
	width: 100%;
	margin-top: 20px;

	:deep(.el-form-item__label) {
		font-weight: 600;
		color: #2f855a;
	}

	:deep(.el-input__wrapper) {
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

	:deep(.el-date-editor) {
		.el-input__wrapper {
			border-radius: 8px;
		}
	}
}

.dialog-footer {
	text-align: right;

	:deep(.el-button) {
		border-radius: 8px;
		transition: all 0.3s ease;
		padding: 8px 16px;
	}

	:deep(.el-button--primary) {
		background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
		border: none;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
			background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
		}
	}

	:deep(.el-button--default) {
		transition: all 0.3s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		}
	}
}
</style>