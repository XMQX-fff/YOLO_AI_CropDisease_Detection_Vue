<template>
  <div class="shop-container">
      <!-- 顶部搜索栏 -->
      <div class="shop-header">
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
        </div>
      </div>

      <!-- 轮播Banner -->
      <div class="banner-section">
        <el-carousel height="280px" indicator-position="outside">
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
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in productList" :key="product.id">
            <ProductCard :product="product" @add-cart="handleAddCart" @favorite="handleFavorite" />
          </el-col>
        </el-row>
        
        <!-- 空状态 -->
        <el-empty v-if="productList.length === 0 && !loading" description="暂无商品" />
        
        <!-- 加载更多 -->
        <div class="load-more" v-if="productList.length > 0">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, Grid, StarFilled, TrendCharts, Goods } from '@element-plus/icons-vue';
import ProductCard from './components/ProductCard.vue';
import { getProductList, getCategories, getRecommendProducts, getHotProducts } from '/@/api/purchase';
import { addToCart } from '/@/api/cart';
import { addFavorite } from '/@/api/favorite';

const router = useRouter();

// 搜索关键词
const searchKeyword = ref('');

// 分类列表
const categoryList = ref([]);
const selectedCategory = ref(null);

// 商品列表
const productList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(12);
const total = ref(0);

// 排序
const currentSort = ref('default');
const sortOptions = [
  { label: '综合', value: 'default' },
  { label: '销量', value: 'sales' },
  { label: '价格', value: 'price' },
  { label: '新品', value: 'new' },
];

// 推荐商品
const recommendProducts = ref([]);

// 热销商品
const hotProducts = ref([]);

// 轮播图
const banners = ref([
  {
    title: '优质农资精选',
    subtitle: '精选优质种子、化肥、农药，助力丰收',
    image: 'https://haowallpaper.com/link/common/file/previewFileImg/2f8118b413aa11611bdb77553c8a5f952f8118b413aa11611bdb77553c8a5f95',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    link: '/shop'
  },
  {
    title: '春季播种季',
    subtitle: '新品种子上市，限时优惠中',
    image: 'https://haowallpaper.com/link/common/file/previewFileImg/18375393205013888',
    bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    link: '/shop'
  },
  {
    title: '智能农业设备',
    subtitle: '现代化农业设备，提高生产效率',
    image: 'https://haowallpaper.com/link/common/file/previewFileImg/18352668147764608',
    bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    link: '/shop'
  }
]);

// 计算属性：当前选中的分类名称
const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return '';
  const category = categoryList.value.find(c => c.id === selectedCategory.value);
  return category ? category.name : '';
});

// 加载分类列表
const loadCategories = async () => {
  try {
    const res = await getCategories();
    if (res.code === 200) {
      categoryList.value = res.data || [];
    }
  } catch (error) {
    console.error('加载分类失败:', error);
  }
};

// 加载商品列表
const loadProducts = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value,
      sort: currentSort.value,
    };
    
    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value;
    }
    
    const res = await getProductList(params);
    if (res.code === 200) {
      const data = res.data;
      productList.value = data.records || data.list || [];
      total.value = data.total || 0;
    }
  } catch (error) {
    console.error('加载商品失败:', error);
    ElMessage.error('加载商品失败');
  } finally {
    loading.value = false;
  }
};

// 加载推荐商品
const loadRecommendProducts = async () => {
  try {
    const res = await getRecommendProducts({ pageSize: 4 });
    if (res.code === 200) {
      recommendProducts.value = res.data || [];
    }
  } catch (error) {
    console.error('加载推荐商品失败:', error);
  }
};

// 加载热销商品
const loadHotProducts = async () => {
  try {
    const res = await getHotProducts({ pageSize: 4 });
    if (res.code === 200) {
      hotProducts.value = res.data || [];
    }
  } catch (error) {
    console.error('加载热销商品失败:', error);
  }
};

// 搜索
const handleSearch = () => {
  pageNum.value = 1;
  loadProducts();
};

// 选择分类
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId;
  pageNum.value = 1;
  loadProducts();
};

// 排序
const handleSort = (sortValue) => {
  currentSort.value = sortValue;
  pageNum.value = 1;
  loadProducts();
};

// 分页
const handlePageChange = (page) => {
  pageNum.value = page;
  loadProducts();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  pageNum.value = 1;
  loadProducts();
};

// 加入购物车
const handleAddCart = async (product) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const res = await addToCart({
      userId: userInfo.id,
      productId: product.id,
      quantity: 1
    });
    if (res.code === 200) {
      ElMessage.success('已加入购物车');
    } else {
      ElMessage.error(res.message || '加入购物车失败');
    }
  } catch (error) {
    console.error('加入购物车失败:', error);
    ElMessage.error('加入购物车失败');
  }
};

// 收藏
const handleFavorite = async (product) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const res = await addFavorite(userInfo.id, product.id);
    if (res.code === 200) {
      ElMessage.success('收藏成功');
    } else {
      ElMessage.error(res.message || '收藏失败');
    }
  } catch (error) {
    console.error('收藏失败:', error);
    ElMessage.error('收藏失败');
  }
};

// Banner点击
const handleBannerClick = (banner) => {
  if (banner.link) {
    router.push(banner.link);
  }
};

// 查看更多
const viewMore = (type) => {
  if (type === 'recommend') {
    currentSort.value = 'recommend';
  } else if (type === 'hot') {
    currentSort.value = 'hot';
  }
  loadProducts();
};

onMounted(() => {
  loadCategories();
  loadProducts();
  loadRecommendProducts();
  loadHotProducts();
});
</script>

<style scoped lang="scss">
.shop-container {
  max-width: 1400px;
  margin: 0 auto;
}

.shop-header {
  margin-bottom: 20px;

  .search-bar {
    display: flex;
    gap: 15px;
    align-items: center;

    .search-input {
      flex: 1;
      max-width: 600px;
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
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
      background: #f5f7fa;
      border: 1px solid transparent;

      &:hover {
        background: #ecf5ff;
        border-color: #409eff;
        color: #409eff;
      }

      &.active {
        background: #409eff;
        color: #fff;
        border-color: #409eff;
      }

      .category-icon {
        width: 24px;
        height: 24px;
        object-fit: cover;
        border-radius: 4px;
      }

      span {
        font-size: 14px;
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
    margin-bottom: 20px;

    h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0;

      .el-icon {
        color: #409eff;
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

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

// 响应式设计
@media (max-width: 768px) {
  .banner-section {
    .banner-item {
      padding: 20px;
      flex-direction: column;
      text-align: center;

      .banner-content {
        max-width: 100%;
        margin-bottom: 20px;

        h2 {
          font-size: 24px;
        }

        p {
          font-size: 14px;
        }
      }

      .banner-image-wrapper {
        width: 100%;
        height: 50%;
      }
    }
  }

  .category-section {
    .category-list {
      gap: 10px;

      .category-item {
        padding: 8px 15px;
        font-size: 13px;
      }
    }
  }
}
</style>
