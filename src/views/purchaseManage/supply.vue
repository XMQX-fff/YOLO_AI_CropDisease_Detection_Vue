<template>
	<div class="supply-container layout-padding">
		<div class="supply-padding layout-padding-auto layout-padding-view">
			<h2 class="supply-title">供应管理</h2>

			<el-tabs v-model="activeTab" class="supply-tabs">
				<!-- 供应产品管理标签页 -->
				<el-tab-pane label="供应产品管理" name="product">
					<div class="product-tab">
						<div class="supply-search mb15">
							<el-input v-model="state.tableData.param.search" size="default" placeholder="请输入产品名称"
								style="max-width: 180px"> </el-input>
							<el-input v-model="state.tableData.param.supplier" size="default" placeholder="请输入供货商"
								class="ml10" style="max-width: 180px"> </el-input>
							<el-input v-model="state.tableData.param.region" size="default" placeholder="请输入地区"
								class="ml10" style="max-width: 180px"> </el-input>
							<el-button size="default" type="primary" class="ml10" @click="getTableData()">
								<el-icon>
									<ele-Search />
								</el-icon>
								查询
							</el-button>
							<el-button size="default" type="success" class="ml10" @click="onOpenAddSupply('add')">
								<el-icon>
									<ele-FolderAdd />
								</el-icon>
								添加供应产品
							</el-button>
						</div>
						<el-table :data="state.tableData.data" v-loading="state.tableData.loading" style="width: 100%">
							<el-table-column prop="num" label="序号" width="80" align="center" />
							<el-table-column prop="productName" label="产品名称" show-overflow-tooltip width="120"
								align="center" />
							<el-table-column prop="price" label="价格(元)" width="120" align="center" />
							<el-table-column prop="stock" label="库存数量" width="120" align="center" />
							<el-table-column prop="supplierId" label="供货商" show-overflow-tooltip width="120"
								align="center" />
							<el-table-column prop="region" label="地区" show-overflow-tooltip width="120"
								align="center" />
							<el-table-column prop="phone" label="电话" show-overflow-tooltip width="150" align="center" />
							<el-table-column prop="description" label="产品描述" show-overflow-tooltip width="150"
								align="center" />
							<el-table-column label="操作" width="180" fixed="right" align="center">
								<template #default="scope">
									<el-button size="small" type="primary"
										@click="onOpenEditSupply('edit', scope.row)">修改</el-button>
									<el-button size="small" type="danger" @click="onRowDel(scope.row)">删除</el-button>
								</template>
							</el-table-column>
						</el-table>
						<el-pagination @size-change="onHandleSizeChange" @current-change="onHandleCurrentChange"
							class="mt15" :pager-count="5" :page-sizes="[10, 20, 30]"
							v-model:current-page="state.tableData.param.pageNum" background
							v-model:page-size="state.tableData.param.pageSize"
							layout="total, sizes, prev, pager, next, jumper" :total="state.tableData.total">
						</el-pagination>
					</div>
				</el-tab-pane>

				<!-- 订单发货管理标签页 -->
				<el-tab-pane label="订单发货管理" name="delivery">
					<div class="delivery-tab">
						<div class="delivery-search mb15">
							<el-input v-model="state.deliverySearch.orderNo" size="default" placeholder="请输入订单号"
								style="max-width: 200px"> </el-input>
							<el-select v-model="state.deliverySearch.status" placeholder="请选择订单状态"
								style="max-width: 180px" class="ml10">
								<el-option label="全部状态" value="" />
								<el-option label="待支付" value="pending" />
								<el-option label="已支付" value="paid" />
								<el-option label="已发货" value="shipped" />
								<el-option label="已完成" value="completed" />
								<el-option label="已取消" value="cancelled" />
							</el-select>
							<el-button size="default" type="primary" class="ml10" @click="searchOrders">
								<el-icon>
									<ele-Search />
								</el-icon>
								查询
							</el-button>
						</div>

						<!-- 订单列表 -->
						<el-table :data="state.orderList" v-loading="state.orderLoading" style="width: 100%">
							<el-table-column prop="orderNo" label="订单号" show-overflow-tooltip width="220"
								align="center" />
							<el-table-column prop="totalPrice" label="总价(元)" width="150" align="center" />
							<el-table-column prop="status" label="订单状态" width="150" align="center">
								<template #default="scope">
									<el-tag :type="getOrderStatusTagType(scope.row.status)">
										{{ getOrderStatusText(scope.row.status) }}
									</el-tag>
								</template>
							</el-table-column>
							<el-table-column prop="orderTime" label="下单时间" width="220" align="center" />
							<el-table-column prop="logisticsStatus" label="物流信息" show-overflow-tooltip width="250"
								align="center" />
							<el-table-column label="操作" width="300" fixed="right" align="center">
								<template #default="scope">
									<el-button size="small" type="primary"
										@click="viewOrderDetails(scope.row)">查看详情</el-button>
									<el-button size="small" type="success" v-if="scope.row.status === 'paid'"
										@click="manageLogistics(scope.row)">管理物流</el-button>
								</template>
							</el-table-column>
						</el-table>

						<!-- 订单分页 -->
						<el-pagination @size-change="onOrderHandleSizeChange"
							@current-change="onOrderHandleCurrentChange" class="mt15" :pager-count="5"
							:page-sizes="[5, 10, 20]" v-model:current-page="state.orderPageNum" background
							v-model:page-size="state.orderPageSize" layout="total, sizes, prev, pager, next, jumper"
							:total="state.orderTotal">
						</el-pagination>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
		<SupplyDialog ref="supplyDialogRef" @refresh="getTableData()" />
		<LogisticsDialog ref="logisticsDialogRef" @refresh="searchOrders" />

		<!-- 订单详情弹窗 -->
		<el-dialog title="订单详情" v-model="orderDetailDialogVisible" width="800px">
			<div v-if="orderDetail.order" class="order-detail-dialog">
				<!-- 订单基本信息 -->
				<div class="order-basic-info">
					<h3>订单信息</h3>
					<div class="order-info-grid">
						<div class="order-info-item">
							<span class="label">订单号:</span>
							<span class="value">{{ orderDetail.order.id }}</span>
						</div>
						<div class="order-info-item">
							<span class="label">订单状态:</span>
							<el-tag :type="getOrderStatusTagType(orderDetail.order.status)">
								{{ getOrderStatusText(orderDetail.order.status) }}
							</el-tag>
						</div>
						<div class="order-info-item">
							<span class="label">下单时间:</span>
							<span class="value">{{ orderDetail.order.orderTime }}</span>
						</div>
						<div class="order-info-item">
							<span class="label">支付时间:</span>
							<span class="value">{{ orderDetail.order.paidTime || '-' }}</span>
						</div>
						<div class="order-info-item">
							<span class="label">发货时间:</span>
							<span class="value">{{ orderDetail.order.shippedTime || '-' }}</span>
						</div>
						<div class="order-info-item">
							<span class="label">完成时间:</span>
							<span class="value">{{ orderDetail.order.completedTime || '-' }}</span>
						</div>
						<div class="order-info-item">
							<span class="label">取消时间:</span>
							<span class="value">{{ orderDetail.order.cancelledTime || '-' }}</span>
						</div>
						<div class="order-info-item">
							<span class="label">联系电话:</span>
							<span class="value">{{ orderDetail.order.phone }}</span>
						</div>
						<div class="order-info-item full-width">
							<span class="label">收货地址:</span>
							<span class="value">{{ orderDetail.order.address }}</span>
						</div>
						<div class="order-info-item full-width">
							<span class="label">备注:</span>
							<span class="value">{{ orderDetail.order.remark || '-' }}</span>
						</div>
					</div>
				</div>

				<!-- 订单商品列表 -->
				<div class="order-items-info">
					<h3>订单商品</h3>
					<el-table :data="orderDetail.orderItems" style="width: 100%" size="small">
						<el-table-column prop="productName" label="商品名称" show-overflow-tooltip width="200" />
						<el-table-column prop="productDescription" label="商品描述" show-overflow-tooltip width="200" />
						<el-table-column prop="quantity" label="数量" width="100" align="center" />
						<el-table-column prop="price" label="单价(元)" width="120" align="right">
							<template #default="scope">¥{{ scope.row.price }}</template>
						</el-table-column>
						<el-table-column label="小计(元)" width="120" align="right">
							<template #default="scope">¥{{ (scope.row.price * scope.row.quantity).toFixed(2)
								}}</template>
						</el-table-column>
					</el-table>
				</div>

				<!-- 订单总计 -->
				<div class="order-total">
					<div class="total-info">
						<span class="label">商品总计:</span>
						<span class="value">¥{{ orderDetail.order.totalPrice }}</span>
					</div>
				</div>
			</div>

			<template #footer>
				<span class="dialog-footer">
					<el-button @click="orderDetailDialogVisible = false">关闭</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="supplyManage">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useUserInfo } from '/@/stores/userInfo';

