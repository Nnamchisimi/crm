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

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

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

      if (!res.ok) {
        setErrorMessage(data.message || "Signup failed");
        return;
      }

      if (data.success) {
        localStorage.setItem("crmNumber", data.crm_number);

        setSuccessMessage(
          "Signup successful! We’ve sent a verification email. Please check your inbox and spam folder before signing in."
        );

        setErrorMessage("");

        setTimeout(() => {
          navigate("/signin");
        }, 10000);
      }
    } catch (err) {
      setErrorMessage("Signup failed. Please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:3007/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (data.success) {
        setEmail(data.email || "");
        setUsername(data.username || "");
        setName(data.name || "");
        setSurname(data.surname || "");
        setIsGoogleUser(true);

        if (data.crm_number) {
          localStorage.setItem("crmNumber", data.crm_number);
        }

        localStorage.setItem("userEmail", data.email);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("❌ Google login error:", err);
    }
  };

  const handleGoogleError = () => {
    console.error("❌ Google Login Failed");
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

            <Box
              component="form"
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}
              onSubmit={handleSubmit}
            >
              <TextField
                label="Name"
                fullWidth
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
              />

              <TextField
                label="Surname"
                fullWidth
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
                    minWidth: "80px",
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
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
                disabled={isGoogleUser}
              />

              <TextField
                label="Username"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
                disabled={isGoogleUser}
              />

              <TextField
                label="Password"
                type="password"
                required={!isGoogleUser}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#aaa" } }}
                InputProps={{ style: { color: "white" } }}
                disabled={isGoogleUser}
              />

              {!isGoogleUser && (
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontWeight: 600,
                    backgroundColor: "#00bcd4",
                    "&:hover": { backgroundColor: "#00acc1" },
                  }}
                >
                  Sign up
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.2)" }}>
              or
            </Divider>

            <Typography
              variant="body2"
              textAlign="center"
              sx={{ mt: 3, color: "rgba(255, 255, 255, 1)" }}
            >
              Already have an account?{" "}
              <Link to="/signin" style={{ color: "#00bcd4" }}>
                Sign in
              </Link>
            </Typography>

            {successMessage && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "rgba(0, 188, 212, 0.15)",
                  border: "1px solid #00bcd4",
                  textAlign: "center",
                }}
              >
                <Typography color="#00e5ff" fontWeight="bold">
                  Almost there!
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {successMessage}
                </Typography>

                <Button
                  href="https://mail.google.com"
                  target="_blank"
                  sx={{ mt: 2 }}
                  variant="outlined"
                >
                  Open Gmail
                </Button>

                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Redirecting to sign in shortly…
                </Typography>
              </Box>
            )}

            {errorMessage && (
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: "rgba(244, 67, 54, 0.15)",
                  border: "1px solid #f44336",
                  textAlign: "center",
                }}
              >
                <Typography color="#ff8a80">{errorMessage}</Typography>
              </Box>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};
