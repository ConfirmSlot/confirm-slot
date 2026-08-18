import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_ENDPOINTS } from "../config/api";
import "./SpRegisterPage.css";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
};

const SpRegisterPage = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    categoryId: "", categoryName: "",
    subcategoryId: "", subcategoryName: "",
    contractorCode: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetch(`${API_ENDPOINTS.CATEGORIES}?limit=100`)
      .then((r) => r.json())
      .then((data) => {
        const cats = Array.isArray(data) ? data : (data.categories || data.data || []);
        setCategories(cats.filter((c) => !c.isDeleted && !c.isCarnival));
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({ ...prev, phone: digits }));
    if (digits.length === 10) setErrors((prev) => ({ ...prev, phone: "" }));
    else if (digits.length > 0) setErrors((prev) => ({ ...prev, phone: "Enter a valid 10-digit phone number" }));
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const cat = categories.find((c) => c._id === catId);
    setSubcategories(cat?.subcategories || []);
    setForm((prev) => ({
      ...prev,
      categoryId: catId,
      categoryName: cat?.name || "",
      subcategoryId: "",
      subcategoryName: "",
    }));
    if (errors.categoryId) setErrors((prev) => ({ ...prev, categoryId: "" }));
  };

  const handleSubcategoryChange = (e) => {
    const subId = e.target.value;
    const sub = subcategories.find((s) => s._id === subId);
    setForm((prev) => ({
      ...prev,
      subcategoryId: subId,
      subcategoryName: sub?.name || "",
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) e.phone = "Enter a valid 10-digit phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.categoryId) e.categoryId = "Select your business category";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch(API_ENDPOINTS.SP_LEADS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setServerError(data.message || "Something went wrong. Please try again.");
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="spr-page">
        <motion.div className="spr-success" {...fadeUp} transition={{ duration: 0.5 }}>
          <div className="spr-success-icon">🎉</div>
          <h2>Request Received!</h2>
          <p>
            Thank you <strong>{form.name}</strong>! Our team will call you on{" "}
            <strong>{form.phone}</strong> within 24 hours to get you set up on Onezy.
          </p>
          <div className="spr-success-detail">
            <span>📂 {form.categoryName}{form.subcategoryName ? ` › ${form.subcategoryName}` : ""}</span>
            <span>📧 {form.email}</span>
          </div>
          <a href="/" className="spr-back-btn">Back to Home</a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="spr-page">
      <div className="spr-hero">
        <motion.div className="spr-hero-inner" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="spr-eyebrow">For Service Providers</span>
          <h1>List your business on Onezy</h1>
          <p>Fill in your details — our team will call you and get you live within 24 hours.</p>
        </motion.div>
      </div>

      <div className="spr-body">
        <motion.div className="spr-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>

          <div className="spr-steps-bar">
            {["Your Details", "Business Category", "Submit"].map((label, i) => (
              <div key={label} className="spr-step-item">
                <div className="spr-step-dot">{i + 1}</div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <form className="spr-form" onSubmit={handleSubmit} noValidate>
            <div className="spr-section-label">Your Details</div>

            <div className="spr-field">
              <label htmlFor="name">Full Name / Business Name *</label>
              <input
                id="name" name="name" type="text"
                placeholder="e.g. Raji's Salon"
                value={form.name} onChange={handleChange}
                className={errors.name ? "error" : ""}
              />
              {errors.name && <span className="spr-error">{errors.name}</span>}
            </div>

            <div className="spr-row">
              <div className="spr-field">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  id="phone" name="phone" type="tel"
                  placeholder="9876543210"
                  value={form.phone} onChange={handlePhoneChange}
                  className={errors.phone ? "error" : form.phone.length === 10 ? "valid" : ""}
                  maxLength={10}
                  inputMode="numeric"
                />
                {errors.phone && <span className="spr-error">{errors.phone}</span>}
              </div>
              <div className="spr-field">
                <label htmlFor="email">Email Address *</label>
                <input
                  id="email" name="email" type="email"
                  placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && <span className="spr-error">{errors.email}</span>}
              </div>
            </div>

            <div className="spr-field">
              <label htmlFor="contractorCode">
                Contractor Code <span className="spr-optional">(optional — if referred by a contractor)</span>
              </label>
              <input
                id="contractorCode" name="contractorCode" type="text"
                placeholder="e.g. CTR-001"
                value={form.contractorCode}
                onChange={e => setForm(prev => ({ ...prev, contractorCode: e.target.value.toUpperCase() }))}
                style={{ textTransform: 'uppercase', letterSpacing: 2 }}
              />
            </div>

            <div className="spr-section-label" style={{ marginTop: 24 }}>Business Category</div>

            <div className="spr-row">
              <div className="spr-field">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  value={form.categoryId}
                  onChange={handleCategoryChange}
                  className={errors.categoryId ? "error" : ""}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <span className="spr-error">{errors.categoryId}</span>}
              </div>

              <div className="spr-field">
                <label htmlFor="subcategory">Subcategory <span className="spr-optional">(optional)</span></label>
                <select
                  id="subcategory"
                  value={form.subcategoryId}
                  onChange={handleSubcategoryChange}
                  disabled={!subcategories.length}
                >
                  <option value="">Select subcategory</option>
                  {subcategories.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {serverError && (
              <AnimatePresence>
                <motion.div className="spr-server-error" {...fadeUp}>
                  {serverError}
                </motion.div>
              </AnimatePresence>
            )}

            <button type="submit" className="spr-submit" disabled={submitting}>
              {submitting ? <span className="spr-spinner" /> : "Send Registration Request"}
            </button>

            <p className="spr-privacy">
              We'll only use your details to contact you about setting up your Onezy profile.
              No spam, ever.
            </p>
          </form>
        </motion.div>

        <motion.div className="spr-trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {[
            { icon: "📞", title: "We call you", desc: "Our team contacts you within 24 hours" },
            { icon: "🚀", title: "Quick setup", desc: "Go live in minutes with our app" },
            { icon: "💸", title: "Free to list", desc: "No upfront cost to join Onezy" },
          ].map((item) => (
            <div key={item.title} className="spr-trust-item">
              <span className="spr-trust-icon">{item.icon}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SpRegisterPage;
