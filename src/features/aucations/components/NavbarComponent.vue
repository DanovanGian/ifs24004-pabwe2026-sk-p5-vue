<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { Gavel, LogOut, Menu } from "lucide-vue-next";
import { useAuthStore } from "../../auth/states/authStore";
import { useUsersStore } from "../../users/states/usersStore";
import { showConfirmDialog } from "../../../helpers/toolsHelper";

defineEmits(["toggle-sidebar"]);

const router = useRouter();
const authStore = useAuthStore();
const usersStore = useUsersStore();

onMounted(() => {
  usersStore.fetchProfile();
});

async function onLogout() {
  if (await showConfirmDialog("Yakin ingin keluar?")) {
    authStore.logout();
    router.push("/auth/login");
  }
}
</script>

<template>
  <header class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
    <div class="flex items-center gap-3">
      <button class="lg:hidden" aria-label="Buka menu" @click="$emit('toggle-sidebar')">
        <Menu class="size-6" />
      </button>
      <Gavel class="size-6 text-indigo-600" />
      <span class="font-extrabold">Delcom Auction</span>
    </div>

    <div class="flex items-center gap-4">
      <span class="hidden text-sm sm:block" data-testid="navbar-name">
        {{ usersStore.profile?.name }}
      </span>
      <button class="flex items-center gap-1 text-sm font-medium text-red-600" @click="onLogout">
        <LogOut class="size-4" /> Keluar
      </button>
    </div>
  </header>
</template>