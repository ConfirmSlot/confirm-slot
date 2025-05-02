// import React from 'react';
// import { motion } from 'framer-motion';

// const SpecialtiesSection = () => {
//   return (
//     <motion.div
//       initial={{ y: 50, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.5, delay: 0.2 }}
//       className="specialties"
//     >
//       <h2>Our Consulting For 24 Hours at Headquarters</h2>
//       <div className="specialties-list">
//         <a href="#" className="specialty">Cardiologists</a>
//         <a href="#" className="specialty highlight">Ophthalmologists</a>
//         <a href="#" className="specialty">Endocrinologists</a>
//         <a href="#" className="specialty">Dermatologists</a>
//         <a href="#" className="specialty">Allergists</a>
//       </div>
//     </motion.div>
//   );
// };

// export default SpecialtiesSection;


import React from 'react';
import { motion } from 'framer-motion';
// import './App.css';
import './SpecialtiesSection.css';

const SpecialtiesSection = () => {
  return (
    <motion.section
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="specialties-container"
    >
      <h2 className="specialties-title">
        Our Consulting For <span className="highlight-text">24 Hours</span> at Headquarters
      </h2>

      <div className="specialties-tabs">
        <a href="#" className="specialty-tab">Cardiologists</a>
        <a href="#" className="specialty-tab active">Ophthalmologists</a>
        <a href="#" className="specialty-tab">Endocrinologists</a>
        <a href="#" className="specialty-tab">Dermatologists</a>
        <a href="#" className="specialty-tab">Allergists</a>
      </div>

      <div className="specialty-panel">
        <div className="specialty-info">
          <div className="circle-icon"></div>
          <h3>Ophthalmologists</h3>
          <p>
            Tempus consectetur est, eget laoreet tellus commodo in. Donec tincidunt enim in elit feugiat,
            ac consequat elit mollis. Ut vestibulum purus non volutpat consequat.
          </p>
          <button className="purchase-btn">Purchase Today</button>
        </div>
        <div className="specialty-image">
          <img
                    src="https://png.pngtree.com/png-clipart/20231002/original/pngtree-young-afro-professional-doctor-png-image_13227671.png"

            // src="https://cdn.pixabay.com/photo/2017/03/02/13/00/doctor-2115624_1280.jpg"
            alt="Doctor"
          />
        </div>
      </div>
    </motion.section>
  );
};

export default SpecialtiesSection;
