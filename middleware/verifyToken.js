const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();


const secret = process.env.JWT_SECRET;
const verifyToken = (req, res, next) => {
const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; // Payload JWT berisi { id: userId, email, etc. }
    next();
  });
};

module.exports = verifyToken;
