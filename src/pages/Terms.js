import React, { useState } from 'react';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { C } from '../styles/colors';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const PRIMARY   = '#511f9f';
const PRIMARY_D = '#3f1780';

const TERMS_TEXT = `Welcome to Onezy. By using our app and services, you agree to the following terms.

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

const PRIVACY_TEXT = `This Privacy Policy describes how Onezy collects, uses, and protects your information.

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

  const [tab,      setTab]      = useState(isPrivacyRoute ? 'privacy' : 'terms');
  const [step,     setStep]     = useState('acceptance'); // 'acceptance' | 'reading'
  const [readTab,  setReadTab]  = useState('terms');
  const [accepted, setAccepted] = useState({ terms: false, privacy: false });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || '/home';
  useAuth();

  const openReading = (which) => { setReadTab(which); setStep('reading'); };

  const handleAccept = async () => {
    if (!accepted.terms || !accepted.privacy) { setError('Please accept both Terms and Privacy Policy'); return; }
    setError(''); setLoading(true);
    try {
      await api.post('/v1/users/me/accept-terms', { acceptTerms: true, acceptDataMarketing: true });
      navigate(returnTo, { replace: true });
    } catch {
      navigate(returnTo, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  /* ── /terms-and-conditions or /privacy-policy standalone reading pages ── */
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
          <pre style={s.text}>{tab === 'terms' ? TERMS_TEXT : PRIVACY_TEXT}</pre>
        </div>
      </div>
    );
  }

  /* ── /terms inline reading step ── */
  if (step === 'reading') {
    return (
      <div style={s.page}>
        <div style={s.readHeader}>
          <button style={s.backArrow} onClick={() => setStep('acceptance')}>← Back</button>
          <span style={s.readTitle}>{readTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}</span>
          <span style={{ width: 60 }} />
        </div>
        <div style={s.tabs}>
          {['terms', 'privacy'].map(t => (
            <button key={t} onClick={() => setReadTab(t)} style={{ ...s.tab, ...(readTab === t ? s.tabActive : {}) }}>
              {t === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </button>
          ))}
        </div>
        <div style={s.readContent}>
          <pre style={s.text}>{readTab === 'terms' ? TERMS_TEXT : PRIVACY_TEXT}</pre>
        </div>
      </div>
    );
  }

  /* ── /terms acceptance step — matches modal exactly ── */
  return (
    <div style={s.page}>
      <div style={s.acceptWrap}>
        <div style={s.logoBox}>
          <img src="/logo.png" alt="Onezy" style={s.logo} />
        </div>

        <h1 style={s.title}>Almost there!</h1>
        <p style={s.sub}>Please accept our policies to continue</p>

        <div style={s.termsBox}>
          <p style={s.termsText}>
            By tapping "Accept & Continue", you agree to Onezy's{' '}
            <button style={s.link} onClick={() => openReading('terms')}>Terms of Service</button>
            {' '}and{' '}
            <button style={s.link} onClick={() => openReading('privacy')}>Privacy Policy</button>.
          </p>
        </div>

        <label style={s.checkRow} onClick={() => setAccepted(a => ({ ...a, terms: !a.terms }))}>
          <div style={{ ...s.checkbox, ...(accepted.terms ? s.checkboxOn : {}) }}>
            {accepted.terms && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, color: '#2a1052' }}>I accept the <strong>Terms of Service</strong></span>
        </label>

        <label style={s.checkRow} onClick={() => setAccepted(a => ({ ...a, privacy: !a.privacy }))}>
          <div style={{ ...s.checkbox, ...(accepted.privacy ? s.checkboxOn : {}) }}>
            {accepted.privacy && <span style={{ color: '#fff', fontSize: 11, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, color: '#2a1052' }}>I accept the <strong>Privacy Policy</strong></span>
        </label>

        {error && (
          <div style={s.errBox}>
            <span style={{ fontSize: 14 }}>⚠</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={loading || !accepted.terms || !accepted.privacy}
          style={{ ...s.btn, opacity: (!accepted.terms || !accepted.privacy) ? 0.5 : 1 }}
        >
          {loading ? 'Please wait...' : 'Accept & Continue'}
        </button>
      </div>
    </div>
  );
}

const s = {
  page:       { minHeight: '100vh', backgroundColor: C.BG, display: 'flex', flexDirection: 'column' },

  /* reading */
  readHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.BORDER}`, backgroundColor: '#fff' },
  backArrow:  { background: 'none', border: 'none', color: PRIMARY, fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0, width: 60 },
  readTitle:  { fontSize: 16, fontWeight: 700, color: C.TEXT1 },
  tabs:       { display: 'flex', margin: '16px auto 0', width: 'calc(100% - 32px)', maxWidth: 600, backgroundColor: '#fff', borderRadius: 12, padding: 4, border: `1px solid ${C.BORDER}`, boxSizing: 'border-box' },
  tab:        { flex: 1, padding: '10px 8px', border: 'none', background: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.TEXT3 },
  tabActive:  { backgroundColor: PRIMARY, color: '#fff' },
  readContent: { flex: 1, margin: '16px auto 24px', width: 'calc(100% - 32px)', maxWidth: 600, backgroundColor: '#fff', borderRadius: 16, padding: 16, border: `1px solid ${C.BORDER}`, overflow: 'auto', boxSizing: 'border-box' },
  text:       { fontSize: 13, color: C.TEXT1, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 },

  /* acceptance */
  acceptWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center' },
  logoBox:    { backgroundColor: '#fff', borderRadius: 20, padding: 4, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.10)', display: 'inline-flex' },
  logo:       { width: 80, height: 80, objectFit: 'contain', borderRadius: 16 },
  title:      { fontSize: 24, fontWeight: 800, color: '#2a1052', margin: '0 0 6px' },
  sub:        { fontSize: 14, color: '#6B7280', margin: '0 0 20px' },
  termsBox:   { backgroundColor: '#F8FAFC', borderRadius: 12, padding: '14px 16px', marginBottom: 16, width: '100%', maxWidth: 380, boxSizing: 'border-box', border: '1px solid #f1ebfa' },
  termsText:  { margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7, textAlign: 'left' },
  link:       { background: 'none', border: 'none', padding: 0, color: PRIMARY, fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'underline' },
  checkRow:   { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10, width: '100%', maxWidth: 380, userSelect: 'none', textAlign: 'left' },
  checkbox:   { width: 22, height: 22, borderRadius: 6, border: '2px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', flexShrink: 0 },
  checkboxOn: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  errBox:     { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, marginBottom: 12, width: '100%', maxWidth: 380, boxSizing: 'border-box', border: '1px solid #FCA5A5', backgroundColor: '#FEE2E2', color: '#DC2626' },
  btn:        { width: '100%', maxWidth: 380, padding: 15, borderRadius: 14, background: `linear-gradient(135deg, #6d28d9, ${PRIMARY_D})`, color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 15px rgba(81, 31, 159,0.35)', marginTop: 4 },
};
