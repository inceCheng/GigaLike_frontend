<template>
  <div class="register-container">
    <div class="register-box">
      <h1>创建账号</h1>
      <div class="form-group">
        <input type="text" v-model="username" placeholder="用户名" />
      </div>
      <div class="form-group">
        <input type="password" v-model="password" placeholder="密码" />
      </div>
      <div class="form-group">
        <input type="password" v-model="confirmPassword" placeholder="确认密码" />
      </div>
      <button class="register-button" @click="handleRegister">注册</button>
      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
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
const confirmPassword = ref('')

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  try {
    const response = await axios.post('/api/user/register', {
      username: username.value,
      password: password.value,
      confirmPassword: confirmPassword.value
    })
    
    if (response.data.code === 0) {
      alert('注册成功！')
      router.push('/login')
    } else {
      alert(response.data.message || '注册失败')
    }
  } catch (error) {
    alert('注册失败，请稍后重试')
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.register-box {
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

.register-button {
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

.register-button:hover {
  background: #ff1a1a;
}

.login-link {
  text-align: center;
  color: #666;
}

.login-link a {
  color: #ff2442;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 