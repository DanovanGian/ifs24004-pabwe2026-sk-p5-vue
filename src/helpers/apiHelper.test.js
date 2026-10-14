import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchApi, getAccessToken, putAccessToken } from "./apiHelper";

function mockFetch(json) {
  const fn = vi.fn().mockResolvedValue({ json: async () => json });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("penyimpanan token", () => {
  it("menyimpan dan membaca token", () => {
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
  });

  it("menghapus token saat diberi null", () => {
    putAccessToken("abc");
    putAccessToken(null);
    expect(getAccessToken()).toBeNull();
  });
});

describe("fetchApi", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("memakai GET tanpa opsi dan menandai success dari status", async () => {
    const fetchMock = mockFetch({ status: "success", message: "ok", data: { a: 1 } });

    const result = await fetchApi("/aucations");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url.toString()).toContain("/aucations");
    expect(init.method).toBe("GET");
    expect(init.headers).toEqual({});
    expect(init.body).toBeUndefined();
    expect(result).toEqual({ status: "success", message: "ok", data: { a: 1 }, success: true });
  });

  it("menandai success false jika status bukan success", async () => {
    mockFetch({ status: "fail", message: "salah" });
    const result = await fetchApi("/auth/login", { method: "POST", body: { a: 1 } });
    expect(result.success).toBe(false);
    expect(result.message).toBe("salah");
  });

  it("menambahkan query params dan membuang nilai kosong", async () => {
    const fetchMock = mockFetch({ status: "success" });

    await fetchApi("/aucations", {
      params: { is_closed: 1, is_me: "", a: null, b: undefined },
    });

    const url = fetchMock.mock.calls[0][0].toString();
    expect(url).toContain("is_closed=1");
    expect(url).not.toContain("is_me");
    expect(url).not.toContain("a=");
    expect(url).not.toContain("b=");
  });

  it("menambahkan header Authorization jika ada token", async () => {
    putAccessToken("rahasia");
    const fetchMock = mockFetch({ status: "success" });

    await fetchApi("/users/me");

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe("Bearer rahasia");
  });

  it("mengirim body JSON dengan Content-Type", async () => {
    const fetchMock = mockFetch({ status: "success" });

    await fetchApi("/auth/login", { method: "POST", body: { email: "a@b.c" } });

    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ email: "a@b.c" }));
  });

  it("mengirim FormData tanpa Content-Type manual", async () => {
    const fetchMock = mockFetch({ status: "success" });
    const formData = new FormData();
    formData.append("cover", "isi");

    await fetchApi("/aucations/1/cover", { method: "POST", body: formData });

    const init = fetchMock.mock.calls[0][1];
    expect(init.headers["Content-Type"]).toBeUndefined();
    expect(init.body).toBe(formData);
  });

  it("mengembalikan success false saat fetch melempar error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Failed to fetch")));
    const result = await fetchApi("/aucations");
    expect(result).toEqual({ success: false, message: "Failed to fetch" });
  });

  it("memakai pesan bawaan jika error tidak punya message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue({}));
    const result = await fetchApi("/aucations");
    expect(result).toEqual({ success: false, message: "Gagal terhubung ke server" });
  });
});