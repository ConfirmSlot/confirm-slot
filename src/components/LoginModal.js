import React, { useState, useRef, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

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

export default function LoginModal({ onSuccess, onClose }) {
  const { login } = useAuth();

  const [step,       setStep]       = useState('phone'); // 'phone' | 'otp' | 'terms' | 'reading'
  const [readingTab, setReadingTab] = useState('terms'); // 'terms' | 'privacy'
  const [accepted,   setAccepted]   = useState({ terms: false, privacy: false });
  const [phone,      setPhone]      = useState('');
  const [otp,        setOtp]        = useState(['', '', '', '', '', '']);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [errorType,  setErrorType]  = useState('error');

  const inputRefs = useRef([]);
  const tokenRef  = useRef(null);
  const userRef   = useRef(null);

  useEffect(() => {
    if (step === 'otp') setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  const showMsg = (msg, type = 'error') => { setError(msg); setErrorType(type); };

  const openReading = (tab) => { setReadingTab(tab); setStep('reading'); };

  // ── Phone ─────────────────────────────────────────────────────────────────

  const handleSendOtp = async () => {
    if (phone.replace(/\D/g, '').length < 10) { showMsg('Enter a valid 10-digit number'); return; }
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/v1/auth/send-verification-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: '+91', phoneNo: phone.replace(/\D/g, '') }),
      });
      const data = await res.json();
      if (!res.ok) { showMsg(data.message || 'Failed to send OTP'); return; }
      setStep('otp');
    } catch { showMsg('Could not connect. Please try again.'); }
    finally   { setLoading(false); }
  };

  // ── Resend ────────────────────────────────────────────────────────────────

  const handleResendOtp = async () => {
    setLoading(true); setOtp(['', '', '', '', '', '']); setError('');
    try {
      const res  = await fetch(`${API_BASE_URL}/v1/auth/send-verification-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: '+91', phoneNo: phone.replace(/\D/g, '') }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg('New code sent successfully!', 'success');
        setTimeout(() => setError(''), 3000);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else { showMsg(data.message || 'Failed to resend. Please try again.'); }
    } catch { showMsg('Network error. Please try again.'); }
    finally   { setLoading(false); }
  };

  // ── OTP verify ────────────────────────────────────────────────────────────

  const verifyOtp = async (code) => {
    if (code.length !== 6) { showMsg('Please enter the complete 6-digit code'); return; }
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/v1/auth/verify-code`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: '+91', phoneNo: phone.replace(/\D/g, ''), otp: code }),
      });
      const data = await res.json();
      if (!data.success) {
        showMsg(data.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
        return;
      }
      const hasAcceptedTerms = (data.user?.acceptedPolicies || []).length > 0;
      if (!hasAcceptedTerms) {
        tokenRef.current = data.token;
        userRef.current  = data.user;
        setError('');
        setStep('terms');
      } else {
        login(data.token, data.user);
        showMsg('Verification successful!', 'success');
        setTimeout(() => onSuccess(), 600);
      }
    } catch { showMsg('Could not connect. Please try again.'); }
    finally   { setLoading(false); }
  };

  // ── Terms accept ──────────────────────────────────────────────────────────

  const handleAcceptTerms = async () => {
    if (!accepted.terms || !accepted.privacy) { showMsg('Please accept both Terms and Privacy Policy'); return; }
    setError(''); setLoading(true);
    try {
      // Call API with tokenRef directly — login() is async React state, can't rely on it yet
      await fetch(`${API_BASE_URL}/v1/users/me/accept-terms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenRef.current}` },
        body: JSON.stringify({ acceptTerms: true, acceptDataMarketing: true }),
      });
      login(tokenRef.current, userRef.current);
      showMsg('All set! Continuing...', 'success');
      setTimeout(() => onSuccess(), 500);
    } catch {
      login(tokenRef.current, userRef.current);
      showMsg('All set! Continuing...', 'success');
      setTimeout(() => onSuccess(), 500);
    } finally { setLoading(false); }
  };

  // ── OTP input helpers ─────────────────────────────────────────────────────

  const handleOtpChange = (index, value) => {
    setError('');
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < digits.length; i++) newOtp[i] = digits[i];
      setOtp(newOtp);
      const next = newOtp.findIndex(d => d === '');
      setTimeout(() => inputRefs.current[next === -1 ? 5 : next]?.focus(), 50);
      if (digits.length === 6) setTimeout(() => verifyOtp(digits), 200);
      return;
    }
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) setTimeout(() => inputRefs.current[index + 1]?.focus(), 50);
    if (index === 5 && value) {
      const full = newOtp.join('');
      if (full.length === 6) setTimeout(() => verifyOtp(full), 200);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'Enter') { const full = otp.join(''); if (full.length === 6) verifyOtp(full); }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>

        {/* ── READING step — full content inside modal ── */}
        {step === 'reading' ? (
          <div style={s.readingWrap}>
            <div style={s.readingHeader}>
              <button style={s.readBackBtn} onClick={() => setStep('terms')}>← Back</button>
              <span style={s.readingTitle}>
                {readingTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </span>
              <button style={s.closeBtn2} onClick={onClose}>✕</button>
            </div>

            <div style={s.readingTabs}>
              {['terms', 'privacy'].map(t => (
                <button
                  key={t}
                  onClick={() => setReadingTab(t)}
                  style={{ ...s.readTab, ...(readingTab === t ? s.readTabActive : {}) }}
                >
                  {t === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                </button>
              ))}
            </div>

            <div style={s.readingContent}>
              <pre style={s.readingText}>
                {readingTab === 'terms' ? TERMS_TEXT : PRIVACY_TEXT}
              </pre>
            </div>
          </div>
        ) : (
          <>
            <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>

            <div style={s.logoWrap}>
              <img src="/logo192.png" alt="Onezy" style={s.logo} onError={e => e.target.style.display = 'none'} />
            </div>

            {/* ── PHONE step ── */}
            {step === 'phone' && (
              <>
                <h2 style={s.title}>Sign in to continue</h2>
                <p style={s.subtitle}>We'll send a 6-digit verification code</p>

                <div style={s.inputRow}>
                  <span style={s.code}>+91</span>
                  <input
                    type="tel"
                    placeholder="Enter Mobile Number"
                    value={phone}
                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                    style={s.input}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    autoFocus
                  />
                </div>

                {error && <InlineMsg msg={error} type={errorType} />}

                <button style={s.btn} onClick={handleSendOtp} disabled={loading}>
                  {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Continue'}
                </button>
              </>
            )}

            {/* ── OTP step ── */}
            {step === 'otp' && (
              <>
                <h2 style={s.title}>Verify Your Number</h2>
                <p style={s.subtitle}>Enter the 6-digit code sent to +91&nbsp;{phone}</p>

                <div style={s.otpRow}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      style={{ ...s.otpBox, borderColor: digit ? PRIMARY : '#D1D5DB', color: digit ? PRIMARY : '#2a1052' }}
                    />
                  ))}
                </div>

                {error && <InlineMsg msg={error} type={errorType} />}

                <div style={s.resendRow}>
                  <span style={{ fontSize: 14, color: '#6B7280' }}>Didn't receive the code?&nbsp;</span>
                  <button style={s.resendBtn} onClick={handleResendOtp} disabled={loading}>
                    {loading ? 'Resending...' : 'Resend'}
                  </button>
                </div>

                <a href="tel:+919176122210" style={s.assistRow}>
                  <span style={{ fontSize: 14, color: '#6B7280' }}>Need assistance?</span>
                  <span style={{ fontSize: 18 }}>📞</span>
                </a>

                <button style={s.btn} onClick={() => verifyOtp(otp.join(''))} disabled={loading}>
                  {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Verify & Continue'}
                </button>

                <button style={s.backBtn} onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}>
                  ← Change Phone Number
                </button>
              </>
            )}

            {/* ── TERMS step ── */}
            {step === 'terms' && (
              <>
                <h2 style={s.title}>Almost there!</h2>
                <p style={s.subtitle}>Please accept our policies to continue</p>

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

                {error && <InlineMsg msg={error} type={errorType} />}

                <button
                  style={{ ...s.btn, opacity: (!accepted.terms || !accepted.privacy) ? 0.5 : 1 }}
                  onClick={handleAcceptTerms}
                  disabled={loading || !accepted.terms || !accepted.privacy}
                >
                  {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Accept & Continue'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InlineMsg({ msg, type }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
      borderRadius: 10, marginBottom: 12, width: '100%', boxSizing: 'border-box',
      border: '1px solid',
      backgroundColor: type === 'success' ? '#D1FAE5' : '#FEE2E2',
      borderColor:     type === 'success' ? '#86EFAC' : '#FCA5A5',
      color:           type === 'success' ? '#16A34A' : '#DC2626',
    }}>
      <span style={{ fontSize: 14 }}>{type === 'success' ? '✓' : '⚠'}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{msg}</span>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 9999, padding: '20px',
  },
  modal: {
    position: 'relative', backgroundColor: '#fff', borderRadius: '24px',
    width: '100%', maxWidth: '380px',
    boxShadow: '0 24px 64px rgba(76,29,149,0.25)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    maxHeight: '90vh', overflow: 'hidden',
  },

  // Normal steps (phone/otp/terms) — scrollable inner area
  closeBtn: {
    position: 'absolute', top: 14, right: 14, background: '#F3F4F6',
    border: 'none', borderRadius: '50%', width: 32, height: 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 14, color: '#6B7280', fontWeight: 700, lineHeight: 1,
    zIndex: 1,
  },
  logoWrap:  { backgroundColor: '#fff', borderRadius: '20px', padding: '4px', marginTop: 36, marginBottom: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' },
  logo:      { width: '64px', height: '64px', objectFit: 'contain', borderRadius: '14px' },
  title:     { fontSize: '19px', fontWeight: '800', color: '#2a1052', margin: '0 0 4px', textAlign: 'center' },
  subtitle:  { fontSize: '13px', color: '#6B7280', margin: '0 0 20px', textAlign: 'center', lineHeight: 1.5, padding: '0 28px' },
  inputRow: {
    display: 'flex', alignItems: 'center', width: 'calc(100% - 56px)',
    border: '1px solid #D1D5DB', borderRadius: '50px',
    paddingLeft: '20px', paddingRight: '8px', backgroundColor: '#fff',
    marginBottom: '12px', height: '54px',
  },
  code: {
    color: '#000', fontWeight: '500', fontSize: '16px',
    paddingRight: '12px', borderRight: '1px solid #E5E7EB',
    marginRight: '12px', lineHeight: '54px', flexShrink: 0,
  },
  input:     { flex: 1, border: 'none', outline: 'none', fontSize: '16px', color: '#000', backgroundColor: 'transparent', height: '100%' },
  otpRow:    { display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center', width: '100%', padding: '0 28px', boxSizing: 'border-box' },
  otpBox: {
    width: '44px', height: '52px', border: '2px solid #D1D5DB', borderRadius: '12px',
    textAlign: 'center', fontSize: '24px', fontWeight: '700', outline: 'none',
    backgroundColor: '#fff', boxSizing: 'border-box', caretColor: 'transparent',
  },
  resendRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, width: '100%' },
  resendBtn: { background: 'none', border: 'none', color: PRIMARY, fontWeight: '700', fontSize: '14px', cursor: 'pointer', padding: 0 },
  assistRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20, textDecoration: 'none', cursor: 'pointer' },
  btn: {
    width: 'calc(100% - 56px)', padding: '15px', borderRadius: '12px',
    background: `linear-gradient(135deg, #6d28d9, ${PRIMARY_D})`,
    color: '#fff', border: 'none', fontSize: '16px', fontWeight: '700',
    cursor: 'pointer', marginBottom: '14px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(81, 31, 159,0.35)',
  },
  backBtn:   { background: 'none', border: 'none', color: '#6B7280', fontSize: '14px', cursor: 'pointer', fontWeight: '500', marginBottom: 20 },
  termsBox: {
    backgroundColor: '#F8FAFC', borderRadius: 12, padding: '14px 16px',
    marginBottom: 16, width: 'calc(100% - 56px)', boxSizing: 'border-box',
    border: '1px solid #f1ebfa',
  },
  termsText: { margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.7 },
  link:      { background: 'none', border: 'none', padding: 0, color: PRIMARY, fontWeight: '600', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' },
  checkRow:  { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 10, width: 'calc(100% - 56px)', userSelect: 'none' },
  checkbox:  { width: 22, height: 22, borderRadius: 6, border: '2px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', flexShrink: 0 },
  checkboxOn: { backgroundColor: PRIMARY, borderColor: PRIMARY },

  // Reading step
  readingWrap: { width: '100%', display: 'flex', flexDirection: 'column', height: '90vh', maxHeight: '90vh' },
  readingHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 16px', borderBottom: '1px solid #E5E7EB', flexShrink: 0,
  },
  readBackBtn:   { background: 'none', border: 'none', color: PRIMARY, fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0 },
  readingTitle:  { fontSize: 15, fontWeight: 700, color: '#2a1052' },
  closeBtn2:     { background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: '#6B7280', fontWeight: 700 },
  readingTabs: {
    display: 'flex', margin: '12px 16px 0', backgroundColor: '#F3F4F6',
    borderRadius: 10, padding: 3, flexShrink: 0,
  },
  readTab:       { flex: 1, padding: '8px 6px', border: 'none', background: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#6B7280' },
  readTabActive: { backgroundColor: PRIMARY, color: '#fff' },
  readingContent: { flex: 1, overflowY: 'auto', padding: '16px', margin: '12px 0 0' },
  readingText:   { fontSize: 12, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 },
};
