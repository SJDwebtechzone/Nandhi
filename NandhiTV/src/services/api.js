import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// -------- BASE URL ----------
// Android emulator -> http://10.0.2.2:4000
// iOS simulator   -> http://localhost:4000
// Real device on same Wi-Fi -> your laptop's LAN IP (set USE_LAN_IP=true)
// Real device anywhere (client testing) -> set PUBLIC_URL to your ngrok or
//                                          deployed backend URL.
// Production      -> https://api.nandhitv.com
const USE_LAN_IP   = false;
const USE_PUBLIC   =true; // ← flip to true when sharing build with client
const LAN_IP       = 'http://192.168.111.95:4000';
const PUBLIC_URL   = 'http://72.61.245.163:4001'; // ← paste here

export const API_BASE_URL = USE_PUBLIC
  ? PUBLIC_URL
  : USE_LAN_IP
    ? LAN_IP
    : Platform.OS === 'android'
      ? 'http://10.0.2.2:4000'
      : 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
});

// -------- Auth token attachment ----------
// Token is loaded from AsyncStorage at app startup (AuthContext) and kept
// in memory. Any request after login gets `Authorization: Bearer <token>`.
const TOKEN_STORAGE_KEY = '@nandhi_tv/user_token';
let inMemoryToken = null;


export function setAuthToken(token) {
  inMemoryToken = token || null;
}

export async function loadStoredToken() {
  try {
    const t = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    inMemoryToken = t || null;
    return t;
  } catch (e) { return null; }
}

export async function persistToken(token) {
  inMemoryToken = token || null;
  try {
    if (token) await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
    else       await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (e) { /* ignore */ }
}

api.interceptors.request.use((cfg) => {
  if (inMemoryToken) cfg.headers.Authorization = `Bearer ${inMemoryToken}`;
  return cfg;
});

// -------- Auth ----------
export const Auth = {
  // Exchange a Firebase ID token (from phone OTP) for our JWT + user record
  verifyOtp: (idToken) =>
    api.post('/auth/verify-otp', { id_token: idToken }).then((r) => r.data),
  me:       () => api.get('/auth/me').then((r) => r.data.user),
  profile:  (payload) => api.put('/auth/profile', payload).then((r) => r.data.user),
  deleteAccount: () => api.delete('/auth/account').then((r) => r.data),
};

// -------- Public endpoints ----------
export const Videos = {
  list:     (params) => api.get('/videos', { params }).then((r) => r.data.videos),
  byId:     (id)     => api.get(`/videos/${id}`).then((r) => r.data.video),
  trending: (limit = 10) => api.get('/videos', { params: { sort: 'views', limit } }).then((r) => r.data.videos),
  featured: (limit = 1)  => api.get('/videos', { params: { featured: 1, limit } }).then((r) => r.data.videos),
};

export const Live = {
  current: () => api.get('/live/current').then((r) => r.data.live),
};

export const Temples = {
  list: () => api.get('/temples').then((r) => r.data.temples),
  byId: (id) => api.get(`/temples/${id}`).then((r) => r.data.temple),
};

export const Events = {
  list:    (params) => api.get('/events', { params }).then((r) => r.data.events),
  byId:    (id)     => api.get(`/events/${id}`).then((r) => r.data.event),
  register:(id, d)  => api.post(`/events/${id}/register`, d).then((r) => r.data.registration),
};

export const Donations = {
  config:          () => api.get('/donations/config').then((r) => r.data),
  createRazorpay:  (payload) => api.post('/donations/razorpay/order', payload).then((r) => r.data),
  verifyRazorpay:  (payload) => api.post('/donations/razorpay/verify', payload).then((r) => r.data),
  logUpi:          (payload) => api.post('/donations/upi', payload).then((r) => r.data.donation),
};

export const Notifications = {
  list: () => api.get('/notifications').then((r) => r.data.notifications),
  register: (payload) => api.post('/notifications/register-device', payload).then((r) => r.data),
};

export const Announcements = {
  list: () => api.get('/announcements').then((r) => r.data.announcements),
};

export const About = {
  get: () => api.get('/about').then((r) => r.data.about),
};

export const Ngo = {
  list: () => api.get('/ngo-activities').then((r) => r.data.activities),
};

export const Categories = {
  list: () => api.get('/categories').then((r) => r.data.categories),
};

export const Banners = {
  list: () => api.get('/banners').then((r) => r.data.banners),
};

// Helper: turn a relative /uploads/... path into a full URL
export function fullUrl(url) {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
