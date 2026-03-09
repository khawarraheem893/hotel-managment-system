// ==========================================
// AUTHENTICATION ROUTES
// Handles: Login, Register, Token generation
// ==========================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const { JWT_SECRET } = require('../middleware/auth');

// ==========================================
// ROUTE: POST /api/auth/register
// Register a new user
// ==========================================
router.post('/register', (req, res) => {
  // Extract data from request body
  const { email, password, name, phone } = req.body;

  // Validate input
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, and name are required'
    });
  }

  // Password strength validation (at least 6 characters)
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  // Hash the password using bcrypt
  // bcrypt makes it impossible to reverse-engineer the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error hashing password'
      });
    }

    // Insert new user into database
    const sql = `
      INSERT INTO users (email, password, name, phone, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;

    db.run(sql, [email, hashedPassword, name, phone], function(err) {
      if (err) {
        // If email already exists, this error will occur
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({
            success: false,
            message: 'Email already registered'
          });
        }
        return res.status(500).json({
          success: false,
          message: 'Error registering user'
        });
      }

      // User created successfully
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        userId: this.lastID
      });
    });
  });
});

// ==========================================
// ROUTE: POST /api/auth/login
// Login and get JWT token
// ==========================================
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Query database to find user by email
  const sql = 'SELECT * FROM users WHERE email = ?';

  db.get(sql, [email], (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare provided password with hashed password in database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error validating password'
        });
      }

      // If passwords don't match
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Password matches! Create JWT token
      // This token proves the user is authenticated
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
      );

      // Login successful
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    });
  });
});

// ==========================================
// ROUTE: GET /api/auth/profile
// Get current logged-in user's profile
// Requires valid JWT token
// ==========================================
router.get('/profile', (req, res) => {
  // This route needs authentication
  // We'll add middleware check in main server file
  
  const userId = req.user.id; // from JWT token

  const sql = 'SELECT id, email, name, phone, role FROM users WHERE id = ?';

  db.get(sql, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user
    });
  });
});

// Export router so server.js can use it
module.exports = router;
