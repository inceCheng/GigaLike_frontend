import apiClient from './axios';

export default {
  login(userId) {
    return apiClient.get(`/user/login?userId=${userId}`);
  },
  getBlogs(topicId = null) {
    // 支持按话题筛选博客列表
    const params = topicId ? { topicId: String(topicId) } : {};
    return apiClient.get('/blog/list', { params });
  },
  getBlogDetails(blogId) {
    // 确保blogId作为字符串传递，避免大整数精度丢失
    return apiClient.get(`/blog/get?blogId=${String(blogId)}`);
  },
  createBlog(blogData) {
    return apiClient.post('/blog/create', blogData);
  },
  createBlog(blogData) {
    return apiClient.post('/blog/create', blogData);
  },
  doThumb(blogId) {
    // 使用字符串形式传递大整数，避免精度丢失
    return apiClient.post('/thumb/do', { blogId: String(blogId) });
  },
  undoThumb(blogId) {
    // 使用字符串形式传递大整数，避免精度丢失
    return apiClient.post('/thumb/undo', { blogId: String(blogId) });
  },
  // Helper method to toggle thumb based on current status
  toggleThumb(blogId, isLiked) {
    if (isLiked) {
      return this.undoThumb(blogId);
    } else {
      return this.doThumb(blogId);
    }
  },
  // 话题相关接口
  getHotTopics(limit = 10) {
    return apiClient.get('/topic/hot', { params: { limit } });
  },
  searchTopics(keyword) {
    return apiClient.get('/topic/search', { params: { keyword } });
  },
  getTopicDetails(topicId) {
    return apiClient.get(`/topic/get?topicId=${String(topicId)}`);
  }
}; 