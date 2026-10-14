import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as aucationApi from "../api/aucationApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import ChangeModal from "./ChangeModal.vue";

vi.mock("../api/aucationApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(),
}));
vi.mock("../components/MarkdownEditor.vue", async () => {
  const { h } = await import("vue");
  return {
    default: {
      props: { modelValue: String },
      emits: ["update:modelValue"],
      setup(props, { emit }) {
        return () =>
          h("textarea", {
            "data-testid": "editor",
            value: props.modelValue,
            onInput: (e) => emit("update:modelValue", e.target.value),
          });
      },
    },
  };
});

const aucation = {
  id: 5,
  title: "Jam tangan",
  description: "Bekas",
  start_bid: 100000,
  closed_at: "2026-10-20T10:00:00",
};

function render(overrides = {}) {
  return renderWithProviders(ChangeModal, { props: { aucation: { ...aucation, ...overrides } } });
}

async function submit(wrapper) {
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("ChangeModal", () => {
  it("form terisi dengan data lelang", async () => {
    const { wrapper } = await render();

    expect(wrapper.get("#title").element.value).toBe("Jam tangan");
    expect(wrapper.get('[data-testid="editor"]').element.value).toBe("Bekas");
    expect(wrapper.get("#startBid").element.value).toBe("100000");
    expect(wrapper.get("#closedAt").element.value).toBe("2026-10-20T10:00");
  });

  it("waktu penutupan tidak valid menghasilkan input kosong", async () => {
    const { wrapper } = await render({ closed_at: "abc" });

    expect(wrapper.get("#closedAt").element.value).toBe("");
  });

  it("deskripsi kosong menghasilkan editor kosong", async () => {
    const { wrapper } = await render({ description: undefined });

    expect(wrapper.get('[data-testid="editor"]').element.value).toBe("");
  });

  it.each([
    ["judul", "#title"],
    ["harga awal", "#startBid"],
    ["waktu penutupan", "#closedAt"],
    ["deskripsi", '[data-testid="editor"]'],
  ])("menolak submit jika %s dikosongkan", async (_, selector) => {
    const { wrapper } = await render();
    await wrapper.get(selector).setValue("");

    await submit(wrapper);

    expect(showErrorDialog).toHaveBeenCalledWith("Semua kolom wajib diisi");
    expect(aucationApi.putAucation).not.toHaveBeenCalled();
  });

  it("menolak harga awal 0", async () => {
    const { wrapper } = await render();
    await wrapper.get("#startBid").setValue("0");

    await submit(wrapper);

    expect(showErrorDialog).toHaveBeenCalledWith("Harga awal harus lebih dari 0");
    expect(aucationApi.putAucation).not.toHaveBeenCalled();
  });

  it("sukses: mengirim perubahan lalu memancarkan changed dan close", async () => {
    aucationApi.putAucation.mockResolvedValue({ success: true, message: "Diubah" });
    const { wrapper } = await render();
    await wrapper.get("#title").setValue("Jam baru");

    await submit(wrapper);

    expect(aucationApi.putAucation).toHaveBeenCalledWith(5, {
      title: "Jam baru",
      description: "Bekas",
      startBid: 100000,
      closedAt: new Date("2026-10-20T10:00").toISOString(),
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Diubah");
    expect(wrapper.emitted("changed")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("gagal: menampilkan pesan error dan tidak menutup modal", async () => {
    aucationApi.putAucation.mockResolvedValue({ success: false, message: "Ditolak" });
    const { wrapper } = await render();

    await submit(wrapper);

    expect(showErrorDialog).toHaveBeenCalledWith("Ditolak");
    expect(wrapper.emitted("changed")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("tombol menampilkan 'Menyimpan...' selama request berjalan", async () => {
    let resolve;
    aucationApi.putAucation.mockReturnValue(new Promise((r) => (resolve = r)));
    const { wrapper } = await render();

    await wrapper.get("form").trigger("submit");
    const button = () => wrapper.get('button[type="submit"]');
    expect(button().text()).toBe("Menyimpan...");

    resolve({ success: false, message: "x" });
    await flushPromises();
    expect(button().text()).toBe("Simpan");
  });

  it("tombol Batal memancarkan close", async () => {
    const { wrapper } = await render();

    await wrapper.get('button[type="button"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});