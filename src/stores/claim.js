import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useClaimStore = defineStore('claim', () => {
  const claims = ref([])
  const complaints = ref([])

  const submitClaim = async (claimData) => {
    try {
      const data = await request.post('/api/claim', claimData)
      return data
    } catch (error) {
      console.error('提交认领申请失败:', error)
      throw error
    }
  }

  const submitComplaint = async (complaintData) => {
    try {
      const data = await request.post('/api/complaint', complaintData)
      return data
    } catch (error) {
      console.error('提交投诉失败:', error)
      throw error
    }
  }

  return {
    claims,
    complaints,
    submitClaim,
    submitComplaint
  }
}) 