<template>
  <div class="alipay-payment-container">
    <!-- 支付加载状态 -->
    <el-dialog
      v-model="loadingVisible"
      title="正在发起支付"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>正在连接支付宝沙箱环境...</p>
        <p class="tips">请在新打开的窗口中完成支付</p>
      </div>
    </el-dialog>

    <!-- 支付结果对话框 -->
    <el-dialog
      v-model="resultVisible"
      :title="resultTitle"
      width="400px"
      :close-on-click-modal="false"
      @close="handleResultClose"
    >
      <div class="result-content">
        <el-result
          :icon="resultIcon"
          :title="resultTitle"
          :sub-title="resultMessage"
        >
          <template #extra>
            <el-button type="primary" @click="handleResultConfirm">
              {{ resultButtonText }}
            </el-button>
          </template>
        </el-result>
      </div>
    </el-dialog>

    <!-- 支付帮助提示 -->
    <el-dialog
      v-model="helpVisible"
      title="支付宝沙箱支付帮助"
      width="500px"
    >
      <div class="help-content">
        <h4>沙箱环境测试账号</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="买家账号">yjqjmv5373@sandbox.com</el-descriptions-item>
          <el-descriptions-item label="登录密码">111111</el-descriptions-item>
          <el-descriptions-item label="支付密码">111111</el-descriptions-item>
        </el-descriptions>
        <el-alert
          type="info"
          :closable="false"
          style="margin-top: 15px"
        >
          <p>1. 点击支付后会打开支付宝沙箱登录页面</p>
          <p>2. 使用上述测试账号登录</p>
          <p>3. 确认支付金额后完成支付</p>
          <p>4. 支付完成后会自动返回商城</p>
        </el-alert>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Loading, Wallet } from '@element-plus/icons-vue';
import {
  createAlipayPayment,
  queryAlipayStatus,
  handleAlipayReturn,
  verifyPayment
} from '/@/api/payment';
import {
  openAlipayPage,
  watchPaymentWindow,
  queryPaymentStatus,
  verifyReturnParams,
  handlePaymentError,
  getPaymentStatusText,
  PAYMENT_STATUS
} from '/@/utils/payment';
import { ALIPAY_CONFIG, SANDBOX_ACCOUNTS } from '/@/config/alipay.config';

