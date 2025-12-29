import React from 'react';
import './PlatformBanner.css';

const SmartTokenMarqueeSection = () => {
  return (
    <div className="marquee-container">
      <div className="marquee-wrapper">
        <div className="marquee-track">
          <div className="marquee-text">
            You're viewing a product from <a className="platform-name" href="https://quixentsolutions.com/" target="_blank" rel="noopener noreferrer">Quixent Solutions</a>&nbsp;
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTokenMarqueeSection;