<template>
	<div class="mall-container layout-padding">
		<div class="mall-padding layout-padding-auto layout-padding-view">
			<h2 class="mall-title">农资商城</h2>
			
			<el-tabs v-model="activeTab" class="mall-tabs">
				<!-- 商品购买标签页 -->
				<el-tab-pane label="商品购买" name="buy">
					<div class="buy-tab">
						<div class="buy-search mb15">
							<el-input v-model="state.searchForm.keyword" size="default" placeholder="请输入产品名称" style="max-width: 200px"> </el-input>
							<el-select v-model="state.searchForm.region" placeholder="请选择地区" style="max-width: 180px" class="ml10">
								<el-option label="全部地区" value="" />
								<el-option label="华北地区" value="华北地区" />
								<el-option label="华东地区" value="华东地区" />
								<el-option label="华南地区" value="华南地区" />
								<el-option label="华中地区" value="华中地区" />
							</el-select>
							<el-button size="default" type="primary" class="ml10" @click="searchProducts">
								<el-icon>
									<ele-Search />
								</el-icon>
								查询
							</el-button>
						</div>
						
						<!-- 商品列表 -->
						<div class="product-list">
							<el-card v-for="product in state.productList" :key="product.id" class="product-card">
								<template #header>
									<div class="card-header">
										<span>{{ product.productName }}</span>
										<el-tag type="success" size="small">{{ product.region }}</el-tag>
									</div>
								</template>
								<div class="product-info">
									<div class="product-price">¥{{ product.price }}</div>
									<div class="product-stock">库存: {{ product.stock }}</div>
									<div class="product-supplier">供应商: {{ product.supplier }}</div>
									<div class="product-phone">电话: {{ product.phone }}</div>
									<div class="product-description">{{ product.description }}</div>
								</div>
								<div class="product-actions">
									<el-input-number v-model="product.buyCount" :min="1" :max="product.stock" :step="1" size="small" />
									<el-button type="primary" size="small" class="ml10" @click="buyProduct(product)">
										立即购买
									</el-button>
								</div>
							</el-card>
						</div>
						
						<!-- 分页 -->
						<el-pagination
							@size-change="onHandleSizeChange"
							@current-change="onHandleCurrentChange"
							class="mt15"
							:pager-count="5"
							:page-sizes="[8, 16, 24]"
							v-model:current-page="state.pageNum"
							background
							v-model:page-size="state.pageSize"
							layout="total, sizes, prev, pager, next, jumper"
							:total="state.total"
						>
						</el-pagination>
					</div>
				</el-tab-pane>
				
				<!-- 订单管理标签页 -->
				<el-tab-pane label="订单管理" name="order">
					<div class="order-tab">
						<div class="order-search mb15">
							<el-input v-model="state.orderSearch.orderNo" size="default" placeholder="请输入订单号" style="max-width: 200px"> </el-input>
							<el-select v-model="state.orderSearch.status" placeholder="请选择订单状态" style="max-width: 180px" class="ml10">
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
							<el-table-column prop="orderNo" label="订单号" show-overflow-tooltip width="220" align="center" />
							<el-table-column prop="totalPrice" label="总价(元)" width="150" align="center" />
							<el-table-column prop="status" label="订单状态" width="150" align="center">
								<template #default="scope">
									<el-tag :type="getOrderStatusTagType(scope.row.status)">
										{{ getOrderStatusText(scope.row.status) }}
									</el-tag>
								</template>
							</el-table-column>
							<el-table-column prop="orderTime" label="下单时间" width="220" align="center" />
							<el-table-column prop="logisticsInfo" label="物流信息" show-overflow-tooltip width="250" align="center" />
							<el-table-column label="操作" width="300" fixed="right" align="center">
								<template #default="scope">
									<el-button size="small" type="primary" @click="viewOrderDetails(scope.row)">查看详情</el-button>
									<el-button size="small" type="warning" v-if="scope.row.status === 'pending'" @click="payOrder(scope.row)">去支付</el-button>
									<el-button size="small" type="danger" v-if="scope.row.status === 'pending'" @click="cancelOrder(scope.row)">取消订单</el-button>
								</template>
							</el-table-column>
						</el-table>

						<!-- 订单分页 -->
						<el-pagination
							@size-change="onOrderHandleSizeChange"
							@current-change="onOrderHandleCurrentChange"
							class="mt15"
							:pager-count="5"
							:page-sizes="[5, 10, 20]"
							v-model:current-page="state.orderPageNum"
							background
							v-model:page-size="state.orderPageSize"
							layout="total, sizes, prev, pager, next, jumper"
							:total="state.orderTotal"
						>
						</el-pagination>
					</div>
				</el-tab-pane>
				
				<!-- 支付管理标签页 -->
				<el-tab-pane label="支付管理" name="payment">
					<div class="payment-tab">
						<!-- <h3>支付方式管理</h3>
						<div class="payment-methods">
							<el-card v-for="method in paymentMethods" :key="method.id" class="payment-card">
								<template #header>
									<div class="payment-header">
										<span>{{ method.name }}</span>
									</div>
								</template>
								<div class="payment-info">
									<div class="payment-description">{{ method.description }}</div>
									<div class="payment-status">
										状态: 
										<el-switch v-model="method.isEnabled" @change="updatePaymentMethod(method)" />
									</div>
								</div>
							</el-card>
						</div> -->
						
						<h3 class="mt20">支付记录</h3>
						<el-table :data="state.paymentRecords" v-loading="state.paymentLoading" style="width: 100%">
							<el-table-column prop="paymentNo" label="支付单号" show-overflow-tooltip width="220" align="center" />
							<el-table-column prop="orderId" label="订单号" show-overflow-tooltip width="220" align="center" />
							<el-table-column prop="amount" label="支付金额" width="160" align="center" />
							<el-table-column prop="paymentMethodName" label="支付方式" width="160" align="center" />
							<el-table-column prop="paymentTime" label="支付时间" width="220" align="center" />
							<el-table-column prop="status" label="支付状态" width="160" align="center">
								<template #default="scope">
									<el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">
										{{ scope.row.status === 'success' ? '支付成功' : '支付失败' }}
									</el-tag>
								</template>
							</el-table-column>
						</el-table>
						<!-- 分页 -->
						<div class="pagination-container">
							<el-pagination
								@size-change="onPaymentHandleSizeChange"
								@current-change="onPaymentHandleCurrentChange"
								v-model:current-page="state.paymentPageNum"
								v-model:page-size="state.paymentPageSize"
								layout="total, sizes, prev, pager, next, jumper"
								:total="state.paymentTotal"
							>
							</el-pagination>
						</div>
					</div>
				</el-tab-pane>
			</el-tabs>
		</div>
		
		<!-- 购买确认对话框 -->
		<el-dialog title="确认购买" v-model="confirmBuyDialogVisible" width="600px">
			<div v-if="selectedProduct" class="confirm-buy-dialog">
				<div class="confirm-product-info">
					<h3>{{ selectedProduct.productName }}</h3>
					<p>供应商: {{ selectedProduct.supplier }}</p>
					<p>地区: {{ selectedProduct.region }}</p>
					<p>电话: {{ selectedProduct.phone }}</p>
				</div>
				<div class="confirm-buy-details">
					<p>单价: ¥{{ selectedProduct.price }}</p>
					<p>数量: {{ selectedProduct.buyCount }}</p>
					<p>总价: ¥{{ selectedProduct.price * selectedProduct.buyCount }}</p>
				</div>
				<el-form :model="buyForm" label-width="80px" class="confirm-buy-form">
					<el-form-item label="收货地址">
						<el-input v-model="buyForm.address" type="textarea" rows="3" placeholder="请输入收货地址" />
					</el-form-item>
					<el-form-item label="联系电话">
						<el-input v-model="buyForm.phone" placeholder="请输入联系电话" />
					</el-form-item>
					<el-form-item label="备注">
						<el-input v-model="buyForm.remark" type="textarea" rows="2" placeholder="请输入备注" />
					</el-form-item>
				</el-form>
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="confirmBuyDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="confirmBuy">确 认</el-button>
			</span>
		</template>
	</el-dialog>

	<!-- 订单详情弹窗 -->
	<el-dialog title="订单详情" v-model="orderDetailDialogVisible" width="800px">
		<div v-if="orderDetail.order" class="order-detail-dialog">
			<!-- 订单基本信息 -->
			<div class="order-basic-info">
				<h3>订单信息</h3>
				<div class="order-info-grid">
					<div class="order-info-item">
						<span class="label">订单号:</span>
						<span class="value">{{ orderDetail.order.orderId }}</span>
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
						<template #default="scope">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</template>
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

