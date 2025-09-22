<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import api from '@/services/api'
import { useAuthStore } from '@/stores/auth'

type ReqItem = {
  id: number
  folio: number
  folioSap: number
  requesterName: string
  departmentName: string
  requiredDate: string | null
  documentDate: string | null
  destination?: string | null
  situationId: number
}
type PaginationDTO = { totalCount: number; pageSize: number; currentPage: number; totalPages: number }
type ApiResponse<T> = { response: boolean; message: string; Data: T | null }
type PageDTO = { data: ReqItem[]; pagination: PaginationDTO }

const auth = useAuthStore()

const loading = ref(false)
const errorMsg = ref<string | null>(null)
const rows = ref<ReqItem[]>([])
const pagination = ref<PaginationDTO>({ totalCount: 0, pageSize: 10, currentPage: 1, totalPages: 0 })

const q = ref('')
const scope = ref<'mine' | 'area'>('mine')
const fromDate = ref<string | null>(null)
const toDate = ref<string | null>(null)

const datesModal = ref<HTMLDialogElement | null>(null)
const openDates = () => datesModal.value?.showModal()
const closeDates = () => datesModal.value?.close()
const applyDates = () => { closeDates(); fetchData(1) }

const startIndex = computed(() =>
  (pagination.value.currentPage - 1) * pagination.value.pageSize + 1
)
const endIndex = computed(() =>
  Math.min(pagination.value.currentPage * pagination.value.pageSize, pagination.value.totalCount)
)

