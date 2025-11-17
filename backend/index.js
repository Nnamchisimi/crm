const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// GET /api/vehicles - list all vehicles
app.get("/api/vehicles", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vehicles ORDER BY id DESC");
    res.json(rows); // send array of vehicles
  } catch (err) {
    console.error("Error fetching vehicles:", err);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
});


// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.post("/api/auth/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("🔍 Signin request:", req.body);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Check if user exists
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = users[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "1h" }
    );

    console.log("✅ User logged in:", user.email);

    res.json({
      success: true,
      token,
      role: user.role,
      email: user.email,
      name: user.name,
      surname: user.surname,
    });

  } catch (err) {
    console.error("❌ SIGNIN ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



// ✅ Manual Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, surname, phoneNumber, email, username, password, is_verified } = req.body;

    if (!name || !surname || !email || !username || (!password && !is_verified)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Optional: check if user already exists
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password if provided (only for manual signup)
    let hashedPassword = null;
    if (password) {
      const bcrypt = require("bcrypt");
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const sql = `
      INSERT INTO users (name, surname, username, email, phone_number, password, is_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      name,
      surname,
      username,
      email,
      phoneNumber || null,
      hashedPassword,
      is_verified || 0,
    ]);

    res.status(201).json({ success: true, userId: result.insertId });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
});


// ✅ Google login/signup
app.post("/api/auth/google", async (req, res) => {
  try {
    const { id_token, username, name, surname, phoneNumber } = req.body;
    if (!id_token) return res.status(400).json({ message: "Missing ID token" });

    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const google_id = payload.sub;
    const email = payload.email;
    const is_verified = 1;

    const [existing] = await pool.query(
      "SELECT * FROM users WHERE google_id = ? OR email = ?",
      [google_id, email]
    );

    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO users 
        (name, surname, username, email, google_id, phone_number, is_verified) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, surname, username, email, google_id, phoneNumber || null, is_verified]
      );
      console.log(`🆕 New Google user inserted: ${email}`);
    } else {
      console.log(`✅ Google user already exists: ${email}`);
    }

    res.json({ success: true, email, username, name, surname, phoneNumber });
  } catch (err) {
    console.error("❌ Google login error:", err);
    res.status(500).json({ message: err.message || "Google login failed" });
  }
});


// ✅ Add Vehicle
app.post("/api/vehicles", async (req, res) => {
  const {
    name,
    surname,
    phoneNumber,
    vin,
    licensePlate,
    brand,
    model,
    vehicleType,
    fuelType,
    year,
    kilometers,
    email
  } = req.body;

  // Validate required fields
  if (
    !name ||
    !surname ||
    !phoneNumber ||
    !vin ||
    !licensePlate ||
    !brand ||
    !model ||
    !vehicleType ||
    !fuelType ||
    !year ||
    !kilometers ||
    !email
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if VIN or license plate already exists
    const [existing] = await pool.query(
      "SELECT * FROM vehicles WHERE vin = ? OR license_plate = ?",
      [vin, licensePlate]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Vehicle with this VIN or license plate already exists" });
    }

    // Insert new vehicle
    const sql = `
      INSERT INTO vehicles
      (name, surname, phone_number, vin, license_plate, brand, model, vehicle_type, fuel_type, year, kilometers, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      name,
      surname,
      phoneNumber,
      vin,
      licensePlate,
      brand,
      model,
      vehicleType,
      fuelType,
      year,
      kilometers,
      email
    ]);

    res.status(201).json({
      message: "Vehicle registered successfully!",
      vehicleId: result.insertId
    });
  } catch (error) {
    console.error("❌ Vehicle insert error:", error);
    res.status(500).json({
      message: error.sqlMessage || error.message || "Internal server error"
    });
  }
});

// POST /api/newsletter
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email, phone, notifications, preferences } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Insert into database
    const sql = `
      INSERT INTO newsletter_subscriptions 
      (email, phone, notify_email, notify_sms, notify_phone, pref_weekly_digest, pref_monthly_offers, pref_service_reminders)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        phone = VALUES(phone),
        notify_email = VALUES(notify_email),
        notify_sms = VALUES(notify_sms),
        notify_phone = VALUES(notify_phone),
        pref_weekly_digest = VALUES(pref_weekly_digest),
        pref_monthly_offers = VALUES(pref_monthly_offers),
        pref_service_reminders = VALUES(pref_service_reminders),
        updated_at = CURRENT_TIMESTAMP
    `;

    const [result] = await pool.execute(sql, [
      email,
      phone || null,
      notifications.email ? 1 : 0,
      notifications.sms ? 1 : 0,
      notifications.phone ? 1 : 0,
      preferences.weeklyDigest ? 1 : 0,
      preferences.monthlyOffers ? 1 : 0,
      preferences.reminders ? 1 : 0,
    ]);

    res.status(201).json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    console.error("Newsletter subscription error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// server.js (or index.js)
// POST /api/newsletter/send
app.post("/api/newsletter/send", async (req, res) => {
  const { subject, content } = req.body;

  try {
    // 1️⃣ Get all subscribed users
    const [subscribers] = await pool.query("SELECT email FROM newsletter_subscriptions");

    // 2️⃣ Send emails/SMS (simplified, just console for now)
    subscribers.forEach(user => {
      console.log(`Sending newsletter to ${user.email}`);
      // sendEmail(user.email, subject, content) // implement actual email service
    });

    // 3️⃣ Insert notification for each user
    for (const user of subscribers) {
      await pool.query(
        "INSERT INTO notifications (user_email, type, title, message) VALUES (?, 'Newsletter', ?, ?)",
        [user.email, subject, content]
      );
    }

    res.json({ success: true, count: subscribers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send newsletter" });
  }
});

// ✅ Get all service campaigns
app.get("/api/campaigns", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM service_campaigns ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("❌ Failed to fetch campaigns:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
});



// ✅ Add Campaign
app.post("/api/campaigns", async (req, res) => {
  const {
    campaign_title,
    description,
    maintenance_type,
    priority,
    brand_filter,
    model_filter,
    year_filter,
    discount_percent,
    valid_until,
  } = req.body;

  // Basic validation
  if (!campaign_title || !description || !maintenance_type || !priority) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  try {
    const sql = `
      INSERT INTO service_campaigns 
      (campaign_title, description, maintenance_type, priority, brand_filter, model_filter, year_filter, discount_percent, valid_until)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      campaign_title,
      description,
      maintenance_type,
      priority,
      brand_filter || null,
      model_filter || null,
      year_filter || null,
      discount_percent || null,
      valid_until || null,
    ]);

    res.status(201).json({
      message: "Campaign created successfully!",
      id: result.insertId,
    });
  } catch (error) {
    console.error("❌ Campaign insert error:", error);
    res.status(500).json({
      message: error.sqlMessage || error.message || "Internal server error",
    });
  }
});

// ✅ Catch-all 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
