<template>
  <div id="app-container">
    <header class="app-header">
      <nav>
        <router-link to="/">Home</router-link>
        <span v-if="!isLoggedIn()" style="margin-left: auto;">
          <router-link to="/login">Login</router-link>
        </span>
        <span v-else style="margin-left: auto;">
          Welcome, User {{ getCurrentUserId() }}!
          <button @click="logout">Logout</button>
        </span>
      </nav>
    </header>
    <main class="app-main">
      <router-view />
    </main>
    <footer class="app-footer">
      <p>&copy; 2025 GigaLike. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, watch, onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

// Basic auth state management (replace with Pinia or Vuex for larger apps)
const getCurrentUserId = () => localStorage.getItem('gigaLikeUserId')
const isLoggedIn = () => !!localStorage.getItem('gigaLikeUserId')

// Reactive variable to trigger re-render on login/logout
const loggedInState = ref(isLoggedIn())

const logout = () => {
  localStorage.removeItem('gigaLikeUserId')
  loggedInState.value = false // Update reactive state
  router.push('/login')
}

// Watch route changes to update login state if needed (e.g., after login redirect)
onMounted(() => {
  loggedInState.value = isLoggedIn();
});

watch(
  () => route.path,
  () => {
    loggedInState.value = isLoggedIn();
  }
);

</script>

<style scoped>
.app-header {
  background: linear-gradient(90deg, #ffaaa5 0%, #ffd3b6 100%);
  color: #333;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.app-header nav {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.app-header nav a {
  color: #333;
  margin: 0 1rem;
  text-decoration: none;
  font-weight: bold;
}

.app-header nav a:hover {
  color: #000;
  text-decoration: underline;
}

.app-header nav button {
  background-color: #ffaaa5;
  color: #333;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 1rem;
  transition: all 0.2s ease;
}

.app-header nav button:hover {
  background-color: #ffd3b6;
}

.app-main {
  flex-grow: 1;
  padding: 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.app-footer {
  background: linear-gradient(90deg, #ffaaa5 0%, #ffd3b6 100%);
  color: #333;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

#app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style> 