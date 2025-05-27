<template>
  <div class="blog-detail-view">
    <div v-if="isLoading" class="loading-message">Loading blog details...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <div v-if="blog && !isLoading && !error" class="blog-detail-container">
      <!-- 返回按钮 -->
      <router-link to="/" class="back-link">&larr; 首页</router-link>
      
      <!-- 左右分栏布局 -->
      <div class="blog-layout">
        <!-- 左侧图片区域 -->
        <div class="blog-image-section">
          <img 
            v-if="blog.coverImg" 
            :src="blog.coverImg" 
            :alt="blog.title" 
            class="blog-cover-image"
          />
          <div v-else class="no-image-placeholder">
            <i class="fa-solid fa-image"></i>
            <p>No Image</p>
          </div>
        </div>
        
        <!-- 右侧详情区域 -->
        <div class="blog-content-section">
          <!-- 作者信息 -->
          <div v-if="blog.author" class="author-info">
            <div class="author-avatar">
              <img 
                v-if="blog.author.avatarUrl" 
                :src="blog.author.avatarUrl" 
                :alt="blog.author.displayName || blog.author.username"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                <i class="fa-solid fa-user"></i>
              </div>
            </div>
            <span class="author-name">
              {{ blog.author.displayName || blog.author.username }}
            </span>
          </div>
          
          <!-- 文章标题 -->
          <h1 class="blog-title">{{ blog.title }}</h1>
          
          <!-- 文章内容 -->
          <div class="blog-content">
            <BlogContent :content="blog.content" />
          </div>
          
          <!-- 话题标签 -->
          <div v-if="blog.topics && blog.topics.length > 0" class="topics-section">
            <span 
              v-for="(topic, index) in blog.topics" 
              :key="topic.id"
              class="topic-tag"
            >
              #{{ topic.name }}
            </span>
          </div>
          
          <!-- 点赞信息 -->
          <div class="like-section">
            <div class="like-container">
              <button 
                @click="handleLike" 
                :disabled="likeActionLoading"
                class="like-button"
                :title="blog.hasThumb ? '取消点赞' : '点赞'"
              >
                <span v-if="likeActionLoading" class="loading-text">...</span>
                <i v-else class="like-icon" :class="{ 'liked-icon': blog.hasThumb }">♥</i>
              </button>
              <span class="like-count">{{ blog.thumbCount }}</span>
            </div>
            <p v-if="likeError" class="error-message">{{ likeError }}</p>
          </div>
          
          <!-- 创建时间 -->
          <div class="blog-meta">
            <span> {{ formatDate(blog.createTime) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import BlogContent from '../components/BlogContent.vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  id: { // Received from router path: '/blog/:id'
    type: [String, Number],
    required: true
  }
})

const route = useRoute()
const userStore = useUserStore()
const blog = ref(null)
const isLoading = ref(true)
const error = ref('')
const likeError = ref('')
const likeActionLoading = ref(false)

const fetchBlogDetails = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await api.getBlogDetails(props.id)
    if (response.data && response.data.code === 0 && response.data.data) {
      blog.value = response.data.data;
      console.log('Blog data with topics:', blog.value); // 调试用，可以看到话题数据
    } else {
      error.value = response.data.message || 'Could not fetch blog details.';
    }
  } catch (err) {
    console.error(`Failed to fetch blog ${props.id}:`, err)
    error.value = `Failed to load blog details. ${err.message}`
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    }
  } finally {
    isLoading.value = false
  }
}

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    likeError.value = '请先登录后再点赞';
    return;
  }
  likeError.value = '';
  likeActionLoading.value = true;
  
  // 保存当前状态，用于失败时回滚
  const originalHasThumb = blog.value.hasThumb;
  const originalThumbCount = blog.value.thumbCount;
  
  try {
    // 乐观更新：先更新UI状态
    blog.value.hasThumb = !originalHasThumb;
    blog.value.thumbCount = originalHasThumb ? originalThumbCount - 1 : originalThumbCount + 1;
    
    // 发送请求到后端
    const response = await api.toggleThumb(props.id, originalHasThumb);
    
    if (response.data && response.data.code === 0) {
      // 请求成功，UI已经更新，无需额外操作
      console.log('点赞操作成功');
    } else {
      // 请求失败，回滚UI状态
      blog.value.hasThumb = originalHasThumb;
      blog.value.thumbCount = originalThumbCount;
      likeError.value = response.data.message || '点赞操作失败';
    }
  } catch (err) {
    // 请求出错，回滚UI状态
    blog.value.hasThumb = originalHasThumb;
    blog.value.thumbCount = originalThumbCount;
    console.error('Failed to toggle like:', err);
    likeError.value = '点赞操作出错，请稍后重试';
    if (err.response && err.response.data && err.response.data.message) {
      likeError.value = err.response.data.message;
    }
  } finally {
    likeActionLoading.value = false;
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// 监听用户登录状态变化，重新获取博客详情以更新点赞状态
watch(() => userStore.isLoggedIn, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    fetchBlogDetails()
  }
})