<script setup lang="ts" name="mallManage">
import { reactive, ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePurchaseApi } from '/@/api/purchase';
import { useUserInfo } from '/@/stores/userInfo';
const purchaseApi = usePurchaseApi();
const userInfoStore = useUserInfo();

// 定义变量
const activeTab = ref('buy');
const confirmBuyDialogVisible = ref(false);
const selectedProduct = ref(null);
// 订单详情弹窗
const orderDetailDialogVisible = ref(false);
const orderDetail = ref({
    order: null,
    orderItems: []
});

// 购买表单
const buyForm = reactive({
	address: '',
	phone: '',
	remark: ''
});

// 状态管理
const state = reactive({
	// 搜索表单
	searchForm: {
		keyword: '',
		region: ''
	},
	// 产品列表
	productList: [],
	// 分页
	pageNum: 1,
	pageSize: 8,
	total: 0,
	// 订单管理
	orderSearch: {
		orderNo: '',
		status: ''
	},
	orderList: [],
	orderLoading: false,
	orderPageNum: 1,
	orderPageSize: 10,
	orderTotal: 0,
	// 支付管理
	paymentRecords: [],
	paymentLoading: false,
	paymentPageNum: 1,
	paymentPageSize: 10,
	paymentTotal: 0
});

// 支付方式数据
const paymentMethods = ref([]);

