/**
 * 支付工具函数
 * 处理支付宝沙箱支付相关功能
 */

import { ALIPAY_CONFIG, PAYMENT_STATUS } from '/@/config/alipay.config';
import { ElMessage } from 'element-plus';

// 重新导出 PAYMENT_STATUS，方便其他模块使用
export { PAYMENT_STATUS };

/**
 * 构建支付宝支付表单并提交
 * @param {Object} params - 支付参数
 * @param {string} params.orderNo - 订单号
 * @param {number} params.amount - 支付金额
 * @param {string} params.subject - 订单标题
 * @param {string} params.body - 订单描述
 * @param {string} params.returnUrl - 同步回调地址
 * @param {string} params.sign - 签名（由后端生成）
 * @param {string} params.timestamp - 时间戳
 * @param {string} params.outTradeNo - 商户订单号
 */
export function submitAlipayForm(params) {
  // 创建表单
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = ALIPAY_CONFIG.GATEWAY_URL;
  form.target = '_blank';
  form.style.display = 'none';

  // 构建支付宝请求参数
  const alipayParams = {
    app_id: ALIPAY_CONFIG.APP_ID,
    method: 'alipay.trade.page.pay',
    charset: ALIPAY_CONFIG.CHARSET,
    sign_type: ALIPAY_CONFIG.SIGN_TYPE,
    timestamp: params.timestamp || formatDate(new Date()),
    version: ALIPAY_CONFIG.VERSION,
    biz_content: JSON.stringify({
      out_trade_no: params.outTradeNo || params.orderNo,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: params.amount.toFixed(2),
      subject: params.subject || '订单支付',
      body: params.body || '商品购买',
      timeout_express: '30m'
    }),
    return_url: params.returnUrl || ALIPAY_CONFIG.RETURN_URL,
    sign: params.sign
  };

  // 创建隐藏输入字段
  Object.keys(alipayParams).forEach(key => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = alipayParams[key];
    form.appendChild(input);
  });

  // 添加到文档并提交
  document.body.appendChild(form);
  form.submit();

  // 清理
  setTimeout(() => {
    document.body.removeChild(form);
  }, 1000);

  return true;
}

/**
 * 使用支付宝沙箱SDK方式支付（通过后端接口获取支付URL）
 * @param {Object} orderData - 订单数据
 * @param {string} orderData.orderNo - 订单号
 * @param {number} orderData.amount - 支付金额
 * @param {string} orderData.subject - 订单标题
 * @returns {Promise<string>} - 支付页面URL
 */
export async function createAlipayPagePay(orderData) {
  try {
    // 构建支付参数
    const params = {
      out_trade_no: orderData.orderNo,
      total_amount: orderData.amount.toFixed(2),
      subject: orderData.subject || '订单支付',
      body: orderData.body || '商品购买',
      product_code: 'FAST_INSTANT_TRADE_PAY',
      timeout_express: '30m',
      return_url: ALIPAY_CONFIG.RETURN_URL
    };

    // 返回支付参数，实际支付URL需要后端生成
    return params;
  } catch (error) {
    console.error('创建支付宝支付失败:', error);
    throw error;
  }
}

/**
 * 打开支付宝支付页面（新窗口）
 * @param {string} payFormHtml - 支付宝返回的HTML表单字符串
 */
