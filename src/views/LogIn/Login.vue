<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const employeeNo = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const onSubmit = async () => {
  errorMsg.value = null
  loading.value = true
  const res = await auth.login(employeeNo.value.trim(), password.value)
  loading.value = false

  if (!res.ok) {
    errorMsg.value = res.message ?? 'No se pudo iniciar sesión'
    return
  }

  const redirect = (route.query.r as string) ?? '/app/dashboard'
  router.push(redirect)
}
</script>

<template>
  <div class="h-screen w-screen bg-cover bg-center flex items-center justify-center relative z-1 container-login">
    <div class="absolute inset-0 bg-black/25 z-2"></div>

    <div class="relative bg-black/50 rounded-2xl w-full max-w-md text-center text-white shadow-2xl backdrop-blur-sm z-3 container-form">

      <img src="@/assets/logo.webp" alt="Global Denim" class="h-45 w-45 object-contain aspect-square" />

      <h1 class="text-3xl font-bold mb-6 colorprueba">Bienvenido !</h1>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="flex items-center bg-white rounded-md px-3">
          <span class="material-icons text-gray-500">person</span>
          <input
            v-model="employeeNo"
            type="text"
            placeholder="No. de Trabajador"
            class="w-full p-2 rounded-md outline-none text-black"
            autocomplete="username"
            required
          />
        </div>

        <div class="flex items-center bg-white rounded-md px-3">
          <span class="material-icons text-gray-500">lock</span>
          <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            class="w-full p-2 rounded-md outline-none text-black"
            autocomplete="current-password"
            required
          />
        </div>

        <div class="text-right text-sm">
          <a href="#" class="text-white hover:underline">¿Olvidaste tu contraseña?</a>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-md border border-white/70 bg-transparent px-6 py-3 font-semibold text-white tracking-wide transition-all duration-200 hover:border-white hover:bg-white/25 disabled:bg-gray-300 disabled:text-gray-700 disabled:border-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="!loading">Entrar</span>
          <span v-else class="animate-pulse">Entrando...</span>
          <span class="material-icons">login</span>
        </button>

        <p v-if="errorMsg" class="text-red-300 text-sm mt-2">{{ errorMsg }}</p>
      </form>

      <p class="mt-6 text-xs text-gray-300">
        Requisitions System | GLOBAL DENIM 2025 ©. Todos los derechos reservados.<br />
        Developed by Oskr Juárez
      </p>
    </div>
  </div>
</template>

<style>
@import '@/styles/login/login.scss';
</style>
