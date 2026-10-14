import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as aucationApi from "../api/aucationApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";
import { PageStub, renderWithProviders } from "../../../test-utils";
import HomePage from "./HomePage.vue";

vi.mock("../api/aucationApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
}));
vi.mock("../modals/AddModal.vue", async () => {
  const { createStub } = await import("../../../test-utils");
  return { default: createStub("add-modal", ["added", "close"]) };
});

const HOUR = 3600000;
const DAY = 24 * HOUR;
const NOW = new Date("2026-10-14T00:00:00Z");
const inFuture = (ms) => new Date(NOW.getTime() + ms).toISOString();

const routes = [
  { path: "/", component: PageStub },
  { path: "/aucations/:id", component: PageStub },
];

const items = [
  {
    id: 1,
    title: "Jam Tangan",
    description: "Bekas bagus",
    start_bid: 100000,
    cover: "https://img/jam.png",
    closed_at: inFuture(3 * DAY + 2 * HOUR),
    bids: [{ bid: "150000" }, { bid: "200000" }],
  },
  {
    id: 2,
    title: "Sepeda",
    description: "Lipat",
    start_bid: 500000,
    closed_at: inFuture(5 * HOUR),
    bids: [],
  },
  {
    id: 3,
    title: "Kamera",
    description: "Antik",
    start_bid: 250000,
    closed_at: inFuture(-HOUR),
  },
  { id: 4 },
];

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
  aucationApi.getAucations.mockResolvedValue({ success: true, data: { aucations: items } });
});

afterEach(() => {
  vi.useRealTimers();
});

async function render(route = "/") {
  const result = await renderWithProviders(HomePage, { route, routes });
  await flushPromises();
  return result;
}

const button = (wrapper, text) => wrapper.findAll("button").find((b) => b.text() === text);
const search = (wrapper) => wrapper.get('input[type="search"]');

describe("daftar lelang", () => {
  it("menampilkan semua kartu", async () => {
    const { wrapper } = await render();

    expect(wrapper.findAll("li")).toHaveLength(4);
  });

  it("kartu lelang berlangsung: gambar, harga awal, tawaran tertinggi, dan sisa waktu", async () => {
    const { wrapper } = await render();
    const card = wrapper.findAll("li")[0];

    expect(card.text()).toContain("Jam Tangan");
    expect(card.text()).toContain("100.000");
    expect(card.text()).toContain("200.000");
    expect(card.text()).toContain("3 hari 2 jam lagi");
    expect(card.get("img").attributes("src")).toBe("https://img/jam.png");
    expect(card.get("a").attributes("href")).toBe("/aucations/1");
  });

  it("sisa waktu kurang dari sehari hanya menampilkan jam, dan tanpa tawaran tampil 'Belum ada'", async () => {
    const { wrapper } = await render();
    const card = wrapper.findAll("li")[1];

    expect(card.text()).toContain("5 jam lagi");
    expect(card.text()).not.toContain("hari");
    expect(card.text()).toContain("Belum ada");
    expect(card.text()).toContain("Tanpa gambar");
  });

  it("lelang yang waktunya sudah lewat berstatus Ditutup", async () => {
    const { wrapper } = await render();

    expect(wrapper.findAll("li")[2].text()).toContain("Ditutup");
  });

  it("data tidak lengkap tetap tampil aman", async () => {
    const { wrapper } = await render();
    const card = wrapper.findAll("li")[3];

    expect(card.text()).toContain("Ditutup");
    expect(card.text()).toContain("Belum ada");
    expect(card.text()).toContain("Tanpa gambar");
  });

  it("menampilkan 'Memuat...' selama data diambil", async () => {
    let resolve;
    aucationApi.getAucations.mockReturnValue(new Promise((r) => (resolve = r)));
    const { wrapper } = await renderWithProviders(HomePage, { route: "/", routes });
    await flushPromises();

    expect(wrapper.text()).toContain("Memuat...");

    resolve({ success: true, data: { aucations: [] } });
    await flushPromises();
    expect(wrapper.text()).not.toContain("Memuat...");
    expect(wrapper.text()).toContain("Tidak ada lelang yang ditemukan.");
  });

  it("gagal memuat: menampilkan dialog error", async () => {
    aucationApi.getAucations.mockResolvedValue({ success: false, message: "Gagal memuat" });

    const { wrapper } = await render();

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal memuat");
    expect(wrapper.text()).toContain("Tidak ada lelang yang ditemukan.");
  });
});

