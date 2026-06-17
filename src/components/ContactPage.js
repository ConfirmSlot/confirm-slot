import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {

  const mapsKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const locations = [
    { 
      id: "us", 
      label: "USA", 
      address: "34785 Pickford Dr, Farmington Hills<br />MI - 48335",
      mapQuery: "34785 Pickford Dr, Farmington Hills, MI 48335",
      phone: "+1 (248) 555-1234",
      email: "us-sales@onezy.net"
    },
    {
      id: "chennai",
      label: "Chennai",
      address: "Wimco Nagar<br />Chennai - 600019",
      mapQuery: "Wimco Nagar Metro Station, Chennai 600019",
      phone: "+91 91761 22210",
      email: "in-sales@onezy.net"
    },
    { 
      id: "bengaluru", 
      label: "Bengaluru", 
      address: "Brigade Gardens, Church Street<br />Bengaluru",
      mapQuery: "Brigade Gardens, Church Street, Bengaluru",
      phone: "+91 98765 43210",
      email: "in-sales@onezy.net"
    },
  ];

  const [selectedLocationId, setSelectedLocationId] = useState("chennai");

  const buildMapSrc = (query) => {
    const encoded = encodeURIComponent(query);
    return mapsKey
      ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${encoded}`
      : `https://www.google.com/maps?q=${encoded}&output=embed`;
  };

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);
  const mapSrc = buildMapSrc(selectedLocation.mapQuery || selectedLocation.address.replace('<br />', ''));


  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Get In Touch</h1>
          <p>We'd love to hear from you. Reach out to us anytime.</p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="contact-container">
        <div className="contact-grid">
          


          {/* Contact Information */}
          <div className="contact-info-section">
            <div className="info-card">
              <h2>Contact Information</h2>

              <div className="location-select">
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    className={`location-button${
                      selectedLocationId === loc.id ? " active" : ""
                    }`}
                    onClick={() => setSelectedLocationId(loc.id)}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
              
              <div className="info-items">
                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div className="info-text">
                    <h3>Address</h3>
                    <p dangerouslySetInnerHTML={{ __html: selectedLocation.address }} />
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">📞</div>
                  <div className="info-text">
                    <h3>Phone</h3>
                    <p>{selectedLocation.phone}</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">✉</div>
                  <div className="info-text">
                    <h3>Email</h3>
                    <p>{selectedLocation.email}</p>
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-icon">🕐</div>
                  <div className="info-text">
                    <h3>Business Hours</h3>
                    <p>Mon - Fri: 9:00 AM - 6:00 PM<br />Sat - Sun: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="map-card">
              <iframe
                title={`Quixent Solutions - ${selectedLocation.label}`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;