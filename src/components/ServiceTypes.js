import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./ServiceTypes.css";

/* Primary booking models — the core way a business serves customers. */
const MODELS = [
  {
    icon: "🕐",
    title: "Timed appointments",
    desc: "Customers pick an exact time slot and get instant confirmation.",
    tag: "Book a slot",
    accent: "#511F9F",
    tint: "#F1EBFA",
  },
  {
    icon: "🌤️",
    title: "AM / PM sessions",
    desc: "Open half-day sessions and serve many customers at their convenience.",
    tag: "Session based",
    accent: "#0284C7",
    tint: "#E0F2FE",
  },
  {
    icon: "🎫",
    title: "Walk-in tokens",
    desc: "Live running token numbers replace physical queues and waiting rooms.",
    tag: "No queue",
    accent: "#D97706",
    tint: "#FEF3C7",
  },
  {
    icon: "🔁",
    title: "Recurring appointments",
    desc: "Set weekly or monthly repeats — customers book once and you're done.",
    tag: "Auto-repeat",
    accent: "#0D9488",
    tint: "#E0F7F6",
  },
  {
    icon: "🎪",
    title: "Events & carnivals",
    desc: "Run events and carnivals with coupon redemption in a single tap.",
    tag: "Coupons",
    accent: "#DB2777",
    tint: "#FCE7F3",
  },
  {
    icon: "👥",
    title: "Group bookings",
    desc: "Let a family or group reserve the same slot together in one go.",
    tag: "Multiple people",
    accent: "#0891B2",
    tint: "#CFFAFE",
  },
];

/* Capabilities that apply across every booking model (2 per row). */
const CAPABILITIES = [
  {
    icon: "💇",
    title: "Book your specialist",
    desc: "Let customers choose their favourite stylist, doctor or expert.",
    accent: "#E11D48",
    tint: "#FFE4E6",
  },
  {
    icon: "➕",
    title: "Services + add-ons",
    desc: "Pick a service and stack on add-ons right while booking.",
    accent: "#7C3AED",
    tint: "#EDE9FE",
  },
  {
    icon: "💳",
    title: "Online & offline payments",
    desc: "Take payment online up front or collect it at the counter.",
    accent: "#059669",
    tint: "#DCFCE7",
  },
  {
    icon: "🏠",
    title: "Online & on-premise",
    desc: "Serve customers at your place or theirs — video or in person.",
    accent: "#4F46E5",
    tint: "#E0E7FF",
  },
  {
    icon: "🔳",
    title: "QR code booking",
    desc: "Share a QR instead of your number in public — scan, book, done.",
    accent: "#475569",
    tint: "#E2E8F0",
  },
  {
    icon: "🔔",
    title: "Reminders & alerts",
    desc: "Auto SMS, WhatsApp & push so nobody ever misses a booking.",
    accent: "#EA580C",
    tint: "#FFEDD5",
  },
];

const AUDIENCE = [
  {
    side: "For customers",
    icon: "📱",
    title: "Every kind of booking, one app",
    points: [
      "Book a slot, join a queue or reserve an event",
      "Choose your person, service and add-ons",
      "Pay online or at the counter — your call",
    ],
  },
  {
    side: "For providers",
    icon: "🗂️",
    title: "Run it all from one dashboard",
    points: [
      "Slots, sessions, tokens & recurring in one place",
      "Share a QR — no more shouting phone numbers",
      "Track payments, coupons and staff at a glance",
    ],
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const ServiceTypes = () => {
  const navigate = useNavigate();

  return (
    <section className="st-section" id="services">
      {/* decorative background blobs */}
      <span className="st-blob st-blob-a" aria-hidden="true" />
      <span className="st-blob st-blob-b" aria-hidden="true" />

      <div className="st-inner">
        {/* Intro */}
        <motion.div className="st-intro" {...fadeUp}>
          <span className="st-eyebrow">One app · every booking type</span>
          <h2 className="st-title">Everything your business runs on, in one place</h2>
          <p className="st-sub">
            Easy for you to manage, effortless for your customers to book — whatever kind
            of service you offer.
          </p>
        </motion.div>

        {/* Dual-audience split */}
        <div className="st-audience">
          {AUDIENCE.map((a, i) => (
            <motion.div
              key={a.side}
              className={`st-aud-card ${i === 1 ? "st-aud-dark" : ""}`}
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
            >
              <div className="st-aud-head">
                <span className="st-aud-ic">{a.icon}</span>
                <span className="st-aud-side">{a.side}</span>
              </div>
              <h3 className="st-aud-title">{a.title}</h3>
              <ul className="st-aud-list">
                {a.points.map((p) => (
                  <li key={p}>
                    <span className="st-check" aria-hidden="true">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Primary booking models */}
        <div className="st-grid">
          {MODELS.map((s, i) => (
            <motion.div
              key={s.title}
              className="st-card"
              style={{ "--accent": s.accent, "--tint": s.tint }}
              {...fadeUp}
              transition={{ delay: (i % 2) * 0.06 }}
            >
              <span className="st-card-glow" aria-hidden="true" />
              <span className="st-card-ic">{s.icon}</span>
              <div className="st-card-body">
                <div className="st-card-top">
                  <h3 className="st-card-title">{s.title}</h3>
                  <span className="st-card-tag">{s.tag}</span>
                </div>
                <p className="st-card-desc">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cross-cutting capabilities */}
        <motion.div className="st-caps-head" {...fadeUp}>
          <span className="st-caps-line" aria-hidden="true" />
          <span className="st-caps-label">Plus everything you need to run it</span>
          <span className="st-caps-line" aria-hidden="true" />
        </motion.div>

        <div className="st-caps-grid">
          {CAPABILITIES.map((c, i) => (
            <motion.div
              key={c.title}
              className="st-cap"
              style={{ "--accent": c.accent, "--tint": c.tint }}
              {...fadeUp}
              transition={{ delay: (i % 2) * 0.06 }}
            >
              <span className="st-cap-ic">{c.icon}</span>
              <div className="st-cap-body">
                <p className="st-cap-title">{c.title}</p>
                <p className="st-cap-desc">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div className="st-cta" {...fadeUp}>
          <div className="st-cta-left">
            <h3 className="st-cta-title">Offer any of these — or all of them.</h3>
            <p className="st-cta-sub">
              One platform grows with your business. Set up in minutes, no code needed.
            </p>
          </div>
          <div className="st-cta-actions">
            <button className="st-btn st-btn-primary" type="button" onClick={() => navigate("/enquiry")}>
              Get started free
            </button>
            <button className="st-btn st-btn-ghost" type="button" onClick={() => navigate("/services")}>
              Explore services
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceTypes;
