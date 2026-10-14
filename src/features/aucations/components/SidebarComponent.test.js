import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import SidebarComponent from "./SidebarComponent.vue";

describe("SidebarComponent", () => {
  it("menampilkan empat menu", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent);

    const links = wrapper.findAll("a");
    expect(links).toHaveLength(4);
    expect(wrapper.text()).toContain("Dashboard Lelang");
    expect(wrapper.text()).toContain("Lelang Saya");
    expect(wrapper.text()).toContain("Daftar Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("tertutup: tanpa latar gelap dan drawer bergeser keluar", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: false } });

    expect(wrapper.find(".fixed.inset-0").exists()).toBe(false);
    expect(wrapper.get("aside").classes()).toContain("-translate-x-full");
  });

  it("terbuka: ada latar gelap dan drawer tampil", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });

    expect(wrapper.find(".fixed.inset-0").exists()).toBe(true);
    expect(wrapper.get("aside").classes()).toContain("translate-x-0");
  });

  it("klik latar gelap memancarkan close", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent, { props: { open: true } });

    await wrapper.get(".fixed.inset-0").trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("klik menu memancarkan close", async () => {
    const { wrapper } = await renderWithProviders(SidebarComponent);

    await wrapper.findAll("a")[0].trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
