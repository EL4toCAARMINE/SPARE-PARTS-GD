<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { MENU, type MenuItem } from '@/menu/menu'

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
  <aside class="h-screen bg-[#2f3b46] text-white shadow-xl transition-all duration-200"
    :class="opened ? 'w-64' : 'w-32'">

    <div class="flex items-center gap-3 px-4 py-4 border-b border-white/10">
      <img src="/logo.png" class="rounded-full bg-[#ECEBD6] p-2 w-10 h-10 object-contain" />
      <div v-if="opened" class="font-semibold">MENÚ</div>
      <button class="ml-auto opacity-80 hover:opacity-100" @click="opened = !opened">
        <span class="material-icons">menu</span>
      </button>
    </div>

    <nav class="px-2 py-3 overflow-y-auto h-[calc(100vh-64px)]">

      <ul class="space-y-1">

        <li v-for="(item, i) in filteredMenu" :key="i">

          <button v-if="!item.children" @click="go(item.to)"
            class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition"
            :class="isActive(item.to) ? 'bg-white/15 ring-1 ring-white/10' : ''">
            <span class="material-icons opacity-80">{{ item.icon || 'chevron_right' }}</span>
            <span v-if="opened">{{ item.label }}</span>
          </button>

          <details v-else class="group">

            <summary class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 cursor-pointer list-none">
              <span class="material-icons opacity-80">{{ item.icon || 'expand_more' }}</span>
              <span v-if="opened" class="flex-1">{{ item.label }}</span>
              <span v-if="opened"
                class="material-icons ml-auto transform group-open:rotate-180 transition">expand_more</span>
            </summary>

            <ul v-if="opened" class="mt-1 pl-10 pr-2 space-y-1">
              <li v-for="(c, j) in item.children" :key="j">
                <button @click="go(c.to)"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition"
                  :class="isActive(c.to) ? 'bg-white/15 ring-1 ring-white/10' : ''">
                  <span class="material-icons text-sm opacity-80">{{ c.icon || 'chevron_right' }}</span>
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

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>