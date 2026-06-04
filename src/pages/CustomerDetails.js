import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { C } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';

export default function CustomerDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user } = useAuth();

  const { bookingData, type, spId, serviceTitle, date, time, total, currency } = state || {};

  const [form, setForm] = useState({
    fName: user?.info?.fName || '',
    lName: user?.info?.lName || '',
    email: user?.info?.email || '',
    countryCode: user?.countryCode || '+91',
    phone: String(user?.phoneNo || ''),
  });
  const [errors, setErrors] = useState({});
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bookingData) navigate('/home');
  }, [bookingData, navigate]);

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fName.trim()) e.fName = 'First name is required';
    if (!form.lName.trim()) e.lName = 'Last name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setSubmitting(true);

    try {
      if (saveToProfile) {
        await api.patch('/v1/users/me', {
          info: { fName: form.fName, lName: form.lName, email: form.email },
        });
      }

      const customer = {
        fName: form.fName,
        lName: form.lName,
        email: form.email,
        phone: form.phone,
        countryCode: form.countryCode,
        name: `${form.fName} ${form.lName}`.trim(),
      };

      const paymentMode = bookingData?.payment?.paymentMode || 'OFFLINE';

      if (paymentMode === 'ONLINE' && (total || 0) > 0) {
        navigate('/payment', { state: { bookingData, type, spId, customer } });
      } else {
        // Offline — post booking directly
        let res;
        if (type === 'appointment') {
          res = await api.post('/v1/appointments', {
            ...bookingData,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerEmail: customer.email,
          });
        } else if (type === 'token') {
          res = await api.post('/v1/tokens', {
            ...bookingData,
            customerName: customer.name,
            customerPhone: customer.phone,
          });
        } else {
          res = await api.post('/v1/sessions', bookingData);
        }

        if (res.success || res.appointment || res.token || res.session) {
          navigate('/booking-confirmation', {
            state: { booking: res.appointment || res.token || res.session || res.data, type },
          });
        } else {
          alert(res.message || 'Booking failed. Please try again.');
        }
      }
    } finally { setSubmitting(false); }
  };

  return (
    <AppLayout title="Your Details">
      <div style={{ padding: '16px', paddingBottom: 100 }}>

        {/* Booking summary */}
        {serviceTitle && (
          <div style={s.summaryCard}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: 15, color: C.TEXT1 }}>{serviceTitle}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              {date && <span style={s.chip}>📅 {date}</span>}
              {time && <span style={s.chip}>🕐 {time}</span>}
              {total > 0 && <span style={s.chip}>💰 {currency || '₹'}{total}</span>}
            </div>
          </div>
        )}

        {/* Form */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <span style={{ fontSize: 20 }}>👤</span>
            <h3 style={s.cardTitle}>Personal Information</h3>
          </div>

          <div style={s.row}>
            <Field label="First Name *" error={errors.fName}>
              <input value={form.fName} onChange={setF('fName')} style={{ ...s.input, ...(errors.fName ? s.inputErr : {}) }} placeholder="First Name" />
            </Field>
            <Field label="Last Name *" error={errors.lName}>
              <input value={form.lName} onChange={setF('lName')} style={{ ...s.input, ...(errors.lName ? s.inputErr : {}) }} placeholder="Last Name" />
            </Field>
          </div>

          <Field label="Email *" error={errors.email}>
            <input value={form.email} onChange={setF('email')} style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }} placeholder="Email address" type="email" />
          </Field>

          <Field label="Phone *" error={errors.phone}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={s.countryCode}>{form.countryCode}</div>
              <input value={form.phone} onChange={setF('phone')} style={{ ...s.input, flex: 1 }} placeholder="Phone number" type="tel" />
            </div>
          </Field>

          {/* Save to profile toggle */}
          <div style={s.saveRow} onClick={() => setSaveToProfile(v => !v)}>
            <div style={{ ...s.checkbox, ...(saveToProfile ? s.checkboxOn : {}) }}>
              {saveToProfile && <span style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>✓</span>}
            </div>
            <span style={{ fontSize: 14, color: C.TEXT1 }}>Save details to my profile</span>
          </div>
        </div>

        {/* Info box */}
        <div style={s.infoBox}>
          <span style={{ fontSize: 18 }}>ℹ️</span>
          <p style={{ margin: 0, fontSize: 13, color: '#1D4ED8', lineHeight: 1.5 }}>
            Your details are used to send booking confirmation and updates. We never share your information.
          </p>
        </div>
      </div>

      {/* Sticky confirm button */}
      <div style={s.bottomBar}>
        <button
          onClick={handleConfirm}
          disabled={submitting}
          style={{ ...s.confirmBtn, opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Processing...' : bookingData?.payment?.paymentMode === 'ONLINE' ? 'Proceed to Payment' : 'Confirm Booking'}
        </button>
      </div>
    </AppLayout>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, color: '#6B7280', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
      {error && <p style={{ margin: '4px 0 0', fontSize: 12, color: C.ERROR }}>{error}</p>}
    </div>
  );
}

const s = {
  summaryCard: {
    backgroundColor: C.PRIMARY_LIGHT,
    borderRadius: 14,
    padding: '14px 16px',
    marginBottom: 16,
    borderLeft: `4px solid ${C.PRIMARY}`,
  },
  chip: { fontSize: 13, color: C.TEXT3, fontWeight: 500 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle:  { margin: 0, fontSize: 16, fontWeight: 800, color: C.TEXT1 },
  row:        { display: 'flex', gap: 10 },
  input: {
    width: '100%',
    padding: '13px 14px',
    borderRadius: 12,
    border: `1.5px solid ${C.BORDER}`,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    color: C.TEXT1,
    backgroundColor: '#F9F8FF',
  },
  inputErr:    { borderColor: C.ERROR, backgroundColor: '#FEF2F2' },
  countryCode: {
    padding: '13px 14px',
    borderRadius: 12,
    border: `1.5px solid ${C.BORDER}`,
    fontSize: 14,
    color: C.TEXT1,
    backgroundColor: '#F9F8FF',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  saveRow:    { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 8 },
  checkbox:   { width: 22, height: 22, borderRadius: 6, border: `2px solid ${C.BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', flexShrink: 0 },
  checkboxOn: { backgroundColor: C.PRIMARY, borderColor: C.PRIMARY },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: '12px 14px',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bottomBar:  { position: 'fixed', bottom: 64, left: 0, right: 0, padding: '12px 16px', backgroundColor: '#fff', borderTop: `1px solid ${C.BORDER}`, zIndex: 90 },
  confirmBtn: { width: '100%', padding: 15, borderRadius: 14, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
};
