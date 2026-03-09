// ==========================================
// MAIN SERVER FILE - Express.js Setup
// This is the heart of our backend application
// ==========================================

const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Express application
const app = express();

// ==========================================
// MIDDLEWARE - Pre-process requests
// ==========================================

// Enable CORS (Cross-Origin Resource Sharing)
// This allows our frontend to communicate with backend API
app.use(cors());

// Parse JSON data from requests
// This converts incoming JSON to JavaScript objects
app.use(express.json());

// Serve static files from frontend folder
// This allows serving HTML, CSS, JS files
app.use(express.static(path.join(__dirname, '../frontend')));

// ==========================================
// IMPORT ROUTES
// Import all API endpoint files
// ==========================================

const authRoutes = require('./routes/auth');        // Login, Register
const roomRoutes = require('./routes/rooms');       // View rooms, room details
const bookingRoutes = require('./routes/bookings'); // Create, view bookings
const adminRoutes = require('./routes/admin');      // Admin functions
const { verifyToken } = require('./middleware/auth');

// ==========================================
// REGISTER ROUTES
// Define which URL paths use which routes
// ==========================================

// /api/auth/* - For login, register, logout (NO authentication required)
app.use('/api/auth', authRoutes);

// /api/rooms/* - For viewing rooms and prices (NO authentication required)
app.use('/api/rooms', roomRoutes);

// /api/bookings/* - For bookings (REQUIRES authentication)
app.use('/api/bookings', verifyToken, bookingRoutes);

// /api/admin/* - For admin operations (REQUIRES admin role)
app.use('/api/admin', adminRoutes);

// ==========================================
// ERROR HANDLING
// Catch any errors that occur in the app
// ==========================================

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('📚 API Documentation:');
  console.log('   - Login/Register: http://localhost:' + PORT + '/api/auth');
  console.log('   - Rooms: http://localhost:' + PORT + '/api/rooms');
  console.log('   - Bookings: http://localhost:' + PORT + '/api/bookings');
  console.log('   - Admin: http://localhost:' + PORT + '/api/admin');
});

module.exports = app;
