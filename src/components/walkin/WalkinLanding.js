import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../../config/api';

const IOS_URL     = 'https://apps.apple.com/in/app/confirmslot/id6758349903';
const ANDROID_URL = 'https://play.google.com/store/apps/details?id=com.identifier.confirmslot';
const DEEP_LINK   = (spId) => `confirmslot://walkin/${spId}`;

export default function WalkinLanding() {
  const { spId }    = useParams();
  const navigate    = useNavigate();
  const [venue, setVenue]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/v1/tokens/walkin/${spId}/info`)
      .then(r => r.json())
      .then(d => { if (d.success) setVenue(d.venue); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [spId]);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  const handleDownload = () => {
    // Try deep link first — if app installed it opens, otherwise redirect to store
    const storeUrl = isIOS ? IOS_URL : ANDROID_URL;
    window.location.href = DEEP_LINK(spId);
    setTimeout(() => { window.open(storeUrl, '_blank'); }, 1500);
  };

  const handleContinue = () => {
    navigate(`/service/${spId}`);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <CircularProgress style={{ color: '#6366f1' }} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Venue info */}
        {venue?.icon && (
          <img
            src={venue.icon.startsWith('http') ? venue.icon : `https://d3some4qkj9p5u.cloudfront.net/${venue.icon}`}
            alt={venue?.name}
            style={styles.icon}
            onError={e => { e.target.style.display = 'none'; }}
          />
        )}
        <h2 style={styles.venueName}>{venue?.name || 'Venue'}</h2>
        <p style={styles.subtitle}>Join the queue easily</p>

        <div style={styles.queueBadge}>
          <span style={styles.queueText}>
            {venue ? `${0} waiting` : '—'}
          </span>
        </div>

        <div style={styles.divider} />

        {/* Buttons */}
        <button style={styles.downloadBtn} onClick={handleDownload}>
          <span style={styles.btnIcon}>
            {isIOS ? '🍎' : '▶'}
          </span>
          Download the App
        </button>

        <button style={styles.continueBtn} onClick={handleContinue}>
          Continue in Browser
        </button>

        <p style={styles.hint}>
          Already have the app? It may have opened automatically.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    padding: '24px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '36px 28px',
    maxWidth: '380px',
    width: '100%',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  icon: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    objectFit: 'cover',
    marginBottom: '16px',
  },
  venueName: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: '0 0 16px',
  },
  queueBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: '20px',
    padding: '6px 16px',
    marginBottom: '24px',
  },
  queueText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: '#e2e8f0',
    marginBottom: '24px',
  },
  downloadBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: '#0f172a',
    color: '#fff',
    border: 'none',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  btnIcon: {
    fontSize: '18px',
  },
  continueBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '16px',
  },
  hint: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
  },
};