// 获取支付方式列表
const getPaymentMethods = () => {
	// 调用真实API获取支付方式列表
	purchaseApi.getEnabledPaymentMethods().then((res) => {
		if (res.code === 0 || res.code === '0') {
			paymentMethods.value = res.data;
		} else {
			ElMessage.error(res.msg || '获取支付方式失败');
		}
	}).catch(() => {
		ElMessage.error('获取支付方式失败');
	});
};

// 页面加载时
onMounted(() => {
	getProductList();
	getOrderList();
	getPaymentRecords();
	getPaymentMethods();
});

// 获取产品列表
const getProductList = () => {
	// 调用真实API获取产品列表
	const params = {
		pageNum: state.pageNum,
		pageSize: state.pageSize,
		search: state.searchForm.keyword,
		region: state.searchForm.region
	};
	purchaseApi.getProductList(params).then((res) => {
		if (res.code === 0 || res.code === '0') {
			state.productList = res.data.records.map((item: any) => ({
				...item,
				buyCount: 1
			}));
			state.total = res.data.total;
		} else {
			ElMessage.error(res.msg || '获取产品列表失败');
		}
	}).catch(() => {
		ElMessage.error('获取产品列表失败');
	});
};

// 获取订单列表
const getOrderList = () => {
	state.orderLoading = true;

	// 获取当前登录用户信息
	const currentUser = userInfoStore.userInfos;
	console.log('currentUser', currentUser);
	// 调用真实API获取订单列表
	const params = {
		pageNum: state.orderPageNum,
		pageSize: state.orderPageSize,
		search: state.orderSearch.orderNo,
		status: state.orderSearch.status,
		userId: currentUser.userId,
	};
	purchaseApi.getOrderList(params).then((res) => {
		if (res.code === 0 || res.code === '0') {
			state.orderList = res.data.records;
			state.orderTotal = res.data.total;
		} else {
			ElMessage.error(res.msg || '获取订单列表失败');
		}
		state.orderLoading = false;
	}).catch(() => {
		state.orderLoading = false;
		ElMessage.error('获取订单列表失败');
	});
};

// 获取支付记录
const getPaymentRecords = () => {
	state.paymentLoading = true;
	// 获取当前登录用户信息
	const currentUser = userInfoStore.userInfos;
	// 调用真实API获取支付记录
	const params = {
		pageNum: state.paymentPageNum,
		pageSize: state.paymentPageSize,
		userId: currentUser.userId,
	};
	purchaseApi.getPaymentRecordList(params).then((res) => {
		if (res.code === 0 || res.code === '0') {
			state.paymentRecords = res.data.records;
			state.paymentTotal = res.data.total;
		} else {
			ElMessage.error(res.msg || '获取支付记录失败');
		}
		state.paymentLoading = false;
	}).catch(() => {
		state.paymentLoading = false;
		ElMessage.error('获取支付记录失败');
	});
};

// 搜索产品
const searchProducts = () => {
	// 调用真实API搜索产品
	getProductList();
};

// 搜索订单
const searchOrders = () => {
	// 调用真实API搜索订单
	getOrderList();
};

// 支付记录分页处理
const onPaymentHandleSizeChange = (val: number) => {
	state.paymentPageSize = val;
	getPaymentRecords();
};
const onPaymentHandleCurrentChange = (val: number) => {
	state.paymentPageNum = val;
	getPaymentRecords();
};

// 购买产品
const buyProduct = (product) => {
	selectedProduct.value = product;
	confirmBuyDialogVisible.value = true;
};

