const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { register, login, logout, getMe, getAllUsers } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.get('/users', verifyToken, authorizeRoles('Administrator'), getAllUsers);

module.exports = router;