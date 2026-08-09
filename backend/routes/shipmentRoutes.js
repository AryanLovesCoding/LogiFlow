const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createShipment, getShipments, getShipmentById, updateShipment, trackShipment } = require('../controllers/shipmentController');

router.post('/', verifyToken, authorizeRoles('Administrator', 'Logistics Coordinator'), createShipment);
router.get('/', verifyToken, getShipments);
router.get('/:id', verifyToken, getShipmentById);
router.put('/:id/status', verifyToken, updateShipment);
router.post('/:id/tracking', verifyToken, trackShipment);

module.exports = router;
