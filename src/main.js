import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css' // We will create this later for global styles
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import { useUserStore } from './stores/user'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(Antd)

// 初始化用户状态
const userStore = useUserStore()
userStore.initializeFromStorage()

app.mount('#app') 