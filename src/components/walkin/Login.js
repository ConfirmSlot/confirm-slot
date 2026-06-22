import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';

const PRIMARY   = '#6D28D9';
const PRIMARY_D = '#4C1D95';

export default function Login() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const [params]       = useSearchParams();
  const { login }      = useAuth();
  const redirectTo     = params.get('redirect') || location.state?.returnTo || '/home';
  const expired        = params.get('expired') === '1';

  const [step,      setStep]      = useState('phone');
  const [phone,     setPhone]     = useState('');
  const [otp,       setOtp]       = useState(['', '', '', '', '', '']);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [errorType, setErrorType] = useState('error');

  const inputRefs = useRef([]);

  useEffect(() => {
    if (step === 'otp') setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  const showMsg = (msg, type = 'error') => { setError(msg); setErrorType(type); };

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
      login(data.token, data.user);
      showMsg('Verification successful!', 'success');
      const hasAcceptedTerms = (data.user?.acceptedPolicies || []).length > 0;
      setTimeout(() => {
        if (!hasAcceptedTerms) {
          navigate('/terms', { state: { returnTo: redirectTo }, replace: true });
        } else {
          navigate(redirectTo, { replace: true });
        }
      }, 600);
    } catch { showMsg('Could not connect. Please try again.'); }
    finally   { setLoading(false); }
  };

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

  return (
    <div style={s.page}>
      <div style={s.bg} />
      <div style={s.card}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <img src="/logo192.png" alt="Onezy" style={s.logo} onError={e => e.target.style.display = 'none'} />
        </div>

        {step === 'phone' ? (
          <>
            <h2 style={s.title}>One app for all your bookings</h2>
            <p style={s.subtitle}>We'll send a 6-digit verification code</p>

            {expired && (
              <div style={s.expiredBanner}>Your session expired. Please sign in again.</div>
            )}

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

            {error && (
              <div style={{ ...s.inlineMsg, ...(errorType === 'success' ? s.inlineMsgSuccess : s.inlineMsgError) }}>
                <span>{errorType === 'success' ? '✓' : '⚠'}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{error}</span>
              </div>
            )}

            <button style={s.btn} onClick={handleSendOtp} disabled={loading}>
              {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Continue'}
            </button>
          </>
        ) : (
          <>
            <h2 style={s.title}>Verify Your Number</h2>
            <p style={s.subtitle}>Enter the 6-digit code sent to +91&nbsp;{phone}</p>

            {/* 6 OTP boxes */}
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
                  style={{
                    ...s.otpBox,
                    borderColor: digit ? PRIMARY : '#D1D5DB',
                    color: digit ? PRIMARY : '#1E1B4B',
                  }}
                />
              ))}
            </div>

            {/* Inline message */}
            {error && (
              <div style={{ ...s.inlineMsg, ...(errorType === 'success' ? s.inlineMsgSuccess : s.inlineMsgError) }}>
                <span>{errorType === 'success' ? '✓' : '⚠'}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Resend */}
            <div style={s.resendRow}>
              <span style={{ fontSize: 14, color: '#6B7280' }}>Didn't receive the code?&nbsp;</span>
              <button style={s.resendBtn} onClick={handleResendOtp} disabled={loading}>
                {loading ? 'Resending...' : 'Resend'}
              </button>
            </div>

            {/* Need assistance */}
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
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px', position: 'relative', backgroundColor: '#F5F3FF',
  },
  bg: {
    position: 'fixed', inset: 0,
    background: `linear-gradient(160deg, #7C3AED 0%, ${PRIMARY} 50%, ${PRIMARY_D} 100%)`,
    zIndex: 0,
  },
  card: {
    position: 'relative', zIndex: 1, backgroundColor: '#fff', borderRadius: '24px',
    padding: '36px 28px', maxWidth: '380px', width: '100%',
    boxShadow: '0 20px 60px rgba(76,29,149,0.3)', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
  },
  logoWrap: {
    backgroundColor: '#fff', borderRadius: '20px', padding: '4px',
    marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  },
  logo:     { width: '80px', height: '80px', objectFit: 'contain', borderRadius: '16px' },
  title:    { fontSize: '20px', fontWeight: '800', color: '#1E1B4B', margin: '0 0 4px', textAlign: 'center' },
  subtitle: { fontSize: '13px', color: '#6B7280', margin: '0 0 20px', textAlign: 'center', lineHeight: 1.5 },
  expiredBanner: {
    backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '10px',
    padding: '10px 14px', marginBottom: '16px', width: '100%',
    color: '#92400E', fontSize: '13px', fontWeight: '600', textAlign: 'center',
    boxSizing: 'border-box',
  },
  inputRow: {
    display: 'flex', alignItems: 'center', width: '100%',
    border: '1px solid #D1D5DB', borderRadius: '50px',
    paddingLeft: '20px', paddingRight: '8px', backgroundColor: '#fff',
    marginBottom: '12px', height: '54px',
  },
  code: {
    color: '#000', fontWeight: '500', fontSize: '16px',
    paddingRight: '12px', borderRight: '1px solid #E5E7EB',
    marginRight: '12px', lineHeight: '54px', flexShrink: 0,
  },
  input: {
    flex: 1, border: 'none', outline: 'none', fontSize: '16px',
    color: '#000', backgroundColor: 'transparent', height: '100%',
  },
  otpRow: {
    display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center', width: '100%',
  },
  otpBox: {
    width: '46px', height: '56px', border: '2px solid #D1D5DB', borderRadius: '12px',
    textAlign: 'center', fontSize: '24px', fontWeight: '700', outline: 'none',
    backgroundColor: '#fff', boxSizing: 'border-box', caretColor: 'transparent',
  },
  inlineMsg: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
    borderRadius: 10, marginBottom: 12, width: '100%', boxSizing: 'border-box',
    border: '1px solid', fontSize: 14,
  },
  inlineMsgError:   { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' },
  inlineMsgSuccess: { backgroundColor: '#D1FAE5', borderColor: '#86EFAC', color: '#16A34A' },
  resendRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, width: '100%',
  },
  resendBtn: {
    background: 'none', border: 'none', color: PRIMARY,
    fontWeight: '700', fontSize: '14px', cursor: 'pointer', padding: 0,
  },
  assistRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, marginBottom: 20, textDecoration: 'none', cursor: 'pointer',
  },
  btn: {
    width: '100%', padding: '15px', borderRadius: '12px',
    background: `linear-gradient(135deg, #7C3AED, ${PRIMARY_D})`,
    color: '#fff', border: 'none', fontSize: '16px', fontWeight: '700',
    cursor: 'pointer', marginBottom: '14px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(109,40,217,0.4)',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#6B7280',
    fontSize: '14px', cursor: 'pointer', fontWeight: '500',
  },
};
