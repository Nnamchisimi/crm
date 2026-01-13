import React, { useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Button,
    MenuItem,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Drawer,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CampaignIcon from "@mui/icons-material/Campaign";
import EmailIcon from "@mui/icons-material/Email";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

import { BrandLogo, getBrandLogo, getBrandDisplayName } from './BrandLogo';


const carModels = {
    "Chrysler": ["300 C", "300 M", "Concorde", "Crossfire", "LHS", "Neon", "PT Cruiser", "Sebring", "Stratus"],
    "Audi": [
        "100", "80", "A1", "A2", "A3", "A3 Cabriolet", "A4", "A4 Allroad",
        "A4 Avant", "A4 Cabriolet", "A5", "A5 Avant", "A5 Cabriolet",
        "A6 Allroad", "A6 Avant", "A6 e-tron Avant", "A6 Saloon", "A6 Unspecified",
        "A7", "A8", "Allroad", "Cabriolet", "Coupe", "e-tron", "e-tron GT",
        "e-tron S", "Q2", "Q3", "Q4 e-tron", "Q5", "Q6 e-tron", "Q7", "Q8",
        "Q8 e-tron", "quattro", "R8", "RS3", "RS4", "RS4 Avant",
        "RS4 Cabriolet", "RS5", "RS6", "RS6 Avant", "RS7", "RS e-tron GT",
        "RS Q3", "RSQ8", "S1", "S3", "S4", "S4 Avant", "S4 Cabriolet",
        "S5", "S5 Avant", "S6 Avant", "S6 e-tron Avant", "S6 Saloon", "S7",
        "S8", "S e-tron GT", "SQ2", "SQ5", "SQ6 e-tron", "SQ7", "SQ8",
        "SQ8 e-tron", "TT", "TT RS", "TTS"],
    "Alfa Romeo": ["156 Sportwagon", "159", "159 Sportwagon", "164", "166", "2000", "4C", "Alfasud", "Brera", "Giulia", "Giulietta", "GT", "GTV", "Junior", "MiTo", "Spider", "Stelvio", "Tonale"],
    "BMW": ["1 Series", "2 Series", "2 Series Active Tourer", "2 Series Gran Coupe", "2 Series Gran Tourer", "3 Series", "3 Series Gran Turismo", "4 Series", "4 Series Gran Coupe", "5 Series", "5 Series Gran Turismo", "6 Series", "6 Series Gran Turismo", "7 Series", "7 Series Gran Turismo", "8 Series", "8 Series Gran Coupe", "Alpina B10", "Alpina B3", "Alpina B4 Gran Coupe", "Alpina B5", "Alpina B6", "Alpina B8 \"Gran Coupe\"", "Alpina D3", "Alpina D4", "Alpina D4 Gran Coupe", "Alpina D5", "Alpina Roadster", "Alpina Unspecified Models", "Alpina XD3",
        "i3", "i4", "i5", "i7", "i8", "Isetta", "iX", "iX1", "iX2", "iX3", "M2", "M3", "M4", "M5", "M6", "M6 Gran Coupe", "M8", "M8 Gran Coupe", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "Z3", "Z4", "Z4 M", "Z8"],
    "Chevrolet": [
        "Astro", "Aveo", "Belair", "C10", "Camaro", "Captiva", "Corvette",
        "Corvette Stingray", "Cruze", "Kalos", "Lacetti", "Matiz", "Orlando",
        "Silverado", "Spark", "SSR", "Suburban", "Tacuma", "Trax"],
    "Citroen": [
        "2 CV", "Ami", "AX", "Berlingo", "BX", "C1", "C2", "C3", "C3 Aircross",
        "C3 Picasso", "C3 Pluriel", "C4", "C4 Cactus", "C4 Picasso",
        "C4 SpaceTourer", "C4 X", "C5", "C5 Aircross", "C5 X", "C6", "C8",
        "C-Crosser", "C-Zero", "Dispatch", "DS3", "DS3 Cabrio", "DS4", "DS5",
        "e-Berlingo", "e-C3", "e-C3 Aircross", "e-C4", "e-C4 X",
        "e-SpaceTourer", "Grand C4 Picasso", "Grand C4 SpaceTourer", "Holidays",
        "Nemo Multispace", "Relay", "Saxo", "SpaceTourer", "Xantia", "Xsara",
        "Xsara Picasso"],
    "Maybach": ["57", "62"],
    "Acura": ["Integra", "RSX"],
    "Peugeot": ["1007", "106", "107", "108", "2008", "205", "206", "206 CC", "206 SW", "207", "207 CC", "207 SW", "208", "3008", "306", "307", "307 CC", "307 SW", "308", "308 CC", "308 SW", "309", "4007", "406", "407", "407 SW", "408",
        "5008", "508", "508 SW", "807", "Bipper Tepee", "Boxer", "E-2008", "E-208", "E-3008", "E-308", "E-308 SW",
        "E-5008", "e-Partner", "e-Rifter", "e-Traveller", "Expert", "Expert Tepee", "Horizon", "iOn", "Partner", "Partner Tepee", "RCZ", "Rifter", "Traveller"],
    "Renault": ["Laguna", "Master", "Megane", "Megane E-Tech", "Modus", "Rafale", "Scenic", "Scenic E-Tech", "Scenic RX4", "Scenic Xmod", "Spider", "Symbioz", "Trafic", "Twingo", "Twizy", "Wind", "Zoe"],
    "Subaru": ["BRZ", "Crosstrek", "Exiga", "Forester", "Impreza", "Justy", "Legacy", "Levorg", "Outback", "Solterra", "Tribeca", "WRX STI", "XT", "XV"],
    "Mazda": ["323", "626", "B2500", "Bongo", "BT-50", "CX-3", "CX-30", "CX-5", "CX-60", "CX-7", "CX-80", "Demio", "Eunos", "Mazda2", "Mazda2 HYBRID", "Mazda3", "Mazda5", "Mazda6", "MPV", "MX-30", "MX-5", "MX-5 RF", "MX-6", "RX-7", "RX-8"],
    "Lexus": ["CT", "ES", "GS", "GS F", "GX", "IS", "IS F", "LBX", "LC", "LFA", "LM", "LS", "LX", "NX", "RC", "RC F", "RX", "RX L", "RZ", "SC", "UX"],
    "Mercedes-Benz": ["AMG", "AMG GT", "AMG ONE", "A Class", "B Class", "C-Class", "CE Class", "CL", "CLC Class", "CLE", "CLK", "CLS", "CLA", "E-Class", "EQA", "EQB", "EQC", "EQE", "EQS", "EQV", "eVito", "G Class",
        "GLA", "GLB", "GLC", "GL Class", "GLE", "GLS", "Maybach GLS", "Maybach S Class", "M Class", "R Class",
        "S Class", "SEC Series", "SL", "SLC", "SLK", "SLR McLaren", "SLS", "Sprinter", "Traveliner", "Vaneo", "V Class", "Viano", "Vito", "X Class"],
    "Toyota": ["Alphard", "Aqua", "Aristo", "Auris", "Avensis", "Avensis Verso", "AYGO", "Aygo X", "BB", "Blade", "bZ4X", "Camry", "Carina E", "Celica", "Celsior", "Century", "C-HR", "Corolla",
        "Corolla Verso", "Crown", "Estima", "Estima Aeras G", "FJ Cruiser", "GR86", "Granvia", "GT86", "Harrier", "Hiace", "Highlander", "Hilux", "Ipsum", "iQ",
        "Land Cruiser", "Land Cruiser Amazon", "Land Cruiser Colorado",
        "Mark X", "MR2", "Noah", "Paseo", "Picnic", "Porte", "Previa", "Prius", "Prius+", "PROACE", "PROACE CITY Verso", "PROACE Verso", "Progres",
        "Raum", "RAV4", "Sienta", "Soarer", "Starlet", "Starlet Glanza V", "Starlet GT", "Supra", "Surf", "Tacoma", "Townace", "Tundra", "Urbancruiser", "Vellfire", "Verso", "Verso S", "Vitz", "Voxy", "Wish", "Yaris", "Yaris Cross", "Yaris Verso"],
    "Volkswagen": ["Amarok", "Arteon", "Beetle", "Bora", "Caddy", "Caddy California Maxi", "Caddy Life", "Caddy Maxi", "Caddy Maxi Life", "California", "Campervan", "Caravelle", "CC", "Corrado", "e-Golf", "Eos", "e-Transporter", "e-up!", "Fox", "Golf", "Golf Plus", "Golf SV", "Grand California",
        "ID.3", "ID.4", "ID.5", "ID.7", "ID. Buzz", "Jetta", "Karmann", "Lupo", "Multivan", "Passat", "Phaeton", "Polo", "Scirocco",
        "Sharan", "Taigo", "T-Cross", "Tiguan", "Tiguan Allspace", "Touareg", "Touran", "Transporter", "Transporter Shuttle", "Transporter Sportline", "T-Roc", "up!", "XL1"],
    "Kia": ["Carens", "Ceed", "Cerato", "EV3", "EV6", "EV9", "Magentis", "Niro", "Optima", "Picanto", "ProCeed", "Rio", "Sedona", "Sorento", "Soul", "Sportage", "Stinger", "Stonic", "Venga", "XCeed"],
    "Jaguar": ["E-PACE", "E-Type", "F-PACE", "F-Type", "I-PACE", "Mark I", "Mark II", "S-Type", "XE", "XF", "XFR-S", "XJ", "XJR", "XJR-S", "XJS", "XK", "XK120", "XK140", "XK150", "XK8", "XKR", "XKR-S", "X-Type"],
    "Infiniti": ["EX", "FX", "G", "M", "Q30", "Q50", "Q60", "Q70", "QX30", "QX56", "QX70"],
    "Hyundai": ["Accent", "Amica", "Atoz", "BAYON", "Coupe", "Genesis", "Getz", "i10", "i20", "i30", "i40", "i800", "iLoad", "IONIQ", "IONIQ 5", "IONIQ 6", "ix20", "ix35", "KONA", "Matrix", "NEXO", "Pony X2", "Santa Fe", "Sonata", "Terracan", "Trajet", "TUCSON", "Veloster"],
    "Honda": ["Accord", "Beat", "Civic", "Crossroad", "CR-V", "CR-X", "CR-Z", "e:Ny1", "Elysion", "Fit", "Freed", "FR-V", "Honda E", "HR-V", "Insight", "Integra", "Jazz", "Legend", "Mobilio", "N-Box", "NSX", "Odyssey", "Prelude", "Ridgeline", "S2000", "S660", "Shuttle", "Stepwagon", "Stream", "ZR-V"],
    "Fiat": ["124 Spider", "126", "500", "500C", "500e", "500e C", "500L", "500 Topolino", "500X", "500X Dolcevita", "600", "600e", "Barchetta", "Brava", "Bravo", "Coupe", "Doblo", "Ducato", "Fiorino", "Fullback", "Grande Punto", "Idea", "Multipla", "Panda", "Punto", "Punto Evo", "Qubo", "Scudo", "Sedici", "Seicento", "Spider", "Stilo", "Strada", "Talento", "Tipo", "Ulysse", "Uno"],
    "Dodge": ["Avenger", "Caliber", "Challenger", "Charger", "Coronet", "Journey", "Nitro", "RAM", "Viper"],
    "Ford": ["Anglia", "B-Max", "Bronco", "Capri", "C-Max", "Consul", "Cortina", "Cougar", "Custom Cab", "EcoSport", "Edge", "Escort", "E-Tourneo Custom", "E-Transit", "E-Transit Custom", "Excursion", "Explorer", "F1", "F150", "F-250", "F350", "Fiesta", "Fiesta Van", "Focus", "Focus CC", "Focus C-Max", "Fusion", "Galaxy", "Granada", "Grand C-Max", "Grand Tourneo Connect", "GT", "Ka", "Ka+", "Kuga", "Maverick", "Mondeo", "Mustang", "Mustang Mach-E", "Orion", "Prefect", "Probe", "Puma", "Ranger", "Scorpio", "Sierra", "S-Max", "Streetka", "Thunderbird", "Tourneo Connect", "Tourneo Courier", "Tourneo Custom", "Transit", "Transit Connect", "Transit Courier", "Transit Custom", "Zephyr"],
    "Nissan": ["350 Z", "370 Z", "Almera", "Altima", "Bluebird", "Cedric", "Cube", "Datsun", "Skyline", "Sunny", "Tiida", "X-Trail"]
};

const AddVehicle = () => {
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        phoneNumber: "",
        vin: "",
        licensePlate: "",
        brand: "",
        model: "",
        vehicleType: "",
        fuelType: "",
        year: "",
        kilometers: "",
    });

    const [errors, setErrors] = useState({});
    const currentYear = new Date().getFullYear();

    const brands = Object.keys(carModels).sort();
    const vehicleTypes = ["Sedan", "SUV", "Truck", "Van", "Coupe"];
    const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];
    const years = ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014",
        "2013", "2012", "2011", "2010", "2009"];

    const availableModels = carModels[formData.brand] || [];

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "brand") {
            setFormData({ ...formData, brand: value, model: "" });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        setErrors({ ...errors, [name]: "" });
    };

    const validate = () => {
        const newErrors = {};
        if (formData.year && (parseInt(formData.year) < 1900 || parseInt(formData.year) > currentYear)) {
            newErrors.year = `Year must be between 1900 and ${currentYear}`;
        }
        if (formData.kilometers && parseFloat(formData.kilometers) < 0) {
            newErrors.kilometers = "Kilometers cannot be negative";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const userEmail = localStorage.getItem("userEmail");

        const authToken = localStorage.getItem("token");

        if (!userEmail || !authToken) {
            alert("Authentication required. Please sign in again.");
            navigate("/signin");
            return;
        }

 
        const vehicleData = { ...formData, email: userEmail };

        try {
            const response = await fetch("http://localhost:3007/api/vehicles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
               
                    "Authorization": `Bearer ${authToken}`,
                },
                body: JSON.stringify(vehicleData), 
            });

            const data = await response.json();

            if (response.ok) {
                alert("Vehicle registered successfully!");
                navigate("/dashboard");
            } else {
            
                if (response.status === 401) {
                    alert("Error: Session expired or access denied. Please re-login.");
                    navigate("/signin");
                } else {
                    alert("Error: " + (data.message || data.error || "Unknown error"));
                }
            }
        } catch (err) {
            console.error(err);
            alert("Server error, please try again.");
        }
    };


    const handleSignOut = () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
   
        localStorage.removeItem("token");
        navigate("/signin");
    };

    const sidebarItems = [
        { text: "Home", icon: <HomeIcon />, path: "/" },
        { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
        { text: "Campaigns", icon: <CampaignIcon />, path: "/campaigns" },
        { text: "Newsletter", icon: <EmailIcon />, path: "/newsletter" },
        { text: "Notifications", icon: <NotificationsIcon />, path: "/notifications" },
        { text: "Sign Out", icon: <ExitToAppIcon />, action: handleSignOut },
    ];

    const drawer = (
        <Box sx={{ width: 250, p: 3 }}>
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
                        sx={{ color: "#ccc", "&:hover": { color: "#00bcd4" } }}
                        onClick={() => {
                            if (item.path) navigate(item.path);
                            if (item.action) item.action();
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

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", background: "#111", color: "white" }}>
        
            <Box
                sx={{
                    position: "fixed",
                    top: 10,
                    right: 10,
                    display: { xs: "block", md: "none" },
                    zIndex: 1200,
                }}
            >
                <IconButton color="inherit" onClick={() => setMobileOpen(!mobileOpen)}>
                    <MenuIcon />
                </IconButton>
            </Box>

            <Drawer
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                sx={{
                    display: { xs: "block", md: "none" },
                    "& .MuiDrawer-paper": { background: "rgba(0,0,0,0.9)", color: "white" },
                }}
            >
                {drawer}
            </Drawer>

       
            <Box
                sx={{
                    width: 250,
                    display: { xs: "none", md: "block" },
                    background: "rgba(255,255,255,0.05)",
                    borderRight: "1px solid rgba(255,255,255,0.1)",
                    p: 3,
                }}
            >
                {drawer}
            </Box>

   
            <Box sx={{ flexGrow: 1, p: 4, display: "flex", justifyContent: "center" }}>


                <Paper
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        width: "100%",
                        maxWidth: 1000,
                    }}
                >
                    <Button
                        onClick={() => navigate("/dashboard")}
                        sx={{ color: "#00bcd4", mb: 3 }}
                    >
                        ← Back to Dashboard
                    </Button>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Register Your Vehicle
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 3 }}>
                        Add your vehicle details to generate a unique CRM number
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        {[
                     
                            { label: "Name", name: "name" },
                            { label: "Surname", name: "surname" },
                            { label: "Phone Number", name: "phoneNumber" },

                            { label: "VIN Number", name: "vin" },
                            { label: "License Plate", name: "licensePlate" },

                        ].map((field) => (
                            <TextField
                                key={field.name}
                                label={field.label}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                fullWidth
                                required
                                margin="normal"
                                InputLabelProps={{ style: { color: "#ccc" } }}
                                sx={{ input: { color: "white" } }}
                            />
                        ))}

                        <TextField
                            select
                            label="Brand"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{ style: { color: "#ccc" } }}

                        
                            SelectProps={{
                                renderValue: (selectedValue) => {
                                    if (!selectedValue) {
                                        return <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Select a Brand</Typography>;
                                    }
                          
                                    return <BrandLogo brand={selectedValue} size="md" showName={true} />;
                                },
                                sx: {
                                    color: 'white',
                                    
                                    '& .MuiSelect-select': { display: 'flex', alignItems: 'center' }
                                }
                            }}

                        >
                        
                            {brands.map((brand) => (
                                <MenuItem
                                    key={brand}
                                    value={brand}
                              
                                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                >
                                
                                    {getBrandLogo(brand, 'sm')}
                                  
                                    {getBrandDisplayName(brand)}
                                </MenuItem>
                            ))}
                        </TextField>


                        <TextField
                            select
                            label="Model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            disabled={!formData.brand} 
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            sx={{ input: { color: "white" } }}
                        >
                            {availableModels.length > 0 ? (
                                availableModels.map((model) => (
                                    <MenuItem key={model} value={model}>
                                        {model}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>
                                    Select a Brand first
                                </MenuItem>
                            )}
                        </TextField>

                        <TextField
                            select
                            label="Vehicle Type"
                            name="vehicleType"
                            value={formData.vehicleType}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            sx={{ input: { color: "white" } }}
                        >
                            {vehicleTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Fuel Type"
                            name="fuelType"
                            value={formData.fuelType}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            sx={{ input: { color: "white" } }}
                        >
                            {fuelTypes.map((fuel) => (
                                <MenuItem key={fuel} value={fuel}>
                                    {fuel}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Year"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            sx={{ input: { color: "white" } }}
                        >
                            {years.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </TextField>


                        <TextField
                            label="Kilometers"
                            name="kilometers"
                            type="number"
                            value={formData.kilometers}
                            onChange={handleChange}
                            error={!!errors.kilometers}
                            helperText={errors.kilometers}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{ style: { color: "#ccc" } }}
                            sx={{ input: { color: "white" } }}
                        />

                        <Button
                            variant="contained"
                            type="submit"
                            sx={{
                                mt: 3,
                                backgroundColor: "#00bcd4",
                                "&:hover": { backgroundColor: "#00acc1" },
                                width: "100%",
                            }}
                        >
                            Register Vehicle
                        </Button>
                    </form>

                </Paper>
            </Box>
        </Box>
    );
};

export default AddVehicle;