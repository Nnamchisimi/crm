import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Drawer,
  Button,
  CircularProgress
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { jwtDecode } from "jwt-decode";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3007";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Strictly using sessionStorage
  const userEmail = sessionStorage.getItem("userEmail");
  const userToken = sessionStorage.getItem("token");

  const handleSignOut = () => {
    sessionStorage.clear(); // Clears session data
    navigate("/signin", { replace: true });
  };

  /* 🔐 Auth Guard & Initial Fetch */
  useEffect(() => {
    if (!userToken) {
      navigate("/signin", { replace: true });
      return;
    }

    try {
      const { role } = jwtDecode(userToken);
      if (role !== "user") {
        navigate("/signin", { replace: true });
        return;
      }
      fetchNotifications();
    } catch (err) {
      console.error("Auth error:", err);
      handleSignOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, userToken]);

  const fetchNotifications = async () => {
    if (!userEmail || !userToken) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/notifications/${userEmail}`, {
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/mark-read/${id}`, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      if (res.ok) fetchNotifications();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.is_read;
    return n.type === filter;
  });

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
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ background: "linear-gradient(90deg, #fff, #00bcd4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        AutoCRM
      </Typography>
      <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.1)" }} />
      <List>
        {sidebarItems.map((item, idx) => (
          <ListItem
            key={idx}
            component="div"
            onClick={() => {
              item.onClick ? item.onClick() : navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{ 
              cursor: "pointer",
              borderRadius: 1,
              mb: 0.5,
              color: item.path === "/notifications" ? "#00bcd4" : "#ccc", 
              "&:hover": { color: "#00bcd4", backgroundColor: "rgba(255,255,255,0.05)" } 
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
    <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh", background: "linear-gradient(180deg, #000 0%, #111 100%)", color: "white" }}>
      <Box sx={{ position: "fixed", top: 10, right: 10, zIndex: 1200, display: { md: "none" } }}>
        <IconButton color="inherit" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
      </Box>

      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} anchor="right" sx={{ "& .MuiDrawer-paper": { background: "rgba(0,0,0,0.95)", color: "white" } }}>
        {drawer}
      </Drawer>

      <Box sx={{ width: 250, display: { xs: "none", md: "block" }, borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        {drawer}
      </Box>

      <Box sx={{ flex: 1, p: { xs: 2, sm: 4 }, maxWidth: 1100, mx: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
           <Button onClick={() => navigate("/dashboard")} sx={{ color: "#00bcd4" }}>← Back</Button>
           <Chip label={userEmail || "User"} variant="outlined" sx={{ color: "#00bcd4", borderColor: "#00bcd4" }} />
        </Box>

        <Typography variant="h4" fontWeight="bold">Notifications</Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>Vehicle maintenance and service alerts.</Typography>

        <Box sx={{ maxWidth: "100%", overflowX: "auto", mb: 3 }}>
          <Tabs value={filter} onChange={(e, val) => setFilter(val)} textColor="secondary" indicatorColor="secondary" variant="scrollable">
            <Tab label={`All (${notifications.length})`} value="All" />
            <Tab label={`Unread (${notifications.filter(n => !n.is_read).length})`} value="Unread" />
            <Tab label="Service" value="Service" />
            <Tab label="Campaigns" value="Campaign" />
          </Tabs>
        </Box>

        <Paper sx={{ p: 3, borderRadius: 3, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", minHeight: "200px", display: "flex", flexDirection: "column" }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}><CircularProgress color="secondary" /></Box>
          ) : filteredNotifications.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "rgba(255,255,255,0.5)", my: 5 }}>No notifications found.</Typography>
          ) : (
            <List>
              {filteredNotifications.map((notif) => (
                <motion.div key={notif.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ListItem
                    sx={{
                      mb: 1, borderRadius: 1,
                      backgroundColor: notif.is_read ? "transparent" : "rgba(0,188,212,0.1)",
                    }}
                    secondaryAction={!notif.is_read && (
                      <IconButton onClick={() => markAsRead(notif.id)} sx={{ color: "#00bcd4" }}><DoneIcon /></IconButton>
                    )}
                  >
                    <ListItemText
                      primary={<Typography fontWeight={notif.is_read ? "normal" : "bold"}>{`[${notif.type}] ${notif.title}`}</Typography>}
                      secondary={<Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>{notif.message}</Typography>}
                    />
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default NotificationsPage;