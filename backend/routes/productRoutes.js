const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');

router.post('/', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), createProduct);
router.get('/', verifyToken, getProducts);
router.get('/:id', verifyToken, getProductById);
router.put('/:id', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), updateProduct);
router.delete('/:id', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), deleteProduct);

module.exports = router;
