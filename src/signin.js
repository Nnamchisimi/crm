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
import {jwtDecode} from "jwt-decode";

export const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse || !credentialResponse.credential) return;

      const decoded = jwtDecode(credentialResponse.credential);

      const userData = {
        id_token: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        google_id: decoded.sub,
      };

      console.log("Prepared user data:", userData);

      const res = await fetch("http://localhost:3007/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: credentialResponse.credential }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (data.success) {
        setEmail(data.email || "");
        setUsername(data.name?.split(" ")[0] || "");
        setIsGoogleUser(true);
        localStorage.setItem("userEmail", data.email);

        // ✅ Redirect to dashboard
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
      <Header />
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
                Sign In
              </Typography>

              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("Email/password login not yet implemented");
                }}
              >
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  required
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  InputProps={{ style: { color: "white" } }}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  required
                  InputLabelProps={{ style: { color: "#aaa" } }}
                  InputProps={{ style: { color: "white" } }}
                />
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
                  Sign In
                </Button>
              </Box>

              <Divider sx={{ my: 3, backgroundColor: "rgba(255,255,255,0.2)" }}>
                or
              </Divider>

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
                sx={{ mt: 3, color: "rgba(255,255,255,0.7)" }}
              >
                Don’t have an account?{" "}
                <Link to="/signup" style={{ color: "#00bcd4" }}>
                  Sign Up
                </Link>
              </Typography>
                    <Typography
                variant="body2"
                textAlign="center"
                sx={{ mt: 3, color: "rgba(255,255,255,0.7)" }}
              >
                Sign in as admin{" "}
                <Link to="/adminsignin" style={{ color: "#00bcd4" }}>
                  Admin
                </Link>
              </Typography>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};
