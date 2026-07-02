import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { IMG } from '../../styles/colors';

export default function ServiceDetail() {
  const { spId }    = useParams();
  const navigate    = useNavigate();
  const { user, apiFetch } = useAuth();

  const [venue,    setVenue]    = useState(null);
  const [queue,    setQueue]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [adults,   setAdults]   = useState(1);
  const [children, setChildren] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [joining,  setJoining]  = useState(false);
  const [error,    setError]    = useState('');

  // result state
  const [joined,       setJoined]       = useState(false);
  const [tokenNo,      setTokenNo]      = useState(0);
  const [waitingAhead, setWaitingAhead] = useState(0);
  const [tokenId,      setTokenId]      = useState('');
  const [leaving,      setLeaving]      = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const fetchInfo = useCallback(() => {
    fetch(`${API_BASE_URL}/v1/tokens/walkin/${spId}/info`)
      .then(r => r.json())
      .then(d => { if (d.success) { setVenue(d.venue); setQueue(d.queue); } })
      .catch(() => {});
  }, [spId]);

  // On load: check if user already has an active token for this venue today
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch venue info
        fetchInfo();

        // Check for existing active token
        const res  = await apiFetch(`${API_BASE_URL}/v1/tokens/my-tokens`);
        const data = await res.json();
        if (data.success) {
          const today   = new Date().toDateString();
          const existing = (data.tokens || data.data || []).find(t =>
            t.serviceProviderId === spId &&
            t.status === 'ACTIVE' &&
            new Date(t.date).toDateString() === today
          );
          if (existing) {
            // Already in queue — restore their state
            setTokenId(existing._id);
            setTokenNo(existing.tokenNo);
            setWaitingAhead(existing.waitingAhead ?? 0);
            setJoined(true);
          }
        }
      } catch (e) {
        if (e.message !== 'SESSION_EXPIRED') { /* ignore */ }
      } finally {
        setLoading(false);
      }
    };
    init();
    const interval = setInterval(fetchInfo, 30000);
    return () => clearInterval(interval);
  }, [spId, fetchInfo, apiFetch]);

  const handleJoin = async () => {
    setError(''); setJoining(true);
    try {
      let lat, lng;
      if (venue?.locationRestriction?.type === 'nearby' && navigator.geolocation) {
        await new Promise(resolve => {
          navigator.geolocation.getCurrentPosition(
            pos => { lat = pos.coords.latitude; lng = pos.coords.longitude; resolve(); },
            () => resolve(),
            { timeout: 5000 }
          );
        });
      }

      const res  = await apiFetch(`${API_BASE_URL}/v1/tokens/walkin/${spId}/join-auth`, {
        method:  'POST',
        body:    JSON.stringify({
          adults:   venue?.collectAdults   ? adults   : undefined,
          children: venue?.collectChildren ? children : undefined,
          lat, lng,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || 'Could not join queue'); return; }
      setTokenNo(data.tokenNo);
      setWaitingAhead(data.waitingAhead);
      setTokenId(data.tokenId);
      setJoined(true);
    } catch (e) {
      if (e.message !== 'SESSION_EXPIRED') setError('Could not connect. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = () => setConfirmLeave(true);

  const confirmLeaveQueue = async () => {
    setConfirmLeave(false);
    setLeaving(true);
    try {
      await fetch(`${API_BASE_URL}/v1/tokens/walkin/${tokenId}/leave`, { method: 'PATCH' });
      setJoined(false);
    } finally { setLeaving(false); }
  };

  const imgSrc = (path) => IMG(path);

  if (loading) return (
    <div style={s.container}><CircularProgress style={{ color: '#6366f1' }} /></div>
  );

  if (!venue) return (
    <div style={s.container}>
      <div style={s.card}>
        <p style={{ color: '#ef4444', fontWeight: 700 }}>Venue not found.</p>
        <button style={s.backLink} onClick={() => navigate(-1)}>Go back</button>
      </div>
    </div>
  );

  if (joined) return (
    <div style={s.container}>
      <div style={s.card}>
        {imgSrc(venue.icon) && <img src={imgSrc(venue.icon)} alt={venue.name} style={s.icon} onError={e => e.target.style.display='none'} />}
        <h2 style={s.venueName}>{venue.name}</h2>
        <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 32px' }}>You are in the queue</p>

        <div style={s.tokenCircle}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, opacity: 0.85 }}>YOUR TOKEN</span>
          <span style={{ color: '#fff', fontSize: 56, fontWeight: 900, lineHeight: 1 }}>{tokenNo}</span>
        </div>

        <div style={s.statsRow}>
          <div style={s.statBox}>
            <span style={s.statLabel}>AHEAD OF YOU</span>
            <span style={s.statValue}>{waitingAhead}</span>
          </div>
          <div style={s.statBox}>
            <span style={s.statLabel}>YOUR NAME</span>
            <span style={{ ...s.statValue, fontSize: 16 }}>
              {`${user?.info?.fName || ''} ${user?.info?.lName || ''}`.trim() || `+91 ${user?.phoneNo || ''}`}
            </span>
          </div>
        </div>

        <p style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
          Please stay nearby. You will be called when it is your turn.
        </p>

        <button style={s.myBookingsBtn} onClick={() => navigate('/my-bookings')}>
          View in My Bookings
        </button>

        {!confirmLeave ? (
          <button style={s.leaveBtn} onClick={handleLeave} disabled={leaving}>
            {leaving ? <CircularProgress size={16} style={{ color: '#ef4444' }} /> : 'Leave Queue'}
          </button>
        ) : (
          <div style={{ backgroundColor: '#FEF2F2', borderRadius: 12, padding: '14px', border: '1px solid #FEC5C5', marginTop: 8 }}>
            <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: '#2a1052', textAlign: 'center' }}>Leave the queue?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={confirmLeaveQueue} style={{ flex: 1, padding: '10px', borderRadius: 10, backgroundColor: '#EF4444', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Yes, Leave
              </button>
              <button onClick={() => setConfirmLeave(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, backgroundColor: '#F3F4F6', color: '#2a1052', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                Stay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Image carousel */}
      {(() => {
        const imgs = (venue.images || []).map(imgSrc).filter(Boolean);
        if (!imgs.length && venue.icon) { const ic = imgSrc(venue.icon); if (ic) imgs.push(ic); }
        if (!imgs.length) return null;
        return (
          <div style={{ position: 'relative', height: 240, overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
            <div style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', height: '100%', scrollbarWidth: 'none' }}>
              {imgs.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${venue.name} ${i + 1}`}
                  style={{ minWidth: '100%', height: '100%', objectFit: 'cover', scrollSnapAlign: 'start', flexShrink: 0 }}
                  onError={e => e.target.style.display='none'}
                />
              ))}
            </div>
            {imgs.length > 1 && (
              <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
                {imgs.map((_, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.8)' }} />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      <div style={{ padding: '20px 16px', maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          {imgSrc(venue.icon) && (
            <img src={imgSrc(venue.icon)} alt={venue.name} style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display='none'} />
          )}
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{venue.name}</h2>
            {venue.address && <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>{venue.address}</p>}
          </div>
        </div>

        {/* Queue stats */}
        {queue && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#6366f1' }}>{queue.waiting}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Waiting</div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>#{queue.lastTokenNo || 0}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Last Token</div>
            </div>
          </div>
        )}

        {/* Description */}
        {venue.description && (
          <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px' }}>About</p>
            <p style={{ fontSize: 14, color: '#0f172a', lineHeight: 1.6, margin: 0 }}>{venue.description}</p>
          </div>
        )}

        {/* Walk-in form — shown after tapping button */}
        {showForm ? (
          <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Join the Queue</h3>

            {(venue.collectAdults || venue.collectChildren) && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {venue.collectAdults   && <Counter label="Adults"   value={adults}   onChange={setAdults} />}
                {venue.collectChildren && <Counter label="Children" value={children} onChange={setChildren} />}
              </div>
            )}

            {error && <p style={s.error}>{error}</p>}

            <button style={s.joinBtn} onClick={handleJoin} disabled={joining}>
              {joining ? <CircularProgress size={18} style={{ color: '#fff' }} /> : 'Confirm & Join Queue'}
            </button>

            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12, textAlign: 'center' }}>
              Joining as {`${user?.info?.fName || ''} ${user?.info?.lName || ''}`.trim() || `+91 ${user?.phoneNo || ''}`}
            </p>
          </div>
        ) : (
          <button style={{ ...s.joinBtn, marginBottom: 0 }} onClick={() => setShowForm(true)}>
            Join Walk-in Queue
          </button>
        )}
      </div>
    </div>
  );
}

function Counter({ label, value, onChange }) {
  return (
    <div style={{
      flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 12,
      padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => onChange(Math.max(0, value - 1))} style={s.counterBtn}>−</button>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', minWidth: 28, textAlign: 'center' }}>{value}</span>
        <button onClick={() => onChange(value + 1)} style={{ ...s.counterBtn, backgroundColor: '#6366f1', color: '#fff' }}>+</button>
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: '36px 28px', maxWidth: 380, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  icon: { width: 80, height: 80, borderRadius: 20, objectFit: 'cover', marginBottom: 16 },
  venueName: { fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 12px', textAlign: 'center' },
  queueBadge: { backgroundColor: '#f1f5f9', borderRadius: 20, padding: '6px 16px', marginBottom: 20, display: 'flex', gap: 4 },
  queueText: { fontSize: 13, fontWeight: 600, color: '#64748b' },
  divider: { width: '100%', height: 1, backgroundColor: '#e2e8f0', marginBottom: 20 },
  error: { color: '#ef4444', fontSize: 13, margin: '0 0 8px', alignSelf: 'flex-start' },
  joinBtn: { width: '100%', padding: 14, borderRadius: 12, backgroundColor: '#6366f1', color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tokenCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: '#6366f1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 32, boxShadow: '0 8px 32px rgba(99,102,241,0.4)' },
  statsRow: { display: 'flex', gap: 16, width: '100%', marginBottom: 24 },
  statBox: { flex: 1, border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1 },
  statValue: { fontSize: 32, fontWeight: 800, color: '#0f172a' },
  myBookingsBtn: { width: '100%', padding: 13, borderRadius: 12, backgroundColor: '#f1f5f9', color: '#6366f1', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginBottom: 10 },
  leaveBtn: { background: 'none', border: '1.5px solid #ef4444', borderRadius: 12, padding: '10px 32px', color: '#ef4444', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  counterBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e2e8f0', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  backLink: { background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginTop: 8 },
};
