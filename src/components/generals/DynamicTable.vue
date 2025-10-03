<template>
  <div class="dynamic-table-container bg-white p-4 rounded-lg shadow-md">

    <header class="flex justify-between items-center mb-4">
      <div class="flex-grow flex flex-row flex-wrap gap-2">
        <slot name="header-content"></slot>
      </div>

      <div v-if="showSearch" class="w-[300px] flex-shrink-0">
        <div class="ml-auto join rounded-xl overflow-hidden search-data-container">
          <div class="join-item border-0 flex items-center gap-2 min-w-72 w-auto mr-3">
            <Icon icon="bxs:search" class="ml-2 icon-ify icon-search" />
            <input maxlength="30" type="text" v-model="searchText" placeholder="Buscar…"
              class="grow border-none outline-none bg-transparent" />
          </div>
          <button class="join-item button-squeleton button-purple button-search" @click="fetchData(1)">Buscar</button>
        </div>
      </div>
    </header>

    <!-- <div class="table-wrapper rounded-lg border overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="table-thead-tr">
            <th class="p-3 text-left table-header-text">Status</th>
            <th v-for="(displayName, key) in headers" :key="key" class="p-3 text-left table-header-text">
              {{ displayName }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td :colspan="Object.keys(headers).length + 1" class="text-center py-10">
              <div class="loader"></div>
              <span class="mt-2 loader-text">Cargando...</span>
            </td>
          </tr>
          <tr v-else-if="errorMessage">
            <td :colspan="Object.keys(headers).length + 1" class="text-center py-10 text-red-500 error-text">
              {{ errorMessage }}
            </td>
          </tr>
          <tr v-else-if="paginatedItems.length === 0">
            <td :colspan="Object.keys(headers).length + 1" class="text-center py-10 no-data-text">
              No se encontraron resultados.
            </td>
          </tr>
          <tr v-else v-for="item in paginatedItems" :key="item.id" class="border-t table-tbody-tr">
            <td class="p-3 align-middle">
              <span :class="getStatusInfo(item[statusKey]).class"
                class="px-3 py-1 rounded-full text-center inline-block status-pill-text">
                {{ getStatusInfo(item[statusKey]).text }}
              </span>
            </td>
            <td v-for="key in Object.keys(headers)" :key="key" class="p-3 align-middle table-cell-text">
              {{ item[key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="table-footer flex justify-between items-center mt-4 text-sm">
      <div class="flex items-center gap-2">
        <span class="footer-label-text">Filas por página:</span>
        <select v-model.number="itemsPerPage" class="border rounded px-2 py-1 items-per-page-select footer-input-text">
          <option>10</option>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
        <span class="footer-total-text">
          Total de {{ filteredItems.length }} registros
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="footer-label-text">Página</span>
        <input type="number" v-model.number="currentPage" class="border rounded px-2 py-1 page-input footer-input-text"
          :max="totalPages" min="1" />
        <span class="footer-total-text">de {{ totalPages }}</span>
        <div class="flex gap-2">
          <button @click="prevPage" :disabled="currentPage === 1"
            class="w-8 h-8 rounded border pagination-arrow">&lt;</button>
          <button @click="nextPage" :disabled="currentPage === totalPages"
            class="w-8 h-8 rounded border pagination-arrow">&gt;</button>
        </div>
      </div>
    </footer> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

const props = withDefaults(defineProps<{ 
  showSearch: boolean, 
  fetchData: Function, 
  searchValue: string
}>(), {
  searchValue: ''
});

const emit = defineEmits(['update:searchValue']);

//#region Funcionalidad de busqueda
const searchText = ref<string>(props.searchValue)

// Actualiza la variable en el padre cuando cambia el texto 
watch(searchText, (val) =>{
  emit('update:searchValue', val);
});

// Actulaiza el ref interno en base al padre
watch(() => props.searchValue, (val) => {
  searchText.value = val;
})
//#endregion

</script>

<style lang="scss" scoped src="@/styles/components/generals/dynamicTable.scss"></style>