import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import AppointmentCard from './AppointmentCard';
import Footer from './Footer';

const AppointmentConfirmation = () => {
  const [bookingDetails] = useState({
    professional: 'Dr. John Smith',
    specialty: 'General Physician',
    date: '2025-04-20',
    time: '10:00 AM',
    duration: '30 minutes',
    location: '123 Health St, Wellness City',
  });

  const handleConfirm = () => {
    alert('Appointment confirmed! You’ll receive a confirmation email shortly.');
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <div className="confirmation-card">
          <h1>Confirm Your Appointment</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <AppointmentCard label="Professional" value={bookingDetails.professional} />
            <AppointmentCard label="Specialty" value={bookingDetails.specialty} />
            <AppointmentCard label="Date" value={bookingDetails.date} />
            <AppointmentCard label="Time" value={bookingDetails.time} />
            <AppointmentCard label="Duration" value={bookingDetails.duration} />
            <AppointmentCard label="Location" value={bookingDetails.location} />
          </div>
          <div className="button-group">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="back-button"
            >
              Back
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConfirm}
              className="confirm-button"
            >
              Confirm Booking
            </motion.button>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default AppointmentConfirmation;