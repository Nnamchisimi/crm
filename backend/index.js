require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const { OAuth2Client } = require("google-auth-library");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    lookup: (hostname, options, callback) => {
        dns.lookup(hostname, { family: 4 }, callback);
    }
});

pool.on("connect", () => {
    console.log("✅ Connected to Supabase PostgreSQL");
});

pool.on("error", (err) => {
    console.error("PostgreSQL Pool Error:", err);
});

const queryWithRetry = async (sql, params) => {
    try {
        const result = await pool.query(sql, params);
        return result.rows;
    } catch (err) {
        if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
            const result = await pool.query(sql, params);
            return result.rows;
        }
        throw err;
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

app.get("/", (req, res) => {
    res.send("Backend is running!");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date() });
});

app.get("/api/servicetype", verifyToken, async (req, res) => {
    try {
        const rows = await queryWithRetry(
            "SELECT id, label, cost, Icon_name FROM servicetype ORDER BY label"
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching service type:", err);
        res.status(500).json({ error: "Failed to fetch service type" });
    }
});

app.post("/api/servicetype", verifyToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    try {
        const { label, cost, Icon_name } = req.body;
        if (!label) return res.status(400).json({ error: "Service label is required" });

        const result = await pool.query(
            "INSERT INTO servicetype (label, cost, Icon_name) VALUES ($1, $2, $3) RETURNING id, label, cost, Icon_name",
            [label, cost || 0, Icon_name || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating service type:", err);
        res.status(500).json({ error: "Failed to create service type" });
    }
});

app.put("/api/servicetype/:id", verifyToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    try {
        const { id } = req.params;
        const { label, cost, Icon_name } = req.body;
        if (!label) return res.status(400).json({ error: "Service label is required" });

        const result = await pool.query(
            "UPDATE servicetype SET label = $1, cost = $2, Icon_name = $3 WHERE id = $4 RETURNING id, label, cost, Icon_name",
            [label, cost || 0, Icon_name || null, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Service type not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating service type:", err);
        res.status(500).json({ error: "Failed to update service type" });
    }
});

app.delete("/api/servicetype/:id", verifyToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM servicetype WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Service type not found" });
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting service type:", err);
        res.status(500).json({ error: "Failed to delete service type" });
    }
});

app.get("/api/branch", verifyToken, async (req, res) => {
    try {
        const rows = await queryWithRetry(
            "SELECT id, name FROM branch ORDER BY id"
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching branches:", err);
        res.status(500).json({ error: "Failed to fetch branches" });
    }
});

app.post("/api/branch", verifyToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Branch name is required" });

        const result = await pool.query(
            "INSERT INTO branch (name) VALUES ($1) RETURNING id, name",
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Error creating branch:", err);
        res.status(500).json({ error: "Failed to create branch" });
    }
});

app.put("/api/branch/:id", verifyToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Branch name is required" });

        const result = await pool.query(
            "UPDATE branch SET name = $1 WHERE id = $2 RETURNING id, name",
            [name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Branch not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error("Error updating branch:", err);
        res.status(500).json({ error: "Failed to update branch" });
    }
});

app.delete("/api/branch/:id", verifyToken, async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
    }
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM branch WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Branch not found" });
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting branch:", err);
        res.status(500).json({ error: "Failed to delete branch" });
    }
});

app.get("/api/timeslots", verifyToken, async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: "Date parameter is required." });
    }

    try {
        const dateObj = new Date(date);
        const dayOfWeek = dateObj.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return res.json([]);
        }

        const bookedCounts = await queryWithRetry(
            `SELECT 
                TO_CHAR(appointment_date, 'HH24:MI') AS slot_time, 
                COUNT(*) AS booked_count
            FROM bookings 
            WHERE DATE(appointment_date) = $1
            GROUP BY slot_time`,
            [date]
        );

        const bookedMap = new Map(bookedCounts.map(row => [row.slot_time, row.booked_count]));

        const allSlotsRows = await queryWithRetry(
            "SELECT TO_CHAR(start_time, 'HH24:MI') AS slot_time, quota FROM time_slots ORDER BY start_time"
        );

        const allSlotsWithAvailability = allSlotsRows.map(row => {
            const slotTime = row.slot_time;
            const slotQuota = row.quota || 20;
            const bookedCount = bookedMap.get(slotTime) || 0;

            const remainingQuota = slotQuota - bookedCount;

            return {
                slot_time: slotTime,
                is_available: remainingQuota > 0,
                remaining_quota: remainingQuota,
            };
        });

        res.json(allSlotsWithAvailability);
    } catch (err) {
        console.error("Error fetching time slots:", err);
        res.status(500).json({ error: "Failed to fetch time slots." });
    }
});

