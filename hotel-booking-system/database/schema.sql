-- ==========================================
-- Hotel & Room Booking System Database
-- This file contains all database tables
-- ==========================================

-- ==========================================
-- TABLE 1: USERS (Stores user information)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- User's unique identifier (auto-incremented)
    
    email VARCHAR(255) UNIQUE NOT NULL,
    -- Email address (must be unique, required)
    
    password VARCHAR(255) NOT NULL,
    -- Hashed password (never store plain text!)
    
    name VARCHAR(255) NOT NULL,
    -- User's full name
    
    phone VARCHAR(20),
    -- User's phone number
    
    role VARCHAR(50) DEFAULT 'user',
    -- Role: 'user' or 'admin' (determines access level)
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- Timestamp when user registered
    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    -- Timestamp when user info was last updated
);

-- ==========================================
-- TABLE 2: ROOMS (Stores room information)
-- ==========================================
CREATE TABLE IF NOT EXISTS rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Room's unique identifier
    
    room_number VARCHAR(10) UNIQUE NOT NULL,
    -- Room number (e.g., "101", "205")
    
    room_type VARCHAR(50) NOT NULL,
    -- Type: 'single', 'double', 'suite', 'deluxe'
    
    capacity INTEGER NOT NULL,
    -- How many people can stay (e.g., 1, 2, 4)
    
    base_price DECIMAL(10, 2) NOT NULL,
    -- Base price per night (before any markup)
    
    description TEXT,
    -- Room description (amenities, features)
    
    is_available BOOLEAN DEFAULT 1,
    -- 1 = available, 0 = not available (maintenance, etc.)
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE 3: PRICING (Dynamic pricing rules)
-- ==========================================
CREATE TABLE IF NOT EXISTS pricing (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Pricing rule identifier
    
    room_id INTEGER NOT NULL,
    -- Which room this pricing applies to (link to rooms table)
    
    pricing_type VARCHAR(50) NOT NULL,
    -- Type: 'weekend' or 'seasonal'
    -- 'weekend': applies to Saturdays & Sundays
    -- 'seasonal': applies to specific date ranges
    
    multiplier DECIMAL(3, 2) NOT NULL,
    -- Price multiplier (e.g., 1.5 = 150% = 50% increase)
    -- Example: base_price = $100, multiplier = 1.5 → $150
    
    start_date DATE,
    -- Start date for seasonal pricing (NULL if not needed)
    
    end_date DATE,
    -- End date for seasonal pricing (NULL if not needed)
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    -- If a room is deleted, delete its pricing rules too
);

-- ==========================================
-- TABLE 4: BOOKINGS (User bookings)
-- ==========================================
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Booking identifier
    
    user_id INTEGER NOT NULL,
    -- Which user made this booking (link to users table)
    
    room_id INTEGER NOT NULL,
    -- Which room is booked (link to rooms table)
    
    check_in_date DATE NOT NULL,
    -- Check-in date (e.g., 2026-01-15)
    
    check_out_date DATE NOT NULL,
    -- Check-out date (e.g., 2026-01-18)
    
    number_of_guests INTEGER NOT NULL,
    -- How many people will stay
    
    total_price DECIMAL(10, 2) NOT NULL,
    -- Total cost (calculated with dynamic pricing)
    
    booking_status VARCHAR(50) DEFAULT 'confirmed',
    -- Status: 'pending', 'confirmed', 'cancelled'
    
    special_requests TEXT,
    -- User's special requests (e.g., high floor, quiet room)
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- ==========================================
-- TABLE 5: PAYMENTS (Payment transactions)
-- ==========================================
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Payment identifier
    
    booking_id INTEGER NOT NULL,
    -- Which booking this payment is for (link to bookings table)
    
    amount DECIMAL(10, 2) NOT NULL,
    -- Payment amount
    
    payment_method VARCHAR(50) NOT NULL,
    -- Method: 'credit_card', 'debit_card', 'bank_transfer', 'cash'
    
    payment_status VARCHAR(50) DEFAULT 'pending',
    -- Status: 'pending', 'completed', 'failed'
    
    transaction_id VARCHAR(255) UNIQUE,
    -- Unique transaction ID from payment gateway
    
    paid_at DATETIME,
    -- When payment was completed
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- ==========================================
-- CREATE INDEXES for faster queries
-- ==========================================
-- Searching by email is very common, so index it
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Finding rooms by type and availability is common
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(is_available);

-- Finding bookings by user and date is common
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(check_in_date, check_out_date);

-- Finding payments by status is common
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
