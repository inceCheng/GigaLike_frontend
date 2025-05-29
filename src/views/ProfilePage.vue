<template>
  <div class="profile-container">
    <!-- Loading Spinner -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error Message -->
    <div class="error-message" v-if="error">
      {{ error }}
      <button @click="retryLoading">重试</button>
    </div>

    <div class="profile-header" v-if="!isLoading && !error">
      <div class="user-info">
        <div class="avatar-container">
          <img 
            :src="getAvatarUrl(userInfo.avatarUrl)" 
            class="avatar"
            @error="handleImageError"
            @load="handleImageLoad"
          />
          <div class="avatar-loading" v-if="isImageLoading">
            <div class="loading-spinner"></div>
          </div>
        </div>
        <div class="user-details">
          <h1>
            {{ userInfo.displayName || userInfo.username }}
            <span v-if="isCurrentUser && notificationStore.isConnected" class="online-status">在线</span>
          </h1>
          <p class="bio">{{ userInfo.bio || '这个人很懒，什么都没写~' }}</p>
          <p class="email" v-if="userInfo.email">{{ userInfo.email }}</p>
          <p class="ip-location" v-if="userInfo.lastLoginIpLocation">IP属地：{{ userInfo.lastLoginIpLocation }}</p>
        </div>
      </div>
      <div class="action-buttons">
        <button class="edit-profile" @click="handleEditProfile" v-if="isCurrentUser">编辑资料</button>
        <button class="logout" @click="confirmLogout" v-if="isCurrentUser">退出登录</button>
      </div>
    </div>

    <div class="profile-content" v-if="!isLoading && !error">
      <h2>我的帖子</h2>
      <div v-if="isPostsLoading" class="posts-loading">
        <div class="loading-spinner"></div>
      </div>
      <div v-else-if="postsError" class="posts-error">
        {{ postsError }}
        <button @click="loadUserPosts">重试</button>
      </div>
      <div v-else-if="userPosts.length === 0" class="no-posts">
        还没有发布任何帖子~
      </div>
      <div v-else class="posts-grid">
        <div v-for="post in userPosts" :key="post.id" class="post-card" @click="goToPost(post.id)">
          <div class="post-image-container">
            <img 
              :src="post.coverImg" 
              class="post-cover"
              @error="handlePostImageError($event, post.id)"
              :alt="post.title"
            />
            <div class="post-loading" v-if="loadingPosts[post.id]">
              <div class="loading-spinner"></div>
            </div>
          </div>
          <div class="post-info">
            <h3>{{ post.title }}</h3>
            <div class="post-stats">
              <span>{{ post.thumbCount }} 赞</span>
            </div>
          </div>
        </div>
      </div>
      <button 
        class="load-more-button" 
        @click="loadMore" 
        v-if="userPosts.length < total && !isPostsLoading"
      >
        加载更多
      </button>
    </div>

    <!-- 编辑资料弹窗 -->
    <div class="edit-modal" v-if="showEditModal" @click.self="handleCloseModal">
      <div class="modal-content">
        <h2>编辑资料</h2>
        
        <!-- 头像上传区域 - 移到顶部 -->
        <div class="avatar-section">
          <div class="avatar-upload-container">
            <div class="avatar-preview" :class="{ uploading: isAvatarUploading }" @click="selectAvatarFile">
              <img 
                :src="getAvatarUrl(editForm.avatarUrl)" 
                alt="头像预览"
                class="preview-image"
              />
              <div class="upload-overlay">
                <i class="fa-solid fa-camera"></i>
                <span>点击上传头像</span>
              </div>
              <div class="upload-progress" v-if="isAvatarUploading">
                <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
              </div>
            </div>
            <input
              ref="avatarFileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarFileSelect"
            />
            <div class="upload-tips">
              <p>支持 JPG、PNG、GIF、WebP 格式</p>
              <p>文件大小不超过 5MB</p>
            </div>
          </div>
        </div>
        
        <!-- 表单字段 -->
        <div class="form-group">
          <label>昵称</label>
          <input 
            type="text" 
            v-model="editForm.displayName" 
            :maxlength="30"
            placeholder="请输入昵称"
          />
        </div>
        <div class="form-group">
          <label>个人简介</label>
          <textarea 
            v-model="editForm.bio" 
            :maxlength="200"
            placeholder="介绍一下自己吧"
          ></textarea>
          <span class="char-count">{{ editForm.bio.length }}/200</span>
        </div>
        <div class="modal-buttons">
          <button 
            @click="handleSaveProfile" 
            :disabled="isSaving"
            class="save-button"
          >
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
          <button @click="handleCloseModal" :disabled="isSaving">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import apiClient from '@/services/axios'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const userPosts = ref([])
