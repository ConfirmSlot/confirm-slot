import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { C } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';

const TABS = ['upcoming', 'completed', 'cancelled'];
const STATUS_MAP = {
  ACTIVE: { label: 'Active', color: '#10B981', bg: '#ECFDF5' },
  PENDING: { label: 'Pending', color: '#F59E0B', bg: '#FFFBEB' },
  COMPLETED: { label: 'Completed', color: '#6D28D9', bg: '#EDE9FE' },
  CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2' },
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('upcoming');
  const [data, setData] = useState({ appointments: [], tokens: [], sessions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/v1/mybookings').then(r => {
      if (r.success) {
        const all = r.data || [];
        setData({
          appointments: all.filter(b => !b.tokenNo && !b.sessionId),
          tokens: all.filter(b => b.tokenNo != null),
          sessions: all.filter(b => b.sessionId),
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const allBookings = [
    ...(data.appointments || []).map(b => ({ ...b, _type: 'appointment' })),
    ...(data.tokens || []).map(b => ({ ...b, _type: 'token' })),
    ...(data.sessions || []).map(b => ({ ...b, _type: 'session' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filtered = allBookings.filter(b => {
    const s = b.status?.toUpperCase();
    if (tab === 'upcoming') return s === 'ACTIVE' || s === 'PENDING';
    if (tab === 'completed') return s === 'COMPLETED';
    if (tab === 'cancelled') return s === 'CANCELLED';
    return true;
  });

  const handleCancel = async (b) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      if (b._type === 'appointment') await api.post('/v1/mybookings/cancel', { appointmentId: b._id });
      else if (b._type === 'token') await api.patch(`/v1/tokens/${b._id}`, { status: 'CANCELLED' });
      setData(prev => ({
        ...prev,
        appointments: prev.appointments.map(a => a._id === b._id ? { ...a, status: 'CANCELLED' } : a),
        tokens: prev.tokens.map(t => t._id === b._id ? { ...t, status: 'CANCELLED' } : t),
      }));
    } catch {}
  };

  return (
    <AppLayout>
      <div style={{ padding: '16px 16px 0' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: C.TEXT1 }}>My Bookings</h2>

        {/* Tabs */}
        <div style={s.tabs}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.center}><Spinner /></div>
        ) : filtered.length === 0 ? (
          <div style={s.center}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 40 }}>📭</p>
              <p style={{ color: C.TEXT3, fontSize: 15 }}>No {tab} bookings</p>
              <button style={s.exploreBtn} onClick={() => navigate('/home')}>Explore Services</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
            {filtered.map(b => <BookingCard key={b._id} b={b} onCancel={handleCancel} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function BookingCard({ b, onCancel }) {
  const st = STATUS_MAP[b.status?.toUpperCase()] || STATUS_MAP.ACTIVE;
  const typeIcon = b._type === 'token' ? '🎫' : b._type === 'session' ? '📅' : '📆';
  const canCancel = b.status?.toUpperCase() === 'ACTIVE' || b.status?.toUpperCase() === 'PENDING';

  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: C.TEXT1 }}>
            {typeIcon} {b.serviceProviderName || b.providerName || 'Service Provider'}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: C.TEXT3 }}>
            {b.date ? new Date(b.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
            {b.time ? ` • ${b.time}` : ''}
          </p>
        </div>
        <div style={{ ...s.badge, backgroundColor: st.bg }}>
          <span style={{ color: st.color, fontSize: 12, fontWeight: 700 }}>{st.label}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {b.tokenNo && <Tag text={`Token #${b.tokenNo}`} />}
        {b._type === 'token' && b.isWalkIn && <Tag text="Walk-in" color="#D97706" bg="#FEF3C7" />}
        {b.payment?.price > 0 && <Tag text={`₹${b.payment.price}`} color={C.PRIMARY} bg={C.PRIMARY_LIGHT} />}
      </div>

      {canCancel && (
        <button onClick={() => onCancel(b)} style={s.cancelBtn}>Cancel</button>
      )}
    </div>
  );
}

function Tag({ text, color, bg }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 8, backgroundColor: bg || '#f1f5f9', color: color || C.TEXT3 }}>{text}</span>
  );
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />;
}

const s = {
  tabs: { display: 'flex', gap: 8, marginBottom: 16, backgroundColor: '#fff', borderRadius: 12, padding: 4, border: `1px solid ${C.BORDER}` },
  tab: { flex: 1, padding: '9px 8px', border: 'none', background: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.TEXT3 },
  tabActive: { backgroundColor: C.PRIMARY, color: '#fff' },
  center: { minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: '14px 16px', border: `1px solid ${C.BORDER}`, boxShadow: `0 1px 8px rgba(0,0,0,0.04)` },
  badge: { borderRadius: 20, padding: '3px 10px' },
  cancelBtn: { background: 'none', border: `1px solid ${C.ERROR}`, color: C.ERROR, borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginTop: 4 },
  exploreBtn: { marginTop: 12, padding: '10px 24px', borderRadius: 12, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};
