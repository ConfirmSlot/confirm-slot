import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';
import { useAuth } from '../contexts/AuthContext';

export default function BookSession() {
  const { spId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state: locState } = useLocation();
  const branchId         = locState?.branchId;
  const branchName       = locState?.branchName || '';
  const branchPhone      = locState?.branchPhone || '';
  const branchAddrLine1  = locState?.branchAddressLine1 || '';
  const branchCity       = locState?.branchCity || '';
  const branchStateVal   = locState?.branchState || '';
  const branchPincode    = locState?.branchPincode || '';
  const employeeId       = locState?.employeeId;
  const employeeName     = locState?.employeeName || '';
  const [sp, setSp] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    api.get(`/v1/serviceproviders/${spId}`).then(r => {
      if (r.success) setSp(r.data || r.serviceProvider);
    });
    api.get(`/v1/session-booking/sessions/${spId}`).then(r => {
      setSessions(r.sessions || r.data || []);
    }).catch(() => {});
  }, [spId]);

  const fetchSlots = async (d) => {
    if (!selected) return;
    setLoadingSlots(true);
    try {
      const res = await api.get(`/v1/session-booking/slots?serviceProviderId=${spId}&sessionId=${selected._id}&date=${d}`);
      setSlots((res.slots || []).filter(s => s.available));
    } finally { setLoadingSlots(false); }
  };

  const spInfo = sp?.serviceProvider || sp;

  const handleBook = async () => {
    setBooking(true);
    try {
      const total = selected?.price || 0;
      const paymentMode = spInfo?.paymentMode;
      const bookData = {
        serviceProviderId: spId,
        sessionId: selected._id,
        date, time: selectedSlot,
        payment: { price: total, currencyId: 'INR', status: paymentMode === 'ONLINE' ? 0 : 1, paymentMode: paymentMode || 'OFFLINE', referenceNo: `WEB_SESS_${Date.now()}` },
        ...(branchId && { branchId, branchName, branchPhone, branchAddressLine1: branchAddrLine1, branchCity, branchState: branchStateVal, branchPincode }),
        ...(employeeId && { employeeId, employeeName }),
      };
      if (paymentMode === 'ONLINE' && total > 0) {
        // Create a pending session booking first — backend needs the ID in udf5
        const pendingRes = await api.post('/v1/session-booking', {
          ...bookData,
          paymentMethod: 'online',
          customerName:  `${user?.info?.fName || ''} ${user?.info?.lName || ''}`.trim() || 'Customer',
          customerEmail: user?.info?.email || '',
          customerPhone: String(user?.phoneNo || ''),
          customerCountryCode: user?.countryCode || '+91',
        });
        if (!pendingRes.success) {
          alert(pendingRes.message || 'Could not reserve slot. Please try again.');
          return;
        }
        navigate('/customer-details', { state: {
          bookingData: bookData, type: 'session', spId,
          sessionBookingId: (pendingRes.booking || pendingRes.data)?._id,
        }});
      } else {
        const res = await api.post('/v1/session-booking', bookData);
        if (res.success) navigate('/booking-confirmation', { state: { booking: res.booking || res.data, type: 'session' } });
      }
    } finally { setBooking(false); }
  };

  return (
    <AppLayout>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={s.back}>←</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.TEXT1 }}>Book Session</h2>
        </div>

        {spInfo && (
          <div style={s.spBar}>
            {IMG(spInfo.icon) && <img src={IMG(spInfo.icon)} alt="" style={{ width: 48, height: 48, borderRadius: 12 }} onError={e => e.target.style.display='none'} />}
            <div>
              <p style={{ margin: '0 0 2px', fontWeight: 700, color: C.TEXT1 }}>{spInfo.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: C.TEXT3 }}>📍 {spInfo.buisness?.city}</p>
            </div>
          </div>
        )}

        {/* Select session */}
        <Card title="1. Select Session">
          {sessions.length === 0 ? <p style={{ color: C.TEXT3 }}>No sessions available.</p> : sessions.map(s => (
            <div key={s._id} onClick={() => { setSelected(s); setDate(''); setSlots([]); setSelectedSlot(''); }}
              style={{ ...style.sessCard, ...(selected?._id === s._id ? style.sessActive : {}) }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontWeight: 700, color: C.TEXT1, fontSize: 14 }}>{s.name}</p>
                {s.description && <p style={{ margin: 0, fontSize: 12, color: C.TEXT3 }}>{s.description}</p>}
                <p style={{ margin: '4px 0 0', fontSize: 13 }}>⏱ {s.duration} min</p>
              </div>
              <span style={{ fontWeight: 700, color: C.PRIMARY, fontSize: 15 }}>₹{s.price}</span>
            </div>
          ))}
        </Card>

        {/* Date */}
        {selected && (
          <Card title="2. Select Date">
            <input type="date" min={today} value={date}
              onChange={e => { setDate(e.target.value); fetchSlots(e.target.value); setSelectedSlot(''); }}
              style={style.datePicker} />
          </Card>
        )}

        {/* Slots */}
        {date && (
          <Card title="3. Select Time">
            {loadingSlots ? <p style={{ color: C.TEXT3 }}>Loading...</p> : slots.length === 0 ? (
              <p style={{ color: C.ERROR }}>No slots available.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {slots.map(sl => (
                  <button key={sl.time} onClick={() => setSelectedSlot(sl.time)}
                    style={{ ...style.slot, ...(selectedSlot === sl.time ? style.slotActive : {}) }}>
                    {sl.time}
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

        {selected && date && selectedSlot && (
          <div style={style.summary}>
            <Row label="Session" value={selected.name} />
            <Row label="Date" value={date} />
            <Row label="Time" value={selectedSlot} />
            <Row label="Total" value={`₹${selected.price}`} bold />
            <button onClick={handleBook} disabled={booking} style={style.bookBtn}>
              {booking ? 'Booking...' : spInfo?.paymentMode === 'ONLINE' && selected?.price > 0 ? 'Proceed to Pay' : 'Confirm Booking'}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '14px 16px', marginBottom: 14, border: `1px solid ${C.BORDER}` }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 14, color: C.TEXT3 }}>{label}</span>
      <span style={{ fontSize: 14, color: C.TEXT1, fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}

const s = {
  back: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.PRIMARY, fontWeight: 700, padding: 0 },
  spBar: { display: 'flex', gap: 12, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: '12px 14px', marginBottom: 16, border: `1px solid ${C.BORDER}` },
};

const style = {
  sessCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.BORDER}`, marginBottom: 8, cursor: 'pointer' },
  sessActive: { borderColor: C.PRIMARY, backgroundColor: C.PRIMARY_LIGHT },
  datePicker: { width: '100%', padding: 12, borderRadius: 12, border: `1.5px solid ${C.BORDER}`, fontSize: 15, outline: 'none', boxSizing: 'border-box', color: C.TEXT1 },
  slot: { padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${C.BORDER}`, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: C.TEXT1 },
  slotActive: { backgroundColor: C.PRIMARY, borderColor: C.PRIMARY, color: '#fff' },
  summary: { backgroundColor: '#fff', borderRadius: 16, padding: 16, border: `1px solid ${C.BORDER}`, marginBottom: 16 },
  bookBtn: { width: '100%', padding: 15, borderRadius: 14, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 12 },
};
