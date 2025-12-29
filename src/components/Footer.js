import React from 'react';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          
          {/* About Section */}
          <div className="footer-column">
            <h4>Confirm Slot</h4>
            <p className="footer-desc">
              Streamline your appointment scheduling with our advanced token management system.
            </p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebook /></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
            </div>
          </div>
          
          {/* Services */}
          <div className="footer-column">
            <h4>Our Services</h4>
            <ul>
              <li>Instant Appointment Booking</li>
              <li>Automated Token Management</li>
              <li>Real-Time Queue Updates</li>
              <li>Multi-Device Synchronization</li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about-us">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/our-app">Our App</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="footer-column">
            <h4>Stay Updated</h4>
            <p className="newsletter-desc">Subscribe to our newsletter for updates</p>
            <div className="newsletter-input">
              <input type="email" placeholder="Your email" />
              <button>→</button>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© 2025 Confirm Slot. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;