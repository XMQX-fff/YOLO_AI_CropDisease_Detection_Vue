import request from '/@/utils/request'

// ========== 普通商品接口（用于前台展示）==========

// 获取商品列表
export function getProductList(params) {
  return request({
    url: '/api/product',
    method: 'get',
    params
  })
}

// 获取商品详情
export function getProductDetail(id, userId) {
  return request({
    url: `/api/product/${id}`,
    method: 'get',
    params: { userId }
  })
}

// 获取推荐商品
export function getRecommendProducts(limit = 8) {
  return request({
    url: '/api/product/recommend',
    method: 'get',
    params: { limit }
  })
}

// 获取热销商品
export function getHotProducts(limit = 8) {
  return request({
    url: '/api/product/hot',
    method: 'get',
    params: { limit }
  })
}

// 获取新品
export function getNewProducts(limit = 8) {
  return request({
    url: '/api/product/new',
    method: 'get',
    params: { limit }
  })
}

// 获取商品分类
export function getCategories() {
  return request({
    url: '/api/product/category/list',
    method: 'get'
  })
}

// 检查库存
export function checkStock(id, quantity) {
  return request({
    url: `/api/product/${id}/stock`,
    method: 'get',
    params: { quantity }
  })
}

// ========== 供应商商品管理接口（用于供应管理后台）==========

// 获取供应商商品列表
export function getSupplierProductList(params) {
  return request({
    url: '/api/supplier/product/list',
    method: 'get',
    params
  })
}

// 获取供应商商品详情
export function getSupplierProductDetail(id) {
  return request({
    url: `/api/supplier/product/${id}`,
    method: 'get'
  })
}

// 添加商品（供应商）
export function addSupplierProduct(data) {
  return request({
    url: '/api/supplier/product',
    method: 'post',
    data
  })
}

// 更新商品（供应商）
export function updateSupplierProduct(id, data) {
  return request({
    url: `/api/supplier/product/${id}`,
    method: 'put',
    data
  })
}

// 删除商品（供应商）
export function deleteSupplierProduct(id) {
  return request({
    url: `/api/supplier/product/${id}`,
    method: 'delete'
  })
}

// 上架/下架商品（供应商）
export function toggleSupplierProductStatus(id, isOnSale) {
  return request({
    url: `/api/supplier/product/${id}/status`,
    method: 'put',
    params: { isOnSale }
  })
}

// 更新库存（供应商）
export function updateSupplierProductStock(id, stock) {
  return request({
    url: `/api/supplier/product/${id}/stock`,
    method: 'put',
    params: { stock }
  })
}

// 获取供应商商品统计信息
export function getSupplierProductStatistics() {
  return request({
    url: '/api/supplier/product/statistics',
    method: 'get'
  })
}

// ========== 分类管理接口 ==========

// 添加分类
export function addCategory(data) {
  return request({
    url: '/api/product/category',
    method: 'post',
    data
  })
}

// 更新分类
export function updateCategory(id, data) {
  return request({
    url: `/api/product/category/${id}`,
    method: 'put',
    data
  })
}

// 删除分类
export function deleteCategory(id) {
  return request({
    url: `/api/product/category/${id}`,
    method: 'delete'
  })
}

// 显示/隐藏分类
export function toggleCategoryStatus(id, isShow) {
  return request({
    url: `/api/product/category/${id}/status`,
    method: 'put',
    params: { isShow }
  })
}

// ========== 供应商订单管理接口 ==========

// 获取供应商订单列表（查询包含供应商商品的订单）
export function getSupplierOrderPage(pageNum = 1, pageSize = 10, status) {
  return request({
    url: '/api/supplier/order/page',
    method: 'get',
    params: { pageNum, pageSize, status }
  })
}

// 获取供应商订单详情
export function getSupplierOrderDetail(orderId) {
  return request({
    url: `/api/supplier/order/${orderId}`,
    method: 'get'
  })
}

// 供应商发货
export function supplierShipOrder(orderId, trackingNo, logisticsCompany) {
  return request({
    url: `/api/supplier/order/${orderId}/ship`,
    method: 'put',
    params: { trackingNo, logisticsCompany }
  })
}
