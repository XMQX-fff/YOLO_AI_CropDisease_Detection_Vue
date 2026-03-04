<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Search, Plus, Edit, Delete, View, Van, Refresh } from '@element-plus/icons-vue';
import { usePurchaseApi } from '/@/api/purchase';
import SupplyDialog from './supplyDialog.vue';
import LogisticsDialog from './logisticsDialog.vue';

// API
const purchaseApi = usePurchaseApi();

// 页面标题
const pageTitle = ref('供应管理');
const pageDesc = ref('管理供应产品和订单发货');

// 当前激活的标签页
const activeTab = ref('product');

// 对话框引用
const supplyDialogRef = ref<InstanceType<typeof SupplyDialog>>();
const logisticsDialogRef = ref<InstanceType<typeof LogisticsDialog>>();

// 订单详情弹窗
const orderDetailDialogVisible = ref(false);
const orderDetail = ref<any>({
  order: null,
  orderItems: [],
});

// 供应产品表格数据
const productState = reactive({
  tableData: {
    data: [] as any[],
    total: 0,
    loading: false,
    param: {
      search: '',
      supplier: '',
      region: '',
      pageNum: 1,
      pageSize: 10,
    },
  },
});

// 订单发货管理数据
const orderState = reactive({
  search: {
    orderNo: '',
    status: '',
  },
  list: [] as any[],
  loading: false,
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 获取供应产品列表
const getProductTableData = async () => {
  productState.tableData.loading = true;
  try {
    const response = await purchaseApi.getProductList({
      search: productState.tableData.param.search,
      supplier: productState.tableData.param.supplier,
      region: productState.tableData.param.region,
      pageNum: productState.tableData.param.pageNum,
      pageSize: productState.tableData.param.pageSize,
    });
    
    if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
      const data = response.data;
      if (data && data.records) {
        productState.tableData.data = data.records.map((item: any, index: number) => ({
          ...item,
          num: (productState.tableData.param.pageNum - 1) * productState.tableData.param.pageSize + index + 1,
        }));
        productState.tableData.total = data.total;
      } else {
        productState.tableData.data = [];
        productState.tableData.total = 0;
      }
    } else {
      ElMessage.error(response.msg || '获取产品列表失败');
      productState.tableData.data = [];
      productState.tableData.total = 0;
    }
  } catch (error) {
    console.error('获取产品列表失败:', error);
    ElMessage.error('获取产品列表失败');
    productState.tableData.data = [];
    productState.tableData.total = 0;
  } finally {
    productState.tableData.loading = false;
  }
};

// 获取订单列表
const getOrderList = async () => {
  orderState.loading = true;
  try {
    const response = await purchaseApi.getOrderList({
      orderNo: orderState.search.orderNo,
      status: orderState.search.status,
      pageNum: orderState.pageNum,
      pageSize: orderState.pageSize,
    });
    
    if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
      const data = response.data;
      if (data && data.records) {
        orderState.list = data.records;
        orderState.total = data.total;
      } else {
        orderState.list = [];
        orderState.total = 0;
      }
    } else {
      ElMessage.error(response.msg || '获取订单列表失败');
      orderState.list = [];
      orderState.total = 0;
    }
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取订单列表失败');
    orderState.list = [];
    orderState.total = 0;
  } finally {
    orderState.loading = false;
  }
};

// 打开新增供应产品弹窗
const onOpenAddSupply = () => {
  supplyDialogRef.value?.openDialog('add');
};

// 打开修改供应产品弹窗
const onOpenEditSupply = (row: any) => {
  supplyDialogRef.value?.openDialog('edit', row);
};

