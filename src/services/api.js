import apiClient from './axios';

export default {
  login(userId) {
    return apiClient.get(`/user/login?userId=${userId}`);
  },
  getBlogs() {
    return apiClient.get('/blog/list');
  },
  getBlogDetails(blogId) {
    return apiClient.get(`/blog/get?blogId=${blogId}`);
  },
  createBlog(blogData) {
    return apiClient.post('/blog/create', blogData);
  },
  doThumb(blogId) {
    return apiClient.post('/thumb/do', { blogId: parseInt(blogId) });
  },
  undoThumb(blogId) {
    return apiClient.post('/thumb/undo', { blogId: parseInt(blogId) });
  },
  // Helper method to toggle thumb based on current status
  toggleThumb(blogId, isLiked) {
    if (isLiked) {
      return this.undoThumb(blogId);
    } else {
      return this.doThumb(blogId);
    }
  }
}; 