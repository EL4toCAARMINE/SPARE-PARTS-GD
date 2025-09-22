<script setup lang="ts">
import SidebarNav from '@/components/SidebarNav.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
const auth = useAuthStore(); const router = useRouter()
const logout = () => { auth.logout(); router.push({ name: 'login' }) }
</script>

<template>
  <div class="h-screen overflow-hidden bg-[#eef1f5] flex">
    <SidebarNav />
    <main class="flex-1 flex flex-col min-h-0">
      <header class="h-14 bg-white shadow-sm flex items-center justify-between px-4">
        <div class="flex items-center gap-2">
            <span class="material-icons text-black">menu_book</span>
            <h1 class="font-semibold text-black">Requisitions <span class="text-gray-500">System</span>
            <span class="ml-2 text-xs bg-gray-800 text-white rounded px-1.5 py-0.5">v2.0.0</span>
          </h1>
        </div>
        <div class="flex items-center gap-6 text-sm text-black">
          <div>Hola, <strong>{{ auth.user?.name }}</strong> !</div>
          <button @click="logout" class="px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-black transition">Cerrar sesión</button>
        </div>
      </header>
    <section class="flex-1 min-h-0 overflow-hidden p-6">
      <router-view />
    </section>
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>
