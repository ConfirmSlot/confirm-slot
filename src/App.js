import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";
import Header      from "./components/Header";
import HeroSection from "./components/HeroSection";
import Footer      from "./components/Footer";
import PlatformBanner from "./components/PlatformBanner";
import { AppBanner } from "./components/app/AppLayout";
import ServicesPage from "./components/ServicesPage";
import AboutPage    from "./components/AboutPage";
import OurAppPage   from "./components/OurAppPage";
import ContactPage  from "./components/ContactPage";
import EnquiryPage  from "./components/EnquiryPage";

// Walk-in (already built)
import WalkinLanding from "./components/walkin/WalkinLanding";
import Login         from "./components/walkin/Login";
import ServiceDetail from "./components/walkin/ServiceDetail";
import ProtectedRoute from "./components/walkin/ProtectedRoute";

// App pages (lazy loaded)
const Home             = lazy(() => import('./pages/Home'));
const CategoryPage     = lazy(() => import('./pages/CategoryPage'));
const SpProfile        = lazy(() => import('./pages/SpProfile'));
const BookAppointment  = lazy(() => import('./pages/BookAppointment'));
const BookToken        = lazy(() => import('./pages/BookToken'));
const BookSession      = lazy(() => import('./pages/BookSession'));
const Payment          = lazy(() => import('./pages/Payment'));
const PaymentSuccess   = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailure   = lazy(() => import('./pages/PaymentFailure'));
const BookingConfirm   = lazy(() => import('./pages/BookingConfirm'));
const MyBookings       = lazy(() => import('./pages/MyBookings'));
const Profile          = lazy(() => import('./pages/Profile'));
const Notifications    = lazy(() => import('./pages/Notifications'));
const Favourites       = lazy(() => import('./pages/Favourites'));
const Terms            = lazy(() => import('./pages/Terms'));
const CarnivalList     = lazy(() => import('./pages/CarnivalList'));
const CarnivalDetail   = lazy(() => import('./pages/CarnivalDetail'));
const CustomerDetails  = lazy(() => import('./pages/CustomerDetails'));
const BranchSelection  = lazy(() => import('./pages/BranchSelection'));

const MARKETING_PATHS = ['/', '/services', '/about-us', '/our-app', '/contact', '/enquiry'];

function Layout({ children }) {
  const { pathname } = useLocation();
  const isMarketing = MARKETING_PATHS.includes(pathname);
  const isWalkin = ['/service/'].some(p => pathname.startsWith(p));

  if (isWalkin) return <>{children}</>;
  if (isMarketing) return (
    <>
      <Header />
      <AppBanner />
      {children}
      <Footer />
      <WhatsAppFloatingButton />
    </>
  );
  return (
    <>
      <AppBanner />
      {children}
    </>
  );
}

const Loading = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F3FF' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #EDE9FE', borderTop: '3px solid #6D28D9', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

const MarketingHome = () => (
  <div>
    <section id="home"><HeroSection /></section>
    <PlatformBanner />
  </div>
);

const App = () => {
  useEffect(() => {
    if (window.location.hostname === "api.confirmslot.com" && window.location.pathname === "/") {
      window.location.replace("https://api.confirmslot.com/api-docs");
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Marketing site */}
              <Route path="/"          element={<MarketingHome />} />
              <Route path="/services"  element={<ServicesPage />} />
              <Route path="/about-us"  element={<AboutPage />} />
              <Route path="/our-app"   element={<OurAppPage />} />
              <Route path="/contact"   element={<ContactPage />} />
              <Route path="/enquiry"   element={<EnquiryPage />} />

              {/* Auth */}
              <Route path="/login"                element={<Login />} />
              <Route path="/terms"               element={<Terms />} />
              <Route path="/terms-and-conditions" element={<Terms />} />
              <Route path="/privacy-policy"       element={<Terms />} />

              {/* Walk-in (existing) */}
              <Route path="/walkin/:spId"  element={<WalkinLanding />} />
              <Route path="/service/:spId" element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />

              {/* ── PUBLIC pages — browse freely, no login needed ── */}
              <Route path="/home"                    element={<Home />} />
              <Route path="/category/:id"            element={<CategoryPage />} />
              <Route path="/sp/:spId"                element={<SpProfile />} />
              <Route path="/sp/:spId/branch"         element={<BranchSelection />} />
              <Route path="/sp/:spId/appointment"    element={<BookAppointment />} />
              <Route path="/sp/:spId/token"          element={<BookToken />} />
              <Route path="/sp/:spId/session"        element={<BookSession />} />
              <Route path="/carnival"                element={<CarnivalList />} />
              <Route path="/carnival/:id"            element={<CarnivalDetail />} />

              {/* ── PROTECTED pages — personal data, login required ── */}
              <Route path="/customer-details"        element={<ProtectedRoute><CustomerDetails /></ProtectedRoute>} />
              <Route path="/payment"                 element={<ProtectedRoute><Payment /></ProtectedRoute>} />
              <Route path="/payment/success"         element={<PaymentSuccess />} />
              <Route path="/payment/failure"         element={<PaymentFailure />} />
              <Route path="/booking-confirmation"    element={<ProtectedRoute><BookingConfirm /></ProtectedRoute>} />
              <Route path="/my-bookings"             element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
              <Route path="/profile"                 element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/notifications"           element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="/favourites"              element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;
