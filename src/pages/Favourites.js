import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';
import { useAuth } from '../contexts/AuthContext';

export default function Favourites() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [favs,    setFavs]    = useState([]);
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchRatings = useCallback(async (list) => {
    const map = {};
    await Promise.all(list.map(async f => {
      const spId = f.serviceProviderId;
      if (!spId) return;
      try {
        const r = await api.open(`/v1/reviews/serviceProvider/rating/${spId}`);
        map[spId] = { avg: r.avgRating || 0, total: r.totalReviews || 0 };
      } catch { map[spId] = { avg: 0, total: 0 }; }
    }));
    setRatings(map);
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    api.get(`/v1/favourites?userId=${user._id}`).then(r => {
      const raw = r.favourites || r.data || [];
      // deduplicate by serviceProviderId
      const seen = new Set();
      const unique = raw.filter(f => {
        const key = f.serviceProviderId || f._id;
        if (seen.has(key)) return false;
        seen.add(key); return true;
      });
      setFavs(unique);
      localStorage.setItem('cs_hasFavs', unique.length > 0 ? '1' : '0');
      fetchRatings(unique);
    }).finally(() => setLoading(false));
  }, [user?._id, fetchRatings]);

  const removeFav = async (favId) => {
    await api.patch(`/v1/favourites/${favId}`, { isDeleted: true, updatedBy: user._id }).catch(() => {});
    setFavs(prev => {
      const next = prev.filter(f => f._id !== favId);
      localStorage.setItem('cs_hasFavs', next.length > 0 ? '1' : '0');
      return next;
    });
  };

  // Resolve fields — backend returns nested or flat depending on populate
  const resolve = (f) => {
    const sp     = f.serviceProvider?.serviceProvider || f.serviceProvider || {};
    const biz    = sp.buisness || sp.business || {};
    const spId   = sp._id || f.serviceProviderId;
    const title  = sp.title || 'Service Provider';
    // image: try images[0].path, then icon, then imageUrl
    const imgKey = sp.images?.[0]?.path || sp.icon || sp.imageUrl || '';
    const imgUrl = IMG(imgKey) || imgKey;
    // address: try pre-formatted address, then buisness fields
    const address = sp.address
      || [biz.addressLine1, biz.city, biz.state].filter(Boolean).join(', ')
      || biz.city || '';
    return { spId, title, imgUrl, address };
  };

  return (
    <AppLayout>
      <div style={{ padding: '16px 0 0' }}>
        {loading ? (
          <div style={s.center}><Spinner /></div>
        ) : favs.length === 0 ? (
          <div style={s.center}>
            <div style={{ textAlign: 'center', padding: '0 32px' }}>
              {/* Heart outline like the app */}
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={C.PRIMARY} strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <p style={{ fontSize: 20, fontWeight: 600, color: C.TEXT1, margin: '0 0 8px' }}>No favorites yet</p>
              <p style={{ fontSize: 14, color: '#6B7280', margin: '0 0 20px', lineHeight: 1.5 }}>
                Tap the heart icon to save your favorite service providers here.
              </p>
              <button style={s.exploreBtn} onClick={() => navigate('/home')}>Explore Services</button>
            </div>
          </div>
        ) : (
          <div style={{ paddingBottom: 20 }}>
            {favs.map(f => {
              const { spId, title, imgUrl, address } = resolve(f);
              const rating = ratings[f.serviceProviderId] || { avg: 0, total: 0 };

              return (
                <div
                  key={f._id}
                  onClick={() => navigate(`/sp/${spId}`)}
                  style={s.card}
                >
                  {/* ── Image 80×80 ── */}
                  <div style={s.imgWrap}>
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div style={{ ...s.imgFallback, display: imgUrl ? 'none' : 'flex' }}>
                      <span style={{ fontSize: 28 }}>🏪</span>
                    </div>
                  </div>

                  {/* ── Info ── */}
                  <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Title + Heart */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <p style={s.title}>{title}</p>
                      <button
                        onClick={e => { e.stopPropagation(); removeFav(f._id); }}
                        style={s.heartBtn}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>
                    </div>

                    {/* Address */}
                    {address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p style={s.address}>{address}</p>
                      </div>
                    )}

                    {/* Rating */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
                        {rating.avg > 0 ? rating.avg.toFixed(1) : '0.0'} ({rating.total})
                      </p>
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
  center:     { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  exploreBtn: { padding: '10px 24px', borderRadius: 12, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  card: {
    display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
    gap: 12, padding: '16px',
    marginBottom: 12, marginLeft: 16, marginRight: 16,
    backgroundColor: '#fff', borderRadius: 12,
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    cursor: 'pointer',
  },
  imgWrap: {
    width: 80, height: 80, borderRadius: 10, flexShrink: 0,
    overflow: 'hidden', backgroundColor: C.PRIMARY_LIGHT,
    position: 'relative',
  },
  imgFallback: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.PRIMARY_LIGHT,
  },
  title:    { margin: '0', fontWeight: 600, fontSize: 15, color: C.TEXT1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  address:  { margin: 0, fontSize: 13, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  heartBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 2px 8px', flexShrink: 0, lineHeight: 1 },
};
