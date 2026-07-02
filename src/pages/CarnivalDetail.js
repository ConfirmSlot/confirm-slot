import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';
import { useAuth } from '../contexts/AuthContext';

export default function CarnivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  useAuth();
  const [carnival, setCarnival] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/v1/carnival/${id}`),
      api.get(`/v1/carnival/${id}/wallet`).catch(() => ({ success: false })),
    ]).then(([cRes, wRes]) => {
      if (cRes.success) setCarnival(cRes.carnival || cRes.data);
      if (wRes.success) setWallet(wRes.wallet || wRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <AppLayout><div style={s.center}><Spinner /></div></AppLayout>;
  if (!carnival) return <AppLayout><div style={s.center}><p>Carnival not found.</p></div></AppLayout>;

  const img = carnival.images?.[0]?.path || carnival.coverImage;

  return (
    <AppLayout>
      {/* Cover */}
      <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
        {IMG(img) ? (
          <img src={IMG(img)} alt={carnival.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg,${C.NAV_BG},${C.PRIMARY})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 60 }}>🎪</span>
          </div>
        )}
        <button onClick={() => navigate(-1)} style={s.backBtn}>←</button>
      </div>

      <div className="app-narrow" style={{ padding: '20px 16px' }}>
        <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: C.TEXT1 }}>{carnival.title || carnival.name}</h1>
        {carnival.description && <p style={{ margin: '0 0 16px', color: C.TEXT3, fontSize: 14, lineHeight: 1.6 }}>{carnival.description}</p>}

        {/* Dates */}
        {(carnival.startDate || carnival.endDate) && (
          <div style={s.infoCard}>
            <span style={{ fontSize: 14, color: C.TEXT3 }}>📅 </span>
            <span style={{ fontSize: 14, color: C.TEXT1, fontWeight: 600 }}>
              {carnival.startDate && new Date(carnival.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              {carnival.endDate && ` – ${new Date(carnival.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
            </span>
          </div>
        )}

        {/* Wallet / coupons */}
        {wallet && (
          <div style={s.walletCard}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: C.TEXT1 }}>🎟️ Your Wallet</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={s.walletStat}>
                <span style={s.walletNum}>{wallet.balance || 0}</span>
                <span style={s.walletLabel}>Balance</span>
              </div>
              <div style={s.walletStat}>
                <span style={s.walletNum}>{wallet.totalCoupons || 0}</span>
                <span style={s.walletLabel}>Coupons</span>
              </div>
            </div>
          </div>
        )}

        {/* Vendors */}
        {carnival.vendors?.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: C.TEXT1 }}>Vendors</h3>
            {carnival.vendors.map(v => (
              <div key={v._id} style={s.vendorCard}>
                <p style={{ margin: '0 0 2px', fontWeight: 600, color: C.TEXT1, fontSize: 14 }}>{v.name}</p>
                {v.description && <p style={{ margin: 0, fontSize: 12, color: C.TEXT3 }}>{v.description}</p>}
              </div>
            ))}
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
  center: { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 16, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' },
  infoCard: { backgroundColor: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 12, border: `1px solid ${C.BORDER}`, display: 'flex', alignItems: 'center', gap: 4 },
  walletCard: { backgroundColor: C.PRIMARY, borderRadius: 16, padding: '16px', marginBottom: 16 },
  walletStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 20px' },
  walletNum: { color: '#fff', fontSize: 28, fontWeight: 800 },
  walletLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  vendorCard: { backgroundColor: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 8, border: `1px solid ${C.BORDER}` },
};
