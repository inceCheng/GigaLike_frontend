<template>
  <div id="app-container">
    <!-- 只在非隐藏布局的页面显示导航栏 -->
    <header class="app-header" v-if="!route.meta.hideLayout">
      <div class="header-content">
        <div class="logo">
          <!-- <img src="/logo.png" alt="GigaLike Logo" /> -->
          <img src="/vite.svg" alt="GigaLike Logo" />
          <span>GigaLike</span>
        </div>
        
        <div class="search-container">
          <div class="search-wrapper">
            <input 
              type="text" 
              placeholder="搜索 GigaLike..." 
              class="search-input"
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
            />
            <button class="search-button" @click="handleSearch">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        
        <div class="nav-actions">
          <button class="create-btn" @click="router.push('/create')" v-if="userStore.isLoggedIn">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="app-main" :class="{ 'full-screen': route.meta.hideLayout }">
      <!-- 只在非隐藏布局的页面显示侧边栏 -->
      <aside class="sidebar" v-if="!route.meta.hideLayout">
        <nav class="sidebar-nav">
          <div 
            class="nav-item" 
            :class="{ active: route.path === '/' }"
            @click="router.push('/')"
          >
            <i class="nav-icon fa-solid fa-house"></i>
            <span>首页</span>
          </div>
          <div 
            class="nav-item" 
            :class="{ active: route.path === '/create' }"
            @click="router.push('/create')"
          >
            <i class="nav-icon fa-solid fa-pen-to-square"></i>
            <span>发布</span>
          </div>
          <div 
            class="nav-item" 
            :class="{ active: route.path === '/messages' }"
            @click="router.push('/messages')"
          >
            <div class="nav-icon-container">
              <i class="nav-icon fa-solid fa-bell"></i>
              <!-- 未读通知徽章 -->
              <div 
                v-if="notificationStore.hasUnread" 
                class="notification-badge"
                :class="{ 'large-count': notificationStore.unreadCount > 99 }"
              >
                {{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}
              </div>
            </div>
            <span>消息</span>
          </div>
          <div 
            class="nav-item" 
            v-if="!userStore.isLoggedIn" 
            :class="{ active: route.path === '/login' }"
            @click="router.push('/login')"
          >
            <i class="nav-icon fa-solid fa-user"></i>
            <span>登录</span>
          </div>

          <div 
            class="nav-item" 
            :class="{ active: route.path === '/profile' }"
            @click="router.push('/profile')"
            v-if="userStore.isLoggedIn"
          >
            <div class="nav-avatar-container">
              <img 
                :src="userStore.user?.avatarUrl ? `${userStore.user.avatarUrl}?v=${userStore.avatarVersion}` : '/images/default-avatar.png'" 
                alt="我的头像"
                class="nav-avatar"
                :key="`${userStore.user?.avatarUrl}-${userStore.avatarVersion}`"
                @error="handleNavAvatarError"
              />
            </div>
            <span>我</span>
          </div>
        </nav>
      </aside>
      
      <div class="content-container" :class="{ 'full-width': route.meta.hideLayout }">
        <router-view />
      </div>
    </main>
    
    <!-- 只在非隐藏布局的页面显示页脚 -->
    <footer class="app-footer" v-if="!route.meta.hideLayout">
      <p>© 2024 GigaLike. All rights reserved.</p>
      <div class="footer-links">
        <a href="#">关于我们</a>
        <a href="#">联系我们</a>
        <a href="#">隐私政策</a>
        <a href="#">用户协议</a>
      </div>
    </footer>

    <!-- 实时通知弹窗 -->
    <NotificationAlert
      v-for="toast in notificationToasts"
      :key="toast.toastId"
      :notification="toast"
      @click="handleNotificationAlertClick"
      @ignore="() => removeNotificationToast(toast.originalId)"
    />
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import { Modal, message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { notificationWS, requestNotificationPermission } from '@/services/notificationWebSocket'
import NotificationAlert from '@/components/NotificationAlert.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const showUserMenu = ref(false)
const showLoginHover = ref(false)
const searchKeyword = ref('')
const notificationToasts = ref([])

let unsubscribeWS = null
let toastIdCounter = 0

const handleUserClick = (event) => {
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  showUserMenu.value = !showUserMenu.value
  event.stopPropagation()
}

const handleLogout = async () => {
  Modal.confirm({
    title: '退出登录',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    class: 'custom-modal',
    okButtonProps: {
      danger: true
    },
    async onOk() {
      try {
        await userStore.logout()
        
        // 断开WebSocket连接
        if (unsubscribeWS) {
          unsubscribeWS()
          unsubscribeWS = null
        }
        await notificationWS.disconnect()
        
        // 重置通知状态
        notificationStore.reset()
        notificationToasts.value = []
        
        router.push('/')
        message.success('已成功退出登录')
      } catch (error) {
        console.error('登出失败:', error)
        message.error('退出登录失败，请稍后重试')
      }
    }
  })
}

const handleNavAvatarError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return '/images/default-avatar.png'
  }
  // 使用头像版本号避免缓存
  return `${avatarUrl}?v=${userStore.avatarVersion}`
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    message.warning('请输入搜索关键词')
    return
  }
  
  // 如果当前不在首页，先跳转到首页
  if (route.path !== '/') {
    router.push({
      path: '/',
      query: { search: keyword }
    })
  } else {
    // 如果已经在首页，直接触发搜索
    router.push({
      path: '/',
      query: { search: keyword }
    })
  }
  
  // 清空搜索框
  searchKeyword.value = ''
}

