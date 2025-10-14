<template>
    <button class="button-squeleton" :class="aplicatedDates ? 'button-gradient' : 'button-alternative'" @click="openDates">
        <Icon class="icon-ify" :class="aplicatedDates ? 'icon-button' : 'icon-button-dark'" icon="icon-park-solid:filter" /> Filtrar por fechas
    </button>

    <dialog ref="datesModal" id="dialog-my-requis-dates" class="fixed modal z-30">

        <div class="modal-box rounded-2xl filter-dates-container">

            <h3 class="mb-2 title-dialog">Filtrar por fechas</h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 container-inputs">
                <label class=" flex flex-col gap-3 form-control">
                    <span class="text-modal">Desde</span>
                    <input type="date" v-model="fromDate" onkeydown="return false;" :max="maxDate"
                        class="input input-bordered text-modal cursor-pointer border-2 border-black rounded-md" />
                </label>
                <label class=" flex flex-col gap-3 form-control">
                    <span class="text-modal">Hasta</span>
                    <input type="date" v-model="toDate" onkeydown="return false;" :min="minDate" :max="today"
                        class="input input-bordered text-modal cursor-pointer border-2 border-black rounded-md" />
                </label>
            </div>

            <div class="modal-action">
                <button class="button-squeleton button-red" @click="closeDates">Cancelar</button>
                <button v-if="aplicatedDates" class="button-squeleton button-yellow" @click="clearDates">Limpiar
                    filtros</button>
                <button class="button-squeleton button-blue" @click="applyDates">Aplicar</button>
            </div>

        </div>

        <div method="dialog" class="modal-backdrop" @click="closeDates">
        </div>

    </dialog>
</template>

<script setup lang="ts">
import { showAlert } from '@/utils/showAlert';
import { Icon } from '@iconify/vue';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps<{
    fromDateProp?: string | null;
    toDateProp?: string | null;
    fetchData: Function;
}>();

const emit = defineEmits(['update:fromDateProp', 'update:toDateProp']);

const fromDate = ref<string | null>(props.fromDateProp ?? null);
const toDate = ref<string | null>(props.toDateProp ?? null);
const datesModal = ref<HTMLDialogElement | null>(null);
const aplicatedDates = ref<boolean>(false);
const today = new Date().toISOString().split('T')[0];

onMounted(() => {
    if (props.fromDateProp && props.toDateProp) {
        aplicatedDates.value = true;
    }
});

// WATCHS para actualizar las fechas
watch(fromDate, (newVal) => {
    emit('update:fromDateProp', newVal);
});

watch(toDate, (newVal) => {
    emit('update:toDateProp', newVal);
});

// Fechas min y max
const minDate = computed(() => {
    return fromDate.value ? fromDate.value : undefined;
});

const maxDate = computed(() => {
    return toDate.value ? toDate.value : today;
});

// Acciones del modal y sus botones
const openDates = () => {
    if(props.toDateProp === null || props.fromDateProp === null){
        toDate.value = null;
        fromDate.value = null;
    }
    datesModal.value?.showModal();
}

const closeDates = () => {
    datesModal.value?.close();
}

const clearDates = (): void => {
    fromDate.value = null;
    toDate.value = null;
    closeDates();
    aplicatedDates.value = false;
    props.fetchData();
};

const applyDates = (): void => {
    if (fromDate.value === null || toDate.value === null) {
        showAlert('warning', "Ambos campos son obligatorios", false, "dialog-my-requis-dates");
        return;
    }
    aplicatedDates.value = true;
    closeDates();
    props.fetchData();
};

</script>

<style lang="scss" src="@/styles/components/generals/filterDatesModal.scss"></style>