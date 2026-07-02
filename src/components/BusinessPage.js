import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SwiggyBrowse from "./SwiggyBrowse";
import OverviewSection from "./OverviewSection";
import "./BusinessPage.css";

const BusinessPage = () => {
  const location = useLocation();

  // Any /#section link scrolls to the target after render.
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const id = decodeURIComponent(location.hash.slice(1));
    const el = document.getElementById(id);
    if (el) {
      // defer so layout (images/fonts) settles before measuring the offset
      const t = setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 60);
      return () => clearTimeout(t);
    }
  }, [location]);

  return (
    <div className="business-page">
      {/* Home — Swiggy-style browse (combines the /home service browser) */}
      <section id="home">
        <SwiggyBrowse />
      </section>

      {/* Everything else condensed into one section */}
      <OverviewSection />
    </div>
  );
};

export default BusinessPage;
