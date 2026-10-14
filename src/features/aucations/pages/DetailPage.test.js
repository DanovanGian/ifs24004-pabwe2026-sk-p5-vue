import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as aucationApi from "../api/aucationApi";
import * as userApi from "../../users/api/userApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import { PageStub, renderWithProviders } from "../../../test-utils";
import DetailPage from "./DetailPage.vue";

vi.mock("../api/aucationApi");
vi.mock("../../users/api/userApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(),
}));
vi.mock("../components/MarkdownViewer.vue", async () => {
  const { createStub } = await import("../../../test-utils");
  return { default: createStub("viewer", [], ["content"]) };
});
vi.mock("../modals/BidModal.vue", async () => {
  const { createStub } = await import("../../../test-utils");
  return {
    default: createStub("bid-modal", ["bid", "close"], ["aucationId", "currentHighest"]),
  };
});
vi.mock("../modals/ChangeModal.vue", async () => {
  const { createStub } = await import("../../../test-utils");
  return { default: createStub("change-modal", ["changed", "close"], ["aucation"]) };
});
vi.mock("../modals/ChangeCoverModal.vue", async () => {
  const { createStub } = await import("../../../test-utils");
  return { default: createStub("cover-modal", ["changed", "close"], ["aucationId"]) };
});

const HOUR = 3600000;
const DAY = 24 * HOUR;
const NOW = new Date("2026-10-14T00:00:00Z");
const inFuture = (ms) => new Date(NOW.getTime() + ms).toISOString();

const routes = [
  { path: "/", component: PageStub },
  { path: "/aucations/:aucationId", component: PageStub },
];

