import { describe, expect, it, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper";
import { login, register } from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

describe("authApi", () => {
  it("login memanggil POST /auth/login dengan email dan password", async () => {
    fetchApi.mockResolvedValue({ success: true });

    const result = await login({ email: "a@b.c", password: "123456" });

    expect(fetchApi).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "a@b.c", password: "123456" },
    });
    expect(result).toEqual({ success: true });
  });

  it("register memanggil POST /auth/register dengan nama, email, dan password", async () => {
    fetchApi.mockResolvedValue({ success: true });

    const result = await register({ name: "Gian", email: "a@b.c", password: "123456" });

    expect(fetchApi).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "Gian", email: "a@b.c", password: "123456" },
    });
    expect(result).toEqual({ success: true });
  });
});