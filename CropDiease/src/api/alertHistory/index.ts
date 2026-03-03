import request from '/@/utils/request';

/**
 * 温室告警历史API接口集合
 * @method getAlertHistoryList 分页查询告警历史
 * @method getAlertHistoryAll 获取所有告警历史
 * @method getAlertHistoryById 根据ID获取告警历史
 * @method getAlertHistoryByGreenhouseId 根据温室ID获取告警历史
 * @method getUnresolvedAlerts 获取所有未解决告警
 * @method getUnresolvedAlertsByGreenhouseId 获取指定温室的未解决告警
 * @method addAlertHistory 新增告警记录
 * @method updateAlertHistory 更新告警记录
 * @method deleteAlertHistory 删除告警记录
 * @method confirmAlert 确认告警
 * @method handleAlert 开始处理告警
 * @method resolveAlert 解决告警
 * @method archiveAlert 归档告警
 * @method markFalseAlarm 标记为误报
 */
export function useAlertHistoryApi() {
    return {
        // 基础CRUD接口
        getAlertHistoryList: (params: object) => {
            return request({
                url: '/api/greenhouse-alert-history',
                method: 'get',
                params
            });
        },
        getAlertHistoryAll: () => {
            return request({
                url: '/api/greenhouse-alert-history/all',
                method: 'get'
            });
        },
        getAlertHistoryById: (id: string) => {
            return request({
                url: `/api/greenhouse-alert-history/${id}`,
                method: 'get'
            });
        },
        getAlertHistoryByGreenhouseId: (greenhouseId: string) => {
            return request({
                url: `/api/greenhouse-alert-history/greenhouse/${greenhouseId}`,
                method: 'get'
            });
        },
        addAlertHistory: (data: object) => {
            return request({
                url: '/api/greenhouse-alert-history',
                method: 'post',
                data
            });
        },
        updateAlertHistory: (data: object) => {
            return request({
                url: '/api/greenhouse-alert-history/update',
                method: 'post',
                data
            });
        },
        deleteAlertHistory: (id: string) => {
            return request({
                url: `/api/greenhouse-alert-history/${id}`,
                method: 'delete'
            });
        },

        // 业务接口
        getUnresolvedAlerts: () => {
            return request({
                url: '/api/greenhouse-alert-history/unresolved',
                method: 'get'
            });
        },
        getUnresolvedAlertsByGreenhouseId: (greenhouseId: string) => {
            return request({
                url: `/api/greenhouse-alert-history/greenhouse/${greenhouseId}/unresolved`,
                method: 'get'
            });
        },

        // 处理流程接口
        confirmAlert: (id: string, confirmBy: string) => {
            return request({
                url: `/api/greenhouse-alert-history/${id}/confirm`,
                method: 'post',
                params: { confirmBy }
            });
        },
        handleAlert: (id: string, params: {
            handleBy: string;
            handleMethod: string;
            handleAction: string;
            handleResult: string;
        }) => {
            return request({
                url: `/api/greenhouse-alert-history/${id}/handle`,
                method: 'post',
                params
            });
        },
        resolveAlert: (id: string, params: {
            resolveBy: string;
            resolveMethod: string;
            resolveRemark: string;
        }) => {
            return request({
                url: `/api/greenhouse-alert-history/${id}/resolve`,
                method: 'post',
                params
            });
        },
        archiveAlert: (id: string) => {
            return request({
                url: `/api/greenhouse-alert-history/${id}/archive`,
                method: 'post'
            });
        },
        markFalseAlarm: (id: string, remark: string) => {
            return request({
                url: `/api/greenhouse-alert-history/${id}/mark-false-alarm`,
                method: 'post',
                params: { remark }
            });
        }
    };
}
