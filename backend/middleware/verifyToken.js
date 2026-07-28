const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const words = authHeader.split(' ');
  const token = words[1];
    try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;