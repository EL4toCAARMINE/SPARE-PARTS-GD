import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import type { ApiResponse } from '@/models/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false
})

api.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err): ApiResponse<any> => {
    const status = err?.response?.status
    const auth = useAuthStore()

    switch (status) {
      case 400:
        return {
          response: false,
          message: '❌ Petición incorrecta',
          Data: null
        }
      case 401:
        auth.logout();
        return {
          response: false,
          message: '🔑 Sesión expirada o credenciales inválidas',
          Data: null
        }
      case 403:
        return {
          response: false,
          message: '🚫 Acceso prohibido',
          Data: null
        }
      case 404:
        return {
          response: false,
          message: '🔍 Recurso no encontrado',
          Data: null
        }
      case 500:
        return {
          response: false,
          message: '💥 Error interno del servidor',
          Data: null
        }
      default:
        return {
          response: false,
          message: `⚠️ Error inesperado (${status ?? 'desconocido'})`,
          Data: null
        }
    }
  }
)

export default api
