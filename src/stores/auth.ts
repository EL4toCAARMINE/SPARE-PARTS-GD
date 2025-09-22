import { defineStore } from 'pinia'
import api from '@/services/api'
import type { ApiResponse, UserApiDTO } from '@/types/auth'

type User = {
  id: number
  name: string
  userName: string
  departmentId?: number
  department?: string
  roll?: string
}

const STORAGE_KEY = 'gd_auth_v1'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: '' as string,
    userRoles: [] as string[],
    expiration: 0 as number,
  }),
  getters: {
    isAuthenticated: (s) => !!s.user && !!s.token && (s.expiration === 0 || (Date.now() / 1000) < s.expiration),
    hasRole: (s) => (role: string) => s.userRoles.includes(role),
  },
  actions: {
    async login(userName: string, password: string) {
      try {
        const { data } = await api.post<ApiResponse<UserApiDTO>>('/api/User', {
          userName,
          password,
        })

        if (!data.response || !data.Data) {
          return { ok: false, message: data.message || 'No se pudo iniciar sesión' }
        }

        const dto = data.Data

        this.user = {
          id: dto.userID,
          name: dto.name,
          userName,
          departmentId: dto.departmentID,
          department: dto.department,
          roll: dto.roll,
        }
        this.token = dto.token
        this.userRoles = dto.roles || []
        this.expiration = dto.expiration ?? 0

        this._persist()
        return { ok: true }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Error de red'
        return { ok: false, message: msg }
      }
    },

    logout() {
      this.user = null
      this.token = ''
      this.userRoles = []
      this.expiration = 0
      localStorage.removeItem(STORAGE_KEY)
    },

    initFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const parsed = JSON.parse(raw)
        this.user = parsed.user
        this.token = parsed.token
        this.userRoles = parsed.userRoles || []
        this.expiration = parsed.expiration || 0
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    },

    _persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        user: this.user,
        token: this.token,
        userRoles: this.userRoles,
        expiration: this.expiration,
      }))
    }
  }
})
