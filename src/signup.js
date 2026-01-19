import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3007";

export const SignUp = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [countryCode, setCountryCode] = useState("90");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const navigate = useNavigate();

  // --- Normal signup ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullNumber = `+${countryCode}${phoneNumber}`;

    const userData = {
      name,
      surname,
      phoneNumber: fullNumber,
      email,
      username,
      password,
      is_verified: isGoogleUser ? 1 : 0,
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (data.success) {
        // Save CRM number and navigate
        localStorage.setItem("crmNumber", data.crm_number);
        alert("Signup successful! Check your email for verification.");
        navigate("/signin");
      } else {
        alert(data.error || data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  // --- Google signup ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) return;

      const res = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (data.success) {
        setEmail(data.email || "");
        setName(data.name || "");
        setSurname(data.surname || "");
        setIsGoogleUser(true);

        // Save token
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "userEmail",
          data.email || data.user?.email
        );

        // Save CRM number if this is a new Google user
        if (data.crm_number) {
          localStorage.setItem("crmNumber", data.crm_number);
        }

        // Resolve role safely
        const role =
          data.role || data.user?.role || (data.token ? jwtDecode(data.token).role : null);
        localStorage.setItem("role", role);

        // Navigate based on role
        if (role === "admin") navigate("/admin");
        else if (role === "user") navigate("/dashboard");
        else navigate("/signin");
      } else {
        alert(data.message || "Google signup failed");
      }
    } catch (err) {
      console.error("Google error:", err);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #000 0%, #111 100%)",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Paper
            elevation={6}
            sx={{
              p: 4,
              borderRadius: 3,
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Typography
              variant="h4"
              textAlign="center"
              fontWeight="bold"
              gutterBottom
              sx={{
                background: "linear-gradient(90deg, #fff, #00bcd4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Sign up
            </Typography>

            {/* Google signup */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                width="300"
              />
            </Box>

            <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.2)" }}>
              or
            </Divider>

            {/* Manual signup form */}
            <Box
              component="form"
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              onSubmit={handleSubmit}
            >
              <TextField
                label="Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
              />

              <TextField
                label="Surname"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
              />

              <Box sx={{ display: "flex", gap: 1 }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{
                    background: "#222",
                    color: "white",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    padding: "0 8px",
                  }}
                >
                  <option value="1">🇺🇸 +1</option>
                  <option value="44">🇬🇧 +44</option>
                  <option value="90">🇹🇷 +90</option>
                </select>

                <TextField
                  label="Phone number"
                  fullWidth
                  required
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value.replace(/\D/g, ""))
                  }
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  InputProps={{ style: { color: "white" } }}
                />
              </Box>

              <TextField
                label="Email"
                required
                value={email}
                disabled={isGoogleUser}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
              />

              <TextField
                label="Username"
                required
                value={username}
                disabled={isGoogleUser}
                onChange={(e) => setUsername(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
              />

              <TextField
                label="Password"
                type="password"
                required={!isGoogleUser}
                disabled={isGoogleUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
              />

              {!isGoogleUser && (
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    mt: 2,
                    py: 1.5,
                    backgroundColor: "#00bcd4",
                  }}
                >
                  Sign up
                </Button>
              )}
            </Box>

            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mt: 3, color: "white" }}
            >
              Already have an account?{" "}
              <Link to="/signin" style={{ color: "#00bcd4" }}>
                Sign in
              </Link>
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};
