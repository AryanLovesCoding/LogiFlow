const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { getMyNotifications, markAsRead, markAllAsRead} = require('../controllers/notificationController');

router.get('/me', verifyToken, getMyNotifications);
router.patch('/:id/read', verifyToken, markAsRead);
router.patch('/read-all', verifyToken, markAllAsRead);

module.exports = router;
