<template>
  <div class="login-container">
    <div class="login-box">
      <h1>欢迎回来</h1>
      <div class="form-group">
        <input type="text" v-model="username" placeholder="用户名" />
      </div>
      <div class="form-group">
        <input type="password" v-model="password" placeholder="密码" />
      </div>
      <button class="login-button" @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      <div class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await userStore.login({
      username: username.value,
      password: password.value
    })
    
    if (result.success) {
      router.push('/')
    } else {
      errorMessage.value = result.message
    }
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

input:focus {
  border-color: #ff2442;
}

.login-button {
  width: 100%;
  padding: 12px;
  background: #ff2442;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.2s ease;
}

.login-button:hover:not(:disabled) {
  background: #ff1a1a;
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff2442;
  text-align: center;
  margin-bottom: 15px;
  font-size: 14px;
}

.register-link {
  text-align: center;
  color: #666;
}

.register-link a {
  color: #ff2442;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style> 