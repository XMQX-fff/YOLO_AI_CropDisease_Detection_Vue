<template>
  <div class="shop-cart-container">
      <div class="page-header">
        <h2>购物车</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/shop' }">商城</el-breadcrumb-item>
          <el-breadcrumb-item>购物车</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <el-card v-if="cartList.length > 0" class="cart-content">
        <!-- 全选操作栏 -->
        <div class="cart-toolbar">
          <el-checkbox v-model="isAllSelected" @change="handleSelectAll">全选</el-checkbox>
          <span class="selected-info">已选 {{ selectedCount }} 件商品</span>
          <el-button type="danger" link @click="handleClearCart">清空购物车</el-button>
          <el-button type="danger" link @click="handleDeleteSelected">删除选中</el-button>
        </div>

        <!-- 购物车列表 -->
        <div class="cart-list">
          <div
            v-for="item in cartList"
            :key="item.id"
            class="cart-item"
            :class="{ 'item-invalid': !item.isValid }"
          >
            <el-checkbox v-model="item.selected" @change="handleItemSelect(item)" />
            
            <el-image
              :src="item.product?.mainImage || '/images/default-product.jpg'"
              class="item-image"
              fit="cover"
              @click="goToProduct(item.productId)"
            />
            
            <div class="item-info" @click="goToProduct(item.productId)">
              <div class="item-name">{{ item.product?.productName }}</div>
              <div class="item-subtitle" v-if="item.product?.subTitle">
                {{ item.product?.subTitle }}
              </div>
              <div class="item-warning" v-if="!item.isValid">
                <el-icon><Warning /></el-icon>
                {{ item.invalidReason }}
              </div>
            </div>
            
            <div class="item-price">
              <span class="price">¥{{ formatPrice(item.product?.price) }}</span>
            </div>
            
            <div class="item-quantity">
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="item.product?.stock || 999"
                size="small"
                @change="(val) => handleQuantityChange(item, val)"
              />
            </div>
            
            <div class="item-subtotal">
              <span class="subtotal">¥{{ formatPrice(item.subtotal) }}</span>
            </div>
            
            <div class="item-action">
              <el-button type="danger" link @click="handleDelete(item)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 结算栏 -->
        <div class="cart-footer">
          <div class="footer-left">
            <el-checkbox v-model="isAllSelected" @change="handleSelectAll">全选</el-checkbox>
            <el-button type="danger" link @click="handleDeleteSelected">删除选中</el-button>
          </div>
          <div class="footer-right">
            <div class="total-info">
              <span class="total-label">合计：</span>
              <span class="total-price">¥{{ formatPrice(totalPrice) }}</span>
            </div>
            <el-button
              type="primary"
              size="large"
              :disabled="selectedCount === 0"
              @click="handleCheckout"
            >
              去结算 ({{ selectedCount }})
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 空购物车 -->
      <el-card v-else class="empty-cart">
        <el-empty description="购物车是空的">
          <template #image>
            <el-icon class="empty-icon"><ShoppingCart /></el-icon>
          </template>
          <el-button type="primary" @click="goToShop">去逛逛</el-button>
        </el-empty>
      </el-card>

      <!-- 结算对话框 -->
      <el-dialog
        v-model="checkoutDialogVisible"
        title="确认订单"
        width="600px"
        destroy-on-close
      >
        <div class="checkout-content">
          <h4>订单商品</h4>
          <div class="checkout-items">
            <div v-for="item in selectedItems" :key="item.id" class="checkout-item">
              <el-image :src="item.product?.mainImage" class="checkout-image" fit="cover" />
              <div class="checkout-info">
                <div class="checkout-name">{{ item.product?.productName }}</div>
                <div class="checkout-price">
                  ¥{{ formatPrice(item.product?.price) }} × {{ item.quantity }}
                </div>
              </div>
              <div class="checkout-subtotal">
                ¥{{ formatPrice(item.subtotal) }}
              </div>
            </div>
          </div>

          <el-divider />

          <h4>收货地址</h4>
          <div class="address-list" v-if="addressList.length > 0">
            <el-radio-group v-model="selectedAddressId">
              <el-radio
                v-for="addr in addressList"
                :key="addr.id"
                :label="addr.id"
                class="address-item"
              >
                <div class="address-info">
                  <span class="name">{{ addr.receiverName }}</span>
                  <span class="phone">{{ addr.receiverPhone }}</span>
                  <p class="detail">{{ addr.province }}{{ addr.city }}{{ addr.district }}{{ addr.detailAddress }}</p>
                </div>
              </el-radio>
            </el-radio-group>
          </div>
          <el-empty v-else description="暂无收货地址" :image-size="60">
            <el-button type="primary" link @click="showAddAddress = true">添加地址</el-button>
          </el-empty>

          <el-divider />

          <div class="checkout-summary">
            <div class="summary-row">
              <span>商品总价</span>
              <span>¥{{ formatPrice(totalPrice) }}</span>
            </div>
            <div class="summary-row">
              <span>运费</span>
              <span>¥0.00</span>
            </div>
            <div class="summary-row total">
              <span>应付总额</span>
              <span class="total-amount">¥{{ formatPrice(totalPrice) }}</span>
            </div>
          </div>
        </div>

        <template #footer>
          <el-button @click="checkoutDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :disabled="!selectedAddressId || submitting"
            :loading="submitting"
            @click="submitOrder"
          >
            提交订单
          </el-button>
        </template>
      </el-dialog>

      <!-- 添加地址对话框 -->
      <el-dialog
        v-model="showAddAddress"
        title="添加收货地址"
        width="500px"
        destroy-on-close
      >
        <el-form :model="addressForm" label-width="80px">
          <el-form-item label="收货人">
            <el-input v-model="addressForm.receiverName" placeholder="请输入收货人姓名" />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="addressForm.receiverPhone" placeholder="请输入手机号" />
          </el-form-item>
          <el-form-item label="所在地区">
            <el-cascader
              v-model="addressForm.region"
              :options="regionOptions"
              placeholder="请选择省/市/区"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="详细地址">
            <el-input
              v-model="addressForm.detailAddress"
              type="textarea"
              rows="3"
              placeholder="请输入详细地址"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showAddAddress = false">取消</el-button>
          <el-button type="primary" @click="saveAddress">保存</el-button>
        </template>
      </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Warning, Delete, ShoppingCart } from '@element-plus/icons-vue';
