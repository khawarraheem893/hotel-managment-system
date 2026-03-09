# Quick Setup Guide - 5 Minutes to Running System

## Prerequisites
- Windows 10/11
- Node.js installed (download from https://nodejs.org/)

## Step-by-Step Setup

### Step 1: Open Command Prompt (3 seconds)
Press `Windows + R`, type `cmd`, press Enter

### Step 2: Navigate to Backend (5 seconds)
```
d:
cd projectdb\hotel-booking-system\backend
```

### Step 3: Install Dependencies (2 minutes)
```
npm install
```
Wait for all packages to download and install.

### Step 4: Start Server (5 seconds)
```
npm start
```

You should see:
```
✅ Connected to SQLite database
✅ Database schema initialized successfully
🚀 Server running on http://localhost:5000
```

**Leave this window open!** This is your server running.

### Step 5: Open Browser (5 seconds)
Open any web browser and go to:
```
http://localhost:5000/login.html
```

## First Time Usage

### Register a Test User
1. Click "Register here"
2. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 123-456-7890
   - Password: Test123456
3. Click "Register"
4. You're automatically logged in!

### Browse Rooms (No rooms yet - Let's add some!)

### Switch to Admin Panel
First, we need to make you an admin. Open another command prompt:

```
d:
cd projectdb\hotel-booking-system\backend
sqlite3 database/hotel.db
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
.quit
```

Then logout and login again. Now visit:
```
http://localhost:5000/admin-dashboard.html
```

### Add a Test Room
In Admin Dashboard:
1. Click "Manage Rooms" tab
2. Fill in the form:
   - Room Number: 101
   - Room Type: Double
   - Capacity: 2
   - Base Price: 100
   - Description: Comfortable double bed room
3. Click "Add Room"

### Add Pricing Rules
In Admin Dashboard:
1. Click "Manage Pricing" tab
2. Add Weekend Pricing:
   - Select Room: 101 - Double
   - Pricing Type: Weekend (Sat & Sun)
   - Multiplier: 1.5
   - Click "Add Pricing Rule"

### Book a Room
1. Logout from admin
2. Login as regular user (test@example.com)
3. Click "Browse Rooms"
4. Select dates (future dates):
   - Check-in: January 17, 2026 (Friday)
   - Check-out: January 19, 2026 (Sunday)
5. Click "Search Rooms"
6. You'll see Room 101 with dynamic pricing:
   - Friday: $100
   - Saturday: $150 (weekend)
   - Total: $250 for 2 nights
7. Click "Book Now"
8. Click "Confirm Booking"

### View Your Bookings
You're now back on Dashboard. Scroll down to "My Bookings" and see your booking!

---

## Project Structure at a Glance

```
hotel-booking-system/
│
├── backend/         ← Server code (Node.js)
│   ├── server.js   ← Runs when you do "npm start"
│   ├── routes/     ← API endpoints
│   └── database/   ← SQLite database file (auto-created)
│
├── frontend/       ← Website pages
│   ├── login.html  ← Where you start
│   ├── rooms.html  ← Browse and book
│   └── admin-dashboard.html ← Admin panel
│
└── database/
    └── schema.sql  ← Database structure
```

---

## Key Files Explained

| File | Purpose | What It Does |
|------|---------|--------------|
| `server.js` | Main server | Starts the API server on port 5000 |
| `routes/auth.js` | Login/Register | Handles user authentication |
| `routes/rooms.js` | Room API | Lists rooms and checks availability |
| `routes/bookings.js` | Booking API | Creates and manages bookings |
| `routes/admin.js` | Admin API | Admin functions for rooms & pricing |
| `utils/pricing.js` | Pricing Logic | Calculates dynamic prices |
| `login.html` | Front page | Where users login/register |
| `rooms.html` | Booking page | Users search and book rooms |
| `admin-dashboard.html` | Admin panel | Manage everything |
| `style.css` | Styling | Makes it look nice |
| `utils.js` | Helper functions | Common functions used everywhere |

---

## Common Commands

### Start Server
```
npm start
```

### Stop Server
```
Ctrl + C
```

### View Database
```
sqlite3 database/hotel.db
SELECT * FROM users;
SELECT * FROM bookings;
.quit
```

### Reset Everything (Start Fresh)
```
# Delete database
del database/hotel.db

# Restart server
npm start
```

---

## Testing Checklist

Use this checklist to test all features:

- [ ] **Authentication**
  - [ ] Register new user
  - [ ] Login with user
  - [ ] Logout
  - [ ] Token saved in browser

- [ ] **Rooms**
  - [ ] Add room as admin
  - [ ] View rooms as user
  - [ ] Check room details

- [ ] **Booking**
  - [ ] Search rooms by date
  - [ ] See dynamic pricing
  - [ ] Create booking
  - [ ] View booking in dashboard
  - [ ] Cancel booking

- [ ] **Pricing**
  - [ ] Add weekend pricing
  - [ ] Add seasonal pricing
  - [ ] Verify prices calculated correctly

- [ ] **Admin**
  - [ ] Login as admin
  - [ ] View all bookings
  - [ ] Change booking status
  - [ ] View dashboard stats

---

## Troubleshooting Quick Fixes

**Problem: "Port 5000 already in use"**
```
Change port in server.js:
const PORT = 3001;
```

**Problem: "Cannot find database"**
```
Just restart:
npm start
(It will create the database automatically)
```

**Problem: "Login fails"**
1. Check backend is running
2. Check email/password are correct
3. Open F12 in browser to see errors

**Problem: "Admin access denied"**
```
Make yourself admin:
sqlite3 database/hotel.db
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## What Happens When You Start the Server?

1. **Connects to Database**
   ```
   ✅ Connected to SQLite database
   ```

2. **Creates All Tables** (if they don't exist)
   ```
   ✅ Database schema initialized successfully
   ```

3. **Starts Server**
   ```
   🚀 Server running on http://localhost:5000
   ```

4. **Ready for Requests**
   - Frontend can now talk to backend
   - You can register and login
   - You can book rooms

---

## Frontend Pages Map

```
http://localhost:5000/
│
├── login.html
│   ├── Register → Creates new user
│   └── Login → Generates JWT token
│
├── user-dashboard.html (after login)
│   ├── Shows user's bookings
│   └── Quick links to browse rooms
│
├── rooms.html
│   ├── Search by dates
│   ├── View available rooms
│   └── Book a room
│
└── admin-dashboard.html (admin only)
    ├── View all bookings
    ├── Manage rooms
    └── Manage pricing
```

---

## API Calls Happen Automatically

You don't need to make API calls manually. The website does it automatically:

**Example Flow:**
```
1. User clicks "Login"
2. Website sends: POST /api/auth/login
3. Server validates password
4. Server returns JWT token
5. Website saves token in localStorage
6. User is logged in ✓

1. User searches for rooms
2. Website sends: GET /api/rooms?checkIn=...&checkOut=...
3. Server queries database + calculates dynamic prices
4. Website displays rooms to user

1. User clicks "Book Now"
2. Website sends: POST /api/bookings
3. Server verifies availability + calculates price
4. Booking created in database
5. Website shows confirmation ✓
```

---

## You're All Set! 🎉

Your Hotel Booking System is ready to use!

**Next Time You Want to Use It:**
```
1. Open command prompt
2. cd projectdb\hotel-booking-system\backend
3. npm start
4. Visit http://localhost:5000/login.html
```

---

**Questions?** Check the full [README.md](README.md) for detailed documentation.

**Happy Booking!** 🏨
