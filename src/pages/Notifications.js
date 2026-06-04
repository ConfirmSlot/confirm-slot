import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { C } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/v1/device-tokens/notifications').then(r => {
      const list = r?.notifications ?? r?.data;
      setNotifications(Array.isArray(list) ? list : []);
    }).finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.patch(`/v1/device-tokens/notifications/mark-read/${id}`, {}).catch(() => {});
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  return (
    <AppLayout>
      <div style={{ padding: '16px 16px 0' }}>

        {loading ? (
          <div style={s.center}><Spinner /></div>
        ) : notifications.length === 0 ? (
          <div style={s.center}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 40 }}>🔔</p>
              <p style={{ color: C.TEXT3, fontSize: 15 }}>No notifications yet</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 20 }}>
            {notifications.map(n => (
              <div key={n._id} onClick={() => markRead(n._id)} style={{ ...s.card, opacity: n.isRead ? 0.7 : 1 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ ...s.dot, backgroundColor: n.isRead ? C.BORDER : C.PRIMARY }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontWeight: n.isRead ? 500 : 700, fontSize: 14, color: C.TEXT1 }}>{n.title}</p>
                    <p style={{ margin: '0 0 4px', fontSize: 13, color: C.TEXT3 }}>{n.body || n.message}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.TEXT3 }}>{formatDate(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />;
}

const s = {
  center: { minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: '14px', border: `1px solid ${C.BORDER}`, cursor: 'pointer' },
  dot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0, marginTop: 4 },
};
