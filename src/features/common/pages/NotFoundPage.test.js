import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../../../test-utils";
import NotFoundPage from "./NotFoundPage.vue";

describe("NotFoundPage", () => {
  it("menampilkan pesan 404 dan tautan ke beranda", async () => {
    const { wrapper } = await renderWithProviders(NotFoundPage);

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman tidak ditemukan");
    expect(wrapper.get("a").attributes("href")).toBe("/");
  });
});