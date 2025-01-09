// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.userType === 1)
  const isBlacklisted = computed(() => userInfo.value?.status === 0)

  // 初始化用户信息
  const initializeFromStorage = () => {
    const storedToken = localStorage.getItem('token')
    const storedUserInfo = localStorage.getItem('userInfo')
    
    if (storedToken) {
      token.value = storedToken
    }
    if (storedUserInfo) {
      userInfo.value = JSON.parse(storedUserInfo)
    }
  }

  // 登录成功后设置用户信息
  const setUserInfo = (info) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  // 设置 token
  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 登出时清除信息
  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 更新用户信息
  const updateUserInfo = (info) => {
    if (userInfo.value) {
      Object.assign(userInfo.value, info)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    isBlacklisted,
    setToken,
    setUserInfo,
    initializeFromStorage,
    logout,
    updateUserInfo
  }
})