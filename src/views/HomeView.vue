<template>
  <div class="home-container">
    <!-- 搜索结果提示 -->
    <div v-if="isSearchMode" class="search-result-header">
      <div class="search-info">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>搜索结果：{{ searchKeyword }}</span>
        <button class="clear-search-btn" @click="clearSearch">
          <i class="fa-solid fa-times"></i>
          清除搜索
        </button>
      </div>
    </div>

    <!-- 顶部标签导航栏 -->
    <div class="categories-container" v-if="!isSearchMode">
      <div class="categories-wrapper">
        <div 
          class="category-item" 
          :class="{ active: selectedTopicId === null }"
          @click="selectTopic(null)"
        >
          推荐
        </div>
        <div 
          v-for="topic in hotTopics" 
          :key="topic.id"
          class="category-item"
          :class="{ active: selectedTopicId === topic.id }"
          @click="selectTopic(topic.id)"
        >
          {{ topic.name }}
        </div>
      </div>
    </div>

    <!-- 内容区域 - 瀑布流 -->
    <div class="content-wrapper">
      <div class="blog-waterfall">
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <span>加载中...</span>
        </div>
        
        <div v-else-if="blogs.length === 0" class="empty-container">
          <p>
            {{ isSearchMode ? `没有找到与"${searchKeyword}"相关的内容` : 
               selectedTopicId ? '该话题下暂无博客内容' : '暂无博客内容' }}
          </p>
          <button @click="fetchBlogs" class="refresh-btn">刷新</button>
        </div>
        
        <div v-else class="blog-grid">
          <div v-for="blog in blogs" :key="blog.id" class="blog-grid-item">
            <blog-card :blog="blog" @click="viewBlogDetail(blog.id)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'
import BlogCard from '../components/BlogCard.vue'

const router = useRouter()
const route = useRoute()
const blogs = ref([])
const hotTopics = ref([])
const loading = ref(true)
const selectedTopicId = ref(null)
const searchKeyword = ref('')
const isSearchMode = ref(false)

// 模拟数据，当后端API没有实现时使用
const mockBlogs = [
  {
    id: 1,
    title: '浓郁到流汁的酸汤麻酱面!好吃到舞蹈起来',
    coverImg: 'https://picsum.photos/300/400?random=1',
    content: '今天做了一道超级美味的酸汤麻酱面，香气四溢，麻辣鲜香，做法简单，一起来看看吧！',
    thumbCount: 1234,
    createTime: '2024-06-25T10:30:00',
    hasThumb: false
  },
  {
    id: 2,
    title: '♥夏天的人鱼美甲💅',
    coverImg: 'https://picsum.photos/300/500?random=2',
    content: '今年夏天最流行的就是这种渐变色人鱼美甲啦，跟着教程自己在家也能做哦~',
    thumbCount: 987,
    createTime: '2024-06-24T15:45:00',
    hasThumb: false
  },
  {
    id: 3,
    title: '150｜这一套我好爱‼️',
    coverImg: 'https://picsum.photos/400/300?random=3',
    content: '近期入手的穿搭分享，超适合夏天，清凉舒适又好看！',
    thumbCount: 2345,
    createTime: '2024-06-23T09:20:00',
    hasThumb: false
  },
  {
    id: 4,
    title: '海边氛围感拍照/出片小技巧',
    coverImg: 'https://picsum.photos/350/450?random=4',
    content: '想要拍出高级感的海边照片？这些构图和姿势技巧一定要学会！',
    thumbCount: 876,
    createTime: '2024-06-22T14:10:00',
    hasThumb: false
  },
  {
    id: 5,
    title: '花小钱装大b 姐是专业的',
    coverImg: 'https://picsum.photos/320/420?random=5',
    content: '百元穿搭分享！这几套出街回头率超高，谁说没钱就不能穿得好看？',
    thumbCount: 3456,
    createTime: '2024-06-21T18:30:00',
    hasThumb: true
  },
  {
    id: 6,
    title: '把同居生活拍成电影第74天｜春日限定腌笃鲜',
    coverImg: 'https://picsum.photos/310/410?random=6',
    content: '记录的意义在于珍藏平凡的幸福，今天来做一道应季的腌笃鲜，香气扑鼻~',
    thumbCount: 1782,
    createTime: '2024-06-20T12:25:00',
    hasThumb: false
  }
]

// 加载热门话题
const loadHotTopics = async () => {
  try {
    const response = await api.getHotTopics(10)
    if (response.data && response.data.code === 0 && response.data.data) {
      hotTopics.value = response.data.data
      console.log('热门话题加载成功:', hotTopics.value)
    }
  } catch (error) {
    console.error('获取热门话题失败:', error)
    // 如果获取热门话题失败，可以设置一些默认话题
    hotTopics.value = []
  }
}

