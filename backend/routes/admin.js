// Admin Routes (all require admin authentication)
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);

router.get('/stats', ctrl.getStats);
router.get('/trend', ctrl.getBookingsTrend);
router.get('/revenue-by-destination', ctrl.getRevenueByDestination);
router.get('/bookings', ctrl.getAllBookings);
router.get('/users', ctrl.getAllUsers);
router.get('/payments', ctrl.getAllPayments);
router.get('/feedback', ctrl.getAllFeedback);

module.exports = router;
