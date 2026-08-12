const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createWarehouse, getWarehouses, getWarehouseById, updateWarehouse, deleteWarehouse } = require('../controllers/warehouseController');

router.post('/', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), createWarehouse);
router.get('/', verifyToken, getWarehouses);
router.get('/:id', verifyToken, getWarehouseById);
router.put('/:id', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), updateWarehouse);
router.delete('/:id', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), deleteWarehouse);

module.exports = router;
