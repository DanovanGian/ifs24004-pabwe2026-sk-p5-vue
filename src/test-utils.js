import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter } from "vue-router";

const Stub = { render: () => null };

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
    routes: routes || [{ path: "/:pathMatch(.*)*", component: Stub }],
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
