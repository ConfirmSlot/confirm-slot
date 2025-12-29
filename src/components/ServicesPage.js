import React from 'react';
import { motion } from 'framer-motion';
import './ServicesPage.css';

const ServicesPage = () => {
  const coreServices = [
    {
      title: 'Online Appointment Booking',
      description: 'Allow customers to book appointments 24/7 through web or mobile app with instant confirmation and calendar integration.',
      features: ['Real-time availability', 'Calendar sync', 'Automated reminders', 'Easy rescheduling']
    },
    {
      title: 'Digital Token Management',
      description: 'Generate and manage digital tokens automatically, eliminating physical queues and reducing wait time confusion.',
      features: ['Instant token generation', 'QR code support', 'Priority queuing', 'Multi-counter support']
    },
    {
      title: 'Queue Management System',
      description: 'Advanced queue management with live tracking, estimated wait times, and intelligent queue optimization.',
      features: ['Live queue status', 'Wait time estimates', 'Queue analytics', 'Peak hour management']
    },
    {
      title: 'Staff Dashboard',
      description: 'Comprehensive admin panel for managing appointments, tokens, and customer flow with real-time insights.',
      features: ['Token control panel', 'Customer management', 'Service tracking', 'Performance metrics']
    },
    {
      title: 'Multi-Channel Notifications',
      description: 'Keep customers informed with automated notifications via SMS, email, push notifications, and WhatsApp.',
      features: ['SMS alerts', 'Email notifications', 'Push messages', 'WhatsApp integration']
    },
    {
      title: 'Analytics & Reporting',
      description: 'Detailed insights into customer flow, wait times, staff performance, and operational efficiency.',
      features: ['Custom reports', 'Data visualization', 'Trend analysis', 'Export capabilities']
    }
  ];

  const additionalServices = [
    {
      icon: '🏢',
      title: 'Multi-Location Support',
      description: 'Manage multiple branches from a single dashboard with centralized control and location-specific customization.'
    },
    {
      icon: '🔒',
      title: 'Secure & Compliant',
      description: 'Enterprise-grade security with data encryption, GDPR compliance, and regular security audits.'
    },
    {
      icon: '🔗',
      title: 'API Integration',
      description: 'Seamlessly integrate with existing systems, CRM platforms, and third-party applications.'
    },
    {
      icon: '📱',
      title: 'Mobile Apps',
      description: 'Native iOS and Android apps for customers and staff with offline mode support.'
    },
    {
      icon: '🎨',
      title: 'White Label Solution',
      description: 'Fully customizable platform with your branding, colors, and domain name.'
    },
    {
      icon: '🌐',
      title: 'Multi-Language Support',
      description: 'Support for multiple languages to serve diverse customer bases effectively.'
    }
  ];

  const industries = [
    {
      name: 'Healthcare',
      services: ['Patient appointments', 'Doctor scheduling', 'Lab queue management', 'Pharmacy tokens'],
      color: '#10b981'
    },
    {
      name: 'Banking & Finance',
      services: ['Customer service queues', 'Loan appointments', 'Account services', 'ATM management'],
      color: '#3b82f6'
    },
    {
      name: 'Government',
      services: ['Citizen services', 'Document processing', 'License renewals', 'Public consultations'],
      color: '#8b5cf6'
    },
    {
      name: 'Retail & Service',
      services: ['Salon bookings', 'Spa appointments', 'Car service', 'Restaurant waitlist'],
      color: '#f59e0b'
    },
    {
      name: 'Education',
      services: ['Admission counseling', 'Faculty meetings', 'Library services', 'Student services'],
      color: '#ec4899'
    },
    {
      name: 'Corporate',
      services: ['Meeting rooms', 'HR consultations', 'IT helpdesk', 'Visitor management'],
      color: '#6366f1'
    }
  ];

  const pricingFeatures = [
    'Unlimited appointments',
    'Unlimited tokens',
    'Real-time notifications',
    'Advanced analytics',
    'Multi-location support',
    'Priority support',
    'Custom integrations',
    'White label options'
  ];

  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="services-hero">
        <motion.div
          className="services-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="services-page-title">Our Services</h1>
          <p className="services-page-subtitle">
            Comprehensive appointment and queue management solutions designed to streamline your operations and enhance customer experience
          </p>
        </motion.div>
      </section>

      <div className="section-divider"></div>

      {/* Core Services Section */}
      <section className="core-services-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Core Services</h2>
          <p className="section-description">
            Everything you need to manage appointments and queues efficiently
          </p>
        </motion.div>

        <div className="core-services-grid">
          {coreServices.map((service, index) => (
            <motion.div
              key={index}
              className="core-service-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-description">{service.description}</p>
              <ul className="service-features-list">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="service-feature-item">
                    <span className="feature-checkmark">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Additional Services Section */}
      <section className="additional-services-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Additional Features</h2>
          <p className="section-description">
            Extended capabilities to enhance your operations
          </p>
        </motion.div>

        <div className="additional-services-grid">
          {additionalServices.map((service, index) => (
            <motion.div
              key={index}
              className="additional-service-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="service-icon">{service.icon}</div>
              <h3 className="additional-service-title">{service.title}</h3>
              <p className="additional-service-description">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Industries Section */}
      <section className="industries-services-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Industry-Specific Solutions</h2>
          <p className="section-description">
            Tailored services for your specific industry needs
          </p>
        </motion.div>

        <div className="industries-services-grid">
          {industries.map((industry, index) => (
            <motion.div
              key={index}
              className="industry-service-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div 
                className="industry-card-header" 
                style={{ borderLeftColor: industry.color }}
              >
                <h3 className="industry-service-name">{industry.name}</h3>
              </div>
              <ul className="industry-services-list">
                {industry.services.map((service, idx) => (
                  <li key={idx} className="industry-service-item">{service}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      {/* Pricing Preview Section */}
      <section className="pricing-preview-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title">Enterprise Features Included</h2>
          <p className="section-description">
            All plans come with comprehensive features
          </p>
        </motion.div>

        <motion.div
          className="pricing-features-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="pricing-features-grid">
            {pricingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="pricing-feature-item"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="pricing-feature-check">✓</span>
                <span className="pricing-feature-text">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <div className="section-divider"></div>

      {/* CTA Section */}
      <section className="services-cta-section">
        <motion.div
          className="services-cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-description">
            Choose the perfect plan for your business or contact us for a custom solution
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

          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ServicesPage;