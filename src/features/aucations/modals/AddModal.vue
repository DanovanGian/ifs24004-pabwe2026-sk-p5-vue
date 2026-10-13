<script setup>
import { ref } from "vue";
import MarkdownEditor from "../components/MarkdownEditor.vue";
import { useAucationsStore } from "../states/aucationsStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const emit = defineEmits(["close", "added"]);
const aucationsStore = useAucationsStore();

const [title, onTitleChange] = useInput("");
const [startBid, onStartBidChange] = useInput("");
const [closedAt, onClosedAtChange] = useInput("");
const description = ref("");

async function onSubmit() {
  if (!title.value || !description.value || !startBid.value || !closedAt.value) {
    showErrorDialog("Semua kolom wajib diisi");
    return;
  }
  if (Number(startBid.value) <= 0) {
    showErrorDialog("Harga awal harus lebih dari 0");
    return;
  }

  const response = await aucationsStore.addAucation({
    title: title.value,
    description: description.value,
    startBid: Number(startBid.value),
    closedAt: new Date(closedAt.value).toISOString(),
  });

  if (!response.success) {
    showErrorDialog(response.message);
    return;
  }

  await showSuccessDialog(response.message);
  emit("added");
  emit("close");
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <form
      class="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6"
      @submit.prevent="onSubmit"
    >
      <h2 class="text-xl font-bold">Tambah Lelang</h2>

      <div>
        <label for="title" class="text-sm font-medium">Judul</label>
        <input
          id="title"
          :value="title"
          @input="onTitleChange"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <p class="text-sm font-medium">Deskripsi</p>
        <div class="mt-1">
          <MarkdownEditor v-model="description" />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label for="startBid" class="text-sm font-medium">Harga awal (Rp)</label>
          <input
            id="startBid"
            type="number"
            min="1"
            :value="startBid"
            @input="onStartBidChange"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label for="closedAt" class="text-sm font-medium">Ditutup pada</label>
          <input
            id="closedAt"
            type="datetime-local"
            :value="closedAt"
            @input="onClosedAtChange"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="rounded-lg px-4 py-2 font-medium text-slate-600"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          type="submit"
          :disabled="aucationsStore.isAucationAdd"
          class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {{ aucationsStore.isAucationAdd ? "Menyimpan..." : "Simpan" }}
        </button>
      </div>
    </form>
  </div>
</template>
