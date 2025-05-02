import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CountUp = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16); // approx. 60fps
    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        clearInterval(interval);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [end, duration]);

  return <h2>+{count.toLocaleString()}</h2>;
};

const StatsSection = () => {
  return (
    <motion.section
      className="stats-container"
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="stats-box">
        <div className="stat-item">
          <span className="stat-label">Doctors</span>
          <CountUp end={824} />
        </div>
        <div className="stat-item">
          <span className="stat-label">Customer Service</span>
          <CountUp end={20000} />
        </div>
        <div className="stat-item">
          <span className="stat-label">Pion Service</span>
          <CountUp end={10000} />
        </div>
      </div>
    </motion.section>
  );
};

export default StatsSection;