const fetchBlogs = async () => {
  loading.value = true
  try {
    let response
    
    if (isSearchMode.value && searchKeyword.value) {
      // 搜索模式
      response = await api.searchBlogs({
        keyword: searchKeyword.value,
        current: 1,
        pageSize: 20,
        sortField: 'createTime',
        sortOrder: 'desc'
      })
      
      if (response.data && response.data.code === 0 && response.data.data) {
        blogs.value = response.data.data.records || []
        console.log('搜索结果加载成功:', blogs.value.length, '篇博客')
      } else {
        console.warn('搜索响应异常:', response.data)
        blogs.value = []
      }
    } else {
      // 正常模式：根据选中的话题ID获取博客列表
      response = await api.getBlogs(selectedTopicId.value)
      if (response.data && response.data.code === 0 && response.data.data) {
        blogs.value = response.data.data
        console.log('博客列表加载成功:', blogs.value.length, '篇博客')
      } else {
        console.warn('博客列表响应异常:', response.data)
        blogs.value = []
      }
    }
  } catch (error) {
    console.error('获取博客列表失败:', error)
    // API 请求失败时，使用模拟数据（仅在推荐页面且非搜索模式）
    if (selectedTopicId.value === null && !isSearchMode.value) {
      blogs.value = mockBlogs
    } else {
      blogs.value = []
    }
  } finally {
    loading.value = false
  }
}

const selectTopic = async (topicId) => {
  if (selectedTopicId.value === topicId && !isSearchMode.value) {
    return // 如果点击的是当前已选中的话题且不在搜索模式，不做任何操作
  }
  
  // 退出搜索模式
  isSearchMode.value = false
  searchKeyword.value = ''
  
  selectedTopicId.value = topicId
  console.log('选择话题:', topicId === null ? '推荐' : `话题ID: ${topicId}`)
  
  // 清除URL中的搜索参数
  if (route.query.search) {
    router.replace({ path: '/' })
  }
  
  // 重新获取博客列表
  await fetchBlogs()
}

const viewBlogDetail = (blogId) => {
  router.push({ name: 'BlogDetail', params: { id: blogId } })
}

// 处理搜索
const handleSearch = async (keyword) => {
  if (!keyword || !keyword.trim()) {
    return
  }
  
  searchKeyword.value = keyword.trim()
  isSearchMode.value = true
  selectedTopicId.value = null // 清除话题选择
  
  console.log('执行搜索:', searchKeyword.value)
  await fetchBlogs()
}

// 清除搜索
const clearSearch = () => {
  isSearchMode.value = false
  searchKeyword.value = ''
  selectedTopicId.value = null
  
  // 清除URL中的搜索参数
  router.replace({ path: '/' })
  
  // 重新加载博客列表
  fetchBlogs()
}

// 监听路由查询参数变化
watch(() => route.query.search, (newSearch) => {
  if (newSearch) {
    handleSearch(newSearch)
  } else if (isSearchMode.value) {
    // 如果搜索参数被清除，退出搜索模式
    isSearchMode.value = false
    searchKeyword.value = ''
    fetchBlogs()
  }
}, { immediate: true })

onMounted(async () => {
  // 并行加载热门话题
  await loadHotTopics()
  
  // 如果URL中没有搜索参数，加载博客列表
  if (!route.query.search) {
    await fetchBlogs()
  }
})
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 0; /* 确保顶部没有额外间距 */
}

/* 搜索结果头部 */
.search-result-header {
  background-color: #fff;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.search-info i {
  color: var(--primary-color);
}

.search-info span {
  font-weight: 500;
  color: #333;
}

.clear-search-btn {
  margin-left: auto;
  padding: 0.3rem 0.8rem;
  background: #f5f5f5;
  border: none;
  border-radius: 16px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.clear-search-btn:hover {
  background: #e8e8e8;
  color: #333;
}

/* 顶部标签导航栏 */
.categories-container {
  background-color: #fff;
  padding: 0.4rem 0;
  margin-bottom: 0.3rem;
  border-bottom: 1px solid var(--border-color);
}

.categories-wrapper {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  padding: 0 0.5rem;
}

.categories-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.category-item {
  padding: 0.4rem 1rem;
  margin-right: 0.8rem;
  white-space: nowrap;
  font-size: 0.9rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-item:hover {
  background-color: #f5f5f5;
}

.category-item.active {
  background-color: var(--primary-color);
  color: white;
}

/* 内容区域 */
.content-wrapper {
  padding: 0 0.5rem;
}

.blog-waterfall {
  width: 100%;
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 2rem;
}

.blog-grid-item {
  break-inside: avoid;
  margin-bottom: 1rem;
}

/* 加载和空状态 */
.loading-container, .empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.refresh-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .blog-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
}
</style> 