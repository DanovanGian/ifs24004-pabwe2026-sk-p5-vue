<script setup>
import { onBeforeUnmount, ref } from "vue";
import { useAucationsStore } from "../states/aucationsStore";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const props = defineProps({
  aucationId: { type: [String, Number], required: true },
});
const emit = defineEmits(["close", "changed"]);

const aucationsStore = useAucationsStore();
const file = ref(null);
const previewUrl = ref("");

function onFileSelected(event) {
  const selected = event.target.files[0] || null;
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  file.value = selected;
  previewUrl.value = selected ? URL.createObjectURL(selected) : "";
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});

async function onSubmit() {
  if (!file.value) {
    showErrorDialog("Pilih gambar terlebih dahulu");
    return;
  }

  const response = await aucationsStore.changeCover(props.aucationId, file.value);
  if (!response.success) {
    showErrorDialog(response.message);
    return;
  }

  await showSuccessDialog(response.message);
  emit("changed");
  emit("close");
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <form class="w-full max-w-md space-y-4 rounded-2xl bg-white p-6" @submit.prevent="onSubmit">
      <h2 class="text-xl font-bold">Ganti Cover</h2>

       <input
        type="file"
        accept="image/*"
        aria-label="Pilih gambar cover"
        data-testid="cover-input"
        @change="onFileSelected"
      />

      <img
        v-if="previewUrl"
        :src="previewUrl"
        alt="Pratinjau cover"
        class="h-48 w-full rounded-lg object-cover"
      />

      <div class="flex justify-end gap-2">
        <button type="button" class="rounded-lg px-4 py-2 font-medium text-slate-600" @click="emit('close')">
          Batal
        </button>
        <button
          type="submit"
          :disabled="aucationsStore.isAucationChangeCover"
          class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {{ aucationsStore.isAucationChangeCover ? "Mengunggah..." : "Unggah" }}
        </button>
      </div>
    </form>
  </div>
</template>