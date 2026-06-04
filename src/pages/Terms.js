import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../styles/colors';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const TERMS = `Welcome to Onezy (ConfirmSlot). By using our app and services, you agree to the following terms.

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

Contact us at support@confirmslot.com for any queries.`;

const PRIVACY = `This Privacy Policy describes how Onezy (ConfirmSlot) collects, uses, and protects your information.

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
You have the right to access, correct, or delete your personal information. Contact us at support@confirmslot.com.

6. COOKIES
We use cookies and similar technologies to improve your experience.

7. CONTACT
For privacy concerns, contact us at privacy@confirmslot.com.`;

export default function Terms() {
  const [tab, setTab] = useState('terms');
  const [accepted, setAccepted] = useState({ terms: false, privacy: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useAuth();

  const handleAccept = async () => {
    if (!accepted.terms || !accepted.privacy) return;
    setLoading(true);
    try {
      await api.post('/v1/users/me/accept-terms', {
        policies: [
          { type: 'terms', version: '1.0' },
          { type: 'privacy', version: '1.0' },
        ],
      });
      navigate('/home', { replace: true });
    } catch {
      navigate('/home', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: C.PRIMARY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 20 }}>📋</span>
        </div>
        <h1 style={s.title}>Legal</h1>
        <p style={s.sub}>Please read and accept before continuing</p>
      </div>

      <div style={s.tabs}>
        {['terms', 'privacy'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
            {t === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
          </button>
        ))}
      </div>

      <div style={s.content}>
        <pre style={s.text}>{tab === 'terms' ? TERMS : PRIVACY}</pre>
      </div>

      <div style={s.footer}>
        <label style={s.check}>
          <input type="checkbox" checked={accepted.terms} onChange={e => setAccepted(a => ({ ...a, terms: e.target.checked }))} />
          <span>I accept the <strong>Terms of Service</strong></span>
        </label>
        <label style={s.check}>
          <input type="checkbox" checked={accepted.privacy} onChange={e => setAccepted(a => ({ ...a, privacy: e.target.checked }))} />
          <span>I accept the <strong>Privacy Policy</strong></span>
        </label>
        <button
          onClick={handleAccept}
          disabled={!accepted.terms || !accepted.privacy || loading}
          style={{ ...s.btn, opacity: (!accepted.terms || !accepted.privacy) ? 0.5 : 1 }}
        >
          {loading ? 'Please wait...' : 'Accept & Continue'}
        </button>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', backgroundColor: C.BG, display: 'flex', flexDirection: 'column' },
  header: { padding: '32px 20px 20px', textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 800, color: C.TEXT1, margin: '12px 0 4px' },
  sub: { fontSize: 14, color: C.TEXT3, margin: 0 },
  tabs: { display: 'flex', margin: '0 16px 16px', backgroundColor: '#fff', borderRadius: 12, padding: 4, border: `1px solid ${C.BORDER}` },
  tab: { flex: 1, padding: '10px 8px', border: 'none', background: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.TEXT3 },
  tabActive: { backgroundColor: C.PRIMARY, color: '#fff' },
  content: { flex: 1, margin: '0 16px', backgroundColor: '#fff', borderRadius: 16, padding: 16, border: `1px solid ${C.BORDER}`, overflow: 'auto', maxHeight: 360 },
  text: { fontSize: 13, color: C.TEXT1, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 },
  footer: { padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 12 },
  check: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.TEXT1, cursor: 'pointer' },
  btn: { width: '100%', padding: 15, borderRadius: 14, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
};
