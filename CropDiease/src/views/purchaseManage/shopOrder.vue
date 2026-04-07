<template>
  <div class="shop-order-container">
      <div class="page-header">
        <h2>我的订单</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/shop' }">商城</el-breadcrumb-item>
          <el-breadcrumb-item>订单</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 订单状态筛选 -->
      <div class="order-tabs">
        <el-tabs v-model="activeStatus" @tab-change="handleTabChange">
          <el-tab-pane
            v-for="tab in statusTabs"
            :key="tab.value"
            :label="tab.label"
            :name="tab.value"
          />
        </el-tabs>
      </div>

      <!-- 订单列表 -->
      <div class="order-list" v-loading="loading">
        <el-empty v-if="orderList.length === 0" description="暂无订单" />
        
        <el-card
          v-for="order in orderList"
          :key="order.id"
          class="order-card"
          shadow="hover"
        >
          <div class="order-header">
            <div class="order-info">
              <span class="order-no">订单号：{{ order.orderNo }}</span>
              <span class="order-time">{{ order.createTime }}</span>
            </div>
            <el-tag :type="getStatusType(order.status)">
              {{ getStatusText(order.status) }}
            </el-tag>
          </div>

          <el-divider />

          <!-- 订单商品 -->
          <div class="order-items">
            <div
              v-for="item in order.orderItems"
              :key="item.id"
              class="order-item"
              @click="goToProduct(item.productId)"
            >
              <el-image
                :src="item.productImage || '/images/default-product.jpg'"
                class="item-image"
                fit="cover"
              />
              <div class="item-info">
                <div class="item-name">{{ item.productName }}</div>
                <div class="item-spec" v-if="item.specifications">
                  {{ item.specifications }}
                </div>
              </div>
              <div class="item-price">
                <div class="price">¥{{ formatPrice(item.price) }}</div>
                <div class="quantity">×{{ item.quantity }}</div>
              </div>
            </div>
          </div>

          <el-divider />

          <!-- 订单底部 -->
          <div class="order-footer">
            <div class="order-total">
              <span class="total-label">共 {{ getTotalQuantity(order) }} 件商品</span>
              <span class="total-amount">
                实付：<strong>¥{{ formatPrice(order.payAmount) }}</strong>
              </span>
            </div>
            <div class="order-actions">
              <el-button
                v-if="order.status === 'pending'"
                type="primary"
                @click="handlePay(order)"
              >
                立即支付
              </el-button>
              <el-button
                v-if="order.status === 'shipped'"
                type="success"
                @click="handleConfirm(order)"
              >
                确认收货
              </el-button>
              <el-button
                v-if="['pending', 'paid'].includes(order.status)"
                type="danger"
                link
                @click="handleCancel(order)"
              >
                取消订单
              </el-button>
              <el-button
                v-if="['completed', 'cancelled'].includes(order.status)"
                type="danger"
                link
                @click="handleDelete(order)"
              >
                删除订单
              </el-button>
              <el-button link @click="viewDetail(order)">查看详情</el-button>
            </div>
          </div>
        </el-card>

        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[5, 10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <!-- 订单详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        title="订单详情"
        width="700px"
        destroy-on-close
      >
        <div class="order-detail" v-if="currentOrder">
          <div class="detail-section">
            <h4>订单信息</h4>
            <div class="detail-row">
              <span class="label">订单编号：</span>
              <span>{{ currentOrder.orderNo }}</span>
            </div>
            <div class="detail-row">
              <span class="label">订单状态：</span>
              <el-tag :type="getStatusType(currentOrder.status)">
                {{ getStatusText(currentOrder.status) }}
              </el-tag>
            </div>
            <div class="detail-row">
              <span class="label">下单时间：</span>
              <span>{{ currentOrder.createTime }}</span>
            </div>
            <div class="detail-row" v-if="currentOrder.payTime">
              <span class="label">支付时间：</span>
              <span>{{ currentOrder.payTime }}</span>
            </div>
            <div class="detail-row" v-if="currentOrder.shipTime">
              <span class="label">发货时间：</span>
              <span>{{ currentOrder.shipTime }}</span>
            </div>
            <div class="detail-row" v-if="currentOrder.receiveTime">
              <span class="label">收货时间：</span>
              <span>{{ currentOrder.receiveTime }}</span>
            </div>
          </div>

          <el-divider />

          <div class="detail-section">
            <h4>收货信息</h4>
            <div class="detail-row">
              <span class="label">收货人：</span>
              <span>{{ currentOrder.receiverName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">联系电话：</span>
              <span>{{ currentOrder.receiverPhone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">收货地址：</span>
              <span>{{ currentOrder.province }}{{ currentOrder.city }}{{ currentOrder.district }}{{ currentOrder.address }}</span>
            </div>
          </div>

          <el-divider />

          <div class="detail-section">
            <h4>商品信息</h4>
            <div class="detail-items">
              <div
                v-for="item in currentOrder.orderItems"
                :key="item.id"
                class="detail-item"
              >
                <el-image
                  :src="item.productImage || '/images/default-product.jpg'"
                  class="detail-image"
                  fit="cover"
                />
                <div class="detail-info">
                  <div class="detail-name">{{ item.productName }}</div>
                  <div class="detail-spec" v-if="item.specifications">
                    {{ item.specifications }}
                  </div>
                </div>
                <div class="detail-price">
                  <div>¥{{ formatPrice(item.price) }}</div>
                  <div class="quantity">×{{ item.quantity }}</div>
                </div>
              </div>
            </div>
          </div>

          <el-divider />

          <div class="detail-section">
            <h4>费用明细</h4>
            <div class="detail-row">
              <span class="label">商品总额：</span>
              <span>¥{{ formatPrice(currentOrder.totalPrice) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">运费：</span>
              <span>¥{{ formatPrice(currentOrder.deliveryFee) }}</span>
            </div>
            <div class="detail-row" v-if="currentOrder.discountAmount > 0">
              <span class="label">优惠金额：</span>
              <span class="discount">-¥{{ formatPrice(currentOrder.discountAmount) }}</span>
            </div>
            <div class="detail-row total">
              <span class="label">实付金额：</span>
              <span class="total-price">¥{{ formatPrice(currentOrder.payAmount) }}</span>
            </div>
          </div>

          <div class="detail-section" v-if="currentOrder.remark">
            <h4>订单备注</h4>
            <p class="remark">{{ currentOrder.remark }}</p>
          </div>
        </div>
      </el-dialog>

      <!-- 支付对话框 -->
      <el-dialog
        v-model="payDialogVisible"
        title="订单支付"
        width="400px"
        destroy-on-close
      >
        <div class="pay-content">
          <div class="pay-amount">
            <span class="label">支付金额</span>
            <span class="amount">¥{{ formatPrice(payOrderData.amount) }}</span>
          </div>
          <div class="pay-methods">
            <h4>选择支付方式</h4>
            <el-radio-group v-model="payMethod">
              <el-radio label="alipay">
                <div class="pay-method-item">
                  <el-icon><Wallet /></el-icon>
                  <span>支付宝</span>
                </div>
              </el-radio>
              <el-radio label="wechat">
                <div class="pay-method-item">
                  <el-icon><ChatDotRound /></el-icon>
                  <span>微信支付</span>
                </div>
              </el-radio>
            </el-radio-group>
          </div>
        </div>
        <template #footer>
          <el-button @click="payDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="paying" @click="submitPay">
            确认支付
          </el-button>
        </template>
      </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Wallet, ChatDotRound } from '@element-plus/icons-vue';
import { getOrderPage, getOrderDetail, cancelOrder, confirmOrder, deleteOrder, payOrder } from '/@/api/order';

const router = useRouter();

// 订单列表
const orderList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 当前状态
const activeStatus = ref('all');

// 状态选项
const statusTabs = [
  { label: '全部订单', value: 'all' },
  { label: '待付款', value: 'pending' },
  { label: '待发货', value: 'paid' },
  { label: '待收货', value: 'shipped' },
  { label: '已完成', value: 'completed' },
  { label: '已取消', value: 'cancelled' },
];

// 订单详情
const detailDialogVisible = ref(false);
const currentOrder = ref(null);

// 支付
const payDialogVisible = ref(false);
const payOrderData = ref({ orderId: null, amount: 0 });
const payMethod = ref('alipay');
const paying = ref(false);

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待付款',
    'paid': '待发货',
    'shipped': '待收货',
    'completed': '已完成',
    'cancelled': '已取消',
    'refunding': '退款中',
    'refunded': '已退款'
  };
  return statusMap[status] || status;
};

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'paid': 'primary',
    'shipped': 'success',
    'completed': 'info',
    'cancelled': 'danger',
    'refunding': 'warning',
    'refunded': 'info'
  };
  return typeMap[status] || '';
};

// 获取总数量
const getTotalQuantity = (order) => {
  return order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
};

// 获取当前用户ID
const getCurrentUserId = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return userInfo.id;
};

// 加载订单列表
const loadOrders = async () => {
  loading.value = true;
  try {
    const userId = getCurrentUserId();
    const status = activeStatus.value === 'all' ? undefined : activeStatus.value;
    const res = await getOrderPage(userId, pageNum.value, pageSize.value, status);
    if (res.code === 200) {
      const data = res.data;
      orderList.value = data.records || data.list || [];
      total.value = data.total || 0;
    }
  } catch (error) {
    console.error('加载订单失败:', error);
    ElMessage.error('加载订单失败');
  } finally {
    loading.value = false;
  }
};

// 切换标签
const handleTabChange = () => {
  pageNum.value = 1;
  loadOrders();
};

// 分页
const handlePageChange = (page) => {
  pageNum.value = page;
  loadOrders();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  pageNum.value = 1;
  loadOrders();
};

// 查看详情
const viewDetail = async (order) => {
  try {
    const res = await getOrderDetail(order.id);
    if (res.code === 200) {
      currentOrder.value = res.data;
      detailDialogVisible.value = true;
    } else {
      ElMessage.error(res.message || '获取订单详情失败');
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败');
  }
};

// 支付订单
const handlePay = (order) => {
  payOrderData.value = { orderId: order.id, amount: order.payAmount };
  payDialogVisible.value = true;
};

// 提交支付
const submitPay = async () => {
  paying.value = true;
  try {
    const res = await payOrder(payOrderData.value.orderId, payMethod.value);
    if (res.code === 200) {
      ElMessage.success('支付成功');
      payDialogVisible.value = false;
      loadOrders();
    } else {
      ElMessage.error(res.message || '支付失败');
    }
  } catch (error) {
    console.error('支付失败:', error);
    ElMessage.error('支付失败');
  } finally {
    paying.value = false;
  }
};

// 确认收货
const handleConfirm = async (order) => {
  try {
    await ElMessageBox.confirm('确认已收到商品？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const res = await confirmOrder(order.id);
    if (res.code === 200) {
      ElMessage.success('确认收货成功');
      loadOrders();
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

// 取消订单
const handleCancel = async (order) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入取消原因（选填）'
    });
    
    const res = await cancelOrder(order.id, value);
    if (res.code === 200) {
      ElMessage.success('订单已取消');
      loadOrders();
    } else {
      ElMessage.error(res.message || '取消失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败:', error);
      ElMessage.error('取消失败');
    }
  }
};

// 删除订单
const handleDelete = async (order) => {
  try {
    await ElMessageBox.confirm('确定要删除这个订单吗？删除后不可恢复', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const res = await deleteOrder(order.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      loadOrders();
    } else {
      ElMessage.error(res.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除订单失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 跳转到商品详情
const goToProduct = (productId) => {
  router.push(`/shop/product/${productId}`);
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped lang="scss">
.shop-order-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;

  h2 {
    margin: 0 0 10px;
    font-size: 24px;
    font-weight: 600;
  }
}

.order-tabs {
  margin-bottom: 20px;
  background: #fff;
  padding: 0 20px;
  border-radius: 8px;
}

.order-list {
  .order-card {
    margin-bottom: 20px;

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .order-info {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .order-no {
          font-weight: 500;
          color: #303133;
        }

        .order-time {
          font-size: 13px;
          color: #909399;
        }
      }
    }

    .order-items {
      .order-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: #f5f7fa;
        }

        .item-image {
          width: 80px;
          height: 80px;
          border-radius: 4px;
        }

        .item-info {
          flex: 1;

          .item-name {
            font-size: 14px;
            color: #303133;
            margin-bottom: 5px;
          }

          .item-spec {
            font-size: 12px;
            color: #909399;
          }
        }

        .item-price {
          text-align: right;

          .price {
            font-size: 14px;
            color: #f56c6c;
          }

          .quantity {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .order-total {
        display: flex;
        align-items: center;
        gap: 15px;

        .total-label {
          color: #909399;
          font-size: 14px;
        }

        .total-amount {
          font-size: 14px;
          color: #303133;

          strong {
            font-size: 18px;
            color: #f56c6c;
          }
        }
      }

      .order-actions {
        display: flex;
        gap: 10px;
      }
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

// 订单详情
.order-detail {
  .detail-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 15px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .detail-row {
      display: flex;
      padding: 8px 0;
      font-size: 14px;

      .label {
        width: 100px;
        color: #909399;
      }

      &.total {
        margin-top: 10px;
        padding-top: 15px;
        border-top: 1px solid #ebeef5;
        font-weight: 600;

        .total-price {
          color: #f56c6c;
          font-size: 20px;
        }
      }

      .discount {
        color: #67c23a;
      }
    }

    .detail-items {
      .detail-item {
        display: flex;
        align-items: center;
        gap: 15px;
        padding: 15px 0;
        border-bottom: 1px solid #ebeef5;

        .detail-image {
          width: 60px;
          height: 60px;
          border-radius: 4px;
        }

        .detail-info {
          flex: 1;

          .detail-name {
            font-size: 14px;
            color: #303133;
            margin-bottom: 5px;
          }

          .detail-spec {
            font-size: 12px;
            color: #909399;
          }
        }

        .detail-price {
          text-align: right;

          .quantity {
            font-size: 12px;
            color: #909399;
            margin-top: 5px;
          }
        }
      }
    }

    .remark {
      padding: 10px;
      background: #f5f7fa;
      border-radius: 4px;
      color: #606266;
      font-size: 14px;
    }
  }
}

// 支付
.pay-content {
  .pay-amount {
    text-align: center;
    padding: 20px 0;
    border-bottom: 1px solid #ebeef5;

    .label {
      display: block;
      color: #909399;
      margin-bottom: 10px;
    }

    .amount {
      font-size: 36px;
      font-weight: 600;
      color: #f56c6c;
    }
  }

  .pay-methods {
    padding: 20px 0;

    h4 {
      margin: 0 0 15px;
      font-size: 14px;
      color: #606266;
    }

    .el-radio {
      display: flex;
      align-items: center;
      margin-bottom: 15px;

      .pay-method-item {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-left: 10px;

        .el-icon {
          font-size: 24px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .order-card {
    .order-footer {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }
  }
}
</style>
