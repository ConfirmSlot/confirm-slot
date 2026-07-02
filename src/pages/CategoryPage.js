import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { C, IMG } from '../styles/colors';
import AppLayout from '../components/app/AppLayout';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(id === 'all' ? null : id);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort] = useState('');

  useEffect(() => {
    api.open('/v1/categories').then(r => { if (r.success) setCategories(r.categories || r.data || []); });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedCat) params.set('catId', selectedCat);
    if (sort) params.set('sort', sort);
    api.open(`/v1/serviceproviders?${params}`)
      .then(r => setProviders(r.providers || r.data || r.serviceProviders || []))
      .finally(() => setLoading(false));
  }, [selectedCat, search, sort]);

  const catName = categories.find(c => c._id === selectedCat)?.name;

  return (
    <AppLayout title={catName || 'Category'}>
      <div style={{ padding: '16px 16px 0' }}>

        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          style={s.search}
        />

        {/* Category chips */}
        <div style={s.chips}>
          <Chip label="All" active={!selectedCat} onClick={() => setSelectedCat(null)} />
          {categories.map(c => (
            <Chip key={c._id} label={c.name} active={selectedCat === c._id} onClick={() => setSelectedCat(c._id)} />
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div style={s.center}><Spinner /></div>
        ) : providers.length === 0 ? (
          <div style={s.center}>
            <p style={{ color: C.TEXT3, fontSize: 15 }}>No services found</p>
          </div>
        ) : (
          <div className="app-grid" style={{ paddingBottom: 20 }}>
            {providers.map((sp, i) => <SPCard key={sp.serviceProvider?._id || i} sp={sp} navigate={navigate} />)}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function SPCard({ sp, navigate }) {
  const info = sp.serviceProvider;
  const img = info?.images?.[0]?.path || info?.icon;
  const spId = info?._id;
  return (
    <div style={s.card} onClick={() => navigate(`/sp/${spId}`)}>
      <div style={s.cardImg}>
        {IMG(img) ? (
          <img src={IMG(img)} alt={info?.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#511f9f,#8b6bc7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 32 }}>🏪</span>
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: '0 0 0 14px' }}>
        <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: C.TEXT1 }}>{info?.title}</p>
        <p style={{ margin: '0 0 4px', fontSize: 12, color: C.TEXT3 }}>📍 {info?.buisness?.city}, {info?.buisness?.state}</p>
        {info?.details?.minPrice > 0 && (
          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: C.PRIMARY }}>₹{info.details.minPrice} – ₹{info.details.maxPrice}</p>
        )}
        <div style={{ marginTop: 6 }}>
          <span style={s.badge}>{info?.option === 'token' ? '🎫 Token' : info?.option === 'session' ? '📅 Session' : '📆 Appointment'}</span>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...s.chip, ...(active ? s.chipActive : {}) }}>{label}</button>
  );
}

function Spinner() {
  return <div style={{ width: 32, height: 32, border: `3px solid ${C.PRIMARY_LIGHT}`, borderTop: `3px solid ${C.PRIMARY}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />;
}

const s = {
  backBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: C.PRIMARY, fontWeight: 700, padding: 0 },
  search: { width: '100%', padding: '12px 16px', borderRadius: 12, border: `1.5px solid ${C.BORDER}`, fontSize: 14, outline: 'none', marginBottom: 14, boxSizing: 'border-box', color: C.TEXT1 },
  chips: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 14, scrollbarWidth: 'none' },
  chip: { padding: '7px 14px', borderRadius: 20, border: `1.5px solid ${C.BORDER}`, background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', color: C.TEXT1 },
  chipActive: { backgroundColor: C.PRIMARY, borderColor: C.PRIMARY, color: '#fff' },
  center: { minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  card: { display: 'flex', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', boxShadow: `0 2px 12px ${C.SHADOW}`, padding: 12, alignItems: 'center' },
  cardImg: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0 },
  badge: { fontSize: 11, backgroundColor: C.PRIMARY_LIGHT, color: C.PRIMARY, padding: '3px 8px', borderRadius: 8, fontWeight: 600 },
};
