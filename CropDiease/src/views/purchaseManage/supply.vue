<template>
  <div class="supply-container">
    <!-- 页面标题和统计卡片 -->
    <div class="page-header">
      <h2>供应管理中心</h2>
      <div class="header-actions">
        <el-button type="primary" size="large" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          发布商品
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-blue">
              <el-icon><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalProducts }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-green">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.onSaleProducts }}</div>
              <div class="stat-label">在售商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-red">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.lowStockProducts }}</div>
              <div class="stat-label">库存不足</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-orange">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalOrders }}</div>
              <div class="stat-label">累计订单</div>
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

    <!-- 商品管理 -->
    <el-card class="product-card-section">
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <div class="header-filters">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索商品名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filterStatus" placeholder="商品状态" clearable style="width: 120px">
              <el-option label="全部" value="" />
              <el-option label="上架中" :value="true" />
              <el-option label="已下架" :value="false" />
            </el-select>
            <el-button type="primary" @click="handleSearch">查询</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="productList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column type="index" width="50" align="center" />
        <el-table-column label="商品信息" min-width="300">
          <template #default="{ row }">
            <div class="product-info-cell">
              <el-image
                :src="row.mainImage || '/images/default-product.jpg'"
                class="product-thumb"
                fit="cover"
              />
              <div class="product-detail">
                <div class="product-name">{{ row.productName }}</div>
                <div class="product-subtitle" v-if="row.subTitle">{{ row.subTitle }}</div>
                <div class="product-tags">
                  <el-tag v-if="row.isNew" size="small" type="success">新品</el-tag>
                  <el-tag v-if="row.isHot" size="small" type="danger">热销</el-tag>
                  <el-tag v-if="row.isRecommend" size="small" type="warning">推荐</el-tag>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="150" align="center">
          <template #default="{ row }">
            <div class="price-cell">
              <div class="current-price">¥{{ formatPrice(row.price) }}</div>
              <div class="original-price" v-if="row.originalPrice">
                ¥{{ formatPrice(row.originalPrice) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="120" align="center">
          <template #default="{ row }">
            <div :class="['stock-cell', { 'stock-warning': row.stock < 10 }]">
              {{ row.stock }}{{ row.unit || '件' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="销量" width="100" align="center">
          <template #default="{ row }">
            {{ row.salesCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isOnSale"
              :active-text="'上架'"
              :inactive-text="'下架'"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="primary" link @click="handleView(row)">
              <el-icon><View /></el-icon>查看
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 订单管理 -->
    <el-card class="order-card-section">
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
          <el-radio-group v-model="orderStatus" @change="loadOrders">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button label="pending">待支付</el-radio-button>
            <el-radio-button label="paid">待发货</el-radio-button>
            <el-radio-button label="shipped">待收货</el-radio-button>
            <el-radio-button label="completed">已完成</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table
        :data="orderList"
        v-loading="orderLoading"
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
        <el-table-column label="操作" width="150" align="center" fixed="right">
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
          v-model:current-page="orderPageNum"
          v-model:page-size="orderPageSize"
          :page-sizes="[10, 20, 50]"
          :total="orderTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleOrderSizeChange"
          @current-change="handleOrderPageChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '发布商品'"
      width="800px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="product-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="productName">
              <el-input v-model="formData.productName" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副标题" prop="subTitle">
              <el-input v-model="formData.subTitle" placeholder="请输入副标题" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品分类" prop="categoryId">
              <el-cascader
                v-model="formData.categoryId"
                :options="categoryOptions"
                :props="{ value: 'id', label: 'name', children: 'children' }"
                placeholder="请选择分类"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="formData.unit" placeholder="如：件、袋、瓶" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="售价" prop="price">
              <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原价" prop="originalPrice">
              <el-input-number v-model="formData.originalPrice" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="formData.stock" :min="0" :precision="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品图片">
          <el-upload
            action="/api/upload"
            list-type="picture-card"
            :file-list="imageList"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemoveImage"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
          />
        </el-form-item>

        <el-form-item label="商品属性">
          <el-checkbox v-model="formData.isNew">新品</el-checkbox>
          <el-checkbox v-model="formData.isHot">热销</el-checkbox>
          <el-checkbox v-model="formData.isRecommend">推荐</el-checkbox>
        </el-form-item>

        <el-form-item label="上架状态">
          <el-switch
            v-model="formData.isOnSale"
            :active-text="'上架'"
            :inactive-text="'下架'"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus, Goods, CircleCheck, ShoppingCart, Money, Warning,
  Search, Edit, View, Delete
} from '@element-plus/icons-vue';
import { getProductList, addProduct, updateProduct, deleteProduct, toggleProductStatus, getCategories } from '/@/api/purchase';
import { getOrderPage, shipOrder } from '/@/api/order';

const router = useRouter();

// 统计数据
const stats = reactive({
  totalProducts: 0,
  onSaleProducts: 0,
  lowStockProducts: 0,
  totalOrders: 0,
  totalRevenue: 0
});

// 商品列表
const productList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchKeyword = ref('');
const filterStatus = ref('');

// 订单列表
const orderList = ref([]);
const orderLoading = ref(false);
const orderPageNum = ref(1);
const orderPageSize = ref(10);
const orderTotal = ref(0);
const orderStatus = ref('');

// 分类选项
const categoryOptions = ref([]);

// 对话框
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const submitLoading = ref(false);
const imageList = ref([]);

const formData = reactive({
  id: null,
  productName: '',
  subTitle: '',
  categoryId: null,
  price: 0,
  originalPrice: 0,
  stock: 0,
  unit: '件',
  description: '',
  isNew: false,
  isHot: false,
  isRecommend: false,
  isOnSale: true,
  images: []
});

const formRules = {
  productName: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入售价', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
};

// 发货对话框
const shipDialogVisible = ref(false);
const shipLoading = ref(false);
const currentOrder = ref(null);
const shipForm = reactive({
  logisticsCompany: '',
  trackingNo: ''
});

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

// 加载商品列表
const loadProducts = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      isOnSale: filterStatus.value || undefined
    };
    const res = await getProductList(params);
    if (res.code === 200) {
      productList.value = res.data.records;
      total.value = res.data.total;
      // 从返回的所有商品记录中计算统计数据
      const allProducts = res.data.records || [];
      stats.totalProducts = res.data.total;
      stats.onSaleProducts = allProducts.filter(p => p.isOnSale).length;
      stats.lowStockProducts = allProducts.filter(p => p.stock < 50).length;
    }
  } catch (error) {
    console.error('加载商品列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 加载订单列表
const loadOrders = async () => {
  orderLoading.value = true;
  try {
    const userId = localStorage.getItem('userId');
    const res = await getOrderPage(userId, orderPageNum.value, orderPageSize.value, orderStatus.value);
    if (res.code === 200) {
      orderList.value = res.data.records;
      orderTotal.value = res.data.total;
      stats.totalOrders = res.data.total;
      // 计算总收入
      stats.totalRevenue = orderList.value
        .filter(o => o.status === 'completed' || o.status === 'paid' || o.status === 'shipped')
        .reduce((sum, o) => sum + (o.payAmount || 0), 0);
    }
  } catch (error) {
    console.error('加载订单列表失败:', error);
  } finally {
    orderLoading.value = false;
  }
};

// 加载分类
const loadCategories = async () => {
  try {
    const res = await getCategories();
    if (res.code === 200) {
      categoryOptions.value = res.data;
    }
  } catch (error) {
    console.error('加载分类失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  pageNum.value = 1;
  loadProducts();
};

// 分页
const handleSizeChange = (size) => {
  pageSize.value = size;
  loadProducts();
};

const handlePageChange = (page) => {
  pageNum.value = page;
  loadProducts();
};

// 订单分页
const handleOrderSizeChange = (size) => {
  orderPageSize.value = size;
  loadOrders();
};

const handleOrderPageChange = (page) => {
  orderPageNum.value = page;
  loadOrders();
};

// 显示添加对话框
const showAddDialog = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

// 编辑商品
const handleEdit = (row) => {
  isEdit.value = true;
  Object.assign(formData, row);
  imageList.value = row.images?.map((img, index) => ({
    name: `image-${index}`,
    url: img.imageUrl
  })) || [];
  dialogVisible.value = true;
};

// 查看商品
const handleView = (row) => {
  router.push(`/product/${row.id}`);
};

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteProduct(row.id);
      if (res.code === 200) {
        ElMessage.success('删除成功');
        loadProducts();
      }
    } catch (error) {
      ElMessage.error('删除失败');
    }
  });
};

// 状态变更
const handleStatusChange = async (row, val) => {
  try {
    const res = await toggleProductStatus(row.id, val);
    if (res.code === 200) {
      ElMessage.success(val ? '已上架' : '已下架');
    }
  } catch (error) {
    ElMessage.error('操作失败');
    row.isOnSale = !val;
  }
};

// 上传成功
const handleUploadSuccess = (response, file) => {
  if (response.code === 200) {
    formData.images.push({
      imageUrl: response.data,
      isMain: formData.images.length === 0
    });
  }
};

// 删除图片
const handleRemoveImage = (file, fileList) => {
  const index = formData.images.findIndex(img => img.imageUrl === file.url);
  if (index > -1) {
    formData.images.splice(index, 1);
  }
};

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  submitLoading.value = true;
  try {
    // 处理分类ID（级联选择器返回数组）
    const categoryId = Array.isArray(formData.categoryId)
      ? formData.categoryId[formData.categoryId.length - 1]
      : formData.categoryId;

    const data = {
      ...formData,
      categoryId
    };

    const res = isEdit.value
      ? await updateProduct(formData.id, data)
      : await addProduct(data);

    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功');
      dialogVisible.value = false;
      loadProducts();
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    productName: '',
    subTitle: '',
    categoryId: null,
    price: 0,
    originalPrice: 0,
    stock: 0,
    unit: '件',
    description: '',
    isNew: false,
    isHot: false,
    isRecommend: false,
    isOnSale: true,
    images: []
  });
  imageList.value = [];
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
  router.push(`/order/${row.id}`);
};

// 生命周期
onMounted(() => {
  loadCategories();
  loadProducts();
  loadOrders();
});
</script>

<style scoped lang="scss">
.supply-container {
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

        &.bg-red {
          background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
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

.product-card-section,
.order-card-section {
  margin-bottom: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-filters {
      display: flex;
      gap: 10px;
    }
  }
}

.product-info-cell {
  display: flex;
  gap: 15px;
  align-items: center;

  .product-thumb {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
  }

  .product-detail {
    flex: 1;

    .product-name {
      font-weight: 500;
      color: #303133;
      margin-bottom: 5px;
    }

    .product-subtitle {
      font-size: 12px;
      color: #909399;
      margin-bottom: 8px;
    }

    .product-tags {
      display: flex;
      gap: 5px;
    }
  }
}

.price-cell {
  .current-price {
    color: #f56c6c;
    font-weight: 600;
    font-size: 16px;
  }

  .original-price {
    color: #c0c4cc;
    font-size: 12px;
    text-decoration: line-through;
  }
}

.stock-cell {
  &.stock-warning {
    color: #e6a23c;
    font-weight: 500;
  }
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px dashed #ebeef5;

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
  font-size: 13px;

  .address {
    color: #909399;
    margin-top: 5px;
  }
}

.order-amount {
  color: #f56c6c;
  font-weight: 600;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.product-form {
  .el-upload--picture-card {
    width: 100px;
    height: 100px;
    line-height: 100px;
  }
}

@media (max-width: 768px) {
  .supply-container {
    padding: 10px;
  }

  .page-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start !important;

    .header-filters {
      width: 100%;
      flex-wrap: wrap;
    }
  }
}
</style>
