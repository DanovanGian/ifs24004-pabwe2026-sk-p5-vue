import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as aucationApi from "../api/aucationApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import AddModal from "./AddModal.vue";

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

const CLOSED_AT = "2026-10-20T10:00";

async function fillForm(wrapper, overrides = {}) {
  const v = {
    title: "Jam tangan",
    description: "Bekas",
    startBid: "100000",
    closedAt: CLOSED_AT,
    ...overrides,
  };
  await wrapper.get("#title").setValue(v.title);
  await wrapper.get('[data-testid="editor"]').setValue(v.description);
  await wrapper.get("#startBid").setValue(v.startBid);
  await wrapper.get("#closedAt").setValue(v.closedAt);
}

async function submit(wrapper) {
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("AddModal", () => {
  it.each([
    ["judul", { title: "" }],
    ["deskripsi", { description: "" }],
    ["harga awal", { startBid: "" }],
    ["waktu penutupan", { closedAt: "" }],
  ])("menolak submit jika %s kosong", async (_, overrides) => {
    const { wrapper } = await renderWithProviders(AddModal);
    await fillForm(wrapper, overrides);

    await submit(wrapper);

    expect(showErrorDialog).toHaveBeenCalledWith("Semua kolom wajib diisi");
    expect(aucationApi.postAucation).not.toHaveBeenCalled();
  });

  it("menolak harga awal 0", async () => {
    const { wrapper } = await renderWithProviders(AddModal);
    await fillForm(wrapper, { startBid: "0" });

    await submit(wrapper);

    expect(showErrorDialog).toHaveBeenCalledWith("Harga awal harus lebih dari 0");
    expect(aucationApi.postAucation).not.toHaveBeenCalled();
  });

  it("sukses: mengirim data, menampilkan dialog, lalu memancarkan added dan close", async () => {
    aucationApi.postAucation.mockResolvedValue({ success: true, message: "Berhasil" });
    const { wrapper } = await renderWithProviders(AddModal);
    await fillForm(wrapper);

    await submit(wrapper);

    expect(aucationApi.postAucation).toHaveBeenCalledWith({
      title: "Jam tangan",
      description: "Bekas",
      startBid: 100000,
      closedAt: new Date(CLOSED_AT).toISOString(),
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil");
    expect(wrapper.emitted("added")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("gagal: menampilkan pesan error dan tidak menutup modal", async () => {
    aucationApi.postAucation.mockResolvedValue({ success: false, message: "Gagal simpan" });
    const { wrapper } = await renderWithProviders(AddModal);
    await fillForm(wrapper);

    await submit(wrapper);

    expect(showErrorDialog).toHaveBeenCalledWith("Gagal simpan");
    expect(wrapper.emitted("added")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("tombol menampilkan 'Menyimpan...' dan nonaktif selama request berjalan", async () => {
    let resolve;
    aucationApi.postAucation.mockReturnValue(new Promise((r) => (resolve = r)));
    const { wrapper } = await renderWithProviders(AddModal);
    await fillForm(wrapper);

    await wrapper.get("form").trigger("submit");
    const button = () => wrapper.get('button[type="submit"]');
    expect(button().text()).toBe("Menyimpan...");
    expect(button().attributes("disabled")).toBeDefined();

    resolve({ success: false, message: "x" });
    await flushPromises();
    expect(button().text()).toBe("Simpan");
  });

  it("tombol Batal memancarkan close", async () => {
    const { wrapper } = await renderWithProviders(AddModal);

    await wrapper.get('button[type="button"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});