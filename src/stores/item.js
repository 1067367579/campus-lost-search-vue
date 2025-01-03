import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export const useItemStore = defineStore('item', () => {
  const lostItems = ref([])
  const foundItems = ref([])

  const publishLostItem = async (itemData) => {
    try {
      const data = await request.post('lost-item', itemData)
      return data
    } catch (error) {
      console.error('发布丢失物品失败:', error)
      throw error
    }
  }

  const publishFoundItem = async (itemData) => {
    try {
      const data = await request.post('found-item', itemData)
      return data
    } catch (error) {
      console.error('发布拾取物品失败:', error)
      throw error
    }
  }

  return {
    lostItems,
    foundItems,
    publishLostItem,
    publishFoundItem
  }
}) 