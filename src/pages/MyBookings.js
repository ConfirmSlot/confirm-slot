import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { C } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';
import { toast } from 'react-toastify';

const FILTER_TABS = ['upcoming', 'completed', 'cancelled', 'expired'];

const PAYMENT_BADGE = {
  1: { label: 'Paid',    color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  2: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  3: { label: 'Failed',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
};
const UNPAID_BADGE = { label: 'Unpaid', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };

// ── Helpers ──────────────────────────────────────────────────────────────────

const isFuture = (b) => {
  if (b.type === 'TOKEN' || b.tokenNo != null) {
    const d = new Date(b.date || b.startTime); d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return d >= t;
  }
  return b.startTime ? new Date(b.startTime) > new Date() : false;
};

const isPast = (b) => {
  if (b.type === 'TOKEN' || b.tokenNo != null) {
    const d = new Date(b.date || b.startTime); d.setHours(0,0,0,0);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  }
  return b.startTime ? new Date(b.startTime) <= new Date() : false;
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function MyBookings() {
  const navigate = useNavigate();

  const [filter,      setFilter]      = useState('upcoming');
  const [all,         setAll]         = useState([]);
  const [sessions,    setSessions]    = useState([]);
  const [myCarnivals, setMyCarnivals] = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [cancellingId, setCancellingId] = useState(null);
  const [cancellingSessionId, setCancellingSessionId] = useState(null);

  // Review modal
  const [reviewBooking,     setReviewBooking]     = useState(null);
  const [reviewRating,      setReviewRating]      = useState(0);
  const [reviewText,        setReviewText]        = useState('');
  const [submittingReview,  setSubmittingReview]  = useState(false);

  // Reschedule modal (appointments)
  const [rescheduleBooking,    setRescheduleBooking]    = useState(null);
  const [rescheduleDate,       setRescheduleDate]       = useState('');
  const [rescheduleSlots,      setRescheduleSlots]      = useState([]);
  const [rescheduleTime,       setRescheduleTime]       = useState('');
  const [loadingSlots,         setLoadingSlots]         = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // ── Data fetch ────────────────────────────────────────────────────────────

  const fetchBookings = useCallback(async () => {
    try {
      const [mbRes, sessRes, carnRes] = await Promise.allSettled([
        api.get('/v1/mybookings'),
        api.get('/v1/session-booking/my'),
        api.get('/v1/carnival/my-carnivals'),
      ]);
      if (mbRes.status === 'fulfilled' && mbRes.value.success) {
        setAll(mbRes.value.data || []);
      }
      if (sessRes.status === 'fulfilled') {
        setSessions(sessRes.value.bookings || []);
      }
      if (carnRes.status === 'fulfilled') {
        setMyCarnivals(carnRes.value.data?.data || carnRes.value.data || []);
      }
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchBookings().finally(() => setLoading(false));
  }, [fetchBookings]);

  // ── Derived lists ─────────────────────────────────────────────────────────

  const byFilter = (list, f) => {
    const s = (b) => (b.status || '').toUpperCase();
    if (f === 'upcoming')  return list.filter(b => (s(b) === 'ACTIVE' || s(b) === 'PENDING') && isFuture(b));
    if (f === 'completed') return list.filter(b => s(b) === 'COMPLETED');
    if (f === 'cancelled') return list.filter(b => s(b) === 'CANCELLED');
    if (f === 'expired')   return list.filter(b => (s(b) === 'ACTIVE' || s(b) === 'PENDING') && isPast(b));
    return list;
  };

  const bySessionFilter = (list, f) => {
    const now = new Date();
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const todayIST = istNow.toISOString().slice(0, 10);
    const timeIST  = istNow.toISOString().slice(11, 16);
    switch (f) {
      case 'upcoming':  return list.filter(sb => (sb.status === 'booked' || sb.status === 'pending_payment') && (sb.date > todayIST || (sb.date === todayIST && sb.sessionEndTime > timeIST)));
      case 'expired':   return list.filter(sb => sb.status === 'booked' && (sb.date < todayIST || (sb.date === todayIST && sb.sessionEndTime <= timeIST)));
      case 'completed': return list.filter(sb => sb.status === 'completed');
      case 'cancelled': return list.filter(sb => sb.status === 'cancelled');
      default: return [];
    }
  };

  const sorted = [...all].sort((a, b) => new Date(b.startTime || b.date) - new Date(a.startTime || a.date));
  const filtered = byFilter(sorted, filter);
  const filteredSessions = bySessionFilter(sessions, filter);
  const filteredCarnivals = myCarnivals.filter(c =>
    filter === 'upcoming'  ? c.status === 'ACTIVE'    :
    filter === 'completed' ? c.status === 'COMPLETED' : false
  );

  const tokens       = filtered.filter(b => b.type === 'TOKEN'       || b.tokenNo != null);
  const appointments = filtered.filter(b => b.type === 'APPOINTMENT' && b.tokenNo == null && !b.sessionId);

  // ── Cancel (TOKEN / APPOINTMENT) ─────────────────────────────────────────

  const confirmCancel = async (b) => {
    setCancellingId(null);
    try {
      const isToken = b.type === 'TOKEN' || b.tokenNo != null;
      await api.post('/v1/mybookings/cancel', { bookingId: b._id, type: isToken ? 'TOKEN' : 'APPOINTMENT' });
      await fetchBookings();
      toast.success('Booking cancelled.');
    } catch { toast.error('Failed to cancel. Please try again.'); }
  };

  // ── Cancel (SESSION) ──────────────────────────────────────────────────────

  const confirmSessionCancel = async (sb) => {
    setCancellingSessionId(null);
    try {
      await api.patch(`/v1/session-booking/${sb._id}/cancel`, {});
      await fetchBookings();
      toast.success('Session cancelled.');
    } catch { toast.error('Failed to cancel session. Please try again.'); }
  };

  // ── Review ────────────────────────────────────────────────────────────────

  const openReview = (b) => {
    setReviewBooking(b);
    setReviewRating(0);
    setReviewText('');
  };

  const submitReview = async () => {
    if (!reviewRating) { toast.warning('Please select a rating.'); return; }
    if (!reviewText.trim()) { toast.warning('Please write a review.'); return; }
    setSubmittingReview(true);
    try {
      await api.post('/v1/reviews', {
        serviceProviderId: reviewBooking.serviceProviderId || reviewBooking.serviceId,
        appointmentId: reviewBooking._id,
        rating: reviewRating,
        description: reviewText.trim(),
      });
      setReviewBooking(null);
      toast.success('Review submitted!');
    } catch { toast.error('Failed to submit review.'); }
    finally { setSubmittingReview(false); }
  };

  // ── Reschedule ────────────────────────────────────────────────────────────

  const fetchSlots = useCallback(async (date, booking) => {
    if (!date || !booking) return;
    setLoadingSlots(true); setRescheduleTime(''); setRescheduleSlots([]);
    try {
      const spId = booking.serviceProviderId || booking.serviceId || '';
      const dur  = booking.duration || 30;
      const r = await api.open(`/v1/appointments/available-slots?date=${date}&serviceProviderId=${spId}&duration=${dur}&excludeAppointmentId=${booking._id}`);
      const today0 = new Date(); today0.setHours(0,0,0,0);
      const sel0   = new Date(date); sel0.setHours(0,0,0,0);
      let slots = (r.slots || []).filter(s => s.available);
      if (sel0.getTime() === today0.getTime()) {
        const buf = new Date().getHours() * 60 + new Date().getMinutes() + 30;
        slots = slots.filter(s => { const [h,m] = s.time.split(':').map(Number); return h*60+m > buf; });
      }
      setRescheduleSlots(slots);
      if (slots.length > 0) setRescheduleTime(slots[0].time);
    } catch { toast.error('Failed to load slots.'); }
    finally { setLoadingSlots(false); }
  }, []);

  const openReschedule = useCallback((b) => {
    const d = new Date(b.startTime || b.date || Date.now());
    const dateStr = d.toISOString().split('T')[0];
    setRescheduleBooking(b); setRescheduleDate(dateStr);
    setRescheduleSlots([]); setRescheduleTime('');
    fetchSlots(dateStr, b);
  }, [fetchSlots]);

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) { toast.warning('Please select date and time.'); return; }
    setSubmittingReschedule(true);
    try {
      const [hh, mm] = rescheduleTime.split(':');
      const [y, mo, d] = rescheduleDate.split('-');
      const newStart = new Date(`${y}-${mo}-${d}T${hh.padStart(2,'0')}:${mm.padStart(2,'0')}:00+05:30`);
      const dur = parseInt(rescheduleBooking.duration || 30);
      await api.put(`/v1/appointments/${rescheduleBooking._id}`, {
        startTime: newStart.toISOString(),
        endTime: new Date(newStart.getTime() + dur * 60000).toISOString(),
      });
      setRescheduleBooking(null);
      toast.success('Appointment rescheduled!');
      await fetchBookings();
    } catch { toast.error('Failed to reschedule.'); }
    finally { setSubmittingReschedule(false); }
  };

  // ── Modals ────────────────────────────────────────────────────────────────

  const ReviewModal = () => {
    if (!reviewBooking) return null;
    return (
      <div style={s.overlay}>
        <div style={s.sheet}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:C.TEXT1 }}>Write a Review</h3>
            <button onClick={() => setReviewBooking(null)} style={s.closeBtn}>✕</button>
          </div>
          <p style={{ margin:'0 0 12px', fontSize:13, color:'#6B7280' }}>{reviewBooking.serviceName || reviewBooking.serviceProviderName}</p>

          {/* Stars */}
          <p style={s.modalLabel}>Rating</p>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setReviewRating(n)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:28, lineHeight:1 }}>
                <span style={{ color: n <= reviewRating ? '#FBBF24' : '#D1D5DB' }}>★</span>
              </button>
            ))}
          </div>

          <p style={s.modalLabel}>Your Review</p>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="Share your experience..."
            rows={4}
            style={{ ...s.dateInput, resize:'vertical', fontFamily:'inherit' }}
          />

          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button onClick={submitReview} disabled={submittingReview} style={{ ...s.confirmPrimary, opacity: submittingReview ? 0.5 : 1 }}>
              {submittingReview ? 'Submitting…' : 'Submit Review'}
            </button>
            <button onClick={() => setReviewBooking(null)} style={s.confirmNo}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  const RescheduleModal = () => {
    if (!rescheduleBooking) return null;
    const todayStr = new Date().toISOString().split('T')[0];
    const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 3);
    return (
      <div style={s.overlay}>
        <div style={s.sheet}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:C.TEXT1 }}>Reschedule</h3>
            <button onClick={() => setRescheduleBooking(null)} style={s.closeBtn}>✕</button>
          </div>
          <p style={{ margin:'0 0 14px', fontSize:13, color:'#6B7280' }}>{rescheduleBooking.serviceName}</p>

          <p style={s.modalLabel}>Select Date</p>
          <input type="date" value={rescheduleDate} min={todayStr} max={maxDate.toISOString().split('T')[0]}
            onChange={e => { setRescheduleDate(e.target.value); fetchSlots(e.target.value, rescheduleBooking); }}
            style={s.dateInput}
          />

          <p style={s.modalLabel}>Select Time</p>
          {loadingSlots && <p style={{ fontSize:13, color:'#9CA3AF' }}>Loading slots…</p>}
          {!loadingSlots && rescheduleDate && rescheduleSlots.length === 0 && <p style={{ fontSize:13, color:C.ERROR }}>No slots available.</p>}
          {!loadingSlots && rescheduleSlots.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              {rescheduleSlots.map(slot => (
                <button key={slot.time} onClick={() => setRescheduleTime(slot.time)}
                  style={{ ...s.slotBtn, ...(rescheduleTime === slot.time ? s.slotBtnActive : {}) }}>
                  {slot.time}
                </button>
              ))}
            </div>
          )}

          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button onClick={handleReschedule} disabled={submittingReschedule || !rescheduleTime}
              style={{ ...s.confirmPrimary, opacity: (submittingReschedule || !rescheduleTime) ? 0.5 : 1 }}>
              {submittingReschedule ? 'Saving…' : 'Confirm Reschedule'}
            </button>
            <button onClick={() => setRescheduleBooking(null)} style={s.confirmNo}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <ReviewModal />
      <RescheduleModal />
      <div style={{ padding: '16px 16px 0' }}>

        {/* Filter tabs */}
        <div style={{ display:'flex', gap:6, marginBottom:16, overflowX:'auto', paddingBottom:2 }}>
          {FILTER_TABS.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              style={{ ...s.pill, ...(filter === t ? s.pillActive : {}), whiteSpace:'nowrap' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={s.center}><Spinner /></div>
        ) : filtered.length === 0 && filteredSessions.length === 0 && filteredCarnivals.length === 0 ? (
          <div style={s.center}>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontSize:40 }}>📭</p>
              <p style={{ color:'#6B7280', fontSize:15 }}>No {filter} bookings</p>
              {filter === 'upcoming' && (
                <button style={s.exploreBtn} onClick={() => navigate('/home')}>Explore Services</button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ paddingBottom: 80 }}>

            {/* Tokens */}
            {tokens.length > 0 && (
              <Section label="Tokens">
                {tokens.map(b => (
                  <BookingCard key={b._id} b={b} filter={filter}
                    cancellingId={cancellingId}
                    onCancel={setCancellingId}
                    onConfirm={confirmCancel}
                    onDismiss={() => setCancellingId(null)}
                    onReschedule={openReschedule}
                    onReview={openReview}
                    navigate={navigate}
                  />
                ))}
              </Section>
            )}

            {/* Appointments */}
            {appointments.length > 0 && (
              <Section label="Appointments">
                {appointments.map(b => (
                  <BookingCard key={b._id} b={b} filter={filter}
                    cancellingId={cancellingId}
                    onCancel={setCancellingId}
                    onConfirm={confirmCancel}
                    onDismiss={() => setCancellingId(null)}
                    onReschedule={openReschedule}
                    onReview={openReview}
                    navigate={navigate}
                  />
                ))}
              </Section>
            )}

            {/* Sessions */}
            {filteredSessions.length > 0 && (
              <Section label="Sessions">
                {filteredSessions.map(sb => (
                  <SessionCard key={sb._id} sb={sb} filter={filter}
                    cancellingId={cancellingSessionId}
                    onCancel={setCancellingSessionId}
                    onConfirm={confirmSessionCancel}
                    onDismiss={() => setCancellingSessionId(null)}
                  />
                ))}
              </Section>
            )}

            {/* Carnivals */}
            {filteredCarnivals.length > 0 && (
              <Section label="Carnivals">
                {filteredCarnivals.map(c => (
                  <CarnivalCard key={c._id} c={c} navigate={navigate} />
                ))}
              </Section>
            )}

          </div>
        )}
      </div>
    </AppLayout>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin:'0 0 10px', fontSize:15, fontWeight:700, color:'#6B7280' }}>{label}</p>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>{children}</div>
    </div>
  );
}