import { getCartList, updateCartQuantity, removeFromCart, clearCart, toggleSelected, toggleAllSelected } from '/@/api/cart';
import { getAddressList, addAddress } from '/@/api/address';
import { createOrder } from '/@/api/order';

const router = useRouter();

// 购物车列表
const cartList = ref([]);
const loading = ref(false);

// 地址列表
const addressList = ref([]);
const selectedAddressId = ref(null);

// 结算对话框
const checkoutDialogVisible = ref(false);
const submitting = ref(false);

// 添加地址
const showAddAddress = ref(false);
const addressForm = ref({
  receiverName: '',
  receiverPhone: '',
  region: [],
  detailAddress: ''
});

// 地区选项（简化版）
const regionOptions = [
  {
    value: '广东省',
    label: '广东省',
    children: [
      {
        value: '广州市',
        label: '广州市',
        children: [
          { value: '天河区', label: '天河区' },
          { value: '海珠区', label: '海珠区' },
        ]
      },
      {
        value: '深圳市',
        label: '深圳市',
        children: [
          { value: '南山区', label: '南山区' },
          { value: '福田区', label: '福田区' },
        ]
      }
    ]
  }
];

// 计算属性：是否全选
const isAllSelected = computed({
  get() {
    return cartList.value.length > 0 && cartList.value.every(item => item.selected);
  },
  set(val) {
    handleSelectAll(val);
  }
});

// 计算属性：选中的商品
const selectedItems = computed(() => {
  return cartList.value.filter(item => item.selected);
});

// 计算属性：选中数量
const selectedCount = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + item.quantity, 0);
});

// 计算属性：总价
const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + (item.subtotal || 0), 0);
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

