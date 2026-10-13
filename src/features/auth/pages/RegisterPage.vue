<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();

const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const isSubmitting = ref(false);

async function onSubmit() {
  if (!name.value || !email.value || !password.value) {
    showErrorDialog("Semua kolom wajib diisi");
    return;
  }
  if (password.value.length < 6) {
    showErrorDialog("Kata sandi minimal 6 karakter");
    return;
  }

  isSubmitting.value = true;
  const response = await authStore.register({
    name: name.value,
    email: email.value,
    password: password.value,
  });
  isSubmitting.value = false;

  if (!response.success) {
    showErrorDialog(response.message);
    return;
  }

  await showSuccessDialog(response.message);
  router.push("/auth/login");
}
</script>

<template>
  <h2 class="text-2xl font-bold">Daftar</h2>
  <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
    <div>
      <label for="name" class="text-sm font-medium">Nama</label>
      <input
        id="name"
        type="text"
        :value="name"
        @input="onNameChange"
        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </div>
    <div>
      <label for="email" class="text-sm font-medium">Email</label>
      <input
        id="email"
        type="email"
        :value="email"
        @input="onEmailChange"
        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </div>
    <div>
      <label for="password" class="text-sm font-medium">Kata Sandi</label>
      <input
        id="password"
        type="password"
        :value="password"
        @input="onPasswordChange"
        class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </div>
    <button
      type="submit"
      :disabled="isSubmitting"
      class="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white disabled:opacity-60"
    >
      {{ isSubmitting ? "Memproses..." : "Daftar" }}
    </button>
  </form>
  <p class="mt-4 text-center text-sm">
    Sudah punya akun?
    <RouterLink to="/auth/login" class="font-semibold text-indigo-600">Masuk</RouterLink>
  </p>
</template>