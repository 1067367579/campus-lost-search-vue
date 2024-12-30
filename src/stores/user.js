// src/stores/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import request from '@/utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.userType === 1)
  const isBlacklisted = computed(() => userInfo.value?.status === 0)

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUserInfo = (info) => {
    userInfo.value = info
  }

  const initializeFromStorage = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  const updateUserInfo = (info) => {
    if (userInfo.value) {
      Object.assign(userInfo.value, info)
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