import { describe, expect, it } from "vitest";
import { h } from "vue";
import { renderWithProviders } from "../../../test-utils";
import AucationLayout from "./AucationLayout.vue";

const NavbarComponent = {
  emits: ["toggle-sidebar"],
  setup(_, { emit }) {
    return () => h("button", { "data-testid": "nav", onClick: () => emit("toggle-sidebar") });
  },
};

const SidebarComponent = {
  props: { open: Boolean },
  emits: ["close"],
  setup(props, { emit }) {
    return () =>
      h("div", { "data-testid": "side", "data-open": String(props.open) }, [
        h("button", { "data-testid": "close", onClick: () => emit("close") }),
      ]);
  },
};

describe("AucationLayout", () => {
  async function render() {
    const Child = { render: () => h("p", { "data-testid": "child" }, "konten") };
    return renderWithProviders(AucationLayout, {
      route: "/",
      routes: [{ path: "/", component: Child }],
      global: { stubs: { NavbarComponent, SidebarComponent } },
    });
  }

  it("menampilkan konten halaman anak", async () => {
    const { wrapper } = await render();
    expect(wrapper.get('[data-testid="child"]').text()).toBe("konten");
  });

  it("sidebar awalnya tertutup", async () => {
    const { wrapper } = await render();
    expect(wrapper.get('[data-testid="side"]').attributes("data-open")).toBe("false");
  });

  it("toggle-sidebar dari navbar membuka sidebar", async () => {
    const { wrapper } = await render();

    await wrapper.get('[data-testid="nav"]').trigger("click");

    expect(wrapper.get('[data-testid="side"]').attributes("data-open")).toBe("true");
  });

  it("close dari sidebar menutup sidebar", async () => {
    const { wrapper } = await render();
    await wrapper.get('[data-testid="nav"]').trigger("click");

    await wrapper.get('[data-testid="close"]').trigger("click");

    expect(wrapper.get('[data-testid="side"]').attributes("data-open")).toBe("false");
  });
});
