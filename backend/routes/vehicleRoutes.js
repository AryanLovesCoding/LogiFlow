const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createVehicle, getVehicles, getVehicleByAvailable, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');

router.post('/', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), createVehicle);
router.get('/', verifyToken, getVehicles);
router.get('/available', verifyToken, getVehicleByAvailable);
router.put('/:id', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), updateVehicle);
router.delete('/:id', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), deleteVehicle);

module.exports = router;
