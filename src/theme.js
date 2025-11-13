// theme.js
import { createTheme, responsiveFontSizes } from "@mui/material/styles";

let theme = createTheme({
  palette: {
    mode: "dark", // default mode, will auto-detect with system
    primary: {
      main: "#00bcd4", // teal gradient start
    },
    secondary: {
      main: "#ffffff", // fallback
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255,255,255,0.7)",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

theme = responsiveFontSizes(theme);

export default theme;
