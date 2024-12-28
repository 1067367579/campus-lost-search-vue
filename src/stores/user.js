// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../utils/request'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({
    userId: '',
    username: '',
    idNumber: '',
    phone: '',
    email: '',
    userType: 0,
    status: 1
  })
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.userType === 1)
  const isBlacklisted = computed(() => userInfo.value?.status === 0)
  
  // Actions
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  const setUserInfo = (info) => {
    userInfo.value = info
  }
  
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }
  
  const updateUserInfo = (info) => {
    userInfo.value = { ...userInfo.value, ...info }
  }
  
  const getUserInfo = async () => {
    try {
      const data = await request.get('/api/user/info')
      setUserInfo(data)
    } catch (error) {
      throw error
    }
  }
  
  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    setToken,
    setUserInfo,
    logout,
    isBlacklisted,
    updateUserInfo,
    getUserInfo
  }
})