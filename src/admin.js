import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Divider,
} from "@mui/material";
import { title } from "framer-motion/client";

export const Admin = () => {
 const [formData, setFormData] = useState({
  campaign_title: "",
  description: "",
  maintenance_type: "",
  priority: "",
  brand_filter: "",
  model_filter: "",
  year_filter: "",
  discount_percent: "",
  valid_until: "",
});


  // NEW: control which section is visible
  const [activeSection, setActiveSection] = useState(null);

  const campaignTypes = ["Maintenance", "Promotion", "Seasonal"];
  const priorityLevels = ["Low", "Medium", "High"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Campaign Created Successfully!");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #000 0%, #111 100%)",
        color: "white",
        p: { xs: 2, sm: 4, md: 6 },
      }}
    >
      {/* =========================
          SECTION 1: Admin Dashboard + Navigation
          ========================= */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {["Campaigns", "Bulk Email", "Notifications", "Newsletter"].map(
            (label) => (
              <Button
                key={label}
                variant="outlined"
                sx={{
                  color: "#00bcd4",
                  borderColor: "#00bcd4",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#00bcd4",
                    color: "black",
                    borderColor: "#00bcd4",
                  },
                }}
                onClick={() => setActiveSection(label)} // 👈 switch visible section
              >
                {label}
              </Button>
            )
          )}
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 5 }} />

   {activeSection === "Bulk Email" && (
  <Box>
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      Send Bulk Emails
    </Typography>
    <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
      Create and send Bulk Emails
    </Typography>

    <Paper
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        mx: "auto",
        minHeight: "300px",
        height: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: {
          xs: "95%", // full width on small screens
          sm: "90%",
          md: "85%",
          lg: "80%",
          xl: "70%", // smaller on large screens
        },
        maxWidth: "1500px",
      }}
    >
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Grid
            container
            direction="column" // 👈 forces vertical stacking
            spacing={3}
            sx={{ width: "100%" }}
          >
            {/* Subject Field */}
            <Grid item>
              <TextField
                fullWidth
                label="Subject"
                name="title"
                placeholder="Enter your message"
                value={formData.title}
                onChange={handleChange}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{
                  style: { color: "#ccc", height: "60px" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "60px",
                  },
                  width: "100%",
                }}
                variant="outlined"
              />
            </Grid>

            {/* Message Field */}
            <Grid item>
              <TextField
                fullWidth
                multiline
                rows={13}
                label="Message"
                name="description"
                placeholder="Type your message here..."
                value={formData.description}
                onChange={handleChange}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{
                  style: { color: "#ccc" },
                }}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    alignItems: "flex-start",
                  },
                }}
                variant="outlined"
              />
            </Grid>


              {/* Dropdown Menu */}
            <Grid item>
              <TextField
                select
                fullWidth
                label="Target Audience"
                name="audience"
                value={formData.audience || ""}
                onChange={handleChange}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{ style: { color: "#ccc" } }}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    height: "60px",
                  },
                }}
                variant="outlined"
              >
                <MenuItem value="">Select Audience</MenuItem>
                <MenuItem value="all">All Customers</MenuItem>
                <MenuItem value="vip">Subscribed Customers</MenuItem>
                <MenuItem value="inactive">Inactive Customers</MenuItem>
              </TextField>
            </Grid>
</Grid>


      </form>
    </Paper>
  </Box>
)}

{activeSection === "Newsletter" && (
  <Box>
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      Send Newsletter
    </Typography>
    <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
      Send newsletter to subscribed users 
    </Typography>

    <Paper
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        mx: "auto",
        minHeight: "300px",
        height: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: {
          xs: 500,
          sm: 700,
          md: 1000,
        },
        maxWidth: "100%",
      }}
    >
      <form
  onSubmit={async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert("Please fill in both subject and content.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3007/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: formData.title, content: formData.description }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Newsletter sent to ${data.count} subscribers!`);
        setFormData({ ...formData, title: "", description: "" }); // clear form
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Server error, please try again.");
    }
  }}
>

        <Grid container direction="column" spacing={3}>
          {/* Subject Field */}
          <Grid item>
            <TextField
              fullWidth
              label="Subject"
              name="title"
              placeholder="Newsletter subject..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#ccc", height: "60px" } }}
              sx={{
                "& .MuiOutlinedInput-root": { height: "60px" },
                width: "100%",
              }}
              variant="outlined"
            />
          </Grid>

          {/* Content Field */}
          <Grid item>
            <TextField
              fullWidth
              multiline
              rows={13}
              label="Content"
              name="description"
              placeholder="Newsletter content..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#ccc" } }}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": { alignItems: "flex-start" },
              }}
              variant="outlined"
            />
          </Grid>

          <Grid item>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#00bcd4",
                "&:hover": { backgroundColor: "#00acc1" },
                color: "black",
                fontWeight: "bold",
                py: 1.5,
              }}
            >
              Send Newsletter
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  </Box>
)}

