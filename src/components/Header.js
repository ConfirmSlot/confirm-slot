import React, { useState } from 'react';
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
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import './Header.css';

const navItems = [
  { label: 'Home', href: '/#home' },
  { label: 'About Us', href: '/#about' },
  { label: 'Service', href: '/#services' },
  { label: 'Our App', href: '/#ourapp' },
  { label: 'Contact', href: '/#contact' }
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
            <ListItemButton component="a" href={item.href}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ backgroundColor: '#fff', color: '#000' }}>
        <Toolbar className="header-toolbar">
          {/* Logo */}
          <Box className="logo-container">
            <img
              src="https://cdn4.vectorstock.com/i/1000x1000/76/53/confirm-rubber-stamp-vector-12827653.jpg"
              alt="Confirm Slot Logo"
              className="logo-img"
            />
            <Typography variant="h6" noWrap>
              Confirm Slot
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box className="nav-links" sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                href={item.href}
                color="inherit"
                className="navbar-link"
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Register Button (Visible on all screens) */}
          <Box sx={{ flexGrow: { xs: 1, md: 0 }, display: 'flex', justifyContent: { xs: 'flex-end', md: 'flex-start' } }}>
            <Button
              variant="contained"
              component={Link}
              to="/register"
              className="register-button"
              sx={{ ml: { xs: 1, md: 2 } }}
            >
              Register
            </Button>
          </Box>

          {/* Hamburger Icon (Mobile only) */}
          <IconButton
            color="inherit"
            edge="end"
            className="menu-icon"
            sx={{ display: { xs: 'block', md: 'none' }, ml: 1 }}
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