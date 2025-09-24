<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { MENU, type MenuItem } from '@/menu/menu'
import { Icon } from '@iconify/vue';

const auth = useAuthStore(); const route = useRoute(); const router = useRouter()
const opened = ref(true)
const hasAnyRole = (need?: string[]) => !need?.length || auth.userRoles.some(r => need.includes(r))

const filteredMenu = computed<MenuItem[]>(() => {
  const filter = (items: MenuItem[]): MenuItem[] =>
    items.filter(i => hasAnyRole(i.roles))
      .map(i => ({ ...i, children: i.children ? filter(i.children) : undefined }))
      .filter(i => i.children ? i.children.length > 0 || i.to : true)
  return filter(MENU)
})

const isActive = (to?: string) => !!to && route.path === to
const go = (to?: string) => to && router.push(to)
</script>

<template>
  <aside class="h-screen bg-[#2f3b46] text-white shadow-xl transition-all duration-200 container-nav-menu"
    :class="opened ? 'w-90' : 'w-20'">

    <div class="flex items-center justify-center gap-3 px-4 py-4 border-b border-white/10 header-menu">
      <img v-if="opened" src="@/assets/logo.webp"
        class="rounded-full bg-[#ECEBD6] w-10 h-10 object-contain aspect-square" />
      <h3 v-if="opened" class="title-menu">MENÚ</h3>
      <button class="ml-auto opacity-80 hover:opacity-100 hover:cursor-pointer" @click="opened = !opened">
        <Icon class="icon-ify icon-menu" icon="stash:burger-classic" />
      </button>
    </div>

    <nav class="px-2 py-3 overflow-y-auto h-[calc(100vh-64px)]">

      <ul class="space-y-4 ">

        <li v-for="(item, i) in filteredMenu" :key="i">

          <button v-if="!item.children" @click="go(item.to)"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 hover:cursor-pointer transition button-menu"
            :class="isActive(item.to) ? 'bg-white/15 ring-1 ring-white/10' : ''">

            <Icon :icon="item.icon!" class="icon-ify icon-menu opacity-80" />
            <span v-if="opened">{{ item.label }}</span>

          </button>

          <details v-else class="group">

            <summary
              class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer list-none button-menu">
              <Icon :icon="item.icon!" class="icon-ify icon-menu opacity-80" />
              <span v-if="opened" class="flex-1">{{ item.label }}</span>
              <Icon icon="dashicons:arrow-down-alt2" v-if="opened" class="icon-ify icon-menu ml-auto transform group-open:rotate-180 transition"/>
            </summary>

            <ul v-if="opened" class="mt-1 pl-10 pr-2 space-y-1">
              <li v-for="(c, j) in item.children" :key="j">

                <button @click="go(c.to)" class="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition button-menu" :class="isActive(c.to) ? 'bg-white/15 ring-1 ring-white/10' : ''">
                  <Icon :icon="c.icon!" class="icon-ify icon-menu opacity-80"/>
                  <span class="text-sm">{{ c.label }}</span>
                </button>

              </li>
            </ul>

          </details>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style src="@/styles/components/dashboard/sidebarNav.scss" lang="scss"></style>