import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Grid,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import { ChevronLeft, ChevronRight, EventAvailable, CheckCircle, CarRental, Build, Tune, FlashOn, TireRepair, LocalGasStation } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// --- Configuration & Constants ---
const API_BASE_URL = "http://localhost:3007/api"; 
const mockTimeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];

// Utility to mock the date for the review step
const today = new Date();
const defaultAppointmentDate = new Date(today);
defaultAppointmentDate.setDate(today.getDate() + 2);

const steps = [
  "Select Vehicle",
  "Choose Service",
  "Pick Date & Time",
  "Review & Confirm",
];

// Helper to map icon names (from DB/API 'type' column) to MUI Icons
const getIconComponent = (iconName) => {
  switch (iconName) {
    case "Build": return <Build />;
    case "Tune": return <Tune />;
    case "FlashOn": return <FlashOn />;
    case "TireRepair": return <TireRepair />;
    case "LocalGasStation": return <LocalGasStation />;
    default: return <Build />; 
  }
};

// --- Custom Calendar Mock Component ---
const CalendarMock = ({ selectedDate, onDateSelect }) => {
  const dates = [];
  // Mock calendar showing 7 days from today
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }

  return (
    <Box sx={{ p: 2, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Select Date
      </Typography>
      <Grid container spacing={1} justifyContent="center">
        {dates.map((date, index) => (
          <Grid item key={index}>
            <Paper
              onClick={() => onDateSelect(date)}
              sx={{
                p: 1,
                textAlign: "center",
                cursor: "pointer",
                borderRadius: 2,
                minWidth: 50,
                background: selectedDate?.toDateString() === date.toDateString() 
                  ? "#00bcd4" 
                  : "rgba(255,255,255,0.1)",
                color: selectedDate?.toDateString() === date.toDateString() ? "#000" : "white",
                "&:hover": { background: selectedDate?.toDateString() === date.toDateString() ? "#00bcd4" : "rgba(255,255,255,0.2)" },
              }}
            >
              <Typography variant="caption" sx={{ display: "block", fontWeight: "bold" }}>
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </Typography>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>
                {date.getDate()}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};


// --- Main Component ---
const BookService = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]); 
  const [vehicleLoading, setVehicleLoading] = useState(true); 
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceLoading, setServiceLoading] = useState(true); 

  // Access Local Storage for User Info and Token
  const userToken = localStorage.getItem("token");
  const userEmail = localStorage.getItem("userEmail"); 

  // Form Data State
  const [formData, setFormData] = useState({
    vehicle: null,
    service: null, // Holds {id, name, price, type, ...}
    date: defaultAppointmentDate, 
    timeSlot: mockTimeSlots[1], 
    notes: "",
    userEmail: userEmail,
  });

  // Helper to handle authentication and redirection
  const handleAuthError = () => {
    console.error("Authentication failed. Token invalid.");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/signin");
  };

  // 1. Fetch Vehicle Data
  useEffect(() => {
    const fetchVehicles = async () => {
      setVehicleLoading(true);
      if (!userToken) {
        console.error("User not authenticated.");
        setVehicleLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/vehicles`, {
          headers: {
            "Authorization": `Bearer ${userToken}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          handleAuthError();
          return;
        }

        const data = await res.json();
        const fetchedVehicles = Array.isArray(data) ? data : Array.isArray(data.vehicles) ? data.vehicles : [];
        setVehicles(fetchedVehicles);
        
        if (fetchedVehicles.length === 1) {
          setFormData((prev) => ({ ...prev, vehicle: fetchedVehicles[0] }));
        }
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setVehicles([]);
      } finally {
        setVehicleLoading(false);
      }
    };
    fetchVehicles();
  }, [userToken, navigate]);

  // 2. Fetch Service Type Data (FIXED: Robust handling of userToken and errors)
  useEffect(() => {
    const fetchServiceTypes = async () => {
      setServiceLoading(true);
      
      // Check for userToken immediately at the start of the fetch function
      if (!userToken) {
          setServiceLoading(false);
          return; 
      }
      
      try {
        const res = await fetch(`${API_BASE_URL}/service-type`, {
            headers: {
                "Authorization": `Bearer ${userToken}`,
            },
        }); 
        
        if (res.status === 401 || res.status === 403) {
            handleAuthError();
            return;
        }

        if (!res.ok) {
          // Throws error for HTTP 500 or other non-OK status codes
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        // The data is expected to contain {id, name, price, type, ...}
        setServiceTypes(data);
      } catch (err) {
        console.error("Error fetching service types:", err);
      } finally {
        setServiceLoading(false);
      }
    };
    
    // Always call the async function inside useEffect.
    fetchServiceTypes(); 
    
  }, [userToken, navigate]); 

  // --- Handlers ---
  const handleNext = () => setStep((prevActiveStep) => prevActiveStep + 1);
  const handleBack = () => setStep((prevActiveStep) => prevActiveStep - 1);

  const handleBooking = async () => {
    if (!userToken) {
      alert("Authentication failed. Please sign in again.");
      navigate("/signin");
      return;
    }
    
    setLoading(true);
    
    const bookingPayload = {
        customer_name: "Customer Name Mock", // Placeholder - should be fetched from token context
        customer_email: formData.userEmail,
        booking_date: `${formData.date.toISOString().split('T')[0]} ${formData.timeSlot}:00`, 
        status: "Pending",
        service_id: formData.service.id, 
        vehicle_id: formData.vehicle.id, 
        notes: formData.notes,
    };
    
    console.log("Submitting Booking Payload:", bookingPayload);

    try {
        const res = await fetch(`${API_BASE_URL}/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`,
            },
            body: JSON.stringify(bookingPayload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || `Failed to create booking: ${res.statusText}`);
        }
        alert("Service Appointment Booked Successfully!");
        navigate("/dashboard");
    } catch (error) {
        console.error("Booking submission error:", error);
        alert(`Error booking appointment: ${error.message}. Please try again.`);
    }
    
    setLoading(false);
  };

  // Helper to format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // --- Step Content Renderer ---
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Step 1: Select Vehicle
        if (vehicleLoading) {
            return <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress sx={{ color: '#00bcd4' }} /></Box>;
        }

        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: "#00bcd4" }}>
              Select **Vehicle**
            </Typography>
            {!userToken ? (
                <Typography color="error">**Error:** You are not logged in. Please sign in to view your vehicles.</Typography>
            ) : vehicles.length === 0 ? (
                <Box>
                   <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>No vehicles found associated with your account.</Typography>
                   <Button variant="outlined" sx={{ color: "#00bcd4", borderColor: "#00bcd4" }} onClick={() => navigate("/addVehicle")}>
                       Add New Vehicle
                   </Button>
                </Box>
            ) : (
                <Grid container spacing={3}>
                {vehicles.map((vehicle) => (
                    <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
                      <Paper
                        onClick={() => setFormData({ ...formData, vehicle })}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          background: formData.vehicle?.id === vehicle.id 
                            ? "rgba(0,188,212,0.2)"
                            : "rgba(255,255,255,0.05)",
                          border: `2px solid ${formData.vehicle?.id === vehicle.id ? "#00bcd4" : "rgba(255,255,255,0.1)"}`,
                          cursor: "pointer",
                          "&:hover": { background: "rgba(255,255,255,0.1)" },
                        }}
                      >
                        <CarRental sx={{ float: 'right', color: '#00bcd4' }} />
                        <Typography variant="h6" fontWeight="bold">{vehicle.brand} {vehicle.model}</Typography>
                        <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>License: **{vehicle.licensePlate}**</Typography>
                        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>VIN: {vehicle.vin}</Typography>
                      </Paper>
                    </Grid>
                ))}
                </Grid>
            )}
          </Box>
        );

      case 1: // Step 2: Choose Service (Uses DB fields: name, price, type)
        return (
          <FormControl component="fieldset" fullWidth>
            <Typography variant="h6" gutterBottom sx={{ color: "#00bcd4" }}>
              Choose **Service** Type
            </Typography>
            {serviceLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress sx={{ color: '#00bcd4' }} /></Box>
            ) : !userToken ? (
                <Typography color="error">**Error:** Not authenticated. Cannot load services.</Typography>
            ) : serviceTypes.length === 0 ? (
              <Typography color="error">**Error:** No services available. Please contact support.</Typography>
            ) : (
              <RadioGroup
                value={formData.service ? formData.service.id : ""}
                onChange={(e) => {
                  const selectedService = serviceTypes && serviceTypes.find(s => String(s.id) === e.target.value); 
                  setFormData({ ...formData, service: selectedService });
                }}
              >
                <Grid container spacing={3}>
                  {serviceTypes.map((service) => (
                    <Grid item xs={12} sm={6} md={4} key={service.id}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          background: formData.service?.id === service.id ? "rgba(0,188,212,0.2)" : "rgba(255,255,255,0.05)",
                          border: `2px solid ${formData.service?.id === service.id ? "#00bcd4" : "rgba(255,255,255,0.1)"}`,
                          "&:hover": { background: "rgba(255,255,255,0.1)", cursor: "pointer" },
                        }}
                        onClick={() => setFormData({ ...formData, service })} 
                      >
                          <Box sx={{ float: 'right', color: '#00bcd4' }}>
                              {getIconComponent(service.type)}
                          </Box>
                          <FormControlLabel
                            value={String(service.id)}
                            control={<Radio sx={{ color: '#00bcd4' }} />}
                            label={
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {service.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                                  Est. Cost: **${service.price}**
                                </Typography>
                              </Box>
                            }
                            labelPlacement="start"
                            sx={{ justifyContent: 'space-between', width: '100%', m: 0 }}
                          />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>
            )}
          </FormControl>
        );

      case 2: // Step 3: Pick Date & Time
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: "#00bcd4" }}>
                Select **Date and Time**
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <CalendarMock 
                    selectedDate={formData.date}
                    onDateSelect={(date) => setFormData({ ...formData, date })}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "#00bcd4" }}>
                    Time Slot
                </Typography>
                <Grid container spacing={1}>
                    {mockTimeSlots.map((time) => (
                        <Grid item key={time}>
                            <Chip
                                label={time}
                                onClick={() => setFormData({ ...formData, timeSlot: time })}
                                icon={<EventAvailable />}
                                sx={{
                                    bgcolor: formData.timeSlot === time ? "#00bcd4" : "rgba(255,255,255,0.1)",
                                    color: formData.timeSlot === time ? "#000" : "white",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    "&:hover": { opacity: 0.8 },
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
                {/* MUI TextField Dark Mode Styling Enhanced */}
                <TextField
                  label="Additional Notes (Optional)"
                  multiline
                  rows={4}
                  fullWidth
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  variant="outlined"
                  sx={{ 
                    mt: 4, 
                    '& .MuiOutlinedInput-root': { 
                        color: 'white', 
                        '&.Mui-focused fieldset': { borderColor: '#00bcd4' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    }, 
                    '& .MuiInputLabel-root': { color: '#00bcd4' }, 
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } 
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3: // Step 4: Review & Confirm
        return (
          <Paper sx={{ p: 4, background: "rgba(255,255,255,0.05)", border: "1px solid #00bcd4" }}>
            <Box mb={3}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: "#00bcd4", mb: 1 }}>
                    Review Appointment
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Please verify the details below before confirming.
                </Typography>
            </Box>
            
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Vehicle:</Typography>
                    <Typography>{formData.vehicle?.brand} {formData.vehicle?.model} (**{formData.vehicle?.licensePlate}**)</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Service:</Typography>
                    <Typography>{formData.service?.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Date:</Typography>
                    <Typography>**{formatDate(formData.date)}**</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" fontWeight="bold">Time:</Typography>
                    <Typography>**{formData.timeSlot}**</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold">Additional Notes:</Typography>
                    <Typography sx={{ fontStyle: 'italic', color: "rgba(255,255,255,0.7)" }}>
                        {formData.notes || "None"}
                    </Typography>
                </Grid>
            </Grid>
            
            <Box mt={4} textAlign="right">
                <Typography variant="h5" fontWeight="bold">
                    Total Estimated Cost: <span style={{ color: '#00bcd4' }}>${formData.service?.price || 0}</span>
                </Typography>
            </Box>
          </Paper>
        );

      default:
        return "Unknown step";
    }
  };

  // --- Step Validation Logic ---
  const isStepValid = () => {
    if (step === 0 && (!userToken || vehicleLoading)) return false; 
    
    switch (step) {
      case 0: // Vehicle must be selected
        return !!formData.vehicle;
      case 1: // Service must be selected
        return !!formData.service;
      case 2: // Date and time must be selected
        return !!formData.date && !!formData.timeSlot;
      case 3: 
        return !!formData.vehicle && !!formData.service && !!formData.date && !!formData.timeSlot;
      default:
        return false;
    }
  };


  // --- Render Component ---
  return (
    <Box sx={{ p: 4, background: "linear-gradient(180deg, #000 0%, #111 100%)", color: "white", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Book Service Appointment 🚗
      </Typography>
      <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>
        A simple 4-step process to secure your next service.
      </Typography>

      {/* Stepper Header */}
      <Stepper activeStep={step} sx={{ mb: 4, '& .MuiStepLabel-label': { color: 'white' }, '& .MuiStepIcon-root.Mui-active': { color: '#00bcd4' }, '& .MuiStepIcon-root.Mui-completed': { color: '#00bcd4' } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Paper sx={{ p: 4, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
        {getStepContent(step)}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", flexDirection: "row", pt: 2, justifyContent: "space-between" }}>
        <Button
          color="inherit"
          disabled={step === 0 || loading}
          onClick={handleBack}
          sx={{ color: "white", mr: 1 }}
          startIcon={<ChevronLeft />}
        >
          Back
        </Button>
        <Box /> {/* Spacer for justification */}
        {step === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleBooking}
            disabled={loading || !isStepValid()}
            sx={{ backgroundColor: "#00bcd4", "&:hover": { backgroundColor: "#00acc1" }, color: 'black', fontWeight: 'bold' }}
            endIcon={<CheckCircle />}
          >
            {loading ? <CircularProgress size={24} sx={{ color: 'black' }} /> : "Confirm Booking"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            sx={{ backgroundColor: "#00bcd4", "&:hover": { backgroundColor: "#00acc1" }, color: 'black', fontWeight: 'bold' }}
            endIcon={<ChevronRight />}
          >
            Continue
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BookService;