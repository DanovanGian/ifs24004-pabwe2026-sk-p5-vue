import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as userApi from "../api/userApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import UsersPage from "./UsersPage.vue";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
}));

const users = [
  { id: 1, name: "Gian", email: "gian@mail.com" },
  { id: 2, name: "Budi", email: "budi@mail.com" },
];

async function render() {
  const result = await renderWithProviders(UsersPage);
  await flushPromises();
  return result;
}

describe("UsersPage", () => {
  it("menampilkan daftar pengguna", async () => {
    userApi.getUsers.mockResolvedValue({ success: true, data: { users } });

    const { wrapper } = await render();

    const rows = wrapper.findAll("li");
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain("Gian");
    expect(rows[0].text()).toContain("gian@mail.com");
    expect(rows[1].text()).toContain("Budi");
    expect(showErrorDialog).not.toHaveBeenCalled();
  });

  it("menampilkan pesan jika belum ada pengguna", async () => {
    userApi.getUsers.mockResolvedValue({ success: true, data: { users: [] } });

    const { wrapper } = await render();

    expect(wrapper.text()).toContain("Belum ada pengguna.");
  });

  it("gagal memuat: menampilkan dialog error", async () => {
    userApi.getUsers.mockResolvedValue({ success: false, message: "Gagal memuat" });

    const { wrapper } = await render();

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat");
    expect(wrapper.text()).toContain("Belum ada pengguna.");
  });
});