{activeSection === "Notifications" && (
  <Box>
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      Send Notifications
    </Typography>
    <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
      Send or automate service notifications
    </Typography>

    <Paper
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 3,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        mx: "auto",
        minHeight: "300px",
        height: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: {
          xs: 500,
          sm: 700,
          md: 1000,
        },
        maxWidth: "100%",
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          console.log({
            title: formData.notificationTitle,
            message: formData.notificationMessage,
            type: formData.notificationType,
            target: formData.notificationTarget,
          });
          alert("Notification sent to target users (simulated)!");
          setFormData({
            ...formData,
            notificationTitle: "",
            notificationMessage: "",
            notificationType: "",
            notificationTarget: "",
          });
        }}
        style={{ width: "100%" }}
      >
        <Grid container direction="column" spacing={3}>
          {/* Title Field */}
          <Grid item>
            <TextField
              fullWidth
              label="Title"
              name="notificationTitle"
              placeholder="Notification title..."
              value={formData.notificationTitle || ""}
              onChange={(e) =>
                setFormData({ ...formData, notificationTitle: e.target.value })
              }
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#ccc", height: "60px" } }}
              sx={{ "& .MuiOutlinedInput-root": { height: "60px" }, width: "100%" }}
              variant="outlined"
            />
          </Grid>

          {/* Message Field */}
          <Grid item>
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Message"
              name="notificationMessage"
              placeholder="Notification content..."
              value={formData.notificationMessage || ""}
              onChange={(e) =>
                setFormData({ ...formData, notificationMessage: e.target.value })
              }
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#ccc" } }}
              sx={{ width: "100%", "& .MuiOutlinedInput-root": { alignItems: "flex-start" } }}
              variant="outlined"
            />
          </Grid>

          {/* Type Field */}
          <Grid item>
            <TextField
              select
              fullWidth
              label="Type"
              name="notificationType"
              value={formData.notificationType || ""}
              onChange={(e) =>
                setFormData({ ...formData, notificationType: e.target.value })
              }
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#ccc" } }}
              variant="outlined"
            >
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="Maintenance">Maintenance</MenuItem>
              <MenuItem value="Promotion">Promotion</MenuItem>
              <MenuItem value="Reminder">Reminder</MenuItem>
            </TextField>
          </Grid>

          {/* Target Field */}
          <Grid item>
            <TextField
              select
              fullWidth
              label="Target"
              name="notificationTarget"
              value={formData.notificationTarget || ""}
              onChange={(e) =>
                setFormData({ ...formData, notificationTarget: e.target.value })
              }
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "#ccc" } }}
              variant="outlined"
            >
              <MenuItem value="">Select Target</MenuItem>
              <MenuItem value="all">All Users</MenuItem>
              <MenuItem value="subscribed">Subscribed Users</MenuItem>
              <MenuItem value="inactive">Inactive Users</MenuItem>
            </TextField>
          </Grid>

          {/* Send Button */}
          <Grid item>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#00bcd4",
                "&:hover": { backgroundColor: "#00acc1" },
                color: "black",
                fontWeight: "bold",
                py: 1.5,
              }}
            >
              Send Notification
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  </Box>
)}


 {/*SECTION 4: Create Service Campaign Form*/}
{/*SECTION 4: Create Service Campaign Form*/}
{activeSection === "Campaigns" && (
  <Box>
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      Create Service Campaign
    </Typography>
    <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
      Add new service campaigns and offers
    </Typography>

    <Paper
      sx={{
        p: 4,
        borderRadius: 3,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        maxWidth: 1500,
        mx: "auto",
        minHeight: "300px",
        height: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          // send formData with keys matching the database columns
          const payload = {
            campaign_title: formData.campaign_title,
            description: formData.description,
            maintenance_type: formData.maintenance_type,
            priority: formData.priority,
            brand_filter: formData.brand_filter,
            model_filter: formData.model_filter,
            year_filter: formData.year_filter,
            discount_percent: formData.discount_percent,
            valid_until: formData.valid_until,
          };

          try {
            const res = await fetch("http://localhost:3007/api/campaigns", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (res.ok) {
              alert("Campaign created successfully!");
              setFormData({
                campaign_title: "",
                description: "",
                maintenance_type: "",
                priority: "",
                brand_filter: "",
                model_filter: "",
                year_filter: "",
                discount_percent: "",
                valid_until: "",
              });
            } else {
              alert("Error: " + data.message);
            }
          } catch (err) {
            console.error(err);
            alert("Server error, please try again.");
          }
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Campaign Title"
              name="campaign_title"
              placeholder="e.g., Winter Tire Special"
              value={formData.campaign_title}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "white" } }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              name="description"
              placeholder="Campaign details..."
              value={formData.description}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "white" } }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Type"
              name="maintenance_type"
              value={formData.maintenance_type}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "white" } }}
              variant="outlined"
            >
              {campaignTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "white" } }}
              variant="outlined"
            >
              {priorityLevels.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Brand Filter"
              name="brand_filter"
              placeholder="e.g., Toyota"
              value={formData.brand_filter}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "white" } }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Model Filter"
              name="model_filter"
              placeholder="e.g., Camry"
              value={formData.model_filter}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "white" } }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Year Filter"
              name="year_filter"
              placeholder="e.g., 2020"
              value={formData.year_filter}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "white" } }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Discount %"
              name="discount_percent"
              placeholder="e.g., 20"
              value={formData.discount_percent}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "white" } }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Valid Until"
              name="valid_until"
              placeholder="yyyy-mm-dd"
              value={formData.valid_until}
              onChange={handleChange}
              InputLabelProps={{ style: { color: "#ccc" } }}
              InputProps={{ style: { color: "white" } }}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: "#00bcd4",
                "&:hover": { backgroundColor: "#00acc1" },
                color: "black",
                fontWeight: "bold",
                py: 1.5,
              }}
            >
              Create Campaign
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  </Box>
)}

      
    </Box>
  );
};
