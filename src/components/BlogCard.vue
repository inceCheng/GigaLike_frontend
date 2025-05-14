<template>
  <div class="blog-card" @click="navigateToDetail">
    <div class="blog-card-image-container">
      <img v-if="blog.coverImg" :src="blog.coverImg" :alt="blog.title" class="blog-card-image">
      <img v-else src="https://via.placeholder.com/400x500?text=No+Image" alt="No Image Available" class="blog-card-image">
      <div class="blog-card-overlay">
        <div class="blog-card-likes">
          <i class="like-icon">❤️</i> {{ blog.thumbCount }}
        </div>
      </div>
    </div>
    <div class="blog-card-content">
      <h3 class="blog-card-title">{{ blog.title }}</h3>
      <p class="blog-card-excerpt">{{ truncateContent(blog.content) }}</p>
      <div class="blog-card-footer">
        <div class="blog-card-user">
          <div class="user-avatar"></div>
          <span class="user-name">用户{{ Math.floor(Math.random() * 1000) }}</span>
        </div>
        <div class="blog-card-interactions">
          <span class="interaction-item">
            <i class="interaction-icon">❤️</i>
            <span>{{ formatLikes(blog.thumbCount) }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  blog: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const navigateToDetail = () => {
  router.push({ name: 'BlogDetail', params: { id: props.blog.id } })
}

const truncateContent = (content) => {
  if (!content) return '';
  // 移除HTML标签
  const plainText = content.replace(/<[^>]*>?/gm, '');
  // 截取前50个字符
  return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
}

// 格式化点赞数，超过1000显示为1k
const formatLikes = (count) => {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count;
}
</script>

<style scoped>
.blog-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%; 
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05);
}

.blog-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.blog-card-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.blog-card-image {
  width: 100%;
  aspect-ratio: 4/5;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.blog-card:hover .blog-card-image {
  transform: scale(1.03);
}

.blog-card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 50px 10px 10px 10px;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);
}

.blog-card-likes {
  display: flex;
  align-items: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
}

.blog-card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.blog-card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-card-excerpt {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid #f5f5f5;
  padding-top: 10px;
}

.blog-card-user {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-right: 6px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cccccc"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>');
  background-size: 70%;
  background-position: center;
  background-repeat: no-repeat;
}

.user-name {
  font-size: 0.75rem;
  color: #666;
}

.blog-card-interactions {
  display: flex;
}

.interaction-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #999;
}

.interaction-icon {
  font-style: normal;
  margin-right: 4px;
  font-size: 0.85rem;
}

.like-icon {
  margin-right: 5px;
  font-style: normal;
}
</style> 