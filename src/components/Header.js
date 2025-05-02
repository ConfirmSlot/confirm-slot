import React from 'react';
import { motion } from 'framer-motion';
import './Header.css'; // Make sure to import the CSS

const Header = () => {
  return (
    <motion.header
      className="header"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="logo">
        <img src="https://cdn4.vectorstock.com/i/1000x1000/76/53/confirm-rubber-stamp-vector-12827653.jpg" alt="Confirm Slot Logo" />
        <span>Confirm Slot</span>
      </div>
      <nav className="nav">
        <a href="#home">Home</a>
        <a href="#about">About Us</a>
        <a href="#services">Service</a>
        <a href="#ourapp">Our App</a>
        <a href="#contact">Contact</a>
      </nav>
      <div className="auth-buttons">
        <button className="sign-in">Sign In</button>
        <button className="login">Login</button>
      </div>
    </motion.header>
  );
};

export default Header;
