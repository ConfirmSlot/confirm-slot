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

  const expired = params.get('expired') === '1';
  const [step,    setStep]    = useState('phone'); // 'phone' | 'otp'
  const [phone,   setPhone]   = useState('');
  const [otp,     setOtp]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSendOtp = async () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid 10-digit number'); return;
    }
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/v1/auth/send-verification-code`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ countryCode: '+91', phoneNo: phone.replace(/\D/g, '') }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Failed to send OTP'); return; }
      setStep('otp');
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) { setError('Enter the OTP'); return; }
    setError(''); setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/v1/auth/verify-code`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ countryCode: '+91', phoneNo: phone.replace(/\D/g, ''), code: otp }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Invalid OTP'); return; }
      login(data.token, data.user);
      navigate(redirectTo, { replace: true });
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <img src="/logo192.png" alt="Onezy" style={{ width: 48, height: 48, borderRadius: 12 }} onError={e => e.target.style.display='none'} />
        </div>
        {expired && (
          <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 14px', marginBottom: 16, width: '100%' }}>
            <p style={{ color: '#92400e', fontSize: 13, fontWeight: 600, margin: 0, textAlign: 'center' }}>
              Your session expired. Please sign in again.
            </p>
          </div>
        )}
        <h2 style={styles.title}>Sign in to continue</h2>
        <p style={styles.subtitle}>Enter your phone number to join the queue</p>

        {step === 'phone' ? (
          <>
            <div style={styles.inputGroup}>
              <span style={styles.prefix}>+91</span>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={styles.input}
                onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.btn} onClick={handleSendOtp} disabled={loading}>
              {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <p style={styles.otpHint}>OTP sent to +91 {phone}</p>
            <input
              type="number"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value.slice(0, 6))}
              style={{ ...styles.input, textAlign: 'center', letterSpacing: '8px', fontSize: '20px', width: '100%', marginBottom: '8px' }}
              onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
            />
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.btn} onClick={handleVerifyOtp} disabled={loading}>
              {loading ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Verify & Continue'}
            </button>
            <button style={styles.backBtn} onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>
              Change number
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '36px 28px',
    maxWidth: '380px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: { marginBottom: '16px' },
  title: { fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', textAlign: 'center' },
  subtitle: { fontSize: '14px', color: '#64748b', margin: '0 0 24px', textAlign: 'center' },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  prefix: {
    padding: '13px 12px',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontWeight: '600',
    fontSize: '15px',
    borderRight: '1px solid #e2e8f0',
  },
  input: {
    flex: 1,
    padding: '13px 16px',
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#0f172a',
  },
  otpHint: { fontSize: '13px', color: '#64748b', marginBottom: '12px', textAlign: 'center' },
  error: { color: '#ef4444', fontSize: '13px', margin: '0 0 8px', alignSelf: 'flex-start' },
  btn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontSize: '13px',
    cursor: 'pointer',
    marginTop: '12px',
    fontWeight: '600',
  },
};
