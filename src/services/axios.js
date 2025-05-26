import axios from 'axios'
import { useUserStore } from '@/stores/user'
import router from '@/router'

// 创建axios实例
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true // 确保发送cookies
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加token或其他认证信息
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const userStore = useUserStore()
    
    // 处理401和403错误（未授权/session过期）
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Session expired, clearing user data and redirecting to login')
      
      // 清除用户数据
      userStore.clearUserData()
      
      // 如果当前不在登录页面，则跳转到登录页面
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient 