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
  },
  // 搜索博客
  searchBlogs(searchParams) {
    return apiClient.post('/blog/search', searchParams);
  },

  // 通知相关接口
  // 获取通知列表
  getNotificationList(params = {}) {
    const defaultParams = {
      current: 1,
      pageSize: 10,
      isRead: null, // null-全部，0-未读，1-已读
      type: null    // null-全部，'LIKE'-点赞，'COMMENT'-评论，'FOLLOW'-关注，'SYSTEM'-系统
    };
    const requestParams = { ...defaultParams, ...params };
    return apiClient.post('/api/notification/list', requestParams);
  },

  // 获取未读通知数量
  getUnreadNotificationCount() {
    return apiClient.get('/api/notification/unread/count');
  },

  // 标记单个通知为已读
  markNotificationAsRead(notificationId) {
    return apiClient.post(`/api/notification/read/${String(notificationId)}`);
  },

  // 批量标记所有通知为已读
  markAllNotificationsAsRead() {
    return apiClient.post('/api/notification/read/all');
  },

  // 删除通知
  deleteNotification(notificationId) {
    return apiClient.delete(`/api/notification/${String(notificationId)}`);
  },

  // 实时通知相关接口
  // 获取WebSocket连接信息
  getWebSocketConnectionInfo() {
    return apiClient.get('/api/realtime/connection-info');
  },

  // 获取用户在线状态
  getUserOnlineStatus() {
    return apiClient.get('/api/realtime/status');
  },

  // 发送测试通知（开发测试用）
  sendTestNotification(targetUserId, message = '测试通知') {
    return apiClient.post('/api/realtime/test', null, {
      params: { targetUserId: String(targetUserId), message }
    });
  }
}; 