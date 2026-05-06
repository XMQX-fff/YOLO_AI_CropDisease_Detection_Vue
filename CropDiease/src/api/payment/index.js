import request from '/@/utils/request';

/**
 * 创建支付宝支付订单
 * @param {Object} data - 支付数据
 * @param {string} data.orderNo - 订单号
 * @param {number} data.amount - 支付金额
 * @param {string} data.subject - 订单标题
 * @param {string} data.body - 订单描述
 * @param {string} data.returnUrl - 同步回调地址
 * @param {string} data.notifyUrl - 异步通知地址
 */
export function createAlipayPayment(data) {
  return request({
    url: '/api/payment/alipay/create',
    method: 'post',
    data
  });
}

/**
 * 查询支付宝支付状态
 * @param {string} orderNo - 订单号
 */
export function queryAlipayStatus(orderNo) {
  return request({
    url: '/api/payment/alipay/query',
    method: 'get',
    params: { orderNo }
  });
}

/**
 * 关闭支付宝订单
 * @param {string} orderNo - 订单号
 */
export function closeAlipayOrder(orderNo) {
  return request({
    url: '/api/payment/alipay/close',
    method: 'post',
    params: { orderNo }
  });
}

/**
 * 申请支付宝退款
 * @param {Object} data - 退款数据
 * @param {string} data.orderNo - 订单号
 * @param {number} data.refundAmount - 退款金额
 * @param {string} data.refundReason - 退款原因
 */
export function refundAlipayPayment(data) {
  return request({
    url: '/api/payment/alipay/refund',
    method: 'post',
    data
  });
}

/**
 * 处理支付宝同步回调
 * @param {Object} params - URL参数
 */
export function handleAlipayReturn(params) {
  return request({
    url: '/api/payment/alipay/return',
    method: 'get',
    params
  });
}

/**
 * 获取支付宝支付链接（沙箱环境）
 * @param {string} orderNo - 订单号
 */
export function getAlipayPayUrl(orderNo) {
  return request({
    url: '/api/payment/alipay/pay-url',
    method: 'get',
    params: { orderNo }
  });
}

/**
 * 验证支付结果
 * @param {string} orderNo - 订单号
 * @param {string} tradeNo - 支付宝交易号
 */
export function verifyPayment(orderNo, tradeNo) {
  return request({
    url: '/api/payment/alipay/verify',
    method: 'post',
    data: { orderNo, tradeNo }
  });
}
