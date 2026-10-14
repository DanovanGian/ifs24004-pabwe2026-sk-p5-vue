import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import * as userApi from "../api/userApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";
import ProfilePage from "./ProfilePage.vue";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const profile = { id: 97, name: "Gian", email: "gian@mail.com" };

beforeEach(() => {
  userApi.getProfile.mockResolvedValue({ success: true, data: { user: profile } });
});

async function render() {
  const result = await renderWithProviders(ProfilePage);
  await flushPromises();
  return result;
}

async function submitForm(wrapper, index) {
  await wrapper.findAll("form")[index].trigger("submit");
  await flushPromises();
}

async function selectPhoto(wrapper, files) {
  const input = wrapper.get('input[type="file"]');
  Object.defineProperty(input.element, "files", { value: files, configurable: true });
  await input.trigger("change");
}

describe("form data akun", () => {
  it("terisi dari profil yang dimuat", async () => {
    const { wrapper } = await render();

    expect(wrapper.get("#name").element.value).toBe("Gian");
    expect(wrapper.get("#email").element.value).toBe("gian@mail.com");
  });

  it("kosong jika profil gagal dimuat", async () => {
    userApi.getProfile.mockResolvedValue({ success: false });

    const { wrapper } = await render();

    expect(wrapper.get("#name").element.value).toBe("");
    expect(wrapper.get("#email").element.value).toBe("");
  });

  it.each([
    ["nama", "#name"],
    ["email", "#email"],
  ])("menolak simpan jika %s dikosongkan", async (_, selector) => {
    const { wrapper } = await render();
    await wrapper.get(selector).setValue("");

    await submitForm(wrapper, 0);

    expect(showErrorDialog).toHaveBeenCalledWith("Nama dan email wajib diisi");
    expect(userApi.putProfile).not.toHaveBeenCalled();
  });

  it("sukses: menyimpan perubahan dan memuat ulang profil", async () => {
    userApi.putProfile.mockResolvedValue({ success: true, message: "Diperbarui" });
    const { wrapper } = await render();
    await wrapper.get("#name").setValue("Baru");

    await submitForm(wrapper, 0);

    expect(userApi.putProfile).toHaveBeenCalledWith({ name: "Baru", email: "gian@mail.com" });
    expect(showSuccessDialog).toHaveBeenCalledWith("Diperbarui");
    expect(userApi.getProfile).toHaveBeenCalledTimes(2);
  });

  it("gagal: menampilkan pesan error", async () => {
    userApi.putProfile.mockResolvedValue({ success: false, message: "Email dipakai" });
    const { wrapper } = await render();

    await submitForm(wrapper, 0);

    expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai");
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });
});

describe("form foto profil", () => {
  it("menolak unggah tanpa file", async () => {
    const { wrapper } = await render();
    await selectPhoto(wrapper, []);

    await submitForm(wrapper, 1);

    expect(showErrorDialog).toHaveBeenCalledWith("Pilih foto terlebih dahulu");
    expect(userApi.postPhoto).not.toHaveBeenCalled();
  });

  it("sukses: mengunggah file yang dipilih", async () => {
    userApi.postPhoto.mockResolvedValue({ success: true, message: "Foto diganti" });
    const file = new File(["x"], "foto.png", { type: "image/png" });
    const { wrapper } = await render();
    await selectPhoto(wrapper, [file]);

    await submitForm(wrapper, 1);

    expect(userApi.postPhoto).toHaveBeenCalledWith(file);
    expect(showSuccessDialog).toHaveBeenCalledWith("Foto diganti");
  });

  it("gagal: menampilkan pesan error", async () => {
    userApi.postPhoto.mockResolvedValue({ success: false, message: "File terlalu besar" });
    const { wrapper } = await render();
    await selectPhoto(wrapper, [new File(["x"], "foto.png")]);

    await submitForm(wrapper, 1);

    expect(showErrorDialog).toHaveBeenCalledWith("File terlalu besar");
  });
});

describe("form ganti kata sandi", () => {
  it.each([
    ["lama kosong", { password: "", newPassword: "baru123" }],
    ["baru kosong", { password: "lama123", newPassword: "" }],
  ])("menolak ubah jika kata sandi %s", async (_, values) => {
    const { wrapper } = await render();
    await wrapper.get("#password").setValue(values.password);
    await wrapper.get("#newPassword").setValue(values.newPassword);

    await submitForm(wrapper, 2);

    expect(showErrorDialog).toHaveBeenCalledWith("Kedua kolom kata sandi wajib diisi");
    expect(userApi.putPassword).not.toHaveBeenCalled();
  });

  it("sukses: mengubah kata sandi lalu mengosongkan kolom", async () => {
    userApi.putPassword.mockResolvedValue({ success: true, message: "Sandi diubah" });
    const { wrapper } = await render();
    await wrapper.get("#password").setValue("lama123");
    await wrapper.get("#newPassword").setValue("baru123");

    await submitForm(wrapper, 2);

    expect(userApi.putPassword).toHaveBeenCalledWith({
      password: "lama123",
      newPassword: "baru123",
    });
    expect(showSuccessDialog).toHaveBeenCalledWith("Sandi diubah");
    expect(wrapper.get("#password").element.value).toBe("");
    expect(wrapper.get("#newPassword").element.value).toBe("");
  });

  it("gagal: menampilkan pesan error dan mempertahankan isian", async () => {
    userApi.putPassword.mockResolvedValue({ success: false, message: "Sandi lama salah" });
    const { wrapper } = await render();
    await wrapper.get("#password").setValue("lama123");
    await wrapper.get("#newPassword").setValue("baru123");

    await submitForm(wrapper, 2);

    expect(showErrorDialog).toHaveBeenCalledWith("Sandi lama salah");
    expect(wrapper.get("#password").element.value).toBe("lama123");
  });
});