<template>
  <div class="cart-container">
    <div class="cart-header">
      <h2>购物车</h2>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/purchaseManage' }">农资采购</el-breadcrumb-item>
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
        <el-button type="primary" @click="goToShopping">去购物</el-button>
      </el-empty>
    </el-card>

    <!-- 结算对话框 -->
    <el-dialog v-model="checkoutVisible" title="确认订单" width="800px">
      <div class="checkout-content">
        <!-- 收货地址 -->
        <div class="section">
          <h4>收货地址</h4>
          <el-radio-group v-model="selectedAddress">
            <el-radio
              v-for="addr in addressList"
              :key="addr.id"
              :label="addr.id"
              class="address-item"
            >
              <div class="address-info">
                <span class="name">{{ addr.receiverName }}</span>
                <span class="phone">{{ addr.receiverPhone }}</span>
                <span class="default-tag" v-if="addr.isDefault">默认</span>
                <p class="address-text">{{ addr.fullAddress }}</p>
              </div>
            </el-radio>
          </el-radio-group>
          <el-button type="primary" link @click="showAddAddress = true">
            + 添加新地址
          </el-button>
        </div>

        <!-- 商品清单 -->
        <div class="section">
          <h4>商品清单</h4>
          <div class="checkout-items">
            <div v-for="item in selectedItems" :key="item.id" class="checkout-item">
              <el-image :src="item.product?.mainImage" class="item-thumb" fit="cover" />
              <div class="item-detail">
                <div class="name">{{ item.product?.productName }}</div>
                <div class="price-quantity">
                  <span class="price">¥{{ formatPrice(item.product?.price) }}</span>
                  <span class="quantity">x{{ item.quantity }}</span>
                </div>
              </div>
              <div class="item-total">¥{{ formatPrice(item.subtotal) }}</div>
            </div>
          </div>
        </div>

        <!-- 订单备注 -->
        <div class="section">
          <h4>订单备注</h4>
          <el-input
            v-model="orderRemark"
            type="textarea"
            :rows="2"
            placeholder="请输入订单备注（选填）"
          />
        </div>

        <!-- 订单金额 -->
        <div class="section order-summary">
          <div class="summary-row">
            <span>商品总额：</span>
            <span>¥{{ formatPrice(totalPrice) }}</span>
          </div>
          <div class="summary-row">
            <span>运费：</span>
            <span>¥0.00</span>
          </div>
          <div class="summary-row total">
            <span>应付总额：</span>
            <span class="total-amount">¥{{ formatPrice(totalPrice) }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="checkoutVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder" :loading="submitting">
          提交订单
        </el-button>
      </template>
    </el-dialog>

    <!-- 添加地址对话框 -->
    <el-dialog v-model="showAddAddress" title="添加收货地址" width="500px">
      <el-form :model="addressForm" label-width="100px">
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
            :rows="2"
            placeholder="请输入详细地址"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="addressForm.isDefault">设为默认地址</el-checkbox>
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
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Warning, Delete } from '@element-plus/icons-vue';
import { getCartList, updateCartQuantity, removeFromCart, clearCart, toggleSelected, toggleAllSelected } from '/@/api/cart';
import { getAddressList, addAddress } from '/@/api/address';
import { createOrder } from '/@/api/order';

const router = useRouter();

// 获取当前用户ID
const getCurrentUserId = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      return userInfo.id || userInfo.userId;
    } catch (e) {
      console.error('解析用户信息失败:', e);
    }
  }
  return null;
};

const cartList = ref([]);
const addressList = ref([]);
const loading = ref(false);
const checkoutVisible = ref(false);
const showAddAddress = ref(false);
const submitting = ref(false);
const selectedAddress = ref(null);
const orderRemark = ref('');

const addressForm = reactive({
  receiverName: '',
  receiverPhone: '',
  region: [],
  detailAddress: '',
  isDefault: false
});

// 计算属性
const isAllSelected = computed({
  get: () => cartList.value.length > 0 && cartList.value.every(item => item.selected),
  set: (val) => handleSelectAll(val)
});

const selectedItems = computed(() => cartList.value.filter(item => item.selected));
const selectedCount = computed(() => selectedItems.value.length);
const totalPrice = computed(() => {
  return selectedItems.value.reduce((sum, item) => sum + (item.subtotal || 0), 0);
});

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

// 加载购物车
const loadCart = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      ElMessage.warning('请先登录');
      router.push('/login');
      return;
    }
    const res = await getCartList(userId);
    if (res.code === 200) {
      cartList.value = res.data;
    }
  } catch (error) {
    console.error('加载购物车失败:', error);
  }
};

// 加载地址
const loadAddress = async () => {
  try {
    const userId = getCurrentUserId();
    const res = await getAddressList(userId);
    if (res.code === 200) {
      addressList.value = res.data;
      const defaultAddr = addressList.value.find(a => a.isDefault);
      if (defaultAddr) {
        selectedAddress.value = defaultAddr.id;
      }
    }
  } catch (error) {
    console.error('加载地址失败:', error);
  }
};

