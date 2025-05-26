# 前后端联调 - 发布帖子功能完整实现

## 更新概述

根据后端接口文档，完整实现了发布帖子功能的前后端联调，包括文件上传、话题选择（热门话题下拉选择）、博客创建等完整流程。

## 主要功能实现

### 1. 文件上传功能

**接口**: `/api/file/upload/blog-image`

**实现特性**:
- 支持本地文件上传（JPG、PNG格式）
- 文件大小限制：5MB
- 上传进度显示（加载动画）
- 上传成功后获取临时文件路径
- 支持URL链接输入作为备选方案

**技术实现**:
```javascript
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    message.error('图片大小不能超过5MB')
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
      postForm.value.coverImg = response.data.data // 使用返回的临时文件路径
      imageUrl.value = response.data.data
      message.success('图片上传成功')
    }
  } catch (error) {
    message.error('图片上传失败，请稍后重试')
  } finally {
    isUploading.value = false
  }
}
```

### 2. 话题选择功能

**相关接口**:
- 热门话题：`/api/topic/hot`
- 搜索话题：`/api/topic/search`

**功能特性**:
- 输入"#"触发话题选择下拉框
- 显示热门话题列表（最多10个）
- 支持话题搜索和实时筛选
- 支持创建新话题
- 最多选择10个话题
- 防重复添加
- 话题格式：`#话题名称`

**交互流程**:
1. 用户输入"#"字符
2. 自动显示热门话题下拉框
3. 继续输入进行话题搜索
4. 点击选择话题或创建新话题
5. 话题添加到列表中

**技术实现**:
```javascript
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
}
```

### 3. 博客创建功能

**接口**: `/api/blog/create`

**请求数据结构**:
```javascript
{
  "title": "博客标题",
  "content": "博客内容",
  "coverImg": "临时文件路径", // 来自文件上传接口
  "topicNames": ["话题1", "话题2", "话题3"] // 话题名称数组
}
```

**完整发布流程**:
1. 用户填写标题和内容
2. 上传封面图片（可选）
3. 选择或创建话题（可选）
4. 点击发布按钮
5. 调用创建博客接口
6. 成功后跳转到博客详情页

**技术实现**:
```javascript
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
      coverImg: postForm.value.coverImg || null, // 临时文件路径
      topicNames: postForm.value.topics // 话题名称数组
    }

    const response = await apiClient.post('/blog/create', postData)
    
    if (response.data.code === 0) {
      localStorage.removeItem('post_draft') // 清除草稿
      message.success('帖子发布成功！')
      router.push(`/blog/${response.data.data}`) // 跳转到详情页
    }
  } catch (error) {
    message.error('发布失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}
```

## 用户体验优化

### 1. 视觉设计
- **上传状态**: 显示加载动画和进度提示
- **话题样式**: 使用深蓝色主题色 `rgb(19, 56, 108)`
- **下拉框**: 现代化设计，支持悬停效果
- **响应式**: 适配移动端和桌面端

### 2. 交互体验
- **实时反馈**: 字符计数、上传进度、操作状态
- **智能提示**: 热门话题推荐、搜索建议
- **键盘操作**: 支持回车、空格、ESC键操作
- **防误操作**: 重复检测、数量限制、确认提示

### 3. 数据持久化
- **草稿保存**: 自动保存用户输入内容
- **状态恢复**: 页面刷新后恢复编辑状态
- **错误处理**: 网络异常时的优雅降级

## 接口对接详情

### 1. 文件上传接口

**请求方式**: `POST /api/file/upload/blog-image`

**请求参数**:
- `file`: 图片文件（必需）
- `title`: 文件标题（必需）
- `blogId`: 博客ID（可选）

**响应格式**:
```javascript
{
  "code": 0,
  "data": "临时文件路径",
  "message": ""
}
```

### 2. 热门话题接口

**请求方式**: `GET /api/topic/hot`

**请求参数**:
- `limit`: 返回数量限制（可选，默认10）

**响应格式**:
```javascript
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "技术",
      "description": "技术相关话题",
      "postCount": 100,
      "followCount": 50,
      "isOfficial": true,
      // ... 其他字段
    }
  ]
}
```

### 3. 话题搜索接口

**请求方式**: `GET /api/topic/search`

**请求参数**:
- `keyword`: 搜索关键词（必需）

**响应格式**: 同热门话题接口

### 4. 博客创建接口

**请求方式**: `POST /api/blog/create`

**请求数据**:
```javascript
{
  "title": "博客标题",
  "content": "博客内容",
  "coverImg": "临时文件路径",
  "topicNames": ["话题1", "话题2"]
}
```

**响应格式**:
```javascript
{
  "code": 0,
  "data": "博客ID",
  "message": ""
}
```

## 错误处理

### 1. 文件上传错误
- 文件大小超限
- 文件格式不支持
- 网络上传失败
- 服务器处理错误

### 2. 话题相关错误
- 话题搜索失败
- 话题数量超限
- 重复话题添加

### 3. 发布相关错误
- 必填字段验证
- 网络请求失败
- 服务器业务错误

## 测试建议

### 1. 功能测试
- [ ] 文件上传功能（各种格式、大小）
- [ ] 话题选择功能（热门话题、搜索、创建）
- [ ] 博客发布功能（完整流程）
- [ ] 草稿保存和恢复
- [ ] 表单验证和错误处理

### 2. 界面测试
- [ ] 响应式布局适配
- [ ] 加载状态显示
- [ ] 话题下拉框交互
- [ ] 移动端体验

### 3. 性能测试
- [ ] 大文件上传性能
- [ ] 话题搜索响应速度
- [ ] 页面加载性能

## 部署注意事项

1. **后端接口**: 确保所有相关接口已部署并可访问
2. **文件存储**: 确认文件上传的存储配置正确
3. **跨域配置**: 确保前后端跨域请求配置正确
4. **环境变量**: 检查API基础URL等环境配置

## 后续优化方向

### 1. 功能增强
- 图片编辑功能（裁剪、滤镜）
- 富文本编辑器
- 话题关注功能
- 定时发布功能

### 2. 性能优化
- 图片压缩和优化
- 话题搜索防抖
- 组件懒加载
- 缓存策略优化

### 3. 用户体验
- 拖拽上传支持
- 快捷键操作
- 自动保存优化
- 离线编辑支持 