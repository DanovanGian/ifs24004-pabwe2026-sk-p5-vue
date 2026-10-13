import { ref } from "vue";
import { defineStore } from "pinia";
import * as userApi from "../api/userApi";

export const useUsersStore = defineStore("users", () => {
  const users = ref([]);
  const user = ref(null);
  const profile = ref(null);
  const isProfileChange = ref(false);
  const isPhotoChange = ref(false);
  const isPasswordChange = ref(false);

  async function fetchUsers() {
    const response = await userApi.getUsers();
    if (response.success) {
      users.value = response.data.users;
    }
    return response;
  }

  async function fetchProfile() {
    const response = await userApi.getProfile();
    if (response.success) {
      profile.value = response.data.user;
    }
    return response;
  }

  async function changeProfile(payload) {
    isProfileChange.value = false;
    const response = await userApi.putProfile(payload);
    if (response.success) {
      isProfileChange.value = true;
      await fetchProfile();
    }
    return response;
  }

  async function changePhoto(file) {
    isPhotoChange.value = false;
    const response = await userApi.postPhoto(file);
    if (response.success) {
      isPhotoChange.value = true;
      await fetchProfile();
    }
    return response;
  }

  async function changePassword(payload) {
    isPasswordChange.value = false;
    const response = await userApi.putPassword(payload);
    if (response.success) {
      isPasswordChange.value = true;
    }
    return response;
  }

  return {
    users,
    user,
    profile,
    isProfileChange,
    isPhotoChange,
    isPasswordChange,
    fetchUsers,
    fetchProfile,
    changeProfile,
    changePhoto,
    changePassword,
  };
});