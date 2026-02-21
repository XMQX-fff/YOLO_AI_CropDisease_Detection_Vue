import request from '/@/utils/request';

/**
 * 物流信息API
 */

export function useLogisticsApi() {
	return {
		/**
		 * 分页查询物流信息列表
		 * @param params 查询参数
		 * @returns 物流信息列表
		 */
		getLogisticsList(params: any) {
			return request({
				url: '/api/logistics',
				method: 'get',
				params,
			});
		},
		
		/**
		 * 新增物流信息
		 * @param data 物流信息
		 * @returns 操作结果
		 */
		addLogistics(data: any) {
			return request({
				url: '/api/logistics',
				method: 'post',
			data,
			});
		},
		
		/**
		 * 更新物流信息
		 * @param data 物流信息
		 * @returns 操作结果
		 */
		updateLogistics(data: any) {
			return request({
				url: '/api/logistics',
				method: 'put',
			data,
			});
		},
		
		/**
		 * 删除物流信息
		 * @param id 物流ID
		 * @returns 操作结果
		 */
		deleteLogistics(id: string) {
			return request({
				url: `api/logistics/${id}`,
				method: 'delete',
			});
		},
		
		/**
		 * 获取单个物流信息详情
		 * @param id 物流ID
		 * @returns 物流信息详情
		 */
		getLogisticsById(id: string) {
			return request({
				url: `api/logistics/${id}`,
				method: 'get',
			});
		},
		
		/**
		 * 获取指定订单的物流信息
		 * @param orderId 订单ID
		 * @returns 物流信息
		 */
		getLogisticsByOrderId(orderId: string) {
			return request({
				url: `api/order/${orderId}`,
				method: 'get',
			});
		},
	};
}