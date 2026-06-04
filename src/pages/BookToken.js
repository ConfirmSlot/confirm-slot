import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';

export default function BookToken() {
  const { spId } = useParams();
  const navigate = useNavigate();
  const [sp, setSp] = useState(null);
  const [date, setDate] = useState('');
  const [booking, setBooking] = useState(false);
  const [result, setResult] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get(`/v1/serviceproviders/${spId}`).then(r => {
      if (r.success) setSp(r.data || r.serviceProvider);
    });
  }, [spId]);

  const handleBook = async () => {
    if (!date) return;
    setBooking(true);
    try {
      const res = await api.post('/v1/tokens', {
        date,
        time: date,
        serviceProviderId: spId,
        payment: { price: 0, currencyId: 'INR', status: 1, paymentMode: 'OFFLINE', referenceNo: `WEB_TOKEN_${Date.now()}` },
        status: 'ACTIVE',
      });
      if (res.success) {
        setResult(res.token || res.data);
      }
    } finally { setBooking(false); }
  };

  const spInfo = sp?.serviceProvider || sp;

  if (result) return (
    <AppLayout>
      <div style={s.center}>
        <div style={s.card}>
          {IMG(spInfo?.icon) && <img src={IMG(spInfo.icon)} alt="" style={s.icon} onError={e => e.target.style.display='none'} />}
          <h2 style={{ color: C.TEXT1, fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>{spInfo?.title}</h2>
          <p style={{ color: C.TEXT3, fontSize: 14, margin: '0 0 32px' }}>Your token is confirmed</p>
          <div style={s.tokenCircle}>
            <span style={{ color: '#fff', fontSize: 12, opacity: 0.85 }}>TOKEN NUMBER</span>
            <span style={{ color: '#fff', fontSize: 56, fontWeight: 900 }}>{result.tokenNo}</span>
          </div>
          <p style={{ color: C.TEXT3, fontSize: 13, textAlign: 'center', margin: '20px 0 24px' }}>
            Date: {new Date(result.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
          <button style={s.btn} onClick={() => navigate('/my-bookings')}>View in My Bookings</button>
          <button style={s.backLink} onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={s.back}>←</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.TEXT1 }}>Book Token</h2>
        </div>

        {spInfo && (
          <div style={s.spBar}>
            {IMG(spInfo.icon) && <img src={IMG(spInfo.icon)} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} onError={e => e.target.style.display='none'} />}
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 700, color: C.TEXT1, fontSize: 15 }}>{spInfo.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: C.TEXT3 }}>📍 {spInfo.buisness?.city}</p>
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '16px', border: `1px solid ${C.BORDER}`, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>Select Date</h3>
          <input
            type="date"
            min={today}
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.BORDER}`, fontSize: 15, outline: 'none', boxSizing: 'border-box', color: C.TEXT1 }}
          />
        </div>

        {spInfo?.token?.tokensPerDay > 0 && (
          <p style={{ fontSize: 13, color: C.TEXT3, textAlign: 'center', marginBottom: 12 }}>Max {spInfo.token.tokensPerDay} tokens per day</p>
        )}

        <button onClick={handleBook} disabled={!date || booking} style={{ ...s.btn, opacity: !date ? 0.5 : 1 }}>
          {booking ? 'Booking...' : 'Get Token'}
        </button>
      </div>
    </AppLayout>
  );
}

const s = {
  center: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: '32px 24px', maxWidth: 380, width: '100%', boxShadow: `0 4px 24px rgba(0,0,0,0.08)`, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  icon: { width: 64, height: 64, borderRadius: 16, objectFit: 'cover', marginBottom: 12 },
  tokenCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: C.PRIMARY, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 32px rgba(109,40,217,0.4)` },
  back: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.PRIMARY, fontWeight: 700, padding: 0 },
  spBar: { display: 'flex', gap: 12, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: '12px 14px', marginBottom: 16, border: `1px solid ${C.BORDER}` },
  btn: { width: '100%', padding: 15, borderRadius: 14, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
  backLink: { background: 'none', border: 'none', color: C.PRIMARY, fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 10 },
};