// 删除供应产品
const onRowDel = (row: any) => {
  ElMessageBox.confirm(`此操作将永久删除供应产品「${row.productName}」，是否继续?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const response = await purchaseApi.deleteProduct(row.id);
        if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
          ElMessage.success('删除成功！');
          getProductTableData();
        } else {
          ElMessage.error(response.msg || '删除失败');
        }
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

// 供应产品分页改变
const onProductSizeChange = (val: number) => {
  productState.tableData.param.pageSize = val;
  productState.tableData.param.pageNum = 1;
  getProductTableData();
};

const onProductCurrentChange = (val: number) => {
  productState.tableData.param.pageNum = val;
  getProductTableData();
};

// 订单分页改变
const onOrderSizeChange = (val: number) => {
  orderState.pageSize = val;
  orderState.pageNum = 1;
  getOrderList();
};

const onOrderCurrentChange = (val: number) => {
  orderState.pageNum = val;
  getOrderList();
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
const viewOrderDetails = async (row: any) => {
  try {
    const response = await purchaseApi.getOrderDetail(row.id);
    if (response.code === 0 || response.code === '0' || response.code === 200 || response.code === '200') {
      orderDetail.value = response.data;
      orderDetailDialogVisible.value = true;
    } else {
      ElMessage.error(response.msg || '获取订单详情失败');
    }
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败');
  }
};

// 管理物流信息
const manageLogistics = (row: any) => {
  logisticsDialogRef.value?.openDialog(row);
};

// 刷新数据
const onRefresh = () => {
  if (activeTab.value === 'product') {
    getProductTableData();
  } else {
    getOrderList();
  }
};

// 页面加载时
onMounted(() => {
  getProductTableData();
  getOrderList();
});
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageDesc }}</p>
    </div>

    <div class="content-wrapper">
      <el-tabs v-model="activeTab" type="border-card" class="supply-tabs">
        <!-- 供应产品管理 -->
        <el-tab-pane label="供应产品管理" name="product">
          <div class="tab-content">
            <!-- 搜索区域 -->
            <div class="search-section">
              <el-form :inline="true" :model="productState.tableData.param" class="search-form">
                <el-form-item label="产品名称">
                  <el-input 
                    v-model="productState.tableData.param.search" 
                    placeholder="请输入产品名称" 
                    clearable
                    style="width: 180px"
                  />
                </el-form-item>
                <el-form-item label="供货商">
                  <el-input 
                    v-model="productState.tableData.param.supplier" 
                    placeholder="请输入供货商" 
                    clearable
                    style="width: 180px"
                  />
                </el-form-item>
                <el-form-item label="地区">
                  <el-input 
                    v-model="productState.tableData.param.region" 
                    placeholder="请输入地区" 
                    clearable
                    style="width: 180px"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="getProductTableData()">
                    <el-icon><Search /></el-icon>
                    查询
                  </el-button>
                  <el-button @click="productState.tableData.param = { search: '', supplier: '', region: '', pageNum: 1, pageSize: 10 }; getProductTableData()">
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 操作按钮区域 -->
            <div class="action-section">
              <el-button type="primary" @click="onOpenAddSupply">
                <el-icon><Plus /></el-icon>
                新增供应产品
              </el-button>
              <el-button @click="onRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>

            <!-- 表格区域 -->
            <div class="table-section">
              <el-table 
                :data="productState.tableData.data" 
                v-loading="productState.tableData.loading" 
                border
                stripe
                style="width: 100%"
              >
                <el-table-column prop="num" label="序号" width="70" align="center" />
                <el-table-column prop="productName" label="产品名称" min-width="120" show-overflow-tooltip align="center" />
                <el-table-column prop="price" label="价格(元)" width="100" align="center">
                  <template #default="{ row }">
                    <span style="color: #f56c6c; font-weight: 600;">¥{{ row.price?.toFixed(2) || '0.00' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="stock" label="库存数量" width="100" align="center" />
                <el-table-column prop="supplier" label="供货商" min-width="120" show-overflow-tooltip align="center" />
                <el-table-column prop="region" label="地区" min-width="100" show-overflow-tooltip align="center" />
                <el-table-column prop="phone" label="电话" width="130" align="center" />
                <el-table-column prop="description" label="产品描述" min-width="150" show-overflow-tooltip align="center" />
                <el-table-column label="操作" width="150" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="onOpenEditSupply(row)">
                      <el-icon><Edit /></el-icon>
                      修改
                    </el-button>
                    <el-button link type="danger" size="small" @click="onRowDel(row)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination">
                <el-pagination
                  v-model:current-page="productState.tableData.param.pageNum"
                  v-model:page-size="productState.tableData.param.pageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="productState.tableData.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  background
                  @size-change="onProductSizeChange"
                  @current-change="onProductCurrentChange"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 订单发货管理 -->
        <el-tab-pane label="订单发货管理" name="delivery">
          <div class="tab-content">
            <!-- 搜索区域 -->
            <div class="search-section">
              <el-form :inline="true" :model="orderState.search" class="search-form">
                <el-form-item label="订单号">
                  <el-input 
                    v-model="orderState.search.orderNo" 
                    placeholder="请输入订单号" 
                    clearable
                    style="width: 200px"
                  />
                </el-form-item>
                <el-form-item label="订单状态">
                  <el-select v-model="orderState.search.status" placeholder="请选择订单状态" clearable style="width: 180px">
                    <el-option label="全部状态" value="" />
                    <el-option label="待支付" value="pending" />
                    <el-option label="已支付" value="paid" />
                    <el-option label="已发货" value="shipped" />
                    <el-option label="已完成" value="completed" />
                    <el-option label="已取消" value="cancelled" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="getOrderList()">
                    <el-icon><Search /></el-icon>
                    查询
                  </el-button>
                  <el-button @click="orderState.search = { orderNo: '', status: '' }; getOrderList()">
                    重置
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 操作按钮区域 -->
            <div class="action-section">
              <el-button @click="onRefresh">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>

            <!-- 表格区域 -->
            <div class="table-section">
              <el-table 
                :data="orderState.list" 
                v-loading="orderState.loading" 
                border
                stripe
                style="width: 100%"
              >
                <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip align="center" />
                <el-table-column prop="totalPrice" label="总价(元)" width="120" align="center">
                  <template #default="{ row }">
                    <span style="color: #f56c6c; font-weight: 600;">¥{{ row.totalPrice?.toFixed(2) || '0.00' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="订单状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getOrderStatusTagType(row.status)">
                      {{ getOrderStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="orderTime" label="下单时间" width="180" align="center" />
                <el-table-column prop="logisticsStatus" label="物流信息" min-width="200" show-overflow-tooltip align="center" />
                <el-table-column label="操作" width="200" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button link type="primary" size="small" @click="viewOrderDetails(row)">
                      <el-icon><View /></el-icon>
                      查看详情
                    </el-button>
                    <el-button 
                      v-if="row.status === 'paid'" 
                      link 
                      type="success" 
                      size="small" 
                      @click="manageLogistics(row)"
                    >
                      <el-icon><Van /></el-icon>
                      管理物流
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <div class="pagination">
                <el-pagination
                  v-model:current-page="orderState.pageNum"
                  v-model:page-size="orderState.pageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="orderState.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  background
                  @size-change="onOrderSizeChange"
                  @current-change="onOrderCurrentChange"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 供应产品对话框 -->
    <SupplyDialog ref="supplyDialogRef" @refresh="getProductTableData" />
    
    <!-- 物流管理对话框 -->
    <LogisticsDialog ref="logisticsDialogRef" @refresh="getOrderList" />

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="orderDetailDialogVisible" title="订单详情" width="800px" destroy-on-close>
      <div v-if="orderDetail.order" class="order-detail">
        <!-- 订单基本信息 -->
        <div class="detail-section">
          <h3>订单信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ orderDetail.order.id }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getOrderStatusTagType(orderDetail.order.status)">
                {{ getOrderStatusText(orderDetail.order.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="下单时间">{{ orderDetail.order.orderTime }}</el-descriptions-item>
            <el-descriptions-item label="支付时间">{{ orderDetail.order.paidTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="发货时间">{{ orderDetail.order.shippedTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ orderDetail.order.completedTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ orderDetail.order.phone }}</el-descriptions-item>
            <el-descriptions-item label="收货地址" :span="2">{{ orderDetail.order.address }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ orderDetail.order.remark || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 订单商品列表 -->
        <div class="detail-section">
          <h3>订单商品</h3>
          <el-table :data="orderDetail.orderItems" border size="small">
            <el-table-column prop="productName" label="商品名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="productDescription" label="商品描述" min-width="150" show-overflow-tooltip />
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="price" label="单价(元)" width="100" align="right">
              <template #default="{ row }">
                ¥{{ row.price?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
            <el-table-column label="小计(元)" width="100" align="right">
              <template #default="{ row }">
                ¥{{ (row.price * row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 订单总计 -->
        <div class="order-total">
          <span class="label">商品总计:</span>
          <span class="value">¥{{ orderDetail.order.totalPrice?.toFixed(2) || '0.00' }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="orderDetailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-container {
  padding: 0;
  background-color: #f5f5f5;
  min-height: 100%;
}

.page-header {
  padding: 20px 24px;
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.page-header p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.content-wrapper {
  padding: 0 24px 24px;
}

/* 标签页样式 */
.supply-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.supply-tabs :deep(.el-tabs__content) {
  background-color: #fff;
  padding: 20px;
  border-radius: 0 0 4px 4px;
}

.tab-content {
  background-color: #fff;
}

/* 搜索区域 */
.search-section {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.search-form {
  margin: 0;
}

/* 操作按钮区域 */
.action-section {
  margin-bottom: 20px;
}

/* 表格区域 */
.table-section {
  background-color: #fff;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 订单详情样式 */
.order-detail {
  padding: 10px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-top: 16px;
}

.order-total .label {
  font-size: 14px;
  color: #666;
  margin-right: 8px;
}

.order-total .value {
  font-size: 20px;
  color: #f56c6c;
  font-weight: 600;
}

/* 响应式 */
@media (max-width: 768px) {
  .search-form {
    display: flex;
    flex-direction: column;
  }
  
  .search-form :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .search-form :deep(.el-form-item__content) {
    width: 100%;
  }
  
  .search-form :deep(.el-input),
  .search-form :deep(.el-select) {
    width: 100% !important;
  }
}
</style>
