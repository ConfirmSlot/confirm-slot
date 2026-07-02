import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { IMG } from "../styles/colors";
import "./SwiggyBrowse.css";

const CAT_COLORS = [
  "#f1ebfa", "#FEE2E2", "#DCFCE7", "#FEF3C7",
  "#E0F2FE", "#FCE7F3", "#E0F7F6", "#ECFDF5",
];

export default function SwiggyBrowse() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.open("/v1/categories"),
      api.open("/v1/featuredservices"),
    ])
      .then(([cats, feat]) => {
        if (!alive) return;
        setCategories(cats.categories || cats.data || []);
        setFeatured(feat.featuredServices || feat.data || []);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filteredFeatured = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return featured;
    return featured.filter((f) => {
      const sp = f.serviceProvider?.serviceProvider;
      return (
        (sp?.title || "").toLowerCase().includes(q) ||
        (sp?.buisness?.city || "").toLowerCase().includes(q)
      );
    });
  }, [query, featured]);

  return (
    <div className="sw-browse">
      {/* Hero: location + search */}
      <section className="sw-hero">
        <div className="sw-hero-inner">
          <button className="sw-loc" type="button">
            <span className="sw-loc-icon">📍</span>
            <span className="sw-loc-text">
              <span className="sw-loc-label">SERVICES NEAR</span>
              <span className="sw-loc-city">
                Chennai <span className="sw-loc-caret">▾</span>
              </span>
            </span>
          </button>

          <h1 className="sw-hero-title">
            Book trusted services,
            <br /> fast and hassle-free
          </h1>

          <div className="sw-search">
            <span className="sw-search-icon">🔍</span>
            <input
              className="sw-search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for salons, clinics, services…"
            />
          </div>
        </div>
      </section>

      {/* What's on your mind — categories */}
      {categories.length > 0 && (
        <section className="sw-section">
          <div className="sw-section-head">
            <h2 className="sw-section-title">What's on your mind?</h2>
            <button
              className="sw-seeall"
              type="button"
              onClick={() => navigate("/category/all")}
            >
              See all ›
            </button>
          </div>

          <div className="sw-cat-row">
            {categories.map((cat, i) => (
              <button
                key={cat._id}
                className="sw-cat"
                type="button"
                onClick={() => navigate(`/category/${cat._id}`)}
              >
                <span
                  className="sw-cat-img"
                  style={{ background: CAT_COLORS[i % CAT_COLORS.length] }}
                >
                  {IMG(cat.icon) ? (
                    <img
                      src={IMG(cat.icon)}
                      alt={cat.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <span className="sw-cat-emoji">🏷️</span>
                  )}
                </span>
                <span className="sw-cat-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Top services near you */}
      <section className="sw-section">
        <div className="sw-section-head">
          <h2 className="sw-section-title">Top services near you</h2>
          <button
            className="sw-seeall"
            type="button"
            onClick={() => navigate("/category/all")}
          >
            See all ›
          </button>
        </div>

        {loading ? (
          <div className="sw-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="sw-card sw-skeleton" />
            ))}
          </div>
        ) : filteredFeatured.length === 0 ? (
          <p className="sw-empty">
            No services found{query ? ` for “${query}”` : ""}.
          </p>
        ) : (
          <div className="sw-grid">
            {filteredFeatured.map((f) => {
              const sp = f.serviceProvider?.serviceProvider;
              const img = sp?.images?.[0]?.path || sp?.icon;
              const rating = sp?.rating ?? sp?.details?.rating ?? sp?.avgRating;
              return (
                <button
                  key={f._id}
                  className="sw-card"
                  type="button"
                  onClick={() => navigate(`/sp/${sp?._id}`)}
                >
                  <div className="sw-card-img">
                    {IMG(img) ? (
                      <img
                        src={IMG(img)}
                        alt={sp?.title}
                        onError={(e) => {
                          e.target.style.visibility = "hidden";
                        }}
                      />
                    ) : (
                      <div className="sw-card-ph">🏪</div>
                    )}
                    <span className="sw-card-scrim" />
                    {rating ? (
                      <span className="sw-rating">★ {Number(rating).toFixed(1)}</span>
                    ) : null}
                  </div>
                  <div className="sw-card-body">
                    <p className="sw-card-title">{sp?.title}</p>
                    {sp?.buisness?.city && (
                      <p className="sw-card-sub">{sp.buisness.city}</p>
                    )}
                    {sp?.details?.minPrice > 0 && (
                      <p className="sw-card-price">
                        ₹{sp.details.minPrice} – ₹{sp.details.maxPrice}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
