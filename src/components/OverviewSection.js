import React from "react";
import { motion } from "framer-motion";
import "./OverviewSection.css";

const IOS_URL = "https://apps.apple.com/in/app/confirmslot/id6758349903";
const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.identifier.confirmslot";
const PHONE = "+91 91761 22210";
const EMAIL = "in-sales@onezy.net";

const features = [
  { icon: "📅", title: "Online Booking", desc: "Let customers book 24/7 with instant confirmation." },
  { icon: "🎫", title: "Digital Tokens", desc: "Auto-generated tokens replace physical queues." },
  { icon: "📊", title: "Live Queue", desc: "Real-time status and accurate wait-time estimates." },
  { icon: "🔔", title: "Smart Alerts", desc: "SMS, email, push & WhatsApp updates in real time." },
  { icon: "📈", title: "Analytics", desc: "Insights on flow, wait times and staff performance." },
  { icon: "🏢", title: "Multi-Location", desc: "Manage every branch from one dashboard." },
];

const OverviewSection = () => {
  return (
    <section className="ov-section" id="about">
      <div className="ov-inner">
        {/* Intro */}
        <motion.div
          className="ov-intro"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="ov-eyebrow">Why Onezy</span>
          <h2 className="ov-title">Everything you need to manage appointments &amp; queues</h2>
          <p className="ov-sub">
            One smart platform for bookings, digital tokens and live queues — cutting
            wait times and freeing your team to focus on customers.
          </p>
        </motion.div>

        {/* Features */}
        <div className="ov-grid">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="ov-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <span className="ov-card-icon">{f.icon}</span>
              <h3 className="ov-card-title">{f.title}</h3>
              <p className="ov-card-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA band: get the app + contact */}
        <motion.div
          className="ov-band"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="ov-band-left">
            <h3 className="ov-band-title">Ready to cut the wait?</h3>
            <p className="ov-band-sub">
              Get the Onezy app or talk to us about a demo for your business.
            </p>
            <div className="ov-band-actions">
              <a className="ov-btn ov-btn-primary" href={`tel:${PHONE.replace(/\s/g, "")}`}>
                Schedule a Demo
              </a>
              <div className="ov-stores">
                <a href={IOS_URL} target="_blank" rel="noopener noreferrer" aria-label="Download on the App Store">
                  <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiNQc5CapoSJE3sujvojLNNXipoAGDZYgUWw&s"
                    alt="App Store"
                  />
                </a>
                <a href={ANDROID_URL} target="_blank" rel="noopener noreferrer" aria-label="Get it on Google Play">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Google Play"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="ov-band-divider" />

          <ul className="ov-contact">
            <li>
              <span className="ov-contact-ic">📞</span>
              <a href={`tel:${PHONE.replace(/\s/g, "")}`}>{PHONE}</a>
            </li>
            <li>
              <span className="ov-contact-ic">✉️</span>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <span className="ov-contact-ic">🕐</span>
              <span>Mon–Fri · 9:00 AM – 6:00 PM</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default OverviewSection;
