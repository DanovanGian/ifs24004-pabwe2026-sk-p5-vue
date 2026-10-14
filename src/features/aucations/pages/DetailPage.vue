<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAucationsStore } from "../states/aucationsStore";
import { useUsersStore } from "../../users/states/usersStore";
import MarkdownViewer from "../components/MarkdownViewer.vue";
import BidModal from "../modals/BidModal.vue";
import ChangeModal from "../modals/ChangeModal.vue";
import ChangeCoverModal from "../modals/ChangeCoverModal.vue";
import {
  formatDate,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const route = useRoute();
const router = useRouter();
const aucationsStore = useAucationsStore();
const usersStore = useUsersStore();

const isBidOpen = ref(false);
const isChangeOpen = ref(false);
const isCoverOpen = ref(false);

const aucation = computed(() => aucationsStore.aucation);

async function loadAucation() {
  const response = await aucationsStore.fetchAucation(route.params.aucationId);
  if (!response.success) {
    showErrorDialog(response.message);
  }
}

onMounted(async () => {
  await Promise.all([loadAucation(), usersStore.fetchProfile()]);
});

const isOwner = computed(
  () => Boolean(usersStore.profile) && aucation.value.user_id === usersStore.profile.id
);

const isClosed = computed(() => new Date(aucation.value.closed_at) <= new Date());


const sortedBids = computed(() =>
  [...(aucation.value.bids || [])].sort((a, b) => Number(b.bid) - Number(a.bid))
);

const currentHighest = computed(() => {
  const top = sortedBids.value[0];
  return top ? Number(top.bid) : Number(aucation.value.start_bid);
});

async function onDelete() {
  if (!(await showConfirmDialog("Hapus lelang ini?"))) return;

  const response = await aucationsStore.removeAucation(aucation.value.id);
  if (!response.success) {
    showErrorDialog(response.message);
    return;
  }
  await showSuccessDialog(response.message);
  router.push("/");
}

async function onCancelBid() {
  if (!(await showConfirmDialog("Batalkan tawaran kamu?"))) return;

  const response = await aucationsStore.removeBid(aucation.value.id);
  if (!response.success) {
    showErrorDialog(response.message);
    return;
  }
  await showSuccessDialog(response.message);
  loadAucation();
}
</script>

<template>
  <p v-if="aucationsStore.isAucation && !aucation" class="text-slate-500">Memuat...</p>

  <div v-else-if="aucation" class="mx-auto max-w-4xl space-y-6">
    <RouterLink to="/" class="text-sm font-medium text-indigo-600">&larr; Kembali</RouterLink>

    <div class="overflow-hidden rounded-2xl bg-white shadow-sm">
      <img
        v-if="aucation.cover"
        :src="aucation.cover"
        :alt="aucation.title"
        class="h-72 w-full object-cover"
      />
      <div v-else class="flex h-72 items-center justify-center bg-slate-100 text-slate-400">
        Tanpa gambar
      </div>

      <div class="space-y-4 p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <h1 class="text-2xl font-bold">{{ aucation.title }}</h1>
          <span
            :class="[
              'rounded-full px-3 py-1 text-xs font-semibold',
              isClosed ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700',
            ]"
          >
            {{ isClosed ? "Ditutup" : "Berlangsung" }}
          </span>
        </div>

        <div class="grid gap-3 text-sm sm:grid-cols-3">
          <p>Harga awal<br /><span class="font-semibold">{{ formatRupiah(aucation.start_bid) }}</span></p>
          <p>
            Tawaran tertinggi<br />
            <span class="font-semibold text-indigo-600">{{ formatRupiah(currentHighest) }}</span>
          </p>
          <p>Ditutup<br /><span class="font-semibold">{{ formatDate(aucation.closed_at) }}</span></p>
        </div>

        <MarkdownViewer :content="aucation.description || ''" />

        <div class="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          <template v-if="isOwner">
            <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" @click="isChangeOpen = true">
              Ubah
            </button>
            <button class="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold" @click="isCoverOpen = true">
              Ganti Cover
            </button>
            <button class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white" @click="onDelete">
              Hapus
            </button>
          </template>

          <template v-else-if="!isClosed">
            <button class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" @click="isBidOpen = true">
              Ajukan Penawaran
            </button>
            <button class="rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold" @click="onCancelBid">
              Batalkan Tawaran Saya
            </button>
          </template>
        </div>
      </div>
    </div>

    <section class="rounded-2xl bg-white p-6 shadow-sm">
      <h2 class="font-semibold">Riwayat Penawaran</h2>
      <p v-if="sortedBids.length === 0" class="mt-3 text-sm text-slate-500">Belum ada penawaran.</p>
      <ul v-else class="mt-3 divide-y divide-slate-100">
        <li v-for="(item, index) in sortedBids" :key="item.id ?? index" class="flex items-center justify-between py-2 text-sm">
          <span>{{ item.user?.name || item.name || "Peserta" }}</span>
          <span class="text-right">
            <span class="font-semibold">{{ formatRupiah(item.bid) }}</span>
            <span class="block text-xs text-slate-400">{{ formatDate(item.created_at) }}</span>
          </span>
        </li>
      </ul>
    </section>

    <BidModal
      v-if="isBidOpen"
      :aucation-id="aucation.id"
      :current-highest="currentHighest"
      @close="isBidOpen = false"
      @bid="loadAucation"
    />
    <ChangeModal
      v-if="isChangeOpen"
      :aucation="aucation"
      @close="isChangeOpen = false"
      @changed="loadAucation"
    />
    <ChangeCoverModal
      v-if="isCoverOpen"
      :aucation-id="aucation.id"
      @close="isCoverOpen = false"
      @changed="loadAucation"
    />
  </div>
</template>
