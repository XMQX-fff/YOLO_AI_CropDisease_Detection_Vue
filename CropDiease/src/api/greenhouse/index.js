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
 * @method getAllGreenhouseStatus 获取所有温室状态信息
 */
export function useGreenhouseApi() {
    return {
        getGreenhouseList: (params) => {
            return request({
                url: '/api/greenhouse',
                method: 'get',
                params
            });
        },
        getGreenhouseDetail: (id) => {
            return request({
                url: `/api/greenhouse/${id}`,
                method: 'get'
            });
        },
        getWithDetections: (id) => {
            return request({
                url: `/api/greenhouse/${id}/withDetections`,
                method: 'get'
            });
        },
        addGreenhouse: (data) => {
            return request({
                url: '/api/greenhouse',
                method: 'post',
                data
            });
        },
        updateGreenhouse: (data) => {
            return request({
                url: '/api/greenhouse/update',
                method: 'post',
                data
            });
        },
        deleteGreenhouse: (id) => {
            return request({
                url: `/api/greenhouse/${id}`,
                method: 'delete'
            });
        },
        getWithDiseaseCountPage: (params) => {
            return request({
                url: '/api/greenhouse/withDiseaseCount',
                method: 'get',
                params
            });
        },
        getEnvironmentHistory: (params) => {
            return request({
                url: '/api/greenhouse-environment-history/chart',
                method: 'get',
                params
            });
        },
        getDeviceList: (params) => {
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
        getDeviceById: (id) => {
            return request({
                url: `/api/greenhouse-device/${id}`,
                method: 'get'
            });
        },
        getDevicesByGreenhouseId: (greenhouseId) => {
            return request({
                url: `/api/greenhouse-device/greenhouse/${greenhouseId}`,
                method: 'get'
            });
        },
        addDevice: (data) => {
            return request({
                url: '/api/greenhouse-device',
                method: 'post',
                data
            });
        },
        updateDevice: (data) => {
            return request({
                url: '/api/greenhouse-device/update',
                method: 'post',
                data
            });
        },
        deleteDevice: (id) => {
            return request({
                url: `/api/greenhouse-device/${id}`,
                method: 'delete'
            });
        },
        controlDevice: (id, params) => {
            return request({
                url: `/api/greenhouse-device/control/${id}`,
                method: 'post',
                params
            });
        },
        toggleAutoMode: (id, params) => {
            return request({
                url: `/api/greenhouse-device/toggle-auto/${id}`,
                method: 'post',
                params
            });
        },
        getAllGreenhouseStatus: () => {
            return request({
                url: '/api/greenhouse/status/all',
                method: 'get'
            });
        },
        getAbnormalStats: (params) => {
            return request({
                url: '/api/greenhouse-environment-history/abnormal-stats',
                method: 'get',
                params
            });
        }
    };
}
