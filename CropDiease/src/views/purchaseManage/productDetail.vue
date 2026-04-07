<template>
  <div class="product-detail-container" v-if="product">
    <!-- 返回按钮 -->
    <div class="back-nav">
      <el-button link @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
    </div>

    <!-- 商品基本信息 -->
    <el-card class="product-main">
      <el-row :gutter="40">
        <!-- 左侧图片 -->
        <el-col :xs="24" :md="12">
          <div class="product-gallery">
            <el-image
              :src="currentImage || product.mainImage || '/images/default-product.jpg'"
              :preview-src-list="imageList"
              fit="cover"
              class="main-image"
            />
            <div class="thumbnail-list" v-if="imageList.length > 1">
              <img
                v-for="(img, index) in imageList"
                :key="index"
                :src="img"
                :class="['thumbnail', { active: currentImage === img }]"
                @click="currentImage = img"
              />
            </div>
          </div>
        </el-col>

        <!-- 右侧信息 -->
        <el-col :xs="24" :md="12">
          <div class="product-info">
            <h1 class="product-name">{{ product.productName }}</h1>
            <p class="product-subtitle" v-if="product.subTitle">{{ product.subTitle }}</p>

            <div class="product-meta">
              <span class="category-tag" v-if="product.categoryName">{{ product.categoryName }}</span>
              <span class="sales">已售 {{ product.salesCount || 0 }}</span>
            </div>

            <div class="product-price-section">
              <div class="price-row">
                <span class="price-label">售价</span>
                <span class="price-value">¥{{ formatPrice(product.price) }}</span>
                <span class="original-price" v-if="product.originalPrice">
                  ¥{{ formatPrice(product.originalPrice) }}
                </span>
              </div>
            </div>

            <div class="product-props">
              <div class="prop-item">
                <span class="prop-label">库存</span>
                <span class="prop-value" :class="{ 'stock-low': product.stock < 10 }">
                  {{ product.stock }}{{ product.unit || '件' }}
                </span>
              </div>
              <div class="prop-item">
                <span class="prop-label">产地</span>
                <span class="prop-value">{{ product.region || '-' }}</span>
              </div>
              <div class="prop-item">
                <span class="prop-label">供应商</span>
                <span class="prop-value">{{ product.supplierName || '-' }}</span>
              </div>
            </div>

            <div class="product-actions">
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="product.stock"
                :disabled="product.stock <= 0"
              />
              <el-button
                type="primary"
                size="large"
                @click="handleAddCart"
                :disabled="product.stock <= 0"
              >
                <el-icon><ShoppingCart /></el-icon>
                加入购物车
              </el-button>
              <el-button
                :type="product.isFavorite ? 'danger' : 'default'"
                size="large"
                @click="handleFavorite"
              >
                <el-icon><Star /></el-icon>
                {{ product.isFavorite ? '已收藏' : '收藏' }}
              </el-button>
            </div>

            <div class="product-tags" v-if="product.isNew || product.isHot || product.isRecommend">
              <el-tag v-if="product.isNew" type="success">新品</el-tag>
              <el-tag v-if="product.isHot" type="danger">热销</el-tag>
              <el-tag v-if="product.isRecommend" type="warning">推荐</el-tag>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 商品详情 -->
    <el-card class="product-description">
      <template #header>
        <span>商品详情</span>
      </template>
      <div class="description-content" v-if="product.description">
        {{ product.description }}
      </div>
      <el-empty v-else description="暂无商品详情" />
    </el-card>
  </div>

  <!-- 加载状态 -->
  <div v-else class="loading-container">
    <el-skeleton :rows="10" animated />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft, ShoppingCart, Star } from '@element-plus/icons-vue';
import { getProductDetail } from '/@/api/purchase';
import { addToCart } from '/@/api/cart';
import { toggleFavorite } from '/@/api/favorite';

const route = useRoute();
const router = useRouter();

const product = ref(null);
const quantity = ref(1);
const currentImage = ref('');
const imageList = ref([]);

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

// 返回列表
const goBack = () => {
  router.back();
};

// 加载商品详情
const loadProductDetail = async () => {
  const productId = route.params.id;
  if (!productId) {
    ElMessage.error('商品ID不存在');
    return;
  }

  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const res = await getProductDetail(productId, userInfo.id);
    if (res.code === 200) {
      product.value = res.data;
      // 构建图片列表
      const images = [];
      if (res.data.mainImage) {
        images.push(res.data.mainImage);
      }
      if (res.data.images && res.data.images.length > 0) {
        res.data.images.forEach(img => {
          if (img.imageUrl && !images.includes(img.imageUrl)) {
            images.push(img.imageUrl);
          }
        });
      }
      imageList.value = images;
      currentImage.value = images[0] || '';
    } else {
      ElMessage.error(res.message || '获取商品详情失败');
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败');
  }
};

// 加入购物车
const handleAddCart = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const res = await addToCart({
      userId: userInfo.id,
      productId: product.value.id,
      quantity: quantity.value
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

// 收藏/取消收藏
const handleFavorite = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const res = await toggleFavorite(userInfo.id, product.value.id);
    if (res.code === 200) {
      product.value.isFavorite = !product.value.isFavorite;
      ElMessage.success(product.value.isFavorite ? '收藏成功' : '取消收藏');
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    ElMessage.error('操作失败');
  }
};

onMounted(() => {
  loadProductDetail();
});
</script>

<style scoped lang="scss">
.product-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.back-nav {
  margin-bottom: 20px;
}

.product-main {
  margin-bottom: 20px;
}

.product-gallery {
  .main-image {
    width: 100%;
    height: 400px;
    border-radius: 8px;
  }

  .thumbnail-list {
    display: flex;
    gap: 10px;
    margin-top: 15px;

    .thumbnail {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
      }

      &.active {
        border-color: #409eff;
      }
    }
  }
}

.product-info {
  .product-name {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 10px;
  }

  .product-subtitle {
    font-size: 14px;
    color: #909399;
    margin-bottom: 15px;
  }

  .product-meta {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;

    .category-tag {
      padding: 2px 8px;
      background: #ecf5ff;
      color: #409eff;
      border-radius: 4px;
      font-size: 12px;
    }

    .sales {
      color: #909399;
      font-size: 14px;
    }
  }

  .product-price-section {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 10px;

      .price-label {
        color: #606266;
        font-size: 14px;
      }

      .price-value {
        font-size: 32px;
        font-weight: 600;
        color: #f56c6c;
      }

      .original-price {
        font-size: 16px;
        color: #909399;
        text-decoration: line-through;
      }
    }
  }

  .product-props {
    margin-bottom: 20px;

    .prop-item {
      display: flex;
      padding: 10px 0;
      border-bottom: 1px solid #ebeef5;

      .prop-label {
        width: 80px;
        color: #606266;
      }

      .prop-value {
        flex: 1;
        color: #303133;

        &.stock-low {
          color: #f56c6c;
        }
      }
    }
  }

  .product-actions {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;

    .el-input-number {
      width: 120px;
    }
  }

  .product-tags {
    display: flex;
    gap: 10px;
  }
}

.product-description {
  .description-content {
    line-height: 1.8;
    color: #606266;
    white-space: pre-wrap;
  }
}

.loading-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
