import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 修复Edge浏览器最小化后立即弹出的问题
const originalReplaceState = window.history.replaceState
window.history.replaceState = function (state, title, url) {
  console.log('🚨 history.replaceState 被调用，已拦截')
  // 调用原始方法但传入null作为state参数
  return originalReplaceState.call(this, null, title || '', url || '')
}

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
