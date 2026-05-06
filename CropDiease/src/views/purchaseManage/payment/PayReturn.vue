<template>
  <div class="pay-return-container">
    <el-card class="pay-return-card" v-loading="loading">
      <div class="result-wrapper">
        <!-- 处理中状态 -->
        <template v-if="status === 'processing'">
          <el-icon class="status-icon processing"><Loading /></el-icon>
          <h2 class="status-title">正在处理支付结果...</h2>
          <p class="status-desc">请稍候，正在验证您的支付信息</p>
        </template>

        <!-- 支付成功 -->
        <template v-else-if="status === 'success'">
          <el-icon class="status-icon success"><CircleCheck /></el-icon>
          <h2 class="status-title">支付成功！</h2>
          <div class="order-info" v-if="orderInfo">
            <p><strong>订单编号：</strong>{{ orderInfo.orderNo }}</p>
            <p><strong>支付金额：</strong>¥{{ formatPrice(orderInfo.payAmount) }}</p>
            <p v-if="orderInfo.tradeNo"><strong>交易号：</strong>{{ orderInfo.tradeNo }}</p>
            <p v-if="orderInfo.payTime"><strong>支付时间：</strong>{{ orderInfo.payTime }}</p>
          </div>
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="goToOrderDetail">
              查看订单详情
            </el-button>
            <el-button size="large" @click="goToShop">
              继续购物
            </el-button>
          </div>
        </template>

        <!-- 支付失败 -->
        <template v-else-if="status === 'failed'">
          <el-icon class="status-icon failed"><CircleClose /></el-icon>
          <h2 class="status-title">支付失败</h2>
          <p class="status-desc">{{ errorMessage || '支付过程中出现问题，请稍后重试' }}</p>
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="retryPay">
              重新支付
            </el-button>
            <el-button size="large" @click="goToOrderList">
              查看订单
            </el-button>
          </div>
        </template>

        <!-- 参数错误 -->
        <template v-else-if="status === 'error'">
          <el-icon class="status-icon failed"><Warning /></el-icon>
          <h2 class="status-title">参数错误</h2>
          <p class="status-desc">支付回调参数异常，请联系客服处理</p>
          <div class="action-buttons">
            <el-button type="primary" size="large" @click="goToOrderList">
              查看订单列表
            </el-button>
            <el-button size="large" @click="contactService">
              联系客服
            </el-button>
          </div>
        </template>
      </div>
    </el-card>

    <!-- 支付帮助提示 -->
    <el-card class="help-card" v-if="status === 'success'">
      <template #header>
        <div class="help-header">
          <el-icon><InfoFilled /></el-icon>
          <span>温馨提示</span>
        </div>
      </template>
      <div class="help-content">
        <p>1. 您已成功完成支付，商家将尽快为您发货</p>
        <p>2. 您可以在"我的订单"中查看订单状态和物流信息</p>
        <p>3. 如有任何问题，请联系客服：400-xxx-xxxx</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Loading, CircleCheck, CircleClose, Warning, InfoFilled } from '@element-plus/icons-vue';
import { handleAlipayReturn, verifyPayment } from '/@/api/payment';
import { verifyReturnParams } from '/@/utils/payment';

const router = useRouter();
const route = useRoute();

// 状态
const loading = ref(true);
const status = ref('processing'); // processing, success, failed, error
const errorMessage = ref('');
const orderInfo = ref(null);

// 格式化价格
const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};

/**
 * 处理支付宝回调
 */
const processAlipayReturn = async () => {
  const params = route.query;

  // 检查必要参数
  if (!params.out_trade_no) {
    status.value = 'error';
    loading.value = false;
    return;
  }

  // 验证回调参数
  if (!verifyReturnParams(params)) {
    status.value = 'error';
    loading.value = false;
    return;
  }

  try {
    // 调用后端验证支付结果
    const res = await handleAlipayReturn(params);

    if (res.code === 200) {
      const tradeStatus = params.trade_status;

      if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
        status.value = 'success';
        orderInfo.value = {
          orderNo: params.out_trade_no,
          tradeNo: params.trade_no,
          payAmount: params.total_amount,
          payTime: new Date().toLocaleString(),
          ...res.data
        };

        // 保存支付成功状态到本地
        localStorage.setItem(`pay_success_${params.out_trade_no}`, 'true');
      } else {
        status.value = 'failed';
        errorMessage.value = `支付状态: ${tradeStatus}`;
      }
    } else {
      status.value = 'failed';
      errorMessage.value = res.message || '支付验证失败';
    }
  } catch (error) {
    console.error('处理支付回调失败:', error);
    status.value = 'failed';
    errorMessage.value = '支付结果处理失败，请稍后查看订单状态';
  } finally {
    loading.value = false;
  }
};

/**
 * 跳转到订单详情
 */
const goToOrderDetail = () => {
  if (orderInfo.value?.orderNo) {
    router.push(`/shop/order/detail/${orderInfo.value.orderNo}`);
  } else {
    goToOrderList();
  }
};

/**
 * 跳转到订单列表
 */
const goToOrderList = () => {
  router.push('/shop/order');
};

/**
 * 跳转到商城首页
 */
const goToShop = () => {
  router.push('/shop');
};

/**
 * 重新支付
 */
const retryPay = () => {
  const orderNo = route.query.out_trade_no;
  if (orderNo) {
    router.push(`/shop/order?retry=${orderNo}`);
  } else {
    goToOrderList();
  }
};

/**
 * 联系客服
 */
const contactService = () => {
  ElMessage.info('客服功能即将上线，请拨打客服电话：400-xxx-xxxx');
};

// 页面加载时处理回调
onMounted(() => {
  processAlipayReturn();
});
</script>

<style scoped lang="scss">
.pay-return-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 0 20px;

  .pay-return-card {
    margin-bottom: 20px;

    .result-wrapper {
      text-align: center;
      padding: 40px 20px;

      .status-icon {
        font-size: 80px;
        margin-bottom: 20px;

        &.processing {
          color: #409EFF;
          animation: rotate 1s linear infinite;
        }

        &.success {
          color: #67C23A;
        }

        &.failed {
          color: #F56C6C;
        }
      }

      .status-title {
        font-size: 24px;
        color: #303133;
        margin-bottom: 15px;
      }

      .status-desc {
        font-size: 14px;
        color: #909399;
        margin-bottom: 30px;
      }

      .order-info {
        background: #f5f7fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        text-align: left;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;

        p {
          margin: 10px 0;
          color: #606266;

          strong {
            color: #303133;
            display: inline-block;
            width: 80px;
          }
        }
      }

      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
        flex-wrap: wrap;
      }
    }
  }

  .help-card {
    .help-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: #E6A23C;
    }

    .help-content {
      p {
        margin: 8px 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
