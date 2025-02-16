const jwt = require('jsonwebtoken');

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
    console.warn('🚨 Unauthorized: No token provided');
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    if (!secretKey) {
      console.error('🚨 Server Error: JWT_SECRET_KEY is missing in environment variables');
      return res.status(500).json({ error: 'Internal server error' });
    }

    const decoded = jwt.verify(token, secretKey); // Verify JWT
    req.user = decoded; // Attach decoded user info to request object

    next(); // ✅ Proceed to next middleware/route
  } catch (err) {
    console.error('🚨 JWT Error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Forbidden: Token has expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    } else {
      return res.status(403).json({ error: 'Forbidden: Unable to verify token' });
    }
  }
};

module.exports = authenticateToken;
