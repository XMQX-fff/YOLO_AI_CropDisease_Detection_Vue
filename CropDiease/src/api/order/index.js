import request from '/@/utils/request'

// 创建订单
export function createOrder(userId, addressId, remark, buyerMessage) {
  return request({
    url: '/order',
    method: 'post',
    params: { userId, addressId, remark, buyerMessage }
  })
}

// 获取订单详情
export function getOrderDetail(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'get'
  })
}

// 获取用户订单列表
export function getOrderList(userId) {
  return request({
    url: '/order/list',
    method: 'get',
    params: { userId }
  })
}

// 分页获取订单
export function getOrderPage(userId, pageNum = 1, pageSize = 10, status) {
  return request({
    url: '/order/page',
    method: 'get',
    params: { userId, pageNum, pageSize, status }
  })
}

// 支付订单
export function payOrder(orderId, payMethod) {
  return request({
    url: `/order/${orderId}/pay`,
    method: 'put',
    params: { payMethod }
  })
}

// 发货
export function shipOrder(orderId, trackingNo, logisticsCompany) {
  return request({
    url: `/order/${orderId}/ship`,
    method: 'put',
    params: { trackingNo, logisticsCompany }
  })
}

// 确认收货
export function confirmOrder(orderId) {
  return request({
    url: `/order/${orderId}/confirm`,
    method: 'put'
  })
}

// 取消订单
export function cancelOrder(orderId, cancelReason) {
  return request({
    url: `/order/${orderId}/cancel`,
    method: 'put',
    params: { cancelReason }
  })
}

// 删除订单
export function deleteOrder(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'delete'
  })
}

// 根据订单号查询
export function getOrderByOrderNo(orderNo) {
  return request({
    url: '/order/byOrderNo',
    method: 'get',
    params: { orderNo }
  })
}
