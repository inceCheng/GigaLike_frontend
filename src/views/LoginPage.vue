<template>
  <div class="login-container">
    <div class="login-box">
      <h1>欢迎回来</h1>
      <div class="form-group">
        <input 
          type="text" 
          v-model="username" 
          placeholder="用户名"
          :class="{ 'error': usernameError }"
          @blur="validateUsername"
          @input="clearUsernameError"
        />
        <div v-if="usernameError" class="field-error">{{ usernameError }}</div>
      </div>
      <div class="form-group">
        <input 
          type="password" 
          v-model="password" 
          placeholder="密码"
          :class="{ 'error': passwordError }"
          @blur="validatePassword"
          @input="clearPasswordError"
        />
        <div v-if="passwordError" class="field-error">{{ passwordError }}</div>
      </div>
      
      <!-- 图形验证码 -->
      <div class="form-group">
        <div class="captcha-container">
          <input 
            type="text" 
            v-model="captchaCode" 
            placeholder="请输入验证码" 
            class="captcha-input"
          />
          <div class="captcha-image-container">
            <img 
              :src="captchaImage" 
              alt="验证码" 
              class="captcha-image"
              @click="refreshCaptcha"
              v-if="captchaImage"
            />
            <div v-else class="captcha-loading">加载中...</div>
            <button 
              type="button" 
              @click="refreshCaptcha" 
              class="refresh-btn"
              title="刷新验证码"
            >
              <i class="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </div>
        <div class="captcha-tip">点击图片或刷新按钮可更换验证码</div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const captchaCode = ref('')
const captchaImage = ref('')
const captchaId = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const usernameError = ref('')
const passwordError = ref('')

// 获取验证码
const getCaptcha = async () => {
  try {
    const response = await axios.get('/api/captcha/generate')
    if (response.data.code === 0) {
      captchaImage.value = response.data.data.image
      captchaId.value = response.data.data.id
    } else {
      console.error('获取验证码失败:', response.data.message)
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    // 如果后端接口还没实现，使用占位图片
    captchaImage.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI2MCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUJDRA==</dGV4dD48L3N2Zz4='
    captchaId.value = 'demo'
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  captchaCode.value = ''
  getCaptcha()
}

// 用户名校验
const validateUsername = () => {
  const value = username.value.trim()
  if (!value) {
    usernameError.value = '请输入用户名'
    return false
  }
  if (value.length < 4 || value.length > 20) {
    usernameError.value = '用户名长度必须在4-20个字符之间'
    return false
  }
  usernameError.value = ''
  return true
}

// 密码校验
const validatePassword = () => {
  const value = password.value
  if (!value) {
    passwordError.value = '请输入密码'
    return false
  }
  if (value.length < 5 || value.length > 20) {
    passwordError.value = '密码长度必须在5-20个字符之间'
    return false
  }
  passwordError.value = ''
  return true
}

// 清除用户名错误
const clearUsernameError = () => {
  if (usernameError.value) {
    usernameError.value = ''
  }
}

// 清除密码错误
const clearPasswordError = () => {
  if (passwordError.value) {
    passwordError.value = ''
  }
}

const handleLogin = async () => {
  // 执行表单校验
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  
  if (!isUsernameValid || !isPasswordValid) {
    return
  }

  if (!captchaCode.value) {
    errorMessage.value = '请输入验证码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await userStore.login({
      username: username.value,
      password: password.value,
      captchaCode: captchaCode.value,
      captchaId: captchaId.value
    })
    
    if (result.success) {
      router.push('/')
    } else {
      errorMessage.value = result.message
      // 如果验证码错误，刷新验证码
      if (result.message && result.message.includes('验证码')) {
        refreshCaptcha()
      }
    }
  } catch (error) {
    errorMessage.value = '登录失败，请稍后重试'
    refreshCaptcha()
  } finally {
    isLoading.value = false
  }
}

// 页面加载时获取验证码
onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  padding: 20px;
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

h1 {
  text-align: center;
  margin-bottom: 32px;
  color: #333;
  font-size: 1.8rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
  background: #ffffff;
}

input:focus {
  border-color: #ff2e51;
  box-shadow: 0 0 0 3px rgba(255, 46, 81, 0.1);
}

input::placeholder {
  color: #999;
}

/* 验证码样式 */
.captcha-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.captcha-image {
  width: 120px;
  height: 40px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.captcha-image:hover {
  border-color: #ff2e51;
}

.captcha-loading {
  width: 120px;
  height: 40px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
  background: #f9f9f9;
}

.refresh-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #fff;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  border-color: #ff2e51;
  color: #ff2e51;
  background: #fff5f7;
}

.captcha-tip {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  text-align: center;
}

.login-button {
  width: 100%;
  padding: 14px;
  background: #ff2e51;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.2s ease;
}

.login-button:hover:not(:disabled) {
  background: #e02946;
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff2e51;
  text-align: center;
  margin-bottom: 16px;
  font-size: 14px;
  padding: 10px;
  background: rgba(255, 46, 81, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 46, 81, 0.1);
}

/* 字段错误样式 */
.field-error {
  color: #ff2e51;
  font-size: 12px;
  margin-top: 4px;
  margin-left: 4px;
}

input.error {
  border-color: #ff2e51;
  box-shadow: 0 0 0 3px rgba(255, 46, 81, 0.1);
}

.register-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #ff2e51;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .login-box {
    padding: 32px 24px;
  }
  
  h1 {
    font-size: 1.6rem;
    margin-bottom: 28px;
  }
  
  input {
    padding: 12px 14px;
    font-size: 15px;
  }
  
  .login-button {
    padding: 12px;
    font-size: 15px;
  }
  
  .captcha-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .captcha-image-container {
    justify-content: center;
  }
}
</style> 