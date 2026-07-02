import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';
import { toast } from 'react-toastify';
import LoginModal from '../components/LoginModal';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_KEYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function SpProfile() {
  const { spId } = useParams();
  const navigate = useNavigate();
  const { state: navState } = useLocation();
  const { user, isLoggedIn } = useAuth();

  const [sp, setSp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [favId, setFavId] = useState(null);
  const [favLoading, setFavLoading] = useState(false);

  // Reviews
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviews, setReviews] = useState([]);

  // Appointment flow
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Token flow
  const [tokenDates, setTokenDates] = useState([]);
  const [selectedTokenDate, setSelectedTokenDate] = useState(null);
  const [availableTokens, setAvailableTokens] = useState(0);
  const [nextToken, setNextToken] = useState(1);
  const [checkingTokens, setCheckingTokens] = useState(false);
  const [bookingToken, setBookingToken] = useState(false);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  // ── Resume token booking after branch selection ───────────────────────────
  useEffect(() => {
    if (navState?.resumeTokenBranch && sp) {
      const { tokenDate, resumeTokenBranch, ...branchParams } = navState;
      handleBookToken(branchParams, tokenDate ? new Date(tokenDate) : null);
    }
  }, [navState, sp]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load provider + reviews + favourites ──────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        // Public calls — no login required, never redirect on 401
        const spRes = await api.open(`/v1/serviceproviders/${spId}`);
        if (spRes.success && spRes.provider) {
          const p = spRes.provider;
          setSp(p);
          if (p.option === 'token') buildTokenDates(p.token?.day || []);
          else if (p.option === 'appointment') setSelectedDate(new Date());
        }

        const [ratingRes, reviewsRes] = await Promise.all([
          api.open(`/v1/reviews/serviceProvider/rating/${spId}`),
          api.open(`/v1/reviews/service/${spId}`),
        ]);
        if (ratingRes.avgRating !== undefined) {
          setAvgRating(ratingRes.avgRating || 0);
          setTotalReviews(ratingRes.totalReviews || 0);
        }
        if (reviewsRes.reviews) setReviews(reviewsRes.reviews);

        // Favourites — only if logged in
        if (isLoggedIn && user?._id) {
          const favRes = await api.get(`/v1/favourites?userId=${user._id}`);
          const list = favRes.data || favRes.favourites || [];
          const found = list.find(f => f.serviceProviderId === spId && !f.isDeleted);
          if (found) { setIsFav(true); setFavId(found._id); }
        }
      } finally { setLoading(false); }
    };
    load();
  }, [spId, user?._id, isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Appointment: fetch slots when date changes ────────────────────────────
  useEffect(() => {
    if (!selectedDate || !sp || sp.option !== 'appointment') return;
    const dur = sp.appointment?.duration || 60;
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    setLoadingSlots(true);
    setSelectedTime(null);
    api.open(`/v1/appointments/available-slots?date=${dateStr}&serviceProviderId=${spId}&duration=${dur}`)
      .then(r => {
        let list = r.slots || [];
        const isToday = selectedDate.getTime() === today.getTime();
        if (isToday) {
          const now = new Date();
          const cur = now.getHours() * 60 + now.getMinutes();
          list = list.filter(s => {
            const [h, m] = s.time.split(':').map(Number);
            return (h * 60 + m) > cur && s.available !== false;
          });
        } else {
          list = list.filter(s => s.available !== false);
        }
        setSlots(list);
        if (list.length > 0) setSelectedTime(list[0].time);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, sp, spId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Token: check availability when date selected ──────────────────────────
  useEffect(() => {
    if (!selectedTokenDate || !sp || sp.option !== 'token') return;
    setCheckingTokens(true);
    api.open(`/v1/tokens/service-provider/${spId}`).then(r => {
      const list = Array.isArray(r) ? r : (r.data || []);
      const dateStr = fmt(selectedTokenDate);
      const todayTokens = list.filter(t => {
        const td = new Date(t.date); td.setHours(0,0,0,0);
        return fmt(td) === dateStr && t.status === 'ACTIVE';
      });
      const max = sp.token?.tokensPerDay || 50;
      setAvailableTokens(Math.max(0, max - todayTokens.length));
      setNextToken(todayTokens.length + 1);
    }).catch(() => setAvailableTokens(0))
      .finally(() => setCheckingTokens(false));
  }, [selectedTokenDate, sp, spId]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildTokenDates = (opDays) => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dn = DAY_KEYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
      dates.push({ date: d, avail: opDays.includes(dn), label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), dayName: dn });
    }
    setTokenDates(dates);
    const first = dates.find(d => d.avail);
    if (first) setSelectedTokenDate(first.date);
  };

  const [showLogin, setShowLogin] = useState(false);
  const pendingAction = useRef(null);

  // Shows login modal if not logged in; runs action immediately if already logged in
  const requireLogin = (action) => {
    if (isLoggedIn) { action(); return; }
    pendingAction.current = action;
    setShowLogin(true);
  };

  // ── Favourites toggle ─────────────────────────────────────────────────────

  const toggleFav = async () => {
    if (!isLoggedIn) { requireLogin(toggleFav); return; }
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isFav && favId) {
        await api.patch(`/v1/favourites/${favId}`, { isDeleted: true, updatedBy: user._id });
        setIsFav(false); setFavId(null);
        localStorage.setItem('cs_hasFavs', '0');
      } else {
        const res = await api.post('/v1/favourites', { serviceProviderId: spId, userId: user._id, createdBy: user._id });
        if (res.success || res._id) {
          setIsFav(true); setFavId(res._id || res.data?._id);
          localStorage.setItem('cs_hasFavs', '1');
        }
      }
    } finally { setFavLoading(false); }
  };

  // ── Token booking ─────────────────────────────────────────────────────────
  const handleBookToken = async (branchParams, dateOverride) => {
    const bookingDate = dateOverride || selectedTokenDate;
    if (!bookingDate) return;
    if (!dateOverride && availableTokens <= 0) return;
    const hasBranches = (sp?.business?.branches || sp?.buisness?.branches || []).length > 0;
    if (hasBranches && !branchParams) {
      navigate(`/sp/${spId}/branch`, { state: { bookingType: 'token', tokenDate: bookingDate.toISOString(), sp } });
      return;
    }
    setBookingToken(true);
    try {
      const issuanceTime = sp?.token?.issuanceTime ? new Date(sp.token.issuanceTime) : bookingDate;
      const res = await api.post('/v1/tokens', {
        date: bookingDate.toISOString(),
        time: issuanceTime.toISOString(),
        serviceProviderId: spId,
        status: 'ACTIVE',
        payment: {
          currencyId: sp?.priceRange?.currencyId || 'INR',
          price: sp?.priceRange?.min || 0,
          status: 1,
          paymentMode: sp?.paymentMode || 'OFFLINE',
          referenceNo: `TOKEN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        },
        ...(branchParams?.branchId && {
          branchId: branchParams.branchId,
          branchName: branchParams.branchName,
          branchPhone: branchParams.branchPhone,
          branchAddressLine1: branchParams.branchAddressLine1,
          branchCity: branchParams.branchCity,
          branchState: branchParams.branchState,
          branchPincode: branchParams.branchPincode,
        }),
        ...(branchParams?.employeeId && { employeeId: branchParams.employeeId, employeeName: branchParams.employeeName }),
      });
      if (res.success || res.tokenNo) {
        navigate('/my-bookings');
      } else {
        toast.error(res.message || 'Booking failed. Please try again.');
      }
    } finally { setBookingToken(false); }
  };

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const maxDate = new Date(today); maxDate.setMonth(today.getMonth() + 3);

    // Adjust to Mon-start: Sun(0)→6, Mon(1)→0 ...
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];

    // Prev month fill
    const prevDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({ day: prevDays - i, cur: false, avail: false, date: null });
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i); d.setHours(0,0,0,0);
      const avail = d >= today && d <= maxDate;
      days.push({ day: i, cur: true, avail, date: d });
    }
    // Next month fill
    const rem = 42 - days.length;
    for (let i = 1; i <= rem; i++) {
      days.push({ day: i, cur: false, avail: false, date: null });
    }
    return days;
  };

  const prevMonth = () => {
    const p = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (p >= new Date(today.getFullYear(), today.getMonth(), 1)) setCurrentMonth(p);
  };
  const nextMonth = () => {
    const maxM = new Date(today); maxM.setMonth(today.getMonth() + 3); maxM.setDate(1);
    const n = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (n <= maxM) setCurrentMonth(n);
  };

  const fmt = (d) => { const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${dd}`; };
  const isSelected = (d) => d && selectedDate && d.getTime() === selectedDate.getTime();
  const isToday2 = (d) => d && d.getTime() === today.getTime();

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <AppLayout><div style={s.center}><Spinner /></div></AppLayout>;
  if (!sp) return <AppLayout><div style={s.center}><p style={{ color: C.TEXT3 }}>Service provider not found.</p></div></AppLayout>;

  const images = (sp.images || []).map(i => IMG(i.path)).filter(Boolean);
  const currency = sp.priceRange?.currencyId === 'INR' ? '₹' : '$';
  const isToken = sp.option === 'token';
  const isSession = sp.option === 'session';
  const biz = sp.business || {};
  const social = sp.socialMedia || {};

  const continueLabel = `Continue to Add-ons${sp.priceRange?.min ? ` - ${currency}${sp.priceRange.min}` : ''}`;

  return (
    <AppLayout title={sp.title}>
      <div className="app-narrow" style={{ paddingBottom: 100 }}>

        {/* ── Image Carousel ── */}
        <div style={{ position: 'relative', height: 260, backgroundColor: '#f1ebfa', overflow: 'hidden' }}>
          {images.length > 0
            ? <img src={images[slide]} alt={sp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
            : <div style={{ height: '100%', background: `linear-gradient(135deg,${C.NAV_BG},${C.PRIMARY})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 60 }}>🏪</span></div>
          }

          {/* Prev/Next arrows */}
          {images.length > 1 && <>
            <button onClick={() => setSlide(s => Math.max(0, s-1))} style={s.arrowL}>‹</button>
            <button onClick={() => setSlide(s => Math.min(images.length-1, s+1))} style={s.arrowR}>›</button>
          </>}

          {/* Image counter */}
          {images.length > 0 && (
            <div style={s.counter}>{slide+1}/{images.length}</div>
          )}

          {/* Type badge top-left */}
          <div style={s.typeBadge}>
            {isToken ? '🎫 Token System' : isSession ? '⏱ Session' : '📅 Appointment'}
          </div>

          {/* Fav top-right */}
          <button onClick={toggleFav} style={s.favBtn}>{isFav ? '❤️' : '🤍'}</button>
        </div>

        <div style={{ padding: '16px 16px 0' }}>

          {/* ── Title + Meta ── */}
          <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 900, color: C.TEXT1 }}>{sp.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Rating */}
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, fontWeight: 700, color: C.TEXT1 }}>
                <span style={{ color: '#F59E0B' }}>★</span>
                {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
                <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({totalReviews})</span>
              </span>
              {/* Duration */}
              <span style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                🕐 {isToken ? 'Walk-in' : isSession ? 'Session' : `${sp.appointment?.duration || 60} mins`}
              </span>
              {/* City */}
              {biz.address?.city && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([biz.address.line1, biz.address.city, biz.address.state].filter(Boolean).join(', '))}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                  📍 {biz.address.city}
                </a>
              )}
            </div>
            {/* Share */}
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => toast.success('Link copied!'))
                    .catch(() => toast.error('Could not copy link'));
                } else {
                  toast.error('Copy not supported in this browser');
                }
              }}
              style={s.shareBtn} title="Copy link">🔗</button>
          </div>

          {/* ── Business address card ── */}
          {biz.address && (
            <div style={s.bizCard}>
              {biz.address.line1 && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([biz.address.line1, biz.address.city, biz.address.state].filter(Boolean).join(', '))}`}
                  target="_blank" rel="noopener noreferrer" style={s.bizRow}>
                  <div style={s.bizIcon}><span style={{ fontSize: 16 }}>📍</span></div>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: C.TEXT1 }}>{biz.address.line1}</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
                      {[biz.address.city, biz.address.state, biz.address.pincode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </a>
              )}
              {biz.phone && (
                <a href={`tel:${biz.phone}`} style={{ ...s.bizRow, textDecoration: 'none' }}>
                  <div style={{ ...s.bizIcon, backgroundColor: 'rgba(34,197,94,0.1)' }}><span style={{ fontSize: 16 }}>📞</span></div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.TEXT1 }}>{biz.phone}</p>
                </a>
              )}
              {/* Social icons */}
              {Object.values(social).some(Boolean) && (
                <div style={{ display: 'flex', gap: 10, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.BORDER}` }}>
                  {social.facebook && <SocialCircle href={social.facebook} bg="rgba(24,119,242,0.1)" color="#1877F2" icon="f" />}
                  {social.instagram && <SocialCircle href={`https://instagram.com/${social.instagram}`} bg="rgba(228,64,95,0.1)" color="#E4405F" icon="📸" />}
                  {social.twitter && <SocialCircle href={social.twitter} bg="rgba(29,161,242,0.1)" color="#1DA1F2" icon="𝕏" />}
                  {social.youtube && <SocialCircle href={social.youtube} bg="rgba(255,0,0,0.1)" color="#FF0000" icon="▶" />}
                  {social.whatsapp && <SocialCircle href={`https://wa.me/${social.whatsapp}`} bg="rgba(37,211,102,0.1)" color="#25D366" icon="💬" />}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {sp.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {sp.tags.map((t, i) => (
                <span key={i} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', color: '#6B7280', border: '1px solid rgba(0,0,0,0.08)' }}>{t}</span>
              ))}
            </div>
          )}

          {/* Description */}
          {sp.description && (
            <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 20 }}>{sp.description}</p>
          )}

          {/* Pricing card */}
          <div style={s.priceCard}>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>
                {isToken ? 'Token Fee' : isSession ? 'Session Fee' : 'Starting from'}
              </p>
              <p style={{ margin: 0, fontSize: 14, color: '#6B7280' }}>
                {isToken ? 'Pay per visit' : `${sp.appointment?.duration || 60} minutes`}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: C.PRIMARY }}>{currency}{sp.priceRange?.min || 0}</p>
              {sp.priceRange?.max > sp.priceRange?.min && (
                <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>up to {currency}{sp.priceRange.max}</p>
              )}
            </div>
          </div>

          {/* ── APPOINTMENT FLOW ── */}
          {!isToken && !isSession && (
            <div style={{ marginBottom: 20 }}>
              {/* Calendar */}
              <div style={{ ...s.calCard, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
                <div style={s.calNav}>
                  <button onClick={prevMonth} style={s.calBtn}>‹</button>
                  <span style={{ fontWeight: 700, fontSize: 15, color: C.TEXT1 }}>
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={nextMonth} style={s.calBtn}>›</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
                  {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#9CA3AF' }}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                  {getCalendarDays().map((cd, i) => {
                    const sel = isSelected(cd.date);
                    const tod = isToday2(cd.date);
                    return (
                      <button key={i}
                        disabled={!cd.avail}
                        onClick={() => cd.avail && setSelectedDate(cd.date)}
                        style={{
                          width: '100%', maxWidth: 44, aspectRatio: '1', margin: '0 auto',
                          borderRadius: '50%', border: 'none',
                          fontSize: 13, fontWeight: sel || tod ? 700 : 400, cursor: cd.avail ? 'pointer' : 'default',
                          backgroundColor: sel ? C.PRIMARY : 'transparent',
                          color: !cd.cur ? '#D1D5DB' : sel ? '#fff' : !cd.avail ? '#D1D5DB' : C.TEXT1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          outline: tod && !sel ? `2px solid ${C.PRIMARY}` : 'none',
                        }}
                      >{cd.day}</button>
                    );
                  })}
                </div>
                {selectedDate && (
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: C.TEXT3 }}>
                    ● SELECTED &nbsp;&nbsp; {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>

              {/* Time slots */}
              {selectedDate && (
                <div style={s.calCard}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>Available Time Slots</h3>
                  {loadingSlots ? (
                    <p style={{ color: C.TEXT3, fontSize: 14 }}>Loading...</p>
                  ) : slots.length === 0 ? (
                    <p style={{ color: C.ERROR, fontSize: 14 }}>No slots available for this date.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {slots.map(sl => (
                        <button key={sl.time} onClick={() => setSelectedTime(sl.time)}
                          style={{ ...s.slotBtn, ...(selectedTime === sl.time ? s.slotActive : {}) }}>
                          {sl.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── TOKEN FLOW ── */}
          {isToken && (
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: C.TEXT1 }}>Select Date for Token</h3>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none', marginBottom: 16 }}>
                {tokenDates.map((td, i) => {
                  const sel = selectedTokenDate && fmt(td.date) === fmt(selectedTokenDate);
                  return (
                    <button key={i} disabled={!td.avail} onClick={() => td.avail && setSelectedTokenDate(td.date)}
                      style={{ flexShrink: 0, minWidth: 80, padding: '12px 8px', borderRadius: 12,
                        border: `1.5px solid ${sel ? C.PRIMARY : C.BORDER}`,
                        backgroundColor: sel ? C.PRIMARY : '#fff',
                        color: sel ? '#fff' : td.avail ? C.TEXT1 : '#D1D5DB',
                        cursor: td.avail ? 'pointer' : 'default', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{td.label}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.8 }}>{td.dayName}</p>
                      {!td.avail && <p style={{ margin: '2px 0 0', fontSize: 10, color: C.ERROR }}>Closed</p>}
                    </button>
                  );
                })}
              </div>

              {selectedTokenDate && (
                <div style={s.calCard}>
                  {checkingTokens ? (
                    <p style={{ color: C.TEXT3, fontSize: 14 }}>Checking availability...</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 600 }}>Available Tokens</span>
                        <span style={{ fontSize: 28, fontWeight: 900, color: C.PRIMARY }}>{availableTokens}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: `1px solid ${C.BORDER}` }}>
                        <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 600 }}>Your Token Number</span>
                        <span style={{ fontSize: 22, fontWeight: 900, color: C.TEXT1 }}>#{nextToken}</span>
                      </div>
                      {availableTokens <= 5 && availableTokens > 0 && (
                        <div style={{ marginTop: 10, backgroundColor: '#FFF7ED', borderRadius: 8, padding: 10 }}>
                          <p style={{ margin: 0, fontSize: 13, color: '#92400E', textAlign: 'center' }}>Only {availableTokens} tokens remaining!</p>
                        </div>
                      )}
                      {availableTokens === 0 && (
                        <div style={{ marginTop: 10, backgroundColor: '#FEF2F2', borderRadius: 8, padding: 10 }}>
                          <p style={{ margin: 0, fontSize: 13, color: C.ERROR, textAlign: 'center' }}>No tokens available for this date</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Session */}
          {isSession && (
            <div style={{ height: 20 }} />
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <div style={s.calCard}>
              <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>Reviews ({totalReviews})</h3>
              {reviews.slice(0, 5).map(r => {
                const name = typeof r.createdBy === 'object'
                  ? `${r.createdBy.info?.fName || ''} ${r.createdBy.info?.lName || ''}`.trim() || 'Customer'
                  : 'Customer';
                return (
                  <div key={r._id} style={{ padding: '10px 0', borderBottom: `1px solid ${C.BORDER}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.TEXT1 }}>{name}</span>
                      <span style={{ color: '#F59E0B', fontSize: 13 }}>{'★'.repeat(r.rating)}</span>
                    </div>
                    {r.description && <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>{r.description}</p>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ height: 40 }} />
        </div>
      </div>

      {showLogin && (
        <LoginModal
          onSuccess={() => {
            setShowLogin(false);
            if (pendingAction.current) { pendingAction.current(); pendingAction.current = null; }
          }}
          onClose={() => { setShowLogin(false); pendingAction.current = null; }}
        />
      )}

      {/* ── Sticky Bottom Button ── */}
      <div style={s.bottomBar}>
        {isToken ? (
          <button
            onClick={() => requireLogin(() => handleBookToken())}
            disabled={bookingToken || !selectedTokenDate || availableTokens === 0}
            style={{ ...s.bookBtn, opacity: (bookingToken || !selectedTokenDate || availableTokens === 0) ? 0.6 : 1 }}>
            {bookingToken ? 'Booking...' : `Get Token${sp.priceRange?.min ? ` - ${currency}${sp.priceRange.min}` : ''}`}
          </button>
        ) : isSession ? (
          <button onClick={() => requireLogin(() => {
            const hasBranches = (sp.business?.branches || sp.buisness?.branches || []).length > 0;
            if (hasBranches) {
              navigate(`/sp/${spId}/branch`, { state: { bookingType: 'session', sp } });
            } else {
              navigate(`/sp/${spId}/session`);
            }
          })} style={s.bookBtn}>
            Book Session - {currency}{sp.priceRange?.min || 0}
          </button>
        ) : (
          <button
            onClick={() => {
              if (!selectedTime || !selectedDate) { toast.warning('Please select a date and time slot'); return; }
              requireLogin(() => {
                const hasBranches = (sp.business?.branches || sp.buisness?.branches || []).length > 0;
                if (hasBranches) {
                  navigate(`/sp/${spId}/branch`, { state: { bookingType: 'appointment', date: fmt(selectedDate), time: selectedTime, sp } });
                } else {
                  navigate(`/sp/${spId}/appointment`, { state: { date: fmt(selectedDate), time: selectedTime } });
                }
              });
            }}
            disabled={!selectedTime}
            style={{ ...s.bookBtn, opacity: selectedTime ? 1 : 0.6 }}>
            {continueLabel}
          </button>
        )}
      </div>
    </AppLayout>
  );
}

function SocialCircle({ href, bg, color, icon }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: 18, textDecoration: 'none', fontWeight: 700 }}>
      {icon}
    </a>
  );
}

function Spinner() {
  return <div style={{ width: 36, height: 36, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />;
}

const s = {
  center: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  arrowL: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', fontSize: 24, borderRadius: 20, width: 36, height: 36, cursor: 'pointer', zIndex: 2 },
  arrowR: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', fontSize: 24, borderRadius: 20, width: 36, height: 36, cursor: 'pointer', zIndex: 2 },
  counter: { position: 'absolute', bottom: 14, right: 14, backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: 12, borderRadius: 12, padding: '3px 10px' },
  typeBadge: { position: 'absolute', top: 14, left: 14, backgroundColor: '#6366F1', color: '#fff', fontSize: 12, fontWeight: 700, borderRadius: 20, padding: '6px 12px' },
  favBtn: { position: 'absolute', top: 10, right: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 2 },
  shareBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 8 },
  bizCard: { backgroundColor: 'rgba(99,102,241,0.03)', borderRadius: 16, padding: '14px 16px', borderLeft: `4px solid ${C.PRIMARY}`, marginBottom: 20 },
  bizRow: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, textDecoration: 'none' },
  bizIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  priceCard: { backgroundColor: 'rgba(99,102,241,0.05)', borderRadius: 16, padding: 20, border: `1.5px solid ${C.PRIMARY}`, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  calCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  calNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calBtn: { background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: C.TEXT1, padding: '0 8px' },
  slotBtn: { padding: '10px 4px', borderRadius: 10, border: `1.5px solid ${C.BORDER}`, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.TEXT1 },
  slotActive: { backgroundColor: C.PRIMARY, borderColor: C.PRIMARY, color: '#fff' },
  bottomBar: { position: 'fixed', bottom: 64, left: 0, right: 0, padding: '12px 16px', backgroundColor: '#fff', borderTop: `1px solid ${C.BORDER}`, display: 'flex', gap: 10, zIndex: 90 },
  bookBtn: { flex: 1, padding: 15, borderRadius: 14, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
};
