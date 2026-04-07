import request from '/@/utils/request'

// 获取地址列表
export function getAddressList(userId) {
  return request({
    url: '/api/address',
    method: 'get',
    params: { userId }
  })
}

// 获取默认地址
export function getDefaultAddress(userId) {
  return request({
    url: '/api/address/default',
    method: 'get',
    params: { userId }
  })
}

// 添加地址
export function addAddress(data) {
  return request({
    url: '/api/address',
    method: 'post',
    data
  })
}

// 更新地址
export function updateAddress(id, data) {
  return request({
    url: `/api/address/${id}`,
    method: 'put',
    data
  })
}

// 删除地址
export function deleteAddress(id) {
  return request({
    url: `/api/address/${id}`,
    method: 'delete'
  })
}

// 设置默认地址
export function setDefaultAddress(userId, addressId) {
  return request({
    url: `/api/address/${addressId}/default`,
    method: 'put',
    params: { userId }
  })
}

// 获取地址详情
export function getAddressDetail(id) {
  return request({
    url: `/api/address/${id}`,
    method: 'get'
  })
}
