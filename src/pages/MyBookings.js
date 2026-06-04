import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { C } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';
import { toast } from 'react-toastify';

const FILTER_TABS = ['upcoming', 'completed', 'cancelled'];

const PAYMENT_BADGE = {
  1: { label: 'Paid',    color: '#10B981', bg: 'rgba(16,185,129,0.1)'  },
  2: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  3: { label: 'Failed',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
};
const UNPAID_BADGE = { label: 'Unpaid', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };

const STATUS_COLOR = {
  ACTIVE:    '#10B981',
  PENDING:   '#F59E0B',
  COMPLETED: '#6D28D9',
  CANCELLED: '#EF4444',
};

export default function MyBookings() {
  const navigate  = useNavigate();
  const [filter,  setFilter]  = useState('upcoming');
  const [all,     setAll]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get('/v1/mybookings').then(r => {
      if (r.success) setAll(r.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const sorted = [...all].sort((a, b) =>
    new Date(b.startTime || b.date) - new Date(a.startTime || a.date)
  );

  const filtered = sorted.filter(b => {
    const s = b.status?.toUpperCase();
    if (filter === 'upcoming')  return s === 'ACTIVE' || s === 'PENDING';
    if (filter === 'completed') return s === 'COMPLETED';
    if (filter === 'cancelled') return s === 'CANCELLED';
    return true;
  });

  // Group by type
  const tokens       = filtered.filter(b => b.type === 'TOKEN'       || b.tokenNo != null);
  const appointments = filtered.filter(b => b.type === 'APPOINTMENT' && b.tokenNo == null && !b.sessionId);
  const sessions     = filtered.filter(b => b.sessionId || b.type === 'SESSION');

  const confirmCancel = async (b) => {
    setCancellingId(null);
    try {
      const isToken = b.type === 'TOKEN' || b.tokenNo != null;
      if (isToken) await api.patch(`/v1/tokens/${b._id}`, { status: 'CANCELLED' });
      else          await api.post('/v1/mybookings/cancel', { appointmentId: b._id });
      setAll(prev => prev.map(x => x._id === b._id ? { ...x, status: 'CANCELLED' } : x));
      toast.success('Booking cancelled.');
    } catch {
      toast.error('Failed to cancel. Please try again.');
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Filter pills ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {FILTER_TABS.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ ...s.filterPill, ...(filter === t ? s.filterPillActive : {}) }}>
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
              <p style={{ color: '#6B7280', fontSize: 15 }}>No {filter} bookings</p>
              <button style={s.exploreBtn} onClick={() => navigate('/home')}>Explore Services</button>
            </div>
          </div>
        ) : (
          <div style={{ paddingBottom: 20 }}>

            {/* Tokens */}
            {tokens.length > 0 && (
              <Section label="Tokens">
                {tokens.map(b => <BookingCard key={b._id} b={b} cancellingId={cancellingId} onCancel={setCancellingId} onConfirm={confirmCancel} onDismiss={() => setCancellingId(null)} navigate={navigate} />)}
              </Section>
            )}

            {/* Appointments */}
            {appointments.length > 0 && (
              <Section label="Appointments">
                {appointments.map(b => <BookingCard key={b._id} b={b} cancellingId={cancellingId} onCancel={setCancellingId} onConfirm={confirmCancel} onDismiss={() => setCancellingId(null)} navigate={navigate} />)}
              </Section>
            )}

            {/* Sessions */}
            {sessions.length > 0 && (
              <Section label="Sessions">
                {sessions.map(b => <BookingCard key={b._id} b={b} cancellingId={cancellingId} onCancel={setCancellingId} onConfirm={confirmCancel} onDismiss={() => setCancellingId(null)} navigate={navigate} />)}
              </Section>
            )}

          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: '#6B7280' }}>{label}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  );
}

function BookingCard({ b, cancellingId, onCancel, onConfirm, onDismiss, navigate }) {
  const isConfirming = cancellingId === b._id;
  const canCancel    = b.status?.toUpperCase() === 'ACTIVE' || b.status?.toUpperCase() === 'PENDING';
  const isToken      = b.type === 'TOKEN' || b.tokenNo != null;
  const isSession    = !!b.sessionId;
  const statusColor  = STATUS_COLOR[b.status?.toUpperCase()] || '#6B7280';
  const payBadge     = PAYMENT_BADGE[b.payment?.status] || (b.payment?.price > 0 ? UNPAID_BADGE : null);

  // Date / time
  const rawDate = b.startTime || b.date;
  const dateObj = rawDate ? new Date(rawDate) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : null;
  const timeStr = b.time || (dateObj && b.type === 'APPOINTMENT'
    ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null);

  // Queue status for tokens
  let queueMsg = null, queueColor = '#3B82F6';
  if (isToken && b.tokenNo) {
    const ahead = b.tokenNo - (b.lastCompletedTokenNo || 0) - 1;
    if (!b.lastCompletedTokenNo || b.lastCompletedTokenNo === 0) {
      queueMsg = 'Waiting - No tokens served yet'; queueColor = '#3B82F6';
    } else if (ahead <= 0) {
      queueMsg = 'Your turn is now!'; queueColor = '#10B981';
    } else {
      queueMsg = `${ahead} token${ahead > 1 ? 's' : ''} ahead of you`; queueColor = '#F59E0B';
    }
  }

  // Location for maps
  const mapQuery = [b.serviceaddressLine1 || b.branchAddressLine1, b.serviceCity || b.branchCity, b.serviceState].filter(Boolean).join(', ');

  return (
    <div style={s.card}>

      {/* ── Name + payment badge ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: C.TEXT1, flex: 1, marginRight: 8 }}>
          {b.serviceName || b.serviceProviderName || 'Service Provider'}
        </p>
        {payBadge && !b.isWalkIn && (
          <span style={{ ...s.pill, color: payBadge.color, backgroundColor: payBadge.bg, flexShrink: 0 }}>
            {payBadge.label}
          </span>
        )}
      </div>

      {/* ── Price ── */}
      {b.payment?.price > 0 && !b.isWalkIn && (
        <p style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 900, color: statusColor }}>
          ₹{b.payment.price}
        </p>
      )}

      {/* ── Chips ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {dateStr && (
          <span style={s.chip}><span style={{ fontSize: 12 }}>📅</span> {dateStr}</span>
        )}
        {timeStr && (
          <span style={s.chip}><span style={{ fontSize: 12 }}>🕐</span> {timeStr}</span>
        )}
        {b.tokenNo && (
          <span style={{ ...s.chip, backgroundColor: '#3B82F6', color: '#fff', fontWeight: 700 }}>
            Token #{b.tokenNo}
          </span>
        )}
        {b.term && typeof b.term === 'string' && b.term !== 'ONE-TIME' && (
          <span style={{ ...s.chip, backgroundColor: '#E0F2FE', color: '#0369A1' }}>
            {b.term.charAt(0) + b.term.slice(1).toLowerCase().replace(/-/g, ' ')}
          </span>
        )}
        {/* Session time label */}
        {b.timeLabel && (
          <span style={{ ...s.chip, backgroundColor: '#E0F2FE', color: '#0369A1' }}>{b.timeLabel}</span>
        )}
      </div>

      {/* ── Session: Branch + Employee ── */}
      {isSession && (b.branchName || b.employeeName) && (
        <div style={{ marginBottom: 12 }}>
          {b.branchName && (
            <div style={s.infoRow}>
              <span style={{ fontSize: 13 }}>🏢</span>
              <div>
                <p style={s.infoLabel}>Branch</p>
                <p style={s.infoValue}>{b.branchName}</p>
              </div>
            </div>
          )}
          {b.employeeName && (
            <div style={s.infoRow}>
              <span style={{ fontSize: 13 }}>👤</span>
              <div>
                <p style={s.infoLabel}>Your Staff</p>
                <p style={s.infoValue}>{b.employeeName}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Divider + SERVICE PROVIDER ── */}
      <div style={{ borderTop: `1px solid #F3F4F6`, paddingTop: 10, marginBottom: 10 }}>
        <p style={s.sectionLabel}>SERVICE PROVIDER</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={s.providerAvatar}>
              <span style={{ fontSize: 14 }}>👤</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.TEXT1 }}>
              {b.serviceProviderName || b.providerName || '—'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {b.serviceProviderPhone && (
              <a href={`tel:${b.serviceProviderPhone}`} style={s.contactIcon}>
                <span style={{ fontSize: 18, color: '#10B981' }}>📞</span>
              </a>
            )}
            {b.serviceProviderEmail && (
              <a href={`mailto:${b.serviceProviderEmail}`} style={s.contactIcon}>
                <span style={{ fontSize: 18, color: '#6366F1' }}>✉️</span>
              </a>
            )}
            {mapQuery && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer" style={s.contactIcon}>
                <span style={{ fontSize: 18, color: '#EF4444' }}>📍</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Queue status (tokens) ── */}
      {queueMsg && (
        <div style={{ ...s.queueBox, borderColor: queueColor + '60', backgroundColor: queueColor + '10', marginBottom: 10 }}>
          <span style={{ fontSize: 14 }}>⏳</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: queueColor }}>{queueMsg}</span>
        </div>
      )}

      {/* ── Action buttons ── */}
      {canCancel && !isConfirming && (
        <div style={{ display: 'flex', gap: 8 }}>
          {!isToken && (
            <button
              onClick={() => navigate(`/sp/${b.serviceProviderId}`)}
              style={s.rescheduleBtn}>
              Reschedule
            </button>
          )}
          <button onClick={() => onCancel(b._id)} style={s.cancelBtn}>Cancel</button>
        </div>
      )}

      {isConfirming && (
        <div style={s.confirmBox}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: C.TEXT1 }}>Cancel this booking?</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onConfirm(b)} style={s.confirmYes}>Yes, Cancel</button>
            <button onClick={onDismiss} style={s.confirmNo}>Keep it</button>
          </div>
        </div>
      )}

    </div>
  );
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />;
}