// 引入组件
const SupplyDialog = defineAsyncComponent(() => import('./supplyDialog.vue'));
const LogisticsDialog = defineAsyncComponent(() => import('./logisticsDialog.vue'));
// 获取用户信息
const userInfoStore = useUserInfo();
// 导入API
import { usePurchaseApi } from '/@/api/purchase';
const purchaseApi = usePurchaseApi();

// 定义变量内容
const supplyDialogRef = ref();
const logisticsDialogRef = ref();
const activeTab = ref('product');
// 订单详情弹窗
const orderDetailDialogVisible = ref(false);
const orderDetail = ref<any>(null);
const state = reactive({
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			supplier: '',
			region: '',
			userId: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
	// 订单发货管理相关状态
	deliverySearch: {
		orderNo: '',
		status: '',
	},
	orderList: [] as any[],
	orderLoading: false,
	orderPageNum: 1,
	orderPageSize: 10,
	orderTotal: 0,
});

// 获取表格数据
const getTableData = () => {
	state.tableData.loading = true;
	if (userInfoStore.userInfos.role !== 'admin') {
		state.tableData.param.userId = userInfoStore.userInfos.userId;
	}
	purchaseApi.getProductList(state.tableData.param)
		.then((res) => {
			if (res.code == 0 || res.code == '0') {
				state.tableData.data = [];
				setTimeout(() => {
					state.tableData.loading = false;
				}, 500);
				for (let i = 0; i < res.data.records.length; i++) {
					state.tableData.data[i] = res.data.records[i];
					state.tableData.data[i]['num'] = i + 1;
				}
				state.tableData.total = res.data.total;
			} else {
				ElMessage({
					type: 'error',
					message: res.msg || '获取产品列表失败',
				});
				state.tableData.loading = false;
			}
		})
		.catch(() => {
			ElMessage({
				type: 'error',
				message: '获取产品列表失败',
			});
			state.tableData.loading = false;
		});
};