const props = defineProps({
  // 订单信息
  order: {
    type: Object,
    required: true
  },
  // 是否自动打开支付
  autoPay: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['success', 'fail', 'cancel', 'close']);

const router = useRouter();
const route = useRoute();

// 状态
const loadingVisible = ref(false);
const resultVisible = ref(false);
const helpVisible = ref(false);
const payWindow = ref(null);
const paymentTimer = ref(null);
const statusCheckTimer = ref(null);

// 支付结果
const paymentResult = ref({
  status: '',
  message: '',
  data: null
});

// 计算属性
const resultIcon = computed(() => {
  const iconMap = {
    [PAYMENT_STATUS.SUCCESS]: 'success',
    [PAYMENT_STATUS.FAILED]: 'error',
    [PAYMENT_STATUS.CANCELLED]: 'warning',
    [PAYMENT_STATUS.TIMEOUT]: 'warning'
  };
  return iconMap[paymentResult.value.status] || 'info';
});

const resultTitle = computed(() => {
  return getPaymentStatusText(paymentResult.value.status) || '支付结果';
});

const resultMessage = computed(() => {
  return paymentResult.value.message || '';
});

const resultButtonText = computed(() => {
  return paymentResult.value.status === PAYMENT_STATUS.SUCCESS ? '查看订单' : '返回订单';
});

/**
 * 发起支付宝支付
 */
const initiatePayment = async () => {
  if (!props.order || !props.order.orderNo) {
    ElMessage.error('订单信息不完整');
    return;
  }

  loadingVisible.value = true;

  try {
    // 调用后端接口创建支付
    const payData = {
      orderNo: props.order.orderNo,
      amount: props.order.payAmount,
      subject: `订单${props.order.orderNo}`,
      body: `购买商品共${props.order.orderItems?.length || 1}件`,
      returnUrl: `${window.location.origin}/shop/order/pay/return`,
      notifyUrl: ALIPAY_CONFIG.NOTIFY_URL
    };

    const res = await createAlipayPayment(payData);

    if (res.code === 200 && res.data) {
      // 获取支付URL（后端生成）
      const payUrl = res.data.payUrl || res.data;

      // 打开支付窗口
      payWindow.value = openAlipayPage(payUrl);

      if (payWindow.value) {
        // 监听支付窗口
        watchPaymentWindow(payWindow.value, handleWindowClose);

        // 开始轮询支付状态
        startStatusPolling();

        // 显示帮助提示（首次支付）
        const hasShownHelp = localStorage.getItem('alipay_sandbox_help_shown');
        if (!hasShownHelp) {
          setTimeout(() => {
            helpVisible.value = true;
            localStorage.setItem('alipay_sandbox_help_shown', 'true');
          }, 1000);
        }
      }
    } else {
      throw new Error(res.message || '创建支付订单失败');
    }
  } catch (error) {
    console.error('发起支付失败:', error);
    const errorInfo = handlePaymentError(error);
    ElMessage.error(errorInfo.message);
    emit('fail', errorInfo);
  } finally {
    loadingVisible.value = false;
  }
};

/**
 * 处理支付窗口关闭
 */
const handleWindowClose = (result) => {
  // 窗口关闭后查询一次支付状态
  checkPaymentStatus();
};

/**
 * 开始轮询支付状态
 */
const startStatusPolling = () => {
  // 清理之前的定时器
  if (statusCheckTimer.value) {
    clearInterval(statusCheckTimer.value);
  }

  let attempts = 0;
  const maxAttempts = 60; // 最多查询60次（2分钟）

  statusCheckTimer.value = setInterval(async () => {
    attempts++;

    if (attempts > maxAttempts) {
      clearInterval(statusCheckTimer.value);
      showResult(PAYMENT_STATUS.TIMEOUT, '支付状态查询超时，请稍后查看订单状态');
      return;
    }

    // 如果窗口已关闭，增加查询频率
    if (payWindow.value?.closed) {
      await checkPaymentStatus();
    }
  }, 2000);
};

/**
 * 查询支付状态
 */
const checkPaymentStatus = async () => {
  try {
    const res = await queryAlipayStatus(props.order.orderNo);

    if (res.code === 200 && res.data) {
      const status = res.data.status;

      // 支付成功
      if (status === 'paid' || status === 'success' || status === 'TRADE_SUCCESS') {
        clearInterval(statusCheckTimer.value);
        showResult(PAYMENT_STATUS.SUCCESS, '订单支付成功！');
        emit('success', res.data);
        return;
      }

      // 支付失败
      if (status === 'failed' || status === 'error') {
        clearInterval(statusCheckTimer.value);
        showResult(PAYMENT_STATUS.FAILED, res.data.message || '支付失败');
        emit('fail', res.data);
        return;
      }

      // 订单关闭
      if (status === 'closed' || status === 'cancelled') {
        clearInterval(statusCheckTimer.value);
        showResult(PAYMENT_STATUS.CANCELLED, '订单已关闭');
        emit('cancel', res.data);
        return;
      }
    }
  } catch (error) {
    console.error('查询支付状态失败:', error);
  }
};

/**
 * 处理支付宝同步回调
 */
const handleAlipayReturn = async () => {
  const params = route.query;

  if (!params.out_trade_no) {
    return;
  }

  // 验证回调参数
  if (!verifyReturnParams(params)) {
    showResult(PAYMENT_STATUS.FAILED, '支付参数验证失败');
    return;
  }

  try {
    // 通知后端验证并处理回调
    const res = await handleAlipayReturn(params);

    if (res.code === 200) {
      if (params.trade_status === 'TRADE_SUCCESS' || params.trade_status === 'TRADE_FINISHED') {
        showResult(PAYMENT_STATUS.SUCCESS, '支付成功！');
        emit('success', res.data);
      } else {
        showResult(PAYMENT_STATUS.FAILED, `支付状态: ${params.trade_status}`);
        emit('fail', res.data);
      }
    } else {
      showResult(PAYMENT_STATUS.FAILED, res.message || '支付验证失败');
      emit('fail', res);
    }
  } catch (error) {
    console.error('处理支付回调失败:', error);
    showResult(PAYMENT_STATUS.FAILED, '支付结果处理失败');
    emit('fail', error);
  }
};

/**
 * 显示支付结果
 */
const showResult = (status, message) => {
  paymentResult.value = { status, message };
  resultVisible.value = true;
};

/**
 * 处理结果对话框确认
 */
const handleResultConfirm = () => {
  resultVisible.value = false;

  if (paymentResult.value.status === PAYMENT_STATUS.SUCCESS) {
    router.push('/shop/order');
  } else {
    emit('close');
  }
};

/**
 * 处理结果对话框关闭
 */
const handleResultClose = () => {
  emit('close');
};

/**
 * 显示支付帮助
 */
const showHelp = () => {
  helpVisible.value = true;
};

/**
 * 取消支付
 */
const cancelPayment = () => {
  if (payWindow.value && !payWindow.value.closed) {
    payWindow.value.close();
  }

  if (statusCheckTimer.value) {
    clearInterval(statusCheckTimer.value);
  }

  emit('cancel');
};

// 生命周期
onMounted(() => {
  // 检查是否是支付回调页面
  if (route.path === '/shop/order/pay/return') {
    handleAlipayReturn();
  } else if (props.autoPay) {
    initiatePayment();
  }
});

onUnmounted(() => {
  // 清理定时器
  if (statusCheckTimer.value) {
    clearInterval(statusCheckTimer.value);
  }

  // 关闭支付窗口
  if (payWindow.value && !payWindow.value.closed) {
    payWindow.value.close();
  }
});

// 暴露方法
defineExpose({
  initiatePayment,
  showHelp,
  cancelPayment
});
</script>

<style scoped lang="scss">
.alipay-payment-container {
  .loading-content {
    text-align: center;
    padding: 30px 0;

    .loading-icon {
      font-size: 48px;
      color: #1677FF;
      animation: rotate 1s linear infinite;
    }

    p {
      margin-top: 15px;
      color: #606266;
    }

    .tips {
      font-size: 13px;
      color: #909399;
    }
  }

  .result-content {
    padding: 20px 0;
  }

  .help-content {
    h4 {
      margin-bottom: 15px;
      color: #303133;
    }

    p {
      margin: 5px 0;
      line-height: 1.6;
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
