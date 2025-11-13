const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "123456789",
  database: process.env.DB_NAME || "crm",
});



// ✅ Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Default GET route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// ✅ Google login/signup route
app.post("/api/auth/google", async (req, res) => {
  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ error: "Missing ID token" });

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const google_id = payload.sub;
    const email = payload.email;
    const username = payload.name;
    const is_verified = 1;

    const [existing] = await pool.query(
      "SELECT * FROM users WHERE google_id = ? OR email = ?",
      [google_id, email]
    );

    if (existing.length === 0) {
      await pool.query(
        "INSERT INTO users (username, email, google_id, is_verified) VALUES (?, ?, ?, ?)",
        [username, email, google_id, is_verified]
      );
      console.log(`🆕 New Google user inserted: ${email}`);
    } else {
      console.log(`✅ Google user already exists: ${email}`);
    }

    res.json({ success: true, email, username });
  } catch (err) {
    console.error("❌ Google login error:", err);
    res.status(500).json({ error: "Google login failed" });
  }
});

// ✅ Add Vehicle route
app.post("/api/vehicles", async (req, res) => {
  const { vin, licensePlate, brand, model, vehicleType, fuelType, year, kilometers } = req.body;

  if (!vin || !licensePlate || !brand || !model || !vehicleType || !fuelType || !year || !kilometers) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (year < 1900 || year > new Date().getFullYear()) {
    return res.status(400).json({ message: "Invalid vehicle year" });
  }
  if (kilometers < 0) {
    return res.status(400).json({ message: "Kilometers cannot be negative" });
  }

  try {
    const [existing] = await pool.query(
      "SELECT * FROM vehicles WHERE vin = ? OR license_plate = ?",
      [vin, licensePlate]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Vehicle with this VIN or license plate already exists" });
    }

    const sql = `
      INSERT INTO vehicles
      (vin, license_plate, brand, model, vehicle_type, fuel_type, year, kilometers)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [vin, licensePlate, brand, model, vehicleType, fuelType, year, kilometers]);

    res.status(201).json({
      message: "Vehicle registered successfully!",
      vehicleId: result.insertId,
    });
  } catch (error) {
    console.error("Vehicle insert error:", error);
    res.status(500).json({
      message: "Error registering vehicle",
      sqlMessage: error.sqlMessage,
      code: error.code,
    });
  }
});

// ✅ Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
