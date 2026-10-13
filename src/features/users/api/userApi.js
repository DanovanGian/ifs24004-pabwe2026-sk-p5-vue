import { fetchApi } from "../../../helpers/apiHelper";

export function getUsers() {
  return fetchApi("/users");
}

export function getProfile() {
  return fetchApi("/users/me");
}

export function putProfile({ name, email }) {
  return fetchApi("/users/me", { method: "PUT", body: { name, email } });
}

export function postPhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);
  return fetchApi("/users/me/photo", { method: "POST", body: formData });
}

export function putPassword({ password, newPassword }) {
  return fetchApi("/users/me/password", {
    method: "PUT",
    body: { password, new_password: newPassword },
  });
}