// 确认购买
const confirmBuy = () => {
	if (!buyForm.address || !buyForm.phone) {
		ElMessage.error('请填写收货地址和联系电话');
		return;
	}
	// 调用真实API创建订单
	const orderData = {
		productId: selectedProduct.value.id,
		quantity: selectedProduct.value.buyCount,
		address: buyForm.address,
		phone: buyForm.phone,
		remark: buyForm.remark
	};
	purchaseApi.addOrder(orderData).then((res) => {
		if (res.code === 0 || res.code === '0') {
			ElMessage.success('购买成功！订单已创建');
			confirmBuyDialogVisible.value = false;
			// 刷新订单列表
			getOrderList();
		} else {
			ElMessage.error(res.msg || '创建订单失败');
		}
	}).catch(() => {
		ElMessage.error('创建订单失败');
	});
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
	const statusMap = {
		pending: '待支付',
		paid: '已支付',
		shipped: '已发货',
		completed: '已完成',
		cancelled: '已取消'
	};
	return statusMap[status] || status;
};

// 获取订单状态标签类型
const getOrderStatusTagType = (status) => {
	const typeMap = {
		pending: 'warning',
		paid: 'info',
		shipped: 'primary',
		completed: 'success',
		cancelled: 'danger'
	};
	return typeMap[status] || 'info';
};

