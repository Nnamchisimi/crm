import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Typography, Box } from '@mui/material';

// --- Data Definitions (Should match AddVehicle for consistency) ---
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


const vehicleTypes = ["Sedan", "SUV", "Truck", "Van", "Coupe", "Hatchback"];
const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 26 }, (_, i) => String(currentYear - i)).reverse(); // 1999 to current year


const EditCarDetails = ({ open, handleClose, vehicle, onUpdate }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const availableModels = carModels[formData.brand] || [];

    // Load vehicle data into form state when the component receives a 'vehicle' prop
    useEffect(() => {
        if (vehicle) {
            setFormData({
                name: vehicle.name || '',
                surname: vehicle.surname || '',
                phoneNumber: vehicle.phone_number || '',
                vin: vehicle.vin || '',
                licensePlate: vehicle.license_plate || '',
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                // Use normalized keys from the parent component or fallback to old keys
                vehicleType: vehicle.vehicle_type|| '', 
                fuelType: vehicle.fuelType || vehicle.fuel_type || '', 
                year: vehicle.year || '',
                kilometers: vehicle.kilometers || 0,
            });
        }
    }, [vehicle]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Reset model if brand changes
        if (name === "brand") {
            setFormData(prev => ({ ...prev, brand: value, model: "" }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (formData.kilometers < 0) {
            newErrors.kilometers = "Kilometers cannot be negative";
        }
        if (formData.year > currentYear || formData.year < 1900) {
            newErrors.year = `Year must be between 1900 and ${currentYear}`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Authentication failed. Please re-login.");
            handleClose();
            return;
        }

        try {
            const response = await fetch(`http://localhost:3007/api/vehicles/${vehicle.id}`, {
                method: 'PUT', // 💡 Use PUT for updating an existing resource
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                alert("Vehicle updated successfully!");
                // Call the callback to update the parent component's state
                onUpdate(result); 
                handleClose();
            } else {
                alert("Update failed: " + (result.message || "Unknown error"));
            }
        } catch (err) {
            console.error("API error during update:", err);
            alert("Server error during update.");
        }
    };
    
    // Prevent rendering the modal if vehicle data hasn't loaded yet
    if (!vehicle) return null; 

    // Helper for input styling consistency
    const inputStyle = { input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#ccc' }, '&:hover fieldset': { borderColor: '#00bcd4' }, '&.Mui-focused fieldset': { borderColor: '#00bcd4' } } };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" 
            PaperProps={{ sx: { backgroundColor: '#1e1e1e', color: 'white' } }}>
            <DialogTitle sx={{ borderBottom: '1px solid #333', color: '#00bcd4' }}>
                <Typography variant="h5" fontWeight="bold">Edit Vehicle Details</Typography>
                <Typography variant="subtitle1" color="white">{vehicle.brand} {vehicle.model}</Typography>
            </DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    
                    {/* Customer Details */}
                    <Typography variant="h6" sx={{ color: '#00bcd4' }}>Customer Info</Typography>
                    <TextField label="Name" name="name" value={formData.name || ''} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle} />
                    <TextField label="Surname" name="surname" value={formData.surname || ''} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle} />
                    <TextField label="Phone Number" name="phoneNumber" value={formData.phoneNumber || ''} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle} />
                    
                    {/* Vehicle Details */}
                    <Typography variant="h6" sx={{ color: '#00bcd4', mt: 2 }}>Vehicle Info</Typography>
                    <TextField label="VIN Number" name="vin" value={formData.vin || ''} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle} />
                    <TextField label="License Plate" name="licensePlate" value={formData.licensePlate || ''} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle} />
                    
                    {/* Brand/Model/Type/Fuel Selects */}
                    <TextField select label="Brand" name="brand" value={formData.brand || ''} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle}>
                        {Object.keys(carModels).map((brand) => (<MenuItem key={brand} value={brand}>{brand}</MenuItem>))}
                    </TextField>
                    <TextField select label="Model" name="model" value={formData.model || ''} onChange={handleChange} fullWidth disabled={!formData.brand} InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle}>
                        {availableModels.map((model) => (<MenuItem key={model} value={model}>{model}</MenuItem>))}
                    </TextField>
                    <TextField select label="Vehicle Type" name="vehicleType" value={formData.vehicleType || ''} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle}>
                        {vehicleTypes.map((type) => (<MenuItem key={type} value={type}>{type}</MenuItem>))}
                    </TextField>
                    <TextField select label="Fuel Type" name="fuelType" value={formData.fuelType || ''} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle}>
                        {fuelTypes.map((fuel) => (<MenuItem key={fuel} value={fuel}>{fuel}</MenuItem>))}
                    </TextField>

                    {/* Year and Kilometers */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField select label="Year" name="year" value={formData.year || ''} onChange={handleChange} fullWidth InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle}>
                            {years.map((year) => (<MenuItem key={year} value={year}>{year}</MenuItem>))}
                        </TextField>
                        <TextField 
                            label="Kilometers" name="kilometers" type="number" 
                            value={formData.kilometers} onChange={handleChange} fullWidth 
                            error={!!errors.kilometers} helperText={errors.kilometers}
                            InputLabelProps={{ style: { color: '#ccc' } }} sx={inputStyle}
                        />
                    </Box>

                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#00bcd4', '&:hover': { bgcolor: '#00acc1' } }}>
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditCarDetails;