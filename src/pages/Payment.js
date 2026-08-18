import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { C } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';

const getPayuUrl = (key) =>
  key === 'gtKFFx' ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment';

export default function Payment() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const popupRef = useRef(null);

  const { bookingData, type, spId, customer, sessionBookingId } = state || {};

  useEffect(() => {
    if (!bookingData || !customer) { navigate('/home'); return; }
    initiatePayment();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for postMessage from the PayU popup
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== 'https://api.onezy.net' && event.origin !== 'https://api.confirmslot.com') return;
      if (event.data?.type === 'PAYMENT_SUCCESS') {
        if (popupRef.current) { popupRef.current.close(); popupRef.current = null; }
        navigate('/my-bookings');
      } else if (event.data?.type === 'PAYMENT_FAILURE') {
        if (popupRef.current) { popupRef.current.close(); popupRef.current = null; }
        setError('Payment failed. Please try again.');
        setLoading(false);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);

  const initiatePayment = async () => {
    try {
      const firstname = customer?.fName || user?.info?.fName || 'Customer';
      const email    = customer?.email || user?.info?.email || '';
      const phone    = customer?.phone || String(user?.phoneNo || '');

      if (!email) {
        setError('Email is required for online payment. Please update your profile.');
        setLoading(false);
        return;
      }

      // Build UDF fields exactly as the backend expects for createBookingFromPayment
      const pad = n => String(n).padStart(2, '0');
      let udf1 = '', udf2 = '', udf3 = spId || bookingData.serviceProviderId || '', udf4 = 'APPOINTMENT', udf5 = '';

      if (type === 'token') {
        udf1 = bookingData.date || '';
        udf2 = 'TOKEN';
        udf4 = 'TOKEN';
      } else if (type === 'session') {
        udf1 = bookingData.date || '';
        udf2 = bookingData.time || '';
        udf4 = 'SESSION';
        udf5 = sessionBookingId || '';
      } else {
        // appointment
        const start = new Date(bookingData.startTime);
        udf1 = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`;
        udf2 = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
        udf4 = 'APPOINTMENT';
        udf5 = String(bookingData.pointsToRedeem || 0);
      }

      const res = await api.post('/v1/general/payments/initiate', {
        amount:      bookingData.payment.payuAmount ?? bookingData.payment.price,
        firstname,
        email,
        phone,
        productinfo: `Booking - ${type || 'appointment'}`,
        udf1, udf2, udf3, udf4, udf5,
      });

      if (res.success) {
        const payuUrl = getPayuUrl(res.key);

        // Open named popup first, then POST into it via a form targeted at that window
        const popup = window.open('', 'payu_payment', 'width=480,height=700,top=100,left=200');
        if (!popup) {
          setError('Popup blocked. Please allow popups for this site and try again.');
          setLoading(false);
          return;
        }
        popupRef.current = popup;

        // Build a real DOM form and submit it into the named popup (avoids HTML encoding issues)
        const fields = { key: res.key, txnid: res.txnid, amount: res.amount,
          productinfo: res.productinfo, firstname: res.firstname, email: res.email,
          phone: res.phone || '', surl: res.surl, furl: res.furl, hash: res.hash,
          udf1: res.udf1 || '', udf2: res.udf2 || '', udf3: res.udf3 || '',
          udf4: res.udf4 || '', udf5: res.udf5 || '' };

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payuUrl;
        form.target = 'payu_payment';
        Object.entries(fields).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = v;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        // Fallback: if popup is closed manually without completing
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setError('Payment cancelled. Please try again.');
            setLoading(false);
          }
        }, 1000);
      } else {
        setError(res.error || res.message || 'Could not initiate payment');
        setLoading(false);
      }
    } catch {
      setError('Could not connect to payment gateway');
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{loading ? '💳' : '❌'}</div>
        <h2 style={{ color: C.TEXT1, fontWeight: 800, fontSize: 20, margin: '0 0 8px' }}>
          {loading ? 'Payment Opening...' : 'Payment Error'}
        </h2>
        <p style={{ color: C.TEXT3, fontSize: 14, textAlign: 'center', margin: '0 0 24px' }}>
          {loading ? 'Complete payment in the popup window.' : error}
        </p>
        {loading && <div style={s.spinner} />}
        {!loading && (
          <button onClick={() => navigate(-1)} style={s.btn}>Go Back</button>
        )}
      </div>
    </div>
  );
}

const s = {
  page:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: C.BG, padding: 20 },
  card:    { backgroundColor: '#fff', borderRadius: 20, padding: '40px 28px', maxWidth: 380, width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  spinner: { width: 40, height: 40, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  btn:     { width: '100%', padding: 14, borderRadius: 12, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
};
