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
            <th v-if="useStatusInTable" class="resizable-th p-3 text-center table-header-text header-status">Estatus</th>
            <th v-if="showActions && paginatedItems.length > 0" class="resizable-th p-3 text-center table-header-text text-actions">Acciones</th>
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
          <tr v-else-if="paginatedItems.length > 0" v-for="item in paginatedItems" :key="item.id" class="border-t table-tbody-tr relative">
            <td v-if="useStatusInTable" class="p-3 text-center align-middle">
              <span :class="getStatusInfo(item[statusKey]).cssClass"
                class="px-3 py-1 rounded-full text-center inline-block status-pill-text badge badge-outline badge-soft h-fit">
                {{ getStatusInfo(item[statusKey]).text }}
              </span>
            </td>

            <td v-if="showActions" class="actions">
              <div class="actions-container flex-1 flex flex-row items-center justify-center gap-2">
                
                <!-- Imprimir PDF -->
                <div v-if="aproveAction('pdf', getStatusInfo(item[statusKey]).optionsForStatus)" class="action-button bg-red-600" title="Imprimir Pdf" @click="printPdf(item[valueToPassByOptions])">
                  <Icon icon="proicons:pdf" class="icon-ify icon-action"/>
                </div>

                <!-- Imprimir Excel -->
                <div v-if="aproveAction('excel', getStatusInfo(item[statusKey]).optionsForStatus)" class="action-button bg-green-600" title="Imprimir Excel" @click="printExcel(item[valueToPassByOptions])">
                  <Icon icon="icon-park-solid:excel" class="icon-ify icon-action"/>
                </div>

                <!-- Detalles -->
                <div v-if="aproveAction('info', getStatusInfo(item[statusKey]).optionsForStatus)" class="action-button bg-black" title="Detalles" @click="seeDetails(item[valueToPassByOptions])">
                  <Icon icon="icon-park-twotone:info" class="icon-ify icon-action"/>
                </div>

                <!-- Editar -->
                <div v-if="aproveAction('edit', getStatusInfo(item[statusKey]).optionsForStatus)" class="action-button bg-blue-600" title="Editar" @click="updateInfo(item[valueToPassByOptions])">
                  <Icon icon="bxs:edit" class="icon-ify icon-action"/>
                </div>

                <!-- Eliminar -->
                <div v-if="aproveAction('delete', getStatusInfo(item[statusKey]).optionsForStatus)" class="action-button bg-red-600" title="Eliminar" @click="deleteInfo(item[valueToPassByOptions])">
                  <Icon icon="tdesign:delete" class="icon-ify icon-action"/>
                </div>

                <!-- Cancelar -->
                <div v-if="aproveAction('cancel', getStatusInfo(item[statusKey]).optionsForStatus)" class="action-button bg-white" title="Cancelar" @click="cancelInfo(item[valueToPassByOptions])">
                  <Icon icon="flat-color-icons:cancel" class="icon-ify icon-action"/>
                </div>

                <!-- No hay acciones disponibles -->
                <p v-if="getStatusInfo(item[statusKey]).optionsForStatus.length === 0" class="no-data"> Sin acciones </p>

              </div>
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
import type { StatusToTable } from '@/models/StatusToTable';
import { Icon } from '@iconify/vue';
import { ref, watch, defineProps, defineEmits, computed } from 'vue';

const props = withDefaults(defineProps<{
  showSearch: boolean,
  showActions: boolean,
  useStatusInTable: boolean,
  fetchData: Function,
  searchValue: string,
  filteredItems: Array<Record<string, any>>;
  headers: Record<string, string>;
  statusKey: string;
  statusOptions: StatusToTable[];
  totalPages: number;
  totalRegisters: number;
  isLoading?: boolean;
  errorMessage?: string | null;
  pageCurrent: number;
  pageSize: number;
  valueToPassByOptions: number | string; 
}>(), {
  showSearch: true,
  useStatusInTable: true,
  showActions: true,
  statusKey: '',
  searchValue: ''
});

const emit = defineEmits([
  'update:searchValue', 
  'update:filteredItems', 
  'update:pageCurrent', 
  'update:pageSize',
  'click-pdf',
  'click-excel',
  'click-info',
  'click-edit',
  'click-delete',
  'click-cancel'
]);

// Refs
const searchText = ref<string>(props.searchValue);
const currentPage = ref<number>(1);
const itemsPerPage = ref<number>(10);
const paginatedItems = ref<Array<Record<string, any>>>([]);

//#region Paginar y actualizar cantidad de elementos por page

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
const getStatusInfo = (statusId: number | string): StatusToTable => {
  const status = props.statusOptions.find(opt => opt.id === statusId);

  // Si no se encuentra un estado, devuelve uno por defecto.
  return status || {id: 0, text: 'Desconocido', cssClass: 'badge-ghost', optionsForStatus: [] };
};

// Buscar si contiene los ations que se solicitan 
const aproveAction = (valu: string, options: string[]) : boolean => {
  if (options.length <= 0 ) return false;

  let canSee:boolean = options.some(opt => [valu, 'all'].includes(opt));
  return canSee;
}

// Acción que se ejecuta al presionar imprimir pdf
const printPdf = (id: number | string): void => {
  emit('click-pdf', id);
}

// Acción que se ejecuta al presionar imprimir excel
const printExcel = (id: number | string): void => {
  emit('click-excel', id);
}

// Acción que se ejecuta al presionar ver detalles
const seeDetails = (id: number | string): void => {
  emit('click-info', id);
}

// Acción que se ejecuta al presionar editar
const updateInfo = (id: number | string): void => {
  emit('click-edit', id);
}

// Acción que se ejecuta al presionar eliminar
const deleteInfo = (id: number | string): void => {
  emit('click-delete', id);
}

// Acción que se ejecuta al presionar cancelar
const cancelInfo = (id: number | string): void => {
  emit('click-cancel', id);
}

//#endregion

</script>

<style lang="scss" scoped src="@/styles/components/generals/dynamicTable.scss"></style>