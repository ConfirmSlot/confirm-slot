import { API_BASE_URL } from '../config/api';


const getToken = () => localStorage.getItem('cs_token');

export const api = {
  get: (path) =>
    fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    }).then(async (r) => {
      if (r.status === 401) {
        localStorage.removeItem('cs_token');
        localStorage.removeItem('cs_user');
        window.location.href = '/login?expired=1';
        throw new Error('SESSION_EXPIRED');
      }
      return r.json();
    }),

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
