<script setup lang="ts">
import SidebarNav from '@/components/dashboard/SidebarNav.vue'
import { useAuthStore } from '@/stores/auth'
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router'
const auth = useAuthStore(); const router = useRouter()
const logout = () => { auth.logout(); router.push({ name: 'login' }) }
</script>

<template>
  <div class="h-screen overflow-hidden bg-[#eef1f5] flex">
    <SidebarNav />

    <main class="flex-1 flex flex-col min-h-0">

      <header class="h-14 bg-white shadow-sm flex items-center justify-between pl-4 layout-header">
        <div class="flex items-center gap-2">
          <Icon class="icon-ify icon-home" icon="solar:card-bold"/>
          <h2 class="font-semibold text-black">Sistema de <span class="text-gray-500">Requisiciones</span></h2>
        </div>

        <div class="flex items-center gap-6 text-black h-full">
          <p>Hola, <strong>{{ auth.user?.name }}</strong></p>
          <button @click="logout" class="flex flex-row items-center justify-around gap-5 h-full bg-[#ff0000] text-white hover:bg-black  transition-all duration-300">
            <!-- Cerrar sesión -->
            <Icon class="icon-ify icon-logout" icon="tdesign:logout" />
          </button>
        </div>
      </header>

      <section class="flex-1 min-h-0 overflow-hidden p-6">
        <router-view />
      </section>

    </main>
  </div>
</template>

<style lang="scss">
.layout-header {

  h2, span {
    font-size: 1.6rem;
    font-family: OpenSansBold;
  }

  h2{
    font-family: OpenSansBold;
  }

  p{
    font-size: 1.6rem;
    font-family: OpensansSemiBold;
  }

  strong{
    font-size: 1.6rem;
    font-family: OpensansBold;
  }

  button{
    padding: 5px 10px;
    font-size: 1.2rem;
    font-family: OpenSansSemiBold;
    cursor: pointer;
  }

  .icon-logout{
    font-size: 1.8rem;
    *{
      color: #fff;
    }
  }

  .icon-home{
    font-size: 2.5rem; 
    margin-right: 5px;
    
    *{
      color: #000;
    }
  }
}
</style>