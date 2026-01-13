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
  Chip,
} from "@mui/material";


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
    send_to: "",
    
 
    audience: "",
    

    notificationTitle: "",
    notificationMessage: "",
    notificationType: "",
    notificationTarget: "",
  });

  const [activeSection, setActiveSection] = useState("Campaigns"); 
    const userEmail = localStorage.getItem("userEmail");

  const campaignTypes = ["Maintenance", "Promotion", "Seasonal"];
  const priorityLevels = ["Low", "Medium", "High"];

  const handleChange = (e) => {

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Campaign Created Successfully (Simulated)!");
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

      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Admin Dashboard
        </Typography>
         <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Chip
                      label={userEmail}
                      variant="outlined"
                      sx={{
                        width: "200px",
                        color: "#00bcd4",
                        borderColor: "#00bcd4",
                      }}
                    />
                  </Box>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {["Campaigns", "Bulk Email", "Notifications", "Newsletter"].map(
            (label) => (
              <Button
                key={label}
                variant={activeSection === label ? "contained" : "outlined"} 
                sx={{
                  color: activeSection === label ? "black" : "#00bcd4",
                  backgroundColor: activeSection === label ? "#00bcd4" : "transparent",
                  borderColor: "#00bcd4",
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#00bcd4",
                    color: "black",
                    borderColor: "#00bcd4",
                  },
                }}
                onClick={() => setActiveSection(label)} // switch visible section
              >
                {label}
              </Button>
            )
          )}
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", mb: 5 }} />

      {/* =========================
          SECTION 2: Bulk Email Form
          ========================= */}
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
                xs: "95%",
                sm: "90%",
                md: "85%",
                lg: "80%",
                xl: "70%",
              },
              maxWidth: "1500px",
            }}
          >
            <form onSubmit={handleSubmit} style={{ width: "100%" }}>
              <Grid
                container
                direction="column" // forces vertical stacking
                spacing={3}
                sx={{ width: "100%" }}
              >
                {/* Subject Field - ALIGNED to campaign_title */}
                <Grid item>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="campaign_title" // Correctly aligned to campaign_title
                    placeholder="Enter your message"
                    value={formData.campaign_title || ""}
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

                {/* Message Field - ALIGNED to description */}
                <Grid item>
                  <TextField
                    fullWidth
                    multiline
                    rows={13}
                    label="Message"
                    name="description" // Correctly aligned to description
                    placeholder="Type your message here..."
                    value={formData.description || ""}
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

                {/* Dropdown Menu (Audience selection) */}
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

      {/* =========================
          SECTION 3: Newsletter Form
          ========================= */}
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
           
                if (!formData.campaign_title || !formData.description) {
                  alert("Please fill in both subject and content.");
                  return;
                }

                try {
                  const response = await fetch("http://localhost:3007/api/newsletter/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },

                    body: JSON.stringify({ subject: formData.campaign_title, content: formData.description }),
                  });

                  const data = await response.json();
                  if (response.ok) {
                    alert(`Newsletter sent to ${data.count} subscribers!`);
                    setFormData({ ...formData, campaign_title: "", description: "" }); 
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
          
                <Grid item>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="campaign_title" 
                    placeholder="Newsletter subject..."
                    value={formData.campaign_title || ""}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "#ccc", height: "60px" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": { height: "60px" },
                      width: "100%",
                    }}
                    variant="outlined"
                  />
                </Grid>

   
                <Grid item>
                  <TextField
                    fullWidth
                    multiline
                    rows={13}
                    label="Content"
                    name="description" 
                    placeholder="Newsletter content..."
                    value={formData.description || ""}
                    onChange={handleChange}
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
      
                <Grid item>
                  <TextField
                    fullWidth
                    label="Title"
                    name="notificationTitle"
                    placeholder="Notification title..."
                    value={formData.notificationTitle || ""}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "#ccc", height: "60px" } }}
                    sx={{ "& .MuiOutlinedInput-root": { height: "60px" }, width: "100%" }}
                    variant="outlined"
                  />
                </Grid>


                <Grid item>
                  <TextField
                    fullWidth
                    multiline
                    rows={10}
                    label="Message"
                    name="notificationMessage"
                    placeholder="Notification content..."
                    value={formData.notificationMessage || ""}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "#ccc" } }}
                    sx={{ width: "100%", "& .MuiOutlinedInput-root": { alignItems: "flex-start" } }}
                    variant="outlined"
                  />
                </Grid>


                <Grid item>
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    name="notificationType"
                    value={formData.notificationType || ""}
                    onChange={handleChange}
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

                <Grid item>
                  <TextField
                    select
                    fullWidth
                    label="Target"
                    name="notificationTarget"
                    value={formData.notificationTarget || ""}
                    onChange={handleChange}
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
              height: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                if (!formData.campaign_title || !formData.description) {
                  alert("Please fill in the title and description!");
                  return;
                }

           
                const payload = {
                  campaign_title: formData.campaign_title,
                  description: formData.description,
                  maintenance_type: formData.maintenance_type,
                  priority: formData.priority,
                  discount_percent: formData.discount_percent
                    ? parseInt(formData.discount_percent)
                    : null, 
                  valid_until: formData.valid_until,
   
                  send_to: formData.send_to,
                  brand_filter: formData.send_to === "filtered" ? formData.brand_filter : null,
                  model_filter: formData.send_to === "filtered" ? formData.model_filter : null,
                  year_filter: formData.send_to === "filtered" ? formData.year_filter : null,
                };

                try {
                  const res = await fetch(
                    "http://localhost:3007/api/campaigns",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    }
                  );
                  const data = await res.json();
                  if (res.ok) {
                    alert("Campaign sent successfully!");

                    setFormData({
                      ...formData, 
                      campaign_title: "",
                      description: "",
                      maintenance_type: "",
                      priority: "",
                      brand_filter: "",
                      model_filter: "",
                      year_filter: "",
                      discount_percent: "",
                      valid_until: "",
                      send_to: "",
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


                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    name="maintenance_type"
                    value={formData.maintenance_type}
                    onChange={handleChange}
                    InputLabelProps={{  shrink: true, style: { color: "#ccc" } }}
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

                


                <Grid item xs={12} sm={6} md={3}>
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


                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Discount %"
                    name="discount_percent"
                    placeholder="e.g., 20"
                    value={formData.discount_percent}
                    onChange={handleChange}
                    type="number" 
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    variant="outlined"
                  />
                </Grid>

        
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Valid Until"
                    name="valid_until"
                    placeholder="yyyy-mm-dd"
                    value={formData.valid_until}
                    onChange={handleChange}
                    type="date" 
                    InputLabelProps={{  shrink: true, style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    variant="outlined"
                  />
                </Grid>


                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Send To"
                    name="send_to"
                    value={formData.send_to}
                    onChange={handleChange}
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    variant="outlined"
                  >
                    <MenuItem value="">Select Target</MenuItem>
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="filtered">Filtered Users</MenuItem>
                  </TextField>
                </Grid>
                
          
                {formData.send_to === "filtered" && (
                  <>
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
                        type="number"
                        InputLabelProps={{ style: { color: "#ccc" } }}
                        InputProps={{ style: { color: "white" } }}
                        variant="outlined"
                      />
                    </Grid>
                  </>
                )}

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
                    Send Campaign
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