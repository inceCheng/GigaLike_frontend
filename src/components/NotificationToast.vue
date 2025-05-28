<template>
  <Teleport to="body">
    <Transition
      name="notification-toast"
      enter-active-class="notification-enter-active"
      leave-active-class="notification-leave-active"
      enter-from-class="notification-enter-from"
      leave-to-class="notification-leave-to"
    >
      <div 
        v-if="visible" 
        class="notification-toast"
        @click="handleClick"
      >
        <div class="notification-toast-content">
          <div class="notification-icon">
            <i 
              :class="['fa-solid', notificationStore.getNotificationTypeIcon(notification?.type)]"
              :style="{ color: notificationStore.getNotificationTypeColor(notification?.type) }"
            ></i>
          </div>
          
          <div class="notification-body">
            <div class="notification-title">{{ notification?.title }}</div>
            <div class="notification-content">{{ notification?.content }}</div>
            <div class="notification-meta">
              <span class="notification-type">
                {{ notificationStore.getNotificationTypeName(notification?.type) }}
              </span>
              <span class="notification-time">刚刚</span>
            </div>
          </div>
          
          <div class="notification-avatar" v-if="notification?.sender">
            <img 
              :src="notification.sender.avatarUrl || '/images/default-avatar.png'" 
              :alt="notification.sender.displayName || notification.sender.username"
              @error="handleAvatarError"
            />
          </div>
          
          <button class="notification-close" @click.stop="close">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div class="notification-progress" v-if="autoClose">
          <div 
            class="notification-progress-bar"
            :style="{ animationDuration: `${duration}ms` }"
          ></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

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

const emit = defineEmits(['close', 'click'])

const router = useRouter()
const notificationStore = useNotificationStore()

const visible = ref(false)
let timer = null

const show = () => {
  visible.value = true
  
  if (props.autoClose) {
    timer = setTimeout(() => {
      close()
    }, props.duration)
  }
}

const close = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  
  setTimeout(() => {
    emit('close')
  }, 300) // 等待动画完成
}

const handleClick = async () => {
  // 标记为已读
  if (props.notification.isRead === 0) {
    try {
      await notificationStore.markAsRead(props.notification.id)
    } catch (error) {
      console.error('标记已读失败:', error)
    }
  }
  
  // 根据通知类型跳转
  handleNavigation()
  
  emit('click', props.notification)
  close()
}

const handleNavigation = () => {
  const { type, relatedId, relatedType, sender } = props.notification
  
  switch (type) {
    case 'LIKE':
    case 'COMMENT':
      // 跳转到博客详情页
      if (relatedId && relatedType === 'BLOG') {
        router.push(`/blog/${relatedId}`)
      }
      break
    case 'FOLLOW':
      // 跳转到用户主页
      if (sender?.id) {
        router.push(`/user/${sender.id}`)
      }
      break
    case 'SYSTEM':
      // 跳转到消息页面
      router.push('/messages')
      break
    default:
      // 默认跳转到消息页面
      router.push('/messages')
      break
  }
}

const handleAvatarError = (event) => {
  event.target.src = '/images/default-avatar.png'
}

onMounted(() => {
  // 延迟显示，确保DOM已渲染
  setTimeout(() => {
    show()
  }, 100)
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

<style scoped>
.notification-toast {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  z-index: 9999;
  overflow: hidden;
  transition: all 0.3s ease;
}

.notification-toast:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.notification-toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
  position: relative;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.4;
}

.notification-content {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.notification-type {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.notification-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
}

.notification-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.notification-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: #f0f0f0;
  color: #666;
}

.notification-progress {
  height: 3px;
  background: #f0f0f0;
  position: relative;
  overflow: hidden;
}

.notification-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #ff2e51, #ff6b8a);
  width: 100%;
  animation: progress-countdown linear;
  transform-origin: left;
}

@keyframes progress-countdown {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* 动画效果 */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .notification-toast {
    width: calc(100vw - 40px);
    right: 20px;
    left: 20px;
  }
}
</style> 