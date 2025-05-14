import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // You can change the port if needed
    host: true, // 允许从网络访问
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