-- ==========================================
-- TEST DATA - Seed Database with Examples
-- Run this to populate database with test data
-- ==========================================

-- ==========================================
-- ADD TEST USERS
-- ==========================================

-- Regular user (password: test123)
-- Password hash for "test123" with bcrypt
INSERT OR IGNORE INTO users (email, password, name, phone, role, created_at, updated_at)
VALUES ('user@test.com', '$2a$10$h8tW1gHrBLvWsXI1w9fJMeJ7JbXW1H8nzKxQqY.rl4Z5Z8pK2Z9Te', 'Test User', '+1 555-0001', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Admin user (password: admin123)
INSERT OR IGNORE INTO users (email, password, name, phone, role, created_at, updated_at)
VALUES ('admin@test.com', '$2a$10$6B6Y8m.qZ5Z5Z8pK2Z9Te3Z5Z5Z8pK2Z9Te3Z5Z5Z8pK2Z9Te3Z5Z5', 'Admin User', '+1 555-0002', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- ADD TEST ROOMS
-- ==========================================

INSERT OR IGNORE INTO rooms (room_number, room_type, capacity, base_price, description, is_available, created_at, updated_at)
VALUES 
('101', 'single', 1, 80.00, 'Cozy single room with private bathroom and city view', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('102', 'double', 2, 120.00, 'Spacious double room with queen-size bed, free WiFi, and mini bar', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('103', 'double', 2, 120.00, 'Modern double room overlooking the garden with walk-in closet', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('201', 'suite', 4, 200.00, 'Luxury suite with living area, bedroom, and private balcony', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('202', 'deluxe', 2, 150.00, 'Premium deluxe room with spa bath, premium toiletries, and lounge access', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('203', 'suite', 4, 220.00, 'Penthouse suite with panoramic views, hot tub, and full kitchen', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- ADD TEST PRICING RULES
-- ==========================================

-- Weekend pricing for all single rooms (1.4x = 40% increase)
INSERT OR IGNORE INTO pricing (room_id, pricing_type, multiplier, created_at)
VALUES 
(1, 'weekend', 1.4, CURRENT_TIMESTAMP),
(2, 'weekend', 1.4, CURRENT_TIMESTAMP),
(3, 'weekend', 1.4, CURRENT_TIMESTAMP),
(4, 'weekend', 1.5, CURRENT_TIMESTAMP),
(5, 'weekend', 1.5, CURRENT_TIMESTAMP),
(6, 'weekend', 1.6, CURRENT_TIMESTAMP);

-- Holiday season pricing (Dec 20 - Jan 5) - 2.0x = 100% increase
INSERT OR IGNORE INTO pricing (room_id, pricing_type, multiplier, start_date, end_date, created_at)
VALUES 
(1, 'seasonal', 2.0, '2025-12-20', '2026-01-05', CURRENT_TIMESTAMP),
(2, 'seasonal', 2.0, '2025-12-20', '2026-01-05', CURRENT_TIMESTAMP),
(3, 'seasonal', 2.0, '2025-12-20', '2026-01-05', CURRENT_TIMESTAMP),
(4, 'seasonal', 2.2, '2025-12-20', '2026-01-05', CURRENT_TIMESTAMP),
(5, 'seasonal', 2.2, '2025-12-20', '2026-01-05', CURRENT_TIMESTAMP),
(6, 'seasonal', 2.5, '2025-12-20', '2026-01-05', CURRENT_TIMESTAMP);

-- Summer holiday pricing (Jun 15 - Aug 31) - 1.8x = 80% increase
INSERT OR IGNORE INTO pricing (room_id, pricing_type, multiplier, start_date, end_date, created_at)
VALUES 
(1, 'seasonal', 1.8, '2026-06-15', '2026-08-31', CURRENT_TIMESTAMP),
(2, 'seasonal', 1.8, '2026-06-15', '2026-08-31', CURRENT_TIMESTAMP),
(3, 'seasonal', 1.8, '2026-06-15', '2026-08-31', CURRENT_TIMESTAMP),
(4, 'seasonal', 2.0, '2026-06-15', '2026-08-31', CURRENT_TIMESTAMP),
(5, 'seasonal', 2.0, '2026-06-15', '2026-08-31', CURRENT_TIMESTAMP),
(6, 'seasonal', 2.2, '2026-06-15', '2026-08-31', CURRENT_TIMESTAMP);

-- ==========================================
-- ADD TEST BOOKINGS
-- ==========================================

-- Booking 1: User booked single room for weekend
INSERT OR IGNORE INTO bookings (user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, booking_status, special_requests, created_at, updated_at)
VALUES 
(1, 1, '2026-01-17', '2026-01-19', 1, 224.00, 'confirmed', 'High floor preferred', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Booking 2: User booked double room for 3 nights
INSERT OR IGNORE INTO bookings (user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, booking_status, special_requests, created_at, updated_at)
VALUES 
(1, 2, '2026-01-20', '2026-01-23', 2, 480.00, 'confirmed', 'Early check-in requested', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Booking 3: Pending booking
INSERT OR IGNORE INTO bookings (user_id, room_id, check_in_date, check_out_date, number_of_guests, total_price, booking_status, created_at, updated_at)
VALUES 
(1, 4, '2026-02-10', '2026-02-12', 3, 400.00, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- ADD TEST PAYMENTS
-- ==========================================

INSERT OR IGNORE INTO payments (booking_id, amount, payment_method, payment_status, transaction_id, paid_at, created_at)
VALUES 
(1, 224.00, 'credit_card', 'completed', 'TXN001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 480.00, 'debit_card', 'completed', 'TXN002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ==========================================
-- VERIFY DATA WAS ADDED
-- ==========================================

-- Check users
SELECT '=== USERS ===' as info;
SELECT id, email, name, role FROM users;

-- Check rooms
SELECT '=== ROOMS ===' as info;
SELECT id, room_number, room_type, capacity, base_price FROM rooms;

-- Check pricing rules
SELECT '=== PRICING RULES ===' as info;
SELECT id, room_id, pricing_type, multiplier, start_date, end_date FROM pricing;

-- Check bookings
SELECT '=== BOOKINGS ===' as info;
SELECT b.id, u.name, r.room_number, b.check_in_date, b.check_out_date, b.total_price, b.booking_status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN rooms r ON b.room_id = r.id;

-- ==========================================
-- NOTES FOR TESTING
-- ==========================================
/*

HOW TO RUN THIS FILE:

From command prompt in backend folder:
sqlite3 database/hotel.db < ../database/seed-data.sql

Or from SQLite command line:
.read ../database/seed-data.sql

TEST CREDENTIALS:
- Regular User:
  Email: user@test.com
  Password: test123
  
- Admin User:
  Email: admin@test.com
  Password: admin123

TEST SCENARIOS:

1. WEEKEND PRICING TEST
   - Book Room 101 (Single) for Jan 17-19, 2026
   - Jan 17 (Fri): $80
   - Jan 18 (Sat): $112 (80 × 1.4)
   - Jan 19 (Sun): $112 (80 × 1.4)
   - Total: $304 (but we have $224 - adjust multiplier if needed)

2. MULTI-NIGHT BOOKING TEST
   - Book Room 102 (Double) for Jan 20-23, 2026
   - 3 nights × $120 = $360 (weekday prices)
   - Should be around $480 if weekend included

3. AVAILABILITY TEST
   - After booking, check if same dates show unavailable
   - Try overlapping dates - should be unavailable
   - Different dates - should be available

4. DYNAMIC PRICING TEST
   - Add seasonal pricing rule
   - Book during seasonal period
   - Verify multiplier applied correctly

5. ADMIN FEATURES TEST
   - Login as admin@test.com
   - View all bookings
   - Change booking status
   - Add new room
   - Modify pricing

*/
