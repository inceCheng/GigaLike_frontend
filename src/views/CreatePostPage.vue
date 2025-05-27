<template>
  <div class="create-post-container">
    <div class="create-post-header">
      <h1>发布新帖子</h1>
      <p>分享你的想法和创意</p>
    </div>

    <div class="create-post-form">
      <div class="form-section">
        <label class="form-label">标题 *</label>
        <input 
          type="text" 
          v-model="postForm.title" 
          placeholder="请输入帖子标题"
          class="form-input"
          :maxlength="100"
        />
        <div class="char-count">{{ postForm.title.length }}/100</div>
      </div>

      <div class="form-section">
        <label class="form-label">封面图片</label>
        <div
          class="cover-upload-area"
          @drop.prevent="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          :class="{ 'drag-over': isDragOver }"
        >
          <div v-if="postForm.coverImg" class="cover-preview">
            <img :src="postForm.coverImg" alt="封面预览" />
            <button type="button" @click="removeCoverImage" class="remove-cover-btn">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
          <div v-else class="cover-upload-placeholder" @click="triggerFileInput">
            <div v-if="isUploading" class="upload-loading">
              <div class="loading-spinner"></div>
              <p>上传中...</p>
            </div>
            <div v-else>
              <i class="fa-solid fa-image"></i>
              <p>点击或拖拽上传封面图片</p>
              <span>支持 JPG、PNG 格式，最大10MB</span>
            </div>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            @change="handleFileUpload"
            style="display: none"
          />
        </div>
      </div>

      <div class="form-section">
        <label class="form-label">内容 *</label>
        <textarea 
          v-model="postForm.content" 
          placeholder="写下你想分享的内容..."
          class="form-textarea"
          :maxlength="5000"
          rows="12"
        ></textarea>
        <div class="char-count">{{ postForm.content.length }}/5000</div>
      </div>

      <div class="form-section">
        <label class="form-label">话题</label>
        <div class="topics-input-container">
          <div class="topics-display">
            <span 
              v-for="(topic, index) in postForm.topics" 
              :key="index" 
              class="topic-item"
            >
              #{{ topic }}
              <button type="button" @click="removeTopic(index)" class="topic-remove">
                <i class="fa-solid fa-times"></i>
              </button>
            </span>
          </div>
          <div class="topic-input-wrapper">
            <input 
              type="text" 
              v-model="topicInput" 
              @input="handleTopicInput"
              @keydown.enter.prevent="addCurrentTopic"
              @keydown.space.prevent="addCurrentTopic"
              @keydown.escape="hideTopicSuggestions"
              @blur="handleTopicBlur"
              placeholder="输入#开始添加话题"
              class="topic-input"
              ref="topicInputRef"
            />
            <!-- 话题建议下拉框 -->
            <div v-if="showTopicSuggestions && (hotTopics.length > 0 || searchTopics.length > 0)" 
                 class="topic-suggestions">
              <div v-if="hotTopics.length > 0 && !topicSearchKeyword" class="suggestions-section">
                <div class="suggestions-title">热门话题</div>
                <div 
                  v-for="topic in hotTopics" 
                  :key="topic.id"
                  class="suggestion-item"
                  @mousedown.prevent="selectTopic(topic.name)"
                >
                  <span class="topic-name">#{{ topic.name }}</span>
                  <span class="topic-stats">{{ topic.postCount }} 帖子</span>
                </div>
              </div>
              <div v-if="searchTopics.length > 0 && topicSearchKeyword" class="suggestions-section">
                <div class="suggestions-title">搜索结果</div>
                <div 
                  v-for="topic in searchTopics" 
                  :key="topic.id"
                  class="suggestion-item"
                  @mousedown.prevent="selectTopic(topic.name)"
                >
                  <span class="topic-name">#{{ topic.name }}</span>
                  <span class="topic-stats">{{ topic.postCount }} 帖子</span>
                </div>
              </div>
              <div v-if="topicSearchKeyword && !searchTopics.some(t => t.name === topicSearchKeyword)" 
                   class="suggestions-section">
                <div 
                  class="suggestion-item create-new"
                  @mousedown.prevent="selectTopic(topicSearchKeyword)"
                >
                  <span class="topic-name">#{{ topicSearchKeyword }}</span>
                  <span class="create-label">创建新话题</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-help">最多添加10个话题，输入#开始选择或创建话题</div>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          @click="saveDraft" 
          class="btn-secondary"
          :disabled="isSubmitting"
        >
          保存草稿
        </button>
        <button 
          type="button" 
          @click="publishPost" 
          class="btn-primary"
          :disabled="!canPublish || isSubmitting"
        >
          {{ isSubmitting ? '发布中...' : '发布' }}
        </button>
      </div>
    </div>

    <!-- 预览模态框 -->
    <div v-if="showPreview" class="preview-modal" @click.self="closePreview">
      <div class="preview-content">
        <div class="preview-header">
          <h2>预览</h2>
          <button @click="closePreview" class="close-btn">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>
        <div class="preview-body">
          <div class="preview-post">
            <h1>{{ postForm.title }}</h1>
            <img v-if="postForm.coverImg" :src="postForm.coverImg" alt="封面" class="preview-cover" />
            <div class="preview-content-text">{{ postForm.content }}</div>
            <div v-if="postForm.topics.length" class="preview-topics">
              <span v-for="topic in postForm.topics" :key="topic" class="preview-topic">#{{ topic }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import apiClient from '@/services/axios'

