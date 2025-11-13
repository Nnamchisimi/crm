import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const navItems = [
  { text: "Home", path: "/" },
  { text: "Dashboard", path: "/dashboard" },
  { text: "Campaigns", path: "/campaigns" },
  { text: "Newsletter", path: "/newsletter" },
  { text: "Notifications", path: "/notifications" },
  { text: "Sign In", path: "/signin" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false); // close drawer on mobile after clicking
  };

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigate(item.path)}>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="sticky" sx={{ bgcolor: "black", color: "white" }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <Typography variant="h6" sx={{ fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate("/")}>
          AutoCRM
        </Typography>

        {/* Desktop navigation */}
        {!isMobile && (
          <Box sx={{ display: "flex", gap: 2, flexGrow: 1, justifyContent: "center" }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                onClick={() => navigate(item.path)}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}

        {/* Mobile Hamburger */}
        {isMobile ? (
          <IconButton color="inherit" edge="end" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        ) : (
          <Button
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "teal",
              "&:hover": {
                background: "linear-gradient(45deg, #00bcd4, #00bcd4)",
                borderColor: "teal",
                color: "black",
              },
            }}
            onClick={() => navigate("/signup")}
          >
            Get Started
          </Button>
        )}

        {/* Drawer */}
        <Drawer anchor="right" open={mobileOpen} onClose={handleDrawerToggle}>
          {drawer}
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
