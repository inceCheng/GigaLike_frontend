import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

export function useAuth() {
  const userStore = useUserStore()
  const router = useRouter()

  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const user = computed(() => userStore.user)
  const userId = computed(() => userStore.getCurrentUserId)

  const requireAuth = (callback) => {
    if (!isLoggedIn.value) {
      router.push('/login')
      return false
    }
    if (callback) callback()
    return true
  }

  const logout = async () => {
    await userStore.logout()
    router.push('/login')
  }

  return {
    isLoggedIn,
    user,
    userId,
    requireAuth,
    logout,
    userStore
  }
} 