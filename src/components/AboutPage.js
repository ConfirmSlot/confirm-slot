import React from 'react';
import { motion } from 'framer-motion';
import './AboutPage.css';

const AboutPage = ({ embedded = false }) => {
  const features = [
    { icon: '📅', title: 'Easy Online Booking', desc: 'Intuitive interface for seamless appointment scheduling' },
    { icon: '🎫', title: 'Digital Token Generation', desc: 'Secure, instant token creation for queue management' },
    { icon: '📊', title: 'Real-Time Queue Updates', desc: 'Live tracking with instant notifications' },
    { icon: '👥', title: 'Staff Dashboard', desc: 'Comprehensive admin panel for operations' },
    { icon: '🔔', title: 'Custom Notifications', desc: 'Timely alerts via SMS, email, and push' },
    { icon: '📈', title: 'Analytics & Reporting', desc: 'Data-driven insights for optimization' }
  ];

  const benefits = [
    'Eliminate long queues and waiting times',
    'Improve customer satisfaction scores',
    'Reduce no-shows with timely reminders',
    'Increase operational efficiency',
    'Access detailed analytics and insights',
    'Seamless multi-location support'
  ];

  const industries = [
    { icon: '🏥', name: 'Hospitals & Clinics', desc: 'Patient appointment management' },
    { icon: '🏛️', name: 'Government Offices', desc: 'Citizen service queuing' },
    { icon: '🏦', name: 'Banks & Financial', desc: 'Customer service optimization' },
    { icon: '🎓', name: 'Educational Institutions', desc: 'Student service management' },
    { icon: '💇‍♂️', name: 'Salons & Spas', desc: 'Booking and queue handling' },
    { icon: '🚗', name: 'Auto Services', desc: 'Car wash and maintenance scheduling' }
  ];

  const services = [
    { category: 'Home Services', items: ['Plumbers', 'Electricians', 'Cleaners', 'Carpenters'] },
    { category: 'Personal Care', items: ['Salons', 'Spas', 'Therapists', 'Fitness'] },
    { category: 'Auto Services', items: ['Car Wash', 'Mechanics', 'Detailing'] },
    { category: 'Healthcare', items: ['Doctors', 'Dentists', 'Physiotherapy'] },
    { category: 'Tech Support', items: ['IT Services', 'Repairs', 'Installation'] }
  ];

  return (
    <div className={`about-page${embedded ? " embedded" : ""}`}>
      {!embedded && (
        <>
          {/* Hero Section */}
          <section className="about-hero">
            <motion.div
              className="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="page-title">Smart Appointment & Token Management</h1>
              <p className="page-subtitle">
                Your streamlined solution for managing appointments and tokens efficiently across all industries
              </p>
            </motion.div>
          </section>

          <div className="section-divider"></div>
        </>
      )}

      {/* What We Do Section */}
      <section className="about-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">What We Do</h2>
          <p className="section-description">
            Our system brings structure and simplicity to traditional appointment chaos. Whether you're running a clinic, 
            office, or service center, our solution ensures customers are served promptly and fairly.
          </p>
        </motion.div>
      </section>

      <div className="section-divider"></div>

      {/* Key Features Section */}
      <section className="features-showcase">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Key Features</h2>
          <p className="section-description">
            Powerful tools designed to streamline your operations and enhance customer experience
          </p>
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
              <div className="feature-icon-large">{feature.icon}</div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-desc">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      {/* How It Works Section */}
      <section className="how-it-works">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">How It Works</h2>
        </motion.div>

        <div className="steps-container">
          {[
            'Customer books an appointment through web or mobile app',
            'System automatically generates a unique digital token',
            'Customer receives confirmation with token number and estimated time',
            'Real-time queue updates notify customers of their position',
            'Staff dashboard manages the queue and calls tokens in order',
            'Customer gets notified when their turn approaches',
            'Service is provided and token is marked complete'
          ].map((step, index) => (
            <motion.div
              key={index}
              className="step-item"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="step-number">{index + 1}</div>
              <p className="step-text">{step}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Why Choose Us Section */}
      <section className="why-choose">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Why Choose Us?</h2>
        </motion.div>

        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="benefit-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="benefit-check">✓</div>
              <p className="benefit-text">{benefit}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Industries Section */}
      <section className="industries-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Who Can Use This?</h2>
          <p className="section-description">
            Our platform is ideal for a wide range of sectors and industries
          </p>
        </motion.div>

        <div className="industries-grid">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              className="industry-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="industry-icon">{industry.icon}</div>
              <h3 className="industry-name">{industry.name}</h3>
              <p className="industry-desc">{industry.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Services Section */}
      <section className="services-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Services We Support</h2>
          <p className="section-description">
            Comprehensive coverage across multiple service categories
          </p>
        </motion.div>

        <div className="services-grid">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="service-category-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="service-category">{service.category}</h3>
              <ul className="service-list">
                {service.items.map((item, idx) => (
                  <li key={idx} className="service-item">{item}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      {/* CTA Section */}
      <section className="about-cta-section">
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="cta-title">Ready to Transform Your Queue Management?</h2>
          <p className="cta-description">
            Join hundreds of businesses already using our platform to improve customer experience
          </p>
          <div className="cta-buttons">
            <motion.a
              href="tel:9176122210"
              className="cta-btn primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Schedule a Demo
            </motion.a>
            <motion.button
              className="cta-btn secondary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;