<template>
  <div class="h-full w-full flex flex-col p-4 rounded-lg shadow-md bg-white dynamic-table-container ">

    <header class="w-full py-2 overflow-hidden flex justify-between items-end mb-4 gap-5">
      <div class="flex flex-row flex-wrap w-full max-w-full overflow-hidden">
        <slot name="header-content"></slot>
      </div>

      <div v-if="showSearch" class="w-fit flex-shrink-0">
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

    <div class="table-wrapper rounded-xl border w-full h-full max-w-full max-h-full overflow-hidden overflow-x-auto">
      <table class="w-full max-w-full overflow-hidden" :class="paginatedItems.length > 0 ? 'h-auto' : 'h-full'">
        <thead>
          <tr class="table-thead-tr">
            <th v-if="useStatusInTable" class="resizable-th p-3 text-center table-header-text">Estatus</th>
            <th v-for="(displayName, key) in headers" :key="key" class="resizable-th p-3 text-center table-header-text">
                {{ displayName }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td :colspan="Object.keys(headers).length + 1" class="text-center py-10">
              <div class="loader"></div>
              <span class="mt-2 loader-text flex flex-row items-center justify-center">Cargando...</span>
            </td>
          </tr>
          <tr v-else-if="errorMessage && paginatedItems.length <= 0">
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
            <td v-if="useStatusInTable" class="p-3 text-center align-middle">
              <span :class="getStatusInfo(item[statusKey]).class"
                class="px-3 py-1 rounded-full text-center inline-block status-pill-text badge h-fit">
                {{ getStatusInfo(item[statusKey]).text }}
              </span>
            </td>
            <td v-for="key in Object.keys(headers)" :key="key"
              class="min-w-[100px] p-3 text-center align-middle table-cell-text">
              {{ item[key] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!--  <footer class="table-footer flex justify-between items-center mt-4 text-sm">
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
import { ref, watch, defineProps, defineEmits } from 'vue';

// Interface para manejar la columna de status
interface StatusOption {
  id: number | string;
  text: string;
  class: string;
}

const props = withDefaults(defineProps<{
  showSearch: boolean,
  useStatusInTable: boolean,
  fetchData: Function,
  searchValue: string,
  originalItems: Array<Record<string, any>>;
  filteredItems: Array<Record<string, any>>;
  headers: Record<string, string>;
  statusKey: string;
  statusOptions: StatusOption[];
  isLoading?: boolean;
  errorMessage?: string | null;
}>(), {
  useStatusInTable: true,
  statusKey: '',
  searchValue: ''
});

const emit = defineEmits(['update:searchValue', 'update:filteredItems']);

// Refs
const searchText = ref<string>(props.searchValue);
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(10);
const paginatedItems = ref<Array<Record<string, any>>>([]);

//#region Paginar y actualizar

watch(() => props.filteredItems, (val) => {
  paginatedItems.value = val;
});

//#endregion

//#region Funcionalidad de busqueda

// Actualiza la variable en el padre cuando cambia el texto y Observa cambios en 'searchTerm' para filtrar la tabla en tiempo real.
watch(searchText, (val) => {
  emit('update:searchValue', val);
});

// Actulaiza el ref interno en base al padre
watch(() => props.searchValue, (val) => {
  searchText.value = val;
});
//#endregion

//#region Definir status

// Función auxiliar para encontrar la información de un estado (texto y clase) a partir de su ID.
const getStatusInfo = (statusId: number | string): { text: string; class: string } => {
  const status = props.statusOptions.find(opt => opt.id === statusId);

  // Si no se encuentra un estado, devuelve uno por defecto.
  return status || { text: 'Desconocido', class: 'bg-gray-200 text-gray-800' };
};

//#endregion

</script>

<style lang="scss" scoped src="@/styles/components/generals/dynamicTable.scss"></style>