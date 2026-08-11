const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { getLogs } = require('../controllers/logsController');

router.get('/', verifyToken, authorizeRoles('Administrator'), getLogs);

module.exports = router;
