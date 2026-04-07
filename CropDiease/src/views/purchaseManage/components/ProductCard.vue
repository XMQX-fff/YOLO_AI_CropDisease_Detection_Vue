<template>
  <div class="product-card" v-if="product && product.id">
    <div class="product-image-wrapper">
      <el-image
        :src="product.mainImage || '/images/default-product.jpg'"
        :alt="product.productName || '商品图片'"
        fit="cover"
        class="product-image"
        @click="goToDetail"
      />
      <div class="product-tags" v-if="product.isNew || product.isHot">
        <span class="tag tag-new" v-if="product.isNew">新品</span>
        <span class="tag tag-hot" v-if="product.isHot">热销</span>
      </div>
      <div class="product-actions">
        <el-button
          circle
          :type="product.isFavorite ? 'danger' : 'default'"
          size="small"
          @click.stop="handleFavorite"
        >
          <el-icon><Star /></el-icon>
        </el-button>
      </div>
    </div>
    
    <div class="product-info" @click="goToDetail">
      <h4 class="product-name" :title="product.productName">{{ product.productName }}</h4>
      <p class="product-subtitle" v-if="product.subTitle">{{ product.subTitle }}</p>
      
      <div class="product-meta">
        <span class="product-category" v-if="product.categoryName">{{ product.categoryName }}</span>
        <span class="product-sales" v-if="product.salesCount">已售 {{ product.salesCount }}</span>
      </div>
      
      <div class="product-rating" v-if="product.rating">
        <el-rate
          :model-value="product.rating"
          disabled
          show-score
          text-color="#ff9900"
          :max="5"
        />
        <span class="review-count" v-if="product.reviewCount">({{ product.reviewCount }})</span>
      </div>
      
      <div class="product-footer">
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ formatPrice(product.price) }}</span>
          <span class="original-price" v-if="product.originalPrice">
            ¥{{ formatPrice(product.originalPrice) }}
          </span>
        </div>
        <el-button
          type="primary"
          size="small"
          circle
          @click.stop="handleAddCart"
          :disabled="product.stock <= 0"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      
      <div class="product-stock" :class="{ 'stock-low': product.stock < 10 }">
        <el-icon><Warning v-if="product.stock < 10" /><CircleCheck v-else /></el-icon>
        <span>{{ product.stock > 0 ? `库存 ${product.stock}${product.unit || '件'}` : '暂时缺货' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Star, Plus, Warning, CircleCheck } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['add-cart', 'favorite']);

const router = useRouter();

const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

const goToDetail = () => {
  router.push(`/shop/product/${props.product.id}`);
};

const handleAddCart = () => {
  emit('add-cart', props.product);
};

const handleFavorite = () => {
  emit('favorite', props.product);
};
</script>

<style scoped lang="scss">
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  border: 1px solid #ebeef5;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);

    .product-actions {
      opacity: 1;
    }
  }
}

.product-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 100%; // 1:1 正方形
  overflow: hidden;

  .product-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.05);
    }
  }

  .product-tags {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 5px;

    .tag {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;

      &.tag-new {
        background: #67c23a;
        color: #fff;
      }

      &.tag-hot {
        background: #f56c6c;
        color: #fff;
      }
    }
  }

  .product-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    opacity: 0;
    transition: opacity 0.3s;

    .el-button {
      background: rgba(255, 255, 255, 0.9);

      &:hover {
        background: #fff;
      }
    }
  }
}

.product-info {
  padding: 15px;

  .product-name {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    margin: 0 0 8px 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    min-height: 42px;
  }

  .product-subtitle {
    font-size: 13px;
    color: #909399;
    margin: 0 0 10px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .product-meta {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #909399;

    .product-category {
      background: #f4f4f5;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }

  .product-rating {
    display: flex;
    align-items: center;
    gap: 5px;
    margin-bottom: 10px;

    .review-count {
      font-size: 12px;
      color: #909399;
    }
  }

  .product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .product-price {
      display: flex;
      align-items: baseline;
      gap: 5px;

      .price-symbol {
        font-size: 14px;
        color: #f56c6c;
        font-weight: 500;
      }

      .price-value {
        font-size: 20px;
        color: #f56c6c;
        font-weight: 600;
      }

      .original-price {
        font-size: 13px;
        color: #c0c4cc;
        text-decoration: line-through;
      }
    }

    .el-button {
      &.is-disabled {
        background: #c0c4cc;
        border-color: #c0c4cc;
      }
    }
  }

  .product-stock {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #67c23a;

    &.stock-low {
      color: #e6a23c;
    }

    .el-icon {
      font-size: 14px;
    }
  }
}
</style>
