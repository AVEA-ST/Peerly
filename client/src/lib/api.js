import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE + '/api',
  withCredentials: false,
})

// Users
export const createUser = (payload) => api.post('/users', payload).then(r => r.data)
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload).then(r => r.data)
export const getUser = (id) => api.get(`/users/${id}`).then(r => r.data)
export const searchUsers = (q='') => api.get('/users', { params: q ? { q } : {} }).then(r => r.data)

// Conversations
export const startOrGetDM = (userAId, userBId) => api.post('/conversations', { userAId, userBId }).then(r => r.data)
export const listConversations = (userId) => api.get('/conversations', { params: { userId } }).then(r => r.data)
export const getConversation = (id) => api.get(`/conversations/${id}`).then(r => r.data)

// Messages
export const listMessages = (conversationId, params={}) => api.get(`/messages/${conversationId}`, { params }).then(r => r.data)
export const sendMessage = (conversationId, payload) => api.post(`/messages/${conversationId}`, payload).then(r => r.data)
