// ==========================================
// AUTHENTICATION MIDDLEWARE
// This verifies if user is logged in and has proper permissions
// ==========================================

const jwt = require('jsonwebtoken');

// Secret key for signing tokens
// In production, store this in environment variables
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// ==========================================
// Middleware: Verify Token
// Check if user has a valid JWT token
// ==========================================
function verifyToken(req, res, next) {
  // Get token from Authorization header
  // Format: "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // If no token provided, send error
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please login first.'
    });
  }

  // Verify token is valid
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Store decoded user info in request object
    // Now other routes can access req.user
    req.user = decoded;
    next();
  });
}

// ==========================================
// Middleware: Verify Admin Role
// Check if user is an admin
// ==========================================
function verifyAdmin(req, res, next) {
  // First verify they have a valid token
  verifyToken(req, res, () => {
    // Check if user role is 'admin'
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    next();
  });
}

// Export these middleware functions so other files can use them
module.exports = {
  verifyToken,
  verifyAdmin,
  JWT_SECRET
};
