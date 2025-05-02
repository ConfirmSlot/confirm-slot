import React from 'react';
import { motion } from 'framer-motion';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <motion.div
        className="hero-left"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1>Smart Appointment & Token Management</h1>
        {/* <p className="hero-subtext">
          Streamline your operations. Eliminate waiting. Delight your customers 
          with our automated appointment and queue management platform.
        </p> */}
        <p className="hero-subtext">
  Say goodbye to long queues and manual scheduling. Our smart platform automates appointments, assigns tokens instantly, and keeps users updated in real time—across all devices.
</p>

        <div className="hero-buttons">
          <motion.button
            className="talk-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Schedule a Demo
          </motion.button>
          <motion.button
            className="talk-button secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        className="hero-right"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.img
          src="https://png.pngtree.com/png-clipart/20231002/original/pngtree-young-afro-professional-doctor-png-image_13227671.png"
          alt="Appointment Booking"
          className="doctor-img"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="pill red"
          animate={{ x: [0, 15, 0], y: [0, -15, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="pill blue"
          animate={{ x: [0, -20, 0], y: [0, 20, 0], rotate: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
