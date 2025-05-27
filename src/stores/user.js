import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '@/services/axios'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref(null)
  const avatarVersion = ref(Date.now()) // 头像版本号，用于强制刷新
  const isLoggedIn = computed(() => !!user.value)
  
  // 从localStorage初始化用户状态
  const initializeFromStorage = () => {
    const storedUserId = localStorage.getItem('gigaLikeUserId')
    const storedUser = localStorage.getItem('gigaLikeUser')
    
    if (storedUserId && storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (error) {
        console.error('Failed to parse stored user data:', error)
        clearUserData()
      }
    }
  }
  
  // 设置用户信息
  const setUser = (userData) => {
    user.value = userData
    localStorage.setItem('gigaLikeUserId', userData.id.toString())
    localStorage.setItem('gigaLikeUser', JSON.stringify(userData))
  }
  
  // 清除用户数据
  const clearUserData = () => {
    user.value = null
    localStorage.removeItem('gigaLikeUserId')
    localStorage.removeItem('gigaLikeUser')
  }
  
  // 登录
  const login = async (credentials) => {
    try {
      const response = await apiClient.post('/user/login', credentials)
      
      if (response.data.code === 0) {
        setUser(response.data.data)
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.message || '登录失败' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: '登录失败，请稍后重试' }
    }
  }
  
  // 退出登录
  const logout = async () => {
    try {
      await apiClient.get('/user/logout')
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      clearUserData()
    }
  }
  
  // 验证当前session是否有效
  const validateSession = async () => {
    if (!user.value) {
      return false
    }
    
    try {
      const response = await apiClient.get('/user/current')
      
      if (response.data.code === 0) {
        // Session有效，更新用户信息
        setUser(response.data.data)
        return true
      } else {
        // Session无效，清除本地数据
        clearUserData()
        return false
      }
    } catch (error) {
      console.error('Session validation error:', error)
      // 如果是401或403错误，说明session过期
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        clearUserData()
        return false
      }
      // 其他错误可能是网络问题，暂时保持登录状态
      return true
    }
  }
  
  // 更新用户信息
  const updateUserInfo = async (updateData) => {
    try {
      const response = await apiClient.post('/user/update', updateData)
      
      if (response.data.code === 0) {
        // 如果更新了头像，更新版本号
        if (updateData.avatarUrl && updateData.avatarUrl !== user.value?.avatarUrl) {
          avatarVersion.value = Date.now()
        }
        setUser(response.data.data)
        return { success: true, data: response.data.data }
      } else {
        return { success: false, message: response.data.message || '更新失败' }
      }
    } catch (error) {
      console.error('Update user info error:', error)
      return { success: false, message: '更新失败，请稍后重试' }
    }
  }
  
  // 更新头像版本号（用于强制刷新头像）
  const updateAvatarVersion = () => {
    avatarVersion.value = Date.now()
  }
  
  // 获取当前用户ID
  const getCurrentUserId = computed(() => {
    return user.value?.id || null
  })
  
  return {
    // 状态
    user,
    avatarVersion,
    isLoggedIn,
    getCurrentUserId,
    
    // 方法
    initializeFromStorage,
    setUser,
    clearUserData,
    login,
    logout,
    validateSession,
    updateUserInfo,
    updateAvatarVersion
  }
}) 