import api from './api'

export const accountService = {
  getMyAccounts: () => api.get('/accounts'),
  createAccount: (data) => api.post('/accounts', data),
  getBalance: (accountNumber) => api.get(`/accounts/${accountNumber}/balance`),
  getAccount: (accountNumber) => api.get(`/accounts/${accountNumber}`),
}