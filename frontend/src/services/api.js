import axios from 'axios'

const api = axios.create({ 
  baseURL: '/api', 
  timeout: 15000 
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('bankflow_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('bankflow_token')
    localStorage.removeItem('bankflow_user')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

export default api