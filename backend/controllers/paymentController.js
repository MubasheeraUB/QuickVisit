// Payment Controller (Test Mode - simulates payment gateway)
const db = require('../config/db');

function generateTransactionId() {
  return 'TXN-' + Math.floor(10000000 + Math.random() * 90000000);
}

// Process payment (test mode)
exports.process = async (req, res) => {
  const client = await db.getClient();
  try {
    const { booking_id, payment_method, payment_gateway, simulate_failure } = req.body;

    if (!booking_id || !payment_method) {
      return res.status(400).json({ error: 'booking_id and payment_method are required' });
    }

    await client.query('BEGIN');

    // Fetch booking
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE booking_id = $1 OR id::text = $1',
      [booking_id]
    );

    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status === 'confirmed' || booking.status === 'used') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Payment already completed for this booking' });
    }

    // Simulate payment processing
    const transactionId = generateTransactionId();
    const paymentStatus = simulate_failure ? 'failed' : 'success';

    // Insert payment record
    const paymentResult = await client.query(
      `INSERT INTO payments
       (transaction_id, booking_id, user_id, amount, payment_method, payment_gateway, status, gateway_response)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        transactionId, booking.id, booking.user_id, booking.total_amount,
        payment_method, payment_gateway || 'TestGateway', paymentStatus,
        JSON.stringify({ test_mode: true, processed_at: new Date().toISOString() })
      ]
    );

    // Update booking status if payment succeeded
    if (paymentStatus === 'success') {
      await client.query(
        `UPDATE bookings SET status = 'confirmed' WHERE id = $1`,
        [booking.id]
      );
    }

    await client.query('COMMIT');

    res.json({
      message: paymentStatus === 'success' ? 'Payment successful' : 'Payment failed',
      payment: paymentResult.rows[0],
      booking_id: booking.booking_id,
      receipt: {
        transaction_id: transactionId,
        amount: booking.total_amount,
        method: payment_method,
        status: paymentStatus,
        date: new Date().toLocaleString()
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Process payment error:', err);
    res.status(500).json({ error: 'Payment processing failed' });
  } finally {
    client.release();
  }
};

// Get payment details
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT p.*, b.booking_id AS booking_ref, d.name AS destination_name
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN destinations d ON b.destination_id = d.id
       WHERE p.transaction_id = $1 OR p.id::text = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment: result.rows[0] });
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

// Refund payment (admin)
exports.refund = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `UPDATE payments SET status = 'refunded', refund_amount = amount
       WHERE id = $1 AND status = 'success'
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Cannot refund this payment' });
    }

    // Cancel associated booking
    await db.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1`,
      [result.rows[0].booking_id]
    );

    res.json({ message: 'Refund processed', payment: result.rows[0] });
  } catch (err) {
    console.error('Refund error:', err);
    res.status(500).json({ error: 'Refund failed' });
  }
};
