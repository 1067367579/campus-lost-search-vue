import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'
import dayjs from 'dayjs'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = userStore.token
    }
    
    // 确保 url 正确
    if (!config.url.startsWith('/')) {
      config.url = '/' + config.url
    }
    
    // 处理请求数据中的时间格式
    if (config.data && (config.data.lostTime || config.data.foundTime)) {
      const data = { ...config.data }
      if (data.lostTime) {
        data.lostTime = dayjs(data.lostTime).toISOString()
      }
      if (data.foundTime) {
        data.foundTime = dayjs(data.foundTime).toISOString()
      }
      config.data = data
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
    const { code, msg, data } = response.data
    
    if (code === 1) {
      return data
    }
    
    ElMessage.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  error => {
    if (error.response) {
      const { status } = error.response
      switch (status) {
        case 401:
          ElMessage.error('请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有操作权限')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(error.response?.data?.msg || '网络错误')
      }
    } else {
      ElMessage.error('网络连接失败')
    }
    return Promise.reject(error)
  }
)

export default request 