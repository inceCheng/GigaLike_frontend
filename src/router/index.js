import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import BlogDetailView from '../views/BlogDetailView.vue'
import Discover from '../views/Discover.vue'
import Messages from '../views/Messages.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('gigaLikeUserId')) {
        next({ name: 'Home' }) // Redirect to home if already logged in
      } else {
        next()
      }
    },
  },
  {
    path: '/blog/:id',
    name: 'BlogDetail',
    component: BlogDetailView,
    props: true, // Pass route params as props to the component
    beforeEnter: (to, from, next) => {
      if (!localStorage.getItem('gigaLikeUserId')) {
        next({ name: 'Login' }) // Redirect to login if not logged in
      } else {
        next()
      }
    },
  },
  {
    path: '/discover',
    name: 'Discover',
    component: Discover
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages
  },
  // Add a catch-all route for 404 Not Found if desired
  // { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router 