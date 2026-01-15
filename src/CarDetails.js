import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip, Paper, Divider } from "@mui/material";
import EditCarDetails from "./editcardetails";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3007";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);

  const handleVehicleUpdate = (updatedData) => {
    setVehicle(updatedData);
  };

  const fetchVehicleDetails = async () => {
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Authentication token is missing. Redirecting.");
      setError("Access denied. Please log in.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/vehicles/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load vehicle. Server returned status: ${res.status}`);
      }

      const data = await res.json();

      const normalizedData = {
        ...data,
        fuelType: data.fuelType || data.fuel_type,
        vehicleType: data.vehicleType || data.type,
      };

      setVehicle(normalizedData);
    } catch (err) {
      console.error("Fetch or Auth Error:", err);
      setError(err.message);
      setVehicle(null);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]);

  if (error) {
    return (
      <Typography color="error" sx={{ p: 5 }}>
        ❌ Error loading vehicle: **{error}**
      </Typography>
    );
  }

  if (!vehicle) {
    return (
      <Typography sx={{ p: 5, color: "white" }}>
        ⏳ Loading vehicle details...
      </Typography>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <>
            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, background: "rgba(255,255,255,0.05)" }}>
              {/* Vehicle maintenance or other overview content can go here */}
            </Paper>
          </>
        );

      case "Service History":
        return <Typography sx={{ p: 2 }}>Service history will go here.</Typography>;

      case "Campaigns":
        return (
          <Box sx={{ pt: 2 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Active Campaigns for {vehicle.brand}
            </Typography>
            {vehicle.activeCampaigns?.length ? (
              vehicle.activeCampaigns.map((camp) => (
                <Paper
                  key={camp.id}
                  sx={{
                    p: 3,
                    mb: 3,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {camp.title}
                  </Typography>
                  <Typography sx={{ mt: 1 }}>{camp.description}</Typography>
                  <Chip label={camp.priority} sx={{ bgcolor: "orange", color: "white", mt: 2 }} />
                </Paper>
              ))
            ) : (
              <Typography>No active campaigns for this vehicle.</Typography>
            )}
          </Box>
        );

      case "Settings":
        return <Typography sx={{ p: 2 }}>Vehicle settings and preferences.</Typography>;

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 4, color: "white" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Button onClick={() => navigate("/dashboard")} sx={{ color: "#00bcd4", mb: 3 }}>
          ← Back to Dashboard
        </Button>

        <Button
          variant="outlined"
          onClick={() => setIsEditCarOpen(true)}
          sx={{
            color: "white",
            borderColor: "#00bcd4",
            "&:hover": { borderColor: "white", bgcolor: "rgba(0,188,212, 0.1)" },
          }}
        >
          Edit Details
        </Button>
      </Box>

      <Typography variant="h4" fontWeight="bold">
        {vehicle.brand} {vehicle.model}
      </Typography>

      <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
        {vehicle.license_plate} • {vehicle.year} {vehicle.vehicleType || vehicle.vehicle_type}
      </Typography>

      <Typography sx={{ fontSize: 18, mb: 3 }}>CRM: {vehicle.crm_number}</Typography>

      <Chip label="active" sx={{ bgcolor: "green", color: "white", mb: 4 }} />

      <Paper
        sx={{
          p: 3,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Typography sx={{ fontWeight: "bold" }}>VIN</Typography>
        <Typography sx={{ mb: 2 }}>{vehicle.vin || "—"}</Typography>

        <Typography sx={{ fontWeight: "bold" }}>Fuel Type</Typography>
        <Typography sx={{ mb: 2 }}>{vehicle.fuel_type || "—"}</Typography>

        <Typography sx={{ fontWeight: "bold" }}>Kilometers</Typography>
        <Typography sx={{ mb: 2 }}>{vehicle.kilometers?.toLocaleString() || 0} km</Typography>

        <Typography sx={{ fontWeight: "bold" }}>Next Service</Typography>
        <Typography>{vehicle.nextService || "Not scheduled"}</Typography>
      </Paper>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 4 }} />

      {/* Tabs UI */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        {["Overview", "Service History", "Campaigns", "Settings"].map((tab) => (
          <Typography
            key={tab}
            onClick={() => setActiveTab(tab)}
            sx={{
              cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #00bcd4" : "none",
              paddingBottom: "4px",
            }}
          >
            {tab}
          </Typography>
        ))}
      </Box>

      <Box>{renderTabContent()}</Box>

      {vehicle && (
        <EditCarDetails
          open={isEditCarOpen}
          handleClose={() => setIsEditCarOpen(false)}
          vehicle={vehicle}
          onUpdate={handleVehicleUpdate}
        />
      )}
    </Box>
  );
};

export default CarDetails;
