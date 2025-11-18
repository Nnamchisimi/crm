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

import MenuIcon from "@mui/icons-material/Menu";
import CampaignIcon from "@mui/icons-material/Campaign";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import EmailIcon from "@mui/icons-material/Email";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const Dashboard = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  // Campaign states
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const userEmail = localStorage.getItem("userEmail");

  // Stats
  const stats = [
    { title: "Total Vehicles", value: vehicles.length },
    { title: "Upcoming Bookings", value: 0 },
    { title: "Active Campaigns", value: activeCampaigns.length },
  ];

  // Fetch vehicles
  useEffect(() => {
    fetch("http://localhost:3007/api/vehicles")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVehicles(data);
        else if (Array.isArray(data.vehicles)) setVehicles(data.vehicles);
        else setVehicles([]);
      })
      .catch((err) => {
        console.error("Error fetching vehicles:", err);
        setVehicles([]);
      });
  }, []);

  // Fetch campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`http://localhost:3007/api/campaigns?email=${userEmail}`);
        const data = await res.json();
        const mapped = data.map((c) => ({ ...c, bookedByUser: !!c.bookedByUser }));
        setActiveCampaigns(mapped.filter((c) => c.bookedByUser));
        setAllCampaigns(mapped.filter((c) => !c.bookedByUser));
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      }
    };
    fetchCampaigns();
  }, [userEmail]);

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

  const cancelCampaign = async (campaign, email) => {
    try {
      const res = await fetch(`http://localhost:3007/api/campaigns/${campaign.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok) return alert(result.message);
      setActiveCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
      setAllCampaigns((prev) => [...prev, { ...campaign, bookedByUser: false }]);
    } catch (err) {
      console.error(err);
    }
  };

  const bookCampaign = async (campaign) => {
    try {
      const res = await fetch(`http://localhost:3007/api/campaigns/${campaign.id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const result = await res.json();
      if (!res.ok) return alert(result.message);
      setAllCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
      setActiveCampaigns((prev) => [...prev, { ...campaign, bookedByUser: true }]);
    } catch (err) {
      console.error(err);
    }
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
        sx={{ background: "linear-gradient(90deg, #fff, #00bcd4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
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
    <Box sx={{ display: "flex", background: "linear-gradient(180deg, #000 0%, #111 100%)", color: "white", minHeight: "100vh" }}>
      {/* Mobile Hamburger */}
      <Box sx={{ position: "fixed", top: 10, left: 10, display: { xs: "block", md: "none" }, zIndex: 1200 }}>
        <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { background: "rgba(0,0,0,0.9)", color: "white" } }}>
        {drawer}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box sx={{ width: 250, background: "rgba(255,255,255,0.05)", borderRight: "1px solid rgba(255,255,255,0.1)", p: 3, display: { xs: "none", md: "block" } }}>
        {drawer}
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
          Manage your vehicles and track maintenance schedules
        </Typography>

        {/* Stats */}
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.2 }}>
                <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Typography variant="h6" sx={{ color: "#00bcd4" }}>{stat.title}</Typography>
                  <Typography variant="h4" fontWeight="bold" mt={1}>{stat.value}</Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* My Vehicles Section */}
        <Box mt={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            My Vehicles
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              backgroundColor: "#00bcd4",
              "&:hover": { backgroundColor: "#00acc1" },
              mb: 2,
            }}
            onClick={() => navigate("/addVehicle")}
          >
            Add Vehicle
          </Button>

          <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start", gap: 3 }}>
            {vehicles.length === 0 ? (
              <Paper
                sx={{
                  width: 360,
                  height: 220,
                  p: 3,
                  borderRadius: 3,
                  textAlign: "center",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>No vehicles registered yet.</Typography>
              </Paper>
            ) : (
              vehicles.map((vehicle, index) => (
                <Paper
                  key={vehicle.id || index}
                  sx={{
                    width: 360,
                    height: 220,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Box>
                    <Typography variant="h6">{vehicle.brand || "---"} {vehicle.model || "---"}</Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                      {vehicle.licensePlate || "---"} • {vehicle.year || "---"}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>Active</Typography>
                    <Typography>CRM Number: {vehicle.crmNumber || "---"}</Typography>
                    <Typography>Kilometers: {vehicle.kilometers?.toLocaleString() || 0} km</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    sx={{ mt: 1, color: "white", borderColor: "white" }}
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  >
                    View Details
                  </Button>
                </Paper>
              ))
            )}
          </Box>
        </Box>

        {/* Recent Bookings Section */}
        <Box mt={6}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Recent Bookings
          </Typography>
              <Grid container spacing={3}>
                {activeCampaigns.map((c) => (
                  <Grid item xs={12} md={6} key={c.id}>
                    <Paper
                             onClick={() => navigate("/campaigns")} // redirect to campaigns page
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        cursor: "pointer",
                        "&:hover": { background: "rgba(255,255,255,0.1)" }
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold">{c.title}</Typography>
                        <Chip label={c.priority} sx={{ bgcolor: getPriorityColor(c.priority), color: "white" }} />
                      </Box>
                      <Typography sx={{ mb: 1 }}>{c.description}</Typography>
                      {c.discount && <Typography sx={{ fontWeight: "bold" }}>{c.discount}</Typography>}
                      <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}>Valid until: {c.validUntil}</Typography>
                      <Typography sx={{ mt: 2, fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>
                     
                      </Typography>
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
