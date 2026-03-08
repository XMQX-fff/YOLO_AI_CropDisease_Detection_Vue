import request from '/@/utils/request';
/**
 * 温室告警规则API接口集合
 * @method getAlertRuleList 分页查询告警规则
 * @method getAlertRuleAll 获取所有告警规则
 * @method getAlertRuleById 根据ID获取告警规则
 * @method getAlertRuleByGreenhouseId 根据温室ID获取告警规则
 * @method getEnabledAlertRules 获取所有启用的告警规则
 * @method addAlertRule 新增告警规则
 * @method updateAlertRule 更新告警规则
 * @method deleteAlertRule 删除告警规则
 * @method toggleAlertRule 切换规则启用/禁用状态
 */
export function useAlertRuleApi() {
    return {
        getAlertRuleList: (params) => {
            return request({
                url: '/api/greenhouse-alert-rule',
                method: 'get',
                params
            });
        },
        getAlertRuleAll: () => {
            return request({
                url: '/api/greenhouse-alert-rule/all',
                method: 'get'
            });
        },
        getAlertRuleById: (id) => {
            return request({
                url: `/api/greenhouse-alert-rule/${id}`,
                method: 'get'
            });
        },
        getAlertRuleByGreenhouseId: (greenhouseId) => {
            return request({
                url: `/api/greenhouse-alert-rule/greenhouse/${greenhouseId}`,
                method: 'get'
            });
        },
        getEnabledAlertRules: () => {
            return request({
                url: '/api/greenhouse-alert-rule/enabled',
                method: 'get'
            });
        },
        addAlertRule: (data) => {
            return request({
                url: '/api/greenhouse-alert-rule',
                method: 'post',
                data
            });
        },
        updateAlertRule: (data) => {
            return request({
                url: '/api/greenhouse-alert-rule/update',
                method: 'post',
                data
            });
        },
        deleteAlertRule: (id) => {
            return request({
                url: `/api/greenhouse-alert-rule/${id}`,
                method: 'delete'
            });
        },
        toggleAlertRule: (id) => {
            return request({
                url: `/api/greenhouse-alert-rule/toggle/${id}`,
                method: 'post'
            });
        }
    };
}
