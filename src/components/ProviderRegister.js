import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./ProviderRegister.css";

const IOS_URL = "https://apps.apple.com/in/app/confirmslot/id6758349903";
const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.identifier.confirmslot";

/* Three-step onboarding for service providers. */
const STEPS = [
  {
    icon: "📲",
    step: "Step 1",
    title: "Download the app",
    desc: "Grab the ConfirmSlot app free from the App Store or Google Play.",
    accent: "#511F9F",
    tint: "#F1EBFA",
  },
  {
    icon: "🔑",
    step: "Step 2",
    title: "Login securely",
    desc: "Sign in with your phone number and a one-time OTP — no passwords.",
    accent: "#0284C7",
    tint: "#E0F2FE",
  },
  {
    icon: "✅",
    step: "Step 3",
    title: "Register in a few clicks",
    desc: "Add your business details, services and slots — you're live in minutes.",
    accent: "#059669",
    tint: "#DCFCE7",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const ProviderRegister = () => {
  const navigate = useNavigate();

  return (
    <section className="pr-section" id="providers">
      <span className="pr-blob pr-blob-a" aria-hidden="true" />
      <span className="pr-blob pr-blob-b" aria-hidden="true" />

      <div className="pr-inner">
        {/* Intro */}
        <motion.div className="pr-intro" {...fadeUp}>
          <span className="pr-eyebrow">For service providers</span>
          <h2 className="pr-title">List your business in a few clicks</h2>
          <p className="pr-sub">
            Are you a service provider? Download the app, log in and register your
            business in minutes — start taking bookings the same day.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="pr-steps">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              className="pr-step"
              style={{ "--accent": s.accent, "--tint": s.tint }}
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
            >
              <span className="pr-step-badge">{s.step}</span>
              <span className="pr-step-ic">{s.icon}</span>
              <h3 className="pr-step-title">{s.title}</h3>
              <p className="pr-step-desc">{s.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA + store buttons */}
        <motion.div className="pr-cta" {...fadeUp}>
          <div className="pr-cta-left">
            <h3 className="pr-cta-title">Ready to grow your business?</h3>
            <p className="pr-cta-sub">
              Download the ConfirmSlot app and register your services today.
            </p>
            <div className="pr-stores">
              <a href={IOS_URL} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiNQc5CapoSJE3sujvojLNNXipoAGDZYgUWw&s"
                  alt="Download on the App Store"
                />
              </a>
              <a href={ANDROID_URL} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                />
              </a>
            </div>
          </div>
          <div className="pr-cta-actions">
            <button className="pr-btn pr-btn-primary" type="button" onClick={() => navigate("/partner")}>
              Register your business
            </button>
            <button className="pr-btn pr-btn-ghost" type="button" onClick={() => navigate("/contact")}>
              Talk to us
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProviderRegister;
