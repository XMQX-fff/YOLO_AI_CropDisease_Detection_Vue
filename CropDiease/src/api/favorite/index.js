import request from '/@/utils/request'

// 获取收藏列表
export function getFavoriteList(userId) {
  return request({
    url: '/api/favorite',
    method: 'get',
    params: { userId }
  })
}

// 添加收藏
export function addFavorite(userId, productId) {
  return request({
    url: '/api/favorite',
    method: 'post',
    params: { userId, productId }
  })
}

// 取消收藏
export function removeFavorite(userId, productId) {
  return request({
    url: '/api/favorite',
    method: 'delete',
    params: { userId, productId }
  })
}

// 切换收藏状态
export function toggleFavorite(userId, productId) {
  return request({
    url: '/api/favorite/toggle',
    method: 'post',
    params: { userId, productId }
  })
}

// 检查是否已收藏
export function checkFavorite(userId, productId) {
  return request({
    url: '/api/favorite/check',
    method: 'get',
    params: { userId, productId }
  })
}

// 获取收藏数量
export function getFavoriteCount(userId) {
  return request({
    url: '/api/favorite/count',
    method: 'get',
    params: { userId }
  })
}
