-- Supabase / PostgreSQL schema for CRM

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    password TEXT,
    crm_number TEXT NOT NULL UNIQUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    google_id TEXT,
    email_verification_token TEXT,
    email_verification_expires TIMESTAMP,
    role TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    phone_number TEXT,
    vin TEXT NOT NULL UNIQUE,
    license_plate TEXT NOT NULL UNIQUE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    vehicle_type TEXT NOT NULL,
    fuel_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    kilometers INTEGER NOT NULL DEFAULT 0,
    email TEXT NOT NULL REFERENCES users(email)
);

CREATE TABLE IF NOT EXISTS servicetype (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    Icon_name TEXT
);

CREATE TABLE IF NOT EXISTS branch (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS time_slots (
    start_time TIME NOT NULL PRIMARY KEY,
    quota INTEGER NOT NULL DEFAULT 20
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL REFERENCES users(email),
    booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    appointment_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled',
    servicetype_id INTEGER NOT NULL REFERENCES servicetype(id),
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
    branch_id INTEGER NOT NULL REFERENCES branch(id)
);

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    notify_email BOOLEAN NOT NULL DEFAULT FALSE,
    notify_sms BOOLEAN NOT NULL DEFAULT FALSE,
    notify_phone BOOLEAN NOT NULL DEFAULT FALSE,
    pref_weekly_digest BOOLEAN NOT NULL DEFAULT FALSE,
    pref_monthly_offers BOOLEAN NOT NULL DEFAULT FALSE,
    pref_service_reminders BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
    user_email TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_campaigns (
    id SERIAL PRIMARY KEY,
    campaign_title TEXT NOT NULL,
    description TEXT NOT NULL,
    maintenance_type TEXT NOT NULL,
    priority TEXT NOT NULL,
    brand_filter TEXT,
    model_filter TEXT,
    year_filter TEXT,
    discount_percent INTEGER,
    valid_until DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_campaigns (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES service_campaigns(id),
    user_email TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    UNIQUE(campaign_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_crm_number ON users(crm_number);
CREATE INDEX IF NOT EXISTS idx_vehicles_email ON vehicles(email);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_appointment_date ON bookings(appointment_date);
CREATE INDEX IF NOT EXISTS idx_service_campaigns_created_at ON service_campaigns(created_at);
