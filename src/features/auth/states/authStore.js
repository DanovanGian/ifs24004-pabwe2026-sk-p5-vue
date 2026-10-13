import { ref } from "vue";
import { defineStore } from "pinia";
import * as authApi from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(getAccessToken());
  const isAuthLogin = ref(false);
  const isAuthRegister = ref(false);
  const isAuthLogout = ref(false);

  async function login(payload) {
    isAuthLogin.value = false;
    const response = await authApi.login(payload);
    console.log("LOGIN RESPONSE:", JSON.stringify(response));

    if (response.success) {
      const newToken =
        response.data?.token ??
        response.data?.auth_token ??
        response.data?.access_token;

      if (!newToken) {
        return {
          success: false,
          message: "Token tidak ditemukan pada respons server (cek console)",
        };
      }

      token.value = newToken;
      putAccessToken(newToken);
      isAuthLogin.value = true;
    }
    return response;
  }

  async function register(payload) {
    isAuthRegister.value = false;
    const response = await authApi.register(payload);
    if (response.success) {
      isAuthRegister.value = true;
    }
    return response;
  }

  function logout() {
    token.value = null;
    putAccessToken(null);
    isAuthLogout.value = true;
  }

  return { token, isAuthLogin, isAuthRegister, isAuthLogout, login, register, logout };
});