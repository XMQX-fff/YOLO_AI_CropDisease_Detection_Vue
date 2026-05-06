/**
 * 支付宝沙箱环境配置
 * 注意：这些配置仅用于前端展示和跳转，实际支付签名应在后端完成
 */

// 支付宝沙箱环境配置
export const ALIPAY_CONFIG = {
  // 沙箱网关地址
  GATEWAY_URL: 'https://openapi-sandbox.dl.alipaydev.com/gateway.do',

  // 支付宝沙箱APPID
  APP_ID: '9021000162663090',

  // 支付宝公钥（用于验证支付宝返回的签名）
  ALIPAY_PUBLIC_KEY: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkim8Eus3q3/acNLbhQjdse90NpLyFNhZ0r8PZVzO/8ON/VR7GkOswbtegPRnTMgYZDCgO4tuDdfy3uAPwIlGAn6qBoQ4CRcSH7F3FFEiqyx/fqmvXoYhiC8ZwUrkMTZazPBQj5QTSFldPo6V3bRYRTfzylmW8uGDMOXymQegmuhpckP9miYYCuOUPaP/zdvO9zCZFKE1RW7fe0Yv+u6uzPFjvzO6oThHg+tis6lVzqduNT5ZwlnkbDZUGC0PYGjm3/jIvrbBG+yH39YfQecDkYKag2HB3ZVxQxW1ySsACUoK5tHvyvIIU5bA7kTrePsntr0oW+y7g6deqK8IYk2FtQIDAQAB',

  // 字符编码
  CHARSET: 'UTF-8',

  // 签名方式
  SIGN_TYPE: 'RSA2',

  // 返回格式
  FORMAT: 'JSON',

  // 接口版本
  VERSION: '1.0',

  // 页面跳转同步通知页面路径
  RETURN_URL: window.location.origin + '/shop/order/pay/return'
};

// 支付方式配置
export const PAYMENT_METHODS = {
  ALIPAY: {
    code: 'alipay',
    name: '支付宝',
    icon: 'Wallet',
    color: '#1677FF'
  },
  WECHAT: {
    code: 'wechat',
    name: '微信支付',
    icon: 'ChatDotRound',
    color: '#07C160'
  }
};

// 支付状态
export const PAYMENT_STATUS = {
  PENDING: 'pending',      // 待支付
  PROCESSING: 'processing', // 支付中
  SUCCESS: 'success',      // 支付成功
  FAILED: 'failed',        // 支付失败
  CANCELLED: 'cancelled',  // 已取消
  TIMEOUT: 'timeout'       // 支付超时
};

// 支付宝沙箱测试账号
export const SANDBOX_ACCOUNTS = {
  // 买家账号
  BUYER: {
    username: 'vllukj8549@sandbox.com',
    password: '111111',
    payPassword: '111111'
  }
};
