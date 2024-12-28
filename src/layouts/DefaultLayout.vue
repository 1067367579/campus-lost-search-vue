<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="aside">
      <div class="logo">
        <img src="/favicon.svg" alt="Logo">
        <span>失物招领平台</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="menu"
        :router="true"
        :collapse="isCollapse"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <!-- 物品相关 -->
        <el-sub-menu index="/items">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>物品管理</span>
          </template>
          <el-menu-item index="/lost-items">丢失物品</el-menu-item>
          <el-menu-item index="/found-items">拾取物品</el-menu-item>
          <el-menu-item index="/publish-item">发布物品</el-menu-item>
        </el-sub-menu>

        <!-- 认领相关 -->
        <el-menu-item index="/my-claims">
          <el-icon><Document /></el-icon>
          <template #title>我的认领</template>
        </el-menu-item>

        <!-- 投诉相关 -->
        <el-menu-item index="/my-complaints">
          <el-icon><Warning /></el-icon>
          <template #title>我的投诉</template>
        </el-menu-item>

        <!-- 管理员菜单 -->
        <template v-if="userStore.isAdmin">
          <el-divider>管理员功能</el-divider>
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataBoard /></el-icon>
            <template #title>控制台</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/claims">
            <el-icon><Document /></el-icon>
            <template #title>认领管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/complaints">
            <el-icon><Warning /></el-icon>
            <template #title>投诉管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/blacklist">
            <el-icon><CircleClose /></el-icon>
            <template #title>黑名单管理</template>
          </el-menu-item>
          
          <el-menu-item index="/admin/operation-logs">
            <el-icon><List /></el-icon>
            <template #title>操作日志</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主要内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-button
            type="text"
            @click="toggleCollapse"
          >
            <el-icon :size="20">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </el-button>
          
          <el-breadcrumb>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              {{ userStore.userInfo?.username }}
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item divided command="logout">退��登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  House,
  Box,
  Document,
  Warning,
  DataBoard,
  CircleClose,
  List,
  CaretBottom,
  Expand,
  Fold
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 面包屑导航
const breadcrumbs = computed(() => {
  const breadcrumbMap = {
    '/': { title: '首页' },
    '/lost-items': { title: '丢失物品' },
    '/found-items': { title: '拾取物品' },
    '/my-claims': { title: '我的认领' },
    '/my-complaints': { title: '我的投诉' },
    '/profile': { title: '个人资���' },
    '/admin/dashboard': { title: '控制台' },
    '/admin/claims': { title: '认领管理' },
    '/admin/complaints': { title: '投诉管理' },
    '/admin/blacklist': { title: '黑名单管理' },
    '/admin/operation-logs': { title: '操作日志' }
  }

  const paths = route.path.split('/').filter(Boolean)
  const items = [{ path: '/', title: '首页' }]
  let currentPath = ''

  paths.forEach(path => {
    currentPath += `/${path}`
    if (breadcrumbMap[currentPath]) {
      items.push({
        path: currentPath,
        title: breadcrumbMap[currentPath].title
      })
    }
  })

  return items
})

// 切换侧边栏折叠状态
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 处理用户下拉菜单命令
const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        userStore.logout()
        router.push('/login')
      } catch {
        // 用户取消退出
      }
      break
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  color: #fff;
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background-color: #2b2f3a;
}

.logo img {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.menu {
  border-right: none;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 