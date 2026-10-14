import { describe, expect, it, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper";
import { getProfile, getUsers, postPhoto, putPassword, putProfile } from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

describe("userApi", () => {
  it("getUsers memanggil GET /users", async () => {
    fetchApi.mockResolvedValue({ success: true });
    await getUsers();
    expect(fetchApi).toHaveBeenCalledWith("/users");
  });

  it("getProfile memanggil GET /users/me", async () => {
    fetchApi.mockResolvedValue({ success: true });
    await getProfile();
    expect(fetchApi).toHaveBeenCalledWith("/users/me");
  });

  it("putProfile memanggil PUT /users/me dengan nama dan email", async () => {
    fetchApi.mockResolvedValue({ success: true });
    await putProfile({ name: "Gian", email: "a@b.c" });
    expect(fetchApi).toHaveBeenCalledWith("/users/me", {
      method: "PUT",
      body: { name: "Gian", email: "a@b.c" },
    });
  });

  it("postPhoto mengirim FormData berisi file photo", async () => {
    fetchApi.mockResolvedValue({ success: true });
    const file = new File(["x"], "foto.png", { type: "image/png" });

    await postPhoto(file);

    const [path, options] = fetchApi.mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(FormData);
    expect(options.body.get("photo").name).toBe("foto.png");
  });

  it("putPassword mengubah newPassword menjadi new_password", async () => {
    fetchApi.mockResolvedValue({ success: true });
    await putPassword({ password: "lama", newPassword: "baru" });
    expect(fetchApi).toHaveBeenCalledWith("/users/me/password", {
      method: "PUT",
      body: { password: "lama", new_password: "baru" },
    });
  });
});