import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Drawer,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home"; // Added
import DashboardIcon from "@mui/icons-material/Dashboard"; // Added
import CampaignIcon from "@mui/icons-material/Campaign"; // Added
import EmailIcon from "@mui/icons-material/Email"; // Added
import NotificationsIcon from "@mui/icons-material/Notifications"; // Added
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Added
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Added

// Define the common sidebar items outside the component
const sidebarItems = [
  { text: "Home", icon: <HomeIcon />, path: "/" },
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Campaigns", icon: <CampaignIcon />, path: "/campaigns" },
  { text: "Newsletter", icon: <EmailIcon />, path: "/newsletter" },
  { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
  { text: "Sign Out", icon: <ExitToAppIcon />, path: "/signin" },
];

const NotificationsPage = () => {
  const navigate = useNavigate(); // Added
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [mobileOpen, setMobileOpen] = useState(false);
  const userEmail = localStorage.getItem("userEmail"); // logged-in user

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      // Fixed template literal and used 'res.ok'
      const res = await fetch(`http://localhost:3007/api/notifications/${userEmail}`);
      const data = await res.json();
      // Fixed condition to use res.ok
      if (res.ok) {
        setNotifications(data);
      } else {
        console.error("Failed to fetch notifications:", data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      // Fixed template literal and used 'res.ok'
      const res = await fetch(`http://localhost:3007/api/notifications/mark-read/${id}`, {
        method: "POST",
      });
      // Fixed condition to use res.ok
      if (res.ok) {
        fetchNotifications(); // Refresh notifications after marking as read
      } else {
        console.error("Failed to mark as read");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.is_read;
    return n.type === filter;
  });

  // Common Drawer/Sidebar content (identical to Newsletter component)
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
            sx={{ 
              color: item.path === '/notifications' ? '#00bcd4' : '#ccc', // Highlight current page
              "&:hover": { color: "#00bcd4" } 
            }}
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
      {/* Mobile Hamburger (Identical Design) */}
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

      {/* Mobile Drawer (Identical Design) */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { 
            background: "rgba(0,0,0,0.9)", 
            color: "white", 
            // Ensures Drawer matches the sidebar background tone
          }, 
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Sidebar (Identical Design) */}
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

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Notifications
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
          Stay updated with your vehicle maintenance, service alerts, and newsletters.
        </Typography>

        {/* Tabs */}
        <Tabs
          value={filter}
          onChange={(e, val) => setFilter(val)}
          sx={{ mb: 3 }}
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

        <Paper
          sx={{
            p: 3,
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
                    backgroundColor: notif.is_read
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,188,212,0.1)",
                    mb: 1,
                    borderRadius: 1,
                    alignItems: "flex-start",
                    transition: "background-color 0.3s",
                  }}
                  secondaryAction={
                    !notif.is_read && (
                      <IconButton
                        edge="end"
                        onClick={() => markAsRead(notif.id)}
                        sx={{ color: "#00bcd4" }}
                      >
                        <DoneIcon />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Typography fontWeight={notif.is_read ? "normal" : "bold"}>
                        [{notif.type}] {notif.title}
                      </Typography>
                    }
                    secondary={<Typography sx={{ color: "rgba(255,255,255,0.7)" }}>{notif.message}</Typography>}
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