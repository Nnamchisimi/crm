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

// -------------------------------------------------------------
// ⚙️ DATABASE AND AUTH CLIENT SETUP
// -------------------------------------------------------------

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "123456789",
    database: process.env.DB_NAME || "CRM",
});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// -------------------------------------------------------------
// 🔒 MIDDLEWARE: verifyToken
// -------------------------------------------------------------

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided, access denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ message: "Invalid token, access denied" });
    }
};


// -------------------------------------------------------------
// 🏠 BASIC ROUTES
// -------------------------------------------------------------

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});


// -------------------------------------------------------------
// 🛠️ SERVICE ROUTES
// -------------------------------------------------------------

// GET /api/servicetype
app.get("/api/servicetype", verifyToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT id, label, cost, Icon_name FROM servicetype ORDER BY label"
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching service type:", err);
        res.status(500).json({ error: "Failed to fetch service type" });
    }
});

// GET /api/timeslots - Fetch available time slots for a given date, respecting the quota
app.get("/api/timeslots", verifyToken, async (req, res) => {
    const { date } = req.query; // Expected format: 'YYYY-MM-DD'

    if (!date) {
        return res.status(400).json({ error: "Date parameter is required." });
    }

    try {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

        // 1. Enforce Weekday Rule (Closed Saturday/Sunday)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return res.json([]); // Return empty array for weekends
        }

        // 2. Get the COUNT of booked appointments for EACH time slot on the given date
        const [bookedCounts] = await pool.query(
            `SELECT 
                TIME_FORMAT(appointment_date, '%H:%i') AS slot_time, 
                COUNT(*) AS booked_count
            FROM bookings 
            WHERE DATE(appointment_date) = ?
            GROUP BY slot_time`,
            [date]
        );
        
        // Convert bookedCounts array to a Map for O(1) lookup
        const bookedMap = new Map(bookedCounts.map(row => [row.slot_time, row.booked_count]));

        // 3. Get ALL possible slots and their QUOTA from the time_slots table
        const [allSlotsRows] = await pool.query(
            "SELECT TIME_FORMAT(start_time, '%H:%i') AS slot_time, quota FROM time_slots ORDER BY start_time"
        );

        // 4. Determine availability (quota logic)
        const allSlotsWithAvailability = allSlotsRows.map(row => {
            const slotTime = row.slot_time;
            const slotQuota = row.quota || 20; // Use DB quota, fallback to 20 if needed
            const bookedCount = bookedMap.get(slotTime) || 0;
            
            const remainingQuota = slotQuota - bookedCount;

            return {
                slot_time: slotTime,
                is_available: remainingQuota > 0,
                remaining_quota: remainingQuota, 
            };
        });

        // Return the structured data containing availability and remaining quota
        res.json(allSlotsWithAvailability);
    } catch (err) {
        console.error("Error fetching time slots:", err);
        res.status(500).json({ error: "Failed to fetch time slots." });
    }
});


// -------------------------------------------------------------
// 🚗 VEHICLE ROUTES
// -------------------------------------------------------------

// GET /api/vehicles - Fetch all vehicles for the logged-in user
app.get("/api/vehicles", verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        const [rows] = await pool.query(
            "SELECT v.*, u.crm_number FROM vehicles v LEFT JOIN users u ON v.email = u.email WHERE v.email = ? ORDER BY v.id DESC", 
            [userEmail]
        );
        res.json(rows); 
    } catch (err) {
        console.error("Error fetching vehicles:", err);
        res.status(500).json({ error: "Failed to fetch vehicles" });
    }
});


