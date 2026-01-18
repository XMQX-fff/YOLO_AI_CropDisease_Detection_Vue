import request from '/@/utils/request';

/**
 * 采购管理API接口集合
 * @method getPurchaseList 获取采购列表
 * @method getPurchaseDetail 获取采购详情
 * @method addPurchase 添加采购
 * @method updatePurchase 更新采购
 * @method deletePurchase 删除采购
 */
export function usePurchaseApi() {
    return {
        getPurchaseList: (params: object) => {
            return request({
                url: '/api/purchase',
                method: 'get',
                params
            });
        },
        getPurchaseDetail: (id: string) => {
            return request({
                url: `/api/purchase/${id}`,
                method: 'get'
            });
        },
        addPurchase: (data: object) => {
            return request({
                url: '/api/purchase',
                method: 'post',
                data
            });
        },
        updatePurchase: (data: object) => {
            return request({
                url: '/api/purchase/update',
                method: 'post',
                data
            });
        },
        deletePurchase: (id: string) => {
            return request({
                url: `/api/purchase/${id}`,
                method: 'delete'
            });
        }
    };
}