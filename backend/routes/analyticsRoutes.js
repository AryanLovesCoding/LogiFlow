const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { getSummary, getOrdersByDay} = require('../controllers/analyticsController');

router.get('/summary', verifyToken, getSummary);
router.get('/orders-by-day', verifyToken, getOrdersByDay);

module.exports = router;