app.get("/api/vehicles", verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        const rows = await queryWithRetry(
            "SELECT v.*, u.crm_number FROM vehicles v LEFT JOIN users u ON v.email = u.email WHERE v.email = $1 ORDER BY v.id DESC",
            [userEmail]
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching vehicles:", err);
        res.status(500).json({ error: "Failed to fetch vehicles" });
    }
});

app.get("/api/vehicles/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const userEmail = req.user.email;

    if (isNaN(parseInt(id))) {
        return res.status(400).json({ message: "Invalid vehicle ID format" });
    }

    try {
        const rows = await queryWithRetry(
            "SELECT v.*, u.crm_number, u.name as customerName FROM vehicles v LEFT JOIN users u ON v.email = u.email WHERE v.id = $1 AND v.email = $2",
            [id, userEmail]
        );

        const vehicle = rows[0];

        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found or access denied" });
        }

        const campaignsRows = await queryWithRetry(
            `SELECT 
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
                AND uc.user_email = $1
                AND uc.status = 'active'
            WHERE 
                (sc.brand_filter IS NULL OR sc.brand_filter = $2)
                AND (sc.model_filter IS NULL OR sc.model_filter = $3)
                AND (sc.year_filter IS NULL OR sc.year_filter = $4)
                AND sc.valid_until >= CURRENT_DATE
            ORDER BY sc.priority DESC`,
            [userEmail, vehicle.brand, vehicle.model, vehicle.year]
        );

        vehicle.activeCampaigns = campaignsRows.map(c => ({
            id: c.id,
            title: c.campaign_title,
            description: c.description,
            priority: c.priority,
            discount: c.discount_percent ? `${c.discount_percent}% OFF` : null,
            validUntil: c.valid_until ? new Date(c.valid_until).toLocaleDateString("en-GB") : null,
            bookedByUser: !!c.bookedByUser
        })).filter(c => !c.bookedByUser);

        res.json(vehicle);
    } catch (err) {
        console.error(`❌ Error fetching vehicle ${id}:`, err);
        res.status(500).json({ error: "Failed to fetch vehicle details and campaigns" });
    }
});

app.put("/api/vehicles/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const userEmail = req.user.email;
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

    if (!name || !surname || !licensePlate || !brand || !model || !vehicleType || !fuelType || !year || kilometers === undefined) {
        return res.status(400).json({ message: "Missing required fields for update." });
    }

    try {
        const result = await pool.query(
            `UPDATE vehicles
            SET 
                name = $1, 
                surname = $2, 
                phone_number = $3, 
                vin = $4, 
                license_plate = $5, 
                brand = $6, 
                model = $7, 
                vehicle_type = $8, 
                fuel_type = $9, 
                year = $10, 
                kilometers = $11
            WHERE id = $12 AND email = $13`,
            [
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
                id,
                userEmail
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Vehicle not found or update unauthorized." });
        }

        const updatedRows = await queryWithRetry(
            "SELECT v.*, u.crm_number FROM vehicles v LEFT JOIN users u ON v.email = u.email WHERE v.id = $1",
            [id]
        );

        res.json(updatedRows[0]);

    } catch (error) {
        console.error(`❌ Vehicle update error for ID ${id}:`, error);
        res.status(500).json({
            message: error.message || "Internal server error during update"
        });
    }
});

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
        const existing = await queryWithRetry(
            "SELECT * FROM vehicles WHERE vin = $1 OR license_plate = $2",
            [vin, licensePlate]
        );

        if (existing.length > 0) {
            return res
                .status(400)
                .json({ message: "Vehicle with this VIN or license plate already exists" });
        }

        const result = await pool.query(
            `INSERT INTO vehicles
            (name, surname, phone_number, vin, license_plate, brand, model, vehicle_type, fuel_type, year, kilometers, email)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id`,
            [
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
            ]
        );

        res.status(201).json({
            message: "Vehicle registered successfully!",
            vehicleId: result.rows[0].id
        });
    } catch (error) {
        console.error("❌ Vehicle insert error:", error);
        res.status(500).json({
            message: error.message || "Internal server error"
        });
    }
});

