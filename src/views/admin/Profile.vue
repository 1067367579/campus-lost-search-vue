<template>
  <div class="admin-profile">
    <el-card>
      <template #header>
        <h3>个人资料</h3>
      </template>

      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>

        <el-form-item label="身份证号">
          <el-input v-model="form.idNumber" disabled />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="form.newPassword" 
            type="password" 
            show-password
            placeholder="如需修改密码请输入新密码"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            show-password
            placeholder="请再次输入新密码"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">保存修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import request from '@/utils/request'

const userStore = useUserStore()
const formRef = ref(null)

const form = reactive({
  username: userStore.userInfo?.username || '',
  idNumber: userStore.userInfo?.idNumber || '',
  newPassword: '',
  confirmPassword: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback()
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const rules = {
  newPassword: [
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass, trigger: 'blur' }
  ]
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await request.put('admin/profile', {
          password: form.newPassword || undefined
        })
        ElMessage.success('修改成功')
        form.newPassword = ''
        form.confirmPassword = ''
      } catch (error) {
        ElMessage.error(error.message || '修改失败')
      }
    }
  })
}
</script>

<style scoped>
.admin-profile {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}
</style> 