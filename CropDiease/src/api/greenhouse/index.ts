import request from '/@/utils/request';

/**
 * 温室管理API接口集合
 * @method getGreenhouseList 获取温室列表
 * @method getGreenhouseDetail 获取温室详情
 * @method getWithDetections 获取温室详情和病虫害检测信息
 * @method addGreenhouse 添加温室
 * @method updateGreenhouse 更新温室
 * @method deleteGreenhouse 删除温室
 * @method getAllWithDiseaseCount 获取所有温室信息（带病虫害数量）
 * @method getWithDiseaseCountPage 分页获取温室信息（带病虫害数量）
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
        getWithDetections: (id: number) => {
            return request({
                url: `/api/greenhouse/${id}/withDetections`,
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
        },
        getAllWithDiseaseCount: () => {
            return request({
                url: '/api/greenhouse/all/withDiseaseCount',
                method: 'get'
            });
        },
        getWithDiseaseCountPage: (params: object) => {
            return request({
                url: '/api/greenhouse/withDiseaseCount',
                method: 'get',
                params
            });
        },
        getEnvironmentHistory: (params: { greenhouseId: number; timeRange: string }) => {
            return request({
                url: '/api/greenhouse-environment-history/chart',
                method: 'get',
                params
            });
        },
        getDeviceList: (params: object) => {
            return request({
                url: '/api/greenhouse-device',
                method: 'get',
                params
            });
        },
        getAllDevices: () => {
            return request({
                url: '/api/greenhouse-device/all',
                method: 'get'
            });
        },
        getDeviceById: (id: string) => {
            return request({
                url: `/api/greenhouse-device/${id}`,
                method: 'get'
            });
        },
        getDevicesByGreenhouseId: (greenhouseId: string) => {
            return request({
                url: `/api/greenhouse-device/greenhouse/${greenhouseId}`,
                method: 'get'
            });
        },
        addDevice: (data: object) => {
            return request({
                url: '/api/greenhouse-device',
                method: 'post',
                data
            });
        },
        updateDevice: (data: object) => {
            return request({
                url: '/api/greenhouse-device/update',
                method: 'post',
                data
            });
        },
        deleteDevice: (id: string) => {
            return request({
                url: `/api/greenhouse-device/${id}`,
                method: 'delete'
            });
        },
        controlDevice: (id: string, params: { status: number; value?: string; operateUser?: string }) => {
            return request({
                url: `/api/greenhouse-device/control/${id}`,
                method: 'post',
                params
            });
        },
        toggleAutoMode: (id: string, params: { isAuto: number }) => {
            return request({
                url: `/api/greenhouse-device/toggle-auto/${id}`,
                method: 'post',
                params
            });
        }
    };
}