import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useAdminStore = defineStore('admin', () => {
  const pendingStats = ref({
    pendingComplaints: 0,
    pendingClaims: 0
  })
  
  const operationLogs = ref([])

  const fetchPendingStats = async () => {
    try {
      const data = await request.get('/api/admin/pending-stats')
      pendingStats.value = data
    } catch (error) {
      console.error('获取待处理事项统计失败:', error)
      throw error
    }
  }

  const addToBlacklist = async (blacklistData) => {
    try {
      await request.post('/api/admin/blacklist', blacklistData)
    } catch (error) {
      console.error('添加黑名单失败:', error)
      throw error
    }
  }

  return {
    pendingStats,
    operationLogs,
    fetchPendingStats,
    addToBlacklist
  }
}) 