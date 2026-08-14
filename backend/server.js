const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    family: 4
});

pool.on("connect", () => {
    console.log("✅ Connected to Supabase PostgreSQL");
});

pool.on("error", (err) => {
    console.error("PostgreSQL Pool Error:", err);
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});

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
        const is_verified = true;

        const existing = await pool.query(
            "SELECT * FROM users WHERE google_id = $1 OR email = $2",
            [google_id, email]
        );

        if (existing.rows.length === 0) {
            await pool.query(
                "INSERT INTO users (username, email, google_id, is_verified) VALUES ($1, $2, $3, $4)",
                [username, email, google_id, is_verified]
            );
            console.log(` New Google user inserted: ${email}`);
        } else {
            console.log(`Google user already exists: ${email}`);
        }

        res.json({ success: true, email, username });
    } catch (err) {
        console.error(" Google login error:", err);
        res.status(500).json({ error: "Google login failed" });
    }
});

app.get("/api/vehicles", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM vehicles");
        res.json(result.rows);
    } catch (err) {
        console.error("Vehicle fetch error:", err);
        res.status(500).json({ message: "Failed to fetch vehicles" });
    }
});

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
        const existing = await pool.query(
            "SELECT * FROM vehicles WHERE vin = $1 OR license_plate = $2",
            [vin, licensePlate]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Vehicle with this VIN or license plate already exists" });
        }

        const result = await pool.query(
            `INSERT INTO vehicles
            (vin, license_plate, brand, model, vehicle_type, fuel_type, year, kilometers)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [vin, licensePlate, brand, model, vehicleType, fuelType, year, kilometers]
        );

        res.status(201).json({
            message: "Vehicle registered successfully!",
            vehicleId: result.rows[0].id,
        });
    } catch (error) {
        console.error("Vehicle insert error:", error);
        res.status(500).json({
            message: "Error registering vehicle",
            code: error.code,
        });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});