onMounted(() => {
  fetchBlogDetails()
})
</script>

<style scoped>
.blog-detail-view {
  min-height: 100vh;
  background-color: #fff;
}

.blog-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.blog-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-height: 600px;
}

/* 左侧图片区域 */
.blog-image-section {
  position: relative;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blog-cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.2rem;
}

.no-image-placeholder i {
  font-size: 3rem;
  margin-bottom: 10px;
  color: #ccc;
}

/* 右侧详情区域 */
.blog-content-section {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 作者信息 */
.author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.author-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f0f0f0;
}

.avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
}

.author-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

/* 文章标题 */
.blog-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  line-height: 1.3;
  margin: 0;
}

/* 文章内容 */
.blog-content {
  flex: 1;
  font-size: 1rem;
  line-height: 1.7;
  color: #444;
}

/* 话题标签 */
.topics-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.topic-tag {
  color: rgb(19, 56, 108);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s ease;
  padding: 4px 8px;
  background-color: rgba(19, 56, 108, 0.1);
  border-radius: 12px;
}

.topic-tag:hover {
  opacity: 0.7;
}

/* 点赞区域 */
.like-section {
  padding: 16px 0;
}

.like-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.like-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.like-button:hover {
  background-color: rgba(255, 71, 87, 0.1);
  transform: scale(1.05);
}

.like-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.like-button:disabled:hover {
  background-color: transparent;
}

.loading-text {
  font-size: 1.2rem;
  color: #999;
}

.like-icon {
  font-style: normal;
  font-size: 1.6rem;
  transition: all 0.3s ease;
  color: #ccc;
}

.like-icon.liked-icon {
  color: #ff4757;
  transform: scale(1.2);
  text-shadow: 0 0 10px rgba(255, 71, 87, 0.4);
  animation: heartBeat 0.6s ease-in-out;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1.2);
  }
}

.like-count {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  user-select: none;
}

/* 创建时间 */
.blog-meta {
  font-size: 0.85rem;
  color: #777;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

/* 加载和错误状态 */
.loading-message, .error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: #666;
}

.error-message {
  color: #e74c3c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .blog-detail-container {
    padding: 10px;
  }
  
  .blog-layout {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .blog-image-section {
    min-height: 300px;
  }
  
  .blog-content-section {
    padding: 20px;
    gap: 16px;
  }
  
  .blog-title {
    font-size: 1.5rem;
  }
  
  .like-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .blog-content-section {
    padding: 16px;
  }
  
  .blog-title {
    font-size: 1.3rem;
  }
  
  .author-info {
    gap: 8px;
  }
  
  .avatar-image, .avatar-placeholder {
    width: 32px;
    height: 32px;
  }
  
  .author-name {
    font-size: 0.9rem;
  }
}

/* 内容样式 */
.blog-content ::v-deep(h1),
.blog-content ::v-deep(h2),
.blog-content ::v-deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #2c3e50;
}

.blog-content ::v-deep(p) {
  margin-bottom: 1em;
}

.blog-content ::v-deep(ul),
.blog-content ::v-deep(ol) {
  margin-bottom: 1em;
  padding-left: 2em;
}

.blog-content ::v-deep(a) {
  color: #3498db;
  text-decoration: underline;
}

.blog-content ::v-deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}
</style> 