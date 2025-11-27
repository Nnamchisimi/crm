import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip, Paper, Divider } from "@mui/material";

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [error, setError] = useState(null);
    // 1. ADDED: State to track the active tab
    const [activeTab, setActiveTab] = useState("Overview"); 

    useEffect(() => {
        setError(null); 
        
        const token = localStorage.getItem('token'); 
        
        if (!token) {
            console.error("Authentication token is missing. Redirecting.");
            setError("Access denied. Please log in.");
            return; 
        }

        fetch(`http://localhost:3007/api/vehicles/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, 
            },
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`Failed to load vehicle. Server returned status: ${res.status}`); 
            }
            return res.json();
        })
        .then((data) => {
            console.log("Vehicle details:", data);
            setVehicle(data);
        })
        .catch((err) => {
            console.error("Fetch or Auth Error:", err);
            setError(err.message); 
            setVehicle(null);
        });

    }, [id, navigate]);

    // Conditional Renders (Loading and Error checks)
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
    
    // 2. ADDED: Helper function to render content based on the active tab
// Inside the CarDetails component...

const renderTabContent = () => {
    switch (activeTab) {
        case "Overview":
            return (
                <>
                    {/* UPCOMING MAINTENANCE */}
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                        Upcoming Maintenance
                    </Typography>
                    <Paper
                        sx={{
                            // ... styling
                        }}
                    >
                        {/* Maintenance content */}
                    </Paper>

                    {/* ACTIVE CAMPAIGNS (This section is now visible only on the Campaigns tab) */}
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                        Active Campaigns
                    </Typography>
                    {vehicle.activeCampaigns?.length ? (
                        vehicle.activeCampaigns.map((camp) => (
                            <Paper
                                key={camp.id}
                                sx={{
                                    // ... styling
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
                </>
            );
        case "Service History":
            return <Typography sx={{ p: 2 }}>Service history will go here.</Typography>;
            
        case "Campaigns":
            // 🛑 CRITICAL CHANGE: Move the campaign rendering logic here
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
                                <Chip
                                    label={camp.priority}
                                    sx={{ bgcolor: "orange", color: "white", mt: 2 }}
                                />
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
            <Button
                onClick={() => navigate("/dashboard")}
                sx={{ color: "#00bcd4", mb: 3 }}
            >
                ← Back to Dashboard
            </Button>

            {/* Vehicle Header Info (Always visible) */}
            <Typography variant="h5" sx={{ color: "#00bcd4", mb: 1 }}>
                {vehicle.name || "Unknown Customer"}
            </Typography>

            <Typography variant="h4" fontWeight="bold">
                {vehicle.brand} {vehicle.model}
            </Typography>

            <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
                {vehicle.licensePlate} • {vehicle.year} {vehicle.vehicleType}
            </Typography>

            <Typography sx={{ fontSize: 18, mb: 3 }}>
                CRM: {vehicle.crm_number}
            </Typography>

            <Chip label="active" sx={{ bgcolor: "green", color: "white", mb: 4 }} />

            {/* VEHICLE DETAILS BOX (Always visible) */}
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
                <Typography sx={{ mb: 2 }}>
                    {vehicle.kilometers?.toLocaleString() || 0} km
                </Typography>
                <Typography sx={{ fontWeight: "bold" }}>Next Service</Typography>
                <Typography>{vehicle.nextService || "Not scheduled"}</Typography>
            </Paper>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 4 }} />

            {/* TABS UI (Now Functional) */}
            <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
                {["Overview", "Service History", "Campaigns", "Settings"].map((tab) => (
                    <Typography
                        key={tab}
                        // 3. ADDED: onClick handler to change the activeTab state
                        onClick={() => setActiveTab(tab)} 
                        sx={{
                            cursor: "pointer",
                            // 4. UPDATED: Active tab visual check against activeTab state
                            borderBottom: activeTab === tab ? "2px solid #00bcd4" : "none", 
                            paddingBottom: "4px",
                        }}
                    >
                        {tab}
                    </Typography>
                ))}
            </Box>

            {/* 5. ADDED: Render the content based on the active tab */}
            <Box>
                {renderTabContent()}
            </Box>
        </Box>
    );
};

export default CarDetails;