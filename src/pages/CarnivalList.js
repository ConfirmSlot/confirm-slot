import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';

export default function CarnivalList() {
  const navigate = useNavigate();
  const [carnivals, setCarnivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.open('/v1/carnival').then(r => {
      setCarnivals(r.data?.data || r.carnivals || r.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div style={{ padding: '16px 16px 0' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: C.TEXT1 }}>🎪 Carnivals</h2>

        {loading ? (
          <div style={s.center}><Spinner /></div>
        ) : carnivals.length === 0 ? (
          <div style={s.center}><p style={{ color: C.TEXT3 }}>No active carnivals</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 20 }}>
            {carnivals.map(c => {
              const img = c.images?.[0]?.path || c.coverImage;
              return (
                <div key={c._id} style={s.card} onClick={() => navigate(`/carnival/${c._id}`)}>
                  <div style={s.img}>
                    {IMG(img) ? (
                      <img src={IMG(img)} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${C.NAV_BG},${C.PRIMARY})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 40 }}>🎪</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px 14px' }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: C.TEXT1 }}>{c.title || c.name}</p>
                    {c.description && <p style={{ margin: '0 0 8px', fontSize: 13, color: C.TEXT3 }}>{c.description}</p>}
                    <div style={{ display: 'flex', gap: 8 }}>
                      {c.startDate && <span style={s.badge}>📅 {new Date(c.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}
                      {c.endDate && <span style={s.badge}>to {new Date(c.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />;
}

const s = {
  center: { minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: `0 2px 12px rgba(0,0,0,0.06)`, cursor: 'pointer' },
  img: { height: 160, overflow: 'hidden' },
  badge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 8, backgroundColor: C.PRIMARY_LIGHT, color: C.PRIMARY },
};
