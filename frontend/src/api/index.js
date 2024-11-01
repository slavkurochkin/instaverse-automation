import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_BASE_URL });

api.interceptors.request.use((req) => {
  if (localStorage.getItem('profile')) {
    const profile = JSON.parse(localStorage.getItem('profile'));

    req.headers.Authorization = `Bearer ${profile.token}`;
  }

  return req;
});

export const fetchStories = async () => api.get('/stories');
export const fetchUserStories = async (id) => api.get(`/stories/user/${id}`);
export const fetchStoriesByTag = async (tag) =>
  api.get(`/stories/tags?tagId=${tag}`);
export const fetchAllTags = async () => api.get(`/stories/alltags`);
export const createStory = async (story) => api.post('/stories', story);
export const updateStory = async (id, story) =>
  api.patch(`/stories/${id}`, story);
export const deleteStory = async (id) => api.delete(`/stories/${id}`);
export const deleteUserStories = async (id) =>
  api.delete(`/stories/user/${id}`);
export const deleteUserComments = async (id) =>
  api.delete(`/stories/comments/user/${id}`);
export const likeStory = async (id) => api.patch(`/stories/${id}/likeStory`);

// New function to add a comment to a story
export const commentOnStory = async (id, comment) =>
  api.post(`/stories/${id}/comment`, comment);

// Function to delete a comment from a story
export const deleteComment = async (storyId, commentId) =>
  api.delete(`/stories/${storyId}/comments/${commentId}`);

export const login = async (formValues) => api.post('/user/login', formValues);
export const signup = async (formValues) =>
  api.post('/user/signup', formValues);
export const updateUser = async (userId, formValues) =>
  api.patch(`/user/${userId}`, formValues);
export const deleteUser = async (userId) => api.delete(`/user/${userId}`);

export const getProfile = async (formValues) => api.get('/profile', formValues);
export const getUserProfiles = async () => api.get(`/profile/users`);
export const getUserProfile = async (userId) =>
  api.get(`/profile/users/${userId}`);

// export const fetchProfile = async () => api.get("/user/profile");
// export const updateProfile = async (formValues) => api.post("/user/profile", formValues);
