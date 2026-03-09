// ==========================================
// ADMIN ROUTES
// Handles: Manage rooms, pricing, and all bookings
// Only accessible to users with 'admin' role
// ==========================================

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { verifyAdmin } = require('../middleware/auth');

// Apply admin verification to all routes
router.use(verifyAdmin);

// ==========================================
// ROUTE: POST /api/admin/rooms
// Add a new room (Admin only)
// ==========================================
router.post('/rooms', (req, res) => {
  const { roomNumber, roomType, capacity, basePrice, description } = req.body;

  // Validate input
  if (!roomNumber || !roomType || !capacity || !basePrice) {
    return res.status(400).json({
      success: false,
      message: 'Room number, type, capacity, and base price are required'
    });
  }

  const sql = `
    INSERT INTO rooms (room_number, room_type, capacity, base_price, description, is_available, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `;

  db.run(sql, [roomNumber, roomType, capacity, basePrice, description || null], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint')) {
        return res.status(400).json({
          success: false,
          message: 'Room number already exists'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Error adding room'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Room added successfully',
      roomId: this.lastID
    });
  });
});

// ==========================================
// ROUTE: PUT /api/admin/rooms/:roomId
// Edit room details (Admin only)
// ==========================================
router.put('/rooms/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const { roomNumber, roomType, capacity, basePrice, description, isAvailable } = req.body;

  if (!roomNumber || !roomType || !capacity || !basePrice === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields'
    });
  }

  const sql = `
    UPDATE rooms
    SET room_number = ?, room_type = ?, capacity = ?, base_price = ?,
        description = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    sql,
    [roomNumber, roomType, capacity, basePrice, description || null, isAvailable !== undefined ? isAvailable : 1, roomId],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error updating room'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Room updated successfully'
      });
    }
  );
});

// ==========================================
// ROUTE: DELETE /api/admin/rooms/:roomId
// Delete a room (Admin only)
// ==========================================
router.delete('/rooms/:roomId', (req, res) => {
  const roomId = req.params.roomId;

  // Check if room has any confirmed bookings
  const checkSql = `
    SELECT COUNT(*) as count FROM bookings
    WHERE room_id = ? AND booking_status = 'confirmed'
  `;

  db.get(checkSql, [roomId], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error checking bookings'
      });
    }

    if (result.count > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete room with confirmed bookings'
      });
    }

    // Delete the room
    const deleteSql = 'DELETE FROM rooms WHERE id = ?';

    db.run(deleteSql, [roomId], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting room'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Room deleted successfully'
      });
    });
  });
});

// ==========================================
// ROUTE: POST /api/admin/pricing
// Add pricing rule (weekend or seasonal)
// ==========================================
router.post('/pricing', (req, res) => {
  const { roomId, pricingType, multiplier, startDate, endDate } = req.body;

  // Validate input
  if (!roomId || !pricingType || !multiplier) {
    return res.status(400).json({
      success: false,
      message: 'Room ID, pricing type, and multiplier are required'
    });
  }

  if (pricingType === 'seasonal' && (!startDate || !endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Start and end dates are required for seasonal pricing'
    });
  }

  const sql = `
    INSERT INTO pricing (room_id, pricing_type, multiplier, start_date, end_date, created_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;

  db.run(
    sql,
    [roomId, pricingType, multiplier, startDate || null, endDate || null],
    function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error adding pricing rule'
        });
      }

      res.status(201).json({
        success: true,
        message: 'Pricing rule added successfully',
        pricingId: this.lastID
      });
    }
  );
});

// ==========================================
// ROUTE: GET /api/admin/bookings
// View all bookings (Admin only)
// ==========================================
router.get('/bookings', (req, res) => {
  const sql = `
    SELECT 
      b.id, b.user_id, b.room_id, b.check_in_date, b.check_out_date,
      b.number_of_guests, b.total_price, b.booking_status, b.special_requests,
      b.created_at, b.updated_at,
      u.name as user_name, u.email,
      r.room_number, r.room_type
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN rooms r ON b.room_id = r.id
    ORDER BY b.check_in_date DESC
  `;

  db.all(sql, [], (err, bookings) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching bookings'
      });
    }

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings: bookings
    });
  });
});

// ==========================================
// ROUTE: PUT /api/admin/bookings/:bookingId
// Update booking status (Admin only)
// ==========================================
router.put('/bookings/:bookingId', (req, res) => {
  const bookingId = req.params.bookingId;
  const { bookingStatus } = req.body;

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'cancelled'];
  if (!validStatuses.includes(bookingStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking status'
    });
  }

  const sql = `
    UPDATE bookings
    SET booking_status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(sql, [bookingStatus, bookingId], function(err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error updating booking'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully'
    });
  });
});

// ==========================================
// ROUTE: GET /api/admin/stats
// Get dashboard statistics
// ==========================================
router.get('/stats', (req, res) => {
  // Query multiple statistics
  const totalRoomsSql = 'SELECT COUNT(*) as count FROM rooms';
  const totalBookingsSql = 'SELECT COUNT(*) as count FROM bookings WHERE booking_status = "confirmed"';
  const totalUsersSql = 'SELECT COUNT(*) as count FROM users';
  const revenueSql = 'SELECT SUM(total_price) as total FROM bookings WHERE booking_status = "confirmed"';

  db.all(
    `${totalRoomsSql}; ${totalBookingsSql}; ${totalUsersSql}; ${revenueSql}`,
    [],
    (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching statistics'
        });
      }

      // Execute queries separately for better compatibility
      db.get(totalRoomsSql, (err, roomsResult) => {
        db.get(totalBookingsSql, (err, bookingsResult) => {
          db.get(totalUsersSql, (err, usersResult) => {
            db.get(revenueSql, (err, revenueResult) => {
              res.status(200).json({
                success: true,
                stats: {
                  totalRooms: roomsResult?.count || 0,
                  totalBookings: bookingsResult?.count || 0,
                  totalUsers: usersResult?.count || 0,
                  totalRevenue: revenueResult?.total || 0
                }
              });
            });
          });
        });
      });
    }
  );
});

// Export router
module.exports = router;
