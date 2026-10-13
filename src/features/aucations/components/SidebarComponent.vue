<script setup>
import { Gavel, LayoutDashboard, User, Users } from "lucide-vue-next";

defineProps({ open: Boolean });
defineEmits(["close"]);

const menus = [
  { label: "Dashboard Lelang", to: "/", icon: LayoutDashboard },
  { label: "Lelang Saya", to: { path: "/", query: { filter: "mine" } }, icon: Gavel },
  { label: "Daftar Pengguna", to: "/users", icon: Users },
  { label: "Profil Saya", to: "/profile", icon: User },
];
</script>

<template>
  <!-- Latar gelap, hanya muncul di layar kecil saat drawer terbuka -->
  <div v-if="open" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="$emit('close')" />

  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-60 bg-white p-4 shadow transition-transform',
      'lg:static lg:translate-x-0 lg:shadow-none lg:border-r lg:border-slate-200',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <nav class="mt-14 space-y-1 lg:mt-0">
      <RouterLink
        v-for="menu in menus"
        :key="menu.label"
        :to="menu.to"
        class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100"
        @click="$emit('close')"
      >
        <component :is="menu.icon" class="size-4" />
        {{ menu.label }}
      </RouterLink>
    </nav>
  </aside>
</template>