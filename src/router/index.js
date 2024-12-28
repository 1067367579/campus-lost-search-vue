// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      // 普通用户和管理员共用路由
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue')
      },
      {
        path: 'lost-items',
        name: 'LostItems',
        component: () => import('@/views/items/LostItems.vue')
      },
      {
        path: 'found-items',
        name: 'FoundItems',
        component: () => import('@/views/items/FoundItems.vue')
      },
      {
        path: 'my-claims',
        name: 'MyClaims',
        component: () => import('@/views/claims/MyClaims.vue')
      },
      {
        path: 'my-complaints',
        name: 'MyComplaints',
        component: () => import('@/views/complaints/MyComplaints.vue')
      },
      // 管理员专属路由
      {
        path: 'admin',
        meta: { requiresAdmin: true },
        children: [
          {
            path: 'dashboard',
            name: 'AdminDashboard',
            component: () => import('@/views/admin/Dashboard.vue')
          },
          {
            path: 'claims',
            name: 'AdminClaims',
            component: () => import('@/views/admin/Claims.vue')
          },
          {
            path: 'complaints',
            name: 'AdminComplaints',
            component: () => import('@/views/admin/Complaints.vue')
          },
          {
            path: 'blacklist',
            name: 'AdminBlacklist',
            component: () => import('@/views/admin/Blacklist.vue')
          },
          {
            path: 'operation-logs',
            name: 'AdminLogs',
            component: () => import('@/views/admin/OperationLogs.vue')
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // 如果有token但没有用户信息，先获取用户信息
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.getUserInfo()
    } catch (error) {
      userStore.logout()
      next('/login')
      return
    }
  }
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
    return
  }
  
  next()
})

export default router