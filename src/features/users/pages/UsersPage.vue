<script setup>
import { onMounted } from "vue";
import { useUsersStore } from "../states/usersStore";
import { showErrorDialog } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

onMounted(async () => {
  const response = await usersStore.fetchUsers();
  if (!response.success) {
    showErrorDialog(response.message);
  }
});
</script>

<template>
  <h1 class="text-2xl font-bold">Daftar Pengguna</h1>

  <p v-if="usersStore.users.length === 0" class="mt-6 text-slate-500">
    Belum ada pengguna.
  </p>

  <ul v-else class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <li
      v-for="item in usersStore.users"
      :key="item.id"
      class="rounded-xl bg-white p-4 shadow-sm"
    >
      <p class="font-semibold">{{ item.name }}</p>
      <p class="text-sm text-slate-500">{{ item.email }}</p>
    </li>
  </ul>
</template>