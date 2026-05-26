// API utilities: centralizes backend base URL construction and credentialed fetch calls.
const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

export const API_BASE = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
);

export const apiUrl = (path) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

export const apiFetch = (path, options = {}) => {
  const { headers, ...rest } = options;
  const defaultHeaders = rest.body ? { "Content-Type": "application/json" } : {};

  return fetch(apiUrl(path), {
    credentials: "include",
    headers: { ...defaultHeaders, ...headers },
    ...rest,
  });
};
