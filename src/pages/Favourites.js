import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';
import { API_BASE_URL } from '../config/api';

export default function Favourites() {
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/v1/favourites').then(r => {
      setFavs(r.favourites || r.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const removeFav = async (favId, spId) => {
    await fetch(`${API_BASE_URL}/v1/favourites/${favId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('cs_token')}` },
    }).catch(() => {});
    setFavs(prev => prev.filter(f => f._id !== favId));
  };

  return (
    <AppLayout>
      <div style={{ padding: '16px 16px 0' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: 22, fontWeight: 800, color: C.TEXT1 }}>❤️ Favourites</h2>

        {loading ? (
          <div style={s.center}><Spinner /></div>
        ) : favs.length === 0 ? (
          <div style={s.center}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 40 }}>💔</p>
              <p style={{ color: C.TEXT3, fontSize: 15 }}>No favourites yet</p>
              <button style={s.exploreBtn} onClick={() => navigate('/home')}>Explore Services</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20 }}>
            {favs.map(f => {
              const sp = f.serviceProvider?.serviceProvider || f.serviceProvider;
              const spId = sp?._id || f.serviceProviderId;
              const img = sp?.images?.[0]?.path || sp?.icon;
              return (
                <div key={f._id} style={s.card}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, cursor: 'pointer' }} onClick={() => navigate(`/sp/${spId}`)}>
                    <div style={s.thumb}>
                      {IMG(img) ? (
                        <img src={IMG(img)} alt={sp?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                      ) : <span style={{ fontSize: 28 }}>🏪</span>}
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: C.TEXT1 }}>{sp?.title || 'Service'}</p>
                      <p style={{ margin: 0, fontSize: 12, color: C.TEXT3 }}>📍 {sp?.buisness?.city}</p>
                    </div>
                  </div>
                  <button onClick={() => removeFav(f._id, spId)} style={s.removeBtn}>❤️</button>
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
  card: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: '12px 14px', border: `1px solid ${C.BORDER}` },
  thumb: { width: 56, height: 56, borderRadius: 14, overflow: 'hidden', backgroundColor: C.PRIMARY_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  removeBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', marginLeft: 10 },
  exploreBtn: { marginTop: 12, padding: '10px 24px', borderRadius: 12, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
};
