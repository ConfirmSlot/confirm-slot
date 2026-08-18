import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, login, logout, token } = useAuth();
  const navigate = useNavigate();
  const info = user?.info || {};
  const settings = user?.settings || {};
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    fName: info.fName || '',
    lName: info.lName || '',
    email: info.email || '',
    addressLine1: info.addressLine1 || '',
    addressLine2: info.addressLine2 || '',
    pincode: info.pincode || '',
    city: info.city || '',
    state: info.state || '',
    country: info.country || '',
  });

  const [appSettings, setAppSettings] = useState({
    darkMode:              settings.darkMode              ?? false,
    notifications:         settings.notifications         ?? true,
    appointmentReminders:  settings.appointmentReminders  ?? true,
    promotionalOffers:     settings.promotionalOffers     ?? false,
    newsLetter:            settings.newsLetter            ?? false,
    appUpdates:            settings.appUpdates            ?? true,
  });

  const [walletPoints, setWalletPoints] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [picPreview, setPicPreview] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const avatar = picPreview || IMG(info.picture);
  const initials = `${info.fName?.[0] || ''}${info.lName?.[0] || ''}`.toUpperCase() || '?';
  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();
  const fullName = [info.fName, info.lName].filter(Boolean).join(' ') || 'Your Profile';

  /* ── Photo upload ─────────────────────────── */
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fr = new FileReader();
    fr.onload = (ev) => setPicPreview(ev.target.result);
    fr.readAsDataURL(file);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'profile-pictures');
      const res = await api.upload('/v1/general/image', fd);
      if (res.success && res.key) {
        await api.patch('/v1/users/me', { info: { picture: res.key } });
        login(token, { ...user, info: { ...info, picture: res.key } });
      } else {
        setPicPreview(null);
        toast.error('Failed to upload photo. Please try again.');
      }
    } catch {
      setPicPreview(null);
      toast.error('Failed to upload photo. Please try again.');
    } finally { setUploading(false); }
  };

  /* ── Pincode auto-fill ────────────────────── */
  const handlePincode = async (val) => {
    setForm(f => ({ ...f, pincode: val }));
    if (val.length === 6) {
      setPincodeLoading(true);
      try {
        const r = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const d = await r.json();
        if (d[0]?.Status === 'Success') {
          const p = d[0].PostOffice[0];
          setForm(f => ({ ...f, city: p.District, state: p.State, country: 'India' }));
        }
      } catch {} finally { setPincodeLoading(false); }
    }
  };

  /* ── Use current location ─────────────────── */
  const handleLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`);
        const d = await r.json();
        const a = d.address || {};
        setForm(f => ({
          ...f,
          addressLine1: [a.road, a.suburb].filter(Boolean).join(', '),
          city:    a.city || a.town || a.village || '',
          state:   a.state || '',
          country: a.country || '',
          pincode: a.postcode || f.pincode,
        }));
      } catch {}
    });
  };

  /* ── Save all ─────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.patch('/v1/users/me', {
        info: {
          fName: form.fName, lName: form.lName, email: form.email,
          addressLine1: form.addressLine1, addressLine2: form.addressLine2,
          city: form.city, state: form.state, country: form.country,
          pincode: form.pincode,
        },
        settings: appSettings,
      });
      if (res.success) {
        login(token, { ...user, info: { ...info, ...form }, settings: { ...settings, ...appSettings } });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally { setSaving(false); }
  };

  /* ── Logout / Delete ──────────────────────── */
  const handleLogout = () => setShowLogoutConfirm(true);

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleDeleteAccount = () => setShowDeleteConfirm(true);

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    api.patch('/v1/users/me/delete', {}).then(() => {
      toast.success('Account deleted.');
      logout();
      navigate('/login', { replace: true });
    }).catch(() => toast.error('Failed to delete account. Try again.'));
  };

  React.useEffect(() => {
    api.get('/v1/wallet').then(r => { if (r.points) setWalletPoints(r.points); }).catch(() => {});
  }, []);

  const setF = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const toggleSetting = (key) => setAppSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <AppLayout title={info.fName || 'Profile'}>
      <div className="app-narrow" style={{ paddingBottom: 100 }}>

        {/* ── Avatar section ── */}
        <div style={s.avatarSection}>
          <div style={s.avatarWrap}>
            {avatar
              ? <img src={avatar} alt="" style={s.avatarImg} onError={e => e.target.style.display='none'} />
              : <span style={s.avatarInitials}>{initials}</span>
            }
            {uploading && <div style={s.uploadOverlay}>⏳</div>}
            <button style={s.cameraBtn} onClick={() => fileRef.current?.click()}>📷</button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhotoChange} />
          </div>
          <p style={s.avatarName}>{fullName}</p>
          <p style={s.memberSince}>Member since {memberYear}</p>
        </div>

        <div style={{ padding: '0 16px' }}>

          {/* ── Wallet Balance ── */}
          <div onClick={() => navigate('/wallet')} style={{ ...s.walletCard, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={s.walletIcon}>🎁</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Reward Points</p>
                <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#fff' }}>{walletPoints} pts</p>
                <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>≈ ₹{(walletPoints * 0.5).toFixed(2)} value</p>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }}>›</span>
            </div>
          </div>

          {/* ── Personal Information ── */}
          <SectionCard icon="👤" title="Personal Information">
            <Field label="First Name">
              <input value={form.fName} onChange={setF('fName')} style={s.input} placeholder="First Name" />
            </Field>
            <Field label="Last Name">
              <input value={form.lName} onChange={setF('lName')} style={s.input} placeholder="Last Name" />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={setF('email')} style={s.input} placeholder="Email" type="email" />
            </Field>
            <Field label="Phone">
              <div style={{ display:'flex', gap:8 }}>
                <div style={s.countryCode}>{user?.countryCode || '+91'}</div>
                <input value={user?.phoneNo || ''} readOnly style={{ ...s.input, flex:1, color:'#999' }} />
              </div>
            </Field>
          </SectionCard>

          {/* ── Address & Location ── */}
          <SectionCard icon="📍" title="Address & Location">
            <Field label={<><span>Address Line 1</span><span style={s.required}> *</span></>}
              action={<button style={s.locationBtn} onClick={handleLocation}>✈ Use Current Location</button>}>
              <input value={form.addressLine1} onChange={setF('addressLine1')} style={s.input} placeholder="Address Line 1" />
            </Field>
            <Field label="Address Line 2 (optional)">
              <input value={form.addressLine2} onChange={setF('addressLine2')} style={s.input} placeholder="Address Line 2" />
            </Field>
            <Field label={<><span>Pincode</span><span style={s.required}> *</span></>}>
              <input value={form.pincode} onChange={e => handlePincode(e.target.value)} style={s.input} placeholder="Pincode" maxLength={6} />
              <p style={s.hint}>{pincodeLoading ? 'Looking up pincode...' : 'Enter pincode to auto-fill city & state'}</p>
            </Field>
            <Field label={<><span>City</span><span style={s.required}> *</span></>}>
              <input value={form.city} onChange={setF('city')} style={s.input} placeholder="City" />
            </Field>
            <Field label={<><span>State</span><span style={s.required}> *</span></>}>
              <input value={form.state} onChange={setF('state')} style={s.input} placeholder="State" />
            </Field>
            <Field label={<><span>Country</span><span style={s.required}> *</span></>}>
              <input value={form.country} onChange={setF('country')} style={s.input} placeholder="Country" />
            </Field>
          </SectionCard>

          {/* ── App Settings ── */}
          <SectionCard icon="🔔" title="App Settings">
            <Toggle label="Dark Mode" sub="Enable dark theme" value={appSettings.darkMode} onChange={() => toggleSetting('darkMode')} />
            <Toggle label="Notifications" sub="All notifications" value={appSettings.notifications} onChange={() => toggleSetting('notifications')} last />
          </SectionCard>

          {/* ── Notification Preferences ── */}
          <SectionCard icon="🔔" title="Notification Preferences">
            <Toggle label="Appointment Reminders" sub="Before appointments"   value={appSettings.appointmentReminders} onChange={() => toggleSetting('appointmentReminders')} />
            <Toggle label="Promotional Offers"    sub="Deals and offers"       value={appSettings.promotionalOffers}    onChange={() => toggleSetting('promotionalOffers')} />
            <Toggle label="Newsletter"            sub="Updates via newsletter" value={appSettings.newsLetter}           onChange={() => toggleSetting('newsLetter')} />
            <Toggle label="App Updates"           sub="New features"           value={appSettings.appUpdates}          onChange={() => toggleSetting('appUpdates')} last />
          </SectionCard>

          {/* ── Biometric Security ── */}
          <SectionCard icon="🛡️" title="Biometric Security">
            <div style={s.infoBadge}>
              <p style={{ margin:0, fontWeight:700, fontSize:14, color:C.PRIMARY }}>Device Status</p>
              <p style={{ margin:'2px 0 0', fontSize:13, color:C.PRIMARY }}>Not supported in web browser</p>
            </div>
            <div style={{ padding:'10px 0', borderBottom:`1px solid ${C.BORDER}` }}>
              <p style={{ margin:0, fontSize:13, color:'#888', lineHeight:1.5 }}>
                <strong style={{ color:C.TEXT1 }}>Security Note</strong><br/>
                Your biometric data never leaves your device. It's stored securely in your device's hardware and is never sent to our servers.
              </p>
            </div>
          </SectionCard>

          {/* ── Payment Methods ── */}
          <SectionCard icon="💳" title="Payment Methods">
            <button style={s.addPaymentBtn}>+ Add Payment Method</button>
          </SectionCard>

          {/* ── Account Management ── */}
          <div style={s.accountCard}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <span style={{ fontSize:20, color:C.ERROR }}>⚠️</span>
              <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:C.TEXT1 }}>Account Management</h3>
            </div>
            <div style={s.deleteBox}>
              <p style={{ margin:'0 0 4px', fontWeight:700, fontSize:14, color:C.ERROR }}>Delete Account</p>
              <p style={{ margin:'0 0 14px', fontSize:13, color:C.ERROR, lineHeight:1.5 }}>
                This action is irreversible. It will delete your personal account, services, and activity.
              </p>
              <button onClick={handleDeleteAccount} style={s.deleteBtn}>Delete My Account</button>
            </div>
            <button onClick={handleLogout} style={s.logoutBtn}>→ Logout</button>
            <div style={s.versionRow}>
              <span style={{ fontSize:14, fontWeight:600, color:C.TEXT1 }}>App Version</span>
              <span style={s.versionBadge}>Web v1.0</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Logout confirm ── */}
      {showLogoutConfirm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <p style={s.modalTitle}>Logout?</p>
            <p style={s.modalSub}>You'll need to login again to access your account.</p>
            <button onClick={confirmLogout} style={s.modalDanger}>Yes, Logout</button>
            <button onClick={() => setShowLogoutConfirm(false)} style={s.modalCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {showDeleteConfirm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <p style={s.modalTitle}>Delete Account?</p>
            <p style={s.modalSub}>This is irreversible. All your data, bookings and settings will be permanently deleted.</p>
            <button onClick={confirmDelete} style={s.modalDanger}>Yes, Delete</button>
            <button onClick={() => setShowDeleteConfirm(false)} style={s.modalCancel}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Sticky Save Changes ── */}
      <div style={s.saveBar}>
        {saved && <p style={{ margin:'0 0 6px', color:C.SUCCESS, fontWeight:600, fontSize:13, textAlign:'center' }}>✓ Saved successfully</p>}
        <button onClick={handleSave} disabled={saving} style={s.saveBtn}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </AppLayout>
  );
}

/* ── Sub-components ── */
function SectionCard({ icon, title, children }) {
  return (
    <div style={sc.card}>
      <div style={sc.header}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <h3 style={sc.title}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, action, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
        <label style={sc.label}>{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

function Toggle({ label, sub, value, onChange, last }) {
  return (
    <div style={{ ...sc.toggleRow, borderBottom: last ? 'none' : `1px solid ${C.BORDER}` }}>
      <div>
        <p style={{ margin:0, fontSize:15, fontWeight:600, color:C.TEXT1 }}>{label}</p>
        <p style={{ margin:'2px 0 0', fontSize:12, color:'#999' }}>{sub}</p>
      </div>
      <button onClick={onChange} style={{ ...sc.toggleTrack, backgroundColor: value ? C.PRIMARY : '#D1D5DB' }}>
        <span style={{ ...sc.toggleThumb, transform: value ? 'translateX(20px)' : 'translateX(2px)' }} />
      </button>
    </div>
  );
}

/* ── Styles ── */
const s = {
  walletCard: {
    background: `linear-gradient(135deg, ${C.PRIMARY} 0%, #7c3aed 100%)`,
    borderRadius: 16, padding: '16px 18px', marginBottom: 14,
  },
  walletIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
  },
  avatarSection: {
    backgroundColor: C.PRIMARY_LIGHT,
    display:'flex', flexDirection:'column', alignItems:'center',
    paddingTop:32, paddingBottom:24,
  },
  avatarWrap: {
    position:'relative', width:110, height:110, borderRadius:55,
    backgroundColor:'#E5E7EB',
    display:'flex', alignItems:'center', justifyContent:'center',
    overflow:'hidden', border:'3px solid #fff',
    boxShadow:'0 4px 16px rgba(0,0,0,0.1)',
  },
  avatarImg:      { width:'100%', height:'100%', objectFit:'cover' },
  avatarInitials: { color:'#fff', fontSize:36, fontWeight:800 },
  uploadOverlay:  { position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 },
  cameraBtn: {
    position:'absolute', bottom:2, right:2, width:36, height:36, borderRadius:18,
    backgroundColor:C.PRIMARY, border:'2.5px solid #fff', fontSize:16,
    cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2,
  },
  avatarName:  { marginTop:14, fontSize:20, fontWeight:800, color:C.TEXT1, margin:'14px 0 2px' },
  memberSince: { margin:0, fontSize:13, color:'#888', fontWeight:400 },

  input: {
    width:'100%', padding:'13px 14px', borderRadius:12,
    border:`1.5px solid ${C.BORDER}`, fontSize:14, outline:'none',
    boxSizing:'border-box', color:C.TEXT1, backgroundColor:'#F8FAFC',
  },
  countryCode: {
    padding:'13px 14px', borderRadius:12, border:`1.5px solid ${C.BORDER}`,
    fontSize:14, color:C.TEXT1, backgroundColor:'#F8FAFC', whiteSpace:'nowrap',
  },
  required:    { color:C.PRIMARY },
  hint:        { margin:'4px 0 0', fontSize:12, color:'#aaa' },
  locationBtn: { background:'none', border:'none', color:C.PRIMARY, fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', padding:0 },

  infoBadge: { backgroundColor:'#EFF6FF', borderRadius:10, padding:'12px 14px', marginBottom:14 },

  addPaymentBtn: {
    width:'100%', padding:14, borderRadius:12, backgroundColor:'transparent',
    border:`1.5px solid ${C.PRIMARY}`, color:C.PRIMARY,
    fontSize:15, fontWeight:700, cursor:'pointer',
  },

  accountCard: {
    backgroundColor:'#FFF5F5', borderRadius:16, padding:'16px',
    marginBottom:14, border:`1px solid #FEC5C5`,
  },
  deleteBox: { backgroundColor:'#FEE2E2', borderRadius:12, padding:'14px', marginBottom:12 },
  deleteBtn: {
    width:'100%', padding:13, borderRadius:12, backgroundColor:C.ERROR,
    color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer',
  },
  logoutBtn: {
    width:'100%', padding:13, borderRadius:12, backgroundColor:'#F3F4F6',
    color:C.ERROR, border:'none', fontSize:15, fontWeight:600, cursor:'pointer',
    marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
  },
  versionRow: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    backgroundColor:'#F3F4F6', borderRadius:12, padding:'12px 14px',
  },
  versionBadge: {
    backgroundColor:'#DBEAFE', color:'#1D4ED8',
    fontSize:13, fontWeight:700, padding:'4px 10px', borderRadius:8,
  },

  overlay: { position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:'0 24px' },
  modal: { backgroundColor:'#fff', borderRadius:20, padding:'28px 24px', width:'100%', maxWidth:360, display:'flex', flexDirection:'column', gap:12 },
  modalTitle: { margin:0, fontSize:18, fontWeight:800, color:C.TEXT1, textAlign:'center' },
  modalSub: { margin:0, fontSize:13, color:'#6B7280', textAlign:'center', lineHeight:1.5 },
  modalDanger: { padding:'13px', borderRadius:12, backgroundColor:C.ERROR, color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer' },
  modalCancel: { padding:'13px', borderRadius:12, backgroundColor:'#F3F4F6', color:C.TEXT1, border:'none', fontSize:15, fontWeight:600, cursor:'pointer' },
  saveBar: {
    position:'fixed', bottom:64, left:0, right:0,
    backgroundColor:'#fff', padding:'10px 16px 12px',
    borderTop:`1px solid ${C.BORDER}`,
    zIndex:90,
  },
  saveBtn: {
    width:'100%', padding:14, borderRadius:14,
    backgroundColor:C.PRIMARY, color:'#fff',
    border:'none', fontSize:15, fontWeight:700, cursor:'pointer',
  },
};

const sc = {
  card: {
    backgroundColor:'#fff', borderRadius:16, padding:'16px',
    marginBottom:14, boxShadow:'0 2px 10px rgba(0,0,0,0.05)',
  },
  header: { display:'flex', alignItems:'center', gap:8, marginBottom:16 },
  title:  { margin:0, fontSize:16, fontWeight:800, color:C.TEXT1 },
  label:  { fontSize:13, color:'#888', fontWeight:500 },
  toggleRow: { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0' },
  toggleTrack: {
    width:46, height:26, borderRadius:13, border:'none', cursor:'pointer',
    position:'relative', transition:'background 0.2s', flexShrink:0,
  },
  toggleThumb: {
    position:'absolute', top:3, width:20, height:20, borderRadius:10,
    backgroundColor:'#fff', transition:'transform 0.2s',
    boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
  },
};
