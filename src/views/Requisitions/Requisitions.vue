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

    <DynamicTable 
      :show-search="true" 
      :use-status-in-table="true" 
      :fetch-data="fetchData"
      v-model:search-value="searchModel" 
      :filtered-items="displayRows" 
      :headers="tableMyRequisHeaders"
      status-key="situationId" 
      :status-options="statusDefinitions" 
      :total-pages="pagination.totalPages"
      :total-registers="pagination.totalCount" 
      :is-loading="loading" 
      :error-message="errorMsg"
      v-model:page-size="changePageSize" 
      v-model:page-current="goto">
      <template #header-content>
        <div class="w-full flex-grow flex flex-row flex-wrap items-center gap-2 shrink-0">
          <button v-if="auth.hasRole?.('RequisitionsAdd') && scope === 'mine'" class="button-squeleton button-green">
            <Icon class="icon-ify icon-button" icon="gridicons:add" /> Nueva Requi
          </button>
          <button class="button-squeleton button-light" @click="openDates">
            <Icon class="icon-ify icon-button-dark" icon="icon-park-solid:filter" /> Filtrar por fechas
          </button>
        </div>
      </template>
    </DynamicTable>

    <dialog ref="datesModal" class="absolute modal">
      <div class="modal-box bg-base-100">
        <h3 class="font-bold text-lg mb-2">Filtrar por fechas</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="form-control">
            <span class="label-text">Desde</span>
            <input type="date" v-model="fromDate" class="input input-bordered" />
          </label>
          <label class="form-control">
            <span class="label-text">Hasta</span>
            <input type="date" v-model="toDate" class="input input-bordered" />
          </label>
        </div>
        <div class="modal-action">
          <button class="btn btn-ghost" @click="closeDates">Cancelar</button>
          <button class="btn btn-primary" @click="applyDates">Aplicar</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeDates">
        <button>close</button>
      </form>
    </dialog>
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

const auth = useAuthStore();

const loading = ref(false);
const errorMsg = ref<string | null>(null);
const rows = ref<ReqItem[]>([]);
const pagination = ref<PaginationDTO>({ totalCount: 0, pageSize: 10, currentPage: 1, totalPages: 0 });
const scope = ref<'mine' | 'area'>('mine');
const searchMine = ref('');
const searchArea = ref('');
const fromDate = ref<string | null>(null);
const toDate = ref<string | null>(null);
const datesModal = ref<HTMLDialogElement | null>(null);

const statusDefinitions = [
  { id: 10, text: 'Bloqueada', class: 'badge-ghost text-black' },
  { id: 2, text: 'En Proceso', class: 'badge-info text-white' },
  { id: 3, text: 'Autorizada', class: 'badge-success text-white' }
];

// Propiedad computada para formatear las fechas antes de pasarlas a la tabla
const displayRows = computed(() => {
  return rows.value.map(r => ({
    ...r,
    documentDate: fmtDate(r.documentDate),
    requiredDate: fmtDate(r.requiredDate),
    destination: r.destination ?? '-'
  }));
});

const searchModel = computed({
  get: () => scope.value === 'mine' ? searchMine.value : searchArea.value,
  set: (val) => { if (scope.value === 'mine') searchMine.value = val; else searchArea.value = val; }
});

const openDates = () => datesModal.value?.showModal();
const closeDates = () => datesModal.value?.close();
const applyDates = () => { closeDates(); fetchData(1); };

function fmtDate(value?: string | null) {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Lógica de obtención de datos (sin cambios importantes)
async function fetchData(page = 1) {
  loading.value = true;
  errorMsg.value = null;

  try {
    const params: Record<string, any> = {
      pageNumber: page,
      pageSize: pagination.value.pageSize,
      search: searchModel.value,
      fromDate: fromDate.value,
      toDate: toDate.value,
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

// Estas funciones ahora son llamadas por los eventos de DynamicTable
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

onMounted(() => fetchData(1));
</script>

<style src="@/styles/views/requisitions/requisitions.scss" lang="scss"></style>