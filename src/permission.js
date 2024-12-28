// src/permission.js - 权限指令
import useUserStore from '@/stores/user'

export const permission = {
  mounted(el, binding) {
    const userStore = useUserStore()
    
    // v-permission="'admin'" 或 v-permission="['admin', 'user']"
    const { value } = binding
    const requiredRoles = Array.isArray(value) ? value : [value]
    const hasPermission = requiredRoles.includes(userStore.userInfo?.userType === 1 ? 'admin' : 'user')
    
    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}