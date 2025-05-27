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
            <p>暂无图片</p>
          </div>
        </div>

        <!-- 右侧详情区域 -->
        <div class="blog-content-section">
          <!-- 作者信息 - 最上方 -->
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
            <div class="author-details">
              <span class="author-name">
                {{ blog.author.displayName || blog.author.username }}
              </span>
              <span v-if="blog.author.bio" class="author-bio">
                {{ blog.author.bio }}
              </span>
            </div>
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

          <!-- 发布时间 -->
          <div class="blog-meta">
            <i class="fa-regular fa-clock"></i>
            <span>{{ formatDate(blog.createTime) }}</span>
          </div>

          <!-- 点赞信息 - 最下方 -->
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
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return '昨天发布';
  } else if (diffDays < 7) {
    return `${diffDays}天前发布`;
  } else {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('zh-CN', options) + ' 发布';
  }
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
  background-color: #ffffff;
}

.blog-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  margin-bottom: 24px;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  transition: color 0.2s ease;
  padding: 4px 8px;
  border-radius: 6px;
}

.back-link:hover {
  color: #0056b3;
  background-color: rgba(0, 123, 255, 0.05);
}

.blog-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e9ecef;
  min-height: 600px;
}

/* 左侧图片区域 */
.blog-image-section {
  position: relative;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
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
  text-align: center;
}

.no-image-placeholder i {
  font-size: 4rem;
  margin-bottom: 16px;
  color: #ddd;
}

/* 右侧详情区域 */
.blog-content-section {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: #ffffff;
}

/* 作者信息 - 最上方 */
.author-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.author-avatar {
  flex-shrink: 0;
}

.avatar-image {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #f8f9fa;
}

.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #adb5bd;
  font-size: 1.2rem;
  border: 2px solid #e9ecef;
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.author-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #212529;
}

.author-bio {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.4;
}

/* 文章标题 */
.blog-title {
  font-size: 2.2rem;
  font-weight: bold;
  color: #212529;
  line-height: 1.3;
  margin: 0;
}

/* 文章内容 */
.blog-content {
  flex: 1;
  font-size: 1.05rem;
  line-height: 1.7;
  color: #495057;
}

/* 话题标签 */
.topics-section {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.topic-tag {
  color: #495057;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 6px 12px;
  background-color: #f8f9fa;
  border-radius: 16px;
  border: 1px solid #e9ecef;
}

.topic-tag:hover {
  background-color: #e9ecef;
  color: #212529;
}

/* 发布时间 */
.blog-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #6c757d;
  padding: 12px 0;
}

.blog-meta i {
  color: #adb5bd;
}

/* 点赞区域 - 最下方 */
.like-section {
  padding: 20px 0;
  border-top: 1px solid #f0f0f0;
}

.like-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.like-button {
  width: 56px;
  height: 56px;
  border: none;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.like-button:hover {
  background: transparent;
  transform: scale(1.1);
}

.like-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}

.like-button:disabled:hover {
  background: transparent;
  transform: none;
}

.loading-text {
  font-size: 1.4rem;
  color: #ff6b9d;
  font-weight: 600;
}

.like-icon {
  font-style: normal;
  font-size: 2.2rem;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  color: #adb5bd;
  filter: drop-shadow(0 2px 4px rgba(173, 181, 189, 0.2));
}

.like-icon.liked-icon {
  color: #ff1744;
  transform: scale(1.3);
  filter: drop-shadow(0 4px 12px rgba(255, 23, 68, 0.4));
  animation: loveExplosion 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes loveExplosion {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.5) rotate(-5deg);
  }
  50% {
    transform: scale(1.8) rotate(5deg);
  }
  75% {
    transform: scale(1.4) rotate(-2deg);
  }
  100% {
    transform: scale(1.3) rotate(0deg);
  }
}

/* 添加点击时的粒子效果 */
.like-button:active .like-icon.liked-icon {
  animation: loveExplosion 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55), sparkle 1s ease-out;
}

@keyframes sparkle {
  0% {
    filter: drop-shadow(0 4px 12px rgba(255, 23, 68, 0.4));
  }
  50% {
    filter: drop-shadow(0 4px 12px rgba(255, 23, 68, 0.8)) drop-shadow(0 0 20px rgba(255, 107, 157, 0.6));
  }
  100% {
    filter: drop-shadow(0 4px 12px rgba(255, 23, 68, 0.4));
  }
}

.like-count {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  user-select: none;
  transition: all 0.3s ease;
}

/* 加载和错误状态 */
.loading-message, .error-message {
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: #6c757d;
}

.error-message {
  color: #dc3545;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .blog-detail-container {
    padding: 16px;
  }
  
  .blog-layout {
    grid-template-columns: 1fr;
    gap: 0;
    border: none;
    border-radius: 0;
  }
  
  .blog-image-section {
    min-height: 300px;
    order: 2;
    border-top: 1px solid #e9ecef;
  }
  
  .blog-content-section {
    padding: 24px;
    gap: 20px;
    order: 1;
  }
  
  .blog-title {
    font-size: 1.8rem;
  }
  
  .author-info {
    gap: 12px;
  }
  
  .avatar-image, .avatar-placeholder {
    width: 40px;
    height: 40px;
  }
  
  .author-name {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .blog-content-section {
    padding: 20px;
  }
  
  .blog-title {
    font-size: 1.6rem;
  }
  
  .author-info {
    gap: 10px;
  }
  
  .avatar-image, .avatar-placeholder {
    width: 36px;
    height: 36px;
  }
  
  .author-name {
    font-size: 0.95rem;
  }
}

/* 内容样式 */
.blog-content ::v-deep(h1),
.blog-content ::v-deep(h2),
.blog-content ::v-deep(h3) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  color: #212529;
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
  color: #007bff;
  text-decoration: underline;
}

.blog-content ::v-deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
  border: 1px solid #e9ecef;
}
</style> 