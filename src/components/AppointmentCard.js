import React from 'react';
import { motion } from 'framer-motion';

const AppointmentCard = ({ label, value }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="appointment-card"
    >
      <span>{label}</span>
      <span>{value}</span>
    </motion.div>
  );
};

export default AppointmentCard;