/**
 * Central PropLease API client
 */

const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || window.location.origin;
const TOKEN_KEY = "proplease_token";
const USER_KEY = "proplease_user";

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

async function apiFetch(path, options = {}) {
  const headers = Object.assign({}, options.headers || {});
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = options.body instanceof FormData;
  let body = options.body;
  if (!isForm && body && typeof body === "object" && !(body instanceof Blob)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, Object.assign({}, options, { headers, body }));
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
  }
  if (!response.ok) {
    const detail = data && data.detail;
    const message = typeof detail === "string" ? detail : `API error: ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.payload = data;
    throw err;
  }
  return data;
}

const api = {
  health: () => apiFetch("/api/health"),
  stats: () => apiFetch("/api/stats"),
  signup: (body) => apiFetch("/api/auth/signup", { method: "POST", body }),
  login: (body) => apiFetch("/api/auth/login", { method: "POST", body }),
  logout: () => apiFetch("/api/auth/logout", { method: "POST" }),
  me: () => apiFetch("/api/auth/me"),
  listProperties: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
    });
    const qs = q.toString();
    return apiFetch(`/api/properties${qs ? `?${qs}` : ""}`);
  },
  getProperty: (id) => apiFetch(`/api/properties/${id}`),
  createProperty: (body) => apiFetch("/api/properties", { method: "POST", body }),
  updateProperty: (id, body) => apiFetch(`/api/properties/${id}`, { method: "PUT", body }),
  deleteProperty: (id) => apiFetch(`/api/properties/${id}`, { method: "DELETE" }),
  uploadPropertyImage: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return apiFetch(`/api/properties/${id}/images`, { method: "POST", body: form });
  },
  unlockContact: (id) => apiFetch(`/api/properties/${id}/contact`, { method: "POST" }),
  listFavorites: () => apiFetch("/api/favorites"),
  addFavorite: (id) => apiFetch(`/api/favorites/${id}`, { method: "POST" }),
  removeFavorite: (id) => apiFetch(`/api/favorites/${id}`, { method: "DELETE" }),
  createInquiry: (propertyId, body) =>
    apiFetch(`/api/properties/${propertyId}/inquiries`, { method: "POST", body }),
  myInquiries: () => apiFetch("/api/inquiries"),
  ownerInquiries: () => apiFetch("/api/owner/inquiries"),
  updateInquiryStatus: (id, status) =>
    apiFetch(`/api/inquiries/${id}/status`, { method: "PUT", body: { status } }),
  ownerProperties: () => apiFetch("/api/owner/properties"),
  adminProperties: () => apiFetch("/api/admin/properties"),
  adminApprove: (id) => apiFetch(`/api/admin/properties/${id}/approve`, { method: "PUT" }),
  adminReject: (id) => apiFetch(`/api/admin/properties/${id}/reject`, { method: "PUT" }),
  adminActivate: (id) => apiFetch(`/api/admin/properties/${id}/activate`, { method: "PUT" }),
  adminDeactivate: (id) => apiFetch(`/api/admin/properties/${id}/deactivate`, { method: "PUT" })
};

window.API_BASE_URL = API_BASE_URL;
window.TOKEN_KEY = TOKEN_KEY;
window.USER_KEY = USER_KEY;
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;
window.getStoredUser = getStoredUser;
window.setStoredUser = setStoredUser;
window.apiFetch = apiFetch;
window.api = api;
