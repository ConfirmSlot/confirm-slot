import { useState } from "react";
import { API_ENDPOINTS } from "../config/api";
import "./EnquiryPage.css";

const EnquiryPage = ({ embedded = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    enquiry: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch(API_ENDPOINTS.ENQUIRY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // const result = await response.json();

      if (response.ok) {
        setSubmitMessage(
          "Thank you for your enquiry! We will get back to you soon.",
        );
        setFormData({ name: "", email: "", phone: "", enquiry: "" });
      } else {
        setSubmitMessage("Failed to submit enquiry. Please try again.");
      }
    } catch (error) {
      setSubmitMessage("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`enquiry-page${embedded ? " embedded" : ""}`}>
      {!embedded && (
        <>
          {/* Hero Section */}
          <div className="hero-section">
            <div className="hero-content">
              <h1>Need Help Getting Started?</h1>
              <p>Learn how to access our app and get answers to your questions</p>
            </div>
          </div>

          <div className="section-divider"></div>
        </>
      )}

      {/* Content Container */}
      <div className="content-container">
        <div className="content-grid">
          {/* Walkthrough Section */}
          <div className="walkthrough-section">
            <div className="walkthrough-card">
              <h2>How to Access Our App </h2>
              <p className="walkthrough-intro">
                Follow these simple steps to download and start using our mobile
                app for booking appointments and managing your services.
              </p>

              <div className="steps-container">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Download the App</h3>
                    <p>
                      Visit the Google Play Store or Apple App Store and search
                      for "ConfirmSlot". Download and install the app on your
                      device.
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Create Your Account</h3>
                    <p>
                      Launch the app and sign up using your phone number. Verify
                      your account with the OTP sent to your mobile.
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Complete Your Profile</h3>
                    <p>
                      Add your personal information, select your preferred
                      services, and set up your location for better
                      recommendations.
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h3>Browse and Book</h3>
                    <p>
                      Explore available services in your area, check reviews,
                      and book appointments with your preferred service
                      providers.
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <h3>Manage Your Bookings</h3>
                    <p>
                      View your upcoming appointments and track your booking
                      history .
                    </p>
                  </div>
                </div>
              </div>

              <div className="features-highlight">
                <h3>Key Features You'll Love:</h3>
                <ul>
                  <li>📅 Easy appointment scheduling</li>
                  <li>⭐ Service provider reviews and ratings</li>
                  <li>💳 Secure payment options</li>
                  <li>📍 Location-based service discovery</li>
                  <li>💬 In-app chat support</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Enquiry Form Section */}
          <div className="form-section">
            <div className="form-card">
              <h2>Have Questions? Ask Us!</h2>
              <p>
                Can't find what you're looking for? Send us your enquiry and our
                team will assist you.
              </p>

              <form onSubmit={handleSubmit} className="enquiry-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Contact Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="enquiry">Your Enquiry *</label>
                  <textarea
                    id="enquiry"
                    name="enquiry"
                    value={formData.enquiry}
                    onChange={handleInputChange}
                    required
                    placeholder="Please describe your question or concern..."
                    rows="5"
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                </button>

                {submitMessage && (
                  <div
                    className={`message ${submitMessage.includes("Thank you") ? "success" : "error"}`}
                  >
                    {submitMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryPage;
