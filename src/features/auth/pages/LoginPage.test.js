import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as authApi from "../api/authApi";
import { getAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { PageStub, renderWithProviders } from "../../../test-utils";
import LoginPage from "./LoginPage.vue";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(),
}));

const routes = [
  { path: "/", component: PageStub },
  { path: "/auth/login", component: PageStub },
  { path: "/auth/register", component: PageStub },
];

function render() {
  return renderWithProviders(LoginPage, { route: "/auth/login", routes });
}

async function submit(wrapper, { email = "", password = "" } = {}) {
  await wrapper.get("#login-email-input").setValue(email);
  await wrapper.get("#login-password-input").setValue(password);
  await wrapper.get("#login-submit-button").trigger("submit");
  await flushPromises();
}

describe("LoginPage", () => {
  it("memakai ID yang dibutuhkan penguji otomatis", async () => {
    const { wrapper } = await render();

    expect(wrapper.find("#login-email-input").exists()).toBe(true);
    expect(wrapper.find("#login-password-input").exists()).toBe(true);
    expect(wrapper.find("#login-submit-button").exists()).toBe(true);
  });

  it.each([
    ["email kosong", { email: "", password: "123456" }],
    ["kata sandi kosong", { email: "a@b.c", password: "" }],
  ])("menolak submit jika %s", async (_, values) => {
    const { wrapper } = await render();

    await submit(wrapper, values);

    expect(showErrorDialog).toHaveBeenCalledWith("Email dan kata sandi wajib diisi");
    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("gagal: menampilkan pesan error dan tetap di halaman login", async () => {
    authApi.login.mockResolvedValue({ success: false, message: "Kata sandi salah" });
    const { wrapper, router } = await render();

    await submit(wrapper, { email: "a@b.c", password: "123456" });

    expect(showErrorDialog).toHaveBeenCalledWith("Kata sandi salah");
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
    expect(wrapper.get("#login-submit-button").text()).toBe("Masuk");
  });

  it("sukses: menyimpan token, menampilkan dialog, lalu pindah ke beranda", async () => {
    authApi.login.mockResolvedValue({
      success: true,
      message: "Berhasil login",
      data: { token: "tok" },
    });
    const { wrapper, router } = await render();

    await submit(wrapper, { email: "a@b.c", password: "123456" });

    expect(authApi.login).toHaveBeenCalledWith({ email: "a@b.c", password: "123456" });
    expect(getAccessToken()).toBe("tok");
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil login");
    expect(router.currentRoute.value.fullPath).toBe("/");
  });

  it("tombol menampilkan 'Memproses...' dan nonaktif selama request berjalan", async () => {
    let resolve;
    authApi.login.mockReturnValue(new Promise((r) => (resolve = r)));
    const { wrapper } = await render();
    await wrapper.get("#login-email-input").setValue("a@b.c");
    await wrapper.get("#login-password-input").setValue("123456");

    await wrapper.get("form").trigger("submit");
    const button = () => wrapper.get("#login-submit-button");
    expect(button().text()).toBe("Memproses...");
    expect(button().attributes("disabled")).toBeDefined();

    resolve({ success: false, message: "x" });
    await flushPromises();
    expect(button().text()).toBe("Masuk");
  });

  it("punya tautan ke halaman daftar", async () => {
    const { wrapper } = await render();

    expect(wrapper.get("a").attributes("href")).toBe("/auth/register");
  });
});