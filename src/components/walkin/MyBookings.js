import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';

const STATUS_COLOR = {
  ACTIVE:    { bg: '#dcfce7', color: '#16a34a', label: 'Active' },
  COMPLETED: { bg: '#e0e7ff', color: '#6366f1', label: 'Completed' },
  CANCELLED: { bg: '#fee2e2', color: '#ef4444', label: 'Cancelled' },
};

export default function MyBookings() {
  const { apiFetch, logout } = useAuth();
  const navigate              = useNavigate();
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [lastSync,  setLastSync]  = useState(null);

  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res  = await apiFetch(`${API_BASE_URL}/v1/tokens/my-tokens`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.tokens || data.data || []);
        setLastSync(new Date());
      } else {
        setError(data.message || 'Failed to load bookings');
      }
    } catch (e) {
      if (e.message !== 'SESSION_EXPIRED') setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(() => fetchBookings(true), 30000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const activeBookings    = bookings.filter(b => b.status === 'ACTIVE');
  const inactiveBookings  = bookings.filter(b => b.status !== 'ACTIVE');

  return (
    <div style={s.container}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h2 style={s.title}>My Bookings</h2>
        <button style={s.logoutBtn} onClick={() => { logout(); navigate('/'); }}>Logout</button>
      </div>

      {lastSync && (
        <div style={s.syncBar}>
          <span style={s.syncText}>
            Updated {lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button style={s.refreshBtn} onClick={() => fetchBookings(true)}>↻ Refresh</button>
        </div>
      )}

      {loading ? (
        <div style={s.center}><CircularProgress style={{ color: '#6366f1' }} /></div>
      ) : error ? (
        <div style={s.center}>
          <p style={{ color: '#ef4444', marginBottom: 12 }}>{error}</p>
          <button style={s.retryBtn} onClick={() => fetchBookings()}>Try Again</button>
        </div>
      ) : bookings.length === 0 ? (
        <div style={s.center}>
          <p style={{ color: '#94a3b8', fontSize: 16 }}>No bookings yet.</p>
        </div>
      ) : (
        <div style={s.list}>
          {/* Active bookings first */}
          {activeBookings.length > 0 && (
            <>
              <p style={s.sectionLabel}>Active</p>
              {activeBookings.map(b => <BookingCard key={b._id} booking={b} formatDate={formatDate} />)}
            </>
          )}
          {inactiveBookings.length > 0 && (
            <>
              <p style={s.sectionLabel}>Past</p>
              {inactiveBookings.map(b => <BookingCard key={b._id} booking={b} formatDate={formatDate} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking: b, formatDate }) {
  const st = STATUS_COLOR[b.status] || STATUS_COLOR.ACTIVE;
  return (
    <div style={s.card}>
      <div style={s.cardTop}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.venueName} title={b.serviceProviderName}>{b.serviceProviderName || 'Venue'}</p>
          <p style={s.date}>{formatDate(b.date)}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <div style={{ ...s.badge, backgroundColor: st.bg }}>
            <span style={{ color: st.color, fontSize: 12, fontWeight: 700 }}>{st.label}</span>
          </div>
          {b.isWalkIn && (
            <div style={{ ...s.badge, backgroundColor: '#fef3c7' }}>
              <span style={{ color: '#d97706', fontSize: 12, fontWeight: 700 }}>Walk-in</span>
            </div>
          )}
        </div>
      </div>

      <div style={s.tokenRow}>
        <div style={{ ...s.tokenBadge, backgroundColor: '#6366f1' }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Token #{b.tokenNo}</span>
        </div>
        {b.adults != null && <span style={s.extra}>👤 {b.adults} adult{b.adults !== 1 ? 's' : ''}</span>}
        {b.children != null && <span style={s.extra}>🧒 {b.children} child{b.children !== 1 ? 'ren' : ''}</span>}
      </div>

      {/* Queue position for active walk-in tokens */}
      {b.status === 'ACTIVE' && b.isWalkIn && b.waitingAhead != null && (
        <div style={s.queueInfo}>
          <span style={s.queueInfoText}>
            {b.waitingAhead === 0 ? '🔔 Your turn is next!' : `${b.waitingAhead} ahead of you`}
          </span>
        </div>
      )}
    </div>
  );
}

const s = {
  container:    { minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: 40 },
  header:       { backgroundColor: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 },
  backBtn:      { background: 'none', border: 'none', color: '#6366f1', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  title:        { fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 },
  logoutBtn:    { background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  syncBar:      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' },
  syncText:     { fontSize: 12, color: '#94a3b8' },
  refreshBtn:   { background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  center:       { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' },
  retryBtn:     { padding: '10px 24px', borderRadius: 10, backgroundColor: '#6366f1', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' },
  list:         { padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  sectionLabel: { fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '8px 0 4px' },
  card:         { backgroundColor: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  cardTop:      { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 8 },
  venueName:    { fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  date:         { fontSize: 13, color: '#64748b', margin: 0 },
  badge:        { borderRadius: 20, padding: '3px 10px', display: 'inline-flex' },
  tokenRow:     { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 },
  tokenBadge:   { borderRadius: 8, padding: '4px 12px' },
  extra:        { fontSize: 13, color: '#64748b' },
  queueInfo:    { backgroundColor: '#eff6ff', borderRadius: 8, padding: '8px 12px' },
  queueInfoText:{ fontSize: 13, fontWeight: 600, color: '#2563eb' },
};
