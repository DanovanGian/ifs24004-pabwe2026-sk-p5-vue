<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import AddModal from "../modals/AddModal.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { formatRupiah, showErrorDialog } from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();

const tabs = [
  { key: "all", label: "Semua Lelang", params: {} },
  { key: "mine", label: "Lelang Saya", params: { is_me: 1 } },
  { key: "ongoing", label: "Lelang Berlangsung", params: { is_closed: 0 } },
  { key: "closed", label: "Lelang Ditutup", params: { is_closed: 1 } },
];

const activeTab = ref(route.query.filter || "all");
const keyword = ref("");
const isAddOpen = ref(false);

async function loadAucations() {
  const tab = tabs.find((t) => t.key === activeTab.value) || tabs[0];
  const response = await aucationsStore.fetchAucations(tab.params);
  if (!response.success) {
    showErrorDialog(response.message);
  }
}

function selectTab(key) {
  activeTab.value = key;
  router.replace({ path: "/", query: key === "all" ? {} : { filter: key } });
}

// Muat ulang tiap kali tab berubah (termasuk dari menu sidebar)
watch(
  () => route.query.filter,
  (filter) => {
    activeTab.value = filter || "all";
    loadAucations();
  }
);

onMounted(loadAucations);

// Live search di sisi klien: judul atau deskripsi
const filteredAucations = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return aucationsStore.aucations;
  return aucationsStore.aucations.filter(
    (item) =>
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
  );
});

function highestBid(item) {
  const bids = (item.bids || []).map((b) => Number(b.bid));
  return bids.length ? Math.max(...bids) : null;
}

function statusLabel(item) {
  const diff = new Date(item.closed_at) - new Date();
  if (Number.isNaN(diff) || diff <= 0) return "Ditutup";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days} hari ${hours} jam lagi` : `${hours} jam lagi`;
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3">
    <h1 class="text-2xl font-bold">Dashboard Lelang</h1>
    <div class="flex w-full gap-2 sm:w-auto">
      <input
        v-model="keyword"
        type="search"
        placeholder="Cari judul atau deskripsi..."
        class="w-full rounded-lg border border-slate-300 px-3 py-2 sm:w-72"
      />
      <button
        class="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white"
        @click="isAddOpen = true"
      >
        + Lelang
      </button>
    </div>
  </div>

  <div class="mt-4 flex flex-wrap gap-2">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="[
        'rounded-full px-4 py-1.5 text-sm font-medium',
        activeTab === tab.key ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700',
      ]"
      @click="selectTab(tab.key)"
    >
      {{ tab.label }}
    </button>
  </div>

  <p v-if="aucationsStore.isAucation" class="mt-8 text-slate-500">Memuat...</p>

  <p v-else-if="filteredAucations.length === 0" class="mt-8 text-slate-500">
    Tidak ada lelang yang ditemukan.
  </p>

  <ul v-else class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    <li v-for="item in filteredAucations" :key="item.id">
      <RouterLink
        :to="`/aucations/${item.id}`"
        class="block overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-md"
      >
        <img
          v-if="item.cover"
          :src="item.cover"
          :alt="item.title"
          class="h-44 w-full object-cover"
        />
        <div v-else class="flex h-44 items-center justify-center bg-slate-100 text-slate-400">
          Tanpa gambar
        </div>
        <div class="space-y-1 p-4">
          <h2 class="font-semibold">{{ item.title }}</h2>
          <p class="text-sm text-slate-500">Harga awal: {{ formatRupiah(item.start_bid) }}</p>
          <p class="text-sm">
            Tawaran tertinggi:
            <span class="font-semibold text-indigo-600">
              {{ highestBid(item) ? formatRupiah(highestBid(item)) : "Belum ada" }}
            </span>
          </p>
          <p class="text-xs text-slate-500">{{ statusLabel(item) }}</p>
        </div>
      </RouterLink>
    </li>
  </ul>

  <AddModal v-if="isAddOpen" @close="isAddOpen = false" @added="loadAucations" />
</template>