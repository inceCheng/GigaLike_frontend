<template>
  <div class="blog-detail-view container">
    <div v-if="isLoading" class="loading-message">Loading blog details...</div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <article v-if="blog && !isLoading && !error">
      <router-link to="/" class="back-link">&larr; Back to Home</router-link>
      <h1 class="blog-title">{{ blog.title }}</h1>
      <img v-if="blog.coverImg" :src="blog.coverImg" :alt="blog.title" class="blog-cover-image">
      <img v-else src="https://via.placeholder.com/800x400?text=No+Image" alt="No Image Available" class="blog-cover-image">
      
      <div class="blog-meta">
        <span>Created: {{ formatDate(blog.createTime) }}</span>
      </div>
      
      <BlogContent :content="blog.content" />
      
      <div class="like-section">
        <button @click="handleLike" :class="{ 'liked': blog.hasThumb, 'unliked': !blog.hasThumb }" :disabled="likeActionLoading">
          <span v-if="likeActionLoading">Processing...</span>
          <span v-else><i class="like-icon">&#10084;</i> {{ blog.hasThumb ? 'Unlike' : 'Like' }}</span>
        </button>
        <span class="like-count">{{ blog.thumbCount }} Likes</span>
        <p v-if="likeError" class="error-message">{{ likeError }}</p>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import BlogContent from '../components/BlogContent.vue'

const props = defineProps({
  id: { // Received from router path: '/blog/:id'
    type: [String, Number],
    required: true
  }
})

const route = useRoute()
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
  if (!localStorage.getItem('gigaLikeUserId')) {
    likeError.value = 'You must be logged in to like a post.';
    return;
  }
  likeError.value = '';
  likeActionLoading.value = true;
  try {
    // Use the hasThumb property from backend to determine if we should like or unlike
    const response = await api.toggleThumb(props.id, blog.value.hasThumb);
    if (response.data && response.data.code === 0) {
      // Update the blog data - refetch to get accurate data
      await fetchBlogDetails();
    } else {
      likeError.value = response.data.message || 'Failed to update like status.';
    }
  } catch (err) {
    console.error('Failed to toggle like:', err);
    likeError.value = 'An error occurred while liking the post.';
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

onMounted(() => {
  fetchBlogDetails()
})
</script>

<style scoped>
.blog-detail-view {
  padding-bottom: 3rem; /* Space for footer */
}

.back-link {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}
.back-link:hover {
  text-decoration: underline;
}

.blog-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.blog-cover-image {
  width: 100%;
  max-height: 450px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.blog-meta {
  display: flex;
  gap: 1.5rem; /* Spacing between meta items */
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  flex-wrap: wrap; /* Allow wrapping on smaller screens */
}

.blog-meta span {
  padding-right: 1.5rem;
  border-right: 1px solid #ddd;
}
.blog-meta span:last-child {
  border-right: none;
  padding-right: 0;
}

.blog-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #333;
  margin-bottom: 2rem;
}

/* Styles for content coming from v-html (e.g., if backend sends HTML) */
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

.like-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.like-section button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  border-radius: 25px; /* Pill shape */
  border: 2px solid transparent;
  transition: all 0.3s ease;
  font-weight: bold;
}

.like-section button.liked {
  background-color: #e91e63; /* Pink for liked */
  color: white;
  border-color: #e91e63;
}

.like-section button.liked:hover {
  background-color: #c2185b; /* Darker pink */
}

.like-section button.unliked {
  background-color: #f0f2f5; /* Light grey for unliked */
  color: #333;
  border-color: #ddd;
}

.like-section button.unliked:hover {
  background-color: #e0e0e0;
  border-color: #ccc;
}

.like-icon {
  margin-right: 8px;
  font-style: normal;
}

.like-count {
  font-size: 1.1rem;
  font-weight: bold;
  color: #555;
}
</style> 