function fmtDate(value?: string | null) {
  if (!value) return ''
  const d = new Date(value)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusBadge(situationId: number) {
  switch (situationId) {
    case 10: return { text: 'BLOQUEADA', cls: 'badge-ghost' }
    case 2:  return { text: 'EN PROCESO', cls: 'badge-info' }
    case 3:  return { text: 'AUTORIZADA', cls: 'badge-success' }
    default: return { text: `#${situationId}`, cls: 'badge-neutral' }
  }
}

async function fetchData(page = 1) {
  loading.value = true
  errorMsg.value = null
  try {
    const params: Record<string, any> = {
      pageNumber: page,
      pageSize: pagination.value.pageSize,
    }
    if (q.value) params.search = q.value
    if (fromDate.value) params.fromDate = fromDate.value
    if (toDate.value) params.toDate = toDate.value
    if (scope.value) params.scope = scope.value

    const { data } = await api.get<ApiResponse<PageDTO>>('/api/Requisitions', { params })
    if (!data.response || !data.Data) {
      errorMsg.value = data.message || 'No se pudo obtener la información'
      rows.value = []
      pagination.value = { totalCount: 0, pageSize: pagination.value.pageSize, currentPage: 1, totalPages: 0 }
      return
    }
    rows.value = data.Data.data
    pagination.value = data.Data.pagination
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message || err.message || 'Error de red'
  } finally {
    loading.value = false
  }
}

function changePageSize(size: number) {
  pagination.value.pageSize = size
  fetchData(1)
}

function goto(p: number) {
  if (p < 1 || p > pagination.value.totalPages || p === pagination.value.currentPage) return
  fetchData(p)
}

onMounted(() => fetchData(1))
</script>

<template>
  <div class="h-full flex flex-col max-w-[1400px] mx-auto">
    <h2 class="text-3xl font-semibold mb-2 shrink-0">Requisiciones</h2>

    <div role="tablist" class="tabs tabs-bordered mb-4 shrink-0">
      <button role="tab" class="tab" :class="scope === 'mine' ? 'tab-active' : ''"
              @click="scope = 'mine'; fetchData(1)">MIS REQUISICIONES</button>
      <button role="tab" class="tab" :class="scope === 'area' ? 'tab-active' : ''"
              @click="scope = 'area'; fetchData(1)">MI ÁREA</button>
    </div>

    <div class="card bg-base-100 shadow-xl flex-1 min-h-0">
      <div class="card-body flex flex-col gap-4 min-h-0">
        <div class="flex items-center gap-2 shrink-0">
          <button v-if="auth.hasRole?.('RequisitionsAdd')" class="btn btn-sm btn-primary">
            <span class="material-icons text-base">add</span> NUEVA
          </button>
          <button class="btn btn-sm btn-outline" @click="openDates">
            <span class="material-icons text-base">filter_alt</span> POR FECHAS
          </button>

          <div class="ml-auto join">
            <div class="join-item input input-bordered input-sm flex items-center gap-2 w-72">
              <span class="material-icons text-base opacity-60">search</span>
              <input type="text" v-model="q" placeholder="Buscar…" class="grow outline-none bg-transparent" />
            </div>
            <button class="join-item btn btn-sm" @click="fetchData(1)">Buscar</button>
          </div>
        </div>

        <div class="flex-1 min-h-0 rounded-lg border border-base-300 overflow-auto">
          <table class="table table-sm w-full">
            <thead class="sticky top-0 z-10 bg-base-200">
              <tr>
                <th class="w-28">Status</th>
                <th>Folio</th>
                <th>Folio SAP</th>
                <th>Solicitante</th>
                <th>Solicitado</th>
                <th>Requerido</th>
                <th>Destino</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7">
                  <div class="flex items-center gap-3">
                    <span class="loading loading-spinner loading-sm"></span> Cargando…
                  </div>
                </td>
              </tr>
              <tr v-else-if="errorMsg">
                <td colspan="7" class="text-error">{{ errorMsg }}</td>
              </tr>
              <tr v-else-if="rows.length === 0">
                <td colspan="7" class="opacity-70">Sin resultados.</td>
              </tr>
              <tr v-for="r in rows" :key="r.id" class="bg-yellow-50/60">
                <td>
                  <div class="flex items-center gap-2">
                    <span class="badge" :class="statusBadge(r.situationId).cls">
                      {{ statusBadge(r.situationId).text }}
                    </span>
                  </div>
                </td>
                <td class="font-medium">{{ r.folio }}</td>
                <td>{{ r.folioSap }}</td>
                <td>{{ r.requesterName }}</td>
                <td>{{ fmtDate(r.documentDate) }}</td>
                <td>{{ fmtDate(r.requiredDate) }}</td>
                <td>{{ r.destination ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between mt-2 shrink-0">
          <div class="text-sm opacity-70">
            {{ startIndex }} - {{ endIndex }} de {{ pagination.totalCount }} elementos
          </div>

          <div class="flex items-center gap-3">
            <div class="dropdown dropdown-top dropdown-end">
              <div tabindex="0" role="button" class="btn btn-sm">
                {{ pagination.pageSize }} <span class="material-icons text-base">expand_more</span>
              </div>
              <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-50 w-40 p-2 shadow">
                <li><a @click="changePageSize(10)">10</a></li>
                <li><a @click="changePageSize(25)">25</a></li>
                <li><a @click="changePageSize(50)">50</a></li>
                <li><a @click="changePageSize(100)">100</a></li>
              </ul>
            </div>

            <span class="text-sm">artículos por página</span>

            <div class="join">
              <button class="join-item btn btn-sm" @click="goto(1)" :disabled="pagination.currentPage<=1">«</button>
              <button class="join-item btn btn-sm" @click="goto(pagination.currentPage-1)" :disabled="pagination.currentPage<=1">‹</button>
              <button class="join-item btn btn-sm btn-active pointer-events-none">{{ pagination.currentPage }}</button>
              <button class="join-item btn btn-sm" @click="goto(pagination.currentPage+1)" :disabled="pagination.currentPage>=pagination.totalPages">›</button>
              <button class="join-item btn btn-sm" @click="goto(pagination.totalPages)" :disabled="pagination.currentPage>=pagination.totalPages">»</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <dialog ref="datesModal" class="modal">
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

<style>
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>
