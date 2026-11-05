import axios from "axios";

// Alamat backend. Bisa diganti lewat file .env di folder frontend: VITE_API_URL=http://localhost:5000
export const API_ORIGIN: string = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const TOKEN_KEY = "evertale_token";

export const api = axios.create({ baseURL: `${API_ORIGIN}/api` });

// Setiap request otomatis membawa token login (kalau ada)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token kedaluwarsa / akun dinonaktifkan → otomatis logout
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event("evertale:logout"));
    }
    return Promise.reject(error);
  }
);

// Placeholder gelap kalau karya belum punya cover
const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="300" height="400" fill="#14213D"/></svg>`
  );

// "/uploads/covers/x.jpg" → "http://localhost:5000/uploads/covers/x.jpg"
export function assetUrl(path?: string | null): string {
  if (!path) return PLACEHOLDER;
  return /^https?:|^data:/.test(path) ? path : `${API_ORIGIN}${path}`;
}

// Ambil pesan error dari backend untuk ditampilkan ke user
export function errorMessage(error: unknown, fallback = "Terjadi kesalahan. Coba lagi."): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Tidak bisa terhubung ke server. Pastikan backend sudah berjalan.";
    return (error.response.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}

export function isNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
