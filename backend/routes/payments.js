// Payment Routes
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.post('/process', ctrl.process);
router.get('/:id', ctrl.getById);
router.post('/:id/refund', verifyToken, requireAdmin, ctrl.refund);

module.exports = router;
