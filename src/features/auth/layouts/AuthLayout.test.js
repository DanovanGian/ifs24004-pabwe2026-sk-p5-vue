import { describe, expect, it } from "vitest";
import { h } from "vue";
import { renderWithProviders } from "../../../test-utils";
import AuthLayout from "./AuthLayout.vue";

describe("AuthLayout", () => {
  it("menampilkan banner dan halaman anak lewat RouterView", async () => {
    const Child = { render: () => h("p", { "data-testid": "child" }, "isi halaman") };

    const { wrapper } = await renderWithProviders(AuthLayout, {
      route: "/auth/login",
      routes: [{ path: "/auth/login", component: Child }],
    });

    expect(wrapper.get('[data-testid="auth-banner"]').text()).toContain("Delcom Auction");
    expect(wrapper.get('[data-testid="child"]').text()).toBe("isi halaman");
  });
});