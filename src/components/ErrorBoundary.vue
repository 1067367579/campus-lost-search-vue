<template>
  <div v-if="error" class="error-container">
    <el-result
      icon="error"
      :title="error.message || '页面出错了'"
      :sub-title="error.stack"
    >
      <template #extra>
        <el-button type="primary" @click="handleError">刷新页面</el-button>
      </template>
    </el-result>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((err) => {
  error.value = err
  return false
})

const handleError = () => {
  error.value = null
  window.location.reload()
}
</script> 