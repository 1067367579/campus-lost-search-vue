import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    // 确保 url 正确
    if (!config.url.startsWith('/')) {
      config.url = '/' + config.url
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 直接返回响应数据，不再判断code
    return response.data
  },
  error => {
    const errorMessage = error.response?.data?.message || error.message || '网络错误'
    ElMessage.error(errorMessage)
    return Promise.reject(error)
  }
)

export default request 