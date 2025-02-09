const jwt = require('jsonwebtoken');

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  let token = req.header('Authorization');

  // ✅ Allow token to be passed via query string
  if (!token) {
    token = req.query.token;
  }

  // ✅ If token is in the Authorization header, extract it
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7).trim(); // Remove "Bearer " prefix
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      console.error('🚨 Error: JWT_SECRET_KEY is missing in environment variables');
      return res.status(500).json({ error: 'Internal server error' });
    }

    const decoded = jwt.verify(token, secretKey); // Verify JWT
    req.user = decoded; // Attach decoded user info to request object

    next(); // Proceed to next middleware/route
  } catch (err) {
    console.error('🚨 JWT Error:', err.message);
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

module.exports = authenticateToken;
