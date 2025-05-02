// import React from 'react';
// import { motion } from 'framer-motion';

// const MobileAppSection = () => {
//   return (
//     <motion.div
//       initial={{ y: 50, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.5, delay: 0.4 }}
//       className="mobile-app"
//     >
//       <p>Communicate Easily With Our Mobile App</p>
//       <img src="https://via.placeholder.com/200x400" alt="Mobile App" />
//       <div className="app-buttons">
//         <a href="#">App Store</a>
//         <a href="#">Google Play</a>
//       </div>
//     </motion.div>
//   );
// };

// export default MobileAppSection;


// import React from 'react';
// import { motion } from 'framer-motion';
// const MobileAppSection = () => {
//   return (
//     <motion.section
//       initial={{ y: 50, opacity: 0 }}
//       animate={{ y: 0, opacity: 1 }}
//       transition={{ duration: 0.5, delay: 0.4 }}
//       className="mobile-app-section"
//     >
//       <div className="mobile-app-container">
//         <div className="mobile-app-phone">
//           <div className="review-badge">
//             <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Reviewer" />
//             <div>
//               <div className="stars">⭐⭐⭐⭐⭐</div>
//               <span>Based on 1,400 reviews</span>
//             </div>
//           </div>
//           <div className="mobile-frame">
//             <div className="mobile-header">
//               <div className="logo-icon"></div>
//               <p>Quality Doctors<br />For Your Best Care</p>
//               <img
//                 src="https://cdn.pixabay.com/photo/2017/03/02/13/00/doctor-2115624_1280.jpg"
//                 alt="Doctor"
//               />
//               <button className="talk-btn">Talk Doctor online</button>
//             </div>
//           </div>
//         </div>

//         <div className="mobile-app-content">
//           <div className="logo-icon small" />
//           <h2>Communicate Easily<br />With Our Mobile App</h2>
//           <p>
//             Molestie in tellus in, tempus ultrices neque. Donec sed nisl finibus, ultrices
//             ipsum at, dignissim eros. In hendrerit euismod dui in scelerisque.
//           </p>
//           <div className="store-buttons">
//             <img
//               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiNQc5CapoSJE3sujvojLNNXipoAGDZYgUWw&s"
//               alt="App Store"
//             />
//             <img
//               src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
//               alt="Google Play"
//             />
//           </div>
//         </div>
//       </div>
//     </motion.section>
//   );
// };

// export default MobileAppSection;


import React from 'react';
import { motion } from 'framer-motion';
import './mobileAppSection.css'; 
import mobileapp from "./mobileapp.png";

const MobileAppSection = () => {
  return (
    <motion.section
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mobile-app-section"
    >
      <div className="mobile-app-container">
        {/* Phone Preview */}
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
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="mobile-app-content">
          {/* <div className="logo-icon small" /> */}
          <h2>Communicate Easily<br />With Our Mobile App</h2>
          <p>
            Stay connected with certified doctors anytime, anywhere using our user-friendly mobile app. 
            Experience seamless consultations, secure chat, and real-time care — all from your phone.
          </p>
          <div className="store-buttons">
            <a
              href="https://apps.apple.com/us/app/quixent/id123456789"
              target="_self"
              rel="noopener noreferrer"
            >
              <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiNQc5CapoSJE3sujvojLNNXipoAGDZYgUWw&s"
                alt="App Store"
              />
            </a>
            <a
              href="https://play.google.com/store/apps/dev?id=5363834578851195995"
              target="_self"
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
