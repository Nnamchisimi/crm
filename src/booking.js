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

// Initialize default date to null, forcing the user to select one, 
// which addresses the requirement to hide time slots initially.
const defaultAppointmentDate = null; 

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

// --- Custom Calendar Mock Component (Updated for 7-day range, excluding Sunday) ---
const CalendarMock = ({ selectedDate, onDateSelect }) => {
    const dates = [];
    const today = new Date(); // Get today's date

    // Loop through the next 8 days (i=1 to 8) to find 7 valid appointment days
    for (let i = 1; dates.length < 7; i++) {
        const d = new Date(today); // Clone today's date
        d.setDate(today.getDate() + i); // Set the date to i days from today

        // 0 is Sunday, 6 is Saturday. We exclude 0 (Sunday).
        if (d.getDay() !== 0) { 
            dates.push(d);
        }
    }

    return (
        <Box sx={{ p: 2, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Select Date (Next 7 working days)
            </Typography>
            <Grid container spacing={1} justifyContent="center">
                {dates.map((date, index) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();

                    return (
                        <Grid item key={index}>
                            <Paper
                                onClick={() => onDateSelect(date)} 
                                sx={{
                                    p: 1,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    borderRadius: 2,
                                    minWidth: 50,
                                    background: isSelected 
                                        ? "#00bcd4" 
                                        : "rgba(255,255,255,0.1)",
                                    color: isSelected ? "#000" : "white",
                                    "&:hover": { 
                                        background: isSelected ? "#00bcd4" : "rgba(255,255,255,0.2)" 
                                    },
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
                    );
                })}
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
    
    // State for Time Slots
    // availableTimeSlots now holds an array of objects: [{ slot_time, is_available, remaining_quota }, ...]
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState(null);

    // Access Local Storage for User Info and Token
    const userToken = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail"); 

    // Form Data State
    const [formData, setFormData] = useState({
        vehicle: null,
        service: null, // Holds {id, name, cost, type, ...}
        date: defaultAppointmentDate, // Initialized to null
        timeSlot: null, // This now holds the TIME STRING, e.g., "09:00"
        notes: "",
        userEmail: userEmail,
    });

    // Determine if a date has been selected (used to hide time slots initially)
    const isDateSelected = !!formData.date; 

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

    // 2. Fetch Service Type Data
    useEffect(() => {
        const fetchServiceTypes = async () => {
            setServiceLoading(true);
            
            if (!userToken) {
                setServiceLoading(false);
                return; 
            }
            
            try {
                const res = await fetch(`${API_BASE_URL}/servicetype`, {
                    headers: {
                        "Authorization": `Bearer ${userToken}`,
                    },
                }); 
                
                if (res.status === 401 || res.status === 403) {
                    handleAuthError();
                    return;
                }

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                setServiceTypes(data);
            } catch (err) {
                console.error("Error fetching service types:", err);
            } finally {
                setServiceLoading(false);
            }
        };
        
        fetchServiceTypes(); 
        
    }, [userToken, navigate]); 
    
    // 3. Fetch Available Time Slots based on selected date
    useEffect(() => {
        const fetchTimeSlots = async () => {
            // Only fetch if a date is selected AND user is authenticated
            if (!formData.date || !userToken) {
                setAvailableTimeSlots([]);
                // Reset timeSlot if the date is cleared
                if (!formData.date && formData.timeSlot) {
                     setFormData(prev => ({ ...prev, timeSlot: null }));
                }
                return;
            }

            // Also reset timeSlot whenever a new date selection triggers a fetch
            setFormData(prev => ({ ...prev, timeSlot: null }));

            setLoadingSlots(true);
            setSlotsError(null);

            try {
                // Format the Date object to 'YYYY-MM-DD' string for the URL
                const dateString = formData.date.toISOString().split('T')[0]; 

                const response = await fetch(`${API_BASE_URL}/timeslots?date=${dateString}`, {
                    headers: {
                        'Authorization': `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.status === 401 || response.status === 403) {
                    handleAuthError();
                    return;
                }
                
                if (!response.ok) {
                    throw new Error('Failed to fetch available time slots.');
                }

                const slots = await response.json();
                
                setAvailableTimeSlots(slots);
                
                // Auto-select the first AVAILABLE slot
                const firstAvailableSlot = slots.find(s => s.is_available);
                const newTimeSlot = firstAvailableSlot ? firstAvailableSlot.slot_time : null;
                
                // Set the state
                setFormData(prev => ({ ...prev, timeSlot: newTimeSlot }));


            } catch (error) {
                console.error("Error fetching time slots:", error);
                setSlotsError("Could not load available slots for this date.");
                setAvailableTimeSlots([]);
                setFormData(prev => ({ ...prev, timeSlot: null })); // Ensure time slot is cleared on error
            } finally {
                setLoadingSlots(false);
            }
        };

        // Delay the fetch slightly to debounce and ensure other states are set
        const handler = setTimeout(fetchTimeSlots, 100); 
        return () => clearTimeout(handler); // Cleanup on unmount/re-render
        
    }, [formData.date, userToken, navigate]); 

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
        
        // Ensure all data is present before submission
        if (!formData.date || !formData.timeSlot || !formData.service || !formData.vehicle) {
            alert("Please complete all required fields before confirming.");
            setLoading(false);
            return;
        }

        const bookingPayload = {
            customer_name: "Customer Name Mock", // Needs actual user name from context/state
            customer_email: formData.userEmail,
            // Format to 'YYYY-MM-DD HH:MM:SS' string as expected by backend
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
    
    // --- Step Validation Logic (FIXED) ---
    const isStepValid = () => {
        // Prevent progression if critical data is still loading
        if (step === 0 && (vehicleLoading || !userToken)) return false; 
        if (step === 1 && (serviceLoading || !userToken)) return false; 
        if (step === 2 && loadingSlots) return false;
        
        switch (step) {
            case 0: // Vehicle must be selected
                return !!formData.vehicle;
                
            case 1: // Service must be selected
                return !!formData.service;
                
            case 2: // Date and a valid time string must be selected
                const selectedSlot = availableTimeSlots.find(s => s.slot_time === formData.timeSlot);
                // Check if date is selected, timeSlot string is set, slot object exists, and is available
                return isDateSelected && !!formData.timeSlot && !!selectedSlot && selectedSlot.is_available;
                
            case 3: // Review step, ensure all parts are complete (Vehicle, Service, Date, Time)
                // Re-evaluate previous checks
                const isStep2Valid = (() => {
                    const slot = availableTimeSlots.find(s => s.slot_time === formData.timeSlot);
                    return isDateSelected && !!formData.timeSlot && !!slot && slot.is_available;
                })();
                
                // No recursion, just check all fields needed for the final step
                return !!formData.vehicle && !!formData.service && isStep2Valid;
                
            default:
                return false;
        }
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
                            Select a Vehicle
                        </Typography>
                        {!userToken ? (
                            <Typography color="error">Error: You are not logged in. Please sign in to view your vehicles.</Typography>
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
                                            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>License: {vehicle.licensePlate}</Typography>
                                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>VIN: {vehicle.vin}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );

            case 1: // Step 2: Choose Service
                return (
                    <FormControl component="fieldset" fullWidth>
                        <Typography variant="h6" gutterBottom sx={{ color: "#00bcd4" }}>
                            Choose Service Type
                        </Typography>
                        {serviceLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress sx={{ color: '#00bcd4' }} /></Box>
                        ) : !userToken ? (
                            <Typography color="error">Error: Not authenticated. Cannot load services.</Typography>
                        ) : serviceTypes.length === 0 ? (
                            <Typography color="error">Error: No services available. Please contact support.</Typography>
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
                                                                {service.label}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                                                                Cost: ${service.cost}
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
                            Select Date and Time
                        </Typography>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={7}>
                                <CalendarMock 
                                    selectedDate={formData.date}
                                    // On date select, reset timeSlot to trigger slot fetch and prevent old time selection
                                    onDateSelect={(date) => setFormData({ ...formData, date, timeSlot: null })} 
                                />
                            </Grid>
                            <Grid item xs={12} md={5}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "#00bcd4" }}>
                                    Time Slot
                                </Typography>
                                
                                {!isDateSelected ? (
                                    <Box sx={{ p: 2, border: "1px dashed rgba(255,255,255,0.3)", borderRadius: 1, mt: 2 }}>
                                        <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                                            Please select a date on the calendar to see available time slots.
                                        </Typography>
                                    </Box>
                                ) : loadingSlots ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} sx={{ color: '#00bcd4' }} /></Box>
                                ) : slotsError ? (
                                    <Typography color="error" sx={{ my: 2 }}>{slotsError}</Typography>
                                ) : availableTimeSlots.length === 0 ? (
                                    <Typography sx={{ color: "rgba(255,255,255,0.7)", my: 2 }}>No available slots for the selected date.</Typography>
                                ) : (
                                    // MAPPING OVER DYNAMICALLY FETCHED SLOTS
                                    <Grid container spacing={1}>
                                        {availableTimeSlots.map((slot) => (
                                            <Grid item key={slot.slot_time}>
                                                <Chip
                                                    label={slot.slot_time} 
                                                    // The click handler updates the state with the TIME STRING
                                                    onClick={slot.is_available ? () => setFormData({ ...formData, timeSlot: slot.slot_time }) : undefined}
                                                    icon={<EventAvailable />}
                                                    // Disable if the slot is not available
                                                    disabled={!slot.is_available} 
                                                    sx={{
                                                        // Check against the stored TIME STRING (formData.timeSlot)
                                                        bgcolor: formData.timeSlot === slot.slot_time && slot.is_available ? "#00bcd4" : "rgba(255,255,255,0.1)",
                                                        color: formData.timeSlot === slot.slot_time && slot.is_available ? "#000" : (slot.is_available ? "white" : "rgba(255,255,255,0.5)"),
                                                        fontWeight: "bold",
                                                        cursor: slot.is_available ? "pointer" : "not-allowed",
                                                        "&:hover": { 
                                                            opacity: 0.8,
                                                            bgcolor: formData.timeSlot === slot.slot_time && slot.is_available ? "#00bcd4" : (slot.is_available ? "rgba(255,255,255,0.2)" : 'rgba(255,0,0,0.2)')
                                                        },
                                                        // Style for unavailable slots
                                                        ...(
                                                            !slot.is_available && 
                                                            { 
                                                                bgcolor: 'rgba(255,0,0,0.2)', // Red background for unavailable
                                                                color: 'rgba(255,255,255,0.5)', 
                                                                textDecoration: 'line-through', 
                                                            }
                                                        )
                                                    }}
                                                />
                                                {/* Optional: Show remaining quota if available */}
                                                {slot.is_available && slot.remaining_quota !== undefined && (
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ ml: 0.5, color: 'rgba(255,255,255,0.5)' }}
                                                    >
                                                        ({slot.remaining_quota} left)
                                                    </Typography>
                                                )}
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                                
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
                                <Typography>{formData.vehicle?.brand} {formData.vehicle?.model} ({formData.vehicle?.licensePlate})</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">Service:</Typography>
                                <Typography>{formData.service?.label}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">Date:</Typography>
                                <Typography>{formatDate(formData.date)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" fontWeight="bold">Time:</Typography>
                                <Typography>{formData.timeSlot}</Typography>
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
                                Total Estimated Cost: <span style={{ color: '#00bcd4' }}>${formData.service?.cost || 0}</span>
                            </Typography>
                        </Box>
                    </Paper>
                );

            default:
                return "Unknown step";
        }
    };

    // --- Render Component ---
    return (
        <Box sx={{ p: 4, background: "linear-gradient(180deg, #000 0%, #111 100%)", color: "white", minHeight: "100vh" }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Book Service Appointment 
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 4 }}>
                Follow the steps to select your vehicle, service, and appointment time.
            </Typography>

            {/* Stepper */}
            <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel 
                            StepIconComponent={({ active, completed }) => {
                                if (completed) return <CheckCircle sx={{ color: '#00bcd4' }} />;
                                if (active) return <CircularProgress size={24} sx={{ color: '#00bcd4' }} />;
                                return null;
                            }}
                        >
                            <Typography color="white">{label}</Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Paper sx={{ p: 4, background: "rgba(255,255,255,0.05)", borderRadius: 4 }}>
                {/* Step Content */}
                <Box>
                    {getStepContent(step)}
                </Box>
                
                {/* Step Navigation Buttons */}
                <Box sx={{ display: "flex", flexDirection: "row", pt: 2, justifyContent: 'space-between' }}>
                    <Button
                        color="inherit"
                        disabled={step === 0 || loading}
                        onClick={handleBack}
                        startIcon={<ChevronLeft />}
                        sx={{ color: '#00bcd4' }}
                    >
                        Back
                    </Button>
                    
                    <Box sx={{ flex: '1 1 auto' }} />

                    {step === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleBooking}
                            disabled={!isStepValid() || loading}
                            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                            sx={{ bgcolor: "#00bcd4", color: "#000", '&:hover': { bgcolor: "#00a9bb" } }}
                        >
                            {loading ? "Confirming..." : "Confirm Booking"}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!isStepValid() || loading}
                            endIcon={<ChevronRight />}
                            sx={{ bgcolor: "#00bcd4", color: "#000", '&:hover': { bgcolor: "#00a9bb" } }}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default BookService;