import React from "react";
import { motion } from "framer-motion";
import "./OverviewSection.css";

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
      </div>
    </section>
  );
};

export default OverviewSection;
