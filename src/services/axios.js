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
    // 处理大整数精度问题：确保大整数以字符串形式发送
    // 但是跳过FormData对象，因为它们不需要JSON序列化
    if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      config.data = JSON.parse(JSON.stringify(config.data, (key, value) => {
        // 如果是数字且超过安全整数范围，转换为字符串
        if (typeof value === 'number' && (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER)) {
          return String(value)
        }
        return value
      }))
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 处理响应中的大整数，确保它们保持为字符串格式
    if (response.data && typeof response.data === 'object') {
      response.data = JSON.parse(JSON.stringify(response.data, (key, value) => {
        // 如果是看起来像大整数的字符串，保持为字符串
        if (typeof value === 'string' && /^\d{15,}$/.test(value)) {
          return value
        }
        return value
      }))
    }
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