const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createInventory, getInventory, getInventoryById, restockInventory, deductInventory, getInventoryByLowStock } = require('../controllers/inventoryController');

router.post('/', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), createInventory);
router.get('/', verifyToken, getInventory);
router.get('/low-stock', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), getInventoryByLowStock);
router.get('/:id', verifyToken, getInventoryById);
router.put('/:id/restock', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), restockInventory);
router.put('/:id/deduct', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), deductInventory);

module.exports = router;