app.post("/api/bookings", verifyToken, async (req, res) => {
    const customerEmail = req.user.email;

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

    const { vehicleId, serviceTypeId, branchId, appointmentDate, appointmentTime } = req.body;

    if (!vehicleId || !serviceTypeId || !branchId || !appointmentDate || !appointmentTime) {
        return res.status(400).json({
            message: "Missing required booking details (vehicle, service, branch, date, time)."
        });
    }

    const appointmentDateTime = `${appointmentDate} ${appointmentTime}:00`;
    const bookingDateTime = new Date().toISOString().slice(0, 19).replace("T", " ");

    try {
        const slotQuota = await queryWithRetry(
            "SELECT quota FROM time_slots WHERE TO_CHAR(start_time, 'HH24:MI') = $1",
            [appointmentTime]
        );

        const quota = slotQuota[0]?.quota || 20;

        const bookedCountResult = await queryWithRetry(
            `SELECT COUNT(*) AS booked_count 
            FROM bookings 
            WHERE DATE(appointment_date) = $1 
            AND TO_CHAR(appointment_date, 'HH24:MI') = $2`,
            [appointmentDate, appointmentTime]
        );

        if (bookedCountResult[0].booked_count >= quota) {
            return res.status(409).json({
                message: "The selected time slot is fully booked. Please choose another time."
            });
        }

        const vehicleCheck = await queryWithRetry(
            "SELECT id FROM vehicles WHERE id = $1 AND email = $2",
            [vehicleId, customerEmail]
        );

        if (vehicleCheck.length === 0) {
            return res.status(403).json({
                message: "Vehicle not found or you don't have permission to book for this vehicle."
            });
        }

        const result = await pool.query(
            `INSERT INTO bookings
            (customer_name, customer_email, booking_date, appointment_date, status, servicetype_id, vehicle_id, branch_id)
            VALUES ($1, $2, $3, $4, 'Scheduled', $5, $6, $7)
            RETURNING booking_id`,
            [
                customerName,
                customerEmail,
                bookingDateTime,
                appointmentDateTime,
                serviceTypeId,
                vehicleId,
                branchId
            ]
        );

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            bookingId: result.rows[0].booking_id
        });

    } catch (error) {
        console.error("❌ Booking creation error:", error);
        res.status(500).json({
            message: "Failed to create booking.",
            error: error.message
        });
    }
});

