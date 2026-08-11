const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const { createTicket, getTickets, assignTicket, updateTicketStatus, addComment } = require('../controllers/ticketController');

router.post('/', verifyToken, createTicket);
router.get('/', verifyToken, getTickets);
router.put('/:id/assign', verifyToken, authorizeRoles('Administrator'), assignTicket);
router.put('/:id/status', verifyToken, updateTicketStatus);
router.post('/:id/comment', verifyToken, addComment);

module.exports = router;
