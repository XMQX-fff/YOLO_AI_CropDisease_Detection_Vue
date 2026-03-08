import request from '/@/utils/request';
/**
 * 采购管理API接口集合
 * @method getPurchaseList 获取采购列表
 * @method getPurchaseDetail 获取采购详情
 * @method addPurchase 添加采购
 * @method updatePurchase 更新采购
 * @method deletePurchase 删除采购
 * @method getProductList 获取产品列表
 * @method getProductDetail 获取产品详情
 * @method addProduct 添加产品
 * @method updateProduct 更新产品
 * @method deleteProduct 删除产品
 * @method getOrderList 获取订单列表
 * @method getOrderDetail 获取订单详情
 * @method addOrder 添加订单
 * @method updateOrder 更新订单
 * @method deleteOrder 删除订单
 * @method getOrderItemList 获取订单商品列表
 * @method getOrderItemsByOrderId 获取指定订单的所有商品
 * @method addOrderItem 添加订单商品
 * @method updateOrderItem 更新订单商品
 * @method deleteOrderItem 删除订单商品
 * @method getPaymentRecordList 获取支付记录列表
 * @method getPaymentRecordsByOrderId 获取指定订单的所有支付记录
 * @method addPaymentRecord 添加支付记录
 * @method updatePaymentRecord 更新支付记录
 * @method deletePaymentRecord 删除支付记录
 * @method getLogisticsList 获取物流信息列表
 * @method getLogisticsByOrderId 获取指定订单的物流信息
 * @method addLogistics 添加物流信息
 * @method updateLogistics 更新物流信息
 * @method deleteLogistics 删除物流信息
 * @method getPaymentMethodList 获取支付方式列表
 * @method getEnabledPaymentMethods 获取所有启用的支付方式
 * @method addPaymentMethod 添加支付方式
 * @method updatePaymentMethod 更新支付方式
 * @method deletePaymentMethod 删除支付方式
 */
export function usePurchaseApi() {
    return {
        // 采购管理相关接口
        getPurchaseList: (params) => {
            return request({
                url: '/api/purchase',
                method: 'get',
                params
            });
        },
        getPurchaseDetail: (id) => {
            return request({
                url: `/api/purchase/${id}`,
                method: 'get'
            });
        },
        addPurchase: (data) => {
            return request({
                url: '/api/purchase',
                method: 'post',
                data
            });
        },
        updatePurchase: (data) => {
            return request({
                url: '/api/purchase',
                method: 'put',
                data
            });
        },
        deletePurchase: (id) => {
            return request({
                url: `/api/purchase/${id}`,
                method: 'delete'
            });
        },
        // 产品相关接口
        getProductList: (params) => {
            return request({
                url: '/api/product',
                method: 'get',
                params
            });
        },
        getProductDetail: (id) => {
            return request({
                url: `/api/product/${id}`,
                method: 'get'
            });
        },
        addProduct: (data) => {
            return request({
                url: '/api/product',
                method: 'post',
                data
            });
        },
        updateProduct: (data) => {
            return request({
                url: '/api/product',
                method: 'put',
                data
            });
        },
        deleteProduct: (id) => {
            return request({
                url: `/api/product/${id}`,
                method: 'delete'
            });
        },
        // 订单相关接口
        getOrderList: (params) => {
            return request({
                url: '/api/order',
                method: 'get',
                params
            });
        },
        getOrderDetail: (id) => {
            return request({
                url: `/api/order/${id}`,
                method: 'get'
            });
        },
        addOrder: (data) => {
            return request({
                url: '/api/order',
                method: 'post',
                data
            });
        },
        updateOrder: (data) => {
            return request({
                url: '/api/order',
                method: 'put',
                data
            });
        },
        deleteOrder: (id) => {
            return request({
                url: `/api/order/${id}`,
                method: 'delete'
            });
        },
        updateOrderStatus: (orderId, status) => {
            return request({
                url: `/api/order/${orderId}/status`,
                method: 'put',
                data: { status }
            });
        },
        // 订单商品相关接口
        getOrderItemList: (params) => {
            return request({
                url: '/api/orderItem',
                method: 'get',
                params
            });
        },
        getOrderItemsByOrderId: (orderId) => {
            return request({
                url: `/api/orderItem/order/${orderId}`,
                method: 'get'
            });
        },
        addOrderItem: (data) => {
            return request({
                url: '/api/orderItem',
                method: 'post',
                data
            });
        },
        updateOrderItem: (data) => {
            return request({
                url: '/api/orderItem',
                method: 'put',
                data
            });
        },
        deleteOrderItem: (id) => {
            return request({
                url: `/api/orderItem/${id}`,
                method: 'delete'
            });
        },
        // 支付记录相关接口
        getPaymentRecordList: (params) => {
            return request({
                url: '/api/paymentRecord',
                method: 'get',
                params
            });
        },
        getPaymentRecordsByOrderId: (orderId) => {
            return request({
                url: `/api/paymentRecord/order/${orderId}`,
                method: 'get'
            });
        },
        addPaymentRecord: (data) => {
            return request({
                url: '/api/paymentRecord',
                method: 'post',
                data
            });
        },
        updatePaymentRecord: (data) => {
            return request({
                url: '/api/paymentRecord',
                method: 'put',
                data
            });
        },
        deletePaymentRecord: (id) => {
            return request({
                url: `/api/paymentRecord/${id}`,
                method: 'delete'
            });
        },
        // 物流信息相关接口
        getLogisticsList: (params) => {
            return request({
                url: '/api/logistics',
                method: 'get',
                params
            });
        },
        getLogisticsByOrderId: (orderId) => {
            return request({
                url: `/api/logistics/order/${orderId}`,
                method: 'get'
            });
        },
        addLogistics: (data) => {
            return request({
                url: '/api/logistics',
                method: 'post',
                data
            });
        },
        updateLogistics: (data) => {
            return request({
                url: '/api/logistics',
                method: 'put',
                data
            });
        },
        deleteLogistics: (id) => {
            return request({
                url: `/api/logistics/${id}`,
                method: 'delete'
            });
        },
        // 支付方式相关接口
        getPaymentMethodList: (params) => {
            return request({
                url: '/api/paymentMethod',
                method: 'get',
                params
            });
        },
        getEnabledPaymentMethods: () => {
            return request({
                url: '/api/paymentMethod/enabled',
                method: 'get'
            });
        },
        addPaymentMethod: (data) => {
            return request({
                url: '/api/paymentMethod',
                method: 'post',
                data
            });
        },
        updatePaymentMethod: (data) => {
            return request({
                url: '/api/paymentMethod',
                method: 'put',
                data
            });
        },
        deletePaymentMethod: (id) => {
            return request({
                url: `/api/paymentMethod/${id}`,
                method: 'delete'
            });
        }
    };
}
