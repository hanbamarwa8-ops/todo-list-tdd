const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";
const AUTH_URL = `${API_BASE_URL}/api/auth`;

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${AUTH_URL}/refresh`, {
      method: "POST",
      credentials: "include"
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function authFetch(url, options = {}) {
  const fetchOptions = { ...options, credentials: "include" };

  let response = await fetch(url, fetchOptions);

  if (response.status === 401) {
    const refreshResponse = await refreshAccessToken();

    if (refreshResponse.ok) {
      response = await fetch(url, fetchOptions);
    }
  }

  return response;
}

export { API_BASE_URL, AUTH_URL };