const s = {
  filterPill:       { padding: '5px 12px', borderRadius: 20, border: `1px solid ${C.BORDER}`, background: 'none', fontSize: 12, fontWeight: 600, color: '#6B7280', cursor: 'pointer' },
  filterPillActive: { backgroundColor: C.PRIMARY, color: '#fff', borderColor: C.PRIMARY },
  center:           { minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  exploreBtn:       { marginTop: 12, padding: '10px 24px', borderRadius: 12, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: '14px 14px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    border: `1px solid #F3F4F6`,
  },
  pill:   { fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20 },
  chip:   { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500, padding: '4px 8px', borderRadius: 8, backgroundColor: '#F3F4F6', color: '#374151' },

  sectionLabel:   { margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: 0.8 },
  providerAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  contactIcon:    { textDecoration: 'none', lineHeight: 1 },

  infoRow:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoLabel: { margin: 0, fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { margin: 0, fontSize: 13, color: C.TEXT1, fontWeight: 600 },

  queueBox:   { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 10, border: '1px solid' },

  rescheduleBtn: { flex: 1, padding: '9px 0', borderRadius: 10, border: `1.5px solid ${C.PRIMARY}`, backgroundColor: 'transparent', color: C.PRIMARY, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  cancelBtn:     { flex: 1, padding: '9px 0', borderRadius: 10, border: `1.5px solid ${C.ERROR}`, backgroundColor: 'transparent', color: C.ERROR, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  confirmBox:    { backgroundColor: '#FEF2F2', borderRadius: 10, padding: '12px 14px', marginTop: 8, border: '1px solid #FEC5C5' },
  confirmYes:    { flex: 1, padding: '8px 0', borderRadius: 8, backgroundColor: C.ERROR, color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  confirmNo:     { flex: 1, padding: '8px 0', borderRadius: 8, backgroundColor: '#F3F4F6', color: C.TEXT1, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
};