// GET /api/vehicles/:id - Fetch a single vehicle and relevant campaigns
app.get("/api/vehicles/:id", verifyToken, async (req, res) => {
    const { id } = req.params; 
    const userEmail = req.user.email;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: "Invalid vehicle ID format" });
    }

    try {
        // 1. Fetch Vehicle Details
        const [rows] = await pool.query(
            "SELECT v.*, u.crm_number, u.name as customerName FROM vehicles v LEFT JOIN users u ON v.email = u.email WHERE v.id = ? AND v.email = ?",
            [id, userEmail]
        );

        const vehicle = rows[0];

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found or access denied" });
        }

        // 2. Fetch Campaigns relevant to this vehicle and user
        const [campaignsRows] = await pool.query(`
            SELECT 
                sc.id,
                sc.campaign_title,
                sc.description,
                sc.priority,
                sc.discount_percent,
                sc.valid_until,
                CASE WHEN uc.user_email IS NOT NULL THEN 1 ELSE 0 END AS bookedByUser
            FROM service_campaigns sc
            LEFT JOIN user_campaigns uc
                ON sc.id = uc.campaign_id
                AND uc.user_email = ?
                AND uc.status = 'active'
            WHERE 
                (sc.brand_filter IS NULL OR sc.brand_filter = ?)
                AND (sc.model_filter IS NULL OR sc.model_filter = ?)
                AND (sc.year_filter IS NULL OR sc.year_filter = ?)
                AND sc.valid_until >= CURDATE()
            ORDER BY sc.priority DESC
        `, [userEmail, vehicle.brand, vehicle.model, vehicle.year]);


        // 3. Format and Attach Campaigns to the vehicle object
        vehicle.activeCampaigns = campaignsRows.map(c => ({
            id: c.id,
            title: c.campaign_title,
            description: c.description,
            priority: c.priority,
            discount: c.discount_percent ? `${c.discount_percent}% OFF` : null,
            validUntil: c.valid_until ? new Date(c.valid_until).toLocaleDateString("en-GB") : null,
            bookedByUser: !!c.bookedByUser
        })).filter(c => !c.bookedByUser); 
        
        // 4. Send the merged object
        res.json(vehicle);
    } catch (err) {
        console.error(`❌ Error fetching vehicle ${id}:`, err);
        res.status(500).json({ error: "Failed to fetch vehicle details and campaigns" });
    }
});


// POST /api/vehicles - Register a new vehicle
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
    } = req.body;

    const userEmail = req.user.email;

    if (
        !name || !surname || !phoneNumber || !vin || !licensePlate ||
        !brand || !model || !vehicleType || !fuelType || !year || !kilometers
    ) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check for duplicate VIN or license plate
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
            userEmail 
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
// 🗓️ BOOKING ROUTES (MODIFIED & EXTENDED)
// -------------------------------------------------------------

// -------------------------------------------------------------
// 🗓️ BOOKING ROUTES (MODIFIED & EXTENDED)
// -------------------------------------------------------------

// POST /api/bookings - Create a new appointment booking (uses logged-in user's name)
// POST /api/bookings - Create a new appointment booking (uses logged-in user's name)
app.post("/api/bookings", verifyToken, async (req, res) => {
    const customerEmail = req.user.email;


    // Build customer_name automatically using JWT data
    let customerName = "";
    if (req.user.name && req.user.surname) {
        customerName = `${req.user.name} ${req.user.surname}`;
    } else if (req.user.name) {
        customerName = req.user.name;
    } else if (req.user.surname) {
        customerName = req.user.surname;
    } else {
        customerName = "Unknown Customer";
    }

    const { vehicleId, serviceTypeId, appointmentDate, appointmentTime } = req.body;

    if (!vehicleId || !serviceTypeId || !appointmentDate || !appointmentTime) {
        return res.status(400).json({
            message: "Missing required booking details (vehicle, service, date, time)."
        });
    }

    const appointmentDateTime = `${appointmentDate} ${appointmentTime}:00`;
    const bookingDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    try {
        // Validate time slot quota
        const [slotQuota] = await pool.query(
            "SELECT quota FROM time_slots WHERE TIME_FORMAT(start_time, '%H:%i') = ?",
            [appointmentTime]
        );

        const quota = slotQuota[0]?.quota || 20;

        const [bookedCountResult] = await pool.query(
            `SELECT COUNT(*) AS booked_count 
             FROM bookings 
             WHERE DATE(appointment_date) = ? 
             AND TIME_FORMAT(appointment_date, '%H:%i') = ?`,
            [appointmentDate, appointmentTime]
        );

        if (bookedCountResult[0].booked_count >= quota) {
            return res.status(409).json({
                message: "The selected time slot is fully booked. Please choose another time."
            });
        }

        // Validate vehicle ownership
        const [vehicleCheck] = await pool.query(
            "SELECT id FROM vehicles WHERE id = ? AND email = ?",
            [vehicleId, customerEmail]
        );

        if (vehicleCheck.length === 0) {
            return res.status(403).json({
                message: "Vehicle not found or you don't have permission to book for this vehicle."
            });
        }

        // Insert booking
        const sql = `
            INSERT INTO bookings
            (customer_name, customer_email, booking_date, appointment_date, status, servicetype_id, vehicle_id)
            VALUES (?, ?, ?, ?, 'Scheduled', ?, ?)
        `;

        const [result] = await pool.execute(sql, [
            customerName,
            customerEmail,
            bookingDateTime,
            appointmentDateTime,
            serviceTypeId,
            vehicleId
        ]);

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            bookingId: result.insertId
        });

    } catch (error) {
        console.error("❌ Booking creation error:", error);
        res.status(500).json({
            message: "Failed to create booking.",
            error: error.message
        });
    }
});



