import { API_BASE_URL } from '../config/api';


const getToken = () => localStorage.getItem('cs_token');

const handle401 = () => {
  localStorage.removeItem('cs_token');
  localStorage.removeItem('cs_user');
  window.location.href = '/login?expired=1';
};


export const api = {
  // Authenticated GET — redirects to login on 401
  get: (path) =>
    fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    }).then(async (r) => {
      if (r.status === 401) { handle401(); throw new Error('SESSION_EXPIRED'); }
      return r.json();
    }),

  // Public GET — sends token if available, NEVER redirects on 401, silently fails on network errors
  open: (path) =>
    fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    }).then(async (r) => {
      if (!r.ok) return {};
      return r.json();
    }).catch(() => ({})),

  post: (path, body) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(body),
    }).then(async (r) => {
      if (r.status === 401) {
        localStorage.removeItem('cs_token');
        localStorage.removeItem('cs_user');
        window.location.href = '/login?expired=1';
        throw new Error('SESSION_EXPIRED');
      }
      return r.json();
    }),

  patch: (path, body) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  upload: (path, formData) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: formData,
    }).then((r) => r.json()),
};
