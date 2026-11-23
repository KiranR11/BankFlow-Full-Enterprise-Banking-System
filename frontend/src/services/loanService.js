import api from './api'

export const loanService = {
  apply: (data) => api.post('/loans/apply', data),
  getMyLoans: () => api.get('/loans/my-loans'),
  getLoan: (loanId) => api.get(`/loans/${loanId}`),
  getEmiSchedule: (loanId) => api.get(`/loans/${loanId}/emi-schedule`),
  getPendingLoans: () => api.get('/loans/pending'),
  approveLoan: (loanId) => api.put(`/loans/${loanId}/approve`),
  rejectLoan: (loanId, reason) => api.put(`/loans/${loanId}/reject?reason=${reason}`),
}