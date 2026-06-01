import { useEffect } from "react";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import PlatformBanner from "./components/PlatformBanner";
import ServicesPage from "./components/ServicesPage";
import AboutPage from "./components/AboutPage";
import OurAppPage from "./components/OurAppPage";
import ContactPage from "./components/ContactPage";
import EnquiryPage from "./components/EnquiryPage";
import WalkinLanding  from "./components/walkin/WalkinLanding";
import Login          from "./components/walkin/Login";
import ServiceDetail  from "./components/walkin/ServiceDetail";
import MyBookings     from "./components/walkin/MyBookings";
import ProtectedRoute from "./components/walkin/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

// Walkin routes don't show the main Header/Footer
const WALKIN_PATHS = ['/walkin', '/login', '/service', '/my-bookings'];
function Layout({ children }) {
  const location = useLocation();
  const isWalkin = WALKIN_PATHS.some(p => location.pathname.startsWith(p));
  if (isWalkin) return <>{children}</>;
  return (
    <>
      <Header />
      {children}
      <Footer />
      <WhatsAppFloatingButton />
    </>
  );
}

const HomePage = () => (
  <div>
    <section id="home">
      <HeroSection />
    </section>

    {/* About, Services, and Our App sections removed as requested */}

    <PlatformBanner />
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
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services"  element={<ServicesPage />} />
            <Route path="/about-us"  element={<AboutPage />} />
            <Route path="/our-app"   element={<OurAppPage />} />
            <Route path="/contact"   element={<ContactPage />} />
            <Route path="/enquiry"   element={<EnquiryPage />} />

            {/* Walk-in queue routes */}
            <Route path="/walkin/:spId"  element={<WalkinLanding />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/service/:spId" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
            <Route path="/my-bookings"   element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