// 查询订单数据
const searchOrders = () => {
	state.orderLoading = true;
	const params = {
		pageNum: state.orderPageNum,
		pageSize: state.orderPageSize,
		orderNo: state.deliverySearch.orderNo,
		status: state.deliverySearch.status,
		supplierId: userInfoStore.userInfos.userId,
		isPaid: true, // 只查询已支付的订单
	};

	purchaseApi.getOrderList(params)
		.then((res) => {
			if (res.code == 0 || res.code == '0') {
				setTimeout(() => {
					state.orderLoading = false;
				}, 500);
				state.orderList = res.data.records || [];
				state.orderTotal = res.data.total || 0;
			} else {
				ElMessage({
					type: 'error',
					message: res.msg || '获取订单列表失败',
				});
				state.orderLoading = false;
			}
		})
		.catch(() => {
			ElMessage({
				type: 'error',
				message: '获取订单列表失败',
			});
			state.orderLoading = false;
		});
};

// 打开新增供应产品弹窗
const onOpenAddSupply = (type: string) => {
	supplyDialogRef.value.openDialog(type);
};

// 打开修改供应产品弹窗
const onOpenEditSupply = (type: string, row: Object) => {
	supplyDialogRef.value.openDialog(type, row);
};

// 删除供应产品
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该供应产品信息，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
		.then(() => {
			purchaseApi.deletePurchase(row.id).then((res) => {
				if (res.code == 0) {
					ElMessage({
						type: 'success',
						message: '删除成功！',
					});
					setTimeout(() => {
						getTableData();
					}, 500);
				} else {
					ElMessage({
						type: 'error',
						message: '删除失败！',
					});
				}
			});
		})
		.catch(() => {
			ElMessage({
				type: 'info',
				message: '已取消删除',
			});
		});
};