const showEditModal = ref(false)
const isLoading = ref(true)
const error = ref(null)
const isPostsLoading = ref(true)
const postsError = ref(null)
const isImageLoading = ref(true)
const loadingPosts = ref({})
const isSaving = ref(false)
const isAvatarUploading = ref(false)
const uploadProgress = ref(0)
const avatarFileInput = ref(null)

// Add pagination related refs
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

const editForm = ref({
  displayName: '',
  bio: '',
  avatarUrl: ''
})

const isCurrentUser = computed(() => {
  return userStore.getCurrentUserId === userStore.user?.id
})

// 使用store中的用户信息
const userInfo = computed(() => userStore.user || {})

onMounted(async () => {
  await loadUserInfo()
  await loadUserPosts()
})

const loadUserInfo = async () => {
  isLoading.value = true
  error.value = null
  isImageLoading.value = true
  
  try {
    // 验证session并获取最新用户信息
    const isValid = await userStore.validateSession()
    if (isValid && userStore.user) {
      editForm.value = {
        displayName: userStore.user.displayName || '',
        bio: userStore.user.bio || '',
        avatarUrl: userStore.user.avatarUrl || ''
      }
      
      if (!userStore.user.avatarUrl) {
        isImageLoading.value = false
      }
    } else {
      throw new Error('用户信息加载失败')
    }
  } catch (err) {
    error.value = err.message || '加载用户信息失败，请稍后重试'
    console.error('Failed to load user info:', err)
    isImageLoading.value = false
  } finally {
    isLoading.value = false
  }
}

const loadUserPosts = async () => {
  isPostsLoading.value = true
  postsError.value = null
  try {
    const response = await apiClient.get('/user/blogs', {
      params: {
        current: currentPage.value,
        pageSize: pageSize.value
      }
    })
    if (response.data.code === 0) {
      userPosts.value = response.data.data.records
      total.value = response.data.data.total
    } else {
      throw new Error(response.data.message || '加载帖子失败')
    }
  } catch (err) {
    postsError.value = err.message || '加载帖子失败，请稍后重试'
    console.error('Failed to load user posts:', err)
  } finally {
    isPostsLoading.value = false
  }
}

const handleImageLoad = () => {
  isImageLoading.value = false
}

const handleImageError = (event) => {
  event.target.src = '/images/default-avatar.png'
  isImageLoading.value = false
}

const handlePostImageError = (event, postId) => {
  event.target.src = '/images/default-post-cover.png'
  loadingPosts.value[postId] = false
}

const handleEditProfile = () => {
  showEditModal.value = true
}

const handleCloseModal = () => {
  if (!isSaving.value) {
    showEditModal.value = false
  }
}

const handleSaveProfile = async () => {
  isSaving.value = true
  try {
    const result = await userStore.updateUserInfo(editForm.value)
    if (result.success) {
      showEditModal.value = false
      
      // 如果头像有更新，强制刷新所有头像显示
      if (editForm.value.avatarUrl && userStore.user?.avatarUrl) {
        userStore.updateAvatarVersion()
      }
      
      message.success({
        content: '保存成功！',
        duration: 2,
      })
    } else {
      throw new Error(result.message || '保存失败')
    }
  } catch (error) {
    message.error({
      content: error.message || '保存失败，请稍后重试',
      duration: 3,
    })
  } finally {
    isSaving.value = false
  }
}

const confirmLogout = () => {
  Modal.confirm({
    title: '退出登录',
    content: '确定要退出登录吗？',
    okText: '确定',
    cancelText: '取消',
    class: 'custom-modal',
    okButtonProps: {
      danger: true
    },
    onOk: () => {
      handleLogout()
    }
  })
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push('/login')
    message.success({
      content: '已成功退出登录',
      duration: 2,
    })
  } catch (error) {
    console.error('Logout failed:', error)
    message.error({
      content: '退出登录失败，请稍后重试',
      duration: 3,
    })
  }
}

