const jwt = require('jsonwebtoken');

// Middleware to check if the user is authenticated
const authenticateToken = (req, res, next) => {
  let token = req.header('Authorization');

  // ✅ Allow token to be passed via query string
  if (!token) {
    token = req.query.token;
  }

  // ✅ If token is in the Authorization header, extract it
  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  if (!token) {
    return res.status(403).json({ error: 'Access denied, no token provided' });
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY;
    const decoded = jwt.verify(token, secretKey); // Verify the token

    req.user = decoded; // Attach the decoded user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
