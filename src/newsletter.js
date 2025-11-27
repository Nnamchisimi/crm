import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Newsletter = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Get logged-in user's email from localStorage
  const loggedInEmail = localStorage.getItem("userEmail") || "";

  // Form state (email is not editable)
  const [formData, setFormData] = useState({
    phone: "",
    notifications: { email: true, sms: true, phone: true },
    preferences: { weeklyDigest: true, monthlyOffers: true, reminders: true },
  });

  // Handle text input changes (phone)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle notification checkboxes
  const handleNotificationChange = (key) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: !formData.notifications[key],
      },
    });
  };

  // Handle content preferences checkboxes
  const handlePreferenceChange = (key) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [key]: !formData.preferences[key],
      },
    });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!loggedInEmail) {
      alert("You must be logged in to subscribe.");
      return;
    }

    const payload = {
      ...formData,
      email: loggedInEmail,
    };

    try {
      const response = await fetch("http://localhost:3007/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Thank you for subscribing!");
      } else {
        alert("Error: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again.");
    }

    // Reset form except email
    setFormData({
      phone: "",
      notifications: { email: true, sms: false, phone: false },
      preferences: { weeklyDigest: true, monthlyOffers: false, reminders: false },
    });
  };

  // Sidebar items
  const sidebarItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Campaigns", icon: <CampaignIcon />, path: "/campaigns" },
    { text: "Newsletter", icon: <EmailIcon />, path: "/newsletter" },
    { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
    { text: "Sign Out", icon: <ExitToAppIcon />, path: "/signin" },
  ];

  const drawer = (
    <Box sx={{ width: 250, p: 3 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{
          background: "linear-gradient(90deg, #fff, #00bcd4)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        AutoCRM
      </Typography>
      <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.2)" }} />
      <List>
        {sidebarItems.map((item, idx) => (
          <ListItem
            key={idx}
            button
            sx={{ color: "#ccc", "&:hover": { color: "#00bcd4" } }}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
          >
            {item.icon}
            <ListItemText primary={item.text} sx={{ ml: 2 }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        background: "linear-gradient(180deg, #000 0%, #111 100%)",
        color: "white",
        minHeight: "100vh",
      }}
    >
      {/* Mobile Hamburger */}
      <Box
        sx={{
          position: "fixed",
          top: 10,
          right: 10,
          display: { xs: "block", md: "none" },
          zIndex: 1200,
        }}
      >
        <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { background: "rgba(0,0,0,0.9)", color: "white" },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          width: 250,
          background: "rgba(255,255,255,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          p: 3,
          display: { xs: "none", md: "block" },
        }}
      >
        {drawer}
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, p: 4 }}>
               <Button
                                    onClick={() => navigate("/dashboard")}
                                    sx={{ color: "#00bcd4", mb: 3 }}
                                >
                                    ← Back to Dashboard
                                </Button>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Discount Newsletter
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "rgba(255,255,255,0.7)",
            maxWidth: 700,
            textAlign: "center",
            mb: 4,
          }}
        >
          Subscribe to receive exclusive service discounts, maintenance tips, and
          special offers.
        </Typography>

        {/* Newsletter Form */}
        <Grid container justifyContent="center" sx={{ mb: 4 }}>
          <Grid item xs={12} sm={10} md={8} lg={7}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <Paper
                sx={{
                  width: { xs: 420, sm: 700, md: 1000, lg: 1200 },
                  maxWidth: "100%",
                  p: 4,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Newsletter Subscription
                </Typography>
                <Typography sx={{ mb: 2, color: "rgba(255,255,255,0.7)" }}>
                  Stay informed about the latest offers and service campaigns.
                </Typography>

                {/* Display email (read-only) */}
                <TextField
                  label="Email Address"
                  variant="outlined"
                  fullWidth
                  value={loggedInEmail}
                  InputProps={{ readOnly: true, style: { color: "white" } }}
                  sx={{
                    mb: 2,
                    label: { color: "rgba(255,255,255,0.7)" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "&:hover fieldset": { borderColor: "#00bcd4" },
                    },
                  }}
                />

                <TextField
                  label="Phone Number (Optional)"
                  variant="outlined"
                  fullWidth
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  sx={{
                    mb: 3,
                    input: { color: "white" },
                    label: { color: "rgba(255,255,255,0.7)" },
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      "&:hover fieldset": { borderColor: "#00bcd4" },
                    },
                  }}
                />

                {/* Notification Preferences */}
                <Typography variant="h6" gutterBottom>
                  Notification Preferences
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.notifications.email}
                        onChange={() => handleNotificationChange("email")}
                        sx={{ color: "white" }}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.notifications.sms}
                        onChange={() => handleNotificationChange("sms")}
                        sx={{ color: "white" }}
                      />
                    }
                    label="SMS Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.notifications.phone}
                        onChange={() => handleNotificationChange("phone")}
                        sx={{ color: "white" }}
                      />
                    }
                    label="Phone Notifications"
                  />
                </FormGroup>

                {/* Content Preferences */}
                <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                  Content Preferences
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.preferences.weeklyDigest}
                        onChange={() => handlePreferenceChange("weeklyDigest")}
                        sx={{ color: "white" }}
                      />
                    }
                    label="Weekly Service Digest"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.preferences.monthlyOffers}
                        onChange={() => handlePreferenceChange("monthlyOffers")}
                        sx={{ color: "white" }}
                      />
                    }
                    label="Monthly Special Offers"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.preferences.reminders}
                        onChange={() => handlePreferenceChange("reminders")}
                        sx={{ color: "white" }}
                      />
                    }
                    label="Service Reminders"
                  />
                </FormGroup>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 3,
                    backgroundColor: "#00bcd4",
                    "&:hover": { backgroundColor: "#00acc1" },
                  }}
                  onClick={handleSubmit}
                >
                  Subscribe to Newsletter
                </Button>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* What You'll Receive */}
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={8} lg={7}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <Paper
                sx={{
                  width: { xs: 420, sm: 700, md: 1000, lg: 1200 },
                  maxWidth: "100%",
                  p: 4,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  What You'll Receive
                </Typography>
                <ul style={{ color: "rgba(255,255,255,0.85)" }}>
                  <li>Exclusive service discounts up to 30% off</li>
                  <li>Early access to seasonal maintenance campaigns</li>
                  <li>Expert maintenance tips and vehicle care advice</li>
                  <li>Priority booking for service appointments</li>
                </ul>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Newsletter;