export function openAlipayPage(payFormHtml) {
  if (!payFormHtml) {
    ElMessage.error('支付表单无效');
    return;
  }

  // 计算窗口大小和位置
  const width = 800;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  // 打开支付窗口（先打开空白窗口，避免被拦截）
  const payWindow = window.open(
    '',
    'alipay_payment',
    `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );

  // 检查窗口是否被拦截
  if (!payWindow || payWindow.closed || typeof payWindow.closed === 'undefined') {
    ElMessage.warning('支付窗口被浏览器拦截，请允许弹出窗口后重试');
    return null;
  }

  // 将支付宝返回的HTML表单写入窗口
  payWindow.document.write(payFormHtml);
  payWindow.document.close();

  return payWindow;
}

/**
 * 监听支付窗口状态
 * @param {Window} payWindow - 支付窗口对象
 * @param {Function} callback - 回调函数
 * @param {number} interval - 检查间隔（毫秒）
 */
export function watchPaymentWindow(payWindow, callback, interval = 1000) {
  if (!payWindow) return;

  const timer = setInterval(() => {
    // 检查窗口是否关闭
    if (payWindow.closed) {
      clearInterval(timer);
      if (callback) {
        callback({ status: 'closed', message: '支付窗口已关闭' });
      }
    }
  }, interval);

  // 返回清理函数
  return () => clearInterval(timer);
}

/**
 * 查询支付状态
 * @param {string} orderNo - 订单号
 * @param {Function} apiCall - 查询API调用函数
 * @param {number} maxAttempts - 最大查询次数
 * @param {number} interval - 查询间隔（毫秒）
 * @returns {Promise<Object>} - 支付状态
 */
export async function queryPaymentStatus(orderNo, apiCall, maxAttempts = 30, interval = 2000) {
  let attempts = 0;

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        attempts++;
        const result = await apiCall(orderNo);

        // 支付成功
        if (result.status === PAYMENT_STATUS.SUCCESS || result.status === 'paid') {
          resolve({ status: PAYMENT_STATUS.SUCCESS, data: result });
          return;
        }

        // 支付失败或取消
        if (result.status === PAYMENT_STATUS.FAILED ||
            result.status === PAYMENT_STATUS.CANCELLED) {
          resolve({ status: result.status, data: result });
          return;
        }

        // 继续查询
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, interval);
        } else {
          // 超时
          resolve({ status: PAYMENT_STATUS.TIMEOUT, message: '支付状态查询超时' });
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, interval);
        } else {
          reject(error);
        }
      }
    };

    checkStatus();
  });
}

/**
 * 格式化日期为支付宝要求的格式
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化后的日期字符串
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 生成订单号（前端临时生成，实际应由后端生成）
 * @returns {string} - 订单号
 */
export function generateOrderNo() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORDER${timestamp}${random}`;
}

/**
 * 验证支付回调参数（简单验证）
 * @param {Object} params - 回调参数
 * @returns {boolean} - 验证结果
 */
export function verifyReturnParams(params) {
  // 检查必要参数
  const requiredFields = ['out_trade_no', 'trade_no', 'trade_status'];
  for (const field of requiredFields) {
    if (!params[field]) {
      console.warn(`支付回调缺少必要参数: ${field}`);
      return false;
    }
  }

  // 验证交易状态
  const validStatuses = ['TRADE_SUCCESS', 'TRADE_FINISHED'];
  if (!validStatuses.includes(params.trade_status)) {
    console.warn(`支付状态异常: ${params.trade_status}`);
    return false;
  }

  return true;
}

/**
 * 处理支付错误
 * @param {Error} error - 错误对象
 * @returns {Object} - 处理后的错误信息
 */
export function handlePaymentError(error) {
  console.error('支付错误:', error);

  const errorMap = {
    'Network Error': { message: '网络连接失败，请检查网络后重试', type: 'network' },
    'timeout': { message: '请求超时，请稍后重试', type: 'timeout' },
    'INSUFFICIENT_BALANCE': { message: '账户余额不足', type: 'balance' },
    'USER_PAYING': { message: '用户正在支付中', type: 'processing' },
    'ACQ.TRADE_HAS_SUCCESS': { message: '该订单已支付成功', type: 'duplicate' },
    'ACQ.TRADE_HAS_CLOSE': { message: '该订单已关闭', type: 'closed' }
  };

  const errorMessage = error.message || error.toString();

  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.includes(key)) {
      return { ...value, original: error };
    }
  }

  return { message: '支付失败，请稍后重试', type: 'unknown', original: error };
}

/**
 * 获取支付状态文本
 * @param {string} status - 支付状态码
 * @returns {string} - 状态文本
 */
export function getPaymentStatusText(status) {
  const statusMap = {
    [PAYMENT_STATUS.PENDING]: '待支付',
    [PAYMENT_STATUS.PROCESSING]: '支付中',
    [PAYMENT_STATUS.SUCCESS]: '支付成功',
    [PAYMENT_STATUS.FAILED]: '支付失败',
    [PAYMENT_STATUS.CANCELLED]: '已取消',
    [PAYMENT_STATUS.TIMEOUT]: '支付超时'
  };

  return statusMap[status] || status;
}

/**
 * 获取支付状态类型（用于Element Plus标签）
 * @param {string} status - 支付状态码
 * @returns {string} - 标签类型
 */
export function getPaymentStatusType(status) {
  const typeMap = {
    [PAYMENT_STATUS.PENDING]: 'warning',
    [PAYMENT_STATUS.PROCESSING]: 'primary',
    [PAYMENT_STATUS.SUCCESS]: 'success',
    [PAYMENT_STATUS.FAILED]: 'danger',
    [PAYMENT_STATUS.CANCELLED]: 'info',
    [PAYMENT_STATUS.TIMEOUT]: 'danger'
  };

  return typeMap[status] || 'info';
}
