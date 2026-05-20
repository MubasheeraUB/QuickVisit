// Admin Dashboard Controller
const db = require('../config/db');

// Dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const [bookingsToday, revenueToday, totalDestinations, totalUsers, totalBookings, totalRevenue] =
      await Promise.all([
        db.query("SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE"),
        db.query("SELECT COALESCE(SUM(amount), 0) AS sum FROM payments WHERE status = 'success' AND DATE(created_at) = CURRENT_DATE"),
        db.query("SELECT COUNT(*) FROM destinations WHERE status = 'active'"),
        db.query("SELECT COUNT(*) FROM users WHERE role = 'tourist'"),
        db.query("SELECT COUNT(*) FROM bookings"),
        db.query("SELECT COALESCE(SUM(amount), 0) AS sum FROM payments WHERE status = 'success'")
      ]);

    res.json({
      bookings_today: parseInt(bookingsToday.rows[0].count),
      revenue_today: parseFloat(revenueToday.rows[0].sum),
      active_destinations: parseInt(totalDestinations.rows[0].count),
      registered_users: parseInt(totalUsers.rows[0].count),
      total_bookings: parseInt(totalBookings.rows[0].count),
      total_revenue: parseFloat(totalRevenue.rows[0].sum)
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Bookings trend (last 7 days)
exports.getBookingsTrend = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        TO_CHAR(DATE(created_at), 'Dy') AS day,
        DATE(created_at) AS date,
        COUNT(*) AS bookings,
        COALESCE(SUM(total_amount), 0) AS revenue
      FROM bookings
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `);
    res.json({ trend: result.rows });
  } catch (err) {
    console.error('Trend error:', err);
    res.status(500).json({ error: 'Failed to fetch trend' });
  }
};

// Revenue by destination
exports.getRevenueByDestination = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        d.name AS destination,
        COUNT(b.id) AS bookings,
        COALESCE(SUM(b.total_amount), 0) AS revenue
      FROM destinations d
      LEFT JOIN bookings b ON b.destination_id = d.id AND b.status = 'confirmed'
      GROUP BY d.id, d.name
      ORDER BY revenue DESC
      LIMIT 10
    `);
    res.json({ destinations: result.rows });
  } catch (err) {
    console.error('Revenue by destination error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
};

// All bookings (with filters)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT b.*, d.name AS destination_name,
             u.name AS user_name, u.email AS user_email,
             p.payment_method, p.status AS payment_status
      FROM bookings b
      JOIN destinations d ON b.destination_id = d.id
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (status) {
      query += ` AND b.status = $${idx}`;
      params.push(status);
      idx++;
    }

    if (search) {
      query += ` AND (b.booking_id ILIKE $${idx} OR u.name ILIKE $${idx} OR d.name ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    query += ` ORDER BY b.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    res.json({ bookings: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Get all bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// All users
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
             COUNT(b.id) AS total_bookings
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ users: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// All payments
exports.getAllPayments = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, b.booking_id AS booking_ref,
             d.name AS destination_name, u.name AS user_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN destinations d ON b.destination_id = d.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 100
    `);
    res.json({ payments: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('Get all payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// All feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT f.*, u.name AS user_name, d.name AS destination_name
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      JOIN destinations d ON f.destination_id = d.id
      ORDER BY f.created_at DESC
    `);
    res.json({ feedback: result.rows });
  } catch (err) {
    console.error('Get feedback error:', err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};
