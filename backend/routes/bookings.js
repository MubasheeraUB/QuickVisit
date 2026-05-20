// Bookings Routes
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/bookingController');
const { verifyToken } = require('../middleware/auth');

router.post('/', ctrl.create);                              // Allow guest bookings
router.get('/my', verifyToken, ctrl.getMyBookings);
router.get('/:id', ctrl.getById);
router.post('/:id/verify', ctrl.verifyTicket);
router.post('/:id/cancel', verifyToken, ctrl.cancel);

module.exports = router;
