<template>
  <div class="h-full w-full flex flex-col items-start p-8 container-requisitions-view">
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

    <div class="w-full h-full card bg-base-100 shadow-xl">
      <div class="card-body flex flex-col gap-4 min-h-0 table-container">

        <div class="flex items-center gap-2 shrink-0">
          <button v-if="auth.hasRole?.('RequisitionsAdd') && scope === 'mine'" class="button-squeleton button-green">
            <Icon class="icon-ify icon-button" icon="gridicons:add" /> Nueva Requi
          </button>
          <button class="button-squeleton button-light" @click="openDates">
            <Icon class="icon-ify icon-button-dark" icon="icon-park-solid:filter" /> Filtrar por fechas
          </button>
        </div>

        <DynamicTable :headers="tableHeaders" :status-options="statusDefinitions" :original-items="displayRows"
          :filtered-items="displayRows" :is-loading="loading" v-model:search-value="searchModel"
          :error-message="errorMsg" :fetch-data="fetchData" status-key="situationId" search-key="folio"
          :show-search="true" :current-page-prop="pagination.currentPage" :total-pages-prop="pagination.totalPages"
          :items-per-page-prop="pagination.pageSize" @pageChange="goto" @itemsPerPageChange="changePageSize" />

      </div>
    </div>

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

type PaginationDTO = { totalCount: number; pageSize: number; currentPage: number; totalPages: number }
type ApiResponse<T> = { response: boolean; message: string; Data: T | null }
type PageDTO = { data: ReqItem[]; pagination: PaginationDTO }

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

// 👇 2. DEFINIR LA ESTRUCTURA PARA DYNAMICTABLE 👇
const tableHeaders = {
  folio: "Folio",
  folioSap: "Folio SAP",
  requesterName: "Solicitante",
  documentDate: "Solicitado",
  requiredDate: "Requerido",
  destination: "Destino",
};

const statusDefinitions = [
  { id: 10, text: 'Bloqueada', class: 'badge-ghost' },
  { id: 2, text: 'En Proceso', class: 'badge-info' },
  { id: 3, text: 'Autorizada', class: 'badge-success' }
  // Puedes añadir más aquí si es necesario
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

  console.log("Mine " + searchMine.value + " - Area " + searchArea.value);

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
    if (!data.response || !data.Data) {
      errorMsg.value = data.message || 'No se pudo obtener la información';
      rows.value = [];
      pagination.value = { totalCount: 0, pageSize: pagination.value.pageSize, currentPage: 1, totalPages: 0 };
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
function changePageSize(size: number) {
  pagination.value.pageSize = size;
  fetchData(1);
}

function goto(p: number) {
  if (p < 1 || p > pagination.value.totalPages || p === pagination.value.currentPage) return;
  fetchData(p);
}

onMounted(() => fetchData(1));
</script>

<style src="@/styles/views/requisitions/requisitions.scss" lang="scss"></style>