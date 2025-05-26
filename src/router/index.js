import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginPage from '../views/LoginPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import BlogDetailView from '../views/BlogDetailView.vue'
import Discover from '../views/Discover.vue'
import Messages from '../views/Messages.vue'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore()
      if (userStore.isLoggedIn) {
        next({ name: 'Home' })
      } else {
        next()
      }
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    beforeEnter: (to, from, next) => {
      const userStore = useUserStore()
      if (userStore.isLoggedIn) {
        next({ name: 'Home' })
      } else {
        next()
      }
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/blog/:id',
    name: 'BlogDetail',
    component: BlogDetailView,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/discover',
    name: 'Discover',
    component: Discover,
    meta: { requiresAuth: true }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 全局路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 如果路由需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 用户未登录，跳转到登录页
      next({ name: 'Login' })
      return
    }
    
    // 用户已登录，验证session是否有效
    const isSessionValid = await userStore.validateSession()
    if (!isSessionValid) {
      // Session无效，跳转到登录页
      next({ name: 'Login' })
      return
    }
  }
  
  next()
})

export default router 