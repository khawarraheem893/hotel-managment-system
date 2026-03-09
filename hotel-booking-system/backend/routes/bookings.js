// ==========================================
// BOOKING ROUTES
// Handles: Create bookings, view bookings, cancel bookings
// ==========================================

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { verifyToken } = require('../middleware/auth');
const { calculateBookingPrice, isRoomAvailable } = require('../utils/pricing');

// Apply authentication to all routes in this file
router.use(verifyToken);

// ==========================================
// ROUTE: POST /api/bookings
// Create a new booking (user books a room)
// ==========================================
router.post('/', (req, res) => {
  const userId = req.user.id; // From JWT token
  const { roomId, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;

  // Validate input
  if (!roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
    return res.status(400).json({
      success: false,
      message: 'Room ID, check-in date, check-out date, and number of guests are required'
    });
  }

  // First, verify the room exists and get its details
  const roomSql = 'SELECT base_price FROM rooms WHERE id = ?';

  db.get(roomSql, [roomId], (err, room) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching room'
      });
    }

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    // Check if room is available for dates
    const bookingSql = `
      SELECT id, check_in_date, check_out_date, booking_status
      FROM bookings
      WHERE room_id = ? AND booking_status = 'confirmed'
    `;

    db.all(bookingSql, [roomId], (err, bookings) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error checking availability'
        });
      }

      if (!isRoomAvailable(bookings, roomId, checkInDate, checkOutDate)) {
        return res.status(400).json({
          success: false,
          message: 'Room is not available for selected dates'
        });
      }

      // Get pricing rules for this room
      const pricingSql = `
        SELECT pricing_type, multiplier, start_date, end_date
        FROM pricing
        WHERE room_id = ?
      `;

      db.all(pricingSql, [roomId], (err, pricingRules) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error fetching pricing'
          });
        }

        // Calculate total price with dynamic pricing
        const totalPrice = calculateBookingPrice(
          room.base_price,
          checkInDate,
          checkOutDate,
          pricingRules || []
        );

        // Insert booking into database
        const insertSql = `
          INSERT INTO bookings (
            user_id, room_id, check_in_date, check_out_date,
            number_of_guests, total_price, special_requests,
            booking_status, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        db.run(
          insertSql,
          [userId, roomId, checkInDate, checkOutDate, numberOfGuests, totalPrice, specialRequests || null],
          function(err) {
            if (err) {
              return res.status(500).json({
                success: false,
                message: 'Error creating booking'
              });
            }

            // Booking created successfully
            res.status(201).json({
              success: true,
              message: 'Booking created successfully',
              booking: {
                id: this.lastID,
                roomId: roomId,
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                numberOfGuests: numberOfGuests,
                totalPrice: totalPrice
              }
            });
          }
        );
      });
    });
  });
});

// ==========================================
// ROUTE: GET /api/bookings
// Get all bookings for logged-in user
// ==========================================
router.get('/', (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT 
      b.id, b.room_id, b.check_in_date, b.check_out_date,
      b.number_of_guests, b.total_price, b.booking_status, b.special_requests,
      b.created_at, b.updated_at,
      r.room_number, r.room_type, r.capacity
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE b.user_id = ?
    ORDER BY b.check_in_date DESC
  `;

  db.all(sql, [userId], (err, bookings) => {
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
// ROUTE: GET /api/bookings/:bookingId
// Get details of a specific booking
// ==========================================
router.get('/:bookingId', (req, res) => {
  const userId = req.user.id;
  const bookingId = req.params.bookingId;

  const sql = `
    SELECT 
      b.id, b.room_id, b.user_id, b.check_in_date, b.check_out_date,
      b.number_of_guests, b.total_price, b.booking_status, b.special_requests,
      b.created_at, b.updated_at,
      r.room_number, r.room_type, r.capacity, r.base_price
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    WHERE b.id = ? AND b.user_id = ?
  `;

  db.get(sql, [bookingId, userId], (err, booking) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching booking'
      });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Get payment information if exists
    const paymentSql = `
      SELECT id, amount, payment_method, payment_status, transaction_id, paid_at
      FROM payments
      WHERE booking_id = ?
    `;

    db.get(paymentSql, [bookingId], (err, payment) => {
      res.status(200).json({
        success: true,
        booking: booking,
        payment: payment || null
      });
    });
  });
});

// ==========================================
// ROUTE: PUT /api/bookings/:bookingId
// Cancel or modify a booking
// ==========================================
router.put('/:bookingId', (req, res) => {
  const userId = req.user.id;
  const bookingId = req.params.bookingId;
  const { action } = req.body; // action = 'cancel'

  if (action !== 'cancel') {
    return res.status(400).json({
      success: false,
      message: 'Invalid action'
    });
  }

  // Verify booking belongs to user
  const verifySql = 'SELECT user_id FROM bookings WHERE id = ?';

  db.get(verifySql, [bookingId], (err, booking) => {
    if (err || !booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings'
      });
    }

    // Update booking status to cancelled
    const updateSql = `
      UPDATE bookings
      SET booking_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(updateSql, [bookingId], function(err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error cancelling booking'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    });
  });
});

// Export router
module.exports = router;
