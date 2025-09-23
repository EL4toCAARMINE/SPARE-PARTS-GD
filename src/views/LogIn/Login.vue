<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Icon } from '@iconify/vue';
import showToast from '@/utils/showToast';

const employeeNo = ref('');
const password = ref('');
const loading = ref<boolean>(false);
const errorMsg = ref<string | null>(null);

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const onSubmit = async () => {
  errorMsg.value = null
  loading.value = true
  const res = await auth.login(employeeNo.value.trim(), password.value)
  loading.value = false

  let timer = null;

  if (!res.response) {
    errorMsg.value = res.message ?? 'No se pudo iniciar sesión';
    
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      errorMsg.value = null
      timer = null
    }, 10000)
    return;
  }

  const redirect = (route.query.r as string) ?? '/app/dashboard'
  router.push(redirect)
}
</script>

<template>
  <div class="h-screen w-screen bg-cover bg-center flex items-center justify-center relative z-1 container-login">
    <div class="absolute inset-0 bg-black/25 z-2"></div>

    <div
      class="relative bg-[#000]/25 border-3 border-[#9b9b9b] rounded-3xl text-center text-white shadow-2xl backdrop-blur-sm z-3 container-form">

      <img src="@/assets/logo.webp" alt="Global Denim" class="h-40 w-40 object-contain aspect-square" />

      <h2 class="title-welcome">Bienvenido!</h2>

      <form class="flex flex-col items-center gap-5 w-full h-auto" @submit.prevent="onSubmit">

        <div class="flex items-center flex-row w-full bg-white rounded-xl">
          <Icon class="icon-ify" icon="fa6-regular:user" />
          <input v-model="employeeNo" type="text" placeholder="No. de Trabajador"
            class="w-full rounded-md outline-none text-black" autocomplete="username" required maxlength="100" />
        </div>

        <div class="flex items-center flex-row w-full bg-white rounded-xl">
          <Icon class="icon-ify" icon="material-symbols:password-2" />
          <input v-model="password" type="password" placeholder="Contraseña"
            class="w-full rounded-md outline-none text-black" autocomplete="current-password" required
            maxlength="100" />
        </div>

        <a href="#" class="text-white hover:underline flex self-end">¿Olvidaste tu contraseña?</a>

        <button type="submit" :disabled="loading"
          class="w-full rounded-xl border border-white/70 bg-transparent text-white tracking-wide transition-all duration-200 hover:border-white hover:cursor-pointer hover:bg-white/25 disabled:bg-gray-300 disabled:text-gray-700 disabled:border-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <span v-if="!loading">Iniciar Sesión</span>
          <span v-else class="animate-pulse">Validando...</span>
          <Icon class="icon-ify icon-login" icon="entypo:login" />
        </button>

        <p v-if="errorMsg" class="text-white bg-[#ff0000] rounded-xl w-full text-sm error-text">{{ errorMsg }}</p>
      </form>

      <p class="mt-6 text-xs text-gray-300 info-bottom">
        Requisitions System | GLOBAL DENIM 2025 ©. Todos los derechos reservados.<br /> Developed by Oskr Juárez
      </p>
    </div>
  </div>
</template>

<style src="@/styles/login/login.scss" lang="scss"></style>