const retryLoading = async () => {
  await loadUserInfo()
  await loadUserPosts()
}

const goToPost = (postId) => {
  router.push(`/blog/${postId}`)
}

const getAvatarUrl = (avatarUrl) => {
  if (!avatarUrl) {
    return '/images/default-avatar.png'
  }
  // 使用头像版本号避免缓存
  return `${avatarUrl}?v=${userStore.avatarVersion}`
}

// Add load more function
const loadMore = async () => {
  if (userPosts.value.length >= total.value) {
    return
  }
  currentPage.value++
  await loadUserPosts()
}

// 头像上传相关方法
const selectAvatarFile = () => {
  if (!isAvatarUploading.value) {
    avatarFileInput.value?.click()
  }
}

const handleAvatarFileSelect = (event) => {
  const file = event.target.files[0]
  console.log('文件选择事件:', event.target.files)
  console.log('选择的文件:', file)
  
  if (file) {
    // 验证文件是否为有效的File对象
    if (file instanceof File) {
      console.log('文件验证通过，开始上传')
      uploadAvatar(file)
    } else {
      console.error('选择的不是有效的文件对象:', file)
      message.error('请选择有效的文件')
    }
  } else {
    console.log('没有选择文件')
  }
}

const validateAvatarFile = (file) => {
  // 文件类型验证
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    message.error('不支持的文件格式，请选择 JPG、PNG、GIF 或 WebP 格式的图片')
    return false
  }

  // 文件大小验证
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    message.error('文件大小不能超过 5MB')
    return false
  }

  return true
}

