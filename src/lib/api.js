import { API_BASE_URL } from '../config/api';

const getToken = () => localStorage.getItem('cs_token');

const handle401 = () => {
  const oldToken = getToken();
  if (oldToken) {
    fetch(`${API_BASE_URL}/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: oldToken }),
    }).then(r => r.ok ? r.json() : null).then(data => {
      if (data?.token) {
        localStorage.setItem('cs_token', data.token);
        window.location.reload();
      } else {
        localStorage.removeItem('cs_token');
        localStorage.removeItem('cs_user');
        window.location.href = '/login?expired=1';
      }
    }).catch(() => {
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_user');
      window.location.href = '/login?expired=1';
    });
  } else {
    window.location.href = '/login?expired=1';
  }
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

  put: (path, body) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(body),
    }).then(async (r) => {
      if (r.status === 401) { handle401(); throw new Error('SESSION_EXPIRED'); }
      return r.json();
    }),

    
  upload: (path, formData) =>
    fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: formData,
    }).then((r) => r.json()),
};
