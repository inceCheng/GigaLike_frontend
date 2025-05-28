<template>
  <div class="register-container">
    <div class="register-box">
      <h1>创建账号</h1>
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
      <div class="form-group">
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="确认密码"
          :class="{ 'error': confirmPasswordError }"
          @blur="validateConfirmPassword"
          @input="clearConfirmPasswordError"
        />
        <div v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</div>
      </div>
      
      <!-- 邮箱输入 -->
      <div class="form-group">
        <input type="email" v-model="email" placeholder="邮箱地址" />
      </div>
      
      <!-- 邮箱验证码 -->
      <div class="form-group">
        <div class="email-code-container">
          <input 
            type="text" 
            v-model="emailCode" 
            placeholder="请输入邮箱验证码" 
            class="email-code-input"
          />
          <button 
            type="button" 
            @click="sendEmailCode" 
            :disabled="emailCountdown > 0 || !email || isEmailSending"
            class="send-email-btn"
          >
            {{ isEmailSending ? '发送中...' : (emailCountdown > 0 ? `${emailCountdown}秒后重新发送` : '发送验证码') }}
          </button>
        </div>
        <div class="email-tip">验证码将发送到您的邮箱，请注意查收</div>
      </div>
      
      <!-- 图形验证码 -->
      <div class="form-group">
        <div class="captcha-container">
          <input 
            type="text" 
            v-model="captchaCode" 
            placeholder="请输入图形验证码" 
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
      
      <button 
        class="register-button" 
        @click="handleRegister" 
        :disabled="isLoading || !isFormValid"
      >
        {{ isLoading ? '注册中...' : '注册' }}
      </button>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const email = ref('')
const emailCode = ref('')
const captchaCode = ref('')
const captchaImage = ref('')
const captchaId = ref('')
const isLoading = ref(false)
const isEmailSending = ref(false)
const emailCountdown = ref(0)
const errorMessage = ref('')
const usernameError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// 表单验证
const isFormValid = computed(() => {
  return username.value && 
         password.value && 
         confirmPassword.value && 
         email.value && 
         emailCode.value && 
         captchaCode.value &&
         password.value === confirmPassword.value &&
         isValidEmail(email.value) &&
         !usernameError.value &&
         !passwordError.value &&
         !confirmPasswordError.value
})

// 邮箱格式验证
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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

// 确认密码校验
const validateConfirmPassword = () => {
  const value = confirmPassword.value
  if (!value) {
    confirmPasswordError.value = '请确认密码'
    return false
  }
  if (value !== password.value) {
    confirmPasswordError.value = '两次输入的密码不一致'
    return false
  }
  confirmPasswordError.value = ''
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
  // 如果密码改变了，也需要重新验证确认密码
  if (confirmPassword.value && confirmPasswordError.value) {
    validateConfirmPassword()
  }
}

// 清除确认密码错误
const clearConfirmPasswordError = () => {
  if (confirmPasswordError.value) {
    confirmPasswordError.value = ''
  }
}

// 获取图形验证码
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

// 刷新图形验证码
const refreshCaptcha = () => {
  captchaCode.value = ''
  getCaptcha()
}

// 发送邮箱验证码
const sendEmailCode = async () => {
  if (!email.value) {
    errorMessage.value = '请输入邮箱地址'
    return
  }

  if (!isValidEmail(email.value)) {
    errorMessage.value = '请输入正确的邮箱格式'
    return
  }

  isEmailSending.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/api/email/send-code', {
      email: email.value
    })
    
    if (response.data.code === 0) {
      startEmailCountdown()
      // 显示成功提示
      const successDiv = document.createElement('div')
      successDiv.className = 'success-message'
      successDiv.textContent = '邮箱验证码发送成功，请查收邮件'
      document.querySelector('.register-box').appendChild(successDiv)
      setTimeout(() => {
        successDiv.remove()
      }, 3000)
    } else {
      errorMessage.value = response.data.message || '邮箱验证码发送失败'
    }
  } catch (error) {
    console.error('发送邮箱验证码失败:', error)
    errorMessage.value = '邮箱验证码发送失败，请稍后重试'
  } finally {
    isEmailSending.value = false
  }
}

// 邮箱验证码倒计时
const startEmailCountdown = () => {
  emailCountdown.value = 60
  const timer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 注册处理
const handleRegister = async () => {
  // 执行表单校验
  const isUsernameValid = validateUsername()
  const isPasswordValid = validatePassword()
  const isConfirmPasswordValid = validateConfirmPassword()
  
  if (!isUsernameValid || !isPasswordValid || !isConfirmPasswordValid) {
    return
  }

  if (!email.value) {
    errorMessage.value = '请输入邮箱地址'
    return
  }

  if (!isValidEmail(email.value)) {
    errorMessage.value = '请输入正确的邮箱格式'
    return
  }

  if (!emailCode.value) {
    errorMessage.value = '请输入邮箱验证码'
    return
  }

  if (!captchaCode.value) {
    errorMessage.value = '请输入图形验证码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/api/user/register', {
      username: username.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
      email: email.value,
      emailCode: emailCode.value,
      captchaCode: captchaCode.value,
      captchaId: captchaId.value
    })
    
    if (response.data.code === 0) {
      // 显示成功提示
      const successDiv = document.createElement('div')
      successDiv.className = 'success-message'
      successDiv.textContent = '注册成功！即将跳转到登录页面...'
      document.querySelector('.register-box').appendChild(successDiv)
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      errorMessage.value = response.data.message || '注册失败'
      // 如果验证码错误，刷新图形验证码
      if (response.data.message && response.data.message.includes('验证码')) {
        refreshCaptcha()
      }
    }
  } catch (error) {
    console.error('注册失败:', error)
    errorMessage.value = '注册失败，请稍后重试'
    refreshCaptcha()
  } finally {
    isLoading.value = false
  }
}

// 页面加载时获取图形验证码
onMounted(() => {
  getCaptcha()
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  padding: 20px;
}

.register-box {
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

/* 邮箱验证码样式 */
.email-code-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.email-code-input {
  flex: 1;
}

.send-email-btn {
  padding: 14px 16px;
  background: #ff2e51;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  min-width: 120px;
  transition: background-color 0.2s ease;
}

.send-email-btn:hover:not(:disabled) {
  background: #e02946;
}

.send-email-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.email-tip {
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  text-align: center;
}

/* 图形验证码样式 */
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

.register-button {
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

.register-button:hover:not(:disabled) {
  background: #e02946;
}

.register-button:disabled {
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

.success-message {
  color: #52c41a;
  text-align: center;
  margin-bottom: 16px;
  font-size: 14px;
  padding: 10px;
  background: rgba(82, 196, 26, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(82, 196, 26, 0.1);
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

.login-link {
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #ff2e51;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .register-container {
    padding: 16px;
  }
  
  .register-box {
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
  
  .register-button {
    padding: 12px;
    font-size: 15px;
  }
  
  .email-code-container {
    flex-direction: column;
    gap: 8px;
  }
  
  .send-email-btn {
    width: 100%;
    min-width: auto;
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