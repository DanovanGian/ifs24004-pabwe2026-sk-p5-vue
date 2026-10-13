import Swal from "sweetalert2";

export function showSuccessDialog(message, title = "Berhasil") {
  return Swal.fire({ icon: "success", title, text: message });
}

export function showErrorDialog(message, title = "Gagal") {
  return Swal.fire({ icon: "error", title, text: message });
}

export function showWarningDialog(message, title = "Perhatian") {
  return Swal.fire({ icon: "warning", title, text: message });
}

export async function showConfirmDialog(message, title = "Konfirmasi") {
  const result = await Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Batal",
  });
  return result.isConfirmed;
}

export function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}