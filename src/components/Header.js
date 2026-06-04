import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-router-dom";
import "./Header.css";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Services", href: "/services" },
  { label: "Enquiry", href: "/enquiry" },
  { label: "Our App", href: "/our-app" },
  { label: "Contact", href: "/contact" },
  { label: "Browse Services ", href: "/home", highlight: true },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
      <Box display="flex" justifyContent="flex-end" p={2}>
        <IconButton>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={Link} to={item.href}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: "#fff", color: "#000" }}>
        <Toolbar className="header-toolbar">
          {/* Logo */}
          <Box className="logo-container">
            <img
              src={process.env.PUBLIC_URL + "/logo.png"}
              alt="Confirm Slot Logo"
              className="logo-img"
            />
            <Typography variant="h6" noWrap>
              Confirm Slot
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box
            className="nav-links"
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={Link}
                to={item.href}
                color="inherit"
                className="navbar-link"
                sx={item.highlight ? {
                  backgroundColor: '#6D28D9',
                  color: '#fff !important',
                  borderRadius: '10px',
                  px: 2,
                  fontWeight: 700,
                  ml: 1,
                  '&:hover': { backgroundColor: '#5B21B6' }
                } : {}}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Register Button (Visible on all screens) */}
          {/* <Box sx={{ flexGrow: { xs: 1, md: 0 }, display: 'flex', justifyContent: { xs: 'flex-end', md: 'flex-start' } }}>
            <Button
              variant="contained"
              component={Link}
              to="/register"
              className="register-button"
              sx={{ ml: { xs: 1, md: 2 } }}
            >
              Register
            </Button>
          </Box> */}

          {/* Hamburger Icon (Mobile only) */}
          <IconButton
            color="inherit"
            edge="end"
            className="menu-icon"
            sx={{ display: { xs: "block", md: "none" }, ml: 1 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={mobileOpen} onClose={toggleDrawer}>
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Header;
