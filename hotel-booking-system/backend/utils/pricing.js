// ==========================================
// PRICING UTILITY - Calculate Dynamic Prices
// This file contains logic for price calculations
// ==========================================

// ==========================================
// Function: Calculate Price for Date Range
// Applies weekend and seasonal pricing
// ==========================================
function calculateBookingPrice(basePrice, checkInDate, checkOutDate, pricingRules) {
  /*
   * INPUT:
   *   basePrice: base price per night (e.g., 100)
   *   checkInDate: check-in date (string: "2026-01-15")
   *   checkOutDate: check-out date (string: "2026-01-18")
   *   pricingRules: array of pricing rules from database
   *
   * OUTPUT:
   *   totalPrice: calculated price including markups
   *
   * EXAMPLE:
   *   Base price: $100
   *   3 nights: Jan 15-18
   *   If weekends have 1.5x markup and Jan 17 is Saturday:
   *   - Jan 15 (Wed): $100
   *   - Jan 16 (Thu): $100
   *   - Jan 17 (Fri): $100
   *   - Jan 18 (Sat): $150
   *   Total: $450
   */

  let totalPrice = 0;
  
  // Convert date strings to Date objects
  let currentDate = new Date(checkInDate);
  const endDate = new Date(checkOutDate);

  // Loop through each night
  while (currentDate < endDate) {
    // Calculate price for this specific night
    const nightPrice = calculateNightPrice(basePrice, currentDate, pricingRules);
    totalPrice += nightPrice;

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Round to 2 decimal places (cents)
  return Math.round(totalPrice * 100) / 100;
}

// ==========================================
// Function: Calculate Price for Single Night
// Check if it's weekend or seasonal, apply markup
// ==========================================
function calculateNightPrice(basePrice, date, pricingRules) {
  /*
   * This function:
   * 1. Checks if date is weekend (Sat/Sun)
   * 2. Checks if date falls in seasonal period
   * 3. Applies the highest multiplier found
   */

  let multiplier = 1; // Start with base price (no markup)

  // Check if this date is a weekend (Saturday = 6, Sunday = 0)
  const dayOfWeek = date.getDay();
  const isWeekend = (dayOfWeek === 6 || dayOfWeek === 0);

  // Loop through all pricing rules
  for (const rule of pricingRules) {
    // Weekend pricing rule
    if (rule.pricing_type === 'weekend' && isWeekend) {
      // Use the higher multiplier if multiple rules apply
      if (rule.multiplier > multiplier) {
        multiplier = rule.multiplier;
      }
    }

    // Seasonal pricing rule
    if (rule.pricing_type === 'seasonal') {
      const startDate = new Date(rule.start_date);
      const endDate = new Date(rule.end_date);

      // Check if current date falls within seasonal period
      if (date >= startDate && date <= endDate) {
        if (rule.multiplier > multiplier) {
          multiplier = rule.multiplier;
        }
      }
    }
  }

  // Apply multiplier to base price
  return basePrice * multiplier;
}

// ==========================================
// Function: Check Room Availability
// Verify if room is available for dates
// ==========================================
function isRoomAvailable(bookings, roomId, checkInDate, checkOutDate) {
  /*
   * Check if the room has any conflicting bookings
   * 
   * Conflict occurs when:
   * New check-in is before existing check-out AND
   * New check-out is after existing check-in
   */

  const newCheckIn = new Date(checkInDate);
  const newCheckOut = new Date(checkOutDate);

  // Loop through all bookings for this room
  for (const booking of bookings) {
    // Skip cancelled bookings
    if (booking.booking_status === 'cancelled') {
      continue;
    }

    const existingCheckIn = new Date(booking.check_in_date);
    const existingCheckOut = new Date(booking.check_out_date);

    // Check for overlap
    if (newCheckIn < existingCheckOut && newCheckOut > existingCheckIn) {
      return false; // Room is not available
    }
  }

  return true; // Room is available
}

// Export functions so other files can use them
module.exports = {
  calculateBookingPrice,
  calculateNightPrice,
  isRoomAvailable
};
