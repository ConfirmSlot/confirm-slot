import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../styles/colors';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate('/my-bookings'), 3000);
    return () => clearTimeout(t);
  }, [navigate]);
  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.icon}>✅</div>
        <h2 style={s.title}>Payment Successful!</h2>
        <p style={s.sub}>Your booking has been confirmed. You can view it in My Bookings.</p>
        <button style={s.btn} onClick={() => navigate('/my-bookings')}>View My Bookings</button>
        <button style={s.ghost} onClick={() => navigate('/home')}>Go to Home</button>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: C.BG, padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: '40px 28px', maxWidth: 380, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { color: C.TEXT1, fontWeight: 800, fontSize: 22, margin: '0 0 8px' },
  sub: { color: C.TEXT3, fontSize: 14, margin: '0 0 28px', lineHeight: 1.6 },
  btn: { width: '100%', padding: 14, borderRadius: 12, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 },
  ghost: { background: 'none', border: 'none', color: C.PRIMARY, fontWeight: 600, fontSize: 14, cursor: 'pointer' },
};
