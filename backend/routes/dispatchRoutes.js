const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createDispatch, getDispatches, getDispatchById, updateDispatches } = require('../controllers/dispatchController');

router.post('/', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), createDispatch);
router.get('/', verifyToken, getDispatches);
router.get('/:id', verifyToken, getDispatchById);
router.put('/:id/complete', verifyToken, authorizeRoles('Administrator', 'Warehouse Manager'), updateDispatches);

module.exports = router;
