import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Import Routes instead of Switch
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MobileAppSection from './components/MobileAppSection';
import Footer from './components/Footer';
import AboutPage from './components/AboutPage';
import AboutUs from './components/AboutUs';
import PlatformBanner from './components/PlatformBanner';
import RegisterForm from './components/RegisterForm';
import './App.css';

const HomePage = () => (
  <div>
    <section id="home">
      <HeroSection />
    </section>

    <section id="about">
      <AboutUs />
    </section>

    <section id="services">
      <AboutPage />
    </section>

    <section id="ourapp">
      <MobileAppSection />
    </section>

    <PlatformBanner />

    <section id="contact">
      <Footer />
    </section>
  </div>
);

const App = () => {
    useEffect(() => {
    // Check if the current URL is api.confirmslot.com/
    if (
      window.location.hostname === 'api.confirmslot.com' &&
      window.location.pathname === '/'
    ) {
      window.location.replace('https://api.confirmslot.com/api-docs');
    }
  }, []);

  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterForm />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;