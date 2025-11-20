import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip, Paper, Divider } from "@mui/material";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3007/api/vehicles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Vehicle details:", data);
        setVehicle(data);
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!vehicle) {
    return (
      <Typography sx={{ p: 5, color: "white" }}>
        Loading vehicle details...
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 4, color: "white" }}>
      <Button
        onClick={() => navigate("/dashboard")}
        sx={{ color: "#00bcd4", mb: 3 }}
      >
        ← Back to Dashboard
      </Button>

      {/* Customer Name */}
      <Typography variant="h5" sx={{ color: "#00bcd4", mb: 1 }}>
        {vehicle.name|| "Unknown Customer"}
      </Typography>

      {/* Vehicle Title */}
      <Typography variant="h4" fontWeight="bold">
        {vehicle.brand} {vehicle.model}
      </Typography>

      {/* Basic Info */}
      <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
        {vehicle.licensePlate} • {vehicle.year} {vehicle.type}
      </Typography>

      {/* CRM Number */}
      <Typography sx={{ fontSize: 18, mb: 3 }}>
        CRM: {vehicle.crmNumber}
      </Typography>

      <Chip label="active" sx={{ bgcolor: "green", color: "white", mb: 4 }} />

      {/* VEHICLE DETAILS BOX */}
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
        <Typography sx={{ mb: 2 }}>{vehicle.fuelType || "—"}</Typography>

        <Typography sx={{ fontWeight: "bold" }}>Kilometers</Typography>
        <Typography sx={{ mb: 2 }}>
          {vehicle.kilometers?.toLocaleString() || 0} km
        </Typography>

        <Typography sx={{ fontWeight: "bold" }}>Next Service</Typography>
        <Typography>{vehicle.nextService || "Not scheduled"}</Typography>
      </Paper>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 4 }} />

      {/* TABS UI */}
      <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
        {["Overview", "Service History", "Campaigns", "Settings"].map((tab) => (
          <Typography
            key={tab}
            sx={{
              cursor: "pointer",
              borderBottom: "2px solid #00bcd4",
              paddingBottom: "4px",
            }}
          >
            {tab}
          </Typography>
        ))}
      </Box>

      {/* UPCOMING MAINTENANCE */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Upcoming Maintenance
      </Typography>

      <Paper
        sx={{
          p: 3,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Typography fontWeight="bold">Regular Service</Typography>
        <Typography sx={{ mb: 2 }}>
          Every 10,000 km or 6 months
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#00bcd4",
            "&:hover": { backgroundColor: "#0097a7" },
          }}
        >
          Book Now
        </Button>
      </Paper>

      {/* ACTIVE CAMPAIGNS */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
        Active Campaigns
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
            <Chip
              label={camp.priority}
              sx={{ bgcolor: "orange", color: "white", mt: 2 }}
            />
          </Paper>
        ))
      ) : (
        <Typography>No active campaigns.</Typography>
      )}
    </Box>
  );
};

export default CarDetails;
