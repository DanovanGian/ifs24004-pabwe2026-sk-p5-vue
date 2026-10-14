import { describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as aucationApi from "../api/aucationApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import BidModal from "./BidModal.vue";

vi.mock("../api/aucationApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue(),
}));

function render() {
  return renderWithProviders(BidModal, {
    props: { aucationId: 5, currentHighest: 100000 },
  });
}

async function submitBid(wrapper, value) {
  await wrapper.get("#bid").setValue(value);
  await wrapper.get("form").trigger("submit");
  await flushPromises();
}

describe("BidModal", () => {
  it("menampilkan tawaran tertinggi saat ini", async () => {
    const { wrapper } = await render();

    expect(wrapper.text()).toContain("100.000");
  });

  it("menolak nominal kosong tanpa memanggil API", async () => {
    const { wrapper } = await render();

    await submitBid(wrapper, "");

    expect(showErrorDialog).toHaveBeenCalledWith("Nominal penawaran wajib diisi");
    expect(aucationApi.postBid).not.toHaveBeenCalled();
  });

  it.each([
    ["sama dengan", "100000"],
    ["lebih rendah dari", "50000"],
  ])("menolak nominal yang %s tawaran tertinggi", async (_, value) => {
    const { wrapper } = await render();

    await submitBid(wrapper, value);

    expect(showErrorDialog).toHaveBeenCalledWith(expect.stringContaining("100.000"));
    expect(aucationApi.postBid).not.toHaveBeenCalled();
  });

  it("sukses: mengirim bid lalu memancarkan bid dan close", async () => {
    aucationApi.postBid.mockResolvedValue({ success: true, message: "Bid terkirim" });
    const { wrapper } = await render();

    await submitBid(wrapper, "150000");

    expect(aucationApi.postBid).toHaveBeenCalledWith(5, 150000);
    expect(showSuccessDialog).toHaveBeenCalledWith("Bid terkirim");
    expect(wrapper.emitted("bid")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("gagal: menampilkan pesan error dan tidak menutup modal", async () => {
    aucationApi.postBid.mockResolvedValue({ success: false, message: "Lelang ditutup" });
    const { wrapper } = await render();

    await submitBid(wrapper, "150000");

    expect(showErrorDialog).toHaveBeenCalledWith("Lelang ditutup");
    expect(wrapper.emitted("bid")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("tombol menampilkan 'Mengirim...' selama request berjalan", async () => {
    let resolve;
    aucationApi.postBid.mockReturnValue(new Promise((r) => (resolve = r)));
    const { wrapper } = await render();

    await wrapper.get("#bid").setValue("150000");
    await wrapper.get("form").trigger("submit");
    const button = () => wrapper.get('button[type="submit"]');
    expect(button().text()).toBe("Mengirim...");

    resolve({ success: false, message: "x" });
    await flushPromises();
    expect(button().text()).toBe("Kirim");
  });

  it("tombol Batal memancarkan close", async () => {
    const { wrapper } = await render();

    await wrapper.get('button[type="button"]').trigger("click");

    expect(wrapper.emitted("close")).toHaveLength(1);
  });
});
