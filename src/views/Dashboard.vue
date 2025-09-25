<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref } from 'vue';

const seeMotivation = ref<boolean>(false);

</script>

<template>
  <div class="w-full h-auto p-8 flex flex-col items-center justify-start gap-10 container-dash">

    <div
      class="w-full flex flex-row items-center gap-7 justify-between min-h-5 h-auto px-8 py-4 rounded-2xl border-1 border-[#2b9a66] bg-transparent container-doc-link">
      <div class="p-4 rounded-2xl bg-[#2b9a66] icon-div">
        <Icon icon="streamline:manual-book-solid" class="icon-ify icon-doc" />
      </div>

      <div class="flex-1 h-full flex flex-col items-start justify-center gap-1 texts-doc">
        <h4 class="title">Manual de Usuario</h4>
        <p class="description">
          Este manual te guiará en el uso del sistema y sus funcionalidades.
        </p>
      </div>

      <a href="" target="_blank" title="Mete aqui nombre del documento"
        class="flex flex-row items-center justify-center gap-3 px-5 py-3 hover:cursor-pointer rounded-xl border-1 border-[#2b9a66] bg-white go-to-doc">
        Ir al Manual
        <Icon icon="icomoon-free:arrow-up-right2" class="icon-ify icon-doc-btn" />
      </a>
    </div>

    <div
      class="w-full rounded-2xl flex flex-row justify-between items-center p-10 bg-gradient-to-r from-[#496fd650] to-[#9D50DC20] container-new-req">

      <div class="absolute left-0 fade-right"></div>

      <div class="flex flex-col justify-between gap-5 texts">
        <h2 class="title ">Crea y administra requisiciones fácilmente</h2>
        <a title="Get Started" href=""
          class="flex flex-row items-center justify-center gap-5 px-10 py-3 bg-[#376af5] w-fit h-fit hover:cursor-pointer rounded-xl btn-get-started">
          Crear una Requi
          <Icon icon="streamline-ultimate:startup-product-rocket-box-bold" class="icon-ify icon-get-started" />
        </a>
      </div>
      <img class="image-new-req" src="@/assets/docs.png" alt="Imagen documentos">
    </div>

    <div v-if="seeMotivation" class="w-full flex flex-row items-center justify-around border-4 border-black overflow-hidden rounded-2xl relative motivation">
      <div class="absolute left-0 fade-right"></div>
      
      <h3 class="relative">Que tu<br>magia sea <br> <span>No rendirte</span></h3>
      <img class="relative" src="@/assets/asta.png" alt="Motivación">
    </div>
  </div>
</template>

<style lang="scss" src="@/styles/views/dashboard.scss"></style>