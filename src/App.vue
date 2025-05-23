<template>
  <div id="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <!-- <img src="/logo.png" alt="GigaLike Logo" /> -->
          <img src="/vite.svg" alt="GigaLike Logo" />
          <span>GigaLike</span>
        </div>
        
        <div class="search-container">
          <div class="search-wrapper">
            <input type="text" placeholder="搜索" class="search-input" />
            <button class="search-button">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>
        </div>
        
        <div class="nav-actions">
          <button class="create-btn">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <aside class="sidebar">
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
            :class="{ active: route.path === '/discover' }"
            @click="router.push('/discover')"
          >
            <i class="nav-icon fa-solid fa-compass"></i>
            <span>发现</span>
          </div>
          <div 
            class="nav-item" 
            :class="{ active: route.path === '/messages' }"
            @click="router.push('/messages')"
          >
            <i class="nav-icon fa-solid fa-bell"></i>
            <span>消息</span>
          </div>
          <div 
            class="nav-item" 
            v-if="!loggedInState" 
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
            v-if="loggedInState"
          >
            <i class="nav-icon fa-solid fa-user"></i>
            <span>我</span>
          </div>
        </nav>
      </aside>
      
      <div class="content-container">
        <router-view />
      </div>
    </main>
    
    <footer class="app-footer">
      <p>© 2024 GigaLike. All rights reserved.</p>
      <div class="footer-links">
        <a href="#">关于我们</a>
        <a href="#">联系我们</a>
        <a href="#">隐私政策</a>
        <a href="#">用户协议</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue'
import { Modal, message } from 'ant-design-vue'

const router = useRouter()
const route = useRoute()

// Basic auth state management (replace with Pinia or Vuex for larger apps)
const getCurrentUserId = () => localStorage.getItem('gigaLikeUserId')
const isLoggedIn = () => !!localStorage.getItem('gigaLikeUserId')

// Reactive variable to trigger re-render on login/logout
const loggedInState = ref(isLoggedIn())

const showUserMenu = ref(false)
const showLoginHover = ref(false)

const handleUserClick = (event) => {
  if (!isLoggedIn()) {
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
        const response = await fetch('/api/user/logout', {
          method: 'GET',
          credentials: 'include'
        })
        const data = await response.json()
        if (data.code === 0) {
          localStorage.removeItem('gigaLikeUserId')
          loggedInState.value = false
          router.push('/')
          message.success('已成功退出登录')
        }
      } catch (error) {
        console.error('登出失败:', error)
        message.error('退出登录失败，请稍后重试')
      }
    }
  })
}

// Watch route changes to update login state if needed (e.g., after login redirect)
onMounted(() => {
  loggedInState.value = isLoggedIn();
  document.addEventListener('click', () => {
    showUserMenu.value = false
  })
});

watch(
  () => route.path,
  () => {
    loggedInState.value = isLoggedIn();
  }
);

// 监听登录状态变化
watch(loggedInState, (newValue) => {
  if (!newValue && route.path !== '/login' && route.path !== '/') {
    router.push('/')
  }
})

</script>

<style>
:root {
  --primary-color: #ff2e51;
  --secondary-color: #ffd6e0;
  --text-color: #333;
  --light-gray: #f4f4f4;
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
}

.search-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 0.6rem 1rem;
  border-radius: 20px;
  border: 1px solid var(--border-color);
  background-color: var(--light-gray);
  font-size: 0.9rem;
}

.search-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #f5f5f5;
  color: #666;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.search-button:hover {
  background-color: #e8e8e8;
  color: #333;
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
  flex-grow: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.sidebar {
  width: 100px;
  padding: 1rem 0;
  background-color: #fff;
  border-right: 1px solid var(--border-color);
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

.nav-item.active::before {
  content: '';
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: var(--secondary-color);
  border-radius: 12px;
  z-index: -1;
  top: 8px;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
  transition: transform 0.2s ease;
}

.nav-item span {
  font-size: 12px;
  margin-top: 4px;
}

.content-container {
  flex-grow: 1;
  padding: 1rem;
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
</style> 