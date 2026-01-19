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

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3007";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [mobileOpen, setMobileOpen] = useState(false);
  const userEmail = localStorage.getItem("userEmail");

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/signin", { replace: true });
  };

  /* 🔐 Auth Guard */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/signin", { replace: true });

    const { role } = jwtDecode(token);
    if (role !== "user") navigate("/signin", { replace: true });
  }, [navigate]);

  const sidebarItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Campaigns", icon: <CampaignIcon />, path: "/campaigns" },
    { text: "Newsletter", icon: <EmailIcon />, path: "/newsletter" },
    { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
    { text: "Booking", icon: <CalendarMonthIcon />, path: "/booking" },
    { text: "Sign Out", icon: <ExitToAppIcon />, onClick: handleSignOut },
  ];

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/notifications/${userEmail}`
      );
      const data = await res.json();
      if (res.ok) setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/notifications/mark-read/${id}`,
        { method: "POST" }
      );
      if (res.ok) fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.is_read;
    return n.type === filter;
  });

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

      <Divider sx={{ mb: 2 }} />

      <List>
        {sidebarItems.map((item, idx) => (
          <ListItem
            key={idx}
            button
            onClick={() => {
              item.onClick ? item.onClick() : navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              color:
                item.path === "/notifications" ? "#00bcd4" : "#ccc",
              "&:hover": { color: "#00bcd4" },
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
        width: "100vw",
        minHeight: "100vh",
        overflowX: "hidden",
        background: "linear-gradient(180deg, #000 0%, #111 100%)",
        color: "white",
      }}
    >
      {/* Mobile menu button */}
      <Box
        sx={{
          position: "fixed",
          top: 10,
          right: 10,
          zIndex: 1200,
          display: { md: "none" },
        }}
      >
        <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        anchor="right"
        sx={{
          display: { md: "none" },
          "& .MuiDrawer-paper": {
            background: "rgba(0,0,0,0.95)",
            color: "white",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Sidebar */}
      <Box
        sx={{
          width: 250,
          display: { xs: "none", md: "block" },
          background: "rgba(255,255,255,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {drawer}
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          width: "100%",
          p: { xs: 2, sm: 4 },
          maxWidth: 1100,
          mx: "auto",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Chip
            label={userEmail}
            variant="outlined"
            sx={{ color: "#00bcd4", borderColor: "#00bcd4" }}
          />
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Notifications
        </Typography>

        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
          Stay updated with your vehicle maintenance, service alerts,
          and newsletters.
        </Typography>

        {/* ✅ SCROLLABLE TABS (NO PAGE OVERFLOW) */}
        <Box sx={{ maxWidth: "100%", overflowX: "auto", mb: 3 }}>
          <Tabs
            value={filter}
            onChange={(e, val) => setFilter(val)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            textColor="secondary"
            indicatorColor="secondary"
          >
            <Tab label={`All (${notifications.length})`} value="All" />
            <Tab
              label={`Unread (${notifications.filter((n) => !n.is_read).length})`}
              value="Unread"
            />
            <Tab label="Service" value="Service" />
            <Tab label="Campaigns" value="Campaign" />
          </Tabs>
        </Box>

        {/* Notifications list */}
        <Paper
          sx={{
            p: 3,
            width: "100%",
            maxWidth: 900,
            mx: "auto",
            borderRadius: 3,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            maxHeight: "60vh",
            overflowY: "auto",
          }}
        >
          {filteredNotifications.length === 0 && (
            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
              No notifications to show.
            </Typography>
          )}

          <List>
            {filteredNotifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ListItem
                  sx={{
                    mb: 1,
                    borderRadius: 1,
                    backgroundColor: notif.is_read
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,188,212,0.12)",
                  }}
                  secondaryAction={
                    !notif.is_read && (
                      <IconButton
                        onClick={() => markAsRead(notif.id)}
                        sx={{ color: "#00bcd4" }}
                      >
                        <DoneIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={`[${notif.type}] ${notif.title}`}
                    secondary={notif.message}
                  />
                </ListItem>
              </motion.div>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default NotificationsPage;
