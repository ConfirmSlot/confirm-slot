import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { FaApple } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Header.css";

const IOS_URL = "https://apps.apple.com/in/app/confirmslot/id6758349903";
const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.identifier.confirmslot";
const PHONE = "+91 91761 22210";
const EMAIL = "info@quixentsolutions.com";
const HOURS = "Mon–Fri · 9AM – 6PM";
const TEL = `tel:${PHONE.replace(/\s/g, "")}`;

// Official Google Play four-colour triangle (inline SVG — no external asset)
const GooglePlayIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
    <path fill="#00A0FF" d="M99 16.6c-6.9 3.7-11.5 11-11.5 20.5v437.8c0 9.5 4.6 16.8 11.5 20.5l1.5.8L322 256.7v-1.4L100.5 15.8 99 16.6z" />
    <path fill="#FFCE00" d="M396 331.3l-74-74.6v-1.4l74-74.6 1.7 1L484 235c25 14.1 25 37.2 0 51.4l-86.3 44.9-1.7 1z" />
    <path fill="#FF3A44" d="M397.7 330.3L322 255.6 99 480c8.2 8.7 21.8 9.8 37.1 1.1l261.6-150.8z" />
    <path fill="#00E676" d="M397.7 181L136.1 30.9C120.8 22.1 107.2 23.2 99 32l223 223 75.7-74z" />
  </svg>
);

const Header = () => (
  <AppBar position="sticky" sx={{ backgroundColor: "#fff", color: "#000" }}>
    <Toolbar className="header-toolbar" disableGutters>
      {/* Logo */}
      <Box className="logo-container" component={Link} to="/">
        <img
          src={process.env.PUBLIC_URL + "/logo.png"}
          alt="Onezy Logo"
          className="logo-img"
        />
        <Typography variant="h6" noWrap>
          Onezy
        </Typography>
      </Box>

      {/* Contact: phone · email · timings */}
      <div className="header-contact">
        <a className="hc-item" href={TEL}>
          <span className="hc-ic">📞</span>
          {PHONE}
        </a>
        <a className="hc-item" href={`mailto:${EMAIL}`}>
          <span className="hc-ic">✉️</span>
          {EMAIL}
        </a>
        <span className="hc-item">
          <span className="hc-ic">🕐</span>
          {HOURS}
        </span>
      </div>

      {/* Actions: Schedule a Demo + store icons */}
      <div className="header-actions">
        <a className="hc-demo" href={TEL}>
          Schedule a Demo
        </a>
        <div className="hc-stores">
          <a
            href={IOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hc-store"
            aria-label="Download on the App Store"
          >
            <FaApple size={16} />
            <span className="hc-store-text">
              <small>Download on the</small>
              <strong>App Store</strong>
            </span>
          </a>
          <a
            href={ANDROID_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hc-store"
            aria-label="Get it on Google Play"
          >
            <GooglePlayIcon size={16} />
            <span className="hc-store-text">
              <small>Get it on</small>
              <strong>Google Play</strong>
            </span>
          </a>
        </div>
      </div>
    </Toolbar>
  </AppBar>
);

export default Header;
