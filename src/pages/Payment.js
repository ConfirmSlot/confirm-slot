import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';
import { C } from '../styles/colors';
import { useAuth } from '../contexts/AuthContext';

// PayU test key is 'gtKFFx' — anything else is a production key
const getPayuUrl = (key) =>
  key === 'gtKFFx' ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment';

export default function Payment() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const formRef = useRef(null);
  const [formData, setFormData] = useState(null);
  const [payuUrl, setPayuUrl] = useState('https://secure.payu.in/_payment');

  const { bookingData, type, spId, customer } = state || {};

  useEffect(() => {
    if (!bookingData || !customer) { navigate('/home'); return; }
    initiatePayment();
  }, [bookingData, customer, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-submit PayU form once formData is set
  useEffect(() => {
    if (formData && formRef.current) {
      formRef.current.submit();
    }
  }, [formData]);

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

      const res = await api.post('/v1/general/payments/initiate', {
        amount:      bookingData.payment.price,
        firstname,
        email,
        phone,
        productinfo: `Booking - ${type || 'appointment'}`,
        udf1:        JSON.stringify(bookingData),
        udf2:        type || 'appointment',
        udf3:        spId || '',
      });

      if (res.success) {
        setPayuUrl(getPayuUrl(res.key));
        setFormData({
          key:         res.key,
          txnid:       res.txnid,
          amount:      res.amount,
          productinfo: res.productinfo,
          firstname:   res.firstname,
          email:       res.email,
          phone:       res.phone || '',
          surl:        res.surl,
          furl:        res.furl,
          hash:        res.hash,
          udf1:        res.udf1 || '',
          udf2:        res.udf2 || '',
          udf3:        res.udf3 || '',
        });
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
      {/* Hidden PayU auto-submit form */}
      {formData && (
        <form ref={formRef} method="POST" action={payuUrl} style={{ display: 'none' }}>
          {Object.entries(formData).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
        </form>
      )}

      <div style={s.card}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{loading ? '💳' : '❌'}</div>
        <h2 style={{ color: C.TEXT1, fontWeight: 800, fontSize: 20, margin: '0 0 8px' }}>
          {loading ? 'Redirecting to Payment...' : 'Payment Error'}
        </h2>
        <p style={{ color: C.TEXT3, fontSize: 14, textAlign: 'center', margin: '0 0 24px' }}>
          {loading ? 'Please wait, do not close this page.' : error}
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
