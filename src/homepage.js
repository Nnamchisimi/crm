import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";
import { SignIn } from "./signin";  

export const Homepage = () => {
  return (
    <>
      

      {/* HERO SECTION */}
      <Box
        sx={{
          background: "linear-gradient(180deg, #000 0%, #111 100%)",
          color: "white",
          py: { xs: 10, md: 16 },
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              fontWeight="bold"
              gutterBottom
              sx={{
                minHeight: "80px",
                background: "linear-gradient(90deg, #fff, #00bcd4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              <Typewriter
                words={[
                  "Premium Automotive Service",
                  "Professional Vehicle Management",
                  "Drive Smarter With AutoCRM",
                ]}
                loop
                cursor
                cursorStyle="|"
                typeSpeed={140}
                deleteSpeed={60}
                delaySpeed={30000}
              />
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: "rgba(255,255,255,0.7)",
                mb: 2,
              }}
            >
              Premium Vehicle Care Management Platform
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: "rgba(255,255,255,0.7)",
                mb: 5,
              }}
            >
              Streamline your vehicle maintenance with our comprehensive CRM
              platform. Book services, track campaigns, and manage your vehicles
              all in one place.
            </Typography>
          </motion.div>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 3 }}>
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                backgroundColor: "#00bcd4",
                "&:hover": { backgroundColor: "#00acc1" },
              }}
            >
              Get Started
            </Button>
            <Button
              component={Link}
              to="/signin"
              variant="outlined"
              size="large"
              sx={{
                color: "white",
                borderColor: "#00bcd4",
                px: 4,
                py: 1.5,
                fontWeight: 600,
                "&:hover": { backgroundColor: "rgba(0,188,212,0.1)" },
              }}
            >
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>
              {/* Hero Image Section */}
          <Box
            sx={{
              py: { xs: 6, md: 12 },
              display: "flex",
              justifyContent: "center",
             
              bgcolor: "black",
            }}
          >
           <Container maxWidth="lg" sx={{ textAlign: "right" }}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "24px",
                  flexWrap: "wrap", 
                }}
              >
                {/* Left image + text side by side */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "left",
                    gap: 3,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src="/kombos2.png"
                    alt="Hero Left"
                    style={{
                      alignItems: "center",
                      width: "100%",
                      maxWidth: "400px",
                      maxHeight: "500px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                    }}
                  />

                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      maxWidth: "400px",
                      mb: 0,
                      textAlign: "left",
                    }}
                  >
                    Enjoy full self-service and convenience. Manage profiles, preferences, and service appointments anytime, all through one intuitive platform.
                  </Typography>
                </Box>
              
              </motion.div>
            </Container>


          </Box>
  


      {/* SERVICES SECTION */}
      <Box
        sx={{
          background: "linear-gradient(180deg, #111 0%, #000 100%)",
          color: "white",
          py: { xs: 10, md: 14 },
        }}
      >
        
        <Container>
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
          >

            Our Services
          </Typography>
          <Typography
            variant="h6"
            textAlign="center"
            color="rgba(255,255,255,0.7)"
            sx={{ mb: 8 }}
          >
            
            Everything you need to keep your vehicle in perfect condition
          </Typography>
                              {/* Hero Image Section */}
                <Box
                  sx={{
                    py: { xs: 6, md: 6 },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "black",
                  }}
                >
                  <Container maxWidth="900px" sx={{ textAlign: "center" }}>
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true }}
                    >
                      <img
                        src="/chatting.png" // public folder path
                        alt="Hero Automotive"
                        style={{
                          width: "100%",      // makes image responsive
                          maxHeight: "500px", // optional: limit height
                          objectFit: "cover",
                          borderRadius: "8px",
                          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                         
                        }}
                      />
                    </motion.div>
                  </Container>
                </Box>

          <Grid container spacing={4} justifyContent="center">
  {[
    {
      title: "Online Service Appointment",
      desc: "Book your vehicle service online with flexible scheduling.",
    },
    {
      title: "Service Campaigns",
      desc: "Stay updated on recalls and special service offers.",
    },
    {
      title: "Maintenance & Repair",
      desc: "Track service history and get timely reminders.",
    },
    {
      title: "Discount Newsletter",
      desc: "Subscribe to exclusive offers and service discounts.",
    },
    {
      title: "Instant Self-Service",
      desc: "Manage your profile, vehicles, and preferences.",
    },
  ].map((service, index) => (
    <Grid item xs={12} sm={6} md={4} key={index}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        <Card
          sx={{
            height: 280,
            width: 340,
            mx: "auto",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            borderRadius: 3,
            transition: "transform 0.3s, box-shadow 0.3s",
            "&:hover": {
              transform: "translateY(-10px)",
              boxShadow: "0px 8px 25px rgba(0,188,212,0.3)",
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{
                color: "#00bcd4",
              }}
            >
              {service.title}
            </Typography>
            <Typography
              variant="body1"
              color="rgba(255,255,255,0.7)"
              gutterBottom
            >
              {service.desc}
            </Typography>
          </CardContent>
          <Box sx={{ px: 2, pb: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#00bcd4",
                color: "#00bcd4",
                "&:hover": {
                  backgroundColor: "rgba(0,188,212,0.1)",
                },
              }}
            >
              Learn more
            </Button>
          </Box>
        </Card>

        {/* ✅ Conditionally render image after "Online Service Appointment" */}
            {service.title === "Online Service Appointment" && (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <img
              src="/selfservice.png"  
              alt="Online Service Appointment"
              style={{
                width: "100%",
                maxWidth: "350px",
                borderRadius: "8px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
              }}
            />
          </Box> 
        )}
          {service.title === "Service Campaigns" && (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <img
              src="/service.png"  
              alt="Service Campaigns"
              style={{
                width: "100%",
                maxWidth: "350px",
                borderRadius: "8px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
              }}/>
          </Box>
        )}
           {service.title === "Maintenance & Repair" && (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <img
              src="/maintenance.png"  
              alt="Maintenance & Repair"
              style={{
                width: "100%",
                maxWidth: "350px",
                borderRadius: "8px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
              }}  
            />
          </Box>
          
        )}
           {service.title === "Discount Newsletter" && (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <img
              src="/discount.png"  
              alt="Discount Newsletter"
              style={{
                width: "100%",
                maxWidth: "350px",
                borderRadius: "8px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
              }}  
            />
          </Box>
          
        )}
           {service.title === "Instant Self-Service" && (
          <Box sx={{ textAlign: "center", mt: 3 }}>
            <img
              src="/selfservice.png"  
              alt="Instant Self-Service"
              style={{
                width: "100%",
                maxWidth: "350px",
                borderRadius: "8px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
              }}  
            />
          </Box>
          
        )}

      </motion.div>
    </Grid>
  ))}
</Grid>

        </Container>
      </Box>

      {/* FINAL CTA */}
      <Box
        sx={{
          bgcolor: "#00bcd4",
          color: "black",
          textAlign: "center",
          py: { xs: 10, md: 14 },
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4 }}>
              Join thousands of vehicle owners managing their maintenance with
              ease.
            </Typography>
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              color="inherit"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.8)",
                  color: "white",
                },
              }}
            >
              Create Your Account
            </Button>
          </motion.div>
        </Container>
      </Box>
    </>
  );
};
