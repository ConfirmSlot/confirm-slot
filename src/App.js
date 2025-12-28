import { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import Routes instead of Switch
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import PlatformBanner from "./components/PlatformBanner";
import ServicesPage from "./components/ServicesPage";
import AboutPage from "./components/AboutPage";
import OurAppPage from "./components/OurAppPage";
import ContactPage from "./components/ContactPage";
import "./App.css";

const HomePage = () => (
  <div>
    <section id="home">
      <HeroSection />
    </section>

    {/* About, Services, and Our App sections removed as requested */}

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
      window.location.hostname === "api.confirmslot.com" &&
      window.location.pathname === "/"
    ) {
      window.location.replace("https://api.confirmslot.com/api-docs");
    }
  }, []);

  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/register" element={<RegisterForm />} /> */}
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/our-app" element={<OurAppPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
