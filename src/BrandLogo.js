import React from 'react';
import { Typography, Box } from '@mui/material';

/**
 * ⚠️ IMPORTANT:
 * The keys in this map MUST match the normalized (Title Cased) brand names
 * defined in your 'carModels' object in AddVehicle.js.
 */
const brandLogos = {
    // Note: Using PNG links for compatibility and ease, hosted externally.
    "Chrysler": "https://www.carlogos.org/car-logos/chrysler-logo-2009-640.png",
    "Audi": "https://www.carlogos.org/car-logos/audi-logo.png",
    "Alfa Romeo": "https://www.carlogos.org/logo/Alfa-Romeo-logo-2015-1920x1080.png",
    "BMW": "https://www.carlogos.org/car-logos/bmw-logo.png",
    "Chevrolet": "https://www.carlogos.org/car-logos/chevrolet-logo.png",
    "Citroen": "https://www.carlogos.org/logo/Citroen-logo-2009-2048x2048.png",
    "Maybach": "https://www.carlogos.org/car-logos/maybach-logo.png",
    "Acura": "https://www.carlogos.org/car-logos/acura-logo.png",
    "Peugeot": "https://www.carlogos.org/logo/Peugeot-logo-2010-1920x1080.png",
    "Renault": "https://www.carlogos.org/logo/Renault-logo-2015-2048x2048.png",
    "Subaru": "https://www.carlogos.org/car-logos/subaru-logo.png",
    "Mazda": "https://www.carlogos.org/car-logos/mazda-logo-2015.png",
    "Lexus": "https://www.carlogos.org/car-logos/lexus-logo.png",
    "Mercedes-Benz": "https://www.carlogos.org/car-logos/mercedes-benz-logo.png",
    "Toyota": "https://www.carlogos.org/car-logos/toyota-logo.png",
    "Volkswagen": "https://www.carlogos.org/logo/Volkswagen-logo-2019-1500x1500.png",
    "Kia": "https://www.carlogos.org/logo/Kia-logo-2560x1440.png",
    "Jaguar": "https://www.carlogos.org/car-logos/jaguar-logo-1982-640.png",
    "Infiniti": "https://www.carlogos.org/car-logos/infiniti-logo.png",
    "Hyundai": "https://www.carlogos.org/car-logos/hyundai-logo.png",
    "Honda": "https://www.carlogos.org/car-logos/honda-logo.png",
    "Fiat": "https://www.carlogos.org/logo/Fiat-logo-2006-1920x1080.png",
    "Dodge": "https://www.carlogos.org/car-logos/dodge-logo.png",
    "Ford": "https://www.carlogos.org/car-logos/ford-logo.png",
    "Nissan": "https://www.carlogos.org/car-logos/nissan-logo-2020-black.png",
};

// Map size prop to standard CSS dimensions
const sizeMap = {
    sm: 18, // Small (for MenuItem)
    md: 24, // Medium (for selected TextField value)
    lg: 32, // Large
};

/**
 * Helper function to retrieve the clean display name of a brand.
 */
export const getBrandDisplayName = (brand) => {
    return brand;
};

/**
 * Helper function to return just the <img> tag for use in MUI components (like MenuItem).
 */
export const getBrandLogo = (brand, size = "sm") => {
    const logoUrl = brandLogos[brand];
    const imageSize = sizeMap[size];

    if (!logoUrl) return null;

    return (
        <img
            key={brand}
            src={logoUrl}
            alt={`${brand} logo`}
            style={{
                height: imageSize,
                width: imageSize,
                objectFit: 'contain',
                marginRight: 8, // Spacing from the text
                display: 'inline-block',
                filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.4))',
            }}
            // Graceful error handling: If the image fails to load, hide it
            onError={(e) => {
                e.currentTarget.style.display = 'none';
            }}
        />
    );
};

/**
 * Main React Component to display the logo and optional name.
 */
export const BrandLogo = ({
    brand,
    size = "md",
    showName = true,
    className
}) => {
    const logoUrl = brandLogos[brand];
    const displayName = getBrandDisplayName(brand);
    const imageSize = sizeMap[size];

    // Fallback: If no logo URL is found, return the brand name as text
    if (!logoUrl) {
        return showName ? <Typography variant="inherit" className={className}>{displayName}</Typography> : null;
    }

    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: 'white', // Ensure text is visible in dark theme
            }}
            className={className}
        >
            <img
                src={logoUrl}
                alt={`${displayName} logo`}
                style={{
                    height: imageSize,
                    width: imageSize,
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.4))', // slight highlight on dark background
                }}
                onError={(e) => {
                    e.currentTarget.style.display = 'none'; // Hide if the link is broken
                }}
            />
            {showName && <Typography variant="inherit" sx={{ color: 'white' }}>{displayName}</Typography>}
        </Box>
    );
};