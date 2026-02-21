import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '/@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8100,
    proxy: {
      '/api': {
				//设置拦截器  拦截器格式   斜杠+拦截器名字，名字可以自己定
				target: 'http://localhost:9999/', //代理的目标地址
				ws: true,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
			'/flask': {
				//设置拦截器  拦截器格式   斜杠+拦截器名字，名字可以自己定
				target: 'http://localhost:5000/', //代理的目标地址
				ws: true,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/flask/, ''),
			}
    }
  }
})
