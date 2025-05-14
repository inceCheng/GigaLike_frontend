import axios from 'axios';

const apiClient = axios.create({
  // Vite proxy will handle redirecting to http://localhost:8123
  baseURL: '/api'  // Using the base URL configured in vite.config.js
});

// Function to get current logged-in user ID from localStorage
const getCurrentUserId = () => {
  return localStorage.getItem('gigaLikeUserId');
};

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