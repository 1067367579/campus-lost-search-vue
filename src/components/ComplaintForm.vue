<template>
  <el-dialog v-model="visible" title="提交投诉" width="500px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="投诉原因" prop="reason">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="4"
          placeholder="请详细描述投诉原因"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const props = defineProps({
  modelValue: Boolean,
  claimId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const form = reactive({
  reason: ''
})

const rules = {
  reason: [
    { required: true, message: '请输入投诉原因', trigger: 'blur' },
    { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.post('complaint', {
          claimId: props.claimId,
          reason: form.reason
        })
        ElMessage.success('投诉提交成功')
        visible.value = false
        emit('success')
        // 重置表单
        form.reason = ''
        formRef.value.resetFields()
      } catch (error) {
        ElMessage.error(error.message || '提交失败')
      }
    }
  })
}
</script>