import request from '/@/utils/request';
/**
 * 用户管理API接口集合
 * @method getUserList 获取用户列表
 * @method getUserDetail 获取用户详情
 * @method addUser 添加用户
 * @method updateUser 更新用户
 * @method deleteUser 删除用户
 * @method login 用户登录
 * @method register 用户注册
 */
export function useUserApi() {
    return {
        getUserList: (params) => {
            return request({
                url: '/api/user',
                method: 'get',
                params
            });
        },
        getUserDetail: (username) => {
            return request({
                url: `/api/user/${username}`,
                method: 'get'
            });
        },
        addUser: (data) => {
            return request({
                url: '/api/user',
                method: 'post',
                data
            });
        },
        updateUser: (data) => {
            return request({
                url: '/api/user/update',
                method: 'post',
                data
            });
        },
        deleteUser: (id) => {
            return request({
                url: `/api/user/${id}`,
                method: 'delete'
            });
        },
        login: (data) => {
            return request({
                url: '/api/user/login',
                method: 'post',
                data
            });
        },
        register: (data) => {
            return request({
                url: '/api/user/register',
                method: 'post',
                data
            });
        }
    };
}
