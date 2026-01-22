// src/config/api.js

// ✅ FOR PRODUCTION - Point to hosted backend
export const API_BASE_URL = 'https://api.confirmslot.com';

// API endpoints
export const API_ENDPOINTS = {
  // Enquiry
  ENQUIRY: `${API_BASE_URL}/v1/enquiry`,
};

console.log('🔧 Frontend API Config:', API_BASE_URL);

export default API_BASE_URL;
