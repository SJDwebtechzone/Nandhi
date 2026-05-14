import axios from 'axios';

const TOKEN_KEY = 'nandhi_admin_token';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE || '') + '/api',
  timeout: 20000,
});

// ── Token helpers ───────────────────────────────────────────
export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}
export function saveToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else   localStorage.removeItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((cfg) => {
  const t = getToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // 401 = token expired / invalid → boot back to login
    if (err.response?.status === 401) {
      clearToken();
      if (!window.location.pathname.endsWith('/login')) {
        // import.meta.env.BASE_URL is '/admin/' in production, '/' in dev
        window.location.href = `${import.meta.env.BASE_URL}login`;
      }
    }
    return Promise.reject(err);
  }
);