const uploadAvatar = async (file) => {
  if (!validateAvatarFile(file)) {
    return
  }

  // 验证文件对象
  if (!file || !(file instanceof File)) {
    message.error('请选择有效的文件')
    return
  }

  console.log('准备上传文件:', {
    name: file.name,
    size: file.size,
    type: file.type
  })

  isAvatarUploading.value = true
  uploadProgress.value = 0

  try {
    // 创建FormData
    const formData = new FormData()
    formData.append('file', file)

    // 验证FormData内容
    console.log('FormData内容:')
    for (let [key, value] of formData.entries()) {
      console.log(key, value)
    }

    // 上传头像文件 - 不设置Content-Type，让浏览器自动设置
    const response = await apiClient.post('/file/upload/avatar', formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          uploadProgress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
        }
      }
    })

    console.log('上传响应:', response.data)

    if (response.data.code === 0) {
      // 更新表单中的头像URL
      editForm.value.avatarUrl = response.data.data
      
      // 头像上传成功后，获取最新用户信息并同步localStorage
      try {
        // 等待一下，确保后端数据已经更新
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const userResponse = await apiClient.get('/user/current')
        
        if (userResponse.data.code === 0) {
          const newAvatarUrl = userResponse.data.data.avatarUrl
          const uploadedAvatarUrl = response.data.data
          
          if (newAvatarUrl === uploadedAvatarUrl) {
            // 后端数据已更新，使用后端返回的用户信息
            userStore.setUser(userResponse.data.data)
          } else {
            // 后端数据未更新，手动更新头像URL
            const updatedUser = {
              ...userResponse.data.data,
              avatarUrl: uploadedAvatarUrl
            }
            userStore.setUser(updatedUser)
          }
          
          // 更新头像版本号，强制刷新所有头像
          userStore.updateAvatarVersion()
          message.success('头像上传成功')
        } else {
          throw new Error('获取最新用户信息失败')
        }
      } catch (syncError) {
        console.error('同步用户信息失败:', syncError)
        // 如果同步失败，手动更新本地状态
        if (userStore.user) {
          const updatedUser = {
            ...userStore.user,
            avatarUrl: response.data.data
          }
          userStore.setUser(updatedUser)
          userStore.updateAvatarVersion()
        }
        message.success('头像上传成功')
      }
    } else {
      throw new Error(response.data.message || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    
    // 更详细的错误信息
    let errorMessage = '头像上传失败，请稍后重试'
    if (error.response) {
      console.error('响应错误:', error.response.data)
      errorMessage = error.response.data.message || errorMessage
    } else if (error.request) {
      console.error('请求错误:', error.request)
      errorMessage = '网络请求失败，请检查网络连接'
    } else {
      console.error('其他错误:', error.message)
      errorMessage = error.message || errorMessage
    }
    
    message.error(errorMessage)
  } finally {
    isAvatarUploading.value = false
    uploadProgress.value = 0
    // 清空文件输入框
    if (avatarFileInput.value) {
      avatarFileInput.value.value = ''
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  min-height: 400px;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #ff2442;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  text-align: center;
  padding: 20px;
  background: #fff3f3;
  border-radius: 8px;
  color: #ff2442;
  margin: 20px 0;
}

.error-message button {
  margin-top: 10px;
  padding: 8px 20px;
  background: #ff2442;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.profile-header {
  background: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin-right: 20px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
}

.user-details {
  flex: 1;
}

.user-details h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.online-status {
  font-size: 12px;
  color: #52c41a;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 12px;
  font-weight: 500;
}

.bio {
  margin: 10px 0;
  color: #666;
  white-space: pre-wrap;
  word-break: break-word;
}

.email {
  color: #999;
  font-size: 14px;
}

.ip-location {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.edit-profile {
  background: #ff2442;
  color: white;
}

.edit-profile:hover {
  background: #ff1a1a;
}

.logout {
  background: #f5f5f5;
  color: #666;
}

.logout:hover {
  background: #e5e5e5;
}

/* Posts Grid */
.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.post-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.post-card:hover {
  transform: translateY(-5px);
}

.post-image-container {
  position: relative;
  padding-top: 100%;
}

.post-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
}

.post-info {
  padding: 12px;
}

.post-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.post-stats {
  margin-top: 8px;
  color: #999;
  font-size: 14px;
}

/* Edit Modal */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.char-count {
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 12px;
  color: #999;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-buttons button {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.modal-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-button {
  background: #ff2442;
  color: white;
}

.save-button:hover:not(:disabled) {
  background: #ff1a1a;
}

/* 头像区域样式 */
.avatar-section {
  text-align: center;
  padding: 20px 0;
  margin-bottom: 30px;
  border-bottom: 1px solid #f0f0f0;
}

/* 头像上传样式 */
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid #f0f0f0;
  transition: border-color 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-preview:hover {
  border-color: #ff2442;
}

.avatar-preview.uploading {
  cursor: not-allowed;
  opacity: 0.7;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 12px;
  text-align: center;
}

.avatar-preview:hover .upload-overlay {
  opacity: 1;
}

.upload-overlay i {
  font-size: 24px;
  margin-bottom: 8px;
}

.upload-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #ff2442;
  transition: width 0.3s ease;
  border-radius: 2px;
}

.upload-tips {
  text-align: center;
  color: #999;
  font-size: 12px;
  line-height: 1.4;
}

.upload-tips p {
  margin: 2px 0;
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }

  .profile-header {
    padding: 20px;
  }

  .user-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .avatar-container {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .action-buttons {
    justify-content: center;
  }

  .posts-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  .modal-content {
    padding: 20px;
    width: 95%;
  }

  .avatar-section {
    padding: 15px 0;
    margin-bottom: 20px;
  }

  .avatar-preview {
    width: 120px;
    height: 120px;
  }

  .upload-overlay {
    font-size: 10px;
  }

  .upload-overlay i {
    font-size: 20px;
    margin-bottom: 6px;
  }
}

/* No Posts State */
.no-posts {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 12px;
  margin-top: 20px;
}

/* Posts Loading State */
.posts-loading {
  text-align: center;
  padding: 40px;
}

/* Posts Error State */
.posts-error {
  text-align: center;
  padding: 20px;
  background: #fff3f3;
  border-radius: 8px;
  color: #ff2442;
  margin-top: 20px;
}

.posts-error button {
  margin-top: 10px;
  padding: 8px 20px;
  background: #ff2442;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Add styles for the custom modal */
:deep(.custom-modal .ant-btn-primary) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.custom-modal .ant-btn-primary:hover) {
  background-color: #ff1a1a;
  border-color: #ff1a1a;
}

:deep(.custom-modal .ant-btn-default:hover) {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

/* Add this CSS in the <style> section */
.load-more-button {
  display: block;
  width: 200px;
  margin: 20px auto;
  padding: 12px 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.load-more-button:hover {
  background: #f5f5f5;
  border-color: #ccc;
}
</style> 