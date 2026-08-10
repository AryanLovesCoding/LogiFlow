const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createDriver, getDrivers, updateAvailability, deleteDriver } = require('../controllers/driverController');

router.post('/', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), createDriver);
router.get('/', verifyToken, getDrivers);
router.put('/:id/availability', verifyToken, updateAvailability);
router.delete('/:id', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), deleteDriver);

module.exports = router;
