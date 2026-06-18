import React, { useState } from 'react';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { C } from '../styles/colors';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const TERMS = `Welcome to Onezy. By using our app and services, you agree to the following terms.

1. ACCEPTANCE OF TERMS
By accessing or using Onezy, you agree to be bound by these Terms and our Privacy Policy.

2. USE OF SERVICE
Onezy is a platform that connects customers with service providers for booking appointments, tokens, and sessions. You must be 18 years or older to use this service.

3. BOOKINGS AND CANCELLATIONS
- Bookings are subject to availability and service provider approval.
- Cancellation policies vary by service provider.
- Refunds are processed as per our Refund Policy.

4. PAYMENTS
All payments are processed securely. We use industry-standard encryption to protect your payment information.

5. USER CONDUCT
You agree not to misuse the platform, provide false information, or engage in fraudulent activities.

6. PRIVACY
Your personal information is handled as described in our Privacy Policy.

7. LIMITATION OF LIABILITY
Onezy acts as a marketplace connecting customers and service providers. We are not liable for the quality of services provided by individual service providers.

8. CHANGES TO TERMS
We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of any changes.

Contact us at support@onezy.net for any queries.`;

const PRIVACY = `This Privacy Policy describes how Onezy collects, uses, and protects your information.

1. INFORMATION WE COLLECT
- Phone number (for authentication)
- Name, email, and address (optional profile information)
- Location data (when you use location-based features)
- Booking history and transaction data
- Device information

2. HOW WE USE YOUR INFORMATION
- To provide and improve our services
- To process bookings and payments
- To send booking confirmations and reminders
- To communicate important updates

3. DATA SHARING
We do not sell your personal data. We share data only with:
- Service providers (to fulfill bookings)
- Payment processors (for transactions)
- Analytics services (anonymized data only)

4. DATA SECURITY
We implement industry-standard security measures to protect your data.

5. YOUR RIGHTS
You have the right to access, correct, or delete your personal information. Contact us at support@onezy.net.

6. COOKIES
We use cookies and similar technologies to improve your experience.

7. CONTACT
For privacy concerns, contact us at privacy@onezy.net.`;

export default function Terms() {
  const isPrivacyRoute = !!useMatch('/privacy-policy');
  const isReadingMode  = !!useMatch('/terms-and-conditions') || isPrivacyRoute;

  const [tab,     setTab]     = useState(isPrivacyRoute ? 'privacy' : 'terms');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/home';
  useAuth();

  const handleAccept = async () => {
    setLoading(true);
    try {
      await api.post('/v1/users/me/accept-terms', { acceptTerms: true, acceptDataMarketing: true });
      navigate(returnTo, { replace: true });
    } catch {
      navigate(returnTo, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  /* ── Reading mode: /terms-and-conditions or /privacy-policy ── */
  if (isReadingMode) {
    return (
      <div style={s.page}>
        <div style={s.readHeader}>
          <button style={s.backArrow} onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/home')}>
            ← Back
          </button>
          <span style={s.readTitle}>{tab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</span>
          <span style={{ width: 60 }} />
        </div>

        <div style={s.tabs}>
          {['terms', 'privacy'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
              {t === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </button>
          ))}
        </div>

        <div style={s.readContent}>
          <pre style={s.text}>{tab === 'terms' ? TERMS : PRIVACY}</pre>
        </div>
      </div>
    );
  }

  /* ── Acceptance mode: /terms (new user signup flow) ── */
  return (
    <div style={s.page}>
      <div style={s.acceptWrap}>
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: 4, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.12)', display: 'inline-flex' }}>
          <img src="/logo.png" alt="Onezy" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 16 }} />
        </div>
        <h1 style={s.title}>Almost there!</h1>
        <p style={s.sub}>One last step before you start booking</p>

        <div style={s.agreebox}>
          <p style={s.agreeText}>
            By tapping "Accept & Continue", you agree to Onezy's{' '}
            <a href="/terms-and-conditions" target="_blank" rel="noreferrer" style={s.link}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy-policy" target="_blank" rel="noreferrer" style={s.link}>Privacy Policy</a>.
          </p>
        </div>

        <button onClick={handleAccept} disabled={loading} style={s.btn}>
          {loading ? 'Please wait...' : 'Accept & Continue'}
        </button>
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', backgroundColor: C.BG, display: 'flex', flexDirection: 'column' },
  title:       { fontSize: 24, fontWeight: 800, color: C.TEXT1, margin: '0 0 6px' },
  sub:         { fontSize: 14, color: C.TEXT3, margin: '0 0 24px' },
  readHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.BORDER}`, backgroundColor: '#fff' },
  backArrow:   { background: 'none', border: 'none', color: '#6D28D9', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, width: 60 },
  readTitle:   { fontSize: 16, fontWeight: 700, color: C.TEXT1 },
  tabs:        { display: 'flex', margin: '16px 16px 0', backgroundColor: '#fff', borderRadius: 12, padding: 4, border: `1px solid ${C.BORDER}` },
  tab:         { flex: 1, padding: '10px 8px', border: 'none', background: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.TEXT3 },
  tabActive:   { backgroundColor: C.PRIMARY, color: '#fff' },
  readContent: { flex: 1, margin: '16px 16px 24px', backgroundColor: '#fff', borderRadius: 16, padding: 16, border: `1px solid ${C.BORDER}`, overflow: 'auto' },
  text:        { fontSize: 13, color: C.TEXT1, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 },
  acceptWrap:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' },
  agreebox:    { backgroundColor: '#fff', borderRadius: 16, padding: '20px', border: `1px solid ${C.BORDER}`, marginBottom: 24, width: '100%', maxWidth: 380, boxSizing: 'border-box' },
  agreeText:   { margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7 },
  link:        { color: '#6D28D9', fontWeight: 600, textDecoration: 'none' },
  btn:         { width: '100%', maxWidth: 380, padding: 15, borderRadius: 14, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};