const router = useRouter()
const userStore = useUserStore()
const fileInput = ref(null)
const topicInputRef = ref(null)

const postForm = ref({
  title: '',
  content: '',
  coverImg: '',
  topics: []
})

const topicInput = ref('')
const isSubmitting = ref(false)
const isUploading = ref(false)
const isDragOver = ref(false)
const showPreview = ref(false)
const showTopicSuggestions = ref(false)
const hotTopics = ref([])
const searchTopics = ref([])
const topicSearchKeyword = ref('')

const canPublish = computed(() => {
  return postForm.value.title.trim() && postForm.value.content.trim()
})

// 从localStorage恢复草稿
onMounted(async () => {
  const draft = localStorage.getItem('post_draft')
  if (draft) {
    try {
      const draftData = JSON.parse(draft)
      postForm.value = { ...postForm.value, ...draftData }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
  }
  
  // 加载热门话题
  await loadHotTopics()
})

// 加载热门话题
const loadHotTopics = async () => {
  try {
    const response = await apiClient.get('/topic/hot', {
      params: { limit: 10 }
    })
    if (response.data.code === 0) {
      hotTopics.value = response.data.data || []
    }
  } catch (error) {
    console.error('Failed to load hot topics:', error)
  }
}

// 搜索话题
const searchTopicsApi = async (keyword) => {
  if (!keyword.trim()) {
    searchTopics.value = []
    return
  }
  
  try {
    const response = await apiClient.get('/topic/search', {
      params: { keyword: keyword.trim() }
    })
    if (response.data.code === 0) {
      searchTopics.value = response.data.data || []
    }
  } catch (error) {
    console.error('Failed to search topics:', error)
    searchTopics.value = []
  }
}

const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const uploadFile = async (file) => {
  if (!file) return

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    message.error('图片大小不能超过10MB')
    return
  }

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    message.error('请选择图片文件')
    return
  }

  isUploading.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', postForm.value.title || 'blog-cover')

    const response = await apiClient.post('/file/upload/blog-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.code === 0) {
      postForm.value.coverImg = response.data.data
      message.success('图片上传成功')
    } else {
      throw new Error(response.data.message || '上传失败')
    }
  } catch (error) {
    console.error('Upload error:', error)
    message.error(error.message || '图片上传失败，请稍后重试')
  } finally {
    isUploading.value = false
    // 清空文件输入框
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  await uploadFile(file)
}

// 拖拽上传功能
const handleDragOver = (event) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  isDragOver.value = false
}

const handleDrop = async (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer.files
  if (files.length > 0) {
    await uploadFile(files[0])
  }
}