app.get("/api/bookings", verifyToken, async (req, res) => {
    const customerEmail = req.user.email;
    try {
        const rows = await queryWithRetry(
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
            JOIN branch br ON b.branch_id = br.id
            WHERE b.customer_email = $1
            ORDER BY b.appointment_date DESC`,
            [customerEmail]
        );
        res.json(rows);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ error: "Failed to fetch bookings." });
    }
});

app.post("/api/bookings/:id/cancel", verifyToken, async (req, res) => {
    const bookingId = req.params.id;
    const customerEmail = req.user.email;

    try {
        const result = await pool.query(
            "UPDATE bookings SET status = 'Cancelled' WHERE booking_id = $1 AND customer_email = $2 AND status = 'Scheduled'",
            [bookingId, customerEmail]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Booking not found, not scheduled, or not owned by the user." });
        }

        res.json({ success: true, message: `Booking ID ${bookingId} has been successfully cancelled.` });
    } catch (err) {
        console.error(`Error cancelling booking ${bookingId}:`, err);
        res.status(500).json({ error: "Failed to cancel booking." });
    }
});

app.post("/api/auth/google", async (req, res) => {
    try {
        const { id_token } = req.body;
        if (!id_token) return res.status(400).json({ message: "Missing Google ID token" });

        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const google_id = payload.sub;
        const email = payload.email;
        const name = payload.given_name || "";
        const surname = payload.family_name || "";

        const existingUsers = await queryWithRetry("SELECT * FROM users WHERE email = $1", [email]);

        let user;

        if (existingUsers.length === 0) {
            const baseUsername = email.split("@")[0].toLowerCase();
            let username = baseUsername;
            let counter = 1;
            while (true) {
                const rows = await queryWithRetry("SELECT id FROM users WHERE username = $1", [username]);
                if (rows.length === 0) break;
                username = `${baseUsername}${counter++}`;
            }

            const generateRandomCRMNumber = async () => {
                let crmNumber;
                let isUnique = false;
                while (!isUnique) {
                    const randomNum = Math.floor(Math.random() * 99999) + 1;
                    crmNumber = `CRM-${String(randomNum).padStart(5, "0")}`;
                    const rows = await queryWithRetry("SELECT id FROM users WHERE crm_number = $1", [crmNumber]);
                    if (rows.length === 0) isUnique = true;
                }
                return crmNumber;
            };
            const crmNumber = await generateRandomCRMNumber();

            const result = await pool.query(
                `INSERT INTO users 
                (name, surname, username, email, google_id, is_verified, crm_number)
                VALUES ($1, $2, $3, $4, $5, TRUE, $6)
                RETURNING id`,
                [name, surname, username, email, google_id, crmNumber]
            );

            const createdUser = await queryWithRetry("SELECT * FROM users WHERE id = $1", [result.rows[0].id]);
            user = createdUser[0];
            console.log("🆕 Google user created with CRM:", crmNumber, email);

        } else {
            user = existingUsers[0];

            if (!user.google_id) {
                await pool.query(
                    "UPDATE users SET google_id = $1, is_verified = TRUE WHERE id = $2",
                    [google_id, user.id]
                );
                user.google_id = google_id;
                user.is_verified = true;
                console.log("🔗 Google linked to existing user:", email);
            } else {
                console.log("✅ Google login successful:", email);
            }
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "1h" }
        );

        res.json({
            success: true,
            token,
            crm_number: user.crm_number,
            user: {
                id: user.id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error("❌ Google login error:", error);
        res.status(500).json({ message: "Google login failed" });
    }
});

const crypto = require("crypto");

app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, surname, phoneNumber, email, username, password } = req.body;

        if (!name || !surname || !email || !username || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existing = await queryWithRetry(
            "SELECT id FROM users WHERE email = $1 OR username = $2",
            [email, username]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const generateRandomCRMNumber = async () => {
            let crmNumber;
            let isUnique = false;

            while (!isUnique) {
                const randomNum = Math.floor(Math.random() * 99999) + 1;
                crmNumber = `CRM-${String(randomNum).padStart(5, "0")}`;

                const rows = await queryWithRetry(
                    "SELECT id FROM users WHERE crm_number = $1",
                    [crmNumber]
                );
                if (rows.length === 0) isUnique = true;
            }

            return crmNumber;
        };

        const crmNumber = await generateRandomCRMNumber();

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        const result = await pool.query(
            `INSERT INTO users 
            (name, surname, username, email, phone_number, password, crm_number, is_verified, email_verification_token, email_verification_expires)
            VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9)
            RETURNING id`,
            [name, surname, username, email, phoneNumber || null, hashedPassword, crmNumber, token, expires]
        );

        const verifyUrl = `${process.env.FRONTEND_URL}/#/verify-email?token=${token}`;

        try {
            await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL || process.env.EMAIL_USER,
                to: email,
                subject: "Verify your email",
                html: `
                    <h3>Verify your email</h3>
                    <p>Please click the link below to activate your account:</p>
                    <a href="${verifyUrl}">Verify Email</a>
                    <p>This link expires in 1 hour.</p>
                `
            });
            console.log("✅ Verification email sent to:", email);
        } catch (err) {
            console.error("⚠️ Failed to send verification email:", err);
            await pool.query(
                `UPDATE users SET is_verified = TRUE WHERE email = $1`,
                [email]
            );
            console.log("⚠️ User marked as verified due to email failure:", email);
        }

        res.status(201).json({
            success: true,
            message: "Signup successful. Please check your email to verify your account.",
            crm_number: crmNumber
        });

    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/auth/verify-email", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ message: "Missing token" });
    }

    const users = await queryWithRetry(
        `SELECT id, is_verified, email_verification_expires
        FROM users
        WHERE email_verification_token = $1`,
        [token]
    );

    if (users.length === 0) {
        return res.status(400).json({ message: "Invalid verification token" });
    }

    const user = users[0];

    if (user.is_verified) {
        return res.status(400).json({ message: "Email already verified" });
    }

    if (new Date(user.email_verification_expires) < new Date()) {
        return res.status(400).json({ message: "Verification link expired" });
    }

    await pool.query(
        `UPDATE users
        SET is_verified = TRUE,
            email_verification_token = NULL,
            email_verification_expires = NULL
        WHERE id = $1`,
        [user.id]
    );

    res.json({ success: true, message: "Email verified successfully" });
});

