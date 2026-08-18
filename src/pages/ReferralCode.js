import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { C } from '../styles/colors';

export default function ReferralCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const goNext = () => navigate('/home', { replace: true });

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError('Please enter a referral code'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/v1/referral/apply', { code: trimmed });
      if (res.success) {
        setSuccess(true);
        setTimeout(goNext, 1500);
      } else {
        setError(res.message || 'Invalid referral code. Please try again.');
      }
    } catch {
      setError('Invalid referral code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Skip */}
      <button onClick={goNext} style={s.skipBtn}>Skip ✕</button>

      <div style={s.center}>
        {/* Icon */}
        <div style={s.iconWrap}>🎁</div>
        <h2 style={s.title}>Have a referral code?</h2>
        <p style={s.subtitle}>
          Enter a friend's code and get{' '}
          <strong style={{ color: C.PRIMARY }}>25 free reward points</strong> instantly!
        </p>

        {/* Card */}
        <div style={s.card}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <p style={{ fontSize: 44, margin: '0 0 12px' }}>🎉</p>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#10B981' }}>+25 Points Earned!</p>
              <p style={{ margin: '6px 0 0', fontSize: 14, color: '#6B7280' }}>Referral code applied successfully</p>
            </div>
          ) : (
            <>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Referral Code
              </label>
              <input
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="Enter code"
                maxLength={10}
                style={{
                  ...s.input,
                  borderColor: error ? '#EF4444' : code ? C.PRIMARY : '#E5E7EB',
                }}
              />
              {error
                ? <p style={{ margin: '6px 0 12px', fontSize: 13, color: '#EF4444', textAlign: 'center' }}>{error}</p>
                : <div style={{ height: 20 }} />
              }
              <button
                onClick={handleApply}
                disabled={loading || !code.trim()}
                style={{ ...s.applyBtn, opacity: (!code.trim() || loading) ? 0.5 : 1 }}
              >
                {loading ? 'Applying...' : 'Apply Code →'}
              </button>
            </>
          )}
        </div>

        {/* Benefit row */}
        <div style={s.benefitRow}>
          <div style={s.benefitItem}>
            <span style={{ fontSize: 26 }}>🎁</span>
            <p style={s.benefitLabel}>You get</p>
            <p style={s.benefitValue}>25 pts</p>
          </div>
          <div style={s.benefitItem}>
            <span style={{ fontSize: 26 }}>👤</span>
            <p style={s.benefitLabel}>Friend gets</p>
            <p style={s.benefitValue}>50 pts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:        { minHeight: '100vh', backgroundColor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' },
  skipBtn:     { position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.06)', border: 'none', padding: '6px 14px', borderRadius: 20, fontSize: 14, fontWeight: 600, color: '#6B7280', cursor: 'pointer' },
  center:      { width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  iconWrap:    { width: 88, height: 88, borderRadius: 44, backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 20 },
  title:       { margin: '0 0 10px', fontSize: 26, fontWeight: 800, color: '#1F2937', textAlign: 'center' },
  subtitle:    { margin: '0 0 28px', fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 1.6 },
  card:        { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', marginBottom: 24 },
  input:       { width: '100%', padding: '16px', borderRadius: 14, border: '1.5px solid #E5E7EB', fontSize: 22, fontWeight: 700, letterSpacing: 6, textAlign: 'center', outline: 'none', backgroundColor: '#F5F3FF', color: C.PRIMARY, boxSizing: 'border-box', display: 'block' },
  applyBtn:    { width: '100%', padding: 16, borderRadius: 14, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  benefitRow:  { display: 'flex', gap: 40 },
  benefitItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  benefitLabel:{ margin: 0, fontSize: 12, color: '#9CA3AF' },
  benefitValue:{ margin: 0, fontSize: 15, fontWeight: 700, color: C.PRIMARY },
};
