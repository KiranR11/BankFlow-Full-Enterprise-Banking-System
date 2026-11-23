import api from './api'

export const userService = {
  getAllUsers: () => api.get('/users'),
  toggleStatus: (userId) => api.put(`/users/${userId}/toggle-status`),
  updateKyc: (userId, kycStatus) => api.put(`/users/${userId}/kyc?kycStatus=${kycStatus}`),
}