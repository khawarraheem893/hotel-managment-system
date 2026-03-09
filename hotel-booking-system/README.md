# 🏨 Hotel & Room Booking System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Quick Start Guide](#quick-start-guide)
3. [Database Schema Explanation](#database-schema-explanation)
4. [API Endpoints](#api-endpoints)
5. [Frontend Pages Guide](#frontend-pages-guide)
6. [Dynamic Pricing System](#dynamic-pricing-system)
7. [Authentication & Security](#authentication--security)
8. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is This Project?
A complete Hotel & Room Booking System with:
- **User registration and login**
- **Dynamic room pricing** (weekends & seasons)
- **Room booking functionality**
- **Admin panel** for managing rooms and pricing
- **Modern UI** with HTML, CSS, JavaScript
- **RESTful API** built with Node.js + Express
- **SQLite database** for data storage

### Technology Stack
```
Frontend:   HTML5, CSS3, JavaScript (Vanilla - No frameworks)
Backend:    Node.js + Express.js
Database:   SQLite3
Authentication: JWT (JSON Web Tokens)
Security:   bcryptjs for password hashing
```

---

## Quick Start Guide

### Step 1: Install Node.js
Download from: https://nodejs.org/
Choose the LTS (Long Term Support) version.

### Step 2: Navigate to Backend Folder
```bash
cd hotel-booking-system\backend
```

### Step 3: Install Dependencies
```bash
npm install
```

This installs all required packages:
- `express` - Web server framework
- `sqlite3` - Database driver
- `bcryptjs` - Password encryption
- `jsonwebtoken` - JWT authentication
- `cors` - Enable API access from frontend

### Step 4: Start the Server
```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:5000
```

### Step 5: Open Frontend in Browser
Navigate to:
```
http://localhost:5000/login.html
```

### Step 6: Create Test Account
Register a new user account with any email and password.

### Step 7: Create Admin Account (Database Edit)
To create an admin account, run this SQL in SQLite:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Database Schema Explanation

### Table 1: USERS
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique user ID |
| email | VARCHAR | Unique email address |
| password | VARCHAR | Hashed password (NEVER plain text!) |
| name | VARCHAR | User's full name |
| phone | VARCHAR | Phone number |
| role | VARCHAR | 'user' or 'admin' |
| created_at | DATETIME | Registration timestamp |
| updated_at | DATETIME | Last update timestamp |

**Example:**
```
id: 1
email: john@example.com
password: $2a$10$HASHED_PASSWORD_HERE
name: John Doe
role: user
```

### Table 2: ROOMS
Stores hotel room information.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique room ID |
| room_number | VARCHAR | Room number (e.g., "101") |
| room_type | VARCHAR | single/double/suite/deluxe |
| capacity | INTEGER | How many guests (1-10) |
| base_price | DECIMAL | Base price per night |
| description | TEXT | Amenities description |
| is_available | BOOLEAN | 1=available, 0=maintenance |
| created_at | DATETIME | Creation timestamp |

**Example:**
```
id: 1
room_number: 101
room_type: double
capacity: 2
base_price: 100.00
description: Comfortable double bed with ocean view
```

### Table 3: PRICING
Stores dynamic pricing rules (weekend & seasonal).

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique pricing rule ID |
| room_id | INTEGER | Which room (foreign key) |
| pricing_type | VARCHAR | 'weekend' or 'seasonal' |
| multiplier | DECIMAL | Price multiplier (1.5 = 150%) |
| start_date | DATE | Start date (for seasonal) |
| end_date | DATE | End date (for seasonal) |

**Examples:**

Weekend Pricing:
```
room_id: 1
pricing_type: weekend
multiplier: 1.5  (50% increase on Sat/Sun)
```

Seasonal Pricing (Holiday):
```
room_id: 1
pricing_type: seasonal
multiplier: 2.0  (100% increase)
start_date: 2026-12-20
end_date: 2026-12-31
```

### Table 4: BOOKINGS
Stores user room bookings.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique booking ID |
| user_id | INTEGER | Who booked (foreign key) |
| room_id | INTEGER | Which room (foreign key) |
| check_in_date | DATE | Check-in date |
| check_out_date | DATE | Check-out date |
| number_of_guests | INTEGER | Number of guests |
| total_price | DECIMAL | Calculated total price |
| booking_status | VARCHAR | pending/confirmed/cancelled |
| special_requests | TEXT | User's special requests |
| created_at | DATETIME | Booking timestamp |

**Example:**
```
id: 1
user_id: 1
room_id: 1
check_in_date: 2026-01-15
check_out_date: 2026-01-18
number_of_guests: 2
total_price: 350.00
booking_status: confirmed
```

### Table 5: PAYMENTS
Stores payment information for bookings.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Unique payment ID |
| booking_id | INTEGER | Which booking (foreign key) |
| amount | DECIMAL | Payment amount |
| payment_method | VARCHAR | credit_card/debit_card/cash |
| payment_status | VARCHAR | pending/completed/failed |
| transaction_id | VARCHAR | Unique transaction ID |
| paid_at | DATETIME | When payment was made |

---

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```
POST /api/auth/register
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1 234 567 8900"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "userId": 1
}
```

#### 2. Login User
```
POST /api/auth/login
```

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### 3. Get User Profile
```
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1 234 567 8900",
    "role": "user"
  }
}
```

---

### Room Endpoints

#### 1. Get All Rooms
```
GET /api/rooms
```

**Query Parameters:**
- `checkIn` - Check-in date (optional, format: 2026-01-15)
- `checkOut` - Check-out date (optional)

**Example:**
```
/api/rooms?checkIn=2026-01-15&checkOut=2026-01-18
```

**Response:**
```json
{
  "success": true,
  "rooms": [
    {
      "id": 1,
      "room_number": "101",
      "room_type": "double",
      "capacity": 2,
      "base_price": 100.00,
      "calculated_price": 150.00,
      "nights": 3,
      "description": "Comfortable double room"
    }
  ]
}
```

#### 2. Get Room Details
```
GET /api/rooms/:roomId?checkIn=2026-01-15&checkOut=2026-01-18
```

#### 3. Check Room Availability
```
GET /api/rooms/:roomId/availability?checkIn=2026-01-15&checkOut=2026-01-18
```

---

### Booking Endpoints (Requires Authentication)

#### 1. Create Booking
```
POST /api/bookings
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "roomId": 1,
  "checkInDate": "2026-01-15",
  "checkOutDate": "2026-01-18",
  "numberOfGuests": 2,
  "specialRequests": "High floor, quiet room"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "booking": {
    "id": 1,
    "roomId": 1,
    "checkInDate": "2026-01-15",
    "checkOutDate": "2026-01-18",
    "numberOfGuests": 2,
    "totalPrice": 350.00
  }
}
```

#### 2. Get My Bookings
```
GET /api/bookings
Headers: Authorization: Bearer <token>
```

#### 3. Cancel Booking
```
PUT /api/bookings/:bookingId
Headers: Authorization: Bearer <token>
```

**Request:**
```json
{
  "action": "cancel"
}
```

---

### Admin Endpoints (Requires Admin Role)

#### 1. Add Room
```
POST /api/admin/rooms
```

#### 2. Update Room
```
PUT /api/admin/rooms/:roomId
```

#### 3. Delete Room
```
DELETE /api/admin/rooms/:roomId
```

#### 4. Add Pricing Rule
```
POST /api/admin/pricing
```

**Request:**
```json
{
  "roomId": 1,
  "pricingType": "weekend",
  "multiplier": 1.5
}
```

#### 5. Get All Bookings
```
GET /api/admin/bookings
```

#### 6. Update Booking Status
```
PUT /api/admin/bookings/:bookingId
```

#### 7. Dashboard Statistics
```
GET /api/admin/stats
```

---

## Frontend Pages Guide

### 1. Login Page (`login.html`)
- **Purpose**: User registration and login
- **Features**:
  - Toggle between login and register forms
  - Form validation
  - Password hashing
  - Error handling

**Key Functions:**
- `toggleAuthForms()` - Switch between forms
- `handleLogin()` - Process login
- `handleRegister()` - Process registration

### 2. User Dashboard (`user-dashboard.html`)
- **Purpose**: User's main page after login
- **Shows**:
  - User welcome message
  - All bookings in a table
  - Quick actions (browse rooms, view bookings)
  - Cancel booking option

**Key Functions:**
- `loadUserProfile()` - Display user info
- `loadUserBookings()` - Load all bookings
- `cancelBooking()` - Cancel a booking

### 3. Browse Rooms (`rooms.html`)
- **Purpose**: Search and book rooms
- **Features**:
  - Date range picker
  - Dynamic pricing calculation
  - Room details and booking form
  - Modal popup for booking

**Key Functions:**
- `searchRooms()` - Search by dates
- `openRoomModal()` - Show booking form
- `confirmBooking()` - Create booking

### 4. Admin Dashboard (`admin-dashboard.html`)
- **Purpose**: Manage entire system
- **Tabs**:
  - Manage Bookings
  - Manage Rooms
  - Manage Pricing

**Key Functions:**
- `loadDashboardStats()` - Show statistics
- `addRoom()` - Add new room
- `deleteRoom()` - Delete room
- `addPricingRule()` - Add pricing rule
- `updateBookingStatus()` - Change booking status

---

## Dynamic Pricing System

### How It Works

The system automatically calculates prices based on:
1. **Base Price** - Set by admin
2. **Weekend Multiplier** - Applied to Saturdays & Sundays
3. **Seasonal Multiplier** - Applied to custom date ranges

### Pricing Examples

**Example 1: Weekend Booking**
```
Base Price: $100 per night
Weekend Multiplier: 1.5 (50% increase)

Booking: Jan 15 (Wed) - Jan 18 (Sat)
- Jan 15 (Wed): $100
- Jan 16 (Thu): $100
- Jan 17 (Fri): $100
- Jan 18 (Sat): $150 (weekend)
Total: $450
```

**Example 2: Holiday Season**
```
Base Price: $100 per night
Seasonal Multiplier: 2.0 (100% increase)
Holiday Period: Dec 20 - Dec 31

Booking: Dec 20 - Dec 23
- Dec 20 (holiday): $200
- Dec 21 (holiday): $200
- Dec 22 (holiday): $200
- Dec 23 (holiday): $200
Total: $800
```

### Setting Up Pricing Rules

**Via Admin Dashboard:**
1. Go to "Manage Pricing" tab
2. Select room
3. Choose pricing type (weekend or seasonal)
4. Enter multiplier
5. For seasonal: enter start and end dates
6. Click "Add Pricing Rule"

**Via Database SQL:**
```sql
-- Add weekend pricing (1.5x = 50% increase)
INSERT INTO pricing (room_id, pricing_type, multiplier)
VALUES (1, 'weekend', 1.5);

-- Add seasonal pricing (2.0x = 100% increase)
INSERT INTO pricing (room_id, pricing_type, multiplier, start_date, end_date)
VALUES (1, 'seasonal', 2.0, '2026-12-20', '2026-12-31');
```

---

## Authentication & Security

### JWT (JSON Web Tokens) Explanation

A JWT token is like a digital pass that proves you're logged in. It has three parts:
```
Header.Payload.Signature
```

**Example Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6MSwicm9sZSI6InVzZXIifQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### How Authentication Works

1. **User Logs In**
   - Send email & password to `/api/auth/login`
   - Server validates credentials
   - Server generates JWT token
   - Token sent to browser

2. **Token Stored in Browser**
   - JavaScript saves token in `localStorage`
   - Token persists even after page refresh

3. **Using Token for Requests**
   - When accessing protected endpoints (bookings, admin)
   - Frontend sends token in Authorization header
   - Server verifies token
   - Server processes request

4. **Token Structure in Header**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Password Security

**Why We Hash Passwords:**
- Never store plain text passwords
- If database is hacked, passwords are still safe
- bcryptjs makes passwords irreversible

**How bcryptjs Works:**
```
Plain Password: "password123"
         ↓
    bcryptjs (One-way encryption)
         ↓
Hashed: $2a$10$HASHED_PASSWORD_HERE

Even if hacked, attacker cannot recover original password
```

### User Roles

**User Role:**
- Can view rooms
- Can make bookings
- Can view own bookings
- Cannot access admin features

**Admin Role:**
- All user features
- Can add/edit/delete rooms
- Can manage pricing rules
- Can view all bookings
- Can change booking status

---

## File Structure Explained

```
hotel-booking-system/
│
├── backend/
│   ├── server.js              # Main server file (entry point)
│   ├── package.json           # Dependencies list
│   │
│   ├── middleware/
│   │   └── auth.js            # Authentication & authorization
│   │
│   ├── routes/
│   │   ├── auth.js            # Login/register endpoints
│   │   ├── rooms.js           # Room viewing endpoints
│   │   ├── bookings.js        # Booking endpoints
│   │   └── admin.js           # Admin management endpoints
│   │
│   ├── models/
│   │   └── database.js        # Database connection
│   │
│   └── utils/
│       └── pricing.js         # Dynamic pricing logic
│
├── frontend/
│   ├── login.html             # Login & register page
│   ├── user-dashboard.html    # User's main page
│   ├── rooms.html             # Browse & book rooms
│   ├── admin-dashboard.html   # Admin control panel
│   │
│   ├── css/
│   │   └── style.css          # Global styles
│   │
│   └── js/
│       └── utils.js           # Common JavaScript functions
│
└── database/
    ├── schema.sql             # Database structure
    └── hotel.db               # Actual database (created when server starts)
```

---

## Troubleshooting

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
cd backend
npm install
```

### Issue: "Error: EADDRINUSE :::5000"
Port 5000 is already in use.
**Solution:**
```bash
# Option 1: Kill process on port 5000
# Windows: netstat -ano | findstr :5000
# Then: taskkill /PID <PID> /F

# Option 2: Use different port
# Edit server.js: const PORT = 3000;
```

### Issue: "Database locked" error
SQLite database is locked.
**Solution:**
```bash
# Restart server
npm start
```

### Issue: Login not working
**Check:**
1. Backend server is running (`npm start`)
2. Database file exists (`backend/../database/hotel.db`)
3. Check browser console for errors (F12)
4. Verify email/password are correct

### Issue: Admin dashboard shows "Access denied"
**Solution:**
1. Update user role to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
2. Logout and login again

### Issue: Pricing not calculating correctly
**Check:**
1. Verify pricing rules exist: Check `pricing` table
2. Check dates are in correct format: YYYY-MM-DD
3. Verify multiplier values are correct
4. Restart server and try again

---

## Common Code Patterns

### Making an API Request
```javascript
// GET request
const response = await apiRequest('/api/rooms', 'GET', null, false);

// POST request with authentication
const response = await apiRequest('/api/bookings', 'POST', {
  roomId: 1,
  checkInDate: '2026-01-15'
}, true);
```

### Checking If User Is Logged In
```javascript
if (isLoggedIn()) {
  // User is logged in
} else {
  // Redirect to login
  window.location.href = 'login.html';
}
```

### Displaying Formatted Data
```javascript
// Format date
console.log(formatDate('2026-01-15')); // "Jan 15, 2026"

// Format currency
console.log(formatCurrency(100)); // "$100.00"

// Calculate nights
console.log(calculateNights('2026-01-15', '2026-01-18')); // 3
```

---

## Next Steps & Improvements

### To Make This Production-Ready:

1. **Security:**
   - Use HTTPS instead of HTTP
   - Store JWT_SECRET in environment variables
   - Add rate limiting
   - Add CSRF protection

2. **Features:**
   - Add payment gateway integration
   - Add email notifications
   - Add room images
   - Add reviews and ratings
   - Add room availability calendar

3. **Performance:**
   - Add caching
   - Optimize database queries
   - Add pagination for bookings

4. **Testing:**
   - Write unit tests
   - Write integration tests
   - Test on different browsers

5. **Deployment:**
   - Deploy backend to Heroku/Railway
   - Deploy frontend to Vercel/Netlify
   - Use MySQL instead of SQLite
   - Set up CI/CD pipeline

---

## Support & Questions

For help:
1. Check this documentation first
2. Check browser console (F12) for errors
3. Check server logs in terminal
4. Search online for specific error messages

---

**Created**: January 2026
**Last Updated**: January 11, 2026
**Version**: 1.0
