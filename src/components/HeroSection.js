import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const features = [
    {
      title: 'Smart Scheduling',
      description: 'AI-powered appointment booking that adapts to your availability and preferences.'
    },
    {
      title: 'Token Management',
      description: 'Automated token generation and queue management for seamless customer flow.'
    },
    {
      title: 'Real-Time Updates',
      description: 'Instant notifications keep everyone informed about queue status and appointments.'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into wait times, customer flow, and operational efficiency.'
    }
  ];

  const stats = [
    { value: '100+', label: 'Appointments Daily' },
    { value: '5+', label: 'Active Businesses' },
    { value: '99.9%', label: 'Uptime Guaranteed' },
    { value: '4.9/5', label: 'Customer Rating' }
  ];

  const benefits = [
    'Reduce wait times by up to 70%',
    'Eliminate manual queue management',
    'Improve customer satisfaction scores',
    'Increase operational efficiency',
    'Seamless integration with existing systems',
    'Multi-location support'
  ];

  return (
    <>
      <section className="hero">
        <motion.div
          className="hero-left"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Smart Appointment & Token Management</h1>
          <p className="hero-subtext">
            Say goodbye to long queues and manual scheduling. Our smart platform automates appointments, assigns tokens instantly, and keeps users updated in real time—across all devices.
          </p>

          <div className="hero-buttons">
            <Link to="/contact">
              <motion.button
                className="talk-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule a Demo
              </motion.button>
            </Link>
            <Link to="/about-us">
              <motion.button
                className="talk-button secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="hero-right"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.img
            src="https://img.freepik.com/free-vector/appointment-booking-with-smartphone_23-2148554313.jpg"
            alt="Appointment Booking"
            className="doctor-img"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="stat-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Features Section */}
      <section className="features-section">
        <motion.div
          className="features-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Everything You Need to Manage Queues Efficiently</h2>
          <p>Powerful features designed to streamline your operations and enhance customer experience</p>
        </motion.div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* Benefits Section */}
      <section className="benefits-section">
        <motion.div
          className="benefits-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="benefits-left">
            <h2>Why Choose Our Platform?</h2>
            <p>Transform your business operations with proven results and satisfied customers worldwide.</p>
          </div>
          <div className="benefits-right">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="benefit-item"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="benefit-check">✓</span>
                <span className="benefit-text">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* CTA Section */}
      <section className="cta-section">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Transform Your Queue Management?</h2>
          <p>Join hundreds of businesses already using our platform to improve customer experience</p>
          <div className="cta-buttons">
            <Link to="/contact">
              <motion.button
                className="talk-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </Link>
            <motion.a
              href="tel:+919176122210"
              className="talk-button secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact
            </motion.a>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default HeroSection;