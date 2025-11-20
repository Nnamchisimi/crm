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

// -------------------------------------------------------------
// 🔐 AUTHENTICATION MIDDLEWARE
// -------------------------------------------------------------

// Middleware to verify JWT and attach user info to req
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided, access denied" });
    }

    const token = authHeader.split(" ")[1]; // Expects 'Bearer <token>'

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
        req.user = decoded; // Attach the decoded user payload (id, email, role) to the request
        next();
    } catch (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ message: "Invalid token, access denied" });
    }
};

// -------------------------------------------------------------
// ⚙️ GENERAL ROUTES
// -------------------------------------------------------------

// ✅ Root route
app.get("/", (req, res) => {
    res.send("✅ Backend is running!");
});

// ✅ Health check
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});

// -------------------------------------------------------------
// 🚗 VEHICLE ROUTES (MODIFIED FOR USER FILTERING)
// -------------------------------------------------------------

// GET /api/vehicles - list vehicles for the logged-in user
app.get("/api/vehicles", verifyToken, async (req, res) => {
    // The user's email is available on req.user after verifyToken middleware runs
    const userEmail = req.user.email;

    try {
        const [rows] = await pool.query(
            "SELECT v.*, u.crm_number FROM vehicles v LEFT JOIN users u ON v.email = u.email WHERE v.email = ? ORDER BY v.id DESC  ",
            [userEmail] // <-- FILTERING BY THE LOGGED-IN USER'S EMAIL
        );
        res.json(rows); // send array of vehicles
    } catch (err) {
        console.error("Error fetching vehicles:", err);
        res.status(500).json({ error: "Failed to fetch vehicles" });
    }
});

app.get("/api/vehicles/:id", verifyToken, async (req, res) => {
    // The user's email is available on req.user after verifyToken middleware runs
    const userEmail = req.user.email;

    try {
        const [rows] = await pool.query(
            "SELECT v.*, u.crm_number FROM vehicles v LEFT JOIN users u ON v.email = u.email WHERE v.email = ? ORDER BY v.id DESC  ",
            [userEmail] // <-- FILTERING BY THE LOGGED-IN USER'S EMAIL
        );
        res.json(rows); // send array of vehicles
    } catch (err) {
        console.error("Error fetching vehicles:", err);
        res.status(500).json({ error: "Failed to fetch vehicles" });
    }
});


// ✅ Add Vehicle (MODIFIED FOR AUTHENTICATION)
app.post("/api/vehicles", verifyToken, async (req, res) => {
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
        // Removed email from destructuring, it comes from the JWT
    } = req.body;

    // Use the email from the decoded JWT payload
    const userEmail = req.user.email;

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
        !kilometers
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
            userEmail // <-- Using the email from the JWT
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



// -------------------------------------------------------------
// 🔑 AUTH ROUTES
// -------------------------------------------------------------

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

        let [existing] = await pool.query(
            "SELECT * FROM users WHERE google_id = ? OR email = ?",
            [google_id, email]
        );

        // --- 1. HANDLE SIGNUP ---
        if (existing.length === 0) {
            await pool.query(
                `INSERT INTO users 
                (name, surname, username, email, google_id, phone_number, is_verified) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [name, surname, username, email, google_id, phoneNumber || null, is_verified]
            );
            console.log(`🆕 New Google user inserted: ${email}`);
            // Fetch the newly inserted user's data (especially ID and ROLE)
            [existing] = await pool.query(
                "SELECT * FROM users WHERE email = ?", 
                [email]
            );
        } else {
            console.log(`✅ Google user already exists: ${email}`);
        }

        const user = existing[0]; // The user object is now ready

        // --- 2. GENERATE JWT ---
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role }, // Payload must include ID and Role
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "1h" }
        );

        console.log("✅ Google user logged in:", user.email);

        // --- 3. SEND RESPONSE WITH JWT ---
        res.json({ 
            success: true, 
            token, // <-- 🔑 CRITICAL: JWT is now returned
            role: user.role, 
            email: user.email, 
            name: user.name, 
            surname: user.surname 
        });

    } catch (err) {
        console.error("❌ Google login error:", err);
        res.status(500).json({ message: err.message || "Google login failed" });
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
            // bcrypt is required at the top of the file
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


// ✅ Manual Signin (MISSING ROUTE)
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
            { id: user.id, email: user.email, role: user.role }, // Payload includes email
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


// -------------------------------------------------------------
// 🛠️ CAMPAIGN & NEWSLETTER ROUTES
// -------------------------------------------------------------

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
// GET /api/campaigns?email=user@example.com
app.get("/api/campaigns", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "User email is required" });
    }

    try {
        const [rows] = await pool.query(`
            SELECT 
                sc.id,
                sc.campaign_title,
                sc.description,
                sc.maintenance_type,
                sc.priority,
                sc.brand_filter,
                sc.model_filter,
                sc.year_filter,
                sc.discount_percent,
                sc.valid_until,
                CASE WHEN uc.user_email IS NOT NULL THEN 1 ELSE 0 END AS bookedByUser
            FROM service_campaigns sc
            LEFT JOIN user_campaigns uc
                ON sc.id = uc.campaign_id
                AND uc.user_email = ?
                AND uc.status = 'active'
            ORDER BY sc.created_at DESC
        `, [email]);

        const campaigns = rows.map(c => ({
            id: c.id,
            title: c.campaign_title,
            description: c.description,
            type: c.maintenance_type,
            priority: c.priority,
            brand: c.brand_filter,
            model: c.model_filter,
            year: c.year_filter,
            discount: c.discount_percent ? `${c.discount_percent}% OFF` : null,
            validUntil: c.valid_until ? new Date(c.valid_until).toLocaleDateString("en-GB") : null,
            bookedByUser: !!c.bookedByUser
        }));

        res.json(campaigns);
    } catch (err) {
        console.error("❌ Failed to fetch campaigns:", err);
        res.status(500).json({ message: "Server error fetching campaigns" });
    }
});



app.post("/api/campaigns/:id/book", async (req, res) => {
    const { email } = req.body;
    const { id } = req.params;

    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        // Check if the user already has an active booking for this campaign
        const [existing] = await pool.execute(
            "SELECT * FROM user_campaigns WHERE campaign_id = ? AND user_email = ? AND status = 'active'",
            [id, email.trim().toLowerCase()]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "You already booked this campaign" });
        }

        // Insert new active booking
        await pool.execute(
            "INSERT INTO user_campaigns (campaign_id, user_email, status) VALUES (?, ?, 'active')",
            [id, email.trim().toLowerCase()]
        );

        res.json({ success: true, message: "Campaign booked successfully!" });
    } catch (err) {
        console.error("Error booking campaign:", err);
        res.status(500).json({ message: "Server error booking campaign" });
    }
});


app.post("/api/campaigns/:id/cancel", async (req, res) => {
    const { email } = req.body;
    const { id } = req.params;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const [result] = await pool.execute(
            "UPDATE user_campaigns SET status = 'cancelled' WHERE campaign_id = ? AND user_email = ? AND status = 'active'",
            [id, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No active booking found for this user" });
        }

        res.json({ success: true, message: "Campaign booking cancelled successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error cancelling campaign" });
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

// -------------------------------------------------------------
// 🛑 SERVER START & 404
// -------------------------------------------------------------

// ✅ Catch-all 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// ✅ Start server
const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});