import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as authApi from "../api/authApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { PageStub, renderWithProviders } from "../../../test-utils";
import RegisterPage from "./RegisterPage.vue";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(),
}));

const routes = [
  { path: "/auth/login", component: PageStub },
  { path: "/auth/register", component: PageStub },
];

function render() {
  return renderWithProviders(RegisterPage, { route: "/auth/register", routes });
}

async function submit(wrapper, { name = "", email = "", password = "" } = {}) {
  await wrapper.get("#name").setValue(name);
  await wrapper.get("#email").setValue(email);
  await wrapper.get("#password").setValue(password);
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("RegisterPage", () => {
  it.each([
    ["nama kosong", { name: "", email: "a@b.c", password: "123456" }],
    ["email kosong", { name: "Gian", email: "", password: "123456" }],
    ["kata sandi kosong", { name: "Gian", email: "a@b.c", password: "" }],
  ])("menolak submit jika %s", async (_, values) => {
    const { wrapper } = await render();

    await submit(wrapper, values);

    expect(showErrorDialog).toHaveBeenCalledWith("Semua kolom wajib diisi");
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it("menolak kata sandi kurang dari 6 karakter", async () => {
    const { wrapper } = await render();

    await submit(wrapper, { name: "Gian", email: "a@b.c", password: "12345" });

    expect(showErrorDialog).toHaveBeenCalledWith("Kata sandi minimal 6 karakter");
    expect(authApi.register).not.toHaveBeenCalled();
  });

  it("gagal: menampilkan pesan error dan tetap di halaman daftar", async () => {
    authApi.register.mockResolvedValue({ success: false, message: "Email sudah dipakai" });
    const { wrapper, router } = await render();

    await submit(wrapper, { name: "Gian", email: "a@b.c", password: "123456" });

    expect(showErrorDialog).toHaveBeenCalledWith("Email sudah dipakai");
    expect(router.currentRoute.value.fullPath).toBe("/auth/register");
  });

  it("sukses: menampilkan dialog lalu pindah ke halaman login", async () => {
    authApi.register.mockResolvedValue({ success: true, message: "Berhasil daftar" });
    const { wrapper, router } = await render();

    await submit(wrapper, { name: "Gian", email: "a@b.c", password: "123456" });

    expect(authApi.register).toHaveBeenCalledWith({
      name: "Gian",
      email: "a@b.c",
      password: "123456",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil daftar");
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("tombol menampilkan 'Memproses...' selama request berjalan", async () => {
    let resolve;
    authApi.register.mockReturnValue(new Promise((r) => (resolve = r)));
    const { wrapper } = await render();
    await wrapper.get("#name").setValue("Gian");
    await wrapper.get("#email").setValue("a@b.c");
    await wrapper.get("#password").setValue("123456");

    await wrapper.get("form").trigger("submit");
    const button = () => wrapper.get('button[type="submit"]');
    expect(button().text()).toBe("Memproses...");
    expect(button().attributes("disabled")).toBeDefined();

    resolve({ success: false, message: "x" });
    await flushPromises();
    expect(button().text()).toBe("Daftar");
  });

  it("punya tautan ke halaman login", async () => {
    const { wrapper } = await render();

    expect(wrapper.get("a").attributes("href")).toBe("/auth/login");
  });
});