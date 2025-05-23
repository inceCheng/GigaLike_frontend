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
      <button class="login-button" @click="handleLogin">登录</button>
      <div class="register-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')

const handleLogin = async () => {
  try {
    const response = await axios.post('/api/user/login', {
      username: username.value,
      password: password.value
    })
    
    if (response.data.code === 0) {
      localStorage.setItem('gigaLikeUserId', response.data.data.id)
      localStorage.setItem('gigaLikeUser', JSON.stringify(response.data.data))
      router.push('/')
    } else {
      alert(response.data.message || '登录失败')
    }
  } catch (error) {
    alert('登录失败，请稍后重试')
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
}

.login-button:hover {
  background: #ff1a1a;
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