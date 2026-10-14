import { describe, expect, it, vi } from "vitest";
import * as aucationApi from "../api/aucationApi";
import { createMockPinia } from "../../../test-utils";
import { useAucationsStore } from "./aucationsStore";

vi.mock("../api/aucationApi");

function setup() {
  createMockPinia();
  return useAucationsStore();
}

describe("fetchAucations", () => {
  it("sukses mengisi aucations dan mengatur isAucation", async () => {
    aucationApi.getAucations.mockResolvedValue({
      success: true,
      data: { aucations: [{ id: 1 }] },
    });
    const store = setup();

    const promise = store.fetchAucations();
    expect(store.isAucation).toBe(true);
    await promise;

    expect(aucationApi.getAucations).toHaveBeenCalledWith({});
    expect(store.aucations).toEqual([{ id: 1 }]);
    expect(store.isAucation).toBe(false);
  });

  it("meneruskan params filter", async () => {
    aucationApi.getAucations.mockResolvedValue({ success: true, data: { aucations: [] } });
    const store = setup();

    await store.fetchAucations({ is_closed: 1 });

    expect(aucationApi.getAucations).toHaveBeenCalledWith({ is_closed: 1 });
  });

  it("gagal membiarkan aucations kosong", async () => {
    aucationApi.getAucations.mockResolvedValue({ success: false, message: "Gagal" });
    const store = setup();

    const response = await store.fetchAucations();

    expect(response.message).toBe("Gagal");
    expect(store.aucations).toEqual([]);
    expect(store.isAucation).toBe(false);
  });
});

describe("fetchAucation", () => {
  it("sukses mengisi aucation", async () => {
    aucationApi.getAucation.mockResolvedValue({
      success: true,
      data: { aucation: { id: 5 } },
    });
    const store = setup();

    await store.fetchAucation(5);

    expect(aucationApi.getAucation).toHaveBeenCalledWith(5);
    expect(store.aucation).toEqual({ id: 5 });
    expect(store.isAucation).toBe(false);
  });

  it("gagal membiarkan aucation null", async () => {
    aucationApi.getAucation.mockResolvedValue({ success: false });
    const store = setup();

    await store.fetchAucation(5);

    expect(store.aucation).toBeNull();
    expect(store.isAucation).toBe(false);
  });
});

// [nama aksi, fungsi API, argumen, state "proses", state "selesai"]
const actions = [
  ["addAucation", "postAucation", [{ title: "x" }], "isAucationAdd", "isAucationAdded"],
  ["changeAucation", "putAucation", [5, { title: "x" }], "isAucationChange", "isAucationChanged"],
  ["changeCover", "postCover", [5, "file"], "isAucationChangeCover", "isAucationChangedCover"],
  ["removeAucation", "deleteAucation", [5], "isAucationDelete", "isAucationDeleted"],
  ["addBid", "postBid", [5, 250000], "isBidAdd", "isBidAdded"],
  ["removeBid", "deleteBid", [5], "isBidDelete", "isBidDeleted"],
  ["removeAllAucations", "deleteAllAucations", [], "isAucationDeleteAll", "isAucationDeletedAll"],
];

describe.each(actions)("%s", (action, apiName, args, processingKey, doneKey) => {
  it("sukses menyalakan state proses lalu state selesai", async () => {
    aucationApi[apiName].mockResolvedValue({ success: true, message: "ok" });
    const store = setup();

    const promise = store[action](...args);
    expect(store[processingKey]).toBe(true);
    const response = await promise;

    expect(aucationApi[apiName]).toHaveBeenCalledWith(...args);
    expect(response.success).toBe(true);
    expect(store[processingKey]).toBe(false);
    expect(store[doneKey]).toBe(true);
  });

  it("gagal tidak menandai state selesai", async () => {
    aucationApi[apiName].mockResolvedValue({ success: false, message: "Gagal" });
    const store = setup();

    const response = await store[action](...args);

    expect(response.message).toBe("Gagal");
    expect(store[processingKey]).toBe(false);
    expect(store[doneKey]).toBe(false);
  });
});