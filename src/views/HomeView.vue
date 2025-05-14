<template>
  <div class="home-view">
    <div class="banner">
      <h2>GigaLike</h2>
      <p class="slogan">发现精彩，分享喜爱</p>
    </div>
    
    <div class="container">
      <div v-if="isLoading" class="loading-message">Loading blogs...</div>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="!isLoading && !error && blogs.length === 0" class="info-message">暂时没有内容，快来分享你的第一篇博客吧！</div>
      
      <div v-if="blogs.length > 0" class="masonry-container">
        <div class="masonry-column" v-for="(column, columnIndex) in columns" :key="columnIndex">
          <BlogCard 
            v-for="blog in column" 
            :key="blog.id" 
            :blog="blog" 
            class="masonry-item"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '../services/api'
import BlogCard from '../components/BlogCard.vue'

const blogs = ref([])
const isLoading = ref(true)
const error = ref('')
const columnCount = ref(2) // 默认2列，在CSS媒体查询中会动态调整

// 根据屏幕宽度计算列数
const updateColumnCount = () => {
  if (window.innerWidth >= 1200) {
    columnCount.value = 4;  // 大屏幕4列
  } else if (window.innerWidth >= 768) {
    columnCount.value = 3;  // 中等屏幕3列
  } else {
    columnCount.value = 2;  // 小屏幕2列
  }
}

// 计算每列应该显示的博客
const columns = computed(() => {
  const result = Array.from({ length: columnCount.value }, () => []);
  blogs.value.forEach((blog, index) => {
    // 让较短的列优先添加新的博客
    const columnIndex = index % columnCount.value;
    result[columnIndex].push(blog);
  });
  return result;
});

// 监听窗口大小变化
onMounted(() => {
  updateColumnCount();
  window.addEventListener('resize', updateColumnCount);
});

const fetchBlogs = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await api.getBlogs()
    if (response.data && response.data.code === 0 && Array.isArray(response.data.data)) {
      blogs.value = response.data.data
    } else if (response.data && response.data.message) {
      error.value = response.data.message;
      blogs.value = [];
    } else {
      blogs.value = []
      error.value = 'Could not fetch blogs or blogs format is incorrect.';
    }
  } catch (err) {
    console.error('Failed to fetch blogs:', err)
    error.value = 'Failed to load blogs. Please try again later.'
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchBlogs()
})
</script>

<style scoped>
.home-view {
  padding-bottom: 3rem;
}

.banner {
  text-align: center;
  margin-bottom: 2rem;
  padding: 2rem 0;
}

.banner h2 {
  font-size: 2.5rem;
  color: #ffaaa5;
  margin-bottom: 0.5rem;
}

.slogan {
  font-size: 1.2rem;
  color: #777;
  margin: 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.masonry-container {
  display: flex;
  width: 100%;
  gap: 16px;
}

.masonry-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
}

.masonry-item {
  margin-bottom: 16px;
  break-inside: avoid;
}

.info-message {
  text-align: center;
  font-size: 1.1em;
  color: #555;
  padding: 3rem 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .masonry-container {
    gap: 12px;
  }
  
  .masonry-item {
    margin-bottom: 12px;
  }
}

@media (max-width: 480px) {
  .banner h2 {
    font-size: 2rem;
  }
  
  .slogan {
    font-size: 1rem;
  }
}
</style> 