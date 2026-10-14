import { describe, expect, it, vi } from "vitest";
import * as userApi from "../api/userApi";
import { createMockPinia } from "../../../test-utils";
import { useUsersStore } from "./usersStore";

vi.mock("../api/userApi");

function setup() {
  createMockPinia();
  return useUsersStore();
}

describe("usersStore", () => {
  it("fetchUsers sukses mengisi users", async () => {
    userApi.getUsers.mockResolvedValue({ success: true, data: { users: [{ id: 1 }] } });
    const store = setup();

    await store.fetchUsers();

    expect(store.users).toEqual([{ id: 1 }]);
  });

  it("fetchUsers gagal membiarkan users kosong", async () => {
    userApi.getUsers.mockResolvedValue({ success: false, message: "Gagal" });
    const store = setup();

    const response = await store.fetchUsers();

    expect(response.message).toBe("Gagal");
    expect(store.users).toEqual([]);
  });

  it("fetchProfile sukses mengisi profile", async () => {
    userApi.getProfile.mockResolvedValue({ success: true, data: { user: { id: 97 } } });
    const store = setup();

    await store.fetchProfile();

    expect(store.profile).toEqual({ id: 97 });
  });

  it("fetchProfile gagal membiarkan profile null", async () => {
    userApi.getProfile.mockResolvedValue({ success: false });
    const store = setup();

    await store.fetchProfile();

    expect(store.profile).toBeNull();
  });

  it("changeProfile sukses menandai status dan memuat ulang profil", async () => {
    userApi.putProfile.mockResolvedValue({ success: true });
    userApi.getProfile.mockResolvedValue({ success: true, data: { user: { name: "Baru" } } });
    const store = setup();

    await store.changeProfile({ name: "Baru", email: "a@b.c" });

    expect(userApi.putProfile).toHaveBeenCalledWith({ name: "Baru", email: "a@b.c" });
    expect(store.isProfileChange).toBe(true);
    expect(userApi.getProfile).toHaveBeenCalledTimes(1);
    expect(store.profile).toEqual({ name: "Baru" });
  });

  it("changeProfile gagal tidak memuat ulang profil", async () => {
    userApi.putProfile.mockResolvedValue({ success: false, message: "Gagal" });
    const store = setup();

    const response = await store.changeProfile({});

    expect(response.message).toBe("Gagal");
    expect(store.isProfileChange).toBe(false);
    expect(userApi.getProfile).not.toHaveBeenCalled();
  });

  it("changePhoto sukses menandai status dan memuat ulang profil", async () => {
    userApi.postPhoto.mockResolvedValue({ success: true });
    userApi.getProfile.mockResolvedValue({ success: true, data: { user: { id: 1 } } });
    const store = setup();
    const file = new File(["x"], "foto.png");

    await store.changePhoto(file);

    expect(userApi.postPhoto).toHaveBeenCalledWith(file);
    expect(store.isPhotoChange).toBe(true);
    expect(userApi.getProfile).toHaveBeenCalledTimes(1);
  });

  it("changePhoto gagal tidak memuat ulang profil", async () => {
    userApi.postPhoto.mockResolvedValue({ success: false });
    const store = setup();

    await store.changePhoto(new File(["x"], "foto.png"));

    expect(store.isPhotoChange).toBe(false);
    expect(userApi.getProfile).not.toHaveBeenCalled();
  });

  it("changePassword sukses menandai isPasswordChange", async () => {
    userApi.putPassword.mockResolvedValue({ success: true });
    const store = setup();

    await store.changePassword({ password: "lama", newPassword: "baru" });

    expect(userApi.putPassword).toHaveBeenCalledWith({ password: "lama", newPassword: "baru" });
    expect(store.isPasswordChange).toBe(true);
  });

  it("changePassword gagal tidak menandai isPasswordChange", async () => {
    userApi.putPassword.mockResolvedValue({ success: false });
    const store = setup();

    await store.changePassword({});

    expect(store.isPasswordChange).toBe(false);
  });
});