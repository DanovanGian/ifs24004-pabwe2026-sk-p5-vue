import { fetchApi } from "../../../helpers/apiHelper";

export function login({ email, password }) {
  return fetchApi("/auth/login", { method: "POST", body: { email, password } });
}

export function register({ name, email, password }) {
  return fetchApi("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
}