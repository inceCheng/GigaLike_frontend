import SockJS from 'sockjs-client'

class NotificationWebSocket {
  constructor() {
    this.ws = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 3000
    this.heartbeatInterval = 30000
    this.heartbeatTimer = null
    this.callbacks = new Set()
    this.isConnecting = false
    this.userId = null
    this.isPageVisible = true
    
    // 监听页面可见性变化
    this.setupVisibilityListener()
    // 设置网络状态监听
    this.setupNetworkListener()
  }

  setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isPageVisible = !document.hidden
        
        if (this.isPageVisible) {
          // 页面可见时，如果连接断开则尝试重连
          if (!this.isConnected() && this.userId) {
            console.log('页面重新可见，检查SockJS连接状态')
            this.connect(this.userId)
          }
          // 恢复心跳
          if (this.isConnected() && !this.heartbeatTimer) {
            this.startHeartbeat()
          }
        } else {
          // 页面不可见时，保持连接但可以暂停心跳以节省资源
          // 注意：这里不完全停止心跳，因为服务器可能需要心跳来保持连接
          console.log('页面不可见，SockJS连接保持但降低心跳频率')
        }
      })
    }
  }

  // 设置网络状态监听
  setupNetworkListener() {
    if (typeof window !== 'undefined' && 'navigator' in window && 'onLine' in navigator) {
      window.addEventListener('online', () => {
        console.log('网络重新连接，尝试恢复SockJS连接')
        if (!this.isConnected() && this.userId) {
          // 重置重连次数，因为这是网络恢复导致的重连
          this.reconnectAttempts = 0
          this.connect(this.userId)
        }
      })
      
      window.addEventListener('offline', () => {
        console.log('网络连接断开')
        // 网络断开时不需要特殊处理，SockJS会自动触发onclose事件
      })
    }
  }

  connect(userId) {
    if (this.isConnecting || (this.ws && this.ws.readyState === 1)) { // SockJS uses readyState 1 for OPEN
      return
    }

    this.userId = userId
    this.isConnecting = true

    try {
      // 使用 SockJS 连接
      const protocol = window.location.protocol
      const host = window.location.host
      const sockJsUrl = `${protocol}//${host}/api/ws/notification?userId=${userId}`
      
      console.log('正在连接SockJS:', sockJsUrl)
      
      // 使用 SockJS 而不是原生 WebSocket
      this.ws = new SockJS(sockJsUrl)
      
      this.ws.onopen = this.onOpen.bind(this)
      this.ws.onmessage = this.onMessage.bind(this)
      this.ws.onclose = this.onClose.bind(this)
      this.ws.onerror = this.onError.bind(this)
      
    } catch (error) {
      console.error('SockJS连接失败:', error)
      this.isConnecting = false
      this.reconnect()
    }
  }

  onOpen(event) {
    console.log('SockJS连接已建立')
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.startHeartbeat()
    
    // 触发连接成功回调
    this.triggerCallbacks({
      type: 'CONNECTION_STATUS',
      data: { connected: true }
    })
  }

  onMessage(event) {
    try {
      const message = JSON.parse(event.data)
      console.log('收到SockJS消息:', message)
      
      switch (message.type) {
        case 'CONNECTED':
          console.log('连接确认:', message.message)
          break
        case 'NOTIFICATION':
          this.handleNotification(message.data)
          break
        case 'BROADCAST':
          this.handleBroadcast(message.data)
          break
        case 'PONG':
          console.log('心跳响应')
          break
        default:
          console.log('未知消息类型:', message.type)
      }
    } catch (error) {
      console.error('解析SockJS消息失败:', error)
    }
  }

  onClose(event) {
    console.log('SockJS连接关闭:', event.code, event.reason)
    this.isConnecting = false
    this.stopHeartbeat()
    
    // 触发连接断开回调
    this.triggerCallbacks({
      type: 'CONNECTION_STATUS',
      data: { connected: false }
    })
    
    if (event.code !== 1000) { // 非正常关闭
      this.reconnect()
    }
  }

  onError(error) {
    console.error('SockJS错误:', error)
    this.isConnecting = false
  }

  handleNotification(notification) {
    console.log('收到通知:', notification)
    
    // 显示浏览器通知
    this.showBrowserNotification(notification)
    
    // 触发通知回调
    this.triggerCallbacks({
      type: 'NOTIFICATION',
      data: notification
    })
  }

  handleBroadcast(broadcast) {
    console.log('收到广播:', broadcast)
    
    // 触发广播回调
    this.triggerCallbacks({
      type: 'BROADCAST',
      data: broadcast
    })
  }

  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.content,
        icon: '/favicon.ico',
        tag: `notification-${notification.id}`,
        requireInteraction: false
      })
      
      // 点击通知时的处理
      browserNotification.onclick = () => {
        window.focus()
        // 可以在这里添加跳转逻辑
        browserNotification.close()
      }
      
      // 3秒后自动关闭
      setTimeout(() => {
        browserNotification.close()
      }, 3000)
    }
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === 1) { // SockJS uses 1 for OPEN
        this.ws.send('PING')
      }
    }, this.heartbeatInterval)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++
      console.log(`尝试重连SockJS (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      setTimeout(() => {
        this.connect(this.userId)
      }, this.reconnectInterval)
    } else {
      console.error('SockJS重连失败，已达到最大重试次数')
    }
  }

  subscribe(callback) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  triggerCallbacks(message) {
    this.callbacks.forEach(callback => {
      try {
        callback(message)
      } catch (error) {
        console.error('通知回调执行失败:', error)
      }
    })
  }

  async disconnect() {
    this.stopHeartbeat()
    
    // 调用后端断开连接接口
    if (this.userId) {
      try {
        const { default: api } = await import('@/services/api')
        await api.disconnectWebSocket()
        console.log('已通知后端断开连接')
      } catch (error) {
        console.error('通知后端断开连接失败:', error)
      }
    }
    
    if (this.ws) {
      this.ws.close(1000, '用户主动断开')
      this.ws = null
    }
    this.userId = null
    this.isConnecting = false
    this.reconnectAttempts = 0
  }

  // 获取连接状态
  isConnected() {
    return this.ws && this.ws.readyState === 1  // SockJS uses 1 for OPEN
  }
}

// 全局通知WebSocket实例
export const notificationWS = new NotificationWebSocket()

// 请求浏览器通知权限
export const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    return Notification.requestPermission()
  }
  return Promise.resolve(Notification.permission)
}

export default NotificationWebSocket 