import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  MenuItem,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Drawer,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";



const AddVehicle = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    phoneNumber: "",
    vin: "",
    licensePlate: "",
    brand: "",
    model: "",
    vehicleType: "",
    fuelType: "",
    year: "",
    kilometers: "",
  });

  const [errors, setErrors] = useState({});
  const currentYear = new Date().getFullYear();

  const brands = ["Mercedes", "BMW", "Audi", "Toyota", "Honda"];
  const vehicleTypes = ["Sedan", "SUV", "Truck", "Van", "Coupe"];
  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (formData.year < 1900 || formData.year > currentYear) {
      newErrors.year = `Year must be between 1900 and ${currentYear}`;
    }
    if (formData.kilometers < 0) {
      newErrors.kilometers = "Kilometers cannot be negative";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  // Get logged-in user's email
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    alert("You must be logged in to register a vehicle.");
    navigate("/signin");
    return;
  }

  // Merge email into formData
  const vehicleData = { ...formData, email: userEmail };

  try {
    const response = await fetch("http://localhost:3007/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicleData), // ✅ include email
    });

    const data = await response.json();

    if (response.ok) {
      alert("Vehicle registered successfully!");
      navigate("/dashboard");
    } else {
      alert("Error: " + (data.message || data.error || "Unknown error"));
    }
  } catch (err) {
    console.error(err);
    alert("Server error, please try again.");
  }
};



  const handleSignOut = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    navigate("/signin");
  };

  const sidebarItems = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Campaigns", icon: <CampaignIcon />, path: "/campaigns" },
    { text: "Newsletter", icon: <EmailIcon />, path: "/newsletter" },
    { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
    { text: "Sign Out", icon: <ExitToAppIcon />, action: handleSignOut },
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
              if (item.path) navigate(item.path);
              if (item.action) item.action();
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
    <Box sx={{ display: "flex", minHeight: "100vh", background: "#111", color: "white" }}>
      {/* Mobile Hamburger */}
      <Box
        sx={{
          position: "fixed",
          top: 10,
          left: 10,
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
          display: { xs: "none", md: "block" },
          background: "rgba(255,255,255,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          p: 3,
        }}
      >
        {drawer}
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 4, display: "flex", justifyContent: "center" }}>
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            width: "100%",
            maxWidth: 600,
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Register Your Vehicle
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
            Add your vehicle details to generate a unique CRM number
          </Typography>

          <form onSubmit={handleSubmit}>
              {[
                // ✅ Added fields
                { label: "Name", name: "name" },
                { label: "Surname", name: "surname" },
                { label: "Phone Number", name: "phoneNumber" },

                // Your original fields
                { label: "VIN Number", name: "vin" },
                { label: "License Plate", name: "licensePlate" },
                { label: "Model", name: "model" },
              ].map((field) => (
                <TextField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{ style: { color: "#ccc" } }}
                  sx={{ input: { color: "white" } }}
                />
              ))}

              <TextField
                select
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{ input: { color: "white" } }}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand} value={brand}>
                    {brand}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Vehicle Type"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{ input: { color: "white" } }}
              >
                {vehicleTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Fuel Type"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{ input: { color: "white" } }}
              >
                {fuelTypes.map((fuel) => (
                  <MenuItem key={fuel} value={fuel}>
                    {fuel}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                error={!!errors.year}
                helperText={errors.year}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{ input: { color: "white" } }}
              />

              <TextField
                label="Kilometers"
                name="kilometers"
                type="number"
                value={formData.kilometers}
                onChange={handleChange}
                error={!!errors.kilometers}
                helperText={errors.kilometers}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ style: { color: "#ccc" } }}
                sx={{ input: { color: "white" } }}
              />

              <Button
                variant="contained"
                type="submit"
                sx={{
                  mt: 3,
                  backgroundColor: "#00bcd4",
                  "&:hover": { backgroundColor: "#00acc1" },
                  width: "100%",
                }}
              >
                Register Vehicle
              </Button>
            </form>

        </Paper>
      </Box>
    </Box>
  );
};

export default AddVehicle;
