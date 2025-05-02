import React from 'react';
import './PlatformBanner.css';

const SmartTokenMarqueeSection = () => {
  return (
    <div className="marquee-container">
      <div className="marquee-wrapper">
        <div className="marquee-track">
          <div className="marquee-text">
            📢 You're viewing a product from our main platform <span className="platform-name">Quixent Solutions</span>.&nbsp;
          </div>
          <div className="marquee-text" aria-hidden="true">
            📢 You're viewing a product from our main platform <span className="platform-name">Quixent Solutions</span>.&nbsp;
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTokenMarqueeSection;