<template>
  <div class="purchase-container">
    <!-- 顶部搜索和筛选栏 -->
    <div class="header-section">
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索农资商品..."
          class="search-input"
          size="large"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
        <el-badge :value="cartCount" class="cart-badge" v-if="cartCount > 0">
          <el-button size="large" @click="goToCart">
            <el-icon><ShoppingCart /></el-icon>
            购物车
          </el-button>
        </el-badge>
        <el-button v-else size="large" @click="goToCart">
          <el-icon><ShoppingCart /></el-icon>
          购物车
        </el-button>
      </div>
    </div>

    <!-- 轮播Banner -->
    <div class="banner-section">
      <el-carousel height="300px" indicator-position="outside">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <div class="banner-item" :style="{ background: banner.bgColor }">
            <div class="banner-content">
              <h2>{{ banner.title }}</h2>
              <p>{{ banner.subtitle }}</p>
              <el-button type="primary" size="large" @click="handleBannerClick(banner)">
                立即查看
              </el-button>
            </div>
            <div class="banner-image-wrapper">
              <img :src="banner.image" :alt="banner.title" class="banner-image" />
              <div class="banner-image-overlay"></div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 分类选择区域 -->
    <div class="category-section">
      <div class="category-list">
        <div
          class="category-item"
          :class="{ active: selectedCategory === null }"
          @click="selectCategory(null)"
        >
          <el-icon><Grid /></el-icon>
          <span>全部</span>
        </div>
        <div
          v-for="category in categoryList"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          <img v-if="category.icon" :src="category.icon" class="category-icon" />
          <span>{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- 推荐商品区域（仅在未选择分类时显示） -->
    <div class="section recommend-section" v-if="!selectedCategory">
      <div class="section-header">
        <h3>
          <el-icon><StarFilled /></el-icon>
          推荐商品
        </h3>
        <el-link type="primary" @click="viewMore('recommend')">查看更多</el-link>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in recommendProducts" :key="product.id">
          <ProductCard :product="product" @add-cart="handleAddCart" @favorite="handleFavorite" />
        </el-col>
      </el-row>
    </div>

    <!-- 热销商品区域（仅在未选择分类时显示） -->
    <div class="section hot-section" v-if="!selectedCategory">
      <div class="section-header">
        <h3>
          <el-icon><TrendCharts /></el-icon>
          热销商品
        </h3>
        <el-link type="primary" @click="viewMore('hot')">查看更多</el-link>
      </div>
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in hotProducts" :key="product.id">
          <ProductCard :product="product" @add-cart="handleAddCart" @favorite="handleFavorite" />
        </el-col>
      </el-row>
    </div>

    <!-- 商品列表 -->
    <div class="section product-section">
      <div class="section-header">
        <h3>
          <el-icon><Goods /></el-icon>
          {{ selectedCategoryName || '全部商品' }}
        </h3>
        <div class="sort-options">
          <span
            v-for="sort in sortOptions"
            :key="sort.value"
            :class="{ active: currentSort === sort.value }"
            @click="handleSort(sort.value)"
          >
            {{ sort.label }}
          </span>
        </div>
      </div>
      
      <el-empty v-if="productList.length === 0" description="暂无商品" />
      
      <el-row :gutter="20" v-else>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in productList" :key="product.id">
          <ProductCard :product="product" @add-cart="handleAddCart" @favorite="handleFavorite" />
        </el-col>
      </el-row>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[12, 24, 36, 48]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 快速操作浮动按钮 -->
    <el-backtop :visibility-height="100" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, ShoppingCart, Grid, StarFilled, TrendCharts, Goods } from '@element-plus/icons-vue';
import ProductCard from './components/ProductCard.vue';
import { getProductList, getRecommendProducts, getHotProducts, getCategories } from '/@/api/purchase';
import { addToCart, getCartCount } from '/@/api/cart';
import { toggleFavorite } from '/@/api/favorite';

const router = useRouter();

// 搜索和筛选
const searchKeyword = ref('');
const selectedCategory = ref(null);
const currentSort = ref('default');

// 分页
const pageNum = ref(1);
const pageSize = ref(12);
const total = ref(0);

// 数据列表
const productList = ref([]);
const recommendProducts = ref([]);
const hotProducts = ref([]);
const categoryList = ref([]);
const cartCount = ref(0);

// Banner数据
const banners = ref([
  {
    title: '春季农资大促',
    subtitle: '全场农资商品8折起，满500免运费',
    image: 'https://haowallpaper.com/link/common/file/previewFileImg/2f8118b413aa11611bdb77553c8a5f952f8118b413aa11611bdb77553c8a5f95',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    link: '/promotion/spring'
  },
  {
    title: '优质种子精选',
    subtitle: '高产抗病品种，丰收有保障',
    image: 'https://haowallpaper.com/link/common/file/previewFileImg/18375393205013888',
    bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    link: '/category/seeds'
  },
  {
    title: '智能农机设备',
    subtitle: '现代农业必备，提高效率降低成本',
    image: 'https://haowallpaper.com/link/common/file/previewFileImg/18352668147764608',
    bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    link: '/category/machinery'
  }
]);

// 排序选项
const sortOptions = [
  { label: '综合排序', value: 'default' },
  { label: '销量优先', value: 'sales' },
  { label: '价格从低到高', value: 'price_asc' },
  { label: '价格从高到低', value: 'price_desc' },
  { label: '最新上架', value: 'new' }
];

// 计算属性
const selectedCategoryName = computed(() => {
  const category = categoryList.value.find(c => c.id === selectedCategory.value);
  return category ? category.name : '';
});

