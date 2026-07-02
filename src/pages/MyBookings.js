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

const fmtDate = (iso) => {
  if (!iso) return '';
  const [, m, d] = iso.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d} ${months[m-1]}`;
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function MyBookings() {
  const navigate = useNavigate();

  const [filter,        setFilter]        = useState('upcoming');
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all'|'paid'|'unpaid'
  const [all,           setAll]           = useState([]);
  const [sessions,      setSessions]      = useState([]);
  const [myCarnivals,   setMyCarnivals]   = useState([]);
  const [loading,       setLoading]       = useState(true);

  const [mainTab,          setMainTab]          = useState('bookings');
  const [purchases,        setPurchases]        = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError,   setPurchasesError]   = useState(null);

  // Cancel (appointment/token)
  const [cancelConfirm, setCancelConfirm] = useState(null); // booking object
  const [cancellingId,  setCancellingId]  = useState(null);

  // Cancel (session)
  const [sessionCancelConfirm, setSessionCancelConfirm] = useState(null);

  // Review modal
  const [reviewBooking,    setReviewBooking]    = useState(null);
  const [reviewRating,     setReviewRating]     = useState(0);
  const [reviewText,       setReviewText]       = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Appointment reschedule modal
  const [rescheduleBooking,    setRescheduleBooking]    = useState(null);
  const [rescheduleDate,       setRescheduleDate]       = useState('');
  const [rescheduleSlots,      setRescheduleSlots]      = useState([]);
  const [rescheduleTime,       setRescheduleTime]       = useState('');
  const [loadingSlots,         setLoadingSlots]         = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Session reschedule modal
  const [sessionReschedule,          setSessionReschedule]          = useState(null);
  const [sessionRescheduleDate,      setSessionRescheduleDate]      = useState('');
  const [sessionRescheduleReturn,    setSessionRescheduleReturn]    = useState('');
  const [submittingSessionReschedule, setSubmittingSessionReschedule] = useState(false);

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

  const fetchPurchases = useCallback(async () => {
    setPurchasesLoading(true);
    setPurchasesError(null);
    try {
      const res = await api.get('/v1/integration/purchases');
      setPurchases(res.data || []);
    } catch {
      setPurchasesError('Failed to load purchases. Please try again.');
    } finally {
      setPurchasesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mainTab === 'purchases') fetchPurchases();
  }, [mainTab, fetchPurchases]);

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

  const applyPaymentFilter = (list) => {
    if (paymentFilter === 'paid')   return list.filter(b => b.payment?.status === 1);
    if (paymentFilter === 'unpaid') return list.filter(b => b.payment?.status !== 1);
    return list;
  };

  const sorted = [...all].sort((a, b) => new Date(b.startTime || b.date) - new Date(a.startTime || a.date));
  const filtered = applyPaymentFilter(byFilter(sorted, filter));
  const filteredSessions = bySessionFilter(sessions, filter);
  const filteredCarnivals = myCarnivals.filter(c =>
    filter === 'upcoming'  ? c.status === 'ACTIVE'    :
    filter === 'completed' ? c.status === 'COMPLETED' : false
  );

  const tokens       = filtered.filter(b => b.type === 'TOKEN'       || b.tokenNo != null);
  const appointments = filtered.filter(b => b.type === 'APPOINTMENT' && b.tokenNo == null && !b.sessionId);

  // ── Cancel (appointment / token) ─────────────────────────────────────────

  const confirmCancel = async () => {
    const b = cancelConfirm;
    setCancelConfirm(null);
    setCancellingId(b._id);
    try {
      const isToken = b.type === 'TOKEN' || b.tokenNo != null;
      await api.post('/v1/mybookings/cancel', { bookingId: b._id, type: isToken ? 'TOKEN' : 'APPOINTMENT' });
      await fetchBookings();
      toast.success('Booking cancelled.');
    } catch { toast.error('Failed to cancel. Please try again.'); }
    finally { setCancellingId(null); }
  };

  // ── Cancel (session) ──────────────────────────────────────────────────────

  const confirmSessionCancel = async () => {
    const sb = sessionCancelConfirm;
    setSessionCancelConfirm(null);
    try {
      await api.patch(`/v1/session-booking/${sb._id}/cancel`, {});
      await fetchBookings();
      toast.success('Session cancelled.');
    } catch { toast.error('Failed to cancel session.'); }
  };

  // ── Review ────────────────────────────────────────────────────────────────

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

  // ── Appointment reschedule ────────────────────────────────────────────────

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

  // ── Session reschedule ────────────────────────────────────────────────────

  const openSessionReschedule = (sb) => {
    setSessionReschedule(sb);
    setSessionRescheduleDate('');
    setSessionRescheduleReturn('');
  };

  const handleSessionReschedule = async () => {
    if (!sessionRescheduleDate) { toast.warning('Please select a date.'); return; }
    const isTransport = !!sessionReschedule.travelFromDate;
    if (isTransport && !sessionRescheduleReturn) { toast.warning('Please select a return date.'); return; }
    setSubmittingSessionReschedule(true);
    try {
      await api.patch(`/v1/session-booking/${sessionReschedule._id}/reschedule`, {
        newDate: sessionRescheduleDate,
        ...(isTransport && { travelFromDate: sessionRescheduleDate, travelToDate: sessionRescheduleReturn }),
      });
      await fetchBookings();
      setSessionReschedule(null);
      toast.success('Session rescheduled!');
    } catch { toast.error('Failed to reschedule session.'); }
    finally { setSubmittingSessionReschedule(false); }
  };

  // ── Modals ────────────────────────────────────────────────────────────────

  const CancelModal = ({ b, onConfirm, onDismiss }) => {
    const isPaid = b.payment?.status === 1;
    return (
      <div style={s.overlay}>
        <div style={{ ...s.modal, maxWidth: 360 }}>
          <p style={{ margin:'0 0 10px', fontSize:17, fontWeight:800, color:C.TEXT1 }}>Confirm Cancellation</p>
          <p style={{ margin:'0 0 14px', fontSize:14, color:'#6B7280' }}>Are you sure you want to cancel this booking?</p>
          {isPaid && (
            <div style={{ backgroundColor:'rgba(59,130,246,0.08)', borderLeft:'3px solid #3B82F6', borderRadius:8, padding:'10px 12px', marginBottom:14 }}>
              <p style={{ margin:0, fontSize:12, color:'#1D4ED8', lineHeight:1.6 }}>
                Your payment will be refunded to your original payment method within 5–7 business days.
              </p>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={onDismiss} style={s.confirmNo}>No, Keep It</button>
            <button onClick={onConfirm} style={{ ...s.dangerBtn, flex:1 }}>Yes, Cancel</button>
          </div>
        </div>
      </div>
    );
  };

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
          <p style={s.modalLabel}>Rating</p>
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setReviewRating(n)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:28 }}>
                <span style={{ color: n <= reviewRating ? '#FBBF24' : '#D1D5DB' }}>★</span>
              </button>
            ))}
          </div>
          <p style={s.modalLabel}>Your Review</p>
          <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..."
            rows={4} style={{ ...s.dateInput, resize:'vertical', fontFamily:'inherit' }} />
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button onClick={submitReview} disabled={submittingReview}
              style={{ ...s.confirmPrimary, opacity: submittingReview ? 0.5 : 1 }}>
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
            style={s.dateInput} />
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

  const SessionRescheduleModal = () => {
    if (!sessionReschedule) return null;
    const isTransport = !!sessionReschedule.travelFromDate;
    const todayStr = new Date().toISOString().split('T')[0];
    const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 12);
    return (
      <div style={s.overlay}>
        <div style={s.sheet}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ margin:0, fontSize:17, fontWeight:800, color:C.TEXT1 }}>Reschedule Session</h3>
            <button onClick={() => setSessionReschedule(null)} style={s.closeBtn}>✕</button>
          </div>
          <p style={{ margin:'0 0 4px', fontSize:13, fontWeight:600, color:C.TEXT1 }}>{sessionReschedule.vendorTitle}</p>
          <p style={{ margin:'0 0 14px', fontSize:12, color:'#6B7280' }}>
            {sessionReschedule.sessionLabel} · {sessionReschedule.sessionStartTime}–{sessionReschedule.sessionEndTime}
            {' '}· Current: {sessionReschedule.date}
          </p>
          <p style={s.modalLabel}>New Date</p>
          <input type="date" value={sessionRescheduleDate} min={todayStr} max={maxDate.toISOString().split('T')[0]}
            onChange={e => setSessionRescheduleDate(e.target.value)} style={s.dateInput} />
          {isTransport && (
            <>
              <p style={s.modalLabel}>Return Date</p>
              <input type="date" value={sessionRescheduleReturn} min={sessionRescheduleDate || todayStr} max={maxDate.toISOString().split('T')[0]}
                onChange={e => setSessionRescheduleReturn(e.target.value)} style={s.dateInput} />
            </>
          )}
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button onClick={handleSessionReschedule}
              disabled={submittingSessionReschedule || !sessionRescheduleDate || (isTransport && !sessionRescheduleReturn)}
              style={{ ...s.confirmPrimary, opacity: (!sessionRescheduleDate || (isTransport && !sessionRescheduleReturn)) ? 0.5 : 1 }}>
              {submittingSessionReschedule ? 'Saving…' : 'Confirm'}
            </button>
            <button onClick={() => setSessionReschedule(null)} style={s.confirmNo}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      {cancelConfirm && (
        <CancelModal b={cancelConfirm} onConfirm={confirmCancel} onDismiss={() => setCancelConfirm(null)} />
      )}
      {sessionCancelConfirm && (
        <CancelModal b={sessionCancelConfirm} onConfirm={confirmSessionCancel} onDismiss={() => setSessionCancelConfirm(null)} />
      )}
      <ReviewModal />
      <RescheduleModal />
      <SessionRescheduleModal />

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── Main Tab Switcher ── */}
        <div style={{ display:'flex', backgroundColor:'#F3F4F6', borderRadius:12, padding:4, marginBottom:16 }}>
          {['bookings','purchases'].map(tab => (
            <button key={tab} onClick={() => setMainTab(tab)}
              style={{
                flex:1, padding:'9px 0', borderRadius:10, border:'none', cursor:'pointer',
                fontSize:14, fontWeight:700,
                backgroundColor: mainTab === tab ? '#fff' : 'transparent',
                color: mainTab === tab ? C.PRIMARY : '#6B7280',
                boxShadow: mainTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {tab === 'bookings' ? 'My Bookings' : 'Purchases'}
            </button>
          ))}
        </div>

        {/* ── Bookings Tab ── */}
        {mainTab === 'bookings' && (
          <>
            {/* Filter tabs */}
            <div style={{ display:'flex', gap:6, marginBottom:10, overflowX:'auto', paddingBottom:2 }}>
              {FILTER_TABS.map(t => (
                <button key={t} onClick={() => setFilter(t)}
                  style={{ ...s.pill, ...(filter === t ? s.pillActive : {}), whiteSpace:'nowrap' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Payment filter — shown only on upcoming tab */}
            {filter === 'upcoming' && (
              <div style={{ display:'flex', gap:6, marginBottom:14 }}>
                {['all','paid','unpaid'].map(p => (
                  <button key={p} onClick={() => setPaymentFilter(p)}
                    style={{ ...s.pillSm, ...(paymentFilter === p ? s.pillSmActive : {}) }}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            )}

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

                {/* Carnivals */}
                {filteredCarnivals.length > 0 && (
                  <Section label={filter === 'completed' ? '🏁 Carnivals' : '🎪 Carnivals'}>
                    {filteredCarnivals.map(c => <CarnivalCard key={c._id} c={c} navigate={navigate} />)}
                  </Section>
                )}

                {/* Tokens */}
                {tokens.length > 0 && (
                  <Section label="Tokens">
                    {tokens.map(b => (
                      <BookingCard key={b._id} b={b} filter={filter}
                        cancellingId={cancellingId}
                        onCancel={setCancelConfirm}
                        onReschedule={openReschedule}
                        onReview={(b) => { setReviewBooking(b); setReviewRating(0); setReviewText(''); }}
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
                        onCancel={setCancelConfirm}
                        onReschedule={openReschedule}
                        onReview={(b) => { setReviewBooking(b); setReviewRating(0); setReviewText(''); }}
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
                        onCancel={setSessionCancelConfirm}
                        onReschedule={openSessionReschedule}
                      />
                    ))}
                  </Section>
                )}

              </div>
            )}
          </>
        )}

        {/* ── Purchases Tab ── */}
        {mainTab === 'purchases' && (
          <div style={{ paddingBottom:80 }}>
            {purchasesLoading ? (
              <div style={s.center}><Spinner /></div>
            ) : purchasesError ? (
              <div style={{ ...s.card, border:'1px solid #FEE2E2', marginBottom:12 }}>
                <p style={{ color:'#EF4444', fontSize:13, margin:'0 0 8px' }}>{purchasesError}</p>
                <button onClick={fetchPurchases} style={{ ...s.outlineBtn, flex:'none', padding:'6px 16px' }}>Retry</button>
              </div>
            ) : purchases.length === 0 ? (
              <div style={s.center}>
                <div style={{ textAlign:'center' }}>
                  <p style={{ fontSize:40 }}>🛍️</p>
                  <p style={{ fontWeight:700, fontSize:17, color:C.TEXT1, margin:'0 0 6px' }}>No Purchases Yet</p>
                  <p style={{ color:'#6B7280', fontSize:13, lineHeight:1.6 }}>Show your QR code at any Onezy-integrated shop. Your purchases will appear here automatically.</p>
                </div>
              </div>
            ) : (
              <div className="app-grid">
                {purchases.map(item => {
                  const currSymbol = item.currency === 'INR' ? '₹' : '$';
                  const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '';
                  const timeStr = item.date ? new Date(item.date).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : '';
                  const meta = [item.storeCategory, dateStr, timeStr].filter(Boolean).join('  ·  ');
                  return (
                    <PurchaseCard key={item._id} item={item} currSymbol={currSymbol} meta={meta}
                      onDelete={(id) => setPurchases(prev => prev.filter(p => p._id !== id))} />
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
}

// ── PurchaseCard ──────────────────────────────────────────────────────────────

function PurchaseCard({ item, currSymbol, meta, onDelete }) {
  const [expanded, setExpanded] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this purchase record?')) return;
    setDeleting(true);
    try {
      await api.delete(`/v1/integration/purchases/${item._id}`);
      onDelete(item._id);
    } catch {
      toast.error('Failed to delete purchase.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div onClick={() => setExpanded(e => !e)}
      style={{ ...s.card, cursor:'pointer', borderLeft:'4px solid #511f9f' }}>
      {/* Store name + branch */}
      <div style={{ display:'flex', alignItems:'flex-start', marginBottom:6 }}>
        <span style={{ fontSize:22, marginRight:10, lineHeight:1.2 }}>{item.emoji || '🧾'}</span>
        <div style={{ flex:1 }}>
          <p style={{ margin:0, fontWeight:800, fontSize:15, color:C.TEXT1 }}>
            {item.storeName}
            {item.storeBranch && <span style={{ fontWeight:500, color:'#6B7280' }}> — {item.storeBranch}</span>}
          </p>
          <p style={{ margin:'3px 0 0', fontSize:12, color:'#6B7280' }}>{meta}</p>
        </div>
      </div>
      {/* Items · amount */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
        <span style={{ fontSize:12, color:'#374151' }}>
          {item.itemCount > 0 ? `${item.itemCount} item${item.itemCount > 1 ? 's' : ''}` : ''}
          {item.itemCount > 0 && item.paymentMode ? '  ·  ' : ''}
          {item.paymentMode || ''}
        </span>
        <span style={{ fontSize:16, fontWeight:900, color:C.PRIMARY }}>{currSymbol}{(item.totalAmount||0).toLocaleString('en-IN')}</span>
      </div>
      {/* Expanded item breakdown */}
      {expanded && (
        <div style={{ borderTop:'1px solid #F3F4F6', marginTop:10, paddingTop:10 }}>
          {item.items && item.items.map((li, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'5px 0' }}>
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:600, color:C.TEXT1 }}>{li.name}</p>
                {li.quantity > 1 && <p style={{ margin:0, fontSize:11, color:'#6B7280' }}>{li.quantity} × {currSymbol}{li.unitPrice?.toLocaleString('en-IN')}</p>}
              </div>
              <span style={{ fontSize:13, fontWeight:700, color:C.TEXT1 }}>{currSymbol}{(li.totalPrice||0).toLocaleString('en-IN')}</span>
            </div>
          ))}
          {item.billNo && <p style={{ margin:'8px 0 0', fontSize:11, color:'#9CA3AF' }}>Bill No: {item.billNo}</p>}
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ marginTop:12, padding:'6px 14px', borderRadius:8, border:'1.5px solid #EF4444', background:'none', color:'#EF4444', fontSize:12, fontWeight:600, cursor:'pointer' }}
          >
            {deleting ? 'Deleting…' : 'Delete Record'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin:'0 0 10px', fontSize:15, fontWeight:700, color:'#6B7280' }}>{label}</p>
      <div className="app-grid">{children}</div>
    </div>
  );
}

// ── BookingCard ───────────────────────────────────────────────────────────────

function BookingCard({ b, filter, cancellingId, onCancel, onReschedule, onReview, navigate }) {
  const isLoading = cancellingId === b._id;
  const isToken   = b.type === 'TOKEN' || b.tokenNo != null;
  const payBadge  = PAYMENT_BADGE[b.payment?.status] || (b.payment?.price > 0 ? UNPAID_BADGE : null);

  const dateObj = b.startTime ? new Date(b.startTime) : b.date ? new Date(b.date) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) : null;
  const timeStr = (!isToken && dateObj) ? dateObj.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : b.time || null;

  let queueMsg = null, queueColor = '#3B82F6';
  if (isToken && b.tokenNo) {
    const ahead = b.lastCompletedTokenNo ? b.tokenNo - b.lastCompletedTokenNo - 1 : null;
    if (!b.lastCompletedTokenNo) { queueMsg = 'Waiting – No tokens served yet'; }
    else if (ahead <= 0) { queueMsg = 'Your turn is now!'; queueColor = '#10B981'; }
    else { queueMsg = `${ahead} token${ahead > 1 ? 's' : ''} ahead of you`; queueColor = '#F59E0B'; }
  }

  const mapQuery = [b.serviceaddressLine1 || b.branchAddressLine1, b.serviceCity || b.branchCity, b.serviceState].filter(Boolean).join(', ');

  const canCancel    = filter === 'upcoming' && (b.status?.toUpperCase() === 'ACTIVE' || b.status?.toUpperCase() === 'PENDING');
  const canReschedule = canCancel && !isToken && !b.isWalkIn;
  const canReview    = filter === 'completed' && !isToken;

  // Subscription label
  const termMap = { 'ONE-MONTH':'1 Month', 'THREE-MONTH':'3 Months', 'SIX-MONTH':'6 Months', 'YEARLY':'1 Year' };
  const termLabel = termMap[b.term] || null;

  return (
    <div style={{ ...s.card, borderLeft: `4px solid ${C.PRIMARY}`, opacity: isLoading ? 0.6 : 1 }}>
      {/* Name + badge */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <p style={{ margin:0, fontWeight:800, fontSize:16, color:C.TEXT1, flex:1, marginRight:8 }}>
          {b.serviceName || b.serviceProviderName || 'Service Provider'}
        </p>
        {payBadge && !b.isWalkIn && (
          <span style={{ ...s.badge, color:payBadge.color, backgroundColor:payBadge.bg }}>{payBadge.label}</span>
        )}
      </div>

      {/* Price */}
      {b.payment?.price > 0 && !b.isWalkIn && (
        <p style={{ margin:'0 0 10px', fontSize:20, fontWeight:900, color:C.PRIMARY }}>₹{b.payment.price}</p>
      )}

      {/* Chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
        {dateStr && <span style={s.chip}>📅 {dateStr}</span>}
        {timeStr && <span style={s.chip}>🕐 {timeStr}</span>}
        {b.tokenNo && <span style={{ ...s.chip, backgroundColor:'#3B82F6', color:'#fff', fontWeight:700 }}>Token #{b.tokenNo}</span>}
        {b.isWalkIn && <span style={{ ...s.chip, backgroundColor:'#FEF3C7', color:'#D97706' }}>Walk-in</span>}
        {termLabel && <span style={{ ...s.chip, backgroundColor:'#EEF2FF', color:'#4F46E5' }}>{termLabel}</span>}
        {b.serviceType && (
          <span style={{ ...s.chip,
            backgroundColor: b.serviceType === 'virtual' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)',
            color:           b.serviceType === 'virtual' ? '#1D4ED8'              : '#166534' }}>
            {b.serviceType === 'virtual' ? '🌐 Virtual' : '📍 In-Person'}
          </span>
        )}
      </div>

      {/* Provider */}
      <div style={{ borderTop:'1px solid #F3F4F6', paddingTop:10, marginBottom:10 }}>
        <p style={s.secLabel}>SERVICE PROVIDER</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={s.iconCircle}><span style={{ fontSize:14 }}>👤</span></div>
            <span style={{ fontSize:14, fontWeight:600, color:C.TEXT1 }}>{b.serviceProviderName || '—'}</span>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            {b.serviceProviderPhone && <a href={`tel:${b.serviceProviderPhone}`} style={s.iconLink}><span style={{ fontSize:18 }}>📞</span></a>}
            {b.serviceProviderEmail && <a href={`mailto:${b.serviceProviderEmail}`} style={s.iconLink}><span style={{ fontSize:18 }}>✉️</span></a>}
            {mapQuery && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener noreferrer" style={s.iconLink}><span style={{ fontSize:18 }}>📍</span></a>}
          </div>
        </div>
      </div>

      {/* Branch */}
      {b.branchName && (
        <div style={{ marginBottom:10 }}>
          <p style={s.secLabel}>VISIT LOCATION</p>
          <div style={{ backgroundColor:'rgba(99,102,241,0.06)', borderRadius:10, padding:'10px 12px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ margin:'0 0 2px', fontWeight:700, fontSize:14, color:C.TEXT1 }}>🏢 {b.branchName}</p>
                {(b.branchAddressLine1 || b.branchCity) && (
                  <p style={{ margin:0, fontSize:12, color:'#6B7280' }}>
                    {[b.branchAddressLine1, b.branchCity, b.branchState, b.branchPincode].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {b.branchPhone && <a href={`tel:${b.branchPhone}`} style={s.iconLink}><span style={{ fontSize:18 }}>📞</span></a>}
                {(b.branchAddressLine1 || b.branchCity) && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([b.branchAddressLine1, b.branchCity, b.branchState].filter(Boolean).join(', '))}`}
                    target="_blank" rel="noopener noreferrer" style={s.iconLink}><span style={{ fontSize:18 }}>📍</span></a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staff */}
      {b.employeeName && (
        <p style={{ margin:'0 0 10px', fontSize:13, color:'#6B7280' }}>👤 Staff: <strong style={{ color:C.TEXT1 }}>{b.employeeName}</strong></p>
      )}

      {/* Meet link */}
      {b.serviceType === 'virtual' && b.meetLink && (
        <a href={b.meetLink} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:13, color:'#10B981', textDecoration:'none', marginBottom:10 }}>
          <span style={{ width:8, height:8, borderRadius:4, backgroundColor:'#10B981', display:'inline-block' }} />
          Join Meeting
        </a>
      )}

      {/* Queue */}
      {queueMsg && (
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 10px', borderRadius:10, border:`1px solid ${queueColor}40`, backgroundColor:`${queueColor}10`, marginBottom:10 }}>
          <span>⏳</span>
          <span style={{ fontSize:13, fontWeight:600, color:queueColor }}>{queueMsg}</span>
          {b.lastCompletedTokenNo > 0 && (
            <span style={{ fontSize:11, color:'#9CA3AF', marginLeft:4 }}>Last served: #{b.lastCompletedTokenNo}</span>
          )}
        </div>
      )}

      {/* Refund status */}
      {filter === 'cancelled' && b.payment?.status === 1 && (
        <div style={{ marginBottom:10 }}>
          {b.payment.refund?.refunded
            ? <span style={{ ...s.badge, color:'#065F46', backgroundColor:'rgba(16,185,129,0.1)' }}>Refund Processed</span>
            : b.payment.refund?.refundPending
              ? <span style={{ ...s.badge, color:'#92400E', backgroundColor:'rgba(245,158,11,0.1)' }}>Refund Pending</span>
              : <span style={{ ...s.badge, color:'#1D4ED8', backgroundColor:'rgba(59,130,246,0.1)' }}>Refund Initiated</span>
          }
        </div>
      )}

      {/* Actions */}
      <div style={{ display:'flex', gap:8 }}>
        {canReschedule && <button onClick={() => onReschedule(b)} style={s.outlineBtn}>Reschedule</button>}
        {canCancel && <button onClick={() => onCancel(b)} style={s.dangerBtn}>Cancel</button>}
        {canReview && <button onClick={() => onReview(b)} style={s.primaryBtn}>Review</button>}
        {canReview && <button onClick={() => navigate(`/sp/${b.serviceProviderId || b.serviceId}`)} style={s.outlineBtn}>Book Again</button>}
      </div>
    </div>
  );
}

