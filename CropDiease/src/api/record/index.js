import request from '/@/utils/request';
/**
 * 记录管理API接口集合
 * @method addImgRecord 新增图片记录
 * @method getImgRecordList 获取图片识别记录列表
 * @method getImgRecordDetail 获取图片识别记录详情
 * @method deleteImgRecord 删除图片识别记录
 * @method getCameraRecordList 获取摄像识别记录列表
 * @method getCameraRecordDetail 获取摄像识别记录详情
 * @method deleteCameraRecord 删除摄像识别记录
 * @method getVideoRecordList 获取视频识别记录列表
 * @method getVideoRecordDetail 获取视频识别记录详情
 * @method deleteVideoRecord 删除视频识别记录
 */
export function useRecordApi() {
    return {
        // 图片识别记录
        getImgRecordList: (params) => {
            return request({
                url: '/api/imgRecords',
                method: 'get',
                params
            });
        },
        addImgRecord: (data) => {
            return request({
                url: '/api/imgRecords',
                method: 'post',
                data
            });
        },
        getImgRecordDetail: (id) => {
            return request({
                url: `/api/imgRecords/${id}`,
                method: 'get'
            });
        },
        deleteImgRecord: (id) => {
            return request({
                url: `/api/imgRecords/${id}`,
                method: 'delete'
            });
        },
        // 摄像识别记录
        getCameraRecordList: (params) => {
            return request({
                url: '/api/cameraRecords',
                method: 'get',
                params
            });
        },
        getCameraRecordDetail: (id) => {
            return request({
                url: `/api/cameraRecords/${id}`,
                method: 'get'
            });
        },
        deleteCameraRecord: (id) => {
            return request({
                url: `/api/cameraRecords/${id}`,
                method: 'delete'
            });
        },
        // 视频识别记录
        getVideoRecordList: (params) => {
            return request({
                url: '/api/videoRecords',
                method: 'get',
                params
            });
        },
        getVideoRecordDetail: (id) => {
            return request({
                url: `/api/videoRecords/${id}`,
                method: 'get'
            });
        },
        deleteVideoRecord: (id) => {
            return request({
                url: `/api/videoRecords/${id}`,
                method: 'delete'
            });
        },
        // 获取所有温室检测记录（用于病虫害类型分布统计）
        getAllGreenhouseDetections: () => {
            return request({
                url: '/api/greenhouseDetection/all',
                method: 'get'
            });
        },
        // 获取病虫害识别汇总列表
        getPestDetectionList: (params) => {
            return request({
                url: '/api/pest-detection/list',
                method: 'get',
                params
            });
        },
        // 获取未解决的告警历史记录
        getUnresolvedAlerts: () => {
            return request({
                url: '/api/greenhouse-alert-history/unresolved',
                method: 'get'
            });
        }
    };
}
