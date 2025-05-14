<template>
  <div class="login-view container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div>
        <label for="userId">User ID:</label>
        <input type="number" id="userId" v-model.number="userId" required placeholder="Enter any user ID (e.g., 1, 2, 3)">
      </div>
      <button type="submit" class="button-primary">Login</button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="isLoading" class="loading-message">Logging in...</p>
      <p class="info-text">For demo purposes, enter any user ID from the mock data (e.g., 1 for admin, 2 for johndoe, 3 for github_12345). There is no password check.</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const userId = ref(null)
const router = useRouter()
const error = ref('')
const isLoading = ref(false)

const handleLogin = async () => {
  if (!userId.value) {
    error.value = 'Please enter a User ID.'
    return
  }
  error.value = ''
  isLoading.value = true
  try {
    // The backend /user/login endpoint should set the session
    // For the frontend, we'll just store the userId to simulate login status
    // and to have it available for other API calls.
    const response = await api.login(userId.value) 
    if (response.data && response.data.code === 0 && response.data.data) {
      localStorage.setItem('gigaLikeUserId', response.data.data.id) // Store user ID
      // Force a re-render of App.vue to update nav
      // This is a bit of a hack; a state management solution like Pinia would handle this more gracefully.
       router.push('/').then(() => {
        router.go(0); // Reload the page to update App.vue nav
      });
    } else {
      error.value = response.data.message || 'Login failed. Invalid User ID or server error.'
      localStorage.removeItem('gigaLikeUserId')
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'An error occurred during login. Please try again.'
    if (err.response && err.response.data && err.response.data.message) {
        error.value = err.response.data.message;
    }
    localStorage.removeItem('gigaLikeUserId')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-view {
  max-width: 400px;
  margin-top: 50px;
}

form div {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="number"] {
  width: calc(100% - 22px);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.info-text {
  font-size: 0.9em;
  color: #555;
  margin-top: 20px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style> 