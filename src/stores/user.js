// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '../utils/request'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref('')
  const userInfo = ref(null)
  
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
  
  const updateUserInfo = async (updateData) => {
    try {
      await request.put('user/info', updateData)
      setUserInfo({ ...userInfo.value, ...updateData })
    } catch (error) {
      throw error
    }
  }
  
  const getUserInfo = async () => {
    try {
      const data = await request.get('user/info')
      setUserInfo(data)
    } catch (error) {
      throw error
    }
  }
  
  const login = async (loginData) => {
    try {
      const data = await request.post('user/login', loginData)
      setToken(data.token)
      setUserInfo(data)
    } catch (error) {
      throw error
    }
  }
  
  const register = async (registerData) => {
    try {
      await request.post('user/register', registerData)
    } catch (error) {
      throw error
    }
  }
  
  // 初始化时检查 localStorage
  const initializeFromStorage = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
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
    getUserInfo,
    initializeFromStorage,
    login,
    register
  }
})