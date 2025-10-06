<template>
  <div class="h-screen w-screen bg-[#f2f2f2] flex flex-row">
    <SidebarNav ref="sideBar" v-model="opened"/>

    <main class="h-full flex flex-col min-h-0" :style="{width: `calc(100vw - ${opened ? widthOpen : widthClose}px)`}">

      <header class="h-16 w-full bg-white shadow-sm flex items-center justify-between layout-header relative">
        <div class="flex items-center gap-2 left-4 absolute">
          <Icon class="icon-ify icon-home" icon="solar:card-bold" />
          <h2 class="font-semibold text-black">Sistema de <span class="text-gray-500">Requisiciones</span></h2>
        </div>

        <div
          class="absolute right-4 top-0 flex flex-col justify-start items-center gap-1 text-black h-auto z-10 container-user-menu"
          @mouseleave="openMenuUser = false">
          <div class="h-14 flex flex-row items-center gap-5">
            <p class="px-5 py-1 rounded-2xl h-fit user-welcome">Hola, <strong>{{ auth.user?.name }}</strong></p>
            <button @click="openMenuUser = !openMenuUser"
              class="flex flex-row items-center justify-around aspect-square rounded-full bg-black hover:bg-gray-600 hover:cursor-pointer transition duration-300 user-button">
              <Icon class="icon-ify icon-user-button" icon="icon-park-solid:user-business" />
            </button>
          </div>

          <div v-if="openMenuUser"
            class="flex flex-col items-center gap-3 bg-white w-full h-auto p-2 relative z-100 rounded-xl container-options-menu">

            <button @click="logout"
              class="flex flex-row items-center justify-center gap-5 w-full h-full bg-[#ff0000] text-white hover:bg-black transition-all duration-300 logout-button rounded-xl">
              Cerrar sesión
              <Icon class="icon-ify icon-logout" icon="tdesign:logout" />
            </button>

          </div>
        </div>
      </header>

      <section class="h-full w-full min-h-0 overflow-y-auto">
        <router-view />
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import SidebarNav from '@/components/dashboard/SidebarNav.vue'
import { useAuthStore } from '@/stores/auth'
import { Icon } from '@iconify/vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'

const auth = useAuthStore();
const router = useRouter()
const logout = () => { auth.logout(); router.push({ name: 'login' }) }

const openMenuUser = ref<boolean>(false);
const sideBar = ref<any>(null);

const opened = ref<boolean>(true)
const widthOpen = ref<number>(0)
const widthClose = ref<number>(0)

// Asumiendo que sideBar es un ref o reactive ya definido
onMounted(() => {
  if (sideBar.value) {
    widthOpen.value = sideBar.value.widthOpen ?? 250
    widthClose.value = sideBar.value.widthClose ?? 50
  }
})

</script>

<style lang="scss" src="@/styles/layout/layout.scss"></style>