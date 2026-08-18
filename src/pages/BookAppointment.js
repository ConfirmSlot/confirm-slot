import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from '../components/LoginModal';

export default function BookAppointment() {
  const { spId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const date             = location.state?.date || '';
  const time             = location.state?.time || '';
  const branchId         = location.state?.branchId;
  const branchName       = location.state?.branchName || '';
  const branchPhone      = location.state?.branchPhone || '';
  const branchAddrLine1  = location.state?.branchAddressLine1 || '';
  const branchCity       = location.state?.branchCity || '';
  const branchStateVal   = location.state?.branchState || '';
  const branchPincode    = location.state?.branchPincode || '';
  const employeeId       = location.state?.employeeId;
  const employeeName     = location.state?.employeeName || '';

  const [sp, setSp] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [booking, setBooking] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [walletPoints, setWalletPoints] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  useEffect(() => {
    if (!date || !time) { navigate(-1); return; }
    api.get(`/v1/serviceproviders/${spId}`).then(r => {
      if (r.success) setSp(r.provider);
    });
    api.get('/v1/wallet').then(r => {
      if (r.points) setWalletPoints(r.points);
    }).catch(() => {});
  }, [spId, date, time, navigate]);

  const duration    = sp?.appointment?.duration || 60;
  const extras      = sp?.appointment?.extra || sp?.appointment?.extras || [];
  const basePrice   = sp?.priceRange?.min || 0;
  const currencyId  = sp?.priceRange?.currencyId || 'INR';
  const paymentMode = sp?.paymentMode || 'OFFLINE';
  const currency    = currencyId === 'INR' ? '₹' : '$';

  
  const extraTotal = selectedExtras.reduce((sum, id) => {
    const e = extras.find(x => x._id === id);
    return sum + (e?.price || 0);
  }, 0);
  const total        = basePrice + extraTotal;
  const platformFee  = Math.round(total * 0.02 * 100) / 100;
  const gstAmount    = Math.round(platformFee * 0.18 * 100) / 100;
  const grandTotal   = parseFloat((total + platformFee + gstAmount).toFixed(2));
  const maxRedeemPts = Math.floor(grandTotal * 0.5 / 0.5);
  const ptsToRedeem  = useWallet ? Math.min(walletPoints, maxRedeemPts) : 0;
  const walletDisc   = parseFloat((ptsToRedeem * 0.5).toFixed(2));
  const finalAmount  = parseFloat((grandTotal - walletDisc).toFixed(2));

  const toggleExtra = (id) =>
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const doBook = () => {
    const [h, m] = time.split(':').map(Number);
    const start = new Date(date); start.setHours(h, m, 0, 0);
    const end   = new Date(start.getTime() + duration * 60000);

    const extraPayload = extras
      .filter(e => selectedExtras.includes(e._id))
      .map(e => ({ id: e._id, name: e.name, currencyId, price: e.price }));

    const body = {
      serviceProviderId: spId,
      startTime: start.toISOString(),
      endTime:   end.toISOString(),
      status:    'ACTIVE',
      serviceType: sp?.serviceType || 'premise',
      payment: {
        currencyId,
        price: total,
        totalAmount: grandTotal,
        walletDiscount: walletDisc,
        payuAmount: finalAmount,
        status: paymentMode === 'ONLINE' ? 0 : 4,
        paymentMode,
        referenceNo: paymentMode === 'ONLINE' ? '' : `OFFLINE-${Date.now()}`,
      },
      ...(ptsToRedeem > 0 && { pointsToRedeem: ptsToRedeem }),
      extra: extraPayload,
      ...(branchId && { branchId, branchName, branchPhone, branchAddressLine1: branchAddrLine1, branchCity, branchState: branchStateVal, branchPincode }),
      ...(employeeId && { employeeId, employeeName }),
    };

    navigate('/customer-details', {
      state: { bookingData: body, type: 'appointment', spId, serviceTitle: sp?.title, date, time, total, currency },
    });
  };

  const handleBook = () => {
    if (!isLoggedIn) { setShowLogin(true); return; }
    setBooking(true);
    try { doBook(); } finally { setBooking(false); }
  };

  if (!sp) return (
    <AppLayout title="Service Add-ons">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Spinner />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout title="Service Add-ons">
      <div className="app-narrow" style={{ padding: '16px', paddingBottom: 100 }}>

        {/* SP mini bar */}
        <div style={s.spBar}>
          {IMG(sp.icon) && (
            <img src={IMG(sp.icon)} alt="" style={s.spIcon} onError={e => e.target.style.display='none'} />
          )}
          <div>
            <p style={{ margin: '0 0 2px', fontWeight: 700, color: C.TEXT1, fontSize: 15 }}>{sp.title}</p>
            <p style={{ margin: 0, fontSize: 12, color: C.TEXT3 }}>
              📅 {date} &nbsp;|&nbsp; 🕐 {time}
            </p>
          </div>
        </div>

        {/* Extras / Add-ons */}
        {extras.length > 0 && (
          <div style={s.card}>
            <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>Add-ons (Optional)</h3>
            {extras.map(e => (
              <div key={e._id} style={s.extraRow} onClick={() => toggleExtra(e._id)}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: 14, color: C.TEXT1 }}>{e.name}</p>
                  {e.description && <p style={{ margin: 0, fontSize: 12, color: C.TEXT3 }}>{e.description}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, color: C.PRIMARY, fontSize: 14 }}>{currency}{e.price}</span>
                  <div style={{
                    width: 22, height: 22, borderRadius: 4,
                    backgroundColor: selectedExtras.includes(e._id) ? C.PRIMARY : '#fff',
                    border: `2px solid ${selectedExtras.includes(e._id) ? C.PRIMARY : C.BORDER}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selectedExtras.includes(e._id) && <span style={{ color: '#fff', fontSize: 13 }}>✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Special Requests */}
        <div style={s.card}>
          <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>Special Requests</h3>
          <div style={{ backgroundColor: '#F8FAFC', borderRadius: 10, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 16 }}>ℹ️</span>
            <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>Have any specific requests? Our team will do their best to accommodate your needs.</p>
          </div>
          <textarea
            placeholder="Type your special requests here..."
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${C.BORDER}`, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'none', minHeight: 80, color: C.PRIMARY, backgroundColor: '#fff' }}
          />
        </div>

        {/* Payment Summary */}
        <div style={s.card}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>Payment Summary</h3>
          <Row label="Base Service" value={`${currency}${basePrice}`} />
          {extraTotal > 0 && <Row label="Add-ons" value={`${currency}${extraTotal}`} />}
          <Row label="Subtotal" value={`${currency}${total}`} />
          <Row label="Platform Fee (2%)" value={`${currency}${platformFee}`} />
          <Row label="GST (18%)" value={`${currency}${gstAmount}`} />
          <div style={{ height: 1, backgroundColor: C.BORDER, margin: '10px 0' }} />
          <Row label="Total Amount" value={`${currency}${grandTotal}`} bold purple />
          {paymentMode !== 'ONLINE' && (
            <div style={{ backgroundColor: '#EFF6FF', borderRadius: 8, padding: '10px 12px', marginTop: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#1D4ED8' }}>Payment will be made directly to the vendor at the venue</p>
            </div>
          )}
        </div>

        {/* Wallet */}
        {paymentMode === 'ONLINE' && walletPoints > 0 && (
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>🎁</span>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.PRIMARY }}>
                    {useWallet ? `${ptsToRedeem} pts applied` : 'Use Reward Points'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: C.TEXT3 }}>{walletPoints} pts available</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {useWallet && <span style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>-{currency}{walletDisc}</span>}
                <div onClick={() => setUseWallet(v => !v)} style={{
                  width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative',
                  backgroundColor: useWallet ? C.PRIMARY : '#D1D5DB', transition: 'background 0.2s',
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: useWallet ? 22 : 2,
                    width: 20, height: 20, borderRadius: '50%', backgroundColor: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>
            </div>
            <div style={{ height: 1, backgroundColor: C.BORDER, margin: '12px 0 10px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>Total</span>
              <span style={{ fontSize: 15, fontWeight: 900, color: C.PRIMARY }}>{currency}{finalAmount}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sticky total + button */}
      <div style={s.bottomBar}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>Total</p>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: C.TEXT1 }}>{currency}{finalAmount}</p>
        </div>
        <button onClick={handleBook} disabled={booking} style={{ ...s.bookBtn, opacity: booking ? 0.7 : 1 }}>
          {booking ? 'Booking...' : 'Complete Booking'}
        </button>
      </div>

      {showLogin && (
        <LoginModal
          onSuccess={() => { setShowLogin(false); doBook(); }}
          onClose={() => setShowLogin(false)}
        />
      )}
    </AppLayout>
  );
}

function Row({ label, value, bold, purple }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
      <span style={{ fontSize: 14, color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: bold ? 800 : 500, color: purple ? C.PRIMARY : C.TEXT1 }}>{value}</span>
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 36, height: 36, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />;
}

const s = {
  spBar:    { display: 'flex', gap: 12, alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: '12px 14px', marginBottom: 16, border: `1px solid ${C.BORDER}` },
  spIcon:   { width: 48, height: 48, borderRadius: 12, objectFit: 'cover' },
  card:     { backgroundColor: '#fff', borderRadius: 16, padding: '16px', marginBottom: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  extraRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${C.BORDER}`, cursor: 'pointer' },
  bottomBar:{ position: 'fixed', bottom: 64, left: 0, right: 0, padding: '12px 16px', backgroundColor: '#fff', borderTop: `1px solid ${C.BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, zIndex: 90 },
  bookBtn:  { flex: 1, padding: 15, borderRadius: 14, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
};
