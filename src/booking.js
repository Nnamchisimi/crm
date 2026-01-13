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
    Drawer, // Imported from MUI
    RadioGroup,
    FormControlLabel,
    FormControl,
    Grid,
    TextField,
    Chip,
    CircularProgress,
    List, // Added List/ListItem/Divider for the drawer/sidebar
    ListItem,
    ListItemText,
    Divider,
    IconButton,
} from "@mui/material";
import { 
    ChevronLeft, 
    ChevronRight, 
    EventAvailable, 
    CheckCircle, 
    CarRental, 
    LocationOn,
    Build, 
    Tune, 
    FlashOn, 
    TireRepair, 
    LocalGasStation,
 
    Menu as MenuIcon,
    Campaign as CampaignIcon,
    Notifications as NotificationsIcon,
    Home as HomeIcon,
    Dashboard as DashboardIcon,
    ExitToApp as ExitToAppIcon,
    Email as EmailIcon,
    CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = "http://localhost:3007/api";


const defaultAppointmentDate = null;

const steps = [
    "Select Vehicle",
    "Choose Branch",
    "Choose Service",
    "Pick Date & Time",
    "Review & Confirm",
];

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

const CalendarMock = ({ selectedDate, onDateSelect, mobileOpen, setMobileOpen, drawer, navigate }) => {
    
    const dates = [];
    const today = new Date(); 

    for (let i = 1; dates.length < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i); 

        if (d.getDay() !== 0) { 
            dates.push(d);
        }
    }

    
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/signin", { replace: true });
    return;
  }

  const { role } = jwtDecode(token);
  if (role !== "user") {
    navigate("/signin", { replace: true });
  }
}, [navigate]);

 
    
    return (
        <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Select Date (Next 7 working days, excluding Sunday)
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


const BookService = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState([]); 
    const [vehicleLoading, setVehicleLoading] = useState(true); 
    const [serviceTypes, setServiceTypes] = useState([]);
    const [serviceLoading, setServiceLoading] = useState(true); 
    const [branchLoading,  setBranchLoading]=useState(true);
    const[branch,setBranch]= useState([]);
    const [mobileOpen, setMobileOpen] = useState(false); 
    
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState(null);

    const userToken = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail"); 

    const [formData, setFormData] = useState({
        vehicle: null,
        service: null,
        date: defaultAppointmentDate, 
        timeSlot: null,
        
        userEmail: userEmail,
    });

    const isDateSelected = !!formData.date; 

    const handleAuthError = () => {
        console.error("Authentication failed. Token invalid.");
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        navigate("/signin");
    };
      const handleSignOut=()=>{
        localStorage.getItem("token")
        localStorage.getItem(userEmail)
        sessionStorage.clear();
        navigate("/signin",{replace:true})
        
    }
    
    const sidebarItems = [
       
        { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
        { text: "Campaigns", icon: <CampaignIcon />, path: "/campaigns" },
        { text: "Newsletter", icon: <EmailIcon />, path: "/newsletter" },
        { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
        { text: "Booking", icon: <CalendarMonthIcon />, path: "/booking" },
        { text: "Sign Out", icon: <ExitToAppIcon />,  onClick:handleSignOut },
    ];
    
    const drawerContent = (
        <Box sx={{ width: 250, p: 3, background: "rgba(0,0,0,0.9)", minHeight: '100%' }}>
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
                            sx={{ color: item.path === '/bookings' ? '#00bcd4' : '#ccc',  "&:hover": { color: "#00bcd4" }  }}
                            onClick={() => {
                              if (item.onClick) {
                              
                                item.onClick();
                              } else if (item.path) {
                               
                                navigate(item.path);
                              }
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

     useEffect(() => {
        const fetchbranch = async () => {
            setBranchLoading(true);
            
            if (!userToken) {
                setBranchLoading(false);
                return; 
            }
            
            try {
                const res = await fetch(`${API_BASE_URL}/branch`, {
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
                setBranch(data);
            } catch (err) {
                console.error("Error fetching service types:", err);
            } finally {
                setBranchLoading(false);
            }
        };
        
        fetchbranch(); 
        
    }, [userToken, navigate]); 

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
    
    useEffect(() => {
        const fetchTimeSlots = async () => {
            if (!formData.date || !userToken) {
                setAvailableTimeSlots([]);
                if (!formData.date && formData.timeSlot) {
                    setFormData(prev => ({ ...prev, timeSlot: null }));
                }
                return;
            }

            setFormData(prev => ({ ...prev, timeSlot: null }));

            setLoadingSlots(true);
            setSlotsError(null);

            try {
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
                
                const firstAvailableSlot = slots.find(s => s.is_available);
                const newTimeSlot = firstAvailableSlot ? firstAvailableSlot.slot_time : null;
                
                setFormData(prev => ({ ...prev, timeSlot: newTimeSlot }));


            } catch (error) {
                console.error("Error fetching time slots:", error);
                setSlotsError("Could not load available slots for this date.");
                setAvailableTimeSlots([]);
                setFormData(prev => ({ ...prev, timeSlot: null }));
            } finally {
                setLoadingSlots(false);
            }
        };

        const handler = setTimeout(fetchTimeSlots, 100); 
        return () => clearTimeout(handler);
        
    }, [formData.date, userToken, navigate]); 

    const handleNext = () => setStep((prevActiveStep) => prevActiveStep + 1);
    const handleBack = () => setStep((prevActiveStep) => prevActiveStep - 1);

    const handleBooking = async () => {
    if (!userToken) {
        alert("Authentication failed. Please sign in again.");
        navigate("/signin");
        return;
    }

    setLoading(true);

    if (!formData.date || !formData.timeSlot || !formData.service || !formData.branch|| !formData.vehicle) {
        alert("Please complete all required fields before confirming.");
        setLoading(false);
        return;
    }

    const appointmentDate = formData.date.toISOString().split('T')[0];
    const appointmentTime = formData.timeSlot.substring(0, 5);          

    const bookingPayload = {
        vehicleId: formData.vehicle.id,
        serviceTypeId: formData.service.id,
        branchId: formData.branch.id,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime
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


    const formatDate = (date) => {
        if (!date) return "N/A";
        return date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    const isStepValid = () => {
        if (step === 0 && (vehicleLoading || !userToken)) return false;
          if(step ===1 &&(branchLoading || !userToken)) return false; 
        if (step === 2 && (serviceLoading || !userToken)) return false;  
        if (step === 3 && loadingSlots) return false;
        
        switch (step) {
            case 0:
                return !!formData.vehicle;
                
                case 1:
                return !!formData.branch;
                
            case 2: 
                return !!formData.service;
                
            case 3:
                const selectedSlot = availableTimeSlots.find(s => s.slot_time === formData.timeSlot);
                return isDateSelected && !!formData.timeSlot && !!selectedSlot && selectedSlot.is_available;
                
            case 4:
                const isStep2Valid = (() => {
                    const slot = availableTimeSlots.find(s => s.slot_time === formData.timeSlot);
                    return isDateSelected && !!formData.timeSlot && !!slot && slot.is_available;
                })();
                
                return !!formData.vehicle && !!formData.service &&!!formData.branch && isStep2Valid;
                
            default:
                return false;
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
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
                                    <Grid item xs={6} sm={6} md={4} key={vehicle.id}>
                                        <Paper
                                            onClick={() => setFormData({ ...formData, vehicle })}
                                            sx={{
                                                p: 1,
                                                 width: 300,
                                                 height: 170,
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
                                            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>License: {vehicle.license_plate}</Typography>
                                            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>VIN: {vehicle.vin}</Typography>
                                            <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>CRM Number: {vehicle.crm_number || "---"}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                );

            case 1:
                    return (
                        <FormControl component="fieldset" fullwidth>
                            <Typography variant="h6" gutterBottom SX={{COLOR: "#00bcd4"}}>
                                Choose a Branch
                            </Typography>
                            {branchLoading ?(
                                <Box sx ={{display: 'flex', justifyContent: 'center'}}><CircularProgress sx= {{color: '#00bcd4'}}/></Box> 
                            ): !userToken ? (
                                <Typography color ="error"> Error: Not Authenticated . Cannot Load branches.</Typography>

                            ): branch.length=== 0 ? (
                                <Typography color = "error"> Error: No Branches available at the moment . Please contact Support</Typography>

                            ): (
                                <RadioGroup
                                value ={formData.branch? formData.branch.id:""}
                                onChange={(e)=> {
                                    const selectedBranch= branch && branch.find(br=> String(br.id) === e.target.value);
                                    setFormData({...formData, branch: selectedBranch});
                                }}>

                            <Grid container spacing={3}>
                                    {branch.map((branch) => (
                                        <Grid item xs={6} sm={6} md={4} key={branch.id}>
                                            <Paper
                                                sx={{
                                                    p: 0.5,
                                                    borderRadius: 3,
                                                     width: 150,
                                                      height: 150,
                                                    background: formData.branch?.id === branch.id ? "rgba(0,188,212,0.2)" : "rgba(255,255,255,0.05)",
                                                    border: `2px solid ${formData.branch?.id === branch.id ? "#00bcd4" : "rgba(255,255,255,0.1)"}`,
                                                    "&:hover": { background: "rgba(255,255,255,0.1)", cursor: "pointer" },
                                                }}
                                                onClick={() => setFormData({ ...formData, branch })} 
                                            >
                                                <Box sx={{ float: 'right', color: '#00bcd4' }}>
                                                    {getIconComponent(branch.type)}
                                                </Box>
                                                <FormControlLabel
                                                    value={String(branch.id)}
                                                    control={<Radio sx={{ color: '#00bcd4' }} />}
                                                    label={
                                                        <Box>
                                                            <Typography variant="subtitle1" fontWeight="bold">
                                                                {branch.name}
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
           case 2: 
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
                              <Grid container spacing={2}>
                                        {serviceTypes.map((service) => (
                                            <Grid 
                                                item 
                                                xs={6}   
                                                sm={6}     
                                                md={4}     
                                                key={service.id}
                                            >
                                                <Paper
                                                    sx={{
                                                        p: 0.5,
                                                        borderRadius: 3,
                                                        height: 150,                  
                                                        width :150,
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        justifyContent: "flex-start",
                                                        background: formData.service?.id === service.id 
                                                            ? "rgba(0,188,212,0.2)" 
                                                            : "rgba(255,255,255,0.05)",
                                                        border: `2px solid ${
                                                            formData.service?.id === service.id 
                                                                ? "#00bcd4" 
                                                                : "rgba(255,255,255,0.1)"
                                                        }`,
                                                        transition: "0.2s",
                                                        "&:hover": {
                                                            background: "rgba(255,255,255,0.1)", 
                                                            cursor: "pointer"
                                                        }
                                                    }}
                                                    onClick={() => setFormData({ ...formData, service })}
                                                >
                                                    <Box 
                                                        sx={{ 
                                                            alignSelf: "flex-end", 
                                                            fontSize: "2rem", 
                                                            color: "#00bcd4" 
                                                        }}
                                                    >
                                                        {getIconComponent(service.type)}
                                                    </Box>

                                                    <Box sx={{ overflowY: "auto", flexGrow: 1 }}>
                                                        <FormControlLabel
                                                            value={String(service.id)}
                                                            control={<Radio sx={{ color: '#00bcd4' }} />}
                                                            label={
                                                                <Box>
                                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                                        {service.label}
                                                                    </Typography>
                                                                    <Typography 
                                                                        variant="body2" 
                                                                        sx={{ color: "rgba(255,255,255,0.7)" }}
                                                                    >
                                                                        Cost: ${service.cost}
                                                                    </Typography>
                                                                    {service.description && (
                                                                        <Typography 
                                                                            variant="body2" 
                                                                            sx={{ mt: 1, opacity: 0.7 }}
                                                                        >
                                                                            {service.description}
                                                                        </Typography>
                                                                    )}
                                                                </Box>
                                                            }
                                                            labelPlacement="start"
                                                            sx={{ 
                                                                width: "100%", 
                                                                m: 0, 
                                                            }}
                                                        />
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>


                            </RadioGroup>
                        )}
                    </FormControl>
                );

           
            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: "#00bcd4" }}>
                            Select Date and Time
                        </Typography>
                        <Grid container spacing={4}>
                            <Grid item xs={12} md={7}>
                                <CalendarMock 
                                    selectedDate={formData.date}
                                    onDateSelect={(date) => setFormData({ ...formData, date, timeSlot: null })} 
                                    mobileOpen={mobileOpen}
                                    setMobileOpen={setMobileOpen}
                                    drawer={drawerContent}
                                    navigate={navigate}
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
                                    <Grid container spacing={1}>
                                        {availableTimeSlots.map((slot) => (
                                            <Grid item key={slot.slot_time}>
                                                <Chip
                                                    label={slot.slot_time} 
                                                    onClick={slot.is_available ? () => setFormData({ ...formData, timeSlot: slot.slot_time }) : undefined}
                                                    icon={<EventAvailable />}
                                                    disabled={!slot.is_available} 
                                                    sx={{
                                                        bgcolor: formData.timeSlot === slot.slot_time && slot.is_available ? "#00bcd4" : "rgba(255,255,255,0.1)",
                                                        color: formData.timeSlot === slot.slot_time && slot.is_available ? "#000" : (slot.is_available ? "white" : "rgba(255,255,255,0.5)"),
                                                        fontWeight: "bold",
                                                        cursor: slot.is_available ? "pointer" : "not-allowed",
                                                        "&:hover": { 
                                                            opacity: 0.8,
                                                            bgcolor: formData.timeSlot === slot.slot_time && slot.is_available ? "#00bcd4" : (slot.is_available ? "rgba(255,255,255,0.2)" : 'rgba(255,0,0,0.2)')
                                                        },
                                                        ...(!slot.is_available && 
                                                            { 
                                                                bgcolor: 'rgba(255,0,0,0.2)',
                                                                color: 'rgba(255,255,255,0.5)', 
                                                                textDecoration: 'line-through', 
                                                            }
                                                        )
                                                    }}
                                                />
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
                                
                                
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom sx={{ color: "#00bcd4" }}>
                            Review Your Appointment
                        </Typography>
                        <Paper sx={{ p: 3, background: "rgba(255,255,255,0.05)", borderRadius: 3, mb: 3 }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: "white" }}>
                                Appointment Summary
                            </Typography>
                            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={4}>
                                    <CarRental sx={{ mr: 1, verticalAlign: 'middle', color: '#00bcd4' }} />
                                    <Typography component="span" fontWeight="bold">Vehicle:</Typography>
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <Typography>{formData.vehicle ? `${formData.vehicle.brand} ${formData.vehicle.model} (${formData.vehicle.license_plate})` : "Not Selected"}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={4}>
                                   <LocationOn sx={{ mr: 1, verticalAlign: 'middle', color: '#00bcd4' }} />
                                    <Typography component="span" fontWeight="bold">Branch:</Typography>
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <Typography>{formData.branch ? `${formData.branch.name} ` : "Not Selected"}</Typography>
                                </Grid>
                            </Grid>
                            
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={4}>
                                    {getIconComponent(formData.service?.type)}
                                    <Typography component="span" fontWeight="bold">Service:</Typography>
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <Typography>{formData.service ? `${formData.service.label} ($${formData.service.cost})` : "Not Selected"}</Typography>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <EventAvailable sx={{ mr: 1, verticalAlign: 'middle', color: '#00bcd4' }} />
                                    <Typography component="span" fontWeight="bold">Date & Time:</Typography>
                                </Grid>
                                <Grid item xs={12} sm={8}>
                                    <Typography>{formData.date ? formatDate(formData.date) : "N/A"} at **{formData.timeSlot || "N/A"}**</Typography>
                                </Grid>
                            </Grid>
                            
                        </Paper>

                        {isStepValid() ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', color: '#00bcd4' }}>
                                <CheckCircle sx={{ mr: 1 }} />
                                <Typography fontWeight="bold">All required fields are complete. Click "Confirm Booking" to finalize.</Typography>
                            </Box>
                        ) : (
                            <Typography color="error" fontWeight="bold">Please go back and ensure all selections (Vehicle, Service, Date, Time) are valid before confirming.</Typography>
                        )}
                        
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#121212', color: 'white' }}>

        <Box sx={{ width: 250, display: { xs: 'none', md: 'block' } }}>
            {drawerContent}
        </Box>

        <Box sx={{ flexGrow: 1, p: 3 }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                
                   <Box sx={{ position: "fixed", top: 10, right: 10, display: { xs: "block", md: "none" }, zIndex: 1200 }}>
                        <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)}>
                          <MenuIcon />
                        </IconButton>
                      </Box>

                <Typography variant="h4" fontWeight="bold" sx={{
                    background: "linear-gradient(90deg, #fff, #00bcd4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    flexGrow: 1
                }}>
                    Book Your Service Appointment
                </Typography>

                {userEmail && (
                    <Chip 
                        label={userEmail} 
                        variant="outlined" 
                        sx={{ color: '#00bcd4', borderColor: '#00bcd4', display: { xs: 'none', sm: 'flex' } }} 
                    />
                )}
            </Box>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                anchor= "right"
                onClose={() => setMobileOpen(false)}
                ModalProps={{ keepMounted: true }}
            >
                {drawerContent}
            </Drawer>

            <Paper 
                elevation={6} 
                sx={{ 
                    p: 4, 
                    borderRadius: 4, 
                    background: "rgba(255,255,255,0.05)",
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <Stepper activeStep={step} alternativeLabel sx={{ mb: 4, 
                    '.MuiStepLabel-label': { color: 'white' },
                    '.Mui-active .MuiStepLabel-label': { color: '#00bcd4', fontWeight: 'bold' },
                    '.Mui-completed .MuiStepLabel-label': { color: '#00bcd4' },
                    '.MuiStepIcon-root': { color: 'rgba(255,255,255,0.3)' },
                    '.Mui-active .MuiStepIcon-root': { color: '#00bcd4' },
                    '.Mui-completed .MuiStepIcon-root': { color: '#00bcd4' },
                }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box>
                    {getStepContent(step)}
                </Box>

                <Box sx={{ display: "flex", flexDirection: "row", pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', mt: 3 }}>
                    <Button
                        color="inherit"
                        disabled={step === 0 || loading}
                        onClick={handleBack}
                        sx={{ mr: 1, color: "white", "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}
                        startIcon={<ChevronLeft />}
                    >
                        Back
                    </Button>
                    <Box sx={{ flex: "1 1 auto" }} />
                    <Button
                        onClick={step === steps.length - 1 ? handleBooking : handleNext}
                        disabled={!isStepValid() || loading}
                        variant="contained"
                        sx={{ 
                            bgcolor: "#00bcd4", 
                            color: "#000", 
                            fontWeight: "bold",
                            "&:hover": { bgcolor: "#00a0b2" }
                        }}
                        endIcon={step === steps.length - 1 ? (loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />) : <ChevronRight />}
                    >
                        {step === steps.length - 1 ? (loading ? "Booking..." : "Confirm Booking") : "Next"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    </Box>
);
};

export default BookService;