// 数量变更
const handleQuantityChange = async (item, val) => {
  try {
    const res = await updateCartQuantity(item.id, val);
    if (res.code === 200) {
      item.subtotal = item.product?.price * val;
    }
  } catch (error) {
    ElMessage.error('更新数量失败');
  }
};

// 删除商品
const handleDelete = async (item) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' });
    const res = await removeFromCart(item.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
      loadCart();
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 清空购物车
const handleClearCart = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', { type: 'warning' });
    const userId = getCurrentUserId();
    const res = await clearCart(userId);
    if (res.code === 200) {
      ElMessage.success('清空成功');
      cartList.value = [];
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败');
    }
  }
};

// 删除选中
const handleDeleteSelected = async () => {
  const selectedIds = selectedItems.value.map(item => item.id);
  if (selectedIds.length === 0) {
    ElMessage.warning('请先选择要删除的商品');
    return;
  }
  try {
    await ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', { type: 'warning' });
    // 批量删除API
    ElMessage.success('删除成功');
    loadCart();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 选中变更
const handleItemSelect = async (item) => {
  try {
    await toggleSelected(item.id, item.selected);
  } catch (error) {
    console.error('更新选中状态失败:', error);
  }
};

// 全选
const handleSelectAll = async (val) => {
  try {
    const userId = getCurrentUserId();
    await toggleAllSelected(userId, val);
    cartList.value.forEach(item => item.selected = val);
  } catch (error) {
    console.error('全选失败:', error);
  }
};

// 去结算
const handleCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择商品');
    return;
  }
  loadAddress();
  checkoutVisible.value = true;
};

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址');
    return;
  }

  submitting.value = true;
  try {
    const userId = getCurrentUserId();
    const res = await createOrder(userId, selectedAddress.value, orderRemark.value);
    if (res.code === 200) {
      ElMessage.success('订单提交成功');
      checkoutVisible.value = false;
      loadCart();
      router.push(`/order/${res.data.id}`);
    }
  } catch (error) {
    ElMessage.error(error.message || '提交订单失败');
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
      ...addressForm,
      province: addressForm.region[0],
      city: addressForm.region[1],
      district: addressForm.region[2]
    };
    const res = await addAddress(data);
    if (res.code === 200) {
      ElMessage.success('添加成功');
      showAddAddress.value = false;
      loadAddress();
    }
  } catch (error) {
    ElMessage.error('添加失败');
  }
};

// 跳转
const goToProduct = (productId) => {
  router.push(`/product/${productId}`);
};

const goToShopping = () => {
  router.push('/purchaseManage');
};

onMounted(() => {
  loadCart();
});
</script>

<style scoped lang="scss">
.cart-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-header {
  margin-bottom: 20px;

  h2 {
    margin: 0 0 10px 0;
  }
}

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

    &.item-invalid {
      background: #f5f7fa;
      opacity: 0.7;
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
        font-weight: 500;
        margin-bottom: 5px;
      }

      .item-subtitle {
        font-size: 12px;
        color: #909399;
        margin-bottom: 5px;
      }

      .item-warning {
        color: #e6a23c;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }

    .item-price {
      width: 100px;
      text-align: center;

      .price {
        color: #f56c6c;
        font-weight: 500;
      }
    }

    .item-quantity {
      width: 120px;
    }

    .item-subtotal {
      width: 100px;
      text-align: center;

      .subtotal {
        color: #f56c6c;
        font-weight: 600;
        font-size: 16px;
      }
    }

    .item-action {
      width: 50px;
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
        color: #606266;
      }

      .total-price {
        color: #f56c6c;
        font-size: 24px;
        font-weight: 600;
      }
    }
  }
}

.empty-cart {
  padding: 60px 0;
}

.checkout-content {
  .section {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 15px 0;
      padding-bottom: 10px;
      border-bottom: 1px solid #ebeef5;
    }
  }

  .address-item {
    display: block;
    margin-bottom: 10px;
    padding: 15px;
    border: 1px solid #ebeef5;
    border-radius: 8px;

    &.is-checked {
      border-color: #409eff;
      background: #ecf5ff;
    }

    .address-info {
      .name, .phone {
        font-weight: 500;
        margin-right: 10px;
      }

      .default-tag {
        background: #409eff;
        color: #fff;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
      }

      .address-text {
        margin: 5px 0 0 0;
        color: #606266;
      }
    }
  }

  .checkout-items {
    .checkout-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border-bottom: 1px solid #ebeef5;

      .item-thumb {
        width: 60px;
        height: 60px;
        border-radius: 4px;
      }

      .item-detail {
        flex: 1;

        .name {
          margin-bottom: 5px;
        }

        .price-quantity {
          color: #909399;
          font-size: 14px;
        }
      }

      .item-total {
        color: #f56c6c;
        font-weight: 600;
      }
    }
  }

  .order-summary {
    background: #f5f7fa;
    padding: 20px;
    border-radius: 8px;

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      &.total {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #dcdfe6;
        font-size: 16px;
        font-weight: 500;

        .total-amount {
          color: #f56c6c;
          font-size: 24px;
        }
      }
    }
  }
}
</style>
