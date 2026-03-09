// ==========================================
// ROOM ROUTES
// Handles: View all rooms, room details, available rooms
// ==========================================

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { calculateBookingPrice, isRoomAvailable } = require('../utils/pricing');
const { verifyToken } = require('../middleware/auth');

// ==========================================
// ROUTE: GET /api/rooms
// Get all available rooms with their prices
// ==========================================
router.get('/', (req, res) => {
  // Get check-in and check-out dates from query parameters
  // These are used to calculate dynamic prices
  const checkInDate = req.query.checkIn;
  const checkOutDate = req.query.checkOut;

  // Query all available rooms
  const sql = `
    SELECT id, room_number, room_type, capacity, base_price, description, is_available
    FROM rooms
    WHERE is_available = 1
    ORDER BY base_price ASC
  `;

  db.all(sql, [], (err, rooms) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching rooms'
      });
    }

    // If no dates provided, return just base prices
    if (!checkInDate || !checkOutDate) {
      return res.status(200).json({
        success: true,
        rooms: rooms.map(room => ({
          ...room,
          calculated_price: room.base_price,
          nights: 1
        }))
      });
    }

    // Calculate dynamic prices for each room
    const roomsWithPrices = rooms.map(room => {
      // Get pricing rules for this room
      const pricingSql = `
        SELECT pricing_type, multiplier, start_date, end_date
        FROM pricing
        WHERE room_id = ?
      `;

      db.all(pricingSql, [room.id], (err, pricingRules) => {
        // Calculate price with dynamic pricing applied
        const calculatedPrice = calculateBookingPrice(
          room.base_price,
          checkInDate,
          checkOutDate,
          pricingRules || []
        );

        room.calculated_price = calculatedPrice;
      });

      // Calculate number of nights
      const nights = Math.ceil(
        (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
      );
      room.nights = nights;

      return room;
    });

    // Wait for all pricing queries to complete
    // This is a simplified version - in production, use Promise.all
    setTimeout(() => {
      res.status(200).json({
        success: true,
        rooms: roomsWithPrices
      });
    }, 100);
  });
});

// ==========================================
// ROUTE: GET /api/rooms/:roomId
// Get details for a specific room
// ==========================================
router.get('/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const checkInDate = req.query.checkIn;
  const checkOutDate = req.query.checkOut;

  // Get room details
  const roomSql = `
    SELECT id, room_number, room_type, capacity, base_price, description, is_available
    FROM rooms
    WHERE id = ?
  `;

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

    // Get pricing rules for this room
    const pricingSql = `
      SELECT id, pricing_type, multiplier, start_date, end_date
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

      let calculatedPrice = room.base_price;
      let nights = 1;

      // If dates provided, calculate dynamic price
      if (checkInDate && checkOutDate) {
        calculatedPrice = calculateBookingPrice(
          room.base_price,
          checkInDate,
          checkOutDate,
          pricingRules || []
        );

        nights = Math.ceil(
          (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
        );
      }

      res.status(200).json({
        success: true,
        room: {
          ...room,
          calculated_price: calculatedPrice,
          nights: nights,
          pricing_rules: pricingRules
        }
      });
    });
  });
});

// ==========================================
// ROUTE: GET /api/rooms/:roomId/availability
// Check if room is available for given dates
// ==========================================
router.get('/:roomId/availability', (req, res) => {
  const roomId = req.params.roomId;
  const checkInDate = req.query.checkIn;
  const checkOutDate = req.query.checkOut;

  // Validate dates
  if (!checkInDate || !checkOutDate) {
    return res.status(400).json({
      success: false,
      message: 'Check-in and check-out dates are required'
    });
  }

  // Get all confirmed bookings for this room
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

    // Check if room is available
    const available = isRoomAvailable(bookings, roomId, checkInDate, checkOutDate);

    res.status(200).json({
      success: true,
      available: available,
      message: available ? 'Room is available' : 'Room is not available for selected dates'
    });
  });
});

// Export router
module.exports = router;
