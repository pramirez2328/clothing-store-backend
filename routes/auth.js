// routes/auth.js
const bcrypt = require('bcryptjs');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

// Register Route
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login Route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: info.message });

    const secretKey = process.env.JWT_SECRET_KEY; // Store secret key in .env
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '4h' });
    res.json({ token });
  })(req, res, next);
});

router.get('/profile', authenticateToken, async (req, res) => {
  // Find the user in the database using the id from the JWT
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Send back the user's details
  res.json({ message: 'This is a protected profile page', user });
});

module.exports = router;