// 初始化通知系统
const initNotificationSystem = async () => {
  if (!userStore.isLoggedIn || !userStore.user?.id) return

  try {
    // 请求浏览器通知权限
    await requestNotificationPermission()
    
    // 加载未读通知数量
    await notificationStore.loadUnreadCount()
    
    // 连接WebSocket
    connectWebSocket()
  } catch (error) {
    console.error('初始化通知系统失败:', error)
  }
}

// 连接WebSocket
const connectWebSocket = () => {
  if (!userStore.user?.id || unsubscribeWS) return
  
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
  // 检查是否为需要弹出消息框的通知类型
  const alertTypes = ['LIKE', 'COMMENT', 'FOLLOW', 'SYSTEM']
  
  if (alertTypes.includes(notification.type)) {
    // 立即更新未读数量
    notificationStore.unreadCount++
    
    // 显示实时通知弹窗（只在非消息页面显示）
    if (route.path !== '/messages') {
      showNotificationToast(notification)
    }
  }
}

// 显示通知弹窗
const showNotificationToast = (notification) => {
  const toast = {
    ...notification,
    toastId: `toast-${++toastIdCounter}-${notification.id}`,
    originalId: notification.id  // 保留原始notification ID
  }
  
  notificationToasts.value.push(toast)
  
  // 最多同时显示3个通知
  if (notificationToasts.value.length > 3) {
    notificationToasts.value.shift()
  }
}

// 移除通知弹窗
const removeNotificationToast = (originalNotificationId) => {
  const index = notificationToasts.value.findIndex(toast => 
    toast.originalId === originalNotificationId
  )
  if (index > -1) {
    notificationToasts.value.splice(index, 1)
  }
}

// 处理通知弹窗点击
const handleNotificationAlertClick = async (notification) => {
  // 移除弹窗 - 使用原始的notification ID
  removeNotificationToast(notification.id)
  
  // 标记为已读
  if (notification.isRead === 0) {
    try {
      await notificationStore.markAsRead(notification.id)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
  
  // 跳转到消息页面
  router.push('/messages')
}

// 处理系统广播
const handleBroadcast = (broadcast) => {
  // 显示系统广播消息
  message.info(broadcast.message, 5)
}

// 监听用户登录状态变化
watch(() => userStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn) {
    // 用户登录后初始化通知系统
    nextTick(() => {
      initNotificationSystem()
    })
  } else {
    // 用户登出后清理
    if (unsubscribeWS) {
      unsubscribeWS()
      unsubscribeWS = null
    }
    await notificationWS.disconnect()
    notificationStore.reset()
    notificationToasts.value = []
  }
})

// 监听头像版本号变化，强制更新头像
watch(() => userStore.avatarVersion, async (newVersion) => {
  if (userStore.user?.avatarUrl) {
    await nextTick()
    // 强制更新所有头像元素
    const avatarElements = document.querySelectorAll('.nav-avatar')
    avatarElements.forEach(img => {
      const baseUrl = userStore.user.avatarUrl
      img.src = `${baseUrl}?v=${newVersion}`
    })
  }
})

onMounted(() => {
  document.addEventListener('click', () => {
    showUserMenu.value = false
  })

  // 如果用户已登录，初始化通知系统
  if (userStore.isLoggedIn) {
    initNotificationSystem()
  }
})

onUnmounted(async () => {
  // 清理WebSocket连接
  if (unsubscribeWS) {
    unsubscribeWS()
  }
  await notificationWS.disconnect()
})

</script>

<style>
:root {
  --primary-color: #fe2c55;
  --secondary-color: #ffd6e0;
  --text-color: #333;
  --light-gray: #f5f5f5;
  --border-color: #e8e8e8;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #fff;
  color: var(--text-color);
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.8rem 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  width: 120px;
}

.logo img {
  height: 30px;
  margin-right: 8px;
}

