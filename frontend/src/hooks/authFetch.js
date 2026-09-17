const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const AUTH_URL = `${API_BASE_URL}/auth`;

export async function authFetch(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (response.status === 401) {
    const refreshResponse = await fetch(`${AUTH_URL}/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      response = await fetch(url, {
        ...options,
        credentials: "include",
      });
    }
  }

  return response;
}

export { API_BASE_URL, AUTH_URL };