const removeCoverImage = () => {
  postForm.value.coverImg = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleTopicInput = async (event) => {
  const value = event.target.value
  
  if (value.startsWith('#')) {
    const keyword = value.slice(1) // 移除#号
    topicSearchKeyword.value = keyword
    showTopicSuggestions.value = true
    
    if (keyword.length > 0) {
      await searchTopicsApi(keyword)
    } else {
      searchTopics.value = []
    }
  } else if (value === '') {
    topicSearchKeyword.value = ''
    showTopicSuggestions.value = true
    searchTopics.value = []
  } else {
    showTopicSuggestions.value = false
  }
}

const selectTopic = (topicName) => {
  if (postForm.value.topics.length >= 10) {
    message.warning('最多只能添加10个话题')
    return
  }
  
  if (!postForm.value.topics.includes(topicName)) {
    postForm.value.topics.push(topicName)
  }
  
  topicInput.value = ''
  topicSearchKeyword.value = ''
  showTopicSuggestions.value = false
  
  // 重新聚焦输入框
  nextTick(() => {
    topicInputRef.value?.focus()
  })
}

const addCurrentTopic = () => {
  const value = topicInput.value.trim()
  if (!value) return
  
  let topicName = value
  if (value.startsWith('#')) {
    topicName = value.slice(1)
  }
  
  if (topicName && postForm.value.topics.length < 10 && !postForm.value.topics.includes(topicName)) {
    postForm.value.topics.push(topicName)
    topicInput.value = ''
    topicSearchKeyword.value = ''
    showTopicSuggestions.value = false
  } else if (postForm.value.topics.length >= 10) {
    message.warning('最多只能添加10个话题')
  }
}

const removeTopic = (index) => {
  postForm.value.topics.splice(index, 1)
}

const hideTopicSuggestions = () => {
  showTopicSuggestions.value = false
}

const handleTopicBlur = () => {
  // 延迟隐藏，以便点击建议项能够正常工作
  setTimeout(() => {
    showTopicSuggestions.value = false
  }, 200)
}

const saveDraft = () => {
  localStorage.setItem('post_draft', JSON.stringify(postForm.value))
  message.success('草稿已保存')
}

const publishPost = async () => {
  if (!canPublish.value) {
    message.error('请填写标题和内容')
    return
  }

  isSubmitting.value = true
  
  try {
    const postData = {
      title: postForm.value.title.trim(),
      content: postForm.value.content.trim(),
      coverImg: postForm.value.coverImg || null,
      topicNames: postForm.value.topics
    }

    const response = await apiClient.post('/blog/create', postData)
    
    if (response.data.code === 0) {
      // 清除草稿
      localStorage.removeItem('post_draft')
      message.success('帖子发布成功！')
      
      // 跳转到帖子详情页或首页
      if (response.data.data) {
        router.push(`/blog/${response.data.data}`)
      } else {
        router.push('/')
      }
    } else {
      throw new Error(response.data.message || '发布失败')
    }
  } catch (error) {
    console.error('Publish error:', error)
    message.error(error.message || '发布失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const openPreview = () => {
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
}
</script>

<style scoped>
.create-post-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.create-post-header {
  text-align: center;
  margin-bottom: 40px;
}

.create-post-header h1 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 8px;
}

.create-post-header p {
  color: #666;
  font-size: 1rem;
}

.create-post-form {
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 30px;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #ff2442;
  box-shadow: 0 0 0 3px rgba(255, 36, 66, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
  min-height: 200px;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s ease;
}

.form-textarea:focus {
  outline: none;
  border-color: #ff2442;
  box-shadow: 0 0 0 3px rgba(255, 36, 66, 0.1);
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.cover-upload-area {
  border: 2px dashed #e1e5e9;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.cover-upload-area.drag-over {
  border-color: #ff2442;
  background-color: rgba(255, 36, 66, 0.05);
}

.cover-preview {
  position: relative;
}

.cover-preview img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.remove-cover-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-upload-placeholder {
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cover-upload-placeholder:hover {
  background-color: #f8f9fa;
}

.upload-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff2442;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.cover-upload-placeholder i {
  font-size: 2rem;
  color: #ccc;
  margin-bottom: 12px;
  display: block;
}

.cover-upload-placeholder p {
  color: #666;
  margin-bottom: 4px;
}

.cover-upload-placeholder span {
  color: #999;
  font-size: 12px;
}

.form-help {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
}

/* 话题输入样式 */
.topics-input-container {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 8px;
  min-height: 44px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.topics-input-container:focus-within {
  border-color: #ff2442;
  box-shadow: 0 0 0 3px rgba(255, 36, 66, 0.1);
}

.topics-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-item {
  background: rgb(19, 56, 108);
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.topic-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.topic-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.topic-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 120px;
}

.topic-input {
  border: none;
  outline: none;
  width: 100%;
  padding: 4px;
  font-size: 14px;
}

/* 话题建议下拉框 */
.topic-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
}

.suggestions-section {
  padding: 8px 0;
}

.suggestions-section:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.suggestions-title {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background: #f8f9fa;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-item.create-new {
  border-top: 1px solid #f0f0f0;
}

.topic-name {
  color: rgb(19, 56, 108);
  font-weight: 500;
}

.topic-stats {
  font-size: 12px;
  color: #999;
}

.create-label {
  font-size: 12px;
  color: #ff2442;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #ff2442;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #ff1a1a;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #e1e5e9;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
}

/* 预览模态框样式 */
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.preview-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.preview-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f8f9fa;
}

.preview-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.preview-post h1 {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 16px;
}

.preview-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 16px;
}

.preview-content-text {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 16px;
}

.preview-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-topic {
  background: #f8f9fa;
  color: rgb(19, 56, 108);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .create-post-container {
    padding: 10px;
  }

  .create-post-form {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .preview-modal {
    padding: 10px;
  }

  .preview-content {
    max-height: 95vh;
  }

  .topic-suggestions {
    position: fixed;
    left: 10px;
    right: 10px;
    top: auto;
    bottom: 10px;
  }
}
</style> 