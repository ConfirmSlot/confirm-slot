import React from 'react';
import { motion } from 'framer-motion';
import './HealthCheckSection.css';

const HealthCheckSection = () => {
  return (
    <motion.section
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="health-check-section"
    >
      <div className="health-card">
        <div className="health-content">
          <h3>
          Smart Appointment & Token System<br />
          Book Instantly, Skip the Queue!
          </h3>
          <button className="appointment-btn">Book For Appointment</button>
        </div>
      </div>
    </motion.section>
  );
};

export default HealthCheckSection;
