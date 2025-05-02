import React from 'react';
import { motion } from 'framer-motion';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <section className="about">
      <motion.h1
        className="about-title"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Smart Appointment & Token Management
      </motion.h1>

      <motion.p
        className="about-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Simplify appointments and queues for clinics, banks, offices, and more.
      </motion.p>

      <div className="about-grid">
        <motion.div className="about-card" whileHover={{ scale: 1.05 }}>
          <h3>🚀 Key Features</h3>
          <ul>
            <li>🔹 Easy Online Booking</li>
            <li>🔹 Digital Token Generation</li>
            <li>🔹 Real-Time Queue Updates</li>
            <li>🔹 Staff Dashboard</li>
            <li>🔹 Custom Notifications</li>
            <li>🔹 Analytics & Reporting</li>
          </ul>
        </motion.div>

        <motion.div className="about-card" whileHover={{ scale: 1.05 }}>
          <h3>💼 Ideal For</h3>
          <ul>
            <li>Hospitals & Clinics</li>
            <li>Government Offices</li>
            <li>Banks & Institutions</li>
            <li>Educational Centres</li>
            <li>Salons & Service Hubs</li>
          </ul>
        </motion.div>

        <motion.div className="about-card" whileHover={{ scale: 1.05 }}>
          <h3>🔍 Local Services Platform</h3>
          <ul>
            <li>📍 Location-Based Search</li>
            <li>✅ Verified Listings</li>
            <li>🔎 Multiple Services Covered</li>
            <li>💬 Real Reviews</li>
            <li>📆 Instant Booking</li>
          </ul>
        </motion.div>

        <motion.div className="about-card" whileHover={{ scale: 1.05 }}>
          <h3>🚗 Services Offered</h3>
          <ul>
            <li>🏠 Home: Plumbers, Electricians</li>
            <li>🛁 Personal: Salons, Therapists</li>
            <li>🚗 Auto: Car Wash, Mechanics</li>
            <li>🏥 Health: Doctors, Dentists</li>
            <li>🖥️ Tech: IT Support</li>
          </ul>
        </motion.div>
      </div>

      <div className="about-cta">
        <motion.a
          className="cta-button"
          whileHover={{ scale: 1.1 }}
          href="#"
        >
          📞 Schedule a Demo
        </motion.a>
        <motion.a
          className="cta-button secondary"
          whileHover={{ scale: 1.1 }}
          href="#"
        >
          🔍 Find Nearby Services
        </motion.a>
      </div>
    </section>
  );
};

export default AboutPage;