// GET /api/bookings - Fetch all bookings for the logged-in user
app.get("/api/bookings", verifyToken, async (req, res) => {
    const customerEmail = req.user.email;
    try {
        const [rows] = await pool.query(
            `SELECT 
                b.booking_id, 
                b.appointment_date, 
                b.status, 
                v.license_plate, 
                v.brand, 
                v.model,
                s.label AS service_type 
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.id
            JOIN servicetype s ON b.servicetype_id = s.id
            WHERE b.customer_email = ?
            ORDER BY b.appointment_date DESC`,
            [customerEmail]
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Failed to fetch bookings." });
    }
});


// POST /api/bookings/:id/cancel - Cancel an existing booking
app.post("/api/bookings/:id/cancel", verifyToken, async (req, res) => {
    const bookingId = req.params.id;
    const customerEmail = req.user.email;

    try {
        const [result] = await pool.execute(
            "UPDATE bookings SET status = 'Cancelled' WHERE booking_id = ? AND customer_email = ? AND status = 'Scheduled'",
            [bookingId, customerEmail]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Booking not found, not scheduled, or not owned by the user." });
        }

        res.json({ success: true, message: `Booking ID ${bookingId} has been successfully cancelled.` });
    } catch (err) {
        console.error(`Error cancelling booking ${bookingId}:`, err);
        res.status(500).json({ error: "Failed to cancel booking." });
    }
});


// -------------------------------------------------------------
// 🔑 AUTH ROUTES
// -------------------------------------------------------------

// POST /api/auth/google
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
            
            [existing] = await pool.query(
                "SELECT * FROM users WHERE email = ?", 
                [email]
            );
        } else {
            console.log(`✅ Google user already exists: ${email}`);
        }

        const user = existing[0];

        // --- 2. GENERATE JWT ---
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role , name: user.name , surname : user.surname}, 
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "1h" }
        );

        console.log("✅ Google user logged in:", user.email,user.name,user.surname);

        // --- 3. SEND RESPONSE WITH JWT ---
        res.json({ 
            success: true, 
            token, 
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


// POST /api/auth/signup
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, surname, phoneNumber, email, username, password, is_verified } = req.body;

        if (!name || !surname || !email || !username || (!password && !is_verified)) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const [existing] = await pool.query(
            "SELECT * FROM users WHERE email = ? OR username = ?",
            [email, username]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        let hashedPassword = null;
        if (password) {
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


// POST /api/auth/signin
app.post("/api/auth/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("🔍 Signin request:", req.body);

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = users[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name, surname: user.surname }, 
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "1h" }
        );

        console.log("✅ User logged in:", user.email, user.name, user.surname);

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


// -------------------------------------------------------------
// 📢 CAMPAIGN & NEWSLETTER ROUTES
// -------------------------------------------------------------

// POST /api/newsletter - Subscribe/Update newsletter preferences
app.post("/api/newsletter", async (req, res) => {
    try {
        const { email, phone, notifications, preferences } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

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

// POST /api/newsletter/send - Admin route to send a newsletter to all subscribers
app.post("/api/newsletter/send", async (req, res) => {
    const { subject, content } = req.body;

    try {
        const [subscribers] = await pool.query("SELECT email FROM newsletter_subscriptions");

        subscribers.forEach(user => {
            console.log(`Sending newsletter to ${user.email}`);
        });

        // Log notification for each user (simulating email sending)
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

// GET /api/campaigns - Fetch all campaigns and check user booking status
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


// POST /api/campaigns/:id/book - Book a specific campaign for a user
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


// POST /api/campaigns/:id/cancel - Cancel a campaign booking
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


// POST /api/campaigns - Create a new campaign (Admin use)
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

// Catch-all 404 handler for any undefined routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});