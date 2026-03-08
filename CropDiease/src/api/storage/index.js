import request from '/@/utils/request';
/**
 * 库存管理API接口集合
 * @method getStorageList 获取库存列表
 * @method getStorageDetail 获取库存详情
 * @method addStorage 添加库存
 * @method updateStorage 更新库存
 * @method deleteStorage 删除库存
 */
export function useStorageApi() {
    return {
        getStorageList: (params) => {
            return request({
                url: '/api/storage',
                method: 'get',
                params
            });
        },
        getStorageDetail: (id) => {
            return request({
                url: `/api/storage/${id}`,
                method: 'get'
            });
        },
        addStorage: (data) => {
            return request({
                url: '/api/storage',
                method: 'post',
                data
            });
        },
        updateStorage: (data) => {
            return request({
                url: '/api/storage/update',
                method: 'post',
                data
            });
        },
        deleteStorage: (id) => {
            return request({
                url: `/api/storage/${id}`,
                method: 'delete'
            });
        }
    };
}
