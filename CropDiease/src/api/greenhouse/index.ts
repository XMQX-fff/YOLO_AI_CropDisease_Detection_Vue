import request from '/@/utils/request';

/**
 * 温室管理API接口集合
 * @method getGreenhouseList 获取温室列表
 * @method getGreenhouseDetail 获取温室详情
 * @method addGreenhouse 添加温室
 * @method updateGreenhouse 更新温室
 * @method deleteGreenhouse 删除温室
 */
export function useGreenhouseApi() {
    return {
        getGreenhouseList: (params: object) => {
            return request({
                url: '/api/greenhouse',
                method: 'get',
                params
            });
        },
        getGreenhouseDetail: (id: string) => {
            return request({
                url: `/api/greenhouse/${id}`,
                method: 'get'
            });
        },
        addGreenhouse: (data: object) => {
            return request({
                url: '/api/greenhouse',
                method: 'post',
                data
            });
        },
        updateGreenhouse: (data: object) => {
            return request({
                url: '/api/greenhouse/update',
                method: 'post',
                data
            });
        },
        deleteGreenhouse: (id: string) => {
            return request({
                url: `/api/greenhouse/${id}`,
                method: 'delete'
            });
        }
    };
}