import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { h } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

export const PageStub = { render: () => null };

export function createMockPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

export async function renderWithProviders(
  component,
  { props = {}, slots = {}, route = "/", routes, pinia = createMockPinia(), global = {} } = {}
) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes || [{ path: "/:pathMatch(.*)*", component: PageStub }],
  });
  router.push(route);
  await router.isReady();

  const wrapper = mount(component, {
    props,
    slots,
    global: { ...global, plugins: [pinia, router, ...(global.plugins || [])] },
  });

  return { wrapper, router, pinia };
}

// Komponen palsu: menampilkan props sebagai JSON dan satu tombol per event
export function createStub(testId, events = [], props = []) {
  return {
    props,
    emits: events,
    setup(componentProps, { emit }) {
      return () =>
        h(
          "div",
          { "data-testid": testId, "data-props": JSON.stringify(componentProps) },
          events.map((name) =>
            h("button", { "data-testid": `${testId}-${name}`, onClick: () => emit(name) })
          )
        );
    },
  };
}