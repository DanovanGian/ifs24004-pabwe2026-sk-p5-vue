<script setup>
import { computed } from "vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useInput } from "../../../hooks/useInput";
import {
  formatRupiah,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";

const props = defineProps({
  aucationId: { type: [String, Number], required: true },
  currentHighest: { type: Number, required: true },
});
const emit = defineEmits(["close", "bid"]);

const aucationsStore = useAucationsStore();
const [bid, onBidChange] = useInput("");

const minimum = computed(() => props.currentHighest);

async function onSubmit() {
  const amount = Number(bid.value);

  if (!amount) {
    showErrorDialog("Nominal penawaran wajib diisi");
    return;
  }
  if (amount <= minimum.value) {
    showErrorDialog(`Penawaran harus lebih tinggi dari ${formatRupiah(minimum.value)}`);
    return;
  }

  const response = await aucationsStore.addBid(props.aucationId, amount);
  if (!response.success) {
    showErrorDialog(response.message);
    return;
  }

  await showSuccessDialog(response.message);
  emit("bid");
  emit("close");
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <form class="w-full max-w-md space-y-4 rounded-2xl bg-white p-6" @submit.prevent="onSubmit">
      <h2 class="text-xl font-bold">Ajukan Penawaran</h2>
      <p class="text-sm text-slate-500">
        Tawaran tertinggi saat ini:
        <span class="font-semibold text-indigo-600">{{ formatRupiah(minimum) }}</span>
      </p>

      <div>
        <label for="bid" class="text-sm font-medium">Nominal penawaran (Rp)</label>
        <input
          id="bid"
          type="number"
          :value="bid"
          @input="onBidChange"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-lg px-4 py-2 font-medium text-slate-600" @click="emit('close')">
          Batal
        </button>
        <button
          type="submit"
          :disabled="aucationsStore.isBidAdd"
          class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {{ aucationsStore.isBidAdd ? "Mengirim..." : "Kirim" }}
        </button>
      </div>
    </form>
  </div>
</template>