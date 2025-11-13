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
import Header from "./Header";
import { GoogleLogin } from "@react-oauth/google";

export const SignUp = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const navigate = useNavigate();

  // ✅ Manual signup (for non-Google users)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      email,
      username,
      password,
      is_verified: isGoogleUser ? 1 : 0,
    };

    console.log("Manual signup data:", userData);

    try {
      const res = await fetch("http://localhost:3007/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (data.success) {
        navigate("/dashboard");
      } else {
        console.error("Signup failed:", data.error);
      }
    } catch (err) {
      console.error("Signup error:", err);
    }
  };

  // ✅ Google signup
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch("http://localhost:3007/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: credentialResponse.credential }),
      });

      const data = await res.json();

      if (data.success) {
        console.log("Google signup success:", data);
        setEmail(data.email || "");
        setUsername(data.username?.split(" ")[0] || "");
        setIsGoogleUser(true);

        // Optional: store info locally
        localStorage.setItem("userEmail", data.email);

        // ✅ Redirect user after signup
        navigate("/dashboard");
      } else {
        console.error("Google signup failed:", data.error);
      }
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Login Failed");
  };

  return (
    <>
    
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

              {/* Email & Password Form */}
              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}
                onSubmit={handleSubmit}
              >
                <TextField
                  label="Email"
                  variant="outlined"
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
                  variant="outlined"
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
                  variant="outlined"
                  fullWidth
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

              {/* Divider */}
              <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.2)" }}>
                or
              </Divider>

              {/* Google One-Tap Login */}
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                />
              </Box>

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
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};