// 查看订单详情
const viewOrderDetails = (order) => {
	// 调用真实API查看订单详情
	purchaseApi.getOrderDetail(order.id).then((res) => {
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

// 支付订单
const payOrder = (order) => {
	// 调用真实API支付订单
	const paymentData = {
		orderId: order.id,
		paymentMethod: '微信支付', // 默认支付方式，实际应该让用户选择
		amount: order.totalPrice
	};
	purchaseApi.addPaymentRecord(paymentData).then((res) => {
		if (res.code === 0 || res.code === '0') {
			ElMessage.success('支付成功！');
			// 刷新订单列表
			getOrderList();
			// 切换到支付标签页
			activeTab.value = 'payment';
		} else {
			ElMessage.error(res.msg || '支付失败');
		}
	}).catch(() => {
		ElMessage.error('支付失败');
	});
};

// 取消订单
const cancelOrder = (order) => {
	ElMessageBox.confirm(`确定要取消订单 ${order.orderNo} 吗？`, '提示', {
		confirmButtonText: '确定',
		cancelButtonText: '取消',
		type: 'warning'
	}).then(() => {
		// 调用真实API取消订单
		purchaseApi.updateOrder({
			id: order.id,
			status: 'cancelled'
		}).then((res) => {
			if (res.code === 0 || res.code === '0') {
				ElMessage.success('订单已取消');
				getOrderList();
			} else {
				ElMessage.error(res.msg || '取消订单失败');
			}
		}).catch(() => {
			ElMessage.error('取消订单失败');
		});
	}).catch(() => {});
};

// 更新支付方式
const updatePaymentMethod = (method) => {
	// 调用真实API更新支付方式
	purchaseApi.updatePaymentMethod({
		id: method.id,
		isEnabled: method.isEnabled
	}).then((res) => {
		if (res.code === 0 || res.code === '0') {
			ElMessage.success(`支付方式 ${method.name} 已${method.isEnabled ? '启用' : '禁用'}`);
		} else {
			ElMessage.error(res.msg || '更新支付方式失败');
		}
	}).catch(() => {
		ElMessage.error('更新支付方式失败');
	});
};

// 分页改变
const onHandleSizeChange = (val: number) => {
	state.pageSize = val;
	getProductList();
};

// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.pageNum = val;
	getProductList();
};

// 订单分页改变
const onOrderHandleSizeChange = (val: number) => {
	state.orderPageSize = val;
	getOrderList();
};

// 订单分页改变
const onOrderHandleCurrentChange = (val: number) => {
	state.orderPageNum = val;
	getOrderList();
};
</script>

<style scoped lang="scss">
.mall-container {
	width: 100%;
	height: 200vh;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
	padding: 20px;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

	.mall-padding {
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

.mall-title {
	font-size: 24px;
	font-weight: 600;
	color: #2f855a;
	margin-bottom: 20px;
	text-align: center;
}

.mall-tabs {
	:deep(.el-tabs__nav-wrap) {
		margin-bottom: 20px;
	}
	
	:deep(.el-tabs__item) {
		font-size: 16px;
		font-weight: 500;
	}
	
	:deep(.el-tabs__active-bar) {
		background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
	}
	
	:deep(.el-tabs__item.is-active) {
		color: #2f855a;
	}
}

/* 商品购买标签页样式 */
.buy-tab {
	.product-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: 20px;
		margin-bottom: 20px;
	}
	
	.product-card {
		transition: all 0.3s ease;
		border-radius: 12px;
		
		&:hover {
			transform: translateY(-5px);
			box-shadow: 0 12px 24px rgba(72, 187, 120, 0.2);
		}
		
		.card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-weight: 600;
			color: #2f855a;
		}
		
		.product-info {
			margin: 15px 0;
			line-height: 1.8;
		}
		
		.product-price {
			font-size: 20px;
			font-weight: 600;
			color: #e53e3e;
			margin-bottom: 10px;
		}
		
		.product-stock {
			color: #2f855a;
			font-weight: 500;
		}
		
		.product-actions {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			margin-top: 20px;
		}
	}
}

/* 订单管理标签页样式 */
.order-tab {
	.el-table {
		margin-top: 20px;
		border-radius: 12px;
		overflow: hidden;
		
		:deep(.el-table__header) {
			th {
				background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
				color: white;
				font-weight: 600;
			}
		}
	}
}

/* 支付管理标签页样式 */
.payment-tab {
	h3 {
		font-size: 18px;
		font-weight: 600;
		color: #2f855a;
		margin: 20px 0 15px;
	}
	
	.payment-methods {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
		margin-bottom: 30px;
	}
	
	.payment-card {
		transition: all 0.3s ease;
		border-radius: 12px;
		
		&:hover {
			transform: translateY(-5px);
			box-shadow: 0 12px 24px rgba(72, 187, 120, 0.2);
		}
		
		.payment-header {
			font-weight: 600;
			color: #2f855a;
		}
		
		.payment-info {
			margin: 15px 0;
			line-height: 1.8;
		}
	}
	
	.el-table {
		margin-top: 20px;
		margin-bottom: 20px;
		border-radius: 12px;
		overflow: hidden;
		
		:deep(.el-table__header) {
			th {
				background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
				color: white;
				font-weight: 600;
			}
		}
	}
}

/* 搜索区域样式 */
.buy-search,
.order-search {
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

	:deep(.el-input),
	:deep(.el-select) {
		height: 40px;
		line-height: 40px;
		max-width: 200px;
		
		:deep(.el-input__wrapper),
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

	:deep(.el-button) {
		border-radius: 8px;
		transition: all 0.3s ease;
		padding: 8px 16px;
		background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
		border: none;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
			background: linear-gradient(135deg, #2f855a 0%, #48bb78 100%);
		}
	}
}

/* 确认购买对话框样式 */
.confirm-buy-dialog {
	.confirm-product-info {
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 1px solid #eee;
		
		h3 {
			color: #2f855a;
			margin-bottom: 10px;
		}
	}
	
	.confirm-buy-details {
		margin-bottom: 20px;
		padding: 15px;
		background: #f7fafc;
		border-radius: 8px;
		font-weight: 500;
	}
	
	.confirm-buy-form {
		margin-top: 20px;
		
		:deep(.el-form-item__label) {
			font-weight: 600;
			color: #2f855a;
		}
	}
}

/* 订单详情弹窗样式 */
.order-detail-dialog {
	.order-basic-info {
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 1px solid #eee;
		
		h3 {
			color: #2f855a;
			margin-bottom: 15px;
			font-size: 18px;
			font-weight: 600;
		}
	}
	
	.order-info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 15px;
		margin-bottom: 20px;
	}
	
	.order-info-item {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.order-info-item.full-width {
		grid-column: 1 / -1;
	}
	
	.order-info-item .label {
		font-weight: 600;
		color: #2f855a;
		min-width: 80px;
	}
	
	.order-info-item .value {
		color: #333;
		flex: 1;
		word-break: break-word;
	}
	
	.order-items-info {
		margin-bottom: 20px;
		padding-bottom: 15px;
		border-bottom: 1px solid #eee;
		
		h3 {
			color: #2f855a;
			margin-bottom: 15px;
			font-size: 18px;
			font-weight: 600;
		}
	}
	
	.order-total {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 15px;
		font-size: 16px;
		font-weight: 600;
		
		.total-info {
			display: flex;
			align-items: center;
			gap: 10px;
		}
		
		.total-info .label {
			color: #666;
		}
		
		.total-info .value {
			color: #e53e3e;
			font-size: 20px;
		}
	}
	
	:deep(.el-table) {
		:deep(.el-table__header-wrapper) {
			.el-table__header {
				th {
					background: linear-gradient(135deg, #48bb78 0%, #2f855a 100%);
					color: white;
					font-weight: 600;
				}
			}
		}
	}
}

.mb15 {
	margin-bottom: 20px;
}

.ml10 {
	margin-left: 15px;
}

.mt20 {
	margin-top: 20px;
}
</style>