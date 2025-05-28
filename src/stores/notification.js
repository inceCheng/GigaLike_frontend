import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const isConnected = ref(false)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const total = ref(0)
  const hasMore = ref(true)

  // 计算属性
  const hasUnread = computed(() => unreadCount.value > 0)

  // 操作方法
  const loadNotifications = async (params = {}, append = false) => {
    loading.value = true
    try {
      const requestParams = {
        current: append ? currentPage.value : 1,
        pageSize: pageSize.value,
        ...params
      }
      
      const response = await api.getNotificationList(requestParams)
      if (response.data.code === 0) {
        const data = response.data.data
        
        if (append) {
          notifications.value = [...notifications.value, ...data.records]
        } else {
          notifications.value = data.records
          currentPage.value = 1
        }
        
        total.value = data.total
        hasMore.value = data.current < data.pages
        
        if (append) {
          currentPage.value++
        }
        
        return data
      } else {
        throw new Error(response.data.message || '获取通知列表失败')
      }
    } catch (error) {
      console.error('加载通知失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const loadMoreNotifications = async (params = {}) => {
    if (!hasMore.value || loading.value) return
    return await loadNotifications(params, true)
  }

  const loadUnreadCount = async () => {
    try {
      const response = await api.getUnreadNotificationCount()
      if (response.data.code === 0) {
        unreadCount.value = response.data.data
        return response.data.data
      } else {
        throw new Error(response.data.message || '获取未读数量失败')
      }
    } catch (error) {
      console.error('获取未读数量失败:', error)
      throw error
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await api.markNotificationAsRead(notificationId)
      if (response.data.code === 0) {
        // 更新本地状态
        const notification = notifications.value.find(n => n.id === notificationId)
        if (notification && notification.isRead === 0) {
          notification.isRead = 1
          notification.readTime = new Date().toISOString()
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        return true
      } else {
        throw new Error(response.data.message || '标记已读失败')
      }
    } catch (error) {
      console.error('标记已读失败:', error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await api.markAllNotificationsAsRead()
      if (response.data.code === 0) {
        // 更新本地状态
        notifications.value.forEach(n => {
          if (n.isRead === 0) {
            n.isRead = 1
            n.readTime = new Date().toISOString()
          }
        })
        unreadCount.value = 0
        return true
      } else {
        throw new Error(response.data.message || '批量标记已读失败')
      }
    } catch (error) {
      console.error('批量标记已读失败:', error)
      throw error
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const response = await api.deleteNotification(notificationId)
      if (response.data.code === 0) {
        // 从列表中移除
        const index = notifications.value.findIndex(n => n.id === notificationId)
        if (index > -1) {
          const notification = notifications.value[index]
          notifications.value.splice(index, 1)
          total.value = Math.max(0, total.value - 1)
          
          // 如果删除的是未读通知，更新未读数量
          if (notification.isRead === 0) {
            unreadCount.value = Math.max(0, unreadCount.value - 1)
          }
        }
        return true
      } else {
        throw new Error(response.data.message || '删除通知失败')
      }
    } catch (error) {
      console.error('删除通知失败:', error)
      throw error
    }
  }

  const addNotification = (notification) => {
    // 添加新通知到列表顶部
    notifications.value.unshift(notification)
    total.value++
    
    // 如果是未读通知，更新未读数量
    if (notification.isRead === 0) {
      unreadCount.value++
    }
  }

  const updateConnectionStatus = (connected) => {
    isConnected.value = connected
  }

  const reset = () => {
    notifications.value = []
    unreadCount.value = 0
    loading.value = false
    isConnected.value = false
    currentPage.value = 1
    total.value = 0
    hasMore.value = true
  }

  // 格式化时间的辅助方法
  const formatTime = (timeStr) => {
    const time = new Date(timeStr)
    const now = new Date()
    const diff = now - time
    
    if (diff < 60000) { // 1分钟内
      return '刚刚'
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) { // 1天内
      return `${Math.floor(diff / 3600000)}小时前`
    } else if (diff < 604800000) { // 1周内
      return `${Math.floor(diff / 86400000)}天前`
    } else {
      return time.toLocaleDateString()
    }
  }

  // 获取通知类型名称
  const getNotificationTypeName = (type) => {
    const typeMap = {
      'LIKE': '点赞',
      'COMMENT': '评论',
      'FOLLOW': '关注',
      'SYSTEM': '系统'
    }
    return typeMap[type] || '通知'
  }

  // 获取通知类型图标
  const getNotificationTypeIcon = (type) => {
    const iconMap = {
      'LIKE': 'fa-heart',
      'COMMENT': 'fa-comment',
      'FOLLOW': 'fa-user-plus',
      'SYSTEM': 'fa-bell'
    }
    return iconMap[type] || 'fa-bell'
  }

  // 获取通知类型颜色
  const getNotificationTypeColor = (type) => {
    const colorMap = {
      'LIKE': '#ff2e51',
      'COMMENT': '#1890ff',
      'FOLLOW': '#52c41a',
      'SYSTEM': '#faad14'
    }
    return colorMap[type] || '#666'
  }

  return {
    // 状态
    notifications,
    unreadCount,
    loading,
    isConnected,
    currentPage,
    pageSize,
    total,
    hasMore,
    
    // 计算属性
    hasUnread,
    
    // 方法
    loadNotifications,
    loadMoreNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    updateConnectionStatus,
    reset,
    
    // 辅助方法
    formatTime,
    getNotificationTypeName,
    getNotificationTypeIcon,
    getNotificationTypeColor
  }
}) 