// 加载购物车
const loadCart = async () => {
  loading.value = true;
  try {
    const userId = getCurrentUserId();
    const res = await getCartList(userId);
    if (res.code === 200) {
      cartList.value = (res.data || []).map(item => ({
        ...item,
        selected: false,
        subtotal: (item.product?.price || 0) * item.quantity
      }));
    }
  } catch (error) {
    console.error('加载购物车失败:', error);
    ElMessage.error('加载购物车失败');
  } finally {
    loading.value = false;
  }
};

// 加载地址列表
const loadAddresses = async () => {
  try {
    const userId = getCurrentUserId();
    const res = await getAddressList(userId);
    if (res.code === 200) {
      addressList.value = res.data || [];
      // 设置默认地址
      const defaultAddr = addressList.value.find(addr => addr.isDefault);
      if (defaultAddr) {
        selectedAddressId.value = defaultAddr.id;
      } else if (addressList.value.length > 0) {
        selectedAddressId.value = addressList.value[0].id;
      }
    }
  } catch (error) {
    console.error('加载地址失败:', error);
  }
};

// 全选/取消全选
const handleSelectAll = async (val) => {
  try {
    const userId = getCurrentUserId();
    await toggleAllSelected(userId, val);
    cartList.value.forEach(item => {
      item.selected = val;
    });
  } catch (error) {
    console.error('全选操作失败:', error);
  }
};

// 选择单个商品
const handleItemSelect = async (item) => {
  try {
    await toggleSelected(item.id, item.selected);
  } catch (error) {
    console.error('选择操作失败:', error);
  }
};

// 修改数量
const handleQuantityChange = async (item, val) => {
  try {
    const res = await updateCartQuantity(item.id, val);
    if (res.code === 200) {
      item.subtotal = (item.product?.price || 0) * val;
      ElMessage.success('数量已更新');
    } else {
      ElMessage.error(res.message || '更新失败');
    }
  } catch (error) {
    console.error('更新数量失败:', error);
    ElMessage.error('更新数量失败');
  }
};

// 删除商品
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const res = await removeFromCart(item.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      loadCart();
    } else {
      ElMessage.error(res.message || '删除失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 删除选中
const handleDeleteSelected = async () => {
  const selectedIds = selectedItems.value.map(item => item.id);
  if (selectedIds.length === 0) {
    ElMessage.warning('请先选择商品');
    return;
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.length} 个商品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    // 逐个删除
    for (const id of selectedIds) {
      await removeFromCart(id);
    }
    
    ElMessage.success('删除成功');
    loadCart();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 清空购物车
const handleClearCart = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    const userId = getCurrentUserId();
    const res = await clearCart(userId);
    if (res.code === 200) {
      ElMessage.success('购物车已清空');
      loadCart();
    } else {
      ElMessage.error(res.message || '清空失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空失败:', error);
      ElMessage.error('清空失败');
    }
  }
};

// 去结算
const handleCheckout = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择商品');
    return;
  }
  loadAddresses();
  checkoutDialogVisible.value = true;
};

// 提交订单
const submitOrder = async () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址');
    return;
  }

  submitting.value = true;
  try {
    const userId = getCurrentUserId();
    const res = await createOrder(userId, selectedAddressId.value, '', '');
    if (res.code === 200) {
      ElMessage.success('订单提交成功');
      checkoutDialogVisible.value = false;
      loadCart();
      // 跳转到订单页面
      router.push('/shop/order');
    } else {
      ElMessage.error(res.message || '提交订单失败');
    }
  } catch (error) {
    console.error('提交订单失败:', error);
    ElMessage.error('提交订单失败');
  } finally {
    submitting.value = false;
  }
};

// 保存地址
const saveAddress = async () => {
  try {
    const userId = getCurrentUserId();
    const data = {
      userId,
      receiverName: addressForm.value.receiverName,
      receiverPhone: addressForm.value.receiverPhone,
      province: addressForm.value.region[0],
      city: addressForm.value.region[1],
      district: addressForm.value.region[2],
      detailAddress: addressForm.value.detailAddress
    };
    const res = await addAddress(data);
    if (res.code === 200) {
      ElMessage.success('地址添加成功');
      showAddAddress.value = false;
      // 重置表单
      addressForm.value = {
        receiverName: '',
        receiverPhone: '',
        region: [],
        detailAddress: ''
      };
      loadAddresses();
    } else {
      ElMessage.error(res.message || '添加失败');
    }
  } catch (error) {
    console.error('添加地址失败:', error);
    ElMessage.error('添加地址失败');
  }
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
  loadCart();
});
</script>