describe("pencarian", () => {
  it("memfilter berdasarkan judul tanpa memedulikan huruf besar dan spasi", async () => {
    const { wrapper } = await render();

    await search(wrapper).setValue("  JAM ");

    const cards = wrapper.findAll("li");
    expect(cards).toHaveLength(1);
    expect(cards[0].text()).toContain("Jam Tangan");
  });

  it("memfilter berdasarkan deskripsi", async () => {
    const { wrapper } = await render();

    await search(wrapper).setValue("lipat");

    const cards = wrapper.findAll("li");
    expect(cards).toHaveLength(1);
    expect(cards[0].text()).toContain("Sepeda");
  });

  it("menampilkan pesan jika tidak ada yang cocok", async () => {
    const { wrapper } = await render();

    await search(wrapper).setValue("zzz");

    expect(wrapper.findAll("li")).toHaveLength(0);
    expect(wrapper.text()).toContain("Tidak ada lelang yang ditemukan.");
  });

  it("mengosongkan kata kunci menampilkan semua lagi", async () => {
    const { wrapper } = await render();
    await search(wrapper).setValue("jam");

    await search(wrapper).setValue("");

    expect(wrapper.findAll("li")).toHaveLength(4);
  });
});

describe("tab filter", () => {
  it("awalnya memuat semua lelang dengan tab 'Semua Lelang' aktif", async () => {
    const { wrapper } = await render();

    expect(aucationApi.getAucations).toHaveBeenCalledWith({});
    expect(button(wrapper, "Semua Lelang").classes()).toContain("bg-indigo-600");
  });

  it.each([
    ["Lelang Saya", "mine", { is_me: 1 }],
    ["Lelang Berlangsung", "ongoing", { is_closed: 0 }],
    ["Lelang Ditutup", "closed", { is_closed: 1 }],
  ])("klik tab %s memuat ulang dengan filter yang sesuai", async (label, key, params) => {
    const { wrapper, router } = await render();

    await button(wrapper, label).trigger("click");
    await flushPromises();

    expect(aucationApi.getAucations).toHaveBeenLastCalledWith(params);
    expect(router.currentRoute.value.query.filter).toBe(key);
    expect(button(wrapper, label).classes()).toContain("bg-indigo-600");
  });

  it("klik 'Semua Lelang' menghapus filter dari URL", async () => {
    const { wrapper, router } = await render("/?filter=mine");

    await button(wrapper, "Semua Lelang").trigger("click");
    await flushPromises();

    expect(router.currentRoute.value.query.filter).toBeUndefined();
    expect(aucationApi.getAucations).toHaveBeenLastCalledWith({});
    expect(button(wrapper, "Semua Lelang").classes()).toContain("bg-indigo-600");
  });

  it("tab awal mengikuti query URL", async () => {
    const { wrapper } = await render("/?filter=ongoing");

    expect(aucationApi.getAucations).toHaveBeenCalledWith({ is_closed: 0 });
    expect(button(wrapper, "Lelang Berlangsung").classes()).toContain("bg-indigo-600");
  });

  it("filter yang tidak dikenal dianggap 'Semua Lelang'", async () => {
    await render("/?filter=xyz");

    expect(aucationApi.getAucations).toHaveBeenCalledWith({});
  });

  it("mengikuti perubahan query dari luar, misalnya dari menu sidebar", async () => {
    const { wrapper, router } = await render();

    await router.push("/?filter=closed");
    await flushPromises();
    expect(aucationApi.getAucations).toHaveBeenLastCalledWith({ is_closed: 1 });
    expect(button(wrapper, "Lelang Ditutup").classes()).toContain("bg-indigo-600");

    await router.push("/");
    await flushPromises();
    expect(aucationApi.getAucations).toHaveBeenLastCalledWith({});
    expect(button(wrapper, "Semua Lelang").classes()).toContain("bg-indigo-600");
  });
});

describe("modal tambah lelang", () => {
  it("tidak tampil di awal, tampil saat tombol + Lelang diklik, dan hilang saat ditutup", async () => {
    const { wrapper } = await render();
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(false);

    await button(wrapper, "+ Lelang").trigger("click");
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(true);

    await wrapper.get('[data-testid="add-modal-close"]').trigger("click");
    expect(wrapper.find('[data-testid="add-modal"]').exists()).toBe(false);
  });

  it("memuat ulang daftar setelah lelang ditambahkan", async () => {
    const { wrapper } = await render();
    await button(wrapper, "+ Lelang").trigger("click");
    expect(aucationApi.getAucations).toHaveBeenCalledTimes(1);

    await wrapper.get('[data-testid="add-modal-added"]').trigger("click");
    await flushPromises();

    expect(aucationApi.getAucations).toHaveBeenCalledTimes(2);
  });
});