// ── BookingCard ───────────────────────────────────────────────────────────────

function BookingCard({ b, filter, cancellingId, onCancel, onConfirm, onDismiss, onReschedule, onReview, navigate }) {
  const isConfirming = cancellingId === b._id;
  const isToken      = b.type === 'TOKEN' || b.tokenNo != null;
  const statusColor  = { ACTIVE:'#10B981', PENDING:'#F59E0B', COMPLETED:'#6D28D9', CANCELLED:'#EF4444' }[b.status?.toUpperCase()] || '#6B7280';
  const payBadge     = PAYMENT_BADGE[b.payment?.status] || (b.payment?.price > 0 ? UNPAID_BADGE : null);

  const rawDate = b.startTime || b.date;
  const dateObj = rawDate ? new Date(rawDate) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : null;

  const fmtTime = (t) => {
    if (!t) return null;
    if (typeof t === 'string' && (t.includes('T') || t.includes('Z'))) {
      const d = new Date(t); return isNaN(d) ? t : d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    }
    return t;
  };
  const timeStr = fmtTime(b.time) || (dateObj && b.type === 'APPOINTMENT'
    ? dateObj.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : null);

  let queueMsg = null, queueColor = '#3B82F6';
  if (isToken && b.tokenNo) {
    const ahead = b.tokenNo - (b.lastCompletedTokenNo || 0) - 1;
    if (!b.lastCompletedTokenNo || b.lastCompletedTokenNo === 0) { queueMsg = 'Waiting - No tokens served yet'; }
    else if (ahead <= 0) { queueMsg = 'Your turn is now!'; queueColor = '#10B981'; }
    else { queueMsg = `${ahead} token${ahead > 1 ? 's' : ''} ahead of you`; queueColor = '#F59E0B'; }
  }

  const mapQuery = [b.serviceaddressLine1 || b.branchAddressLine1, b.serviceCity || b.branchCity, b.serviceState].filter(Boolean).join(', ');

  const canCancel = (filter === 'upcoming') && (b.status?.toUpperCase() === 'ACTIVE' || b.status?.toUpperCase() === 'PENDING');
  const canReview = filter === 'completed' && !isToken;

  return (
    <div style={s.card}>
      {/* Name + badge */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:2 }}>
        <p style={{ margin:0, fontWeight:800, fontSize:16, color:C.TEXT1, flex:1, marginRight:8 }}>
          {b.serviceName || b.serviceProviderName || 'Service Provider'}
        </p>
        {payBadge && !b.isWalkIn && (
          <span style={{ ...s.badge, color:payBadge.color, backgroundColor:payBadge.bg }}>
            {payBadge.label}
          </span>
        )}
      </div>

      {/* Price */}
      {b.payment?.price > 0 && !b.isWalkIn && (
        <p style={{ margin:'0 0 10px', fontSize:20, fontWeight:900, color:statusColor }}>₹{b.payment.price}</p>
      )}

      {/* Chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
        {dateStr && <span style={s.chip}>📅 {dateStr}</span>}
        {timeStr && <span style={s.chip}>🕐 {timeStr}</span>}
        {b.tokenNo && <span style={{ ...s.chip, backgroundColor:'#3B82F6', color:'#fff', fontWeight:700 }}>Token #{b.tokenNo}</span>}
        {b.term && typeof b.term === 'string' && b.term !== 'ONE-TIME' && (
          <span style={{ ...s.chip, backgroundColor:'#E0F2FE', color:'#0369A1' }}>
            {b.term.charAt(0) + b.term.slice(1).toLowerCase().replace(/-/g,' ')}
          </span>
        )}
        {b.serviceType && (
          <span style={{ ...s.chip, backgroundColor: b.serviceType === 'virtual' ? '#DBEAFE' : '#DCFCE7', color: b.serviceType === 'virtual' ? '#1D4ED8' : '#166534' }}>
            {b.serviceType === 'virtual' ? '🌐 Virtual' : '📍 In-Person'}
          </span>
        )}
      </div>

      {/* Service Provider */}
      <div style={{ borderTop:'1px solid #F3F4F6', paddingTop:10, marginBottom:10 }}>
        <p style={s.secLabel}>SERVICE PROVIDER</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={s.avatar}><span style={{ fontSize:14 }}>👤</span></div>
            <span style={{ fontSize:14, fontWeight:600, color:C.TEXT1 }}>{b.serviceProviderName || '—'}</span>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            {b.serviceProviderPhone && <a href={`tel:${b.serviceProviderPhone}`} style={s.iconLink}><span style={{ fontSize:18 }}>📞</span></a>}
            {b.serviceProviderEmail && <a href={`mailto:${b.serviceProviderEmail}`} style={s.iconLink}><span style={{ fontSize:18 }}>✉️</span></a>}
            {mapQuery && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer" style={s.iconLink}><span style={{ fontSize:18 }}>📍</span></a>}
          </div>
        </div>
      </div>

      {/* Branch/Employee for sessions */}
      {(b.branchName || b.employeeName) && (
        <div style={{ marginBottom:10 }}>
          {b.branchName && <p style={{ margin:'0 0 4px', fontSize:13, color:'#6B7280' }}>🏢 {b.branchName}</p>}
          {b.employeeName && <p style={{ margin:0, fontSize:13, color:'#6B7280' }}>👤 {b.employeeName}</p>}
        </div>
      )}

      {/* Meet link */}
      {b.serviceType === 'virtual' && b.meetLink && (
        <a href={b.meetLink} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'#10B981', textDecoration:'none', marginBottom:10 }}>
          <span style={{ width:8, height:8, borderRadius:4, backgroundColor:'#10B981', display:'inline-block' }}/>
          Join Meeting
        </a>
      )}

      {/* Queue status */}
      {queueMsg && (
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 10px', borderRadius:10, border:`1px solid ${queueColor}40`, backgroundColor:`${queueColor}10`, marginBottom:10 }}>
          <span>⏳</span>
          <span style={{ fontSize:13, fontWeight:600, color:queueColor }}>{queueMsg}</span>
        </div>
      )}

      {/* Refund status for cancelled paid bookings */}
      {filter === 'cancelled' && b.payment?.status === 1 && (
        <div style={{ marginBottom:8 }}>
          {b.payment.refund?.refunded
            ? <span style={{ ...s.badge, color:'#065F46', backgroundColor:'rgba(16,185,129,0.1)' }}>Refund Processed</span>
            : b.payment.refund?.refundPending
              ? <span style={{ ...s.badge, color:'#92400E', backgroundColor:'rgba(245,158,11,0.1)' }}>Refund Pending</span>
              : <span style={{ ...s.badge, color:'#1D4ED8', backgroundColor:'rgba(59,130,246,0.1)' }}>Refund Initiated</span>
          }
        </div>
      )}

      {/* Actions */}
      {!isConfirming && (
        <div style={{ display:'flex', gap:8 }}>
          {canCancel && !isToken && (
            <button onClick={() => onReschedule(b)} style={s.outlineBtn}>Reschedule</button>
          )}
          {canCancel && (
            <button onClick={() => onCancel(b._id)} style={s.dangerBtn}>Cancel</button>
          )}
          {canReview && (
            <button onClick={() => onReview(b)} style={s.primaryBtn}>Review</button>
          )}
          {canReview && (
            <button onClick={() => navigate(`/sp/${b.serviceProviderId || b.serviceId}`)} style={s.outlineBtn}>Book Again</button>
          )}
        </div>
      )}

      {isConfirming && (
        <div style={s.confirmBox}>
          <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:600, color:C.TEXT1 }}>Cancel this booking?</p>
          {b.payment?.status === 1 && (
            <p style={{ margin:'0 0 10px', fontSize:12, color:'#1D4ED8', backgroundColor:'rgba(59,130,246,0.08)', padding:'8px 10px', borderRadius:8, borderLeft:'3px solid #3B82F6' }}>
              Your payment will be refunded within 5–7 business days.
            </p>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => onConfirm(b)} style={s.dangerBtn}>Yes, Cancel</button>
            <button onClick={onDismiss} style={s.confirmNo}>Keep it</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SessionCard ───────────────────────────────────────────────────────────────

function SessionCard({ sb, filter, cancellingId, onCancel, onConfirm, onDismiss }) {
  const isConfirming = cancellingId === sb._id;
  const canCancel    = filter === 'upcoming';

  const addonsTotal = (sb.addons || []).reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const total = (Number(sb.sessionPrice) || 0) + addonsTotal;
  const currency = sb.currencyId === 'USD' ? '$' : sb.currencyId === 'EUR' ? '€' : '₹';

  const ps = (() => {
    const s = sb.paymentStatus;
    if (s === 1) return { label:'Paid',    color:'#10B981', bg:'rgba(16,185,129,0.1)' };
    if (s === 2) return { label:'Pending', color:'#F59E0B', bg:'rgba(245,158,11,0.1)' };
    if (s === 3) return { label:'Failed',  color:'#EF4444', bg:'rgba(239,68,68,0.1)'  };
    return            { label:'Unpaid',  color:'#F59E0B', bg:'rgba(245,158,11,0.1)' };
  })();

  const fmtDate = (d) => {
    if (!d) return '';
    const [y, m, day] = d.split('-').map(Number);
    return `${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]}`;
  };

  const vendorPhone = sb.branchId && sb.branchPhone ? sb.branchPhone : (sb.vendorCountryCode ? `${sb.vendorCountryCode}${sb.vendorPhone}` : sb.vendorPhone);

  return (
    <div style={s.card}>
      {/* Title + badge */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <p style={{ margin:0, fontWeight:800, fontSize:16, color:C.TEXT1, flex:1, marginRight:8 }}>
          {sb.vendorTitle || 'Session Booking'}
        </p>
        <span style={{ ...s.badge, color:ps.color, backgroundColor:ps.bg }}>{ps.label}</span>
      </div>

      {/* Price */}
      <p style={{ margin:'0 0 10px', fontSize:20, fontWeight:900, color:C.PRIMARY }}>{currency}{total}</p>

      {/* Chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
        {sb.date && <span style={s.chip}>📅 {fmtDate(sb.date)}</span>}
        {sb.sessionStartTime && <span style={s.chip}>🕐 {sb.sessionStartTime} – {sb.sessionEndTime}</span>}
        {sb.sessionLabel && <span style={{ ...s.chip, backgroundColor:'#EEF2FF', color:'#4F46E5' }}>{sb.sessionLabel}</span>}
      </div>

      {/* Branch / Employee */}
      {(sb.branchName || sb.employeeName) && (
        <div style={{ marginBottom:10 }}>
          {sb.branchName && <p style={{ margin:'0 0 4px', fontSize:13, color:'#6B7280' }}>🏢 {sb.branchName}</p>}
          {sb.employeeName && <p style={{ margin:0, fontSize:13, color:'#6B7280' }}>👤 {sb.employeeName}</p>}
        </div>
      )}

      {/* Provider contact */}
      <div style={{ borderTop:'1px solid #F3F4F6', paddingTop:10, marginBottom:10 }}>
        <p style={s.secLabel}>SERVICE PROVIDER</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:14, fontWeight:600, color:C.TEXT1 }}>{sb.vendorTitle || '—'}</span>
          <div style={{ display:'flex', gap:12 }}>
            {vendorPhone && <a href={`tel:${vendorPhone}`} style={s.iconLink}><span style={{ fontSize:18 }}>📞</span></a>}
            {sb.vendorEmail && <a href={`mailto:${sb.vendorEmail}`} style={s.iconLink}><span style={{ fontSize:18 }}>✉️</span></a>}
          </div>
        </div>
      </div>

      {/* Actions */}
      {!isConfirming && canCancel && (
        <button onClick={() => onCancel(sb._id)} style={s.dangerBtn}>Cancel</button>
      )}

      {isConfirming && (
        <div style={s.confirmBox}>
          <p style={{ margin:'0 0 10px', fontSize:13, fontWeight:600, color:C.TEXT1 }}>Cancel this session?</p>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => onConfirm(sb)} style={s.dangerBtn}>Yes, Cancel</button>
            <button onClick={onDismiss} style={s.confirmNo}>Keep it</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CarnivalCard ──────────────────────────────────────────────────────────────

function CarnivalCard({ c, navigate }) {
  const statusColor = { ACTIVE:'#10B981', UPCOMING:'#F59E0B', COMPLETED:'#6D28D9', ENDED:'#6B7280', CANCELLED:'#EF4444' }[c.status] || '#6B7280';
  const s = c.couponSummary || {};
  return (
    <div onClick={() => navigate(`/carnival/${c._id}`)}
      style={{ ...cardS.card, cursor:'pointer' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
        <p style={{ margin:0, fontWeight:800, fontSize:16, color:C.TEXT1, flex:1, marginRight:8 }}>🎪 {c.title || c.name}</p>
        <span style={{ fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, color:statusColor, backgroundColor:`${statusColor}1A`, flexShrink:0 }}>
          {c.status}
        </span>
      </div>
      {c.description && <p style={{ margin:'0 0 10px', fontSize:13, color:'#6B7280', lineHeight:1.5 }}>{c.description}</p>}
      {(c.startDate || c.endDate) && (
        <p style={{ margin:'0 0 10px', fontSize:13, color:'#6B7280' }}>
          📅 {c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' }) : ''}
          {c.endDate ? ` – ${new Date(c.endDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}` : ''}
        </p>
      )}
      {s.totalCoupons > 0 && (
        <div style={{ display:'flex', gap:10 }}>
          {[['Total', s.totalCoupons], ['Used', s.usedCoupons || 0], ['Left', s.totalCoupons - (s.usedCoupons || 0)]].map(([label, val]) => (
            <div key={label} style={{ flex:1, backgroundColor:C.PRIMARY_LIGHT, borderRadius:10, padding:'10px 0', textAlign:'center' }}>
              <p style={{ margin:'0 0 2px', fontSize:18, fontWeight:800, color:C.PRIMARY }}>{val}</p>
              <p style={{ margin:0, fontSize:11, color:C.TEXT2, fontWeight:600 }}>{label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
const cardS = { card: { backgroundColor:'#fff', borderRadius:16, padding:'14px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', border:'1px solid #F3F4F6' } };

function Spinner() {
  return <div style={{ width:32, height:32, border:`3px solid ${C.PRIMARY_LIGHT}`, borderTop:`3px solid ${C.PRIMARY}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />;
}

const s = {
  pill:          { padding:'5px 14px', borderRadius:20, border:`1px solid ${C.BORDER}`, background:'none', fontSize:12, fontWeight:600, color:'#6B7280', cursor:'pointer' },
  pillActive:    { backgroundColor:C.PRIMARY, color:'#fff', borderColor:C.PRIMARY },
  center:        { minHeight:300, display:'flex', alignItems:'center', justifyContent:'center' },
  exploreBtn:    { marginTop:12, padding:'10px 24px', borderRadius:12, backgroundColor:C.PRIMARY, color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' },

  card:     { backgroundColor:'#fff', borderRadius:16, padding:'14px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', border:'1px solid #F3F4F6' },
  badge:    { fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, flexShrink:0 },
  chip:     { display:'inline-flex', alignItems:'center', gap:4, fontSize:12, fontWeight:500, padding:'4px 8px', borderRadius:8, backgroundColor:'#F3F4F6', color:'#374151' },
  secLabel: { margin:'0 0 8px', fontSize:11, fontWeight:700, color:'#9CA3AF', letterSpacing:0.8, textTransform:'uppercase' },
  avatar:   { width:28, height:28, borderRadius:14, backgroundColor:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center' },
  iconLink: { textDecoration:'none', lineHeight:1 },

  outlineBtn:  { flex:1, padding:'9px 0', borderRadius:10, border:`1.5px solid ${C.PRIMARY}`, backgroundColor:'transparent', color:C.PRIMARY, fontSize:13, fontWeight:700, cursor:'pointer' },
  dangerBtn:   { flex:1, padding:'9px 0', borderRadius:10, border:`1.5px solid ${C.ERROR}`, backgroundColor:'transparent', color:C.ERROR, fontSize:13, fontWeight:700, cursor:'pointer' },
  primaryBtn:  { flex:1, padding:'9px 0', borderRadius:10, border:'none', backgroundColor:C.PRIMARY, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' },
  confirmNo:   { flex:1, padding:'8px 0', borderRadius:8, backgroundColor:'#F3F4F6', color:C.TEXT1, border:'none', fontSize:13, fontWeight:600, cursor:'pointer' },
  confirmBox:  { backgroundColor:'#FEF2F2', borderRadius:10, padding:'12px 14px', marginTop:8, border:'1px solid #FEC5C5' },
  confirmPrimary: { flex:1, padding:'10px 0', borderRadius:10, backgroundColor:C.PRIMARY, color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' },

  overlay:  { position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  sheet:    { backgroundColor:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, padding:'20px 20px 32px', maxHeight:'80vh', overflowY:'auto' },
  closeBtn: { background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#6B7280', padding:'4px 8px' },
  modalLabel: { margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.8 },
  dateInput:  { width:'100%', padding:'10px 12px', borderRadius:10, border:`1.5px solid ${C.BORDER}`, fontSize:14, color:C.TEXT1, marginBottom:16, boxSizing:'border-box', outline:'none' },
  slotBtn:    { padding:'7px 14px', borderRadius:8, border:`1.5px solid ${C.BORDER}`, backgroundColor:'#F9FAFB', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer' },
  slotBtnActive: { backgroundColor:C.PRIMARY, color:'#fff', borderColor:C.PRIMARY },
};
