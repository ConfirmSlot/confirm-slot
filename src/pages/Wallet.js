import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { C } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';

const REASON_LABELS = {
  online_booking:       'Online Appointment',
  offline_booking:      'Walk-in Appointment',
  session_online:       'Online Session',
  session_offline:      'Offline Session',
  sp_completion:        'Service Completed',
  sp_registration:      'Welcome Bonus',
  redeemed:             'Points Redeemed',
  referral_given:       'Friend Joined via Referral',
  referral_received:    'Referral Welcome Bonus',
  cancellation_refund:  'Cancellation Refund',
};

const EARN_ITEMS = [
  { icon: '📅', title: 'Book an Appointment', desc: 'Earn 5 pts per booking' },
  { icon: '🏃', title: 'Attend a Session',    desc: 'Earn 5 pts per session' },
  { icon: '👥', title: 'Refer a Friend',      desc: 'Earn 20 pts per referral' },
  { icon: '✅', title: 'Complete a Service',  desc: 'Earn 10 pts after completion' },
];

export default function Wallet() {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/v1/wallet'),
      api.get('/v1/wallet/history').catch(() => ({ history: [] })),
      api.get('/v1/referral/my-code').catch(() => ({})),
    ]).then(([w, h, c]) => {
      if (w.points !== undefined) setPoints(w.points);
      setTransactions(h.history || h.data?.history || []);
      setReferralCode(c.referralCode || c.data?.referralCode || '');
    }).finally(() => setLoading(false));
  }, []);

  const walletValue = (points * 0.5).toFixed(2);

  const txColor  = (type) => type === 'credit' ? '#10B981' : '#EF4444';
  const txSign   = (type) => type === 'credit' ? '+' : '-';
  const txLabel  = (reason) => REASON_LABELS[reason] || reason || 'Transaction';

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={s.spinner} />
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="app-narrow" style={{ paddingBottom: 100 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 0' }}>
          <button onClick={() => navigate(-1)} style={s.back}>←</button>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.TEXT1 }}>My Wallet</h2>
        </div>

        {/* Balance Card */}
        <div style={s.balanceCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 26 }}>🎁</span>
            <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Your Reward Points</p>
          </div>
          <p style={{ margin: 0, fontSize: 42, fontWeight: 900, color: '#fff', letterSpacing: -1 }}>{points}</p>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>≈ ₹{walletValue} value</p>
          <div style={s.balanceDivider} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>1 Point =</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>₹0.5</p>
            </div>
            <div style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Expiry</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>365 days</p>
            </div>
            <div style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Max Redeem</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>50%</p>
            </div>
          </div>
        </div>

        {/* Referral code */}
        {referralCode ? (
          <div style={s.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>👥</span>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: C.TEXT1 }}>Your Referral Code</p>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: 13, color: C.TEXT3, lineHeight: 1.5 }}>
              Share your code — your friend gets <strong style={{ color: C.PRIMARY }}>25 pts</strong> and you get <strong style={{ color: C.PRIMARY }}>50 pts</strong> when they join!
            </p>
            <div style={s.codeBox}>
              <span style={{ fontSize: 26, fontWeight: 900, color: C.PRIMARY, letterSpacing: 8 }}>{referralCode}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button
                onClick={() => navigator.clipboard?.writeText(referralCode).then(() => alert('Copied!'))}
                style={s.copyBtn}
              >
                📋 Copy
              </button>
              {navigator.share && (
                <button
                  onClick={() => {
                    const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent);
                    const storeLink = isIOS
                      ? 'https://apps.apple.com/in/app/confirmslot/id6758349903'
                      : 'https://play.google.com/store/apps/details?id=com.identifier.confirmslot';
                    navigator.share({
                      title: 'Join Onezy — Get 25 Free Points',
                      text: `Join Onezy and book services instantly!\n\nUse my referral code ${referralCode} when signing up to get 25 free reward points! 🎁\n\nDownload the app: ${storeLink}`,
                    });
                  }}
                  style={s.shareBtn}
                >
                  Share
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* How to earn */}
        <div style={s.card}>
          <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>How to Earn Points</p>
          {EARN_ITEMS.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i < EARN_ITEMS.length - 1 ? 12 : 0, marginBottom: i < EARN_ITEMS.length - 1 ? 12 : 0, borderBottom: i < EARN_ITEMS.length - 1 ? `1px solid ${C.BORDER}` : 'none' }}>
              <div style={s.earnIcon}>{item.icon}</div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.TEXT1 }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: 12, color: C.TEXT3 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction history */}
        <div style={s.card}>
          <p style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700, color: C.TEXT1 }}>Transaction History</p>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: 32 }}>📭</p>
              <p style={{ margin: 0, color: C.TEXT3, fontSize: 14 }}>No transactions yet</p>
            </div>
          ) : transactions.map((tx, i) => (
            <div key={tx._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: i < transactions.length - 1 ? 12 : 0, marginBottom: i < transactions.length - 1 ? 12 : 0, borderBottom: i < transactions.length - 1 ? `1px solid ${C.BORDER}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ ...s.txIcon, backgroundColor: tx.type === 'credit' ? '#D1FAE5' : '#FEE2E2' }}>
                  <span style={{ fontSize: 16 }}>{tx.type === 'credit' ? '↑' : '↓'}</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.TEXT1 }}>{txLabel(tx.reason)}</p>
                  <p style={{ margin: 0, fontSize: 11, color: C.TEXT3 }}>{formatDate(tx.createdAt)}</p>
                </div>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, color: txColor(tx.type) }}>
                {txSign(tx.type)}{tx.points} pts
              </span>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}

const s = {
  back:         { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.PRIMARY, fontWeight: 700, padding: 0 },
  spinner:      { width: 40, height: 40, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  balanceCard:  { background: `linear-gradient(135deg, ${C.PRIMARY} 0%, #7c3aed 100%)`, margin: '16px', borderRadius: 20, padding: '24px 20px' },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', margin: '14px 0' },
  card:         { backgroundColor: '#fff', borderRadius: 16, padding: 16, margin: '0 16px 14px', border: `1px solid ${C.BORDER}` },
  codeBox:      { backgroundColor: '#F5F3FF', borderRadius: 12, padding: '16px', border: `2px dashed ${C.PRIMARY}`, textAlign: 'center' },
  copyBtn:      { flex: 1, padding: '12px', borderRadius: 12, backgroundColor: '#F5F3FF', color: C.PRIMARY, border: `1.5px solid ${C.PRIMARY}`, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  shareBtn:     { flex: 1, padding: '12px', borderRadius: 12, backgroundColor: C.PRIMARY, color: '#fff', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  earnIcon:     { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 },
  txIcon:       { width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
};
