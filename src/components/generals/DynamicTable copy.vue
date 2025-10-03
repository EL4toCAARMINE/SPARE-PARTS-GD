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
              <input maxlength="30" type="text" v-model="searchTerm" placeholder="Buscar…"
                class="grow border-none outline-none bg-transparent" />
            </div>
            <button class="join-item button-squeleton button-purple button-search" @click="fetchData(1)">Buscar</button>
          </div>
      </div>
    </header>

    <div class="table-wrapper rounded-lg border overflow-hidden">
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
              <span :class="getStatusInfo(item[statusKey]).class" class="px-3 py-1 rounded-full text-center inline-block status-pill-text">
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
            <input type="number" v-model.number="currentPage" class="border rounded px-2 py-1 page-input footer-input-text" :max="totalPages" min="1"/>
            <span class="footer-total-text">de {{ totalPages }}</span>
            <div class="flex gap-2">
                <button @click="prevPage" :disabled="currentPage === 1" class="w-8 h-8 rounded border pagination-arrow">&lt;</button>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="w-8 h-8 rounded border pagination-arrow">&gt;</button>
            </div>
        </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

// ================================= //
//      INTERFACES Y PROPIEDADES     //
// ================================= //

// Define la estructura de un objeto de opción de estado.
interface StatusOption { 
  id: number | string; 
  text: string; 
  class: string; 
}

// Define las propiedades (props) que el componente acepta desde el padre.
const props = withDefaults(defineProps<{
  originalItems: Array<Record<string, any>>;
  filteredItems: Array<Record<string, any>>;
  headers: Record<string, string>;
  searchKey: string;
  statusKey: string;
  statusOptions: StatusOption[];
  showSearch?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  searchValue?: string | null;
  fetchData: Function;
}>(), {
  // Valores por defecto para las props opcionales.
  showSearch: true,
  isLoading: false,
  errorMessage: null,
});

// Define los eventos que este componente puede emitir hacia el padre.
const emit = defineEmits(['update:filteredItems', 'pageChange', 'itemsPerPageChange', 'search']);

// ================================= //
//          ESTADO INTERNO           //
// ================================= //

const searchTerm = ref(props.searchValue);
const currentPage = ref(1);
const itemsPerPage = ref(10);

// ================================= //
//        LÓGICA DE BÚSQUEDA         //
// ================================= //

// Observa cambios en 'searchTerm' para filtrar la tabla en tiempo real.
watch(searchTerm, (newVal) => {
  // Emite el término de búsqueda para que el padre pueda usarlo si es necesario.
  emit('search', newVal);

  // Si el buscador está vacío, muestra todos los items originales.
  if (!newVal) {
    emit('update:filteredItems', props.originalItems);
  } else {
    // Si hay texto, filtra los items originales.
    const lowerCaseSearch = newVal.toLowerCase();
    const filtered = props.originalItems.filter(item => 
      item[props.searchKey]?.toString().toLowerCase().includes(lowerCaseSearch)
    );
    // Emite la lista filtrada para actualizar la prop 'filteredItems' en el padre.
    emit('update:filteredItems', filtered);
  }
  // Vuelve a la primera página con cada nueva búsqueda.
  currentPage.value = 1;
});

// ================================= //
//       LÓGICA DE PAGINACIÓN        //
// ================================= //

// Propiedad computada que calcula el número total de páginas.
const totalPages = computed(() => {
  // Se basa en la cantidad de items filtrados y los items por página.
  return Math.ceil(props.filteredItems.length / itemsPerPage.value) || 1;
});

// Propiedad computada que devuelve solo los items para la página actual.
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  // Corta el array de items filtrados para mostrar solo la porción correspondiente.
  return props.filteredItems.slice(start, end);
});

// Funciones para cambiar de página.
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };

// Observadores para manejar cambios y mantener la consistencia de la paginación.
watch(totalPages, (newVal) => {
  // Si la página actual es mayor que el nuevo total de páginas (ej. por un filtro), ajústala.
  if (currentPage.value > newVal) currentPage.value = newVal;
});
watch(itemsPerPage, () => {
  // Si el usuario cambia la cantidad de items por página, vuelve a la página 1.
  currentPage.value = 1;
  emit('itemsPerPageChange', itemsPerPage.value);
});
watch(currentPage, (newVal) => emit('pageChange', newVal));

// ================================= //
//          LÓGICA DE ESTADO         //
// ================================= //

// Función auxiliar para encontrar la información de un estado (texto y clase) a partir de su ID.
const getStatusInfo = (statusId: number | string): { text: string; class: string } => {
  const status = props.statusOptions.find(opt => opt.id === statusId);
  // Si no se encuentra un estado, devuelve uno por defecto.
  return status || { text: 'Desconocido', class: 'bg-gray-200 text-gray-800' };
};
</script>

<style lang="scss" scoped src="@/styles/components/generals/dynamicTable.scss"></style>