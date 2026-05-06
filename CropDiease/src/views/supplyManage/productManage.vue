<template>
  <div class="product-manage-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>商品管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon>
          发布商品
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-blue">
              <el-icon><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalCount }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-green">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.onSaleCount }}</div>
              <div class="stat-label">在售商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-gray">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.offSaleCount }}</div>
              <div class="stat-label">下架商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-red">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.outOfStockCount }}</div>
              <div class="stat-label">缺货商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-orange">
              <el-icon><Bell /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.lowStockCount }}</div>
              <div class="stat-label">库存预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="4">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon bg-purple">
              <el-icon><Plus /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todayAddedCount }}</div>
              <div class="stat-label">今日新增</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 商品列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
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
        <el-table-column label="商品信息" min-width="150">
          <template #default="{ row }">
            <div class="product-info-cell">
              <el-image
                :src="row.mainImage || '/images/default-product.jpg'"
                class="product-thumb"
                fit="cover"
                @error="handleImageError"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
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
        <el-table-column label="价格" width="180" align="center">
          <template #default="{ row }">
            <div class="price-cell">
              <div class="current-price">¥{{ formatPrice(row.price) }}</div>
              <div class="original-price" v-if="row.originalPrice">
                ¥{{ formatPrice(row.originalPrice) }}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="库存" width="150" align="center">
          <template #default="{ row }">
            <div :class="['stock-cell', { 'stock-warning': row.stock < 10 }]">
              {{ row.stock }}{{ row.unit || '件' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="销量" width="120" align="center">
          <template #default="{ row }">
            {{ row.salesCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isOnSale"
              :active-text="'上架'"
              :inactive-text="'下架'"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
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

    <!-- 查看商品详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="商品详情"
      width="700px"
      destroy-on-close
    >
      <div class="product-detail-view" v-if="currentProduct">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">商品ID：</span>
              <span class="detail-value">{{ currentProduct.id }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">商品名称：</span>
              <span class="detail-value">{{ currentProduct.productName }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="currentProduct.subTitle">
          <el-col :span="24">
            <div class="detail-item">
              <span class="detail-label">副标题：</span>
              <span class="detail-value">{{ currentProduct.subTitle }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">售价：</span>
              <span class="detail-value price">¥{{ formatPrice(currentProduct.price) }}</span>
            </div>
          </el-col>
          <el-col :span="12" v-if="currentProduct.originalPrice">
            <div class="detail-item">
              <span class="detail-label">原价：</span>
              <span class="detail-value original-price">¥{{ formatPrice(currentProduct.originalPrice) }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">库存：</span>
              <span class="detail-value" :class="{ 'stock-warning': currentProduct.stock < 10 }">
                {{ currentProduct.stock }}{{ currentProduct.unit || '件' }}
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">销量：</span>
              <span class="detail-value">{{ currentProduct.salesCount || 0 }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">单位：</span>
              <span class="detail-value">{{ currentProduct.unit || '件' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">评分：</span>
              <span class="detail-value">
                <el-rate :model-value="currentProduct.rating || 5" disabled show-score />
              </span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">产地：</span>
              <span class="detail-value">{{ currentProduct.region || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">联系电话：</span>
              <span class="detail-value">{{ currentProduct.phone || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">上架状态：</span>
              <span class="detail-value">
                <el-tag :type="currentProduct.isOnSale ? 'success' : 'info'">
                  {{ currentProduct.isOnSale ? '已上架' : '已下架' }}
                </el-tag>
              </span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">商品标签：</span>
              <span class="detail-value">
                <el-tag v-if="currentProduct.isNew" size="small" type="success">新品</el-tag>
                <el-tag v-if="currentProduct.isHot" size="small" type="danger">热销</el-tag>
                <el-tag v-if="currentProduct.isRecommend" size="small" type="warning">推荐</el-tag>
              </span>
            </div>
          </el-col>
        </el-row>
        <div class="detail-item" v-if="currentProduct.description">
          <span class="detail-label">商品描述：</span>
          <div class="detail-value description">{{ currentProduct.description }}</div>
        </div>
        <div class="detail-item" v-if="currentProduct.mainImage || currentProduct.images?.length">
          <span class="detail-label">商品图片：</span>
          <div class="detail-images">
            <el-image
              v-if="currentProduct.mainImage"
              :src="currentProduct.mainImage"
              :preview-src-list="[currentProduct.mainImage]"
              fit="cover"
              class="detail-image"
            />
            <el-image
              v-for="(img, index) in currentProduct.images"
              :key="index"
              :src="img.imageUrl"
              :preview-src-list="currentProduct.images.map(i => i.imageUrl)"
              fit="cover"
              class="detail-image"
            />
          </div>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">创建时间：</span>
              <span class="detail-value">{{ formatDate(currentProduct.createdAt) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="detail-item">
              <span class="detail-label">更新时间：</span>
              <span class="detail-value">{{ formatDate(currentProduct.updatedAt) }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="viewDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEditFromView">编辑</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus, Goods, CircleCheck, CircleClose, Search, Edit, View, Delete, Warning, Bell, Picture
} from '@element-plus/icons-vue';
// 使用供应商专用接口
import {
  getSupplierProductList,
  getSupplierProductDetail,
  addSupplierProduct,
  updateSupplierProduct,
  deleteSupplierProduct,
  toggleSupplierProductStatus,
  getCategories,
  getSupplierProductStatistics
} from '/@/api/purchase';

// 统计数据
const stats = reactive({
  totalCount: 0,
  onSaleCount: 0,
  offSaleCount: 0,
  outOfStockCount: 0,
  lowStockCount: 0,
  todayAddedCount: 0
});

// 商品列表
const productList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);
const searchKeyword = ref('');
const filterStatus = ref('');

// 分类选项
const categoryOptions = ref([]);

// 对话框
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref(null);
const submitLoading = ref(false);
const imageList = ref([]);

// 查看详情对话框
const viewDialogVisible = ref(false);
const currentProduct = ref(null);

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

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

// 加载商品列表（使用供应商接口）
const loadProducts = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      isOnSale: filterStatus.value || undefined
    };
    // 使用供应商专用接口
    const res = await getSupplierProductList(params);
    if (res.code === 200) {
      productList.value = res.data.records;
      total.value = res.data.total;
    }
  } catch (error) {
    console.error('加载商品列表失败:', error);
    ElMessage.error('加载商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 加载统计信息
const loadStatistics = async () => {
  try {
    const res = await getSupplierProductStatistics();
    if (res.code === 200) {
      Object.assign(stats, res.data);
    }
  } catch (error) {
    console.error('加载统计信息失败:', error);
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
const handleView = async (row) => {
  try {
    const res = await getSupplierProductDetail(row.id);
    if (res.code === 200) {
      currentProduct.value = res.data;
      viewDialogVisible.value = true;
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败');
  }
};

// 从查看弹窗点击编辑
const handleEditFromView = () => {
  viewDialogVisible.value = false;
  handleEdit(currentProduct.value);
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN');
};

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      // 使用供应商专用接口
      const res = await deleteSupplierProduct(row.id);
      if (res.code === 200) {
        ElMessage.success('删除成功');
        loadProducts();
      }
    } catch (error) {
      ElMessage.error(error.message || '删除失败');
    }
  });
};

// 状态变更
const handleStatusChange = async (row, val) => {
  try {
    // 使用供应商专用接口
    const res = await toggleSupplierProductStatus(row.id, val);
    if (res.code === 200) {
      ElMessage.success(val ? '已上架' : '已下架');
    }
  } catch (error) {
    ElMessage.error(error.message || '操作失败');
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
    const categoryId = Array.isArray(formData.categoryId)
      ? formData.categoryId[formData.categoryId.length - 1]
      : formData.categoryId;

    const data = {
      ...formData,
      categoryId
    };

    // 使用供应商专用接口
    const res = isEdit.value
      ? await updateSupplierProduct(formData.id, data)
      : await addSupplierProduct(data);

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

// 图片加载失败处理
const handleImageError = (e) => {
  console.error('图片加载失败:', e);
};

// 生命周期
onMounted(() => {
  loadCategories();
  loadProducts();
  loadStatistics();
});
</script>

<style scoped lang="scss">
.product-manage-container {
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

        &.bg-gray {
          background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%);
        }

        &.bg-red {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
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

.product-info-cell {
  display: flex;
  align-items: center;
  gap: 15px;

  .product-thumb {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    flex-shrink: 0;
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
      margin-bottom: 5px;
    }

    .product-tags {
      display: flex;
      gap: 5px;
    }
  }
}

.price-cell {
  .current-price {
    font-weight: 600;
    color: #f56c6c;
    font-size: 16px;
  }

  .original-price {
    font-size: 12px;
    color: #909399;
    text-decoration: line-through;
  }
}

.stock-cell {
  &.stock-warning {
    color: #f56c6c;
    font-weight: 600;
  }
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.product-form {
  .el-upload--picture-card {
    width: 100px;
    height: 100px;
  }
}

// 商品详情查看样式
.product-detail-view {
  padding: 10px;

  .detail-item {
    margin-bottom: 15px;
    display: flex;
    align-items: flex-start;

    .detail-label {
      color: #606266;
      font-weight: 500;
      min-width: 80px;
      flex-shrink: 0;
    }

    .detail-value {
      color: #303133;
      flex: 1;

      &.price {
        color: #f56c6c;
        font-size: 18px;
        font-weight: 600;
      }

      &.original-price {
        color: #909399;
        text-decoration: line-through;
      }

      &.stock-warning {
        color: #f56c6c;
        font-weight: 600;
      }

      &.description {
        line-height: 1.6;
        padding: 10px;
        background: #f5f7fa;
        border-radius: 4px;
        margin-top: 5px;
      }
    }
  }

  .detail-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;

    .detail-image {
      width: 120px;
      height: 120px;
      border-radius: 4px;
      border: 1px solid #e4e7ed;
      cursor: pointer;
    }
  }

  .image-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #f5f7fa;
    color: #909399;
    font-size: 20px;
  }
}
</style>