// 方法
const loadProducts = async () => {
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      categoryId: selectedCategory.value,
      keyword: searchKeyword.value,
      sort: currentSort.value
    };
    const res = await getProductList(params);
    if (res.code === 200) {
      productList.value = res.data.records;
      total.value = res.data.total;
    }
  } catch (error) {
    console.error('加载商品列表失败:', error);
  }
};

const loadRecommendProducts = async () => {
  try {
    const res = await getRecommendProducts(8);
    if (res.code === 200) {
      recommendProducts.value = res.data;
    }
  } catch (error) {
    console.error('加载推荐商品失败:', error);
  }
};

const loadHotProducts = async () => {
  try {
    const res = await getHotProducts(8);
    if (res.code === 200) {
      hotProducts.value = res.data;
    }
  } catch (error) {
    console.error('加载热销商品失败:', error);
  }
};

const loadCategories = async () => {
  try {
    const res = await getCategories();
    if (res.code === 200) {
      categoryList.value = res.data;
    }
  } catch (error) {
    console.error('加载分类失败:', error);
  }
};

const loadCartCount = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const res = await getCartCount(userId);
      if (res.code === 200) {
        cartCount.value = res.data;
      }
    }
  } catch (error) {
    console.error('加载购物车数量失败:', error);
  }
};

const handleSearch = () => {
  pageNum.value = 1;
  loadProducts();
};

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId;
  pageNum.value = 1;
  loadProducts();
};

const handleSort = (sort) => {
  currentSort.value = sort;
  loadProducts();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  loadProducts();
};

const handlePageChange = (page) => {
  pageNum.value = page;
  loadProducts();
};

const handleAddCart = async (product) => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }
    const res = await addToCart(userId, product.id, 1);
    if (res.code === 200) {
      ElMessage.success('已添加到购物车');
      loadCartCount();
    } else {
      ElMessage.error(res.message || '添加失败');
    }
  } catch (error) {
    ElMessage.error(error.message || '添加失败');
  }
};

const handleFavorite = async (product) => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }
    const res = await toggleFavorite(userId, product.id);
    if (res.code === 200) {
      ElMessage.success(product.isFavorite ? '已取消收藏' : '已收藏');
      product.isFavorite = !product.isFavorite;
    }
  } catch (error) {
    ElMessage.error('操作失败');
  }
};

const goToCart = () => {
  router.push('/cart');
};

const viewMore = (type) => {
  if (type === 'recommend') {
    currentSort.value = 'default';
  } else if (type === 'hot') {
    currentSort.value = 'sales';
  }
  loadProducts();
  document.querySelector('.product-section').scrollIntoView({ behavior: 'smooth' });
};

const handleBannerClick = (banner) => {
  router.push(banner.link);
};

// 生命周期
onMounted(() => {
  loadCategories();
  loadRecommendProducts();
  loadHotProducts();
  loadProducts();
  loadCartCount();
});
</script>

<style scoped lang="scss">
.purchase-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

.header-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .search-bar {
    display: flex;
    align-items: center;
    gap: 20px;

    .search-input {
      flex: 1;
      max-width: 600px;
    }

    .cart-badge {
      :deep(.el-badge__content) {
        background-color: #ff4757;
      }
    }
  }
}

// 分类选择区域（轮播图下方）
.category-section {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px 25px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      background: #f8f9fa;
      min-width: 100px;

      .el-icon {
        font-size: 28px;
        margin-bottom: 8px;
        color: #606266;
      }

      .category-icon {
        width: 28px;
        height: 28px;
        margin-bottom: 8px;
        border-radius: 4px;
        object-fit: cover;
      }

      span {
        font-size: 14px;
        color: #606266;
      }

      &:hover {
        background: #ecf5ff;
        transform: translateY(-2px);

        .el-icon,
        span {
          color: #409eff;
        }
      }

      &.active {
        background: #409eff;

        .el-icon,
        span {
          color: #fff;
        }
      }
    }
  }
}

.banner-section {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;

  .banner-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 0 60px;
    height: 100%;
    position: relative;

    .banner-content {
      color: #fff;
      max-width: 33%;
      flex-shrink: 0;
      z-index: 2;

      h2 {
        font-size: 36px;
        margin-bottom: 15px;
        font-weight: 600;
      }

      p {
        font-size: 18px;
        margin-bottom: 25px;
        opacity: 0.9;
      }
    }

    .banner-image-wrapper {
      position: relative;
      width: 66.67%;
      height: 100%;
      overflow: hidden;

      .banner-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .banner-image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 60%;
        height: 100%;
        background: linear-gradient(to right, 
          rgba(255, 255, 255, 0.4) 0%, 
          rgba(255, 255, 255, 0.1) 40%, 
          transparent 100%
        );
        pointer-events: none;
      }
    }
  }
}

.section {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #ebeef5;

    h3 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      color: #303133;
      margin: 0;

      .el-icon {
        color: #409eff;
        font-size: 24px;
      }
    }

    .sort-options {
      display: flex;
      gap: 20px;

      span {
        cursor: pointer;
        color: #606266;
        font-size: 14px;
        transition: color 0.3s;

        &:hover {
          color: #409eff;
        }

        &.active {
          color: #409eff;
          font-weight: 500;
        }
      }
    }
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

@media (max-width: 768px) {
  .purchase-container {
    padding: 10px;
  }

  .header-section .search-bar {
    flex-direction: column;

    .search-input {
      max-width: 100%;
    }
  }

  .category-section .category-list {
    justify-content: center;

    .category-item {
      min-width: 80px;
      padding: 10px 15px;
    }
  }

  .banner-section .banner-item {
    padding: 0 20px;
    flex-direction: column;
    text-align: center;

    .banner-content {
      h2 {
        font-size: 24px;
      }

      p {
        font-size: 14px;
      }
    }

    .banner-image {
      display: none;
    }
  }
}
</style>
