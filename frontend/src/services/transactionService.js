import api from './api'

export const transactionService = {
  deposit: (data) => api.post('/transactions/deposit', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  transfer: (data) => api.post('/transactions/transfer', data),
  getHistory: (page = 0, size = 20) => api.get(`/transactions/history?page=${page}&size=${size}`),
  getAccountTransactions: (accountNumber) => api.get(`/transactions/account/${accountNumber}`),
}