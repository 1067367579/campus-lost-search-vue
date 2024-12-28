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
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'lost-items',
        name: 'LostItems',
        component: () => import('@/views/items/LostItems.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'found-items',
        name: 'FoundItems',
        component: () => import('@/views/items/FoundItems.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'publish-item',
        name: 'PublishItem',
        component: () => import('@/views/items/PublishItem.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'my-claims',
        name: 'MyClaims',
        component: () => import('@/views/claims/MyClaims.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'my-complaints',
        name: 'MyComplaints',
        component: () => import('@/views/complaints/MyComplaints.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { requiresAuth: true }
      },
      // 管理员路由
      {
        path: 'admin/dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/claims',
        name: 'AdminClaims',
        component: () => import('@/views/admin/Claims.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/complaints',
        name: 'AdminComplaints',
        component: () => import('@/views/admin/Complaints.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/blacklist',
        name: 'AdminBlacklist',
        component: () => import('@/views/admin/Blacklist.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'admin/operation-logs',
        name: 'AdminOperationLogs',
        component: () => import('@/views/admin/OperationLogs.vue'),
        meta: { requiresAuth: true, requiresAdmin: true }
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
  
  // 如果是不需要认证的页面(登录/注册)，直接放行
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  
  // 如果需要认证但没有token，跳转到登录页
  if (!userStore.token) {
    next('/login')
    return
  }
  
  // 如果有token但没有用户信息，获取用户信息
  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfo()
    } catch (error) {
      userStore.logout()
      next('/login')
      return
    }
  }
  
  // 如果需要管理员权限但不是管理员，跳转到首页
  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next('/')
    return
  }
  
  next()
})

export default router