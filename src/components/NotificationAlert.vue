<template>
  <Teleport to="body">
    <Transition
      name="notification-alert"
      enter-active-class="alert-enter-active"
      leave-active-class="alert-leave-active"
      enter-from-class="alert-enter-from"
      leave-to-class="alert-leave-to"
    >
      <div 
        v-if="visible" 
        class="notification-alert"
        @click="handleClick"
      >
        <div class="alert-content">
          <div class="alert-icon">
            <i 
              :class="['fa-solid', getTypeIcon(notification?.type)]"
              :style="{ color: getTypeColor(notification?.type) }"
            ></i>
          </div>
          
          <div class="alert-body">
            <div class="alert-title">{{ notification?.title }}</div>
            <div class="alert-message">{{ notification?.content }}</div>
          </div>
          
          <div class="alert-avatar" v-if="notification?.sender">
            <img 
              :src="notification.sender.avatarUrl || '/images/default-avatar.png'" 
              :alt="notification.sender.displayName || notification.sender.username"
              @error="handleAvatarError"
            />
          </div>
          
          <button class="alert-close" @click.stop="handleIgnore" title="忽略">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  },
  duration: {
    type: Number,
    default: 4000
  },
  autoClose: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'ignore'])

const visible = ref(false)
let timer = null

const show = () => {
  visible.value = true
  
  if (props.autoClose) {
    timer = setTimeout(() => {
      handleIgnore()
    }, props.duration)
  }
}

const handleClick = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  visible.value = false
  
  setTimeout(() => {
    emit('click', props.notification)
  }, 200)
}

const handleIgnore = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  visible.value = false
  
  setTimeout(() => {
    emit('ignore', props.notification)
  }, 200)
}

const getTypeIcon = (type) => {
  const iconMap = {
    'LIKE': 'fa-heart',
    'COMMENT': 'fa-comment',
    'FOLLOW': 'fa-user-plus',
    'SYSTEM': 'fa-bell'
  }
  return iconMap[type] || 'fa-bell'
}

const getTypeColor = (type) => {
  const colorMap = {
    'LIKE': '#ff2e51',
    'COMMENT': '#1890ff',
    'FOLLOW': '#52c41a',
    'SYSTEM': '#faad14'
  }
  return colorMap[type] || '#666'
}

const handleAvatarError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

onMounted(() => {
  setTimeout(() => {
    show()
  }, 100)
})
</script>

<style scoped>
.notification-alert {
  position: fixed;
  top: 24px;
  right: 24px;
  width: 384px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.08), 
              0 9px 28px 0 rgba(0, 0, 0, 0.05), 
              0 3px 6px -4px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  z-index: 9999;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
}

.notification-alert:hover {
  box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.12), 
              0 9px 28px 0 rgba(0, 0, 0, 0.08), 
              0 3px 6px -4px rgba(0, 0, 0, 0.16);
  transform: translateY(-2px);
}

.alert-content {
  display: flex;
  align-items: flex-start;
  padding: 16px 24px;
  gap: 12px;
  position: relative;
}

.alert-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-top: 2px;
}

.alert-body {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  margin-bottom: 4px;
  line-height: 1.5714285714285714;
}

.alert-message {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.5714285714285714;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alert-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-top: 2px;
}

.alert-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.alert-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border: none;
  background: none;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.alert-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.88);
}

/* 动画效果 */
.alert-enter-active {
  transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
}

.alert-leave-active {
  transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
}

.alert-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.alert-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .notification-alert {
    width: calc(100vw - 48px);
    left: 24px;
    right: 24px;
  }
  
  .alert-content {
    padding: 12px 16px;
  }
  
  .alert-title,
  .alert-message {
    font-size: 13px;
  }
  
  .alert-avatar {
    width: 28px;
    height: 28px;
  }
}
</style> 