import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import bookingAnimation from '../assets/booking-animation.json';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/v1/categories'),
      api.get('/v1/featuredservices'),
    ]).then(([cats, feat]) => {
      if (cats.success) setCategories(cats.categories || cats.data || []);
      if (feat.success) setFeatured(feat.featuredServices || feat.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout><div style={s.center}><Spinner /></div></AppLayout>;

  return (
    <AppLayout>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Welcome Banner */}
        <div style={s.banner}>
          <div style={{ flex: 1 }}>
            <div style={s.bannerDots}>
              <span style={s.dot} />
              <span style={{ ...s.dot, opacity: 0.4 }} />
              <span style={{ ...s.dot, opacity: 0.4 }} />
            </div>
            <p style={s.bannerEyebrow}>✦ WELCOME BACK</p>
            <h2 style={s.bannerTitle}>Quick Bookings.{'\n'}No Hassle.</h2>
            <p style={s.bannerSub}>Book your services in seconds</p>
          </div>
          <div style={s.bannerIllustration}>
            <Lottie animationData={bookingAnimation} loop style={{ width: 120, height: 120 }} />
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={s.actionRow}>
          <button style={s.actionBtn} onClick={() => navigate('/my-bookings')}>
            <span style={s.actionCheck}>✓</span>
            <span style={s.actionLabel}>Instant Confirm</span>
          </button>
          <button style={s.actionBtn} onClick={() => navigate('/notifications')}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <span style={s.actionLabel}>Notifications</span>
          </button>
        </div>

        {/* Categories */}
        <Section title="Categories" onSeeAll={() => navigate('/category/all')}>
          <div style={s.categoryGrid}>
            {categories.slice(0, 8).map((cat, i) => (
              <div key={cat._id} style={s.catCard} onClick={() => navigate(`/category/${cat._id}`)}>
                <div style={{ ...s.catIcon, background: CAT_COLORS[i % CAT_COLORS.length] }}>
                  {cat.icon ? (
                    <img src={IMG(cat.icon)} alt={cat.name} style={{ width: 28, height: 28 }} onError={e => e.target.style.display='none'} />
                  ) : <span style={{ fontSize: 20 }}>🏷️</span>}
                </div>
                <p style={s.catName}>{cat.name}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Featured */}
        <Section title="Featured Services" onSeeAll={() => navigate('/category/all')}>
          {featured.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No services available</p>
          ) : (
            <div style={s.featuredScroll}>
              {featured.map(f => {
                const sp = f.serviceProvider?.serviceProvider;
                const img = sp?.images?.[0]?.path;
                const icon = sp?.icon;
                return (
                  <div key={f._id} style={s.featCard} onClick={() => navigate(`/sp/${f.serviceProvider?.serviceProvider?._id}`)}>
                    <div style={{ height: 140, backgroundColor: '#EDE9FE', overflow: 'hidden', borderRadius: '14px 14px 0 0' }}>
                      {IMG(img || icon) ? (
                        <img src={IMG(img || icon)} alt={sp?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                      ) : (
                        <div style={{ height: '100%', background: 'linear-gradient(135deg,#6D28D9,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 40 }}>🏪</span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: C.TEXT1 }}>{sp?.title}</p>
                      <p style={{ margin: '0 0 6px', fontSize: 12, color: C.TEXT3 }}>📍 {sp?.buisness?.city}</p>
                      {sp?.details?.minPrice > 0 && (
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: C.PRIMARY }}>
                          ₹{sp.details.minPrice} – ₹{sp.details.maxPrice}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>
    </AppLayout>
  );
}


function Section({ title, onSeeAll, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.TEXT1 }}>{title}</h3>
        {onSeeAll && <span style={{ fontSize: 13, color: C.PRIMARY, fontWeight: 600, cursor: 'pointer' }} onClick={onSeeAll}>See all</span>}
      </div>
      {children}
    </div>
  );
}

function Spinner() {
  return <div style={{ width: 36, height: 36, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />;
}

const CAT_COLORS = ['#EDE9FE','#FEE2E2','#DCFCE7','#FEF3C7','#E0F2FE','#FCE7F3','#F3E8FF','#ECFDF5'];

const s = {
  center: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  banner: {
    background: 'linear-gradient(135deg, #3b0764 0%, #6D28D9 100%)',
    borderRadius: 20,
    padding: '20px 20px 20px 22px',
    marginBottom: 16,
    display: 'flex',
    alignItems: 'center',
    minHeight: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  bannerDots: { position: 'absolute', top: 14, right: 16, display: 'flex', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: '50%', backgroundColor: '#fff' },
  bannerEyebrow: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, margin: '0 0 6px', textTransform: 'uppercase' },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 6px', lineHeight: 1.25, whiteSpace: 'pre-line' },
  bannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13, margin: 0 },
  bannerIllustration: { flexShrink: 0, marginLeft: 4 },

  actionRow: { display: 'flex', gap: 12, marginBottom: 24 },
  actionBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff', border: 'none', borderRadius: 14,
    padding: '14px 10px', cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
  },
  actionCheck: { fontSize: 18, color: C.PRIMARY, fontWeight: 900 },
  actionLabel: { fontSize: 13, fontWeight: 700, color: C.TEXT1 },

  categoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
  catCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' },
  catIcon: { width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  catName: { margin: 0, fontSize: 11, fontWeight: 600, color: C.TEXT1, textAlign: 'center' },
  featuredScroll: { display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' },
  featCard: { minWidth: 200, backgroundColor: '#fff', borderRadius: 14, cursor: 'pointer', boxShadow: `0 2px 12px rgba(0,0,0,0.08)`, flexShrink: 0 },
};
