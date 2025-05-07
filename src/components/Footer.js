import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

const Footer = () => {
  return (
    <motion.footer
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="footer"
    >
      <div className="footer-container">
        <div>
          <h4>Confirm Slot</h4>
          <p>Subscribe</p>
          <div className="subscribe-box">
            <input type="email" placeholder="Your Email" />
            <button className="send-btn">➤</button>
          </div>
        </div>
        <div>
          <h4>Services</h4>
          <p>Instant Appointment Booking</p>
          <p>Automated Token Management</p>
          <p>Real-Time Queue Updates</p>
          <p>Multi-Device Synchronization</p>
        </div>
        <div>
          <h4>Update Link</h4>
          <p>About Us</p>
          <p>Service</p>
          <p>Our App</p>
          <p>News Blog</p>
        </div>
        <div>
          <h4>Location & Contact</h4>
          <p>34785 Pickford dr, Farmington hills<br />MI - 48335</p>
          <p>+91 91761 22210</p>
        </div>
      </div>
      <p className="copyright">© 2025 Confirm Slot</p>
    </motion.footer>
  );
};

export default Footer;
