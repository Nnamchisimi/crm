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
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
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

// Mock campaigns data
const campaignsMock = [
  {
    id: 1,
    title: "Winter Service Package",
    description: "Get your vehicle ready for winter with 20% off on maintenance",
    priority: "medium",
    discount: "20% OFF",
    validUntil: "31/03/2025",
    type: "Special Offer",
  },
  {
    id: 2,
    title: "Software Update Required",
    description: "Critical infotainment system update available",
    priority: "high",
    discount: null,
    validUntil: "30/06/2025",
    type: "Recall",
  },
  {
    id: 3,
    title: "Spring Maintenance Special",
    description: "15% off on all spring maintenance services",
    priority: "low",
    discount: "15% OFF",
    validUntil: "31/05/2025",
    type: "Special Offer",
  },
];

const drawerWidth = 240;

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCampaigns(campaignsMock);
  }, []);

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


  // Sidebar
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
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          background: "#111",
          color: "white",
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        {/* Page Title */}
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Service Campaigns
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>
          Active campaigns and special offers for your vehicles
        </Typography>

        {/* Summary Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
              <Typography>Total Campaigns</Typography>
              <Typography variant="h5" fontWeight="bold">{campaigns.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
              <Typography>Recalls</Typography>
              <Typography variant="h5" fontWeight="bold">
                {campaigns.filter(c => c.type === "Recall").length}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, borderRadius: 2, background: "rgba(255,255,255,0.05)" }}>
              <Typography>Special Offers</Typography>
              <Typography variant="h5" fontWeight="bold">
                {campaigns.filter(c => c.type === "Special Offer").length}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 4, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* Active Campaigns */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Your Active Campaigns
        </Typography>
        <Grid container spacing={3}>
          {campaigns.map((c) => (
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
                  <Button sx={{ mt: 2 }} variant="contained" color="primary">
                    Book Appointment
                  </Button>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4, borderColor: "rgba(255,255,255,0.2)" }} />

        {/* All Available Campaigns */}
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          All Available Campaigns
        </Typography>
        {campaigns.map((c) => (
          <Paper key={c.id} sx={{ p: 2, borderRadius: 2, mb: 2, background: "rgba(255,255,255,0.05)" }}>
            <Typography variant="h6" fontWeight="bold">{c.title}</Typography>
            <Typography sx={{ mb: 1 }}>{c.description}</Typography>
            {c.discount && <Typography>{c.discount}</Typography>}
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Valid until: {c.validUntil}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default CampaignsPage;
