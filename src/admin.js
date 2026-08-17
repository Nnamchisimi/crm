import React, { useState, useEffect } from "react";

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
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
} from "@mui/icons-material";


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

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3007";

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Campaign Created Successfully (Simulated)!");
  };

  const [branches, setBranches] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [branchLoading, setBranchLoading] = useState(false);
  const token = localStorage.getItem("token");

  const fetchBranches = async () => {
    setBranchLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/branch`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBranches(data);
    } catch (err) {
      console.error("Error fetching branches:", err);
    } finally {
      setBranchLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "Branches") {
      fetchBranches();
    }
  }, [activeSection]);

  const handleAddBranch = async (e) => {
    e.preventDefault();
    if (!branchName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/branch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: branchName }),
      });
      if (res.ok) {
        setBranchName("");
        fetchBranches();
      }
    } catch (err) {
      console.error("Error adding branch:", err);
    }
  };

  const handleUpdateBranch = async (id, name) => {
    try {
      const res = await fetch(`${API_URL}/api/branch/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        setEditingBranchId(null);
        fetchBranches();
      }
    } catch (err) {
      console.error("Error updating branch:", err);
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm("Delete this branch?")) return;
    try {
      const res = await fetch(`${API_URL}/api/branch/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchBranches();
      }
    } catch (err) {
      console.error("Error deleting branch:", err);
    }
  };

  const [services, setServices] = useState([]);
  const [serviceLabel, setServiceLabel] = useState("");
  const [serviceCost, setServiceCost] = useState("");
  const [serviceIcon, setServiceIcon] = useState("Build");
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(false);

  const fetchServices = async () => {
    setServiceLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/servicetype`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setServiceLoading(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceLabel.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/servicetype`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: serviceLabel,
          cost: serviceCost ? parseFloat(serviceCost) : 0,
          Icon_name: serviceIcon,
        }),
      });
      if (res.ok) {
        setServiceLabel("");
        setServiceCost("");
        setServiceIcon("Build");
        fetchServices();
      }
    } catch (err) {
      console.error("Error adding service:", err);
    }
  };

  const handleUpdateService = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/api/servicetype/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setEditingServiceId(null);
        fetchServices();
      }
    } catch (err) {
      console.error("Error updating service:", err);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Delete this service type?")) return;
    try {
      const res = await fetch(`${API_URL}/api/servicetype/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchServices();
      }
    } catch (err) {
      console.error("Error deleting service:", err);
    }
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
          {["Campaigns", "Branches", "Services", "Bulk Email", "Notifications", "Newsletter"].map(
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
                  const response = await fetch(`${API_URL}/api/newsletter/send`, {

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

      {activeSection === "Branches" && (
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Manage Branches
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
            Add, edit or remove service branches
          </Typography>

          <Paper
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 3,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              mx: "auto",
              minHeight: "300px",
              width: { xs: "95%", sm: "90%", md: "85%", lg: "80%" },
              maxWidth: "900px",
            }}
          >
            <form onSubmit={handleAddBranch} style={{ display: "flex", gap: 2, mb: 4 }}>
              <TextField
                fullWidth
                label="New Branch Name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{ style: { color: "#ccc" } }}
                variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "#00bcd4",
                  "&:hover": { backgroundColor: "#00acc1" },
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                Add
              </Button>
            </form>

            {branchLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress sx={{ color: "#00bcd4" }} />
              </Box>
            ) : (
              <List>
                {branches.map((branch) => (
                  <Paper
                    key={branch.id}
                    sx={{
                      mb: 1,
                      p: 1,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            onClick={() => setEditingBranchId(branch.id)}
                            sx={{ color: "#00bcd4", mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteBranch(branch.id)}
                            sx={{ color: "#f44336" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      {editingBranchId === branch.id ? (
                        <TextField
                          defaultValue={branch.name}
                          autoFocus
                          onBlur={(e) => handleUpdateBranch(branch.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateBranch(branch.id, e.target.value);
                            }
                          }}
                          InputLabelProps={{ style: { color: "#ccc" } }}
                          InputProps={{ style: { color: "#ccc" } }}
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        <ListItemText primary={branch.name} />
                      )}
                    </ListItem>
                  </Paper>
                ))}
                {branches.length === 0 && (
                  <Typography sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center", mt: 4 }}>
                    No branches found. Add one above.
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Box>
      )}

      {activeSection === "Services" && (
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Manage Service Types
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
            Add, edit or remove service types
          </Typography>

          <Paper
            sx={{
              p: { xs: 2, sm: 3, md: 4 },
              borderRadius: 3,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              mx: "auto",
              minHeight: "300px",
              width: { xs: "95%", sm: "90%", md: "85%", lg: "80%" },
              maxWidth: "900px",
            }}
          >
            <form onSubmit={handleAddService} style={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
              <TextField
                fullWidth
                label="Service Name"
                value={serviceLabel}
                onChange={(e) => setServiceLabel(e.target.value)}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{ style: { color: "#ccc" } }}
                variant="outlined"
                sx={{ flex: 2, minWidth: 150 }}
              />
              <TextField
                label="Cost"
                type="number"
                value={serviceCost}
                onChange={(e) => setServiceCost(e.target.value)}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{ style: { color: "#ccc" } }}
                variant="outlined"
                sx={{ flex: 1, minWidth: 100 }}
              />
              <TextField
                select
                label="Icon"
                value={serviceIcon}
                onChange={(e) => setServiceIcon(e.target.value)}
                InputLabelProps={{ style: { color: "#ccc" } }}
                InputProps={{ style: { color: "#ccc" } }}
                variant="outlined"
                sx={{ flex: 1, minWidth: 150 }}
              >
                <MenuItem value="Build">Build</MenuItem>
                <MenuItem value="Tune">Tune</MenuItem>
                <MenuItem value="FlashOn">FlashOn</MenuItem>
                <MenuItem value="TireRepair">TireRepair</MenuItem>
                <MenuItem value="LocalGasStation">LocalGasStation</MenuItem>
              </TextField>
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "#00bcd4",
                  "&:hover": { backgroundColor: "#00acc1" },
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                Add
              </Button>
            </form>

            {serviceLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress sx={{ color: "#00bcd4" }} />
              </Box>
            ) : (
              <List>
                {services.map((service) => (
                  <Paper
                    key={service.id}
                    sx={{
                      mb: 1,
                      p: 1,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <ListItem
                      secondaryAction={
                        <Box>
                          <IconButton
                            edge="end"
                            onClick={() => setEditingServiceId(service.id)}
                            sx={{ color: "#00bcd4", mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            onClick={() => handleDeleteService(service.id)}
                            sx={{ color: "#f44336" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      {editingServiceId === service.id ? (
                        <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
                          <TextField
                            defaultValue={service.label}
                            autoFocus
                            onBlur={(e) =>
                              handleUpdateService(service.id, {
                                label: e.target.value,
                                cost: service.cost,
                                Icon_name: service.Icon_name,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateService(service.id, {
                                  label: e.target.value,
                                  cost: service.cost,
                                  Icon_name: service.Icon_name,
                                });
                              }
                            }}
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#ccc" } }}
                            variant="outlined"
                            size="small"
                            sx={{ flex: 2 }}
                          />
                          <TextField
                            defaultValue={service.cost}
                            type="number"
                            onBlur={(e) =>
                              handleUpdateService(service.id, {
                                label: service.label,
                                cost: parseFloat(e.target.value) || 0,
                                Icon_name: service.Icon_name,
                              })
                            }
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            InputProps={{ style: { color: "#ccc" } }}
                            variant="outlined"
                            size="small"
                            sx={{ flex: 1 }}
                          />
                        </Box>
                      ) : (
                        <ListItemText
                          primary={service.label}
                          secondary={`Cost: $${service.cost} | Icon: ${service.Icon_name || "Build"}`}
                        />
                      )}
                    </ListItem>
                  </Paper>
                ))}
                {services.length === 0 && (
                  <Typography sx={{ color: "rgba(255,255,255,0.5)", textAlign: "center", mt: 4 }}>
                    No services found. Add one above.
                  </Typography>
                )}
              </List>
            )}
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
                  const res = await fetch(`${API_URL}/api/campaigns`, {
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