.search-container {
  flex: 1;
  display: flex;
  justify-content: center;
  max-width: 600px;
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 480px;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 40px 0 16px;
  border-radius: 20px;
  border: none;
  background-color: #f5f5f5;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: all 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.search-input:focus {
  background-color: #fff;
  box-shadow: 0 0 0 1px #fe2c55;
}

.search-input::placeholder {
  color: #999;
  font-weight: 400;
}

.search-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  color: #999;
  border: none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s ease;
}

.search-button:hover {
  color: #fe2c55;
}

.search-button i {
  font-size: 16px;
}

.search-icon {
  font-style: normal;
  font-size: 0.9rem;
}

.nav-actions {
  display: flex;
  justify-content: flex-end;
  width: 120px;
}

.create-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  transition: color 0.2s ease;
}

.create-btn:hover {
  color: var(--primary-color);
}

.app-main {
  display: flex;
  flex: 1;
  min-height: 0;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  position: relative;
  overflow-y: auto;
}

.app-main.full-screen {
  display: block;
  width: 100%;
  height: 100vh;
  max-width: none;
  margin: 0;
}

.sidebar {
  width: 100px;
  padding: 1rem 0;
  background-color: #fff;
  border-right: 1px solid var(--border-color);
  flex-shrink: 0;
  position: fixed;
  top: 70px; /* 调整到顶部导航栏下方 */
  left: calc(50% - 600px); /* 居中对齐，保持在原位置 */
  height: calc(100vh - 70px); /* 调整高度，减去顶部导航栏高度 */
  z-index: 50;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}

.nav-item {
  height: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  width: 100%;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: var(--primary-color);
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-item.active .nav-icon {
  color: var(--primary-color);
  transform: scale(1.1); /* 激活时图标稍微放大 */
}

/* 移除背景高亮，改为图标颜色高亮 */

.nav-item.active .nav-icon {
  color: var(--primary-color);
  transform: scale(1.1); /* 激活时图标稍微放大 */
}

.nav-icon-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  z-index: 2; /* 确保图标容器在合适的层级 */
}

.nav-icon {
  font-size: 1.8rem; /* 调大图标尺寸 */
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
  transition: all 0.2s ease;
}

/* 通知徽章样式 */
.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff2e51;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  animation: notification-pulse 2s infinite;
  z-index: 10; /* 确保红点在图标上层 */
}

.notification-badge.large-count {
  padding: 2px 4px;
  font-size: 9px;
}

@keyframes notification-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 导航栏头像样式 */
.nav-avatar-container {
  width: 44px;
  height: 44px;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
  transition: all 0.2s ease;
}

.nav-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.nav-item:hover .nav-avatar-container {
  transform: scale(1.1);
}

.nav-item.active .nav-avatar {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.nav-item:hover .nav-avatar {
  border-color: var(--primary-color);
}

.nav-item span {
  font-size: 12px;
  margin-top: 4px;
}

.content-container {
  flex: 1;
  padding: 0 1rem;
  background-color: #fff;
  margin-left: 100px; /* 为固定侧边栏留出空间 */
}

.content-container.full-width {
  padding: 0;
  width: 100%;
  height: 100%;
}

.app-footer {
  margin-top: auto;
  background-color: #fff;
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 1rem;
  text-align: center;
  color: #666;
  font-size: 0.85rem;
}

.footer-links {
  margin-top: 0.5rem;
}

.footer-links a {
  color: #666;
  margin: 0 0.5rem;
  text-decoration: none;
}

.footer-links a:hover {
  text-decoration: underline;
}

.user-dropdown,
:deep(.ant-dropdown),
:deep(.ant-dropdown-menu),
:deep(.ant-dropdown-menu-item),
:deep(.ant-dropdown-menu-item:hover) {
  display: none;
}

/* Add styles for the custom modal */
:deep(.custom-modal .ant-btn-primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.custom-modal .ant-btn-primary:hover) {
  background-color: #ff1a1a;
  border-color: #ff1a1a;
}

:deep(.custom-modal .ant-btn-default:hover) {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

/* 移动端响应式优化 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 12px;
  }
  
  .logo {
    width: 80px;
    font-size: 1.2rem;
  }
  
  .search-container {
    max-width: none;
    margin: 0 12px;
  }
  
  .search-wrapper {
    max-width: none;
  }
  
  .search-input {
    height: 36px;
    padding: 0 36px 0 12px;
    font-size: 14px;
    border-radius: 18px;
  }
  
  .search-button {
    width: 20px;
    height: 20px;
    right: 8px;
  }
  
  .search-button i {
    font-size: 14px;
  }
  
  .nav-actions {
    width: 60px;
  }
}
</style> 