// 获取订单状态文本
const getOrderStatusText = (status: string) => {
	const statusMap: Record<string, string> = {
		pending: '待支付',
		paid: '已支付',
		shipped: '已发货',
		completed: '已完成',
		cancelled: '已取消',
	};
	return statusMap[status] || status;
};

// 获取订单状态标签类型
const getOrderStatusTagType = (status: string) => {
	const typeMap: Record<string, any> = {
		pending: 'warning',
		paid: 'success',
		shipped: 'info',
		completed: 'success',
		cancelled: 'danger',
	};
	return typeMap[status] || 'default';
};

// 查看订单详情
const viewOrderDetails = (row: any) => {
	// 调用真实API查看订单详情
	purchaseApi.getOrderDetail(row.id).then((res) => {
		if (res.code === 0 || res.code === '0') {
			// 将订单详情数据存储到orderDetail中
			orderDetail.value = res.data;
			// 打开订单详情弹窗
			orderDetailDialogVisible.value = true;
		} else {
			ElMessage.error(res.msg || '获取订单详情失败');
		}
	}).catch(() => {
		ElMessage.error('获取订单详情失败');
	});
};

// 获取物流状态文本
const getLogisticsStatusText = (status: string) => {
	const statusMap: Record<string, string> = {
		pending: '待发货',
		shipped: '已发货',
		transporting: '运输中',
		delivered: '已签收',
	};
	return statusMap[status] || status;
};

// 获取物流状态标签类型
const getLogisticsStatusTagType = (status: string) => {
	const typeMap: Record<string, any> = {
		pending: 'warning',
		shipped: 'success',
		transporting: 'info',
		delivered: 'success',
	};
	return typeMap[status] || 'default';
};

// 管理物流信息
const manageLogistics = (row: any) => {
	// 打开物流管理对话框
	logisticsDialogRef.value.openDialog(row);
};

// 订单分页改变事件
const onOrderHandleSizeChange = (size: number) => {
	state.orderPageSize = size;
	state.orderPageNum = 1;
	searchOrders();
};

// 订单页码改变事件
const onOrderHandleCurrentChange = (current: number) => {
	state.orderPageNum = current;
	searchOrders();
};

// 供应产品分页改变事件
const onHandleSizeChange = (size: number) => {
	state.tableData.param.pageSize = size;
	getTableData();
};

// 供应产品页码改变事件
const onHandleCurrentChange = (current: number) => {
	state.tableData.param.pageNum = current;
	getTableData();
};

// 页面加载时
onMounted(() => {
	getTableData();
	searchOrders();
});
</script>

<style scoped lang="scss">
.supply-title {
	font-size: 24px;
	font-weight: 600;
	color: #2f855a;
	margin-bottom: 20px;
	text-align: center;
}

