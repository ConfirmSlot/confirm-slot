// src/config/api.js

export const API_BASE_URL =
  (process.env.REACT_APP_API_BASE_URL || 'https://api.onezy.net/').replace(/\/$/, '');
 
// API endpoints
export const API_ENDPOINTS = {
  ENQUIRY:          `${API_BASE_URL}/v1/enquiry`,
  SP_LEADS:         `${API_BASE_URL}/v1/sp-leads`,
  CATEGORIES:       `${API_BASE_URL}/v1/categories`,
  APP_VISIT_LOG:    `${API_BASE_URL}/v1/app-visit-log`,
  SEND_OTP:         `${API_BASE_URL}/v1/auth/send-verification-code`,
  VERIFY_OTP:       `${API_BASE_URL}/v1/auth/verify-code`,
  WALKIN_INFO:      (spId)    => `${API_BASE_URL}/v1/tokens/walkin/${spId}/info`,
  WALKIN_JOIN_AUTH: (spId)    => `${API_BASE_URL}/v1/tokens/walkin/${spId}/join-auth`,
  WALKIN_LEAVE:     (tokenId) => `${API_BASE_URL}/v1/tokens/walkin/${tokenId}/leave`,
  MY_TOKENS:        `${API_BASE_URL}/v1/tokens/my-tokens`,
};

console.log('🔧 Frontend API Config:', API_BASE_URL);

export default API_BASE_URL;
