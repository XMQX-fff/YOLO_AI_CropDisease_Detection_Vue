import request from '/@/utils/request';

/**
 * 记录管理API接口集合
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
        getImgRecordList: (params: object) => {
            return request({
                url: '/api/imgRecords',
                method: 'get',
                params
            });
        },
        getImgRecordDetail: (id: string) => {
            return request({
                url: `/api/imgRecords/${id}`,
                method: 'get'
            });
        },
        deleteImgRecord: (id: string) => {
            return request({
                url: `/api/imgRecords/${id}`,
                method: 'delete'
            });
        },
        // 摄像识别记录
        getCameraRecordList: (params: object) => {
            return request({
                url: '/api/cameraRecords',
                method: 'get',
                params
            });
        },
        getCameraRecordDetail: (id: string) => {
            return request({
                url: `/api/cameraRecords/${id}`,
                method: 'get'
            });
        },
        deleteCameraRecord: (id: string) => {
            return request({
                url: `/api/cameraRecords/${id}`,
                method: 'delete'
            });
        },
        // 视频识别记录
        getVideoRecordList: (params: object) => {
            return request({
                url: '/api/videoRecords',
                method: 'get',
                params
            });
        },
        getVideoRecordDetail: (id: string) => {
            return request({
                url: `/api/videoRecords/${id}`,
                method: 'get'
            });
        },
        deleteVideoRecord: (id: string) => {
            return request({
                url: `/api/videoRecords/${id}`,
                method: 'delete'
            });
        }
    };
}