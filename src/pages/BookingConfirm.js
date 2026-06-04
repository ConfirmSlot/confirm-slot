import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { C } from '../styles/colors';

export default function BookingConfirm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { booking, type } = state || {};

  const icon = type === 'token' ? '🎫' : type === 'session' ? '📅' : '✅';
  const label = type === 'token' ? `Token #${booking?.tokenNo}` : type === 'session' ? 'Session Booked' : 'Appointment Confirmed';

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.iconWrap}>{icon}</div>
        <h2 style={s.title}>{label}</h2>
        <p style={s.sub}>Your booking is confirmed. We look forward to seeing you!</p>

        {booking?.date && (
          <div style={s.infoBox}>
            <Row label="Date" value={new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} />
            {booking.time && <Row label="Time" value={booking.time} />}
            {booking.tokenNo && <Row label="Token" value={`#${booking.tokenNo}`} />}
          </div>
        )}

        <button style={s.btn} onClick={() => navigate('/my-bookings')}>View My Bookings</button>
        <button style={s.ghost} onClick={() => navigate('/home')}>Go to Home</button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${C.BORDER}` }}>
      <span style={{ color: C.TEXT3, fontSize: 14 }}>{label}</span>
      <span style={{ color: C.TEXT1, fontWeight: 600, fontSize: 14 }}>{value}</span>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: C.BG, padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: '40px 28px', maxWidth: 380, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: C.PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 16 },
  title: { color: C.TEXT1, fontWeight: 800, fontSize: 22, margin: '0 0 8px' },
  sub: { color: C.TEXT3, fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 },
  infoBox: { width: '100%', marginBottom: 24 },
  btn: { width: '100%', padding: 14, borderRadius: 12, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10 },
  ghost: { background: 'none', border: 'none', color: C.PRIMARY, fontWeight: 600, fontSize: 14, cursor: 'pointer' },
};
