import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  IconButton,
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

const drawerWidth = 240;

const CampaignsPage = () => {
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail"); // Logged-in user email

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(`http://localhost:3007/api/campaigns?email=${userEmail}`);
        const data = await res.json();

        const mapped = data.map(c => ({
          id: c.id,
          title: c.campaign_title,
          description: c.description,
          type: c.maintenance_type,
          priority: c.priority,
          brand: c.brand_filter,
          model: c.model_filter,
          year: c.year_filter,
          discount: c.discount_percent ? `${c.discount_percent}% OFF` : null,
          validUntil: c.validUntil, // use backend-formatted date
          bookedByUser: !!c.bookedByUser, // <-- use backend's flag 
        }));

        setActiveCampaigns(mapped.filter(c => c.bookedByUser));
        setAllCampaigns(mapped.filter(c => !c.bookedByUser));
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      }
    };

    fetchCampaigns();
  }, [userEmail]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "red";
      case "medium": return "orange";
      case "low": return "green";
      default: return "gray";
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

    if (!res.ok) {
      return alert(result.message || "Failed to book campaign");
    }

    // Remove from allCampaigns and add to activeCampaigns
    setAllCampaigns(prev => prev.filter(c => c.id !== campaign.id));

    setActiveCampaigns(prev => [
      ...prev,
      { ...campaign, bookedByUser: true }
    ]);

  } catch (err) {
    console.error("Failed to book campaign:", err);
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
    console.log("Cancel response:", result);

    if (!res.ok) return alert(result.message);

    // Remove from active campaigns
    setActiveCampaigns(prev => prev.filter(c => c.id !== campaign.id));

    // Add back to available campaigns
    setAllCampaigns(prev => [...prev, { ...campaign, bookedByUser: false }]);

  } catch (err) {
    console.error("Failed to cancel campaign:", err);
  }
};



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
            onClick={() => { navigate(item.path); setMobileOpen(false); }}
          >
            {item.icon}
            <ListItemText primary={item.text} sx={{ ml: 2 }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg, #000 0%, #111 100%)", color: "white" }}>
      {/* Mobile Hamburger */}
      <Box sx={{ position: "fixed", top: 10, left: 10, display: { xs: "block", md: "none" }, zIndex: 1200 }}>
        <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { background: "rgba(0,0,0,0.9)", color: "white" } }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box sx={{ width: 250, background: "rgba(255,255,255,0.05)", borderRight: "1px solid rgba(255,255,255,0.1)", p: 3, display: { xs: "none", md: "block" } }}>
        {drawer}
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 4, ml: { sm: `${drawerWidth}px` } }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Service Campaigns
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>
          Active campaigns and all available campaigns for your vehicles
        </Typography>

        {/* Active Campaigns */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>Your Active Campaigns</Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {activeCampaigns.length === 0 && <Typography>No active campaigns currently.</Typography>}
          {activeCampaigns.map(c => (
            <Grid item xs={12} md={6} key={c.id}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Paper sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.05)" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{c.title}</Typography>
                    <Chip label={c.priority} sx={{ bgcolor: getPriorityColor(c.priority), color: "white" }} />
                  </Box>
                  <Typography sx={{ mb: 1 }}>{c.description}</Typography>
                  {c.discount && <Typography sx={{ fontWeight: "bold" }}>{c.discount}</Typography>}
                  <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}>Valid until: {c.validUntil}</Typography>
                  <Button sx={{ mt: 2 }} variant="contained" color="secondary" onClick={() => cancelCampaign(c, userEmail)}>
                    Cancel Appointment
                  </Button>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Available Campaigns */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>All Available Campaigns</Typography>
        <Grid container spacing={3}>
          {allCampaigns.map(c => (
            <Grid item xs={12} md={6} key={c.id}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Paper sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.05)" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{c.title}</Typography>
                    <Chip label={c.priority} sx={{ bgcolor: getPriorityColor(c.priority), color: "white" }} />
                  </Box>
                  <Typography sx={{ mb: 1 }}>{c.description}</Typography>
                  {c.discount && <Typography sx={{ fontWeight: "bold" }}>{c.discount}</Typography>}
                  <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.7)" }}>Valid until: {c.validUntil}</Typography>
                  <Button sx={{ mt: 2 }} variant="contained" color="primary" onClick={() => bookCampaign(c)}>
                    Book Appointment
                  </Button>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default CampaignsPage;
