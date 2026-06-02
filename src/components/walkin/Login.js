import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';

export default function Login() {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();
  const { login }      = useAuth();
  const redirectTo     = params.get('redirect') || '/';
  const expired        = params.get('expired') === '1';

  const [step,    setStep]    = useState('phone');
  const [phone,   setPhone]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSendOtp = async () => {
    if (phone.replace(/\D/g, '').length < 10) { setError('Enter a valid 10-digit number'); return; }
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/v1/auth/send-verification-code`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ countryCode: '+91', phoneNo: phone.replace(/\D/g, '') }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to send OTP'); return; }
      setStep('otp');
    } catch { setError('Could not connect. Please try again.'); }
    finally   { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { setError('Enter the OTP'); return; }
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/v1/auth/verify-code`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ countryCode: '+91', phoneNo: phone.replace(/\D/g, ''), otp }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Invalid OTP'); return; }
      login(data.token, data.user);
      navigate(redirectTo, { replace: true });
    } catch { setError('Could not connect. Please try again.'); }
    finally   { setLoading(false); }
  };

  return (
    <div style={s.page}>
      {/* Purple gradient background */}
      <div style={s.bg} />

      <div style={s.card}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <img src="/logo192.png" alt="Onezy" style={s.logo} onError={e => e.target.style.display='none'} />
        </div>

        {step === 'phone' ? (
          <>
            <h2 style={s.title}>One app for all your bookings</h2>
            <p style={s.subtitle}>Sign in to join the queue</p>

            {expired && (
              <div style={s.expiredBanner}>
                Your session expired. Please sign in again.
              </div>
            )}

            <div style={s.inputRow}>
              <span style={s.code}>+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setError(''); }}
                style={s.input}
                onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                autoFocus
              />
            </div>

            {error && <p style={s.error}>{error}</p>}

            <button style={s.btn} onClick={handleSendOtp} disabled={loading}>
              {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Send OTP'}
            </button>

            <p style={s.terms}>
              By continuing, you agree to our{' '}
              <a href="https://confirmslot.com/terms-and-conditions" target="_blank" rel="noreferrer" style={s.link}>
                Terms of Service
              </a>{' '}
              &amp;{' '}
              <a href="https://confirmslot.com/privacy-policy" target="_blank" rel="noreferrer" style={s.link}>
                Privacy Policy
              </a>
            </p>
          </>
        ) : (
          <>
            <h2 style={s.title}>Verify Your Number</h2>
            <p style={s.subtitle}>Enter the 6-digit code sent to +91 {phone}</p>

            <input
              type="number"
              placeholder="- - - - - -"
              value={otp}
              onChange={e => { setOtp(e.target.value.slice(0, 6)); setError(''); }}
              style={{ ...s.inputRow, textAlign: 'center', letterSpacing: '10px', fontSize: '22px', fontWeight: '700', justifyContent: 'center', paddingLeft: 0 }}
              onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
              autoFocus
            />

            {error && <p style={s.error}>{error}</p>}

            <button style={s.btn} onClick={handleVerifyOtp} disabled={loading}>
              {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Verify & Continue'}
            </button>

            <button style={s.backBtn} onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>
              Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const PRIMARY   = '#6D28D9';
const PRIMARY_D = '#4C1D95';

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    backgroundColor: '#F5F3FF',
  },
  bg: {
    position: 'fixed',
    inset: 0,
    background: `linear-gradient(160deg, #7C3AED 0%, ${PRIMARY} 50%, ${PRIMARY_D} 100%)`,
    zIndex: 0,
  },
  card: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '36px 28px',
    maxWidth: '380px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(76,29,149,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoWrap: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '4px',
    marginBottom: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  },
  logo: { width: '80px', height: '80px', objectFit: 'contain', borderRadius: '16px' },
  title: { fontSize: '20px', fontWeight: '800', color: '#1E1B4B', margin: '0 0 4px', textAlign: 'center' },
  subtitle: { fontSize: '14px', color: '#6B7280', margin: '0 0 20px', textAlign: 'center' },
  expiredBanner: {
    backgroundColor: '#FEF3C7',
    border: '1px solid #FCD34D',
    borderRadius: '10px',
    padding: '10px 14px',
    marginBottom: '16px',
    width: '100%',
    color: '#92400E',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'center',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    border: '1.5px solid #DDD6FE',
    borderRadius: '50px',
    paddingLeft: '20px',
    paddingRight: '8px',
    backgroundColor: '#fff',
    marginBottom: '8px',
    height: '54px',
  },
  code: {
    color: PRIMARY,
    fontWeight: '700',
    fontSize: '15px',
    paddingRight: '12px',
    borderRight: `1.5px solid #DDD6FE`,
    marginRight: '12px',
    lineHeight: '54px',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#1E1B4B',
    backgroundColor: 'transparent',
    height: '100%',
  },
  error: { color: '#EF4444', fontSize: '13px', margin: '0 0 8px', alignSelf: 'flex-start' },
  btn: {
    width: '100%',
    padding: '15px',
    borderRadius: '50px',
    background: `linear-gradient(135deg, #7C3AED, ${PRIMARY_D})`,
    color: '#fff',
    border: 'none',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 15px rgba(109,40,217,0.4)`,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: PRIMARY,
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  terms: { fontSize: '11px', color: '#9CA3AF', textAlign: 'center', margin: '8px 0 0', lineHeight: '1.6' },
  link:  { color: PRIMARY, fontWeight: '600', textDecoration: 'none' },
};
