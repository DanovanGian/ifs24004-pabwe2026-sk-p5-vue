import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as userApi from "../../users/api/userApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import NavbarComponent from "./NavbarComponent.vue";

vi.mock("../../users/api/userApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showConfirmDialog: vi.fn() }));

function findButton(wrapper, text) {
  return wrapper.findAll("button").find((b) => b.text().includes(text));
}

describe("NavbarComponent", () => {
  beforeEach(() => {
    userApi.getProfile.mockResolvedValue({
      success: true,
      data: { user: { name: "Gian" } },
    });
  });

  it("menampilkan nama pengguna setelah profil dimuat", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);
    await flushPromises();

    expect(userApi.getProfile).toHaveBeenCalledTimes(1);
    expect(wrapper.get('[data-testid="navbar-name"]').text()).toBe("Gian");
  });

  it("nama kosong jika profil gagal dimuat", async () => {
    userApi.getProfile.mockResolvedValue({ success: false });

    const { wrapper } = await renderWithProviders(NavbarComponent);
    await flushPromises();

    expect(wrapper.get('[data-testid="navbar-name"]').text()).toBe("");
  });

  it("tombol menu memancarkan toggle-sidebar", async () => {
    const { wrapper } = await renderWithProviders(NavbarComponent);

    await wrapper.get('[aria-label="Buka menu"]').trigger("click");

    expect(wrapper.emitted("toggle-sidebar")).toHaveLength(1);
  });

  it("logout dikonfirmasi: token dihapus dan pindah ke halaman login", async () => {
    putAccessToken("tok");
    showConfirmDialog.mockResolvedValue(true);
    const { wrapper, router } = await renderWithProviders(NavbarComponent);

    await findButton(wrapper, "Keluar").trigger("click");
    await flushPromises();

    expect(showConfirmDialog).toHaveBeenCalledWith("Yakin ingin keluar?");
    expect(getAccessToken()).toBeNull();
    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
  });

  it("logout dibatalkan: token tetap ada dan tidak pindah halaman", async () => {
    putAccessToken("tok");
    showConfirmDialog.mockResolvedValue(false);
    const { wrapper, router } = await renderWithProviders(NavbarComponent);

    await findButton(wrapper, "Keluar").trigger("click");
    await flushPromises();

    expect(getAccessToken()).toBe("tok");
    expect(router.currentRoute.value.fullPath).toBe("/");
  });
});