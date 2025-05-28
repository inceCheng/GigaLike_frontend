<template>
  <div class="test-container">
    <h1>通知系统测试页面</h1>
    
    <div class="test-section">
      <h2>WebSocket连接状态</h2>
      <div class="status-info">
        <div class="status-item">
          <span class="label">连接状态:</span>
          <span :class="['status', notificationStore.isConnected ? 'connected' : 'disconnected']">
            {{ notificationStore.isConnected ? '已连接' : '未连接' }}
          </span>
        </div>
        <div class="status-item">
          <span class="label">未读数量:</span>
          <span class="count">{{ notificationStore.unreadCount }}</span>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>测试功能</h2>
      <div class="test-buttons">
        <button @click="testLoadNotifications" :disabled="loading">
          {{ loading ? '加载中...' : '加载通知列表' }}
        </button>
        
        <button @click="testMarkAllAsRead" :disabled="!notificationStore.hasUnread">
          全部标记已读
        </button>
        
        <button @click="testSendNotification" v-if="userStore.user?.id">
          发送测试通知
        </button>
        
        <button @click="testBrowserNotification">
          测试浏览器通知
        </button>
      </div>
    </div>

    <div class="test-section">
      <h2>通知列表 (最近10条)</h2>
      <div v-if="notifications.length === 0" class="empty-message">
        暂无通知数据
      </div>
      <div v-else class="notification-list">
        <div 
          v-for="notification in notifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ unread: notification.isRead === 0 }"
        >
          <div class="notification-header">
            <span class="notification-type">{{ notificationStore.getNotificationTypeName(notification.type) }}</span>
            <span class="notification-time">{{ notificationStore.formatTime(notification.createTime) }}</span>
          </div>
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-content">{{ notification.content }}</div>
          <div class="notification-actions">
            <button 
              v-if="notification.isRead === 0"
              @click="markAsRead(notification.id)"
              class="read-btn"
            >
              标记已读
            </button>
            <button 
              @click="deleteNotification(notification.id)"
              class="delete-btn"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>API测试结果</h2>
      <div class="test-result">
        <pre>{{ testResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useUserStore } from '@/stores/user'
import api from '@/services/api'

const notificationStore = useNotificationStore()
const userStore = useUserStore()

const loading = ref(false)
const notifications = ref([])
const testResult = ref('等待测试...')

// 测试加载通知列表
const testLoadNotifications = async () => {
  loading.value = true
  testResult.value = '正在加载通知列表...'
  
  try {
    const response = await api.getNotificationList({ pageSize: 10 })
    notifications.value = response.data.data.records
    testResult.value = `成功加载 ${notifications.value.length} 条通知\n${JSON.stringify(response.data, null, 2)}`
  } catch (error) {
    testResult.value = `加载失败: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`
  } finally {
    loading.value = false
  }
}

// 测试标记全部已读
const testMarkAllAsRead = async () => {
  testResult.value = '正在标记全部已读...'
  
  try {
    const response = await api.markAllNotificationsAsRead()
    await notificationStore.loadUnreadCount()
    testResult.value = `标记成功\n${JSON.stringify(response.data, null, 2)}`
  } catch (error) {
    testResult.value = `标记失败: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`
  }
}

// 测试发送通知
const testSendNotification = async () => {
  if (!userStore.user?.id) {
    testResult.value = '用户未登录，无法发送测试通知'
    return
  }
  
  testResult.value = '正在发送测试通知...'
  
  try {
    const response = await api.sendTestNotification(userStore.user.id, '这是一条测试通知')
    testResult.value = `发送成功\n${JSON.stringify(response.data, null, 2)}`
  } catch (error) {
    testResult.value = `发送失败: ${error.message}\n${JSON.stringify(error.response?.data, null, 2)}`
  }
}

// 测试浏览器通知
const testBrowserNotification = () => {
  if ('Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('测试通知', {
        body: '这是一条测试的浏览器通知',
        icon: '/favicon.ico'
      })
      testResult.value = '浏览器通知已发送'
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('测试通知', {
            body: '这是一条测试的浏览器通知',
            icon: '/favicon.ico'
          })
          testResult.value = '浏览器通知权限已获取并发送通知'
        } else {
          testResult.value = '浏览器通知权限被拒绝'
        }
      })
    } else {
      testResult.value = '浏览器通知权限被拒绝'
    }
  } else {
    testResult.value = '浏览器不支持通知功能'
  }
}

// 标记单个通知已读
const markAsRead = async (notificationId) => {
  try {
    await api.markNotificationAsRead(notificationId)
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = 1
    }
    await notificationStore.loadUnreadCount()
    testResult.value = `通知 ${notificationId} 已标记为已读`
  } catch (error) {
    testResult.value = `标记失败: ${error.message}`
  }
}

// 删除通知
const deleteNotification = async (notificationId) => {
  try {
    await api.deleteNotification(notificationId)
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
    await notificationStore.loadUnreadCount()
    testResult.value = `通知 ${notificationId} 已删除`
  } catch (error) {
    testResult.value = `删除失败: ${error.message}`
  }
}

onMounted(() => {
  // 自动加载通知列表
  testLoadNotifications()
})
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  color: #666;
  margin-bottom: 15px;
  font-size: 18px;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
}

.status-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 500;
  color: #666;
}

.status.connected {
  color: #52c41a;
  font-weight: 600;
}

.status.disconnected {
  color: #ff4d4f;
  font-weight: 600;
}

.count {
  background: #ff2e51;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.test-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.test-buttons button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
}

.test-buttons button:hover:not(:disabled) {
  border-color: #ff2e51;
  color: #ff2e51;
}

.test-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 20px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
}

.notification-item.unread {
  background: #f0f9ff;
  border-color: #91d5ff;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notification-type {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #333;
}

.notification-content {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.read-btn {
  padding: 4px 8px;
  border: 1px solid #52c41a;
  border-radius: 4px;
  background: #52c41a;
  color: white;
  font-size: 12px;
  cursor: pointer;
}

.delete-btn {
  padding: 4px 8px;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  background: white;
  color: #ff4d4f;
  font-size: 12px;
  cursor: pointer;
}

.test-result {
  background: #f5f5f5;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.test-result pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 