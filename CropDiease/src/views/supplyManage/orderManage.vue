<template>
  <div class="order-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>订单管理</h2>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-blue">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalOrders }}</div>
              <div class="stat-label">全部订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-orange">
              <el-icon><Wallet /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.pendingOrders }}</div>
              <div class="stat-label">待支付</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-green">
              <el-icon><Box /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.paidOrders }}</div>
              <div class="stat-label">待发货</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-purple">
              <el-icon><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">¥{{ formatPrice(stats.totalRevenue) }}</div>
              <div class="stat-label">累计收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订单列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
          <div class="header-filters">
            <el-input
              v-model="searchOrderNo"
              placeholder="搜索订单号"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="orderStatus" placeholder="订单状态" clearable style="width: 120px" @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="待支付" value="pending" />
              <el-option label="待发货" value="paid" />
              <el-option label="待收货" value="shipped" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="orderList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column label="商品信息" min-width="250">
          <template #default="{ row }">
            <div v-for="item in row.orderItems" :key="item.id" class="order-item">
              <span class="item-name">{{ item.productName }}</span>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="收货信息" min-width="200">
          <template #default="{ row }">
            <div class="receiver-info">
              <div>{{ row.receiverName }} {{ row.receiverPhone }}</div>
              <div class="address">{{ row.province }}{{ row.city }}{{ row.district }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="120" align="center">
          <template #default="{ row }">
            <div class="order-amount">¥{{ formatPrice(row.payAmount) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.status)">
              {{ getOrderStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="下单时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.orderTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'paid'"
              type="primary"
              size="small"
              @click="handleShip(row)"
            >
              发货
            </el-button>
            <el-button type="primary" link @click="handleOrderDetail(row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 发货对话框 -->
    <el-dialog v-model="shipDialogVisible" title="订单发货" width="500px">
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="物流公司" prop="logisticsCompany">
          <el-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="申通快递" value="申通快递" />
            <el-option label="韵达速递" value="韵达速递" />
            <el-option label="EMS" value="EMS" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="trackingNo">
          <el-input v-model="shipForm.trackingNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleShipSubmit" :loading="shipLoading">
          确认发货
        </el-button>
      </template>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="订单详情" width="700px">
      <div v-if="currentOrder" class="order-detail">
        <div class="detail-section">
          <h4>订单信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单编号">{{ currentOrder.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getOrderStatusType(currentOrder.status)">
                {{ getOrderStatusText(currentOrder.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ formatDate(currentOrder.orderTime) }}</el-descriptions-item>
            <el-descriptions-item label="支付方式">{{ currentOrder.payMethod || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>商品信息</h4>
          <el-table :data="currentOrder.orderItems" border size="small">
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column label="单价" width="100" align="center">
              <template #default="{ row }">
                ¥{{ formatPrice(row.price) }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="100" align="center">
              <template #default="{ row }">
                ¥{{ formatPrice(row.price * row.quantity) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-section">
          <h4>收货信息</h4>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="收货人">{{ currentOrder.receiverName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentOrder.receiverPhone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址">
              {{ currentOrder.province }}{{ currentOrder.city }}{{ currentOrder.district }}{{ currentOrder.detailAddress }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section" v-if="currentOrder.trackingNo">
          <h4>物流信息</h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物流公司">{{ currentOrder.logisticsCompany }}</el-descriptions-item>
            <el-descriptions-item label="快递单号">{{ currentOrder.trackingNo }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="detail-section">
          <h4>金额明细</h4>
          <div class="amount-detail">
            <div class="amount-item">
              <span>商品总额：</span>
              <span>¥{{ formatPrice(currentOrder.totalPrice) }}</span>
            </div>
            <div class="amount-item">
              <span>运费：</span>
              <span>¥{{ formatPrice(currentOrder.deliveryFee) }}</span>
            </div>
            <div class="amount-item" v-if="currentOrder.discountAmount">
              <span>优惠金额：</span>
              <span>-¥{{ formatPrice(currentOrder.discountAmount) }}</span>
            </div>
            <div class="amount-item total">
              <span>实付金额：</span>
              <span class="total-price">¥{{ formatPrice(currentOrder.payAmount) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  ShoppingCart, Wallet, Box, Money, Search
} from '@element-plus/icons-vue';
import { getOrderPage, shipOrder } from '/@/api/order';

const router = useRouter();

// 统计数据
const stats = reactive({
  totalOrders: 0,
  pendingOrders: 0,
  paidOrders: 0,
  shippedOrders: 0,
  totalRevenue: 0
});

// 订单列表
const orderList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchOrderNo = ref('');
const orderStatus = ref('');

// 发货对话框
const shipDialogVisible = ref(false);
const shipLoading = ref(false);
const currentOrder = ref(null);
const shipForm = reactive({
  logisticsCompany: '',
  trackingNo: ''
});

// 详情对话框
const detailDialogVisible = ref(false);

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('zh-CN');
};

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const types = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'success',
    completed: 'success',
    cancelled: 'info'
  };
  return types[status] || 'info';
};

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const texts = {
    pending: '待支付',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  };
  return texts[status] || status;
};

// 加载订单列表
const loadOrders = async () => {
  loading.value = true;
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
    const userId = userInfo?.id || userInfo?.userId;

    const res = await getOrderPage(userId, pageNum.value, pageSize.value, orderStatus.value);
    if (res.code === 200) {
      orderList.value = res.data.records;
      total.value = res.data.total;

      // 计算统计数据
      stats.totalOrders = res.data.total;
      stats.pendingOrders = orderList.value.filter(o => o.status === 'pending').length;
      stats.paidOrders = orderList.value.filter(o => o.status === 'paid').length;
      stats.shippedOrders = orderList.value.filter(o => o.status === 'shipped').length;
      stats.totalRevenue = orderList.value
        .filter(o => o.status === 'completed' || o.status === 'paid' || o.status === 'shipped')
        .reduce((sum, o) => sum + (o.payAmount || 0), 0);
    }
  } catch (error) {
    console.error('加载订单列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pageNum.value = 1;
  loadOrders();
};

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadOrders();
};

const handlePageChange = (page) => {
  pageNum.value = page;
  loadOrders();
};

// 发货
const handleShip = (row) => {
  currentOrder.value = row;
  shipForm.logisticsCompany = '';
  shipForm.trackingNo = '';
  shipDialogVisible.value = true;
};

// 提交发货
const handleShipSubmit = async () => {
  if (!shipForm.logisticsCompany || !shipForm.trackingNo) {
    ElMessage.warning('请填写完整的物流信息');
    return;
  }

  shipLoading.value = true;
  try {
    const res = await shipOrder(currentOrder.value.id, shipForm.trackingNo, shipForm.logisticsCompany);
    if (res.code === 200) {
      ElMessage.success('发货成功');
      shipDialogVisible.value = false;
      loadOrders();
    }
  } catch (error) {
    ElMessage.error('发货失败');
  } finally {
    shipLoading.value = false;
  }
};

// 订单详情
const handleOrderDetail = (row) => {
  currentOrder.value = row;
  detailDialogVisible.value = true;
};

// 生命周期
onMounted(() => {
  loadOrders();
});
</script>

<style scoped lang="scss">
.order-manage-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 24px;
    color: #303133;
  }
}

.stats-row {
  margin-bottom: 20px;

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;
      gap: 15px;

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: #fff;

        &.bg-blue {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.bg-green {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }

        &.bg-orange {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.bg-purple {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }
      }

      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }

        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-filters {
    display: flex;
    gap: 10px;
  }
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px dashed #eee;

  &:last-child {
    border-bottom: none;
  }

  .item-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-quantity {
    color: #909399;
    margin-left: 10px;
  }
}

.receiver-info {
  .address {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }
}

.order-amount {
  font-weight: 600;
  color: #f56c6c;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-detail {
  .detail-section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #303133;
    }
  }

  .amount-detail {
    padding: 15px;
    background: #f5f7fa;
    border-radius: 4px;

    .amount-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
        padding-top: 10px;
        border-top: 1px solid #dcdfe6;
      }

      &.total {
        font-weight: 600;
        font-size: 16px;

        .total-price {
          color: #f56c6c;
        }
      }
    }
  }
}
</style>
