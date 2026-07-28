const express = require('express');
const router = express.Router();

router.post('/register', (req, res) => {
  res.json({ message: 'not implemented yet' });
});

router.post('/login', (req, res) => {
  res.json({ message: 'not implemented yet' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'not implemented yet' });
});

module.exports = router;