import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { fetchApi, putAccessToken } from "./helpers/apiHelper";

vi.mock("@toast-ui/editor", () => ({
  default: vi.fn(function () {
    return { on: vi.fn(), getMarkdown: vi.fn(), destroy: vi.fn() };
  }),
}));
vi.mock("@toast-ui/editor/dist/toastui-editor-viewer", () => ({
  default: vi.fn(function () {
    return { setMarkdown: vi.fn(), destroy: vi.fn() };
  }),
}));
vi.mock("./helpers/apiHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  fetchApi: vi.fn(),
}));

const wrappers = [];

beforeEach(() => {
  fetchApi.mockResolvedValue({
    success: true,
    data: {
      token: "tok",
      users: [],
      aucations: [],
      user: { id: 1, name: "Gian", email: "gian@mail.com" },
      aucation: {
        id: 1,
        user_id: 1,
        title: "Jam Tangan",
        description: "Bekas",
        start_bid: 100000,
        closed_at: "2099-01-01T00:00:00",
        bids: [],
      },
    },
  });
});

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount());
});

async function renderAt(path) {
  const wrapper = mount(App, { global: { plugins: [createPinia(), router] } });
  wrappers.push(wrapper);
  await router.push(path);
  await flushPromises();
  return wrapper;
}

describe("App tanpa login", () => {
  it("mengarahkan halaman terlindungi ke login", async () => {
    const wrapper = await renderAt("/");

    expect(router.currentRoute.value.fullPath).toBe("/auth/login");
    expect(wrapper.get("h2").text()).toBe("Masuk");
    expect(wrapper.text()).toContain("Delcom Auction");
  });

  it("membuka halaman registrasi", async () => {
    const wrapper = await renderAt("/auth/register");

    expect(router.currentRoute.value.fullPath).toBe("/auth/register");
    expect(wrapper.get("h2").text()).toBe("Daftar");
  });

  it("menampilkan halaman 404 untuk rute yang tidak dikenal", async () => {
    const wrapper = await renderAt("/tidak-ada");

    expect(wrapper.get("h1").text()).toBe("404");
  });
});

describe("App dengan login", () => {
  beforeEach(() => {
    putAccessToken("tok");
  });

  it.each([
    ["/", "Dashboard Lelang"],
    ["/aucations/1", "Jam Tangan"],
    ["/users", "Daftar Pengguna"],
    ["/profile", "Profil Saya"],
  ])("membuka %s di dalam layout lelang", async (path, heading) => {
    const wrapper = await renderAt(path);

    expect(router.currentRoute.value.fullPath).toBe(path);
    expect(wrapper.get("main h1").text()).toBe(heading);
    expect(wrapper.text()).toContain("Gian");
  });

  it("mengarahkan halaman login ke beranda", async () => {
    const wrapper = await renderAt("/auth/login");

    expect(router.currentRoute.value.fullPath).toBe("/");
    expect(wrapper.get("main h1").text()).toBe("Dashboard Lelang");
  });
});
