import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { C } from '../../styles/colors';
import ChatBot from '../ChatBot';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PAGE_TITLES = {
  '/my-bookings':  'My Bookings',
  '/profile':      'Profile',
  '/notifications':'Notifications',
  '/favourites':   'Saved',
  '/carnival':     'Carnivals',
  '/terms':        'Terms & Privacy',
};

export default function AppLayout({ children, title }) {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isHome = pathname === '/home';

  const pageTitle = title
    || PAGE_TITLES[pathname]
    || (pathname.startsWith('/category') ? 'Category' : null)
    || (pathname.startsWith('/sp/') ? null : null);

  const hasFavs = isLoggedIn && localStorage.getItem('cs_hasFavs') === '1';

  const allTabs = [
    { path: '/home',        icon: '🏠', label: 'Home' },
    { path: '/my-bookings', icon: '📅', label: 'Bookings' },
    ...(hasFavs ? [{ path: '/favourites', icon: '❤️', label: 'Saved' }] : []),
    { path: '/profile',     icon: '👤', label: 'Profile' },
  ];

  const tabs = isLoggedIn ? allTabs : allTabs.slice(0, 1);

  const active = (p) => pathname.startsWith(p);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.BG, paddingBottom: 64 }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(90deg, ${C.NAV_BG} 0%, ${C.PRIMARY} 100%)`,
        padding: '12px 16px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {isHome ? (
          /* Home header */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/home')}>
              <img src="/logo192.png" alt="Onezy" style={s.logoImg} onError={e => e.target.style.display='none'} />
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>Onezy</span>
            </div>
            {isLoggedIn ? (
              <div onClick={() => navigate('/profile')} style={s.avatarCircle}>
                {user?.info?.fName?.[0]?.toUpperCase() || <span style={{ fontSize: 16 }}>👤</span>}
              </div>
            ) : (
              <button onClick={() => navigate('/login')} style={s.loginBtn}>Login</button>
            )}
          </div>
        ) : (
          /* Inner page header: Logo circle | Title | Bell circle */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 }}>
            <button onClick={() => navigate('/home')} style={s.navCircleBtn}>
              <img src="/logo192.png" alt="" style={{ width: 24, height: 24, borderRadius: 6 }} onError={e => e.target.style.display='none'} />
            </button>
            <span style={s.pageTitle}>{pageTitle || 'Onezy'}</span>
            <div style={{ width: 38 }} />
          </div>
        )}
      </div>

      {/* Page content */}
      <div>{children}</div>

      {/* ChatBot */}
      <ChatBot />

      {/* Global toasts */}
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar closeOnClick pauseOnHover={false} style={{ top: 70, zIndex: 9999 }} />

      {/* Bottom tab bar */}
      <div style={s.tabBar}>
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
  );
}

const s = {
  logoImg: { width: 34, height: 34, borderRadius: 10 },
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
