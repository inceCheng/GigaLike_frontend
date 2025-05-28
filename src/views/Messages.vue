<template>
  <div class="messages-container">
    <!-- 页面头部 -->
    <div class="messages-header">
      <div class="header-left">
        <h1>消息通知</h1>
        <div class="connection-status" :class="{ connected: notificationStore.isConnected }">
          <i class="fa-solid fa-circle"></i>
          {{ notificationStore.isConnected ? '实时连接' : '连接断开' }}
          <button 
            v-if="!notificationStore.isConnected && userStore.isLoggedIn"
            class="reconnect-btn"
            @click="handleReconnect"
            title="重新连接"
          >
            <i class="fa-solid fa-refresh"></i>
          </button>
        </div>
      </div>
      
      <div class="header-actions">
        <button 
          class="action-btn refresh-btn"
          @click="handleRefresh"
          :disabled="notificationStore.loading"
          title="刷新消息"
        >
          <i class="fa-solid fa-refresh" :class="{ 'fa-spin': refreshing }"></i>
          刷新
        </button>
        
        <button 
          class="action-btn mark-all-btn"
          @click="handleMarkAllAsRead"
          :disabled="!notificationStore.hasUnread || notificationStore.loading"
        >
          <i class="fa-solid fa-check-double"></i>
          全部已读
        </button>
        
        <div class="unread-count" v-if="notificationStore.hasUnread">
          {{ notificationStore.unreadCount }} 条未读
        </div>
      </div>
    </div>

    <!-- 筛选器 -->
    <div class="messages-filters">
      <div class="filter-tabs">
        <button 
          v-for="filter in filters" 
          :key="filter.key"
          class="filter-tab"
          :class="{ active: currentFilter === filter.key }"
          @click="handleFilterChange(filter.key)"
        >
          <i :class="['fa-solid', filter.icon]"></i>
          {{ filter.label }}
          <span v-if="filter.key === 'unread' && notificationStore.unreadCount > 0" class="filter-badge">
            {{ notificationStore.unreadCount }}
          </span>
        </button>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="messages-content">
      <!-- 加载状态 -->
      <div v-if="notificationStore.loading && notificationStore.notifications.length === 0" class="loading-state">
        <div class="loading-spinner">
          <i class="fa-solid fa-spinner fa-spin"></i>
        </div>
        <p>加载中...</p>
      </div>

      <!-- 通知列表 -->
      <div v-else-if="notificationStore.notifications.length > 0" class="notifications-list">
        <div 
          v-for="notification in notificationStore.notifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 
            'unread': notification.isRead === 0,
            'clickable': isClickableNotification(notification)
          }"
          @click="handleNotificationClick(notification)"
        >
          <!-- 通知图标 -->
          <div class="notification-icon">
            <i 
              :class="['fa-solid', notificationStore.getNotificationTypeIcon(notification.type)]"
              :style="{ color: notificationStore.getNotificationTypeColor(notification.type) }"
            ></i>
          </div>

          <!-- 发送者头像 -->
          <div class="notification-avatar" v-if="notification.sender">
            <img 
              :src="notification.sender.avatarUrl || '/images/default-avatar.png'" 
              :alt="notification.sender.displayName || notification.sender.username"
              @error="handleAvatarError"
            />
          </div>

          <!-- 通知内容 -->
          <div class="notification-body">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-content">{{ notification.content }}</div>
            <div class="notification-meta">
              <span class="notification-type">
                {{ notificationStore.getNotificationTypeName(notification.type) }}
              </span>
              <span class="notification-time">
                {{ notificationStore.formatTime(notification.createTime) }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="notification-actions">
            <button 
              v-if="notification.isRead === 0"
              class="action-btn read-btn"
              @click.stop="handleMarkAsRead(notification.id)"
              title="标记已读"
            >
              <i class="fa-solid fa-check"></i>
            </button>
            
            <button 
              class="action-btn delete-btn"
              @click.stop="handleDeleteNotification(notification.id)"
              title="删除通知"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>

          <!-- 未读指示器 -->
          <div v-if="notification.isRead === 0" class="unread-indicator"></div>
        </div>

        <!-- 加载更多 -->
        <div class="load-more-container" v-if="notificationStore.hasMore">
          <button 
            class="load-more-btn"
            @click="handleLoadMore"
            :disabled="notificationStore.loading"
          >
            <i v-if="notificationStore.loading" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-chevron-down"></i>
            {{ notificationStore.loading ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <i class="fa-solid fa-bell"></i>
        </div>
        <h3>{{ getEmptyStateTitle() }}</h3>
        <p>{{ getEmptyStateDescription() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import { notificationWS, requestNotificationPermission } from '@/services/notificationWebSocket'

const router = useRouter()
const notificationStore = useNotificationStore()
const userStore = useUserStore()

const currentFilter = ref('all')
const refreshing = ref(false)
const filters = [
  { key: 'all', label: '全部', icon: 'fa-list' },
  { key: 'unread', label: '未读', icon: 'fa-circle' },
  { key: 'LIKE', label: '点赞', icon: 'fa-heart' },
  { key: 'COMMENT', label: '评论', icon: 'fa-comment' },
  { key: 'FOLLOW', label: '关注', icon: 'fa-user-plus' },
  { key: 'SYSTEM', label: '系统', icon: 'fa-bell' }
]

let unsubscribeWS = null
let windowFocusHandler = null

// 计算当前筛选参数
const currentFilterParams = computed(() => {
  const params = {}
  
  if (currentFilter.value === 'unread') {
    params.isRead = 0
  } else if (currentFilter.value !== 'all') {
    params.type = currentFilter.value
  }
  
  return params
})

// 初始化
const init = async () => {
  try {
    // 请求浏览器通知权限
    await requestNotificationPermission()
    
    // 确保WebSocket连接
    await ensureWebSocketConnection()
    
    // 加载通知列表
    await loadNotifications()
    
    // 加载未读数量
    await notificationStore.loadUnreadCount()
  } catch (error) {
    console.error('初始化失败:', error)
  }
}

// 确保WebSocket连接
const ensureWebSocketConnection = async () => {
  if (!userStore.user?.id) {
    console.warn('用户未登录，无法建立WebSocket连接')
    return
  }
  
  // 检查连接状态
  if (!notificationWS.isConnected()) {
    console.log('WebSocket未连接，正在建立连接...')
    
    // 如果还没有订阅，先订阅
    if (!unsubscribeWS) {
      connectWebSocket()
    } else {
      // 如果已经订阅但连接断开，直接重连
      notificationWS.connect(userStore.user.id)
    }
  } else {
    console.log('WebSocket连接正常')
  }
}

// 连接WebSocket
const connectWebSocket = () => {
  if (!userStore.user?.id) return
  
  // 订阅WebSocket消息
  unsubscribeWS = notificationWS.subscribe((message) => {
    switch (message.type) {
      case 'NOTIFICATION':
        handleNewNotification(message.data)
        break
      case 'CONNECTION_STATUS':
        notificationStore.updateConnectionStatus(message.data.connected)
        break
      case 'BROADCAST':
        handleBroadcast(message.data)
        break
    }
  })
  
  // 连接WebSocket
  notificationWS.connect(userStore.user.id)
}

// 处理新通知
const handleNewNotification = (notification) => {
  // 添加到通知列表
  notificationStore.addNotification(notification)
  
  // 如果当前筛选条件匹配，显示在列表中
  const params = currentFilterParams.value
  const shouldShow = (
    (!params.isRead || notification.isRead === params.isRead) &&
    (!params.type || notification.type === params.type)
  )
  
  if (!shouldShow) {
    // 如果不匹配当前筛选，从列表中移除（但保留在store中）
    const index = notificationStore.notifications.findIndex(n => n.id === notification.id)
    if (index > -1) {
      notificationStore.notifications.splice(index, 1)
    }
  }
}

// 处理系统广播
const handleBroadcast = (broadcast) => {
  // 可以在这里显示系统广播消息
  console.log('收到系统广播:', broadcast)
}

// 加载通知列表
const loadNotifications = async () => {
  try {
    await notificationStore.loadNotifications(currentFilterParams.value)
  } catch (error) {
    console.error('加载通知失败:', error)
  }
}

// 加载更多
const handleLoadMore = async () => {
  try {
    await notificationStore.loadMoreNotifications(currentFilterParams.value)
  } catch (error) {
    console.error('加载更多失败:', error)
  }
}

// 筛选器变化
const handleFilterChange = async (filterKey) => {
  if (currentFilter.value === filterKey) return
  
  currentFilter.value = filterKey
  await loadNotifications()
}

// 标记单个通知为已读
const handleMarkAsRead = async (notificationId) => {
  try {
    await notificationStore.markAsRead(notificationId)
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 标记全部为已读
const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('批量标记已读失败:', error)
  }
}

// 删除通知
const handleDeleteNotification = async (notificationId) => {
  try {
    await notificationStore.deleteNotification(notificationId)
  } catch (error) {
    console.error('删除通知失败:', error)
  }
}

// 点击通知
const handleNotificationClick = async (notification) => {
  // 标记为已读
  if (notification.isRead === 0) {
    await handleMarkAsRead(notification.id)
  }
  
  // 根据通知类型跳转
  handleNavigation(notification)
}

// 处理导航跳转
const handleNavigation = (notification) => {
  const { type, relatedId, relatedType, sender } = notification
  
  switch (type) {
    case 'LIKE':
    case 'COMMENT':
      // 跳转到博客详情页
      if (relatedId && relatedType === 'BLOG') {
        router.push(`/blog/${relatedId}`)
      }
      break
    case 'FOLLOW':
      // 跳转到用户主页
      if (sender?.id) {
        router.push(`/user/${sender.id}`)
      }
      break
    default:
      // 其他类型暂不跳转
      break
  }
}

// 判断通知是否可点击
const isClickableNotification = (notification) => {
  const { type, relatedId, relatedType, sender } = notification
  
  switch (type) {
    case 'LIKE':
    case 'COMMENT':
      return relatedId && relatedType === 'BLOG'
    case 'FOLLOW':
      return sender?.id
    default:
      return false
  }
}

// 头像错误处理
const handleAvatarError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

// 获取空状态标题
const getEmptyStateTitle = () => {
  switch (currentFilter.value) {
    case 'unread':
      return '没有未读消息'
    case 'LIKE':
      return '没有点赞消息'
    case 'COMMENT':
      return '没有评论消息'
    case 'FOLLOW':
      return '没有关注消息'
    case 'SYSTEM':
      return '没有系统消息'
    default:
      return '暂无消息'
  }
}

// 获取空状态描述
const getEmptyStateDescription = () => {
  switch (currentFilter.value) {
    case 'unread':
      return '所有消息都已阅读'
    case 'LIKE':
      return '当有人点赞你的内容时，会在这里显示'
    case 'COMMENT':
      return '当有人评论你的内容时，会在这里显示'
    case 'FOLLOW':
      return '当有人关注你时，会在这里显示'
    case 'SYSTEM':
      return '系统通知会在这里显示'
    default:
      return '当有新消息时，会在这里显示'
  }
}

// 刷新消息列表
const handleRefresh = async () => {
  refreshing.value = true
  try {
    // 确保WebSocket连接
    await ensureWebSocketConnection()
    
    // 重新加载通知列表
    await loadNotifications()
    
    // 重新加载未读数量
    await notificationStore.loadUnreadCount()
    
    // 可选：显示刷新成功提示
    // message.success('消息列表已刷新')
  } catch (error) {
    console.error('刷新消息失败:', error)
    // message.error('刷新失败，请稍后重试')
  } finally {
    refreshing.value = false
  }
}

// 重新连接
const handleReconnect = async () => {
  try {
    // 确保WebSocket连接
    await ensureWebSocketConnection()
    
    // 重新加载通知列表
    await loadNotifications()
    
    // 重新加载未读数量
    await notificationStore.loadUnreadCount()
    
    // 可选：显示重新连接成功提示
    // message.success('已重新连接')
  } catch (error) {
    console.error('重新连接失败:', error)
    // message.error('重新连接失败，请稍后重试')
  }
}

onMounted(() => {
  // 自动加载通知列表
  init()
  
  // 监听窗口焦点事件，确保连接状态
  windowFocusHandler = () => {
    if (userStore.isLoggedIn) {
      ensureWebSocketConnection()
    }
  }
  
  window.addEventListener('focus', windowFocusHandler)
})

onUnmounted(() => {
  // 取消WebSocket订阅
  if (unsubscribeWS) {
    unsubscribeWS()
  }
  
  // 清理窗口焦点事件监听
  if (windowFocusHandler) {
    window.removeEventListener('focus', windowFocusHandler)
  }
})
</script>

<style scoped>
.messages-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 140px);
}

/* 页面头部 */
.messages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #999;
}

.connection-status.connected {
  color: #52c41a;
}

.connection-status i {
  font-size: 8px;
}

.reconnect-btn {
  margin-left: 8px;
  background: none;
  border: 1px solid #ff4d4f;
  color: #ff4d4f;
  border-radius: 4px;
  padding: 2px 6px;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.2s ease;
}

.reconnect-btn:hover {
  background: #ff4d4f;
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  border-color: #ff2e51;
  color: #ff2e51;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn {
  background: white;
  color: #ff2e51;
  border-color: #ff2e51;
}

.refresh-btn:hover:not(:disabled) {
  background: #ff2e51;
  border-color: #ff2e51;
  color: white;
}

.mark-all-btn {
  background: white;
  color: #ff2e51;
  border-color: #ff2e51;
}

.mark-all-btn:hover:not(:disabled) {
  background: #ff2e51;
  border-color: #ff2e51;
  color: white;
}

.unread-count {
  background: #ff2e51;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 筛选器 */
.messages-filters {
  margin-bottom: 24px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.filter-tab:hover {
  border-color: #ff2e51;
  color: #ff2e51;
}

.filter-tab.active {
  background: #ff2e51;
  color: white;
  border-color: #ff2e51;
}

.filter-badge {
  background: rgba(255, 255, 255, 0.3);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  margin-left: 4px;
}

/* 消息内容 */
.messages-content {
  min-height: 400px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.loading-spinner {
  font-size: 24px;
  margin-bottom: 16px;
}

/* 通知列表 */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  transition: all 0.2s ease;
  position: relative;
}

.notification-item:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.notification-item.unread {
  background: #fafbff;
  border-color: #e6f7ff;
}

.notification-item.clickable {
  cursor: pointer;
}

.notification-item.clickable:hover {
  border-color: #ff2e51;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 12px;
}

.notification-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
}

.notification-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-content {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.notification-type {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-left: 12px;
}

.read-btn {
  padding: 6px 8px;
  font-size: 12px;
  background: #52c41a;
  color: white;
  border-color: #52c41a;
}

.read-btn:hover {
  background: #389e0d;
  border-color: #389e0d;
  color: white;
}

.delete-btn {
  padding: 6px 8px;
  font-size: 12px;
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.delete-btn:hover {
  background: #ff4d4f;
  color: white;
}

.unread-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  background: #ff2e51;
  border-radius: 50%;
}

/* 加载更多 */
.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.load-more-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  border-color: #ff2e51;
  color: #ff2e51;
}

.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  color: #666;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: #999;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .messages-container {
    padding: 16px;
  }
  
  .messages-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .action-btn {
    flex: 1;
    min-width: 80px;
    font-size: 13px;
    padding: 6px 12px;
  }
  
  .unread-count {
    order: -1;
    width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }
  
  .filter-tabs {
    gap: 6px;
  }
  
  .filter-tab {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .notification-item {
    padding: 12px;
  }
  
  .notification-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .notification-avatar {
    width: 32px;
    height: 32px;
  }
  
  .notification-actions {
    flex-direction: column;
    gap: 4px;
  }
}
</style> 