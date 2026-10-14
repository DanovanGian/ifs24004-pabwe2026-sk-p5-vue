import { describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  formatRupiah,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("dialog SweetAlert2", () => {
  it("showSuccessDialog memakai judul bawaan", () => {
    showSuccessDialog("Tersimpan");
    expect(Swal.fire).toHaveBeenCalledWith({ icon: "success", title: "Berhasil", text: "Tersimpan" });
  });

  it("showSuccessDialog memakai judul khusus", () => {
    showSuccessDialog("Tersimpan", "Mantap");
    expect(Swal.fire).toHaveBeenCalledWith({ icon: "success", title: "Mantap", text: "Tersimpan" });
  });

  it("showErrorDialog memakai judul bawaan dan khusus", () => {
    showErrorDialog("Rusak");
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "error", title: "Gagal", text: "Rusak" });
    showErrorDialog("Rusak", "Ups");
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "error", title: "Ups", text: "Rusak" });
  });

  it("showWarningDialog memakai judul bawaan dan khusus", () => {
    showWarningDialog("Hati-hati");
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "warning", title: "Perhatian", text: "Hati-hati" });
    showWarningDialog("Hati-hati", "Awas");
    expect(Swal.fire).toHaveBeenLastCalledWith({ icon: "warning", title: "Awas", text: "Hati-hati" });
  });

  it("showConfirmDialog mengembalikan true saat dikonfirmasi", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    expect(await showConfirmDialog("Hapus?")).toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({ icon: "question", title: "Konfirmasi", showCancelButton: true })
    );
  });

  it("showConfirmDialog mengembalikan false saat dibatalkan, dengan judul khusus", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("Hapus?", "Yakin?")).toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ title: "Yakin?" }));
  });
});

describe("formatRupiah", () => {
  it("memformat angka ke rupiah", () => {
    expect(formatRupiah(1500000)).toContain("1.500.000");
  });

  it("menganggap nilai tidak valid sebagai 0", () => {
    expect(formatRupiah(undefined)).toContain("0");
    expect(formatRupiah("abc")).not.toContain("NaN");
  });
});

describe("formatDate", () => {
  it("mengembalikan '-' untuk nilai kosong", () => {
    expect(formatDate(null)).toBe("-");
  });

  it("mengembalikan '-' untuk tanggal tidak valid", () => {
    expect(formatDate("abc")).toBe("-");
  });

  it("memformat tanggal valid ke bahasa Indonesia", () => {
    const result = formatDate("2026-10-20T14:30:00");
    expect(result).toContain("Oktober");
    expect(result).toContain("2026");
  });
});