import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import MobileAppSection from './components/MobileAppSection';
import Footer from './components/Footer';
import "./App.css";
import AboutPage from './components/AboutPage';
import AboutUs from './components/AboutUs';
import PlatformBanner from './components/PlatformBanner';

const App = () => {
  return (
    <div>
      <Header />
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
{/* <HealthCheckSection /> */}
<PlatformBanner />

<section id="contact">
  <Footer />
</section>
    </div>
  );
};

export default App;