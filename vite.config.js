import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173, // You can change the port if needed
    host: '0.0.0.0',  // 允许外部访问
    allowedHosts: [
      'ince.natapp1.cc',  // 添加你的内网穿透域名
      'localhost',
    ],
    strictPort: true, // 如果端口被占用，则退出而不是尝试另一个端口
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: 'http://localhost:8123', // Your backend server address
        changeOrigin: true,
      }
    }
  }
}) 