import request from '/@/utils/request';
/**
 * 疾病管理API接口集合
 * @method getDiseaseList 获取疾病列表
 * @method getDiseaseDetail 获取疾病详情
 * @method addDisease 添加疾病
 * @method updateDisease 更新疾病
 * @method deleteDisease 删除疾病
 */
export function useDiseaseApi() {
    return {
        getDiseaseList: (params) => {
            return request({
                url: '/api/disease',
                method: 'get',
                params
            });
        },
        getDiseaseDetail: (id) => {
            return request({
                url: `/api/disease/${id}`,
                method: 'get'
            });
        },
        addDisease: (data) => {
            return request({
                url: '/api/disease',
                method: 'post',
                data
            });
        },
        updateDisease: (data) => {
            return request({
                url: '/api/disease',
                method: 'put',
                data
            });
        },
        deleteDisease: (id) => {
            return request({
                url: `/api/disease/${id}`,
                method: 'delete'
            });
        }
    };
}
