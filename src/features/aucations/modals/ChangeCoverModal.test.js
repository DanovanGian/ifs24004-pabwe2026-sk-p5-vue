import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as aucationApi from "../api/aucationApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import ChangeCoverModal from "./ChangeCoverModal.vue";

vi.mock("../api/aucationApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(),
}));

const file = new File(["x"], "cover.png", { type: "image/png" });

function render() {
  return renderWithProviders(ChangeCoverModal, { props: { aucationId: 5 } });
}

async function selectFiles(wrapper, files) {
  const input = wrapper.get('[data-testid="cover-input"]');
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
  await input.trigger("change");
}

describe("ChangeCoverModal", () => {
  it("tanpa file: tidak ada pratinjau", async () => {
    const { wrapper } = await render();

    await selectFiles(wrapper, []);

    expect(wrapper.find("img").exists()).toBe(false);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("memilih file menampilkan pratinjau", async () => {
    const { wrapper } = await render();

    await selectFiles(wrapper, [file]);

    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    expect(wrapper.get("img").attributes("src")).toBe("blob:mock-url");
  });

  it("memilih file lain melepas pratinjau sebelumnya", async () => {
    const { wrapper } = await render();
    await selectFiles(wrapper, [file]);

    await selectFiles(wrapper, [file]);

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("membatalkan pilihan file menghapus pratinjau", async () => {
    const { wrapper } = await render();
    await selectFiles(wrapper, [file]);

    await selectFiles(wrapper, []);

    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(wrapper.find("img").exists()).toBe(false);
  });

  it("melepas pratinjau saat komponen dilepas", async () => {
    const { wrapper } = await render();
    await selectFiles(wrapper, [file]);

    wrapper.unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
  });

  it("tidak melepas apa pun saat dilepas tanpa pratinjau", async () => {
    const { wrapper } = await render();

    wrapper.unmount();

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
  });

  it("menolak submit tanpa file", async () => {
    const { wrapper } = await render();

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(showErrorDialog).toHaveBeenCalledWith("Pilih gambar terlebih dahulu");
    expect(aucationApi.postCover).not.toHaveBeenCalled();
  });

  it("sukses: mengunggah file lalu memancarkan changed dan close", async () => {
    aucationApi.postCover.mockResolvedValue({ success: true, message: "Cover diganti" });
    const { wrapper } = await render();
    await selectFiles(wrapper, [file]);

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(aucationApi.postCover).toHaveBeenCalledWith(5, file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Cover diganti");
    expect(wrapper.emitted("changed")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("gagal: menampilkan pesan error dan tidak menutup modal", async () => {
    aucationApi.postCover.mockResolvedValue({ success: false, message: "File terlalu besar" });
    const { wrapper } = await render();
    await selectFiles(wrapper, [file]);

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(showErrorDialog).toHaveBeenCalledWith("File terlalu besar");
    expect(wrapper.emitted("changed")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("tombol menampilkan 'Mengunggah...' selama request berjalan", async () => {
    let resolve;
    aucationApi.postCover.mockReturnValue(new Promise((r) => (resolve = r)));
    const { wrapper } = await render();
    await selectFiles(wrapper, [file]);

    await wrapper.get("form").trigger("submit");
    const button = () => wrapper.get('button[type="submit"]');
    expect(button().text()).toBe("Mengunggah...");

    resolve({ success: false, message: "x" });
    await flushPromises();
    expect(button().text()).toBe("Unggah");
  });

  it("tombol Batal memancarkan close", async () => {
    const { wrapper } = await render();

    await wrapper.get('button[type="button"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
