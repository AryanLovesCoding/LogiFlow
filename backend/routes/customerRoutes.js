const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createCustomer, getCustomer, getCustomerById, updateCustomer, deleteCustomer } = require('../controllers/customerController');

router.post('/', verifyToken, authorizeRoles('Administrator', 'Logistics Coordinator'), createCustomer);
router.get('/', verifyToken, getCustomer);
router.get('/:id', verifyToken, getCustomerById);
router.put('/:id', verifyToken, updateCustomer);
router.delete('/:id', verifyToken, authorizeRoles('Administrator', 'Logistics Coordinator'), deleteCustomer);

module.exports = router;