app.post("/api/auth/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const users = await queryWithRetry(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = users[0];

        if (!user.is_verified) {
            return res.status(403).json({
                message: "Please verify your email before logging in"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                surname: user.surname
            },
            process.env.JWT_SECRET || "supersecretkey",
            { expiresIn: "1h" }
        );

        res.json({
            success: true,
            token,
            role: user.role,
            email: user.email,
            name: user.name,
            surname: user.surname
        });

    } catch (err) {
        console.error(" SIGNIN ERROR:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/newsletter", async (req, res) => {
    try {
        const { email, phone, notifications, preferences } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        await pool.query(
            `INSERT INTO newsletter_subscriptions 
            (email, phone, notify_email, notify_sms, notify_phone, pref_weekly_digest, pref_monthly_offers, pref_service_reminders)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (email) DO UPDATE SET
                phone = EXCLUDED.phone,
                notify_email = EXCLUDED.notify_email,
                notify_sms = EXCLUDED.notify_sms,
                notify_phone = EXCLUDED.notify_phone,
                pref_weekly_digest = EXCLUDED.pref_weekly_digest,
                pref_monthly_offers = EXCLUDED.pref_monthly_offers,
                pref_service_reminders = EXCLUDED.pref_service_reminders,
                updated_at = CURRENT_TIMESTAMP`,
            [
                email,
                phone || null,
                notifications.email ? true : false,
                notifications.sms ? true : false,
                notifications.phone ? true : false,
                preferences.weeklyDigest ? true : false,
                preferences.monthlyOffers ? true : false,
                preferences.reminders ? true : false,
            ]
        );

        res.status(201).json({ success: true, message: "Subscribed successfully!" });
    } catch (err) {
        console.error("Newsletter subscription error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/newsletter/send", async (req, res) => {
    const { subject, content } = req.body;

    try {
        const subscribers = await queryWithRetry("SELECT email FROM newsletter_subscriptions");

        subscribers.forEach(user => {
            console.log(`Sending newsletter to ${user.email}`);
        });

        for (const user of subscribers) {
            await queryWithRetry(
                "INSERT INTO notifications (user_email, type, title, message) VALUES ($1, 'Newsletter', $2, $3)",
                [user.email, subject, content]
            );
        }

        res.json({ success: true, count: subscribers.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send newsletter" });
    }
});

app.get("/api/campaigns", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "User email is required" });
    }

    try {
        const rows = await queryWithRetry(
            `SELECT 
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
                AND uc.user_email = $1
                AND uc.status = 'active'
            ORDER BY sc.created_at DESC`,
            [email]
        );

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
        const existing = await queryWithRetry(
            "SELECT * FROM user_campaigns WHERE campaign_id = $1 AND user_email = $2 AND status = 'active'",
            [id, email.trim().toLowerCase()]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: "You already booked this campaign" });
        }

        await pool.query(
            "INSERT INTO user_campaigns (campaign_id, user_email, status) VALUES ($1, $2, 'active')",
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
        const result = await pool.query(
            "UPDATE user_campaigns SET status = 'cancelled' WHERE campaign_id = $1 AND user_email = $2 AND status = 'active'",
            [id, email]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "No active booking found for this user" });
        }

        res.json({ success: true, message: "Campaign booking cancelled successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error cancelling campaign" });
    }
});

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

    if (!campaign_title || !description || !maintenance_type || !priority) {
        return res.status(400).json({ message: "Required fields missing." });
    }

    try {
        const result = await pool.query(
            `INSERT INTO service_campaigns 
            (campaign_title, description, maintenance_type, priority, brand_filter, model_filter, year_filter, discount_percent, valid_until)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id`,
            [
                campaign_title,
                description,
                maintenance_type,
                priority,
                brand_filter || null,
                model_filter || null,
                year_filter || null,
                discount_percent || null,
                valid_until || null,
            ]
        );

        res.status(201).json({
            message: "Campaign created successfully!",
            id: result.rows[0].id,
        });
    } catch (error) {
        console.error(" Campaign insert error:", error);
        res.status(500).json({
            message: error.message || "Internal server error",
        });
    }
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
