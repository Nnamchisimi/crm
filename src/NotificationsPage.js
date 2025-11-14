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
  Badge,
  Button,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { motion } from "framer-motion";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const userEmail = localStorage.getItem("userEmail"); // logged-in user

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:3007/api/notifications/${userEmail}`);
      const data = await res.json();
      if (res.ok) setNotifications(data);
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
      const res = await fetch(`http://localhost:3007/api/notifications/mark-read/${id}`, {
        method: "POST",
      });
      if (res.ok) fetchNotifications();
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

  return (
    <Box sx={{ minHeight: "100vh", p: 4, background: "#111", color: "white" }}>
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
        <Tab label="New" value="New" />
        <Tab label="Newsletter" value="Newsletter" />
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
  );
};

export default NotificationsPage;
