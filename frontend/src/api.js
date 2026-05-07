import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Auth endpoints
export const authAPI = {
  register: (email, password, familyName) =>
    api.post('/auth/register', { email, password, family_name: familyName }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  getCurrentUser: () =>
    api.get('/auth/me'),
}

// Family member endpoints
export const familyAPI = {
  getMembers: () =>
    api.get('/family/members'),
  getMember: (memberId) =>
    api.get(`/family/members/${memberId}`),
  createMember: (data) =>
    api.post('/family/members', data),
  updateMember: (memberId, data) =>
    api.put(`/family/members/${memberId}`, data),
  updateChildren: (memberId, childrenIds) =>
    api.put(`/family/members/${memberId}/children`, { children_ids: childrenIds }),
  updateSiblings: (memberId, siblingIds) =>
    api.put(`/family/members/${memberId}/siblings`, { sibling_ids: siblingIds }),
  deleteMember: (memberId) =>
    api.delete(`/family/members/${memberId}`),
  uploadPhoto: (memberId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/family/members/${memberId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getTree: () =>
    api.get('/family/tree'),
}

// Location endpoints
export const locationAPI = {
  searchLocations: (query) =>
    api.get('/locations/search', { params: { q: query } }),
  getAllLocations: (page = 1, limit = 50) =>
    api.get('/locations/all', { params: { page, limit } }),
  getLocationsByState: (state) =>
    api.get(`/locations/by-state/${state}`),
  getAllStates: () =>
    api.get('/locations/states'),
}

// Admin endpoints
export const adminAPI = {
  getAllChanges: () =>
    api.get('/admin/changes'),
  getUserChanges: (userId) =>
    api.get(`/admin/changes/user/${userId}`),
  getFamilyChanges: (familyId) =>
    api.get(`/admin/changes/family/${familyId}`),
  getAllUsers: () =>
    api.get('/admin/users'),
  toggleAdminStatus: (userId) =>
    api.put(`/admin/users/${userId}/admin`),
  getStatistics: () =>
    api.get('/admin/statistics'),
}

export default api
