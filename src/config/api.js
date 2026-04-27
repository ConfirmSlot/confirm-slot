// src/config/api.js

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://api.confirmslot.com';

// API endpoints
export const API_ENDPOINTS = {
  // Enquiry
  ENQUIRY: `${API_BASE_URL}/v1/enquiry`,
  // App visit logging
  APP_VISIT_LOG: `${API_BASE_URL}/v1/app-visit-log`,
};

console.log('🔧 Frontend API Config:', API_BASE_URL);

export default API_BASE_URL;
