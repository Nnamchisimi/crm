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
} from "@mui/material";
import { motion } from "framer-motion";

const Newsletter = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    notifications: {
      email: true,
      sms: false,
      phone: false,
    },
    preferences: {
      weeklyDigest: true,
      monthlyOffers: false,
      reminders: false,
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNotificationChange = (key) => {
    setFormData({
      ...formData,
      notifications: {
        ...formData.notifications,
        [key]: !formData.notifications[key],
      },
    });
  };

  const handlePreferenceChange = (key) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        [key]: !formData.preferences[key],
      },
    });
  };

  const handleSubmit = () => {
    console.log("Subscribed:", formData);
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #000 0%, #111 100%)",
        color: "white",
        minHeight: "100vh",
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
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

      {/* Wider container Grid */}
     
        {/* Subscription Form */}
       {/* Newsletter Section */}
<Box mt={6} sx={{ width: "100%" }}>

  {/* Newsletter Form */}
  <Grid container justifyContent="center" sx={{ mb: 4 }}>
    <Grid item xs={12} sm={10} md={8} lg={7}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <Paper
          sx={{
               width:  {    xs: 420, // width on extra-small screens
                        sm: 700, // width on small screens
                        md: 1000, // width on medium screens
                        lg: 1200, // width on large screens,
            },
            maxwidth:"100%",
            
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

          {/* Form fields */}
          <TextField
            label="Email Address *"
            variant="outlined"
            fullWidth
            name="email"
            value={formData.email}
            onChange={handleChange}
            sx={{
              mb: 2,
              input: { color: "white" },
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
            sx={{ mt: 3, backgroundColor: "#00bcd4", "&:hover": { backgroundColor: "#00acc1" } }}
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
            width:  {    xs: 420, // width on extra-small screens
                        sm: 700, // width on small screens
                        md: 1000, // width on medium screens
                        lg: 1200, // width on large screens,
            },
            maxwidth:"100%",
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
