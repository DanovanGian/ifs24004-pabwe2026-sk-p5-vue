import { describe, expect, it, vi } from "vitest";
import { fetchApi } from "../../../helpers/apiHelper";
import {
  deleteAllAucations,
  deleteAucation,
  deleteBid,
  getAucation,
  getAucations,
  postAucation,
  postBid,
  postCover,
  putAucation,
} from "./aucationApi";

vi.mock("../../../helpers/apiHelper", () => ({ fetchApi: vi.fn() }));

const payload = {
  title: "Jam tangan",
  description: "Bekas",
  startBid: 100000,
  closedAt: "2026-10-20T10:00:00.000Z",
};
const body = {
  title: "Jam tangan",
  description: "Bekas",
  start_bid: 100000,
  closed_at: "2026-10-20T10:00:00.000Z",
};

describe("aucationApi", () => {
  it("getAucations memakai params kosong secara bawaan", async () => {
    await getAucations();
    expect(fetchApi).toHaveBeenCalledWith("/aucations", { params: {} });
  });

  it("getAucations meneruskan params filter", async () => {
    await getAucations({ is_me: 1 });
    expect(fetchApi).toHaveBeenCalledWith("/aucations", { params: { is_me: 1 } });
  });

  it("getAucation memanggil GET /aucations/:id", async () => {
    await getAucation(5);
    expect(fetchApi).toHaveBeenCalledWith("/aucations/5");
  });

  it("postAucation mengubah camelCase menjadi snake_case", async () => {
    await postAucation(payload);
    expect(fetchApi).toHaveBeenCalledWith("/aucations", { method: "POST", body });
  });

  it("putAucation memanggil PUT /aucations/:id", async () => {
    await putAucation(5, payload);
    expect(fetchApi).toHaveBeenCalledWith("/aucations/5", { method: "PUT", body });
  });

  it("postCover mengirim FormData berisi file cover", async () => {
    const file = new File(["x"], "cover.png", { type: "image/png" });

    await postCover(5, file);

    const [path, options] = fetchApi.mock.calls[0];
    expect(path).toBe("/aucations/5/cover");
    expect(options.method).toBe("POST");
    expect(options.body.get("cover").name).toBe("cover.png");
  });

  it("deleteAucation memanggil DELETE /aucations/:id", async () => {
    await deleteAucation(5);
    expect(fetchApi).toHaveBeenCalledWith("/aucations/5", { method: "DELETE" });
  });

  it("postBid mengirim nominal bid", async () => {
    await postBid(5, 250000);
    expect(fetchApi).toHaveBeenCalledWith("/aucations/5/bids", {
      method: "POST",
      body: { bid: 250000 },
    });
  });

  it("deleteBid memanggil DELETE /aucations/:id/bids", async () => {
    await deleteBid(5);
    expect(fetchApi).toHaveBeenCalledWith("/aucations/5/bids", { method: "DELETE" });
  });

  it("deleteAllAucations memanggil DELETE /aucations", async () => {
    await deleteAllAucations();
    expect(fetchApi).toHaveBeenCalledWith("/aucations", { method: "DELETE" });
  });
});