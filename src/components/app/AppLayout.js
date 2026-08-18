import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { C } from '../../styles/colors';
import ChatBot from '../ChatBot';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './app-responsive.css';

const IOS_URL     = 'https://apps.apple.com/in/app/confirmslot/id6758349903';
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.identifier.confirmslot';

export function AppBanner() {
  const [dismissed, setDismissed] = useState(() => {
    const ts = localStorage.getItem('app_banner_dismissed_ts');
    return ts && Date.now() - Number(ts) < 24 * 60 * 60 * 1000;
  });
  const { isLoggedIn } = useAuth();
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile || dismissed) return null;

  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);

  const handleOpen = () => {
    // Logged in → open app at home (root), not logged in → open app at login screen
    const deepPath = isLoggedIn ? '' : 'login';
    if (isIOS) {
      // Try deep link first; if app not installed, fall back to App Store after delay
      window.location.href = `confirmslot://${deepPath}`;
      setTimeout(() => { window.location.href = IOS_URL; }, 1500);
    } else {
      // Android: intent URL opens app if installed, falls back to Play Store automatically
      window.location.href = `intent://${deepPath}#Intent;scheme=confirmslot;package=com.identifier.confirmslot;S.browser_fallback_url=${encodeURIComponent(ANDROID_URL)};end`;
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('app_banner_dismissed_ts', String(Date.now()));
    setDismissed(true);
  };

  return (
    <div style={sb.banner}>
      <img src="/logo192.png" alt="Onezy" style={sb.logo} onError={e => e.target.style.display='none'} />
      <div style={{ flex: 1 }}>
        <p style={sb.title}>Onezy App</p>
        <p style={sb.sub}>Better experience on the app</p>
      </div>
      <button onClick={handleOpen} style={sb.openBtn}>Open</button>
      <button onClick={handleDismiss} style={sb.closeBtn}>✕</button>
    </div>
  );
}

const sb = {
  banner:  { display:'flex', alignItems:'center', gap:10, backgroundColor:'#fff', padding:'8px 12px', borderBottom:'1px solid #E5E7EB' },
  logo:    { width:36, height:36, borderRadius:10, flexShrink:0 },
  title:   { margin:0, fontSize:13, fontWeight:700, color:'#2a1052' },
  sub:     { margin:0, fontSize:11, color:'#6B7280' },
  openBtn: { padding:'6px 14px', borderRadius:20, backgroundColor:C.PRIMARY, color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0 },
  closeBtn:{ background:'none', border:'none', fontSize:16, color:'#9CA3AF', cursor:'pointer', padding:'0 4px', flexShrink:0 },
};

export default function AppLayout({ children }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const hasFavs = isLoggedIn && localStorage.getItem('cs_hasFavs') === '1';

  const allTabs = [
    { path: '/home',        icon: '🏠', label: 'Home' },
    { path: '/my-bookings', icon: '📅', label: 'Bookings' },
    ...(hasFavs ? [{ path: '/favourites', icon: '❤️', label: 'Saved' }] : []),
    { path: '/wallet',      icon: '🎁', label: 'Wallet' },
    { path: '/profile',     icon: '👤', label: 'Profile' },
  ];

  const tabs = isLoggedIn ? allTabs : allTabs.slice(0, 1);

  const active = (p) => pathname.startsWith(p);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.BG, paddingBottom: 64 }}>

      {/* Shared site header (logo + nav) is rendered at root App.js level */}

      {/* Page content */}
      <div className="app-shell">{children}</div>

      {/* ChatBot */}
      <ChatBot />

      {/* Global toasts */}
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar closeOnClick pauseOnHover={false} style={{ top: 70, zIndex: 9999 }} />

      {/* Bottom tab bar */}
      <div style={s.tabBar}>
       <div className="app-tabbar-inner">
        {tabs.map(t => (
          <button
            key={t.path}
            onClick={() => navigate(t.path)}
            style={{
              flex: 1, border: 'none', background: 'none',
              padding: '8px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              cursor: 'pointer',
              opacity: active(t.path) ? 1 : 0.5,
            }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ color: '#fff', fontSize: 10, fontWeight: active(t.path) ? 700 : 400 }}>{t.label}</span>
          </button>
        ))}
       </div>
      </div>
    </div>
  );
}

const s = {
  logoImg: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#fff', padding: 3, boxSizing: 'border-box' },
  navCircleBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
    flexShrink: 0,
  },
  loginBtn: {
    padding: '8px 18px', borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 700, color: C.PRIMARY,
    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff', fontWeight: 700, fontSize: 14,
    border: '1.5px solid rgba(255,255,255,0.4)',
  },
  pageTitle: {
    flex: 1, textAlign: 'center',
    color: '#fff', fontWeight: 700, fontSize: 17,
    letterSpacing: 0.3,
  },
  tabBar: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: `linear-gradient(90deg, ${C.NAV_BG} 0%, ${C.PRIMARY} 100%)`,
    display: 'flex',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    zIndex: 100,
  },
};
