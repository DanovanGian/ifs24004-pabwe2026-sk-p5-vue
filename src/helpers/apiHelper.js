const TOKEN_KEY = "token";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function putAccessToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function fetchApi(path, options = {}) {
  try {
    const { method = "GET", params, body } = options;

    // 1. Susun URL + query parameters
    const url = new URL(`${DELCOM_BASEURL}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, value);
        }
      });
    }

    // 2. Susun header
    const headers = {};
    const token = getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // 3. Susun body (JSON atau FormData)
    const isFormData = body instanceof FormData;
    if (body && !isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    // 4. Delcom membalas { status: "success" | "fail" | "error", message, data }
    const json = await response.json();
    return { ...json, success: json.status === "success" };
  } catch (error) {
    return { success: false, message: error.message || "Gagal terhubung ke server" };
  }
}