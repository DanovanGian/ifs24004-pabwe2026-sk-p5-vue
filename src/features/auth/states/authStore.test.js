import { describe, expect, it, vi } from "vitest";
import * as authApi from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { createMockPinia } from "../../../test-utils";
import { useAuthStore } from "./authStore";

vi.mock("../api/authApi");

function setup() {
  createMockPinia();
  return useAuthStore();
}

describe("authStore", () => {
  it("membaca token awal dari localStorage", () => {
    putAccessToken("token-lama");
    const store = setup();
    expect(store.token).toBe("token-lama");
  });

  it("login sukses menyimpan token dan menandai isAuthLogin", async () => {
    authApi.login.mockResolvedValue({ success: true, data: { token: "tok" } });
    const store = setup();

    const response = await store.login({ email: "a@b.c", password: "123456" });

    expect(response.success).toBe(true);
    expect(store.token).toBe("tok");
    expect(getAccessToken()).toBe("tok");
    expect(store.isAuthLogin).toBe(true);
  });

  it("login ditolak jika respons sukses tapi tidak ada token", async () => {
    authApi.login.mockResolvedValue({ success: true, data: {} });
    const store = setup();

    const response = await store.login({});

    expect(response.success).toBe(false);
    expect(response.message).toContain("Token tidak ditemukan");
    expect(getAccessToken()).toBeNull();
    expect(store.isAuthLogin).toBe(false);
  });

  it("login ditolak jika respons sukses tapi tidak ada data", async () => {
    authApi.login.mockResolvedValue({ success: true });
    const store = setup();

    const response = await store.login({});

    expect(response.success).toBe(false);
    expect(store.isAuthLogin).toBe(false);
  });

  it("login gagal mengembalikan respons apa adanya", async () => {
    authApi.login.mockResolvedValue({ success: false, message: "Salah" });
    const store = setup();

    const response = await store.login({});

    expect(response).toEqual({ success: false, message: "Salah" });
    expect(store.isAuthLogin).toBe(false);
    expect(getAccessToken()).toBeNull();
  });

  it("register sukses menandai isAuthRegister", async () => {
    authApi.register.mockResolvedValue({ success: true });
    const store = setup();

    await store.register({});

    expect(store.isAuthRegister).toBe(true);
  });

  it("register gagal tidak menandai isAuthRegister", async () => {
    authApi.register.mockResolvedValue({ success: false, message: "Email dipakai" });
    const store = setup();

    const response = await store.register({});

    expect(response.message).toBe("Email dipakai");
    expect(store.isAuthRegister).toBe(false);
  });

  it("logout menghapus token dan menandai isAuthLogout", () => {
    putAccessToken("tok");
    const store = setup();

    store.logout();

    expect(store.token).toBeNull();
    expect(getAccessToken()).toBeNull();
    expect(store.isAuthLogout).toBe(true);
  });
});