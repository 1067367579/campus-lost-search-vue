<template>
  <el-container class="admin-layout">
    <el-aside width="200px" class="main-aside">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
        <span class="title">失物招领平台</span>
      </div>
      
      <el-menu
        :default-active="route.path"
        router
        class="admin-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/claims">
          <el-icon><Document /></el-icon>
          <span>认领管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/complaints">
          <el-icon><Warning /></el-icon>
          <span>投诉管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/blacklist">
          <el-icon><CircleClose /></el-icon>
          <span>黑名单管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/operation-logs">
          <el-icon><List /></el-icon>
          <span>操作日志</span>
        </el-menu-item>

        <!-- 只有admin1才能看到管理员管理入口 -->
        <el-menu-item 
          v-if="userStore.userInfo?.username === 'admin1'"
          index="/admin/managers"
        >
          <el-icon><User /></el-icon>
          <span>管理员管理</span>
        </el-menu-item>

        <el-menu-item index="/admin/users">
          <el-icon><UserFilled /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header height="60px" class="main-header">
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="user-info">
              {{ userStore.userInfo?.username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  DataLine,
  Document,
  Warning,
  CircleClose,
  List,
  UserFilled,
  User,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/admin/profile')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.main-aside {
  background-color: #304156;
  border-right: none;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background-color: #2b2f3a;
}

.logo {
  height: 32px;
  width: 32px;
  margin-right: 12px;
}

.title {
  color: #fff;
  font-size: 16px;
}

.admin-menu {
  border-right: none;
}

.main-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #303133;
  
  .el-icon {
    margin-left: 4px;
  }
}
</style> 