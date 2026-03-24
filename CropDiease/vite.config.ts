import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

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
				target: 'http://localhost:9999/',
				ws: true,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
			'/flask': {
				target: 'http://localhost:5000/',
				ws: true,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/flask/, ''),
			},
			'/ai-api': {
				target: 'http://localhost:8080/api',
				ws: true,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/ai-api/, ''),
			}
    }
  }
})
