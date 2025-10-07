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

    <footer class="table-footer flex justify-between items-center mt-4 text-sm">
      <div class="flex items-center gap-2">
        <span class="footer-label-text">Filas por página:</span>
        <select v-model.number="itemsPerPage" class="border rounded px-2 py-1 items-per-page-select footer-select-text">
          <option>10</option>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
        <span class="footer-total-text">
          Total de {{ totalRegisters }} registros
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button @click="prevPage" :disabled="currentPage === 1" class="w-8 h-8 rounded border cursor-pointer pagination-arrow btn-change-page">&lt;</button>

        <span class="footer-label-text">Página</span>
        <input type="number" v-model.number="changePage"
          class="border text-center rounded px-2 py-1 page-input footer-input-text" :max="totalPages" min="1" />
        <span class="footer-total-text">de {{ totalPages }}</span>

        <button @click="nextPage" :disabled="currentPage === totalPages" class="w-8 h-8 rounded border cursor-pointer pagination-arrow btn-change-page">&gt;</button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, computed } from 'vue';

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
  filteredItems: Array<Record<string, any>>;
  headers: Record<string, string>;
  statusKey: string;
  statusOptions: StatusOption[];
  totalPages: number;
  totalRegisters: number;
  isLoading?: boolean;
  errorMessage?: string | null;
  pageCurrent: number;
  pageSize: number;
}>(), {
  useStatusInTable: true,
  statusKey: '',
  searchValue: ''
});

const emit = defineEmits(['update:searchValue', 'update:filteredItems', 'update:pageCurrent', 'update:pageSize']);

// Refs
const searchText = ref<string>(props.searchValue);
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(10);
const paginatedItems = ref<Array<Record<string, any>>>([]);

//#region Paginar y actualizar

let timeuot: number;

watch(() => props.filteredItems, (val) => {
  paginatedItems.value = val;
});

watch(currentPage, (page) => {
  emit('update:pageCurrent', page);
});

watch(itemsPerPage, (items) => {
  emit('update:pageSize', items);
});

const nextPage = (): void => { if (currentPage.value < props.totalPages) currentPage.value++; };
const prevPage = (): void => { if (currentPage.value > 1) currentPage.value--; };

const changePage = computed({
  get: () => currentPage.value,
  set: (val) => {
    // Limpiamos el timeout anterior
    clearTimeout(timeuot);

    // Esperamos 1 seg antes de asignar
    timeuot = setTimeout(() => {
      // si es menor que 0 lo asignamos a 1
      if (val <= 0) {
        currentPage.value = 1;
        clearTimeout(timeuot);
        return;
      }

      // si es mayor que el total de paginas lo ponemos en la ultima
      if (val > props.totalPages) {
        currentPage.value = props.totalPages;
        clearTimeout(timeuot);
        return;
      }

      currentPage.value = val;
      alert(val);
    }, 500);
  }
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