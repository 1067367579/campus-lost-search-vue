// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresGuest: true }
    },
    // 管理员路由
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
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
          name: 'AdminOperationLogs',
          component: () => import('@/views/admin/OperationLogs.vue')
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/Users.vue')
        },
        {
          path: 'managers',
          name: 'AdminManagers',
          component: () => import('@/views/admin/Managers.vue')
        },
        {
          path: 'profile',
          name: 'AdminProfile',
          component: () => import('@/views/admin/Profile.vue')
        }
      ]
    },
    // 用户路由
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
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/Profile.vue'),
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
          path: '/my-items',
          name: 'MyItems',
          component: () => import('@/views/items/MyItems.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/edit-item/:id',
          name: 'EditItem',
          component: () => import('@/views/items/EditItem.vue'),
          meta: {
            requiresAuth: true
          },
          props: route => ({
            itemId: Number(route.params.id),
            itemType: Number(route.query.type)  // 0: 丢失物品, 1: 拾取物品
          })
        },
        {
          path: '/item/:id/claims',
          name: 'ItemClaims',
          component: () => import('@/views/claims/ItemClaims.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/admin/operation-logs',
          name: 'OperationLogs',
          component: () => import('@/views/admin/OperationLogs.vue'),
          meta: {
            requiresAuth: true,
            title: '操作日志'
          }
        },
        {
          path: '/admin/profile',
          name: 'AdminProfile',
          component: () => import('@/views/admin/Profile.vue'),
          meta: {
            requiresAuth: true,
            requiresAdmin: true
          }
        }
      ]
    },
    // 404页面路由
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    },
    // 将所有未匹配的路由重定向到404页面
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404'
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 如果是访问404页面，直接放行
  if (to.name === 'NotFound') {
    next()
    return
  }

  // 处理需要登录的路由
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isLoggedIn) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // 处理管理员路由
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!userStore.isAdmin) {
      next('/')
      return
    }
  }

  // 处理游客路由
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (userStore.isLoggedIn) {
      next(userStore.isAdmin ? '/admin/dashboard' : '/')
      return
    }
  }

  // 处理根路径，管理员访问跳转到控制台
  if (to.path === '/') {
    if (userStore.isAdmin) {
      next('/admin/dashboard')
      return
    }
  }

  next()
})

export default router