const baseAucation = {
  id: 5,
  user_id: 97,
  title: "Jam Tangan",
  description: "# Bekas",
  start_bid: 100000,
  cover: "https://img/jam.png",
  closed_at: inFuture(2 * DAY),
  bids: [
    { id: 1, bid: "150000", created_at: "2026-10-13T10:00:00Z", user: { name: "Budi" } },
    { id: 2, bid: "300000", created_at: "2026-10-13T11:00:00Z", name: "Sari" },
    { bid: "200000", created_at: "2026-10-13T12:00:00Z" },
  ],
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

async function render({ aucation = baseAucation, profile = { id: 97 } } = {}) {
  aucationApi.getAucation.mockResolvedValue({ success: true, data: { aucation } });
  userApi.getProfile.mockResolvedValue({ success: true, data: { user: profile } });
  const result = await renderWithProviders(DetailPage, { route: "/aucations/5", routes });
  await flushPromises();
  return result;
}

const button = (wrapper, text) => wrapper.findAll("button").find((b) => b.text() === text);
const byId = (wrapper, id) => wrapper.find(`[data-testid="${id}"]`);

describe("memuat data", () => {
  it("meminta lelang sesuai parameter URL", async () => {
    await render();

    expect(aucationApi.getAucation).toHaveBeenCalledWith("5");
  });

  it("menampilkan 'Memuat...' selama data diambil", async () => {
    aucationApi.getAucation.mockReturnValue(new Promise(() => {}));
    userApi.getProfile.mockResolvedValue({ success: true, data: { user: { id: 97 } } });
    const { wrapper } = await renderWithProviders(DetailPage, { route: "/aucations/5", routes });
    await flushPromises();

    expect(wrapper.text()).toContain("Memuat...");
  });

  it("gagal memuat: menampilkan dialog error dan tidak menampilkan detail", async () => {
    aucationApi.getAucation.mockResolvedValue({ success: false, message: "Tidak ditemukan" });
    userApi.getProfile.mockResolvedValue({ success: true, data: { user: { id: 97 } } });

    const { wrapper } = await renderWithProviders(DetailPage, { route: "/aucations/5", routes });
    await flushPromises();

    expect(showErrorDialog).toHaveBeenCalledWith("Tidak ditemukan");
    expect(wrapper.find("h1").exists()).toBe(false);
  });
});

describe("tampilan detail", () => {
  it("menampilkan judul, status, harga, waktu tutup, cover, dan deskripsi", async () => {
    const { wrapper } = await render();

    expect(wrapper.get("h1").text()).toBe("Jam Tangan");
    expect(wrapper.text()).toContain("Berlangsung");
    expect(wrapper.text()).toContain("100.000");
    expect(wrapper.text()).toContain("300.000");
    expect(wrapper.text()).toContain("Oktober");
    expect(wrapper.get("img").attributes("src")).toBe("https://img/jam.png");
    expect(JSON.parse(byId(wrapper, "viewer").attributes("data-props")).content).toBe("# Bekas");
  });

  it("tanpa cover menampilkan 'Tanpa gambar'", async () => {
    const { wrapper } = await render({ aucation: { ...baseAucation, cover: undefined } });

    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("Tanpa gambar");
  });

  it("tanpa deskripsi, viewer menerima string kosong", async () => {
    const { wrapper } = await render({ aucation: { ...baseAucation, description: undefined } });

    expect(JSON.parse(byId(wrapper, "viewer").attributes("data-props")).content).toBe("");
  });

  it("lelang yang waktunya lewat berstatus Ditutup", async () => {
    const { wrapper } = await render({
      aucation: { ...baseAucation, closed_at: inFuture(-HOUR) },
    });

    const badge = wrapper.get("span.rounded-full");
    expect(badge.text()).toBe("Ditutup");
    expect(badge.classes()).toContain("bg-slate-200");
  });

  it("riwayat penawaran diurutkan dari yang tertinggi dengan nama penawar yang sesuai", async () => {
    const { wrapper } = await render();

    const rows = wrapper.findAll("section li");
    expect(rows).toHaveLength(3);
    expect(rows[0].text()).toContain("Sari");
    expect(rows[0].text()).toContain("300.000");
    expect(rows[1].text()).toContain("Peserta");
    expect(rows[1].text()).toContain("200.000");
    expect(rows[2].text()).toContain("Budi");
    expect(rows[2].text()).toContain("150.000");
  });

  it("tanpa penawaran: tampil pesan kosong dan tawaran tertinggi = harga awal", async () => {
    const { wrapper } = await render({ aucation: { ...baseAucation, bids: undefined } });

    expect(wrapper.text()).toContain("Belum ada penawaran.");
    const highest = wrapper.findAll("p").find((p) => p.text().includes("Tawaran tertinggi"));
    expect(highest.text()).toContain("100.000");
  });
});

describe("tombol aksi", () => {
  it("pemilik melihat Ubah, Ganti Cover, dan Hapus, tanpa tombol bid", async () => {
    const { wrapper } = await render();

    expect(button(wrapper, "Ubah")).toBeDefined();
    expect(button(wrapper, "Ganti Cover")).toBeDefined();
    expect(button(wrapper, "Hapus")).toBeDefined();
    expect(button(wrapper, "Ajukan Penawaran")).toBeUndefined();
  });

  it("bukan pemilik pada lelang berlangsung melihat tombol bid", async () => {
    const { wrapper } = await render({ profile: { id: 1 } });

    expect(button(wrapper, "Ajukan Penawaran")).toBeDefined();
    expect(button(wrapper, "Batalkan Tawaran Saya")).toBeDefined();
    expect(button(wrapper, "Hapus")).toBeUndefined();
  });

  it("bukan pemilik pada lelang yang sudah ditutup tidak melihat tombol apa pun", async () => {
    const { wrapper } = await render({
      aucation: { ...baseAucation, closed_at: inFuture(-HOUR) },
      profile: { id: 1 },
    });

    expect(wrapper.findAll("button")).toHaveLength(0);
  });
});

describe("hapus lelang", () => {
  it("dibatalkan: tidak memanggil API", async () => {
    showConfirmDialog.mockResolvedValue(false);
    const { wrapper, router } = await render();

    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();

    expect(aucationApi.deleteAucation).not.toHaveBeenCalled();
    expect(router.currentRoute.value.fullPath).toBe("/aucations/5");
  });

  it("sukses: menghapus lalu kembali ke beranda", async () => {
    showConfirmDialog.mockResolvedValue(true);
    aucationApi.deleteAucation.mockResolvedValue({ success: true, message: "Dihapus" });
    const { wrapper, router } = await render();

    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();

    expect(aucationApi.deleteAucation).toHaveBeenCalledWith(5);
    expect(showSuccessDialog).toHaveBeenCalledWith("Dihapus");
    expect(router.currentRoute.value.fullPath).toBe("/");
  });

  it("gagal: menampilkan pesan error dan tetap di halaman detail", async () => {
    showConfirmDialog.mockResolvedValue(true);
    aucationApi.deleteAucation.mockResolvedValue({ success: false, message: "Gagal hapus" });
    const { wrapper, router } = await render();

    await button(wrapper, "Hapus").trigger("click");
    await flushPromises();

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal hapus");
    expect(router.currentRoute.value.fullPath).toBe("/aucations/5");
  });
});

describe("batalkan tawaran", () => {
  it("dibatalkan: tidak memanggil API", async () => {
    showConfirmDialog.mockResolvedValue(false);
    const { wrapper } = await render({ profile: { id: 1 } });

    await button(wrapper, "Batalkan Tawaran Saya").trigger("click");
    await flushPromises();

    expect(aucationApi.deleteBid).not.toHaveBeenCalled();
  });

  it("sukses: menghapus tawaran lalu memuat ulang lelang", async () => {
    showConfirmDialog.mockResolvedValue(true);
    aucationApi.deleteBid.mockResolvedValue({ success: true, message: "Tawaran dibatalkan" });
    const { wrapper } = await render({ profile: { id: 1 } });

    await button(wrapper, "Batalkan Tawaran Saya").trigger("click");
    await flushPromises();

    expect(aucationApi.deleteBid).toHaveBeenCalledWith(5);
    expect(showSuccessDialog).toHaveBeenCalledWith("Tawaran dibatalkan");
    expect(aucationApi.getAucation).toHaveBeenCalledTimes(2);
  });

  it("gagal: menampilkan pesan error tanpa memuat ulang", async () => {
    showConfirmDialog.mockResolvedValue(true);
    aucationApi.deleteBid.mockResolvedValue({ success: false, message: "Tidak ada tawaran" });
    const { wrapper } = await render({ profile: { id: 1 } });

    await button(wrapper, "Batalkan Tawaran Saya").trigger("click");
    await flushPromises();

    expect(showErrorDialog).toHaveBeenCalledWith("Tidak ada tawaran");
    expect(aucationApi.getAucation).toHaveBeenCalledTimes(1);
  });
});

describe("modal", () => {
  it("BidModal menerima id dan tawaran tertinggi, memuat ulang setelah bid, dan bisa ditutup", async () => {
    const { wrapper } = await render({ profile: { id: 1 } });
    expect(byId(wrapper, "bid-modal").exists()).toBe(false);

    await button(wrapper, "Ajukan Penawaran").trigger("click");
    const props = JSON.parse(byId(wrapper, "bid-modal").attributes("data-props"));
    expect(props).toEqual({ aucationId: 5, currentHighest: 300000 });

    await byId(wrapper, "bid-modal-bid").trigger("click");
    await flushPromises();
    expect(aucationApi.getAucation).toHaveBeenCalledTimes(2);

    await byId(wrapper, "bid-modal-close").trigger("click");
    expect(byId(wrapper, "bid-modal").exists()).toBe(false);
  });

  it("ChangeModal menerima data lelang, memuat ulang setelah diubah, dan bisa ditutup", async () => {
    const { wrapper } = await render();

    await button(wrapper, "Ubah").trigger("click");
    const props = JSON.parse(byId(wrapper, "change-modal").attributes("data-props"));
    expect(props.aucation.id).toBe(5);

    await byId(wrapper, "change-modal-changed").trigger("click");
    await flushPromises();
    expect(aucationApi.getAucation).toHaveBeenCalledTimes(2);

    await byId(wrapper, "change-modal-close").trigger("click");
    expect(byId(wrapper, "change-modal").exists()).toBe(false);
  });

  it("ChangeCoverModal menerima id lelang, memuat ulang setelah diganti, dan bisa ditutup", async () => {
    const { wrapper } = await render();

    await button(wrapper, "Ganti Cover").trigger("click");
    const props = JSON.parse(byId(wrapper, "cover-modal").attributes("data-props"));
    expect(props).toEqual({ aucationId: 5 });

    await byId(wrapper, "cover-modal-changed").trigger("click");
    await flushPromises();
    expect(aucationApi.getAucation).toHaveBeenCalledTimes(2);

    await byId(wrapper, "cover-modal-close").trigger("click");
    expect(byId(wrapper, "cover-modal").exists()).toBe(false);
  });
});