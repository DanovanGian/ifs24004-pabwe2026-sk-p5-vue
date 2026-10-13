<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../states/authStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const router = useRouter();
const authStore = useAuthStore();

const [email, onEmailChange] = useInput("");
const [password, onPasswordChange] = useInput("");
const isSubmitting = ref(false);

async function onSubmit() {
  if (!email.value || !password.value) {
    showErrorDialog("Email dan kata sandi wajib diisi");
    return;
  }

    isSubmitting.value = true;
  let response;
  try {
    response = await authStore.login({
      email: email.value,
      password: password.value,
    });
  } finally {
    isSubmitting.value = false;
  }

  await showSuccessDialog(response.message);
  router.push("/");
}
</script>

<template>
  <h2 class="text-2xl font-bold">Masuk</h2>
  <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
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
      {{ isSubmitting ? "Memproses..." : "Masuk" }}
    </button>
  </form>
  <p class="mt-4 text-center text-sm">
    Belum punya akun?
    <RouterLink to="/auth/register" class="font-semibold text-indigo-600">Daftar</RouterLink>
  </p>
</template>
