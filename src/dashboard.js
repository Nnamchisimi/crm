import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Drawer,
  Divider,
  Button,
  List,
  ListItem,
  IconButton,
  ListItemText,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

import MenuIcon from "@mui/icons-material/Menu";
import CampaignIcon from "@mui/icons-material/Campaign";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EmailIcon from "@mui/icons-material/Email";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { BrandLogo } from "./BrandLogo";

const Dashboard = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const userToken = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail");
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3007";

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/signin", { replace: true });
  };

  const getClosestDateCount = () => {
    if (!activeCampaigns.length) return 0;
    const dates = activeCampaigns
      .map((c) => new Date(c.validUntil))
      .filter((d) => !isNaN(d));
    if (!dates.length) return 0;
    const closestDate = new Date(Math.min(...dates));
    return dates.filter((d) => d.getTime() === closestDate.getTime()).length;
  };

  const stats = [
    { title: "Total Vehicles", value: vehicles.length },
    { title: "Upcoming Bookings", value: getClosestDateCount() },
    { title: "Active Campaigns", value: activeCampaigns.length },
  ];

  // Auth check
  useEffect(() => {
    if (!userToken) navigate("/signin", { replace: true });
    const { role } = jwtDecode(userToken || "");
    if (role !== "user") navigate("/signin", { replace: true });
  }, [navigate, userToken]);

  // Fetch vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!userToken) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/vehicles`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch vehicles");
        const data = await res.json();
        setVehicles(Array.isArray(data) ? data : data.vehicles || []);
      } catch (err) {
        console.error(err);
        setVehicles([]);
      }
    };
    fetchVehicles();
  }, [API_BASE_URL, userToken]);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!userToken || !userEmail) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/campaigns?email=${userEmail}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        if (!res.ok) throw new Error("Failed to fetch campaigns");
        const data = await res.json();
        const mapped = data.map((c) => ({ ...c, bookedByUser: !!c.bookedByUser }));
        setActiveCampaigns(mapped.filter((c) => c.bookedByUser));
        setAllCampaigns(mapped.filter((c) => !c.bookedByUser));
      } catch (err) {
        console.error(err);
      }
    };
    fetchCampaigns();
  }, [API_BASE_URL, userToken, userEmail]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Campaigns", icon: <CampaignIcon />, path: "/campaigns" },
    { text: "Newsletter", icon: <EmailIcon />, path: "/newsletter" },
    { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
    { text: "Booking", icon: <CalendarMonthIcon />, path: "/booking" },
    { text: "Sign Out", icon: <ExitToAppIcon />, onClick: handleSignOut },
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
        KombosDMS
      </Typography>
      <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.2)" }} />
      <List>
        {sidebarItems.map((item, idx) => (
          <ListItem
            key={idx}
            button
            sx={{
              color: item.path === "/dashboard" ? "#00bcd4" : "#ccc",
              "&:hover": { color: "#00bcd4" },
            }}
            onClick={() => {
              if (item.onClick) item.onClick();
              else if (item.path) navigate(item.path);
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
    <Box sx={{ display: "flex", background: "linear-gradient(180deg, #000 0%, #111 100%)", color: "white", minHeight: "100vh" }}>
      {/* Mobile Menu Button */}
      <Box sx={{ position: "fixed", top: 10, right: 10, display: { xs: "block", md: "none" }, zIndex: 1200 }}>
        <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        anchor="right"
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { background: "rgba(0,0,0,0.9)", color: "white" } }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box sx={{ width: 250, background: "rgba(255,255,255,0.05)", borderRight: "1px solid rgba(255,255,255,0.1)", p: 3, display: { xs: "none", md: "block" } }}>
        {drawer}
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Chip label={userEmail} variant="outlined" sx={{ width: { xs: '150px', sm: '200px' }, color: "#00bcd4", borderColor: "#00bcd4" }} />
        </Box>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
          Manage your vehicles and track maintenance schedules
        </Typography>

        {/* Stats */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.2 }}>
                <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Typography variant="h6" sx={{  minWidth: 160, color: "#00bcd4" }}>{stat.title}</Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>{stat.value}</Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

            {/* Vehicles */}
        <Box mt={{ xs: 3, sm: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            My Vehicles
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            sx={{ backgroundColor: "#00bcd4", "&:hover": { backgroundColor: "#00acc1" }, mb: 2 }}
            onClick={() => navigate("/addVehicle")}
          >
            Add Vehicle
          </Button>

          <Grid container spacing={3}>
            {vehicles.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 150 }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>No vehicles registered yet.</Typography>
                </Paper>
              </Grid>
            ) : (
              vehicles.map((vehicle) => (
                <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                  <Paper sx={{ p: 2, borderRadius: 3, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%",  minWidth: 0,  }}>
                   <Box sx={{ display: "flex", alignItems: "center", mb: 1, minWidth: 0 }}>
                    <BrandLogo brand={vehicle.brand} size="lg" showName={false} />

                    <Box sx={{ ml: 1, minWidth: 0, flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        noWrap
                        sx={{ minWidth: 0 }}
                      >
                        {vehicle.brand || "---"} {vehicle.model || "---"}
                      </Typography>
                    </Box>
                  </Box>

                    <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.1)" }} />
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                      {vehicle.vehicle_type || "---"} • {vehicle.year || "---"} • {vehicle.license_plate || "---"}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>VIN: {vehicle.vin || "---"}</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Fuel: {vehicle.fuel_type || "---"}</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Kilometers: {vehicle.kilometers?.toLocaleString() || 0} km</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>CRM Number: {vehicle.crm_number || "---"}</Typography>
                    <Button variant="outlined" sx={{ mt: 1, color: "white", borderColor: "white" }} onClick={() => navigate(`/vehicles/${vehicle.id}`)}>View Details</Button>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Recent Bookings */}
        <Box mt={{ xs: 3, sm: 6 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Recent Bookings
          </Typography>
          <Grid container spacing={3}>
            {activeCampaigns.map((c) => (
              <Grid item xs={12} sm={6} md={6} key={c.id}>
                <Paper
                  onClick={() => navigate("/campaigns")}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    "&:hover": { background: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{c.title}</Typography>
                    <Chip label={c.priority} sx={{ bgcolor: getPriorityColor(c.priority), color: "white" }} />
                  </Box>
                  <Typography sx={{ mb: 1 }}>{c.description}</Typography>
                  {c.discount && <Typography sx={{ fontWeight: "bold" }}>{c.discount}</Typography>}
                  <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}>Valid until: {c.validUntil}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