// ── SessionCard ───────────────────────────────────────────────────────────────

function SessionCard({ sb, filter, onCancel, onReschedule }) {
  const addonsTotal = (sb.addons || []).reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const total = (Number(sb.sessionPrice) || 0) + addonsTotal;
  const currency = sb.currencyId === 'USD' ? '$' : sb.currencyId === 'EUR' ? '€' : '₹';
  const ps = (() => {
    const st = sb.paymentStatus;
    if (st === 1) return { label:'Paid',    color:'#10B981', bg:'rgba(16,185,129,0.1)' };
    if (st === 2) return { label:'Pending', color:'#F59E0B', bg:'rgba(245,158,11,0.1)' };
    if (st === 3) return { label:'Failed',  color:'#EF4444', bg:'rgba(239,68,68,0.1)'  };
    return            { label:'Unpaid',  color:'#F59E0B', bg:'rgba(245,158,11,0.1)' };
  })();
  const vendorPhone = sb.branchId && sb.branchPhone ? sb.branchPhone : (sb.vendorCountryCode ? `${sb.vendorCountryCode}${sb.vendorPhone}` : sb.vendorPhone);
  const hasAddr = sb.branchId ? (sb.branchAddressLine1 || sb.branchCity) : (sb.vendorAddressLine1 || sb.vendorCity);
  const addrStr = sb.branchId
    ? [sb.branchAddressLine1, sb.branchCity, sb.branchState].filter(Boolean).join(', ')
    : [sb.vendorAddressLine1, sb.vendorAddressLine2, sb.vendorCity, sb.vendorState].filter(Boolean).join(', ');

  const canAct = sb.status === 'booked';

  return (
    <div style={{ ...s.card, borderLeft: `4px solid #6366F1` }}>
      {/* Title + badge */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
        <p style={{ margin:0, fontWeight:800, fontSize:16, color:C.TEXT1, flex:1, marginRight:8 }}>
          {sb.vendorTitle || 'Session Booking'}
        </p>
        <span style={{ ...s.badge, color:ps.color, backgroundColor:ps.bg }}>{ps.label}</span>
      </div>

      {/* Price */}
      <p style={{ margin:'0 0 10px', fontSize:20, fontWeight:900, color:'#6366F1' }}>{currency}{total}</p>

      {/* Chips */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
        {sb.date && <span style={s.chip}>📅 {fmtDate(sb.date)}</span>}
        {sb.sessionStartTime && <span style={s.chip}>🕐 {sb.sessionStartTime}–{sb.sessionEndTime}</span>}
        {sb.sessionLabel && <span style={{ ...s.chip, backgroundColor:'#EEF2FF', color:'#4F46E5' }}>{sb.sessionLabel}</span>}
      </div>

      {/* Transport travel details */}
      {(sb.fromLocation?.text || sb.travelFromDate) && (
        <div style={{ backgroundColor:'rgba(22,163,74,0.07)', border:'1px solid #86EFAC', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
          {sb.travelFromDate && <p style={{ margin:'0 0 4px', fontSize:13, color:'#15803D' }}>📅 {sb.travelFromDate} → {sb.travelToDate}</p>}
          {sb.travelFromTime && <p style={{ margin:'0 0 4px', fontSize:13, color:'#15803D' }}>🕐 {sb.travelFromTime} → {sb.travelToTime}</p>}
          {sb.fromLocation?.text && <p style={{ margin:'0 0 4px', fontSize:13, color:'#15803D' }}>🔵 {sb.fromLocation.text}</p>}
          {sb.toLocation?.text   && <p style={{ margin:0,        fontSize:13, color:'#15803D' }}>🔴 {sb.toLocation.text}</p>}
        </div>
      )}

      {/* Branch / Employee */}
      {(sb.branchName || sb.employeeName) && (
        <div style={{ backgroundColor:'rgba(99,102,241,0.06)', borderRadius:10, padding:'10px 12px', marginBottom:12 }}>
          {sb.branchName && (
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: sb.employeeName ? 6 : 0 }}>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:C.TEXT1 }}>🏢 {sb.branchName}</p>
              <div style={{ display:'flex', gap:8 }}>
                {sb.branchPhone && <a href={`tel:${sb.branchPhone}`} style={s.iconLink}><span style={{ fontSize:16 }}>📞</span></a>}
                {(sb.branchAddressLine1 || sb.branchCity) && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([sb.branchAddressLine1, sb.branchCity, sb.branchState].filter(Boolean).join(', '))}`}
                    target="_blank" rel="noopener noreferrer" style={s.iconLink}><span style={{ fontSize:16 }}>📍</span></a>
                )}
              </div>
            </div>
          )}
          {sb.employeeName && <p style={{ margin:0, fontSize:13, color:'#6B7280' }}>👤 {sb.employeeName}</p>}
        </div>
      )}

      {/* Provider contact */}
      <div style={{ borderTop:'1px solid #F3F4F6', paddingTop:10, marginBottom:10 }}>
        <p style={s.secLabel}>SERVICE PROVIDER</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:14, fontWeight:600, color:C.TEXT1 }}>{sb.vendorTitle || '—'}</span>
          <div style={{ display:'flex', gap:10 }}>
            {vendorPhone && <a href={`tel:${vendorPhone}`} style={s.iconLink}><span style={{ fontSize:18 }}>📞</span></a>}
            {sb.vendorEmail && <a href={`mailto:${sb.vendorEmail}`} style={s.iconLink}><span style={{ fontSize:18 }}>✉️</span></a>}
            {hasAddr && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addrStr)}`} target="_blank" rel="noopener noreferrer" style={s.iconLink}><span style={{ fontSize:18 }}>📍</span></a>}
          </div>
        </div>
      </div>

      {/* Actions */}
      {canAct && filter === 'upcoming' && (
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => onReschedule(sb)} style={s.outlineBtn}>Reschedule</button>
          <button onClick={() => onCancel(sb)} style={s.dangerBtn}>Cancel</button>
        </div>
      )}
    </div>
  );
}

// ── CarnivalCard ──────────────────────────────────────────────────────────────

function CarnivalCard({ c, navigate }) {
  const statusColor = { ACTIVE:'#10B981', UPCOMING:'#F59E0B', COMPLETED:'#511f9f', ENDED:'#6B7280', CANCELLED:'#EF4444' }[c.status] || '#6B7280';
  const cs = c.couponSummary || {};
  return (
    <div onClick={() => navigate(`/carnival/${c._id}`)} style={{ ...s.card, cursor:'pointer', borderLeft:`4px solid ${statusColor}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <p style={{ margin:0, fontWeight:800, fontSize:16, color:C.TEXT1, flex:1, marginRight:8 }}>
          🎪 {c.title || c.name}
        </p>
        <span style={{ ...s.badge, color:statusColor, backgroundColor:`${statusColor}1A` }}>{c.status}</span>
      </div>
      {c.description && <p style={{ margin:'0 0 8px', fontSize:13, color:'#6B7280', lineHeight:1.5 }}>{c.description}</p>}
      {c.location?.city && <p style={{ margin:'0 0 8px', fontSize:12, color:'#6B7280' }}>📍 {c.location.venueName || c.location.city}</p>}
      {(c.startDate || c.endDate) && (
        <p style={{ margin:'0 0 10px', fontSize:13, color:'#6B7280' }}>
          📅 {c.startDate && new Date(c.startDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}
          {c.endDate && ` – ${new Date(c.endDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}`}
        </p>
      )}
      {(cs.active != null || cs.totalValue != null) && (
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:13, color:'#10B981', fontWeight:600 }}>{cs.active ?? 0} Active</span>
          <span style={{ color:'#D1D5DB' }}>•</span>
          <span style={{ fontSize:13, color:'#6B7280' }}>{cs.used ?? 0} Used</span>
          <span style={{ color:'#D1D5DB' }}>•</span>
          <span style={{ fontSize:13, color:C.TEXT1, fontWeight:600 }}>₹{cs.totalValue ?? 0}</span>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div style={{ width:32, height:32, border:`3px solid ${C.PRIMARY_LIGHT}`, borderTop:`3px solid ${C.PRIMARY}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = {
  pill:         { padding:'5px 14px', borderRadius:20, border:`1px solid ${C.BORDER}`, background:'none', fontSize:12, fontWeight:600, color:'#6B7280', cursor:'pointer' },
  pillActive:   { backgroundColor:C.PRIMARY, color:'#fff', borderColor:C.PRIMARY },
  pillSm:       { padding:'4px 12px', borderRadius:16, border:'1px solid #E5E7EB', background:'none', fontSize:11, fontWeight:600, color:'#6B7280', cursor:'pointer' },
  pillSmActive: { backgroundColor:'#EEF2FF', color:'#4F46E5', borderColor:'#C7D2FE', fontWeight:700 },
  center:       { minHeight:300, display:'flex', alignItems:'center', justifyContent:'center' },
  exploreBtn:   { marginTop:12, padding:'10px 24px', borderRadius:12, backgroundColor:C.PRIMARY, color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' },

  card:     { backgroundColor:'#fff', borderRadius:16, padding:'14px', boxShadow:'0 2px 10px rgba(0,0,0,0.06)', border:'1px solid #F3F4F6' },
  badge:    { fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:20, flexShrink:0 },
  chip:     { display:'inline-flex', alignItems:'center', gap:4, fontSize:12, fontWeight:500, padding:'4px 8px', borderRadius:8, backgroundColor:'#F3F4F6', color:'#374151' },
  secLabel: { margin:'0 0 8px', fontSize:11, fontWeight:700, color:'#9CA3AF', letterSpacing:0.8, textTransform:'uppercase' },
  iconCircle: { width:28, height:28, borderRadius:14, backgroundColor:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center' },
  iconLink: { textDecoration:'none', lineHeight:1 },

  outlineBtn:  { flex:1, padding:'9px 0', borderRadius:10, border:`1.5px solid ${C.PRIMARY}`, backgroundColor:'transparent', color:C.PRIMARY, fontSize:13, fontWeight:700, cursor:'pointer' },
  dangerBtn:   { flex:1, padding:'9px 0', borderRadius:10, border:'1.5px solid #EF4444', backgroundColor:'transparent', color:'#EF4444', fontSize:13, fontWeight:700, cursor:'pointer' },
  primaryBtn:  { flex:1, padding:'9px 0', borderRadius:10, border:'none', backgroundColor:C.PRIMARY, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' },
  confirmNo:   { flex:1, padding:'10px 0', borderRadius:8, backgroundColor:'#F3F4F6', color:C.TEXT1, border:`1px solid ${C.BORDER}`, fontSize:13, fontWeight:600, cursor:'pointer' },
  confirmPrimary: { flex:1, padding:'10px 0', borderRadius:10, backgroundColor:C.PRIMARY, color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' },

  overlay:  { position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'flex-end', justifyContent:'center' },
  sheet:    { backgroundColor:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, padding:'20px 20px 32px', maxHeight:'80vh', overflowY:'auto' },
  modal:    { backgroundColor:'#fff', borderRadius:20, width:'calc(100% - 48px)', padding:'28px 24px', display:'flex', flexDirection:'column', gap:8 },
  closeBtn: { background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#6B7280', padding:'4px 8px' },
  modalLabel: { margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:0.8 },
  dateInput:  { width:'100%', padding:'10px 12px', borderRadius:10, border:`1.5px solid ${C.BORDER}`, fontSize:14, color:C.TEXT1, marginBottom:16, boxSizing:'border-box', outline:'none' },
  slotBtn:    { padding:'7px 14px', borderRadius:8, border:`1.5px solid ${C.BORDER}`, backgroundColor:'#F9FAFB', color:'#374151', fontSize:13, fontWeight:600, cursor:'pointer' },
  slotBtnActive: { backgroundColor:C.PRIMARY, color:'#fff', borderColor:C.PRIMARY },
};
