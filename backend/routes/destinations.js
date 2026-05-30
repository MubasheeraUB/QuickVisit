// Destinations Routes
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/destinationController');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/qr', ctrl.getQRCode);

// Do this after the login page have been set for admin to enter
// router.post('/', verifyToken, requireAdmin, ctrl.create);
// router.put('/:id', verifyToken, requireAdmin, ctrl.update);
// router.delete('/:id', verifyToken, requireAdmin, ctrl.remove);

router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