<style scoped lang="scss">
.shop-cart-container {
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

.cart-content {
  .cart-toolbar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 15px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-bottom: 20px;

    .selected-info {
      flex: 1;
      color: #606266;
    }
  }

  .cart-list {
    .cart-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;
      border-bottom: 1px solid #ebeef5;
      transition: background 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      &.item-invalid {
        opacity: 0.6;
      }

      .item-image {
        width: 100px;
        height: 100px;
        border-radius: 8px;
        cursor: pointer;
      }

      .item-info {
        flex: 1;
        cursor: pointer;

        .item-name {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 8px;
        }

        .item-subtitle {
          font-size: 13px;
          color: #909399;
          margin-bottom: 8px;
        }

        .item-warning {
          font-size: 12px;
          color: #f56c6c;
          display: flex;
          align-items: center;
          gap: 5px;
        }
      }

      .item-price {
        width: 100px;
        text-align: center;

        .price {
          font-size: 16px;
          color: #f56c6c;
          font-weight: 500;
        }
      }

      .item-quantity {
        width: 120px;
        text-align: center;
      }

      .item-subtotal {
        width: 100px;
        text-align: center;

        .subtotal {
          font-size: 16px;
          color: #f56c6c;
          font-weight: 600;
        }
      }

      .item-action {
        width: 60px;
        text-align: center;
      }
    }
  }

  .cart-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;
    margin-top: 20px;

    .footer-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .footer-right {
      display: flex;
      align-items: center;
      gap: 20px;

      .total-info {
        .total-label {
          font-size: 14px;
          color: #606266;
        }

        .total-price {
          font-size: 24px;
          color: #f56c6c;
          font-weight: 600;
        }
      }
    }
  }
}

.empty-cart {
  .empty-icon {
    font-size: 80px;
    color: #dcdfe6;
  }
}

.checkout-content {
  h4 {
    margin: 0 0 15px;
    font-size: 16px;
    font-weight: 600;
  }

  .checkout-items {
    max-height: 300px;
    overflow-y: auto;

    .checkout-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px 0;
      border-bottom: 1px solid #ebeef5;

      .checkout-image {
        width: 60px;
        height: 60px;
        border-radius: 4px;
      }

      .checkout-info {
        flex: 1;

        .checkout-name {
          font-size: 14px;
          color: #303133;
          margin-bottom: 5px;
        }

        .checkout-price {
          font-size: 13px;
          color: #909399;
        }
      }

      .checkout-subtotal {
        font-size: 14px;
        color: #f56c6c;
        font-weight: 500;
      }
    }
  }

  .address-list {
    .address-item {
      display: flex;
      align-items: flex-start;
      padding: 15px;
      margin-bottom: 10px;
      border: 1px solid #ebeef5;
      border-radius: 8px;

      :deep(.el-radio__label) {
        padding-left: 10px;
      }

      .address-info {
        .name {
          font-weight: 500;
          margin-right: 10px;
        }

        .phone {
          color: #909399;
        }

        .detail {
          margin: 5px 0 0;
          color: #606266;
          font-size: 13px;
        }
      }
    }
  }

  .checkout-summary {
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      color: #606266;

      &.total {
        border-top: 1px solid #ebeef5;
        margin-top: 10px;
        padding-top: 15px;
        font-size: 16px;
        font-weight: 600;

        .total-amount {
          color: #f56c6c;
          font-size: 20px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .cart-content {
    .cart-list {
      .cart-item {
        flex-wrap: wrap;

        .item-image {
          width: 80px;
          height: 80px;
        }

        .item-info {
          flex: 1;
          min-width: 200px;
        }

        .item-price,
        .item-quantity,
        .item-subtotal,
        .item-action {
          width: auto;
          flex: 1;
        }
      }
    }

    .cart-footer {
      flex-direction: column;
      gap: 15px;

      .footer-left,
      .footer-right {
        width: 100%;
        justify-content: space-between;
      }
    }
  }
}
</style>
