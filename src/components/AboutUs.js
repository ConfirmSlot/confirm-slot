import React from 'react';
import './AboutUs.css';

const About = () => {
  return (
    <div className="about-container">
      <header className="about-header">
        <h1 className="about-title">About Us</h1>
        <p className="about-subtitle">
          Your streamlined solution for managing appointments and tokens efficiently.
        </p>
      </header>

      <section className="about-content">
        <div className="about-section">
          <h2 className="about-heading">What We Do</h2>
          <p className="about-text">
            Our system is designed to bring structure and simplicity to the chaos of traditional appointments.
            Whether you're running a clinic, office, or a service center, our solution ensures customers are
            served promptly and fairly.
          </p>
        </div>

        <div className="about-section">
          <h2 className="about-heading">How It Works</h2>
          <ul className="about-list">
            <li className="about-list-item">Book appointments through an intuitive interface.</li>
            <li className="about-list-item">Generate secure digital tokens instantly.</li>
            <li className="about-list-item">Track token status in real-time with alerts.</li>
            <li className="about-list-item">Get notified when your turn is near.</li>
            <li className="about-list-item">Access and manage everything on web or mobile.</li>
          </ul>
        </div>

        <div className="about-section">
          <h2 className="about-heading">Why Choose Us?</h2>
          <p className="about-text">
            ✔️ Eliminate long queues and waiting times. <br />
            ✔️ Improve customer satisfaction and business productivity. <br />
            ✔️ Reduce no-shows with timely reminders. <br />
            ✔️ Access detailed analytics to understand footfall and optimize staff allocation.
          </p>
        </div>

        <div className="about-section">
          <h2 className="about-heading">Who Can Use This?</h2>
          <p className="about-text">
            Our platform is ideal for a wide range of sectors:
          </p>
          <ul className="about-list">
            <li className="about-list-item">🏥 Hospitals & Clinics</li>
            <li className="about-list-item">🏛️ Government Offices</li>
            <li className="about-list-item">🏦 Banks & Financial Institutions</li>
            <li className="about-list-item">🎓 Educational Institutions</li>
            <li className="about-list-item">💇‍♂️ Salons, Spas & Service Hubs</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default About;
