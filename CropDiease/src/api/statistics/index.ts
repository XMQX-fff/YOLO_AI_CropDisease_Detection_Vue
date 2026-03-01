import request from '/@/utils/request';

/**
 * 统计数据API接口集合
 * @method getStatisticsOverview 获取统计概览信息
 */
export function useStatisticsApi() {
    return {
        getStatisticsOverview: () => {
            return request({
                url: '/api/statistics/overview',
                method: 'get'
            });
        }
    };
}
