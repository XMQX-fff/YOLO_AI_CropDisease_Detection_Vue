<template>
  <div class="shop-favorite-container">
      <div class="page-header">
        <h2>我的收藏</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/shop' }">商城</el-breadcrumb-item>
          <el-breadcrumb-item>收藏</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 收藏列表 -->
      <div class="favorite-content" v-loading="loading">
        <div class="favorite-toolbar" v-if="favoriteList.length > 0">
          <el-checkbox v-model="isAllSelected" @change="handleSelectAll">全选</el-checkbox>
          <el-button type="danger" link @click="handleBatchRemove" :disabled="selectedCount === 0">
            删除选中 ({{ selectedCount }})
          </el-button>
          <el-button type="primary" link @click="handleBatchAddCart" :disabled="selectedCount === 0">
            加入购物车 ({{ selectedCount }})
          </el-button>
        </div>

        <el-empty v-if="favoriteList.length === 0" description="暂无收藏商品">
          <template #image>
            <el-icon class="empty-icon"><Star /></el-icon>
          </template>
          <el-button type="primary" @click="goToShop">去逛逛</el-button>
        </el-empty>

        <div v-else class="favorite-grid">
          <div
            v-for="item in favoriteList"
            :key="item.id"
            class="favorite-item"
            :class="{ 'item-selected': item.selected }"
          >
            <el-checkbox v-model="item.selected" class="item-checkbox" />
            
            <div class="item-image-wrapper" @click="goToProduct(item.productId)">
              <el-image
                :src="item.product?.mainImage || '/images/default-product.jpg'"
                class="item-image"
                fit="cover"
              />
              <div class="item-tags" v-if="item.product?.isNew || item.product?.isHot">
                <span class="tag tag-new" v-if="item.product?.isNew">新品</span>
                <span class="tag tag-hot" v-if="item.product?.isHot">热销</span>
              </div>
            </div>

            <div class="item-content">
              <div class="item-info" @click="goToProduct(item.productId)">
                <h4 class="item-name">{{ item.product?.productName }}</h4>
                <p class="item-subtitle" v-if="item.product?.subTitle">{{ item.product?.subTitle }}</p>
                <div class="item-meta">
                  <span class="category" v-if="item.product?.categoryName">{{ item.product?.categoryName }}</span>
                  <span class="sales" v-if="item.product?.salesCount">已售 {{ item.product?.salesCount }}</span>
                </div>
              </div>

              <div class="item-footer">
                <div class="item-price">
                  <span class="price-symbol">¥</span>
                  <span class="price-value">{{ formatPrice(item.product?.price) }}</span>
                  <span class="original-price" v-if="item.product?.originalPrice">
                    ¥{{ formatPrice(item.product?.originalPrice) }}
                  </span>
                </div>
                <div class="item-actions">
                  <el-button
                    type="primary"
                    size="small"
                    @click="handleAddCart(item)"
                    :disabled="item.product?.stock <= 0"
                  >
                    <el-icon><ShoppingCart /></el-icon>
                    加购
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    size="small"
                    @click="handleRemove(item)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="total > 0">
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Star, ShoppingCart, Delete } from '@element-plus/icons-vue';
import { getFavoriteList, removeFavorite } from '/@/api/favorite';
import { addToCart } from '/@/api/cart';

const router = useRouter();

// 收藏列表
const favoriteList = ref([]);
const loading = ref(false);
const pageNum = ref(1);
const pageSize = ref(12);
const total = ref(0);

// 计算属性：是否全选
const isAllSelected = computed({
  get() {
    return favoriteList.value.length > 0 && favoriteList.value.every(item => item.selected);
  },
  set(val) {
    favoriteList.value.forEach(item => {
      item.selected = val;
    });
  }
});

// 计算属性：选中的数量
const selectedCount = computed(() => {
  return favoriteList.value.filter(item => item.selected).length;
});

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

// 获取当前用户ID
const getCurrentUserId = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  return userInfo.id;
};

// 加载收藏列表
const loadFavorites = async () => {
  loading.value = true;
  try {
    const userId = getCurrentUserId();
    const res = await getFavoriteList(userId);
    if (res.code === 200) {
      const data = res.data || [];
      favoriteList.value = data.map(item => ({
        ...item,
        selected: false
      }));
      total.value = data.length;
    }
  } catch (error) {
    console.error('加载收藏失败:', error);
    ElMessage.error('加载收藏失败');
  } finally {
    loading.value = false;
  }
};

