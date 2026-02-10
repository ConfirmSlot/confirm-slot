import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import './mobileAppSection.css'; 
import mobileapp from "./mobile.jpeg";

const MobileAppSection = () => {
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
      const isAndroid = /android/i.test(ua);
      
      if (isIOS) {
        window.location.href = "https://apps.apple.com/in/app/confirmslot/id6758349903";
      } else if (isAndroid) {
        window.location.href = "https://play.google.com/store/apps/details?id=com.identifier.confirmslot";
      }
    }
  }, []);

  return (
    <motion.section
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mobile-app-section"
    >
      <div className="mobile-app-container">
        <div className="mobile-app-phone">
          <div className="review-badge">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Reviewer" />
            <div>
              <div className="stars">⭐⭐⭐⭐⭐</div>
              <span>Based on 1,400 reviews</span>
            </div>
          </div>

          <div className="mobile-frame">
            <img
              src={mobileapp}
              className="app-preview"
              alt="MobileAppPreview"
            />
          </div>
        </div>

        <div className="mobile-app-content">
          <h2>Communicate Easily<br />With Our Mobile App</h2>
          <p>
            Stay connected with certified professionals anytime, anywhere using our user-friendly mobile app. 
            Experience seamless consultations, secure chat, and real-time care — all from your phone.
          </p>
          <div className="store-buttons">
            <a
              href="https://apps.apple.com/in/app/confirmslot/id6758349903"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiNQc5CapoSJE3sujvojLNNXipoAGDZYgUWw&s"
                alt="App Store"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.identifier.confirmslot"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
              />
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default MobileAppSection;