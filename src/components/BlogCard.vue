<template>
  <div class="blog-card" @click="navigateToDetail">
    <div class="blog-card-image-container">
      <img v-if="blog.coverImg" :src="blog.coverImg" :alt="blog.title" class="blog-card-image">
      <img v-else src="https://via.placeholder.com/400x500?text=No+Image" alt="No Image Available" class="blog-card-image">
      <div class="blog-card-likes">
        <i class="like-icon">&#10084;</i> {{ blog.thumbCount }}
      </div>
    </div>
    <div class="blog-card-content">
      <h3 class="blog-card-title">{{ blog.title }}</h3>
      <p class="blog-card-excerpt">{{ truncateContent(blog.content) }}</p>
      <div class="blog-card-footer">
        <span class="blog-card-meta">{{ formatDate(blog.createTime) }}</span>
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

const truncateContent = (content) => {
  if (!content) return '';
  // 移除HTML标签
  const plainText = content.replace(/<[^>]*>?/gm, '');
  // 截取前60个字符
  return plainText.length > 60 ? plainText.substring(0, 60) + '...' : plainText;
}
</script>

<style scoped>
.blog-card {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%; 
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.08);
}

.blog-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.blog-card-image-container {
  position: relative;
  width: 100%;
}

.blog-card-image {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  display: block;
}

.blog-card-likes {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
}

.blog-card-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.blog-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-card-excerpt {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
  margin-bottom: 8px;
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
}

.blog-card-meta {
  font-size: 0.7rem;
  color: #999;
}

.like-icon {
  margin-right: 5px;
  font-style: normal;
  color: #ff385c;
}
</style> 