.supply-container {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
	padding: 20px;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

	.supply-padding {
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

		.el-table {
			flex: 1;
			background: rgba(255, 255, 255, 0.9);
			border-radius: 12px;
			border: 1px solid rgba(72, 187, 120, 0.2);
			overflow: hidden;

			:deep(.el-table__row) {
				height: 60px;
				transition: all 0.3s ease;

				&:hover {
					background: rgba(72, 187, 120, 0.1);
				}
			}

			:deep(.el-table__header) {
				th {
					padding: 10px 0;
					background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
					color: white;
					font-weight: 600;
					border-bottom: none;
				}
			}

			:deep(.el-table__cell) {
				padding: 8px 0;
				border-bottom: 1px solid rgba(72, 187, 120, 0.1);
			}

			:deep(.cell) {
				line-height: 1.5;
			}
		}

		:deep(.el-input) {
			height: 40px;
			line-height: 40px;
			max-width: 180px;

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
		}

		:deep(.el-button) {
			border-radius: 8px;
			transition: all 0.3s ease;
			padding: 8px 16px;
		}

		:deep(.el-button--primary) {
			background: linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%);
			border: none;

			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 16px rgba(49, 130, 206, 0.4);
				background: linear-gradient(135deg, #2b6cb0 0%, #3182ce 100%);
			}
		}

		:deep(.el-button--danger) {
			background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
			border: none;

			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 16px rgba(229, 62, 62, 0.4);
				background: linear-gradient(135deg, #c53030 0%, #e53e3e 100%);
			}
		}

		:deep(.el-button--text) {
			color: #48bb78;

			&:hover {
				color: #2f855a;
				background: rgba(72, 187, 120, 0.1);
			}
		}

		:deep(.el-pagination) {
			.el-pagination__sizes .el-input .el-input__wrapper {
				border-radius: 8px;
			}

			.el-pager li {
				border-radius: 4px;
				transition: all 0.3s ease;

				&:hover {
					background: rgba(72, 187, 120, 0.1);
				}

				&.active {
					background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
					color: white;
				}
			}

			.btn-prev,
			.btn-next {
				border-radius: 4px;
				transition: all 0.3s ease;

				&:hover {
					background: rgba(72, 187, 120, 0.1);
				}
			}
		}
	}
}

// 搜索区域样式
.supply-search {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 20px;
	padding: 20px;
	background: linear-gradient(135deg, rgba(72, 187, 120, 0.1) 0%, rgba(47, 133, 90, 0.1) 100%);
	border-radius: 12px;
	border: 1px solid rgba(72, 187, 120, 0.2);
	flex-wrap: wrap;

	:deep(.el-input) {
		height: 40px;
		line-height: 40px;
		max-width: 180px;

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
	}

	:deep(.el-button) {
		border-radius: 8px;
		transition: all 0.3s ease;
		padding: 8px 16px;
	}

	:deep(.el-button--primary),
	:deep(.el-button--success) {
		background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
		border: none;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
			background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
		}
	}
}

.mb15 {
	margin-bottom: 20px;
}

.ml10 {
	margin-left: 15px;
}

.mt15 {
	margin-top: 20px;
}

/* 订单详情弹窗样式 */
.order-detail-dialog {
	padding: 20px 0;
}

.order-basic-info,
.order-items-info,
.order-logistics-info {
	margin-bottom: 30px;

	h3 {
		margin-bottom: 15px;
		padding-bottom: 5px;
		border-bottom: 1px solid #e4e7ed;
		color: #303133;
	}
}

.order-info-grid,
.logistics-info-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 15px;
}

.order-info-item,
.logistics-info-item {
	display: flex;
	align-items: center;

	.label {
		width: 80px;
		color: #909399;
		font-size: 14px;
	}

	.value {
		color: #303133;
		font-size: 14px;
	}
}

.full-width {
	grid-column: span 2;
}

.logistics-details {
	margin-top: 5px;
	color: #303133;
	font-size: 14px;
	line-height: 1.6;
	white-space: pre-wrap;
}

.no-data {
	text-align: center;
	color: #909399;
	padding: 20px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {

	.order-info-grid,
	.logistics-info-grid {
		grid-template-columns: 1fr;
	}

	.full-width {
		grid-column: span 1;
	}
}
</style>