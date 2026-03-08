import request from '/@/utils/request';
/**
 * 预测管理API接口集合
 * @method getFileNames 获取文件列表
 * @method imgPredict 图片预测
 * @method stopCamera 停止摄像头
 */
export function usePredictApi() {
    return {
        getFileNames: () => {
            return request({
                url: '/api/flask/file_names',
                method: 'get'
            });
        },
        imgPredict: (data) => {
            return request({
                url: '/api/flask/predict',
                method: 'post',
                data
            });
        },
        stopCamera: () => {
            return request({
                url: '/flask/stopCamera',
                method: 'get'
            });
        }
    };
}
