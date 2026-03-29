import request from '/@/utils/request'

// 获取购物车列表
export function getCartList(userId) {
  return request({
    url: '/cart',
    method: 'get',
    params: { userId }
  })
}

// 添加商品到购物车
export function addToCart(userId, productId, quantity = 1) {
  return request({
    url: '/cart',
    method: 'post',
    params: { userId, productId, quantity }
  })
}

// 更新购物车商品数量
export function updateCartQuantity(cartId, quantity) {
  return request({
    url: `/cart/${cartId}`,
    method: 'put',
    params: { quantity }
  })
}

// 删除购物车商品
export function removeFromCart(cartId) {
  return request({
    url: `/cart/${cartId}`,
    method: 'delete'
  })
}

// 批量删除
export function batchRemoveCart(cartIds) {
  return request({
    url: '/cart/batch',
    method: 'delete',
    params: { cartIds }
  })
}

// 清空购物车
export function clearCart(userId) {
  return request({
    url: '/cart/clear',
    method: 'delete',
    params: { userId }
  })
}

// 选中/取消选中
export function toggleSelected(cartId, selected) {
  return request({
    url: `/cart/${cartId}/select`,
    method: 'put',
    params: { selected }
  })
}

// 全选/取消全选
export function toggleAllSelected(userId, selected) {
  return request({
    url: '/cart/selectAll',
    method: 'put',
    params: { userId, selected }
  })
}

// 获取选中的购物车商品
export function getSelectedCart(userId) {
  return request({
    url: '/cart/selected',
    method: 'get',
    params: { userId }
  })
}

// 获取购物车商品数量
export function getCartCount(userId) {
  return request({
    url: '/cart/count',
    method: 'get',
    params: { userId }
  })
}

// 计算选中商品总金额
export function calculateTotal(userId) {
  return request({
    url: '/cart/total',
    method: 'get',
    params: { userId }
  })
}
