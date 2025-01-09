<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 style="text-align: center;">校园失物招寻平台</h2>
      </template>

      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" show-password />
        </el-form-item>

       
          <el-form-item>
            <div style="margin-left: 13%;">
              <el-button type="primary" @click="handleLogin">登录</el-button>
              <el-button @click="$router.push('/register')">注册</el-button>
            </div>
        </el-form-item>
      
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const data = await request.post('user/login', loginForm)
        userStore.setToken(data.token)
        userStore.setUserInfo(data)
        ElMessage.success('登录成功')
        if (data.userType === 1) {
          await router.push('/admin/dashboard')
        } else {
          await router.push('/')
        }
      } catch (error) {
        ElMessage.error(error.message || '登录失败')
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-card {
  width: 400px;
}
</style>