// 全选/取消全选
const handleSelectAll = (val) => {
  favoriteList.value.forEach(item => {
    item.selected = val;
  });
};

// 加入购物车
const handleAddCart = async (item) => {
  try {
    const userId = getCurrentUserId();
    const res = await addToCart({
      userId,
      productId: item.productId,
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

// 批量加入购物车
const handleBatchAddCart = async () => {
  const selectedItems = favoriteList.value.filter(item => item.selected);
  if (selectedItems.length === 0) {
    ElMessage.warning('请先选择商品');
    return;
  }

  try {
    const userId = getCurrentUserId();
    let successCount = 0;
    
    for (const item of selectedItems) {
      const res = await addToCart({
        userId,
        productId: item.productId,
        quantity: 1
      });
      if (res.code === 200) {
        successCount++;
      }
    }
    
    ElMessage.success(`成功添加 ${successCount} 件商品到购物车`);
  } catch (error) {
    console.error('批量加入购物车失败:', error);
    ElMessage.error('批量加入购物车失败');
  }
};

// 取消收藏
const handleRemove = async (item) => {
  try {
    await ElMessageBox.confirm('确定要取消收藏这个商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const userId = getCurrentUserId();
    const res = await removeFavorite(userId, item.productId);
    if (res.code === 200) {
      ElMessage.success('已取消收藏');
      loadFavorites();
    } else {
      ElMessage.error(res.message || '操作失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

// 批量取消收藏
const handleBatchRemove = async () => {
  const selectedItems = favoriteList.value.filter(item => item.selected);
  if (selectedItems.length === 0) {
    ElMessage.warning('请先选择商品');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要取消收藏选中的 ${selectedItems.length} 个商品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const userId = getCurrentUserId();
    let successCount = 0;
    
    for (const item of selectedItems) {
      const res = await removeFavorite(userId, item.productId);
      if (res.code === 200) {
        successCount++;
      }
    }
    
    ElMessage.success(`成功取消收藏 ${successCount} 个商品`);
    loadFavorites();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量取消收藏失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

// 分页
const handlePageChange = (page) => {
  pageNum.value = page;
  loadFavorites();
};

const handleSizeChange = (size) => {
  pageSize.value = size;
  pageNum.value = 1;
  loadFavorites();
};

// 跳转到商品详情
const goToProduct = (productId) => {
  router.push(`/shop/product/${productId}`);
};

// 跳转到商城
const goToShop = () => {
  router.push('/shop');
};

onMounted(() => {
  loadFavorites();
});
</script>

<style scoped lang="scss">
.shop-favorite-container {
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

.favorite-content {
  .favorite-toolbar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 15px;
    background: #fff;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .empty-icon {
    font-size: 80px;
    color: #dcdfe6;
  }

  .favorite-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;

    .favorite-item {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.3s;
      position: relative;
      border: 2px solid transparent;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      &.item-selected {
        border-color: #409eff;
      }

      .item-checkbox {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10;
      }

      .item-image-wrapper {
        position: relative;
        width: 100%;
        padding-top: 100%;
        cursor: pointer;

        .item-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .item-tags {
          position: absolute;
          top: 10px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;

          .tag {
            padding: 2px 8px;
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
      }

      .item-content {
        padding: 15px;

        .item-info {
          cursor: pointer;
          margin-bottom: 15px;

          .item-name {
            font-size: 15px;
            font-weight: 500;
            color: #303133;
            margin: 0 0 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .item-subtitle {
            font-size: 13px;
            color: #909399;
            margin: 0 0 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .item-meta {
            display: flex;
            gap: 10px;
            font-size: 12px;
            color: #909399;

            .category {
              padding: 2px 6px;
              background: #ecf5ff;
              color: #409eff;
              border-radius: 4px;
            }
          }
        }

        .item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .item-price {
            display: flex;
            align-items: baseline;
            gap: 5px;

            .price-symbol {
              font-size: 12px;
              color: #f56c6c;
            }

            .price-value {
              font-size: 20px;
              font-weight: 600;
              color: #f56c6c;
            }

            .original-price {
              font-size: 12px;
              color: #909399;
              text-decoration: line-through;
            }
          }

          .item-actions {
            display: flex;
            gap: 8px;
          }
        }
      }
    }
  }

  .pagination {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .favorite-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 15px !important;

    .favorite-item {
      .item-content {
        padding: 10px;

        .item-footer {
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .favorite-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
