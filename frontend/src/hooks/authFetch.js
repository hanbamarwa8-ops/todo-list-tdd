const API_URL =
  process.env.REACT_APP_API_URL || "https://my-task-app-eta.vercel.app/api";

export const AUTH_URL = `${API_URL}/auth`;

export async function authFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && !url.includes("/refresh")) {
    const refreshResponse = await fetch(`${AUTH_URL}/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      return fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      });
    }
  }

  return response;
}