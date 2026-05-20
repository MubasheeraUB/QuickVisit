// Bookings Controller
const db = require('../config/db');
const QRCode = require('qrcode');

// Generate unique booking ID
function generateBookingId(destinationCode = 'GEN') {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `QV-${destinationCode}-${random}`;
}

// Create a new booking
exports.create = async (req, res) => {
  const client = await db.getClient();
  try {
    const {
      destination_id, adult_count = 0, child_count = 0, senior_count = 0,
      visit_date, time_slot
    } = req.body;

    if (!destination_id || !visit_date) {
      return res.status(400).json({ error: 'destination_id and visit_date are required' });
    }

    const totalVisitors = parseInt(adult_count) + parseInt(child_count) + parseInt(senior_count);
    if (totalVisitors < 1) {
      return res.status(400).json({ error: 'At least one visitor is required' });
    }

    await client.query('BEGIN');

    // Fetch destination pricing
    const destResult = await client.query(
      'SELECT id, name, adult_price, child_price, senior_price FROM destinations WHERE id = $1 AND status = $2',
      [destination_id, 'active']
    );

    if (destResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Destination not found or inactive' });
    }

    const dest = destResult.rows[0];

    // Calculate amounts
    const subtotal =
      adult_count * parseFloat(dest.adult_price) +
      child_count * parseFloat(dest.child_price) +
      senior_count * parseFloat(dest.senior_price);
    const serviceFee = 5.00;
    const total = subtotal + serviceFee;

    // Generate booking ID
    const destCode = dest.name.substring(0, 3).toUpperCase();
    const bookingId = generateBookingId(destCode);

    // Generate QR ticket data
    const qrTicketData = JSON.stringify({
      booking_id: bookingId,
      destination: dest.name,
      visitors: totalVisitors,
      date: visit_date,
      hash: Buffer.from(bookingId + visit_date).toString('base64')
    });

    // Insert booking
    const bookingResult = await client.query(
      `INSERT INTO bookings
       (booking_id, user_id, destination_id, adult_count, child_count, senior_count,
        total_visitors, visit_date, time_slot, subtotal, service_fee, total_amount,
        qr_ticket_data, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
       RETURNING *`,
      [
        bookingId, req.user ? req.user.id : null, destination_id,
        adult_count, child_count, senior_count, totalVisitors,
        visit_date, time_slot, subtotal, serviceFee, total, qrTicketData
      ]
    );

    await client.query('COMMIT');

    // Generate QR image
    const qrImage = await QRCode.toDataURL(qrTicketData, {
      width: 250,
      color: { dark: '#1565c0', light: '#FFFFFF' }
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking: bookingResult.rows[0],
      qr_image: qrImage
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    client.release();
  }
};

// Get user's bookings
exports.getMyBookings = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, d.name AS destination_name, d.location AS destination_location
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ bookings: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get booking by ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT b.*, d.name AS destination_name, d.location AS destination_location,
              u.name AS user_name, u.email AS user_email
       FROM bookings b
       JOIN destinations d ON b.destination_id = d.id
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.booking_id = $1 OR b.id::text = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];
    const qrImage = await QRCode.toDataURL(booking.qr_ticket_data || booking.booking_id, {
      width: 250,
      color: { dark: '#1565c0', light: '#FFFFFF' }
    });

    res.json({ booking, qr_image: qrImage });
  } catch (err) {
    console.error('Get booking error:', err);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Verify ticket at entry gate
exports.verifyTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE bookings SET status = 'used', verified_at = CURRENT_TIMESTAMP
       WHERE (booking_id = $1 OR id::text = $1) AND status = 'confirmed'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or already used ticket' });
    }

    res.json({ message: 'Ticket verified - entry granted', booking: result.rows[0] });
  } catch (err) {
    console.error('Verify ticket error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Cancel booking
exports.cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE bookings SET status = 'cancelled'
       WHERE (booking_id = $1 OR id::text = $1) AND status IN ('pending', 'confirmed')
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Cannot cancel this booking' });
    }

    res.json({ message: 'Booking cancelled', booking: result.rows[0] });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};
