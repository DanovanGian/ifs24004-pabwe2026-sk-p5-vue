<script setup>
import { onMounted, ref, watch } from "vue";
import { useUsersStore } from "../states/usersStore";
import { useInput } from "../../../hooks/useInput";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

const usersStore = useUsersStore();

const [name, onNameChange] = useInput("");
const [email, onEmailChange] = useInput("");
const [password, onPasswordChange, resetPassword] = useInput("");
const [newPassword, onNewPasswordChange, resetNewPassword] = useInput("");
const photoFile = ref(null);

// Isi form saat profil sudah dimuat
watch(
  () => usersStore.profile,
  (profile) => {
    if (profile) {
      name.value = profile.name;
      email.value = profile.email;
    }
  },
  { immediate: true }
);

onMounted(() => {
  usersStore.fetchProfile();
});

async function onSubmitProfile() {
  if (!name.value || !email.value) {
    showErrorDialog("Nama dan email wajib diisi");
    return;
  }
  const response = await usersStore.changeProfile({
    name: name.value,
    email: email.value,
  });
  if (response.success) showSuccessDialog(response.message);
  else showErrorDialog(response.message);
}

function onPhotoSelected(event) {
  photoFile.value = event.target.files[0] || null;
}

async function onSubmitPhoto() {
  if (!photoFile.value) {
    showErrorDialog("Pilih foto terlebih dahulu");
    return;
  }
  const response = await usersStore.changePhoto(photoFile.value);
  if (response.success) showSuccessDialog(response.message);
  else showErrorDialog(response.message);
}

async function onSubmitPassword() {
  if (!password.value || !newPassword.value) {
    showErrorDialog("Kedua kolom kata sandi wajib diisi");
    return;
  }
  const response = await usersStore.changePassword({
    password: password.value,
    newPassword: newPassword.value,
  });
  if (response.success) {
    resetPassword();
    resetNewPassword();
    showSuccessDialog(response.message);
  } else {
    showErrorDialog(response.message);
  }
}
</script>

<template>
  <h1 class="text-2xl font-bold">Profil Saya</h1>

  <div class="mt-6 grid gap-6 lg:grid-cols-2">
    <form class="space-y-4 rounded-xl bg-white p-6 shadow-sm" @submit.prevent="onSubmitProfile">
      <h2 class="font-semibold">Data Akun</h2>
      <div>
        <label for="name" class="text-sm font-medium">Nama</label>
        <input id="name" :value="name" @input="onNameChange"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <div>
        <label for="email" class="text-sm font-medium">Email</label>
        <input id="email" type="email" :value="email" @input="onEmailChange"
          class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
      </div>
      <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
        Simpan
      </button>
    </form>

    <div class="space-y-6">
      <form class="space-y-4 rounded-xl bg-white p-6 shadow-sm" @submit.prevent="onSubmitPhoto">
        <h2 class="font-semibold">Foto Profil</h2>
        <input type="file" accept="image/*" @change="onPhotoSelected" />
        <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
          Unggah
        </button>
      </form>

      <form class="space-y-4 rounded-xl bg-white p-6 shadow-sm" @submit.prevent="onSubmitPassword">
        <h2 class="font-semibold">Ganti Kata Sandi</h2>
        <div>
          <label for="password" class="text-sm font-medium">Kata sandi lama</label>
          <input id="password" type="password" :value="password" @input="onPasswordChange"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <div>
          <label for="newPassword" class="text-sm font-medium">Kata sandi baru</label>
          <input id="newPassword" type="password" :value="newPassword" @input="onNewPasswordChange"
            class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </div>
        <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
          Ubah
        </button>
      </form>
    </div>
  </div>
</template>