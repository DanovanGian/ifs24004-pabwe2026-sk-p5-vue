import { fetchApi } from "../../../helpers/apiHelper";

export function getAucations(params = {}) {
  return fetchApi("/aucations", { params });
}

export function getAucation(id) {
  return fetchApi(`/aucations/${id}`);
}

export function postAucation({ title, description, startBid, closedAt }) {
  return fetchApi("/aucations", {
    method: "POST",
    body: { title, description, start_bid: startBid, closed_at: closedAt },
  });
}

export function putAucation(id, { title, description, startBid, closedAt }) {
  return fetchApi(`/aucations/${id}`, {
    method: "PUT",
    body: { title, description, start_bid: startBid, closed_at: closedAt },
  });
}

export function postCover(id, file) {
  const formData = new FormData();
  formData.append("cover", file);
  return fetchApi(`/aucations/${id}/cover`, { method: "POST", body: formData });
}

export function deleteAucation(id) {
  return fetchApi(`/aucations/${id}`, { method: "DELETE" });
}

export function postBid(id, bid) {
  return fetchApi(`/aucations/${id}/bids`, { method: "POST", body: { bid } });
}

export function deleteBid(id) {
  return fetchApi(`/aucations/${id}/bids`, { method: "DELETE" });
}

export function deleteAllAucations() {
  return fetchApi("/aucations", { method: "DELETE" });
}