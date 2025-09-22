import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'login', component: () => import('@/views/LogIn/Login.vue'), meta: { requiresAuth: false } },

  {
    path: '/app', component: () => import('@/layouts/AppLayout.vue'), meta: { requiresAuth: true }, children: [

      {
        path: 'dashboard', name: 'dashboard', component: () => import('@/views/Dashboard.vue'),
        meta: { roles: ['Admin', 'Almacen', 'HomeShow'] }
      },

      {
        path: 'requisitions', component: () => import('@/views/Requisitions/Requisitions.vue'),
        meta: { roles: ['RequisitionsShow', 'RequisitionsAdd'] }
      },

    ]
  },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFound.vue') }
]

const router = createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes })

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) return { name: 'login', query: { r: to.fullPath } }

  if (to.name === 'login' && auth.isAuthenticated) return { name: 'dashboard' }

  const needRoles = (to.meta.roles as string[] | undefined) ?? []

  if (needRoles.length && !auth.userRoles.some(r => needRoles.includes(r)) && to.name !== 'no-access') {
    return { name: 'no-access' }
  }
  return true
})

export default router