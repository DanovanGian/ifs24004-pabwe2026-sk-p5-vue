<script setup>
import { ref } from "vue";
import NavbarComponent from "../components/NavbarComponent.vue";
import SidebarComponent from "../components/SidebarComponent.vue";

const isSidebarOpen = ref(false);
</script>

<template>
  <div class="min-h-screen">
    <NavbarComponent @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />
    <div class="flex">
      <SidebarComponent :open="isSidebarOpen" @close="isSidebarOpen = false" />
      <main class="min-w-0 flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>