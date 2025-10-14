<template>
  <div class="h-full w-full max-w-full flex flex-col items-start p-8 container-requisitions-view">
    <h2 class="font-semibold mb-2 shrink-0 requisitions-title">Requisiciones</h2>

    <div role="tablist"
      class="p-2 tabs flex flex-row items-center justify-between gap-2 tabs-bordered shrink-0 mb-2 w-fit h-fit overflow-hidden rounded-2xl bg-white tab-container-bg">
      <button role="tab" class="flex items-center justify-center rounded-xl px-3 py-2 text-black button-tab-default"
        :class="scope === 'mine' ? 'tab-active button-tab-active' : ''"
        @click="() => { if (scope !== 'mine') fetchData(1); scope = 'mine' }">Mis requisiciones</button>
      <button role="tab" class="flex items-center justify-center rounded-xl px-3 py-2 text-black button-tab-default"
        :class="scope === 'area' ? 'tab-active button-tab-active' : ''"
        @click="() => { if (scope !== 'area') fetchData(1); scope = 'area' }">Mi área</button>
    </div>

    <DynamicTable :show-search="true" :show-actions="true" :use-status-in-table="true" :fetch-data="fetchData"
      v-model:search-value="searchModel" :filtered-items="displayRows" :headers="tableMyRequisHeaders"
      status-key="situationId" :status-options="statusDefinitions" :total-pages="pagination.totalPages"
      :total-registers="pagination.totalCount" :is-loading="loading" :error-message="errorMsg"
      v-model:page-size="changePageSize" v-model:page-current="goto" value-to-pass-by-options="id" @click-pdf="printPdf"
      @click-excel="printExcel" @click-info="seeRequi" @click-edit="updateRequi" @click-delete="deleteRequi"
      @click-cancel="cancelRequi">
      <template #header-content>
        <div class="w-full flex-grow flex flex-row flex-wrap items-center gap-2 shrink-0 container-buttons">
          <button v-if="auth.hasRole?.('RequisitionsAdd') && scope === 'mine'" class="button-squeleton button-green">
            <Icon class="icon-ify icon-button" icon="gridicons:add" /> Nueva Requi
          </button>

          <FilterDatesModal v-if="scope === 'mine'" v-model:to-date-prop="toDateModel" v-model:from-date-prop="fromDateModel" :fetch-data="() => fetchData(1)" />

          <FilterDatesModal v-else v-model:to-date-prop="toDateModel" v-model:from-date-prop="fromDateModel" :fetch-data="() => fetchData(1)" />
        </div>
      </template>
    </DynamicTable>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import api from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { Icon } from '@iconify/vue';
import type { ReqItem } from '@/models/Requis';
import DynamicTable from '@/components/generals/DynamicTable.vue';
import { tableMyRequisHeaders } from '@/models/TableHeaders';
import type { PageDTO, PaginationDTO } from '@/models/ApiResponses';
import type { ApiResponse } from '@/models/auth';
import type { StatusToTable } from '@/models/StatusToTable';
import FilterDatesModal from '@/components/generals/FilterDatesModal.vue';

const auth = useAuthStore();

const loading = ref(false);
const errorMsg = ref<string | null>(null);
const rows = ref<ReqItem[]>([]);
const pagination = ref<PaginationDTO>({ totalCount: 0, pageSize: 10, currentPage: 1, totalPages: 0 });
const scope = ref<'mine' | 'area'>('mine');
const searchMine = ref('');
const searchArea = ref('');
const myFromDate = ref<string | null>(null);
const myToDate = ref<string | null>(null);
const areaFromDate = ref<string | null>(null);
const areaToDate = ref<string | null>(null);

const statusDefinitions: StatusToTable[] = [
  { id: 10, text: 'Bloqueada', cssClass: 'badge-ghost', optionsForStatus: ['all'] },
  { id: 2, text: 'En Proceso', cssClass: 'badge-info', optionsForStatus: ['pdf', 'edit', 'cancel'] },
  { id: 3, text: 'Autorizada', cssClass: 'badge-success', optionsForStatus: [] }
];

const searchModel = computed({
  get: () => scope.value === 'mine' ? searchMine.value : searchArea.value,
  set: (val) => { if (scope.value === 'mine') searchMine.value = val; else searchArea.value = val; }
});

//#region Fechas 

// modelo para fecha desde segun la tabla seleccionada
const fromDateModel = computed({
  get: () => scope.value === 'mine' ? myFromDate.value : areaFromDate.value,
  set: (val) => { if (scope.value === 'mine') myFromDate.value = val; else areaFromDate.value = val; }
});

// modelo para fecha hasta segun la tabla seleccionada
const toDateModel = computed({
  get: () => scope.value === 'mine' ? myToDate.value : areaToDate.value,
  set: (val) => { if (scope.value === 'mine') myToDate.value = val; else areaToDate.value = val; }
});

function fmtDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Propiedad computada para formatear las fechas antes de pasarlas a la tabla
const displayRows = computed(() => {
  return rows.value.map(r => ({
    ...r,
    documentDate: fmtDate(r.documentDate),
    requiredDate: fmtDate(r.requiredDate),
    destination: r.destination ?? '-'
  }));
});

//#endregion

// Lógica de obtención de datos
async function fetchData(page: number = 0): Promise<void> {
  loading.value = true;
  errorMsg.value = null;
  
  try {
    const params: Record<string, any> = {
      pageNumber: page,
      pageSize: pagination.value.pageSize,
      search: searchModel.value,
      fromDate: fromDateModel.value,
      toDate: toDateModel.value,
      scope: scope.value,
    };

    const { data } = await api.get<ApiResponse<PageDTO>>('/api/Requisitions', { params });

    // temporal borrar para prod
    rows.value = [
      {
        id: 1,
        folio: 1001,
        folioSap: 50123,
        requesterName: 'Kevin Alejandro Hernandez Carmona',
        departmentName: 'Sistemas',
        requiredDate: '2025-10-01',
        documentDate: '2025-09-28',
        destination: 'Oficina Principal',
        situationId: 2
      },
      {
        id: 2,
        folio: 1002,
        folioSap: 50124,
        requesterName: 'María López',
        departmentName: 'Finanzas',
        requiredDate: '2025-10-03',
        documentDate: '2025-09-29',
        destination: 'Sucursal Norte',
        situationId: 2
      },
      {
        id: 3,
        folio: 1003,
        folioSap: 50125,
        requesterName: 'José Hernández',
        departmentName: 'Compras',
        requiredDate: '2025-10-05',
        documentDate: '2025-09-30',
        destination: 'Almacén Central',
        situationId: 3
      },
      {
        id: 4,
        folio: 1004,
        folioSap: 50126,
        requesterName: 'Laura Martínez',
        departmentName: 'Recursos Humanos',
        requiredDate: '2025-10-07',
        documentDate: '2025-09-30',
        destination: 'Sucursal Sur',
        situationId: 10
      },
      {
        id: 5,
        folio: 1005,
        folioSap: 50127,
        requesterName: 'Carlos Pérez',
        departmentName: 'Mantenimiento',
        requiredDate: '2025-10-10',
        documentDate: '2025-10-01',
        destination: null,
        situationId: 2
      }
    ]
    pagination.value
    // --

    if (!data.response || !data.Data) {
      errorMsg.value = data.message || 'No se pudo obtener la información';
      rows.value = [];
      pagination.value = {
        totalCount: 0,
        pageSize: pagination.value.pageSize,
        currentPage: 1,
        totalPages: 0
      };
      return;
    }
    rows.value = data.Data.data;
    pagination.value = data.Data.pagination;
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message || err.message || 'Error de red';
  } finally {
    loading.value = false;
  }
}

//#region Paginacion

const changePageSize = computed({
  get: () => pagination.value.pageSize,
  set: (size: number) => {
    pagination.value.pageSize = size;
    fetchData(1);
  }
})

const goto = computed({
  get: () => pagination.value.pageSize,
  set: (page: number) => {
    pagination.value.currentPage = page;
    fetchData(page);
  }
})

//#endregion

//#region Clicks acciones

const printPdf = (id: number | string): void => {
  console.log(id + " P");
}

const printExcel = (id: number | string): void => {
  console.log(id + " E");
}

const seeRequi = (id: number | string): void => {
  console.log(id + " I");
}

const updateRequi = (id: number | string): void => {
  console.log(id + " U");
}

const deleteRequi = (id: number | string): void => {
  console.log(id + " D");
}

const cancelRequi = (id: number | string): void => {
  console.log(id + " C");
}

//#endregion

onMounted(() => fetchData(1));
</script>

<style src="@/styles/views/requisitions/requisitions.scss" lang="scss"></style>