const bcrypt = require('bcryptjs');
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Handle Registration (JSON Response)
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

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    console.log('✅ User registered:', email);

    // ✅ Generate JWT Token on Registration
    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '4h' });

    // ✅ Return the token in the response
    res.status(201).json({ message: 'Registration successful!', token });
  } catch (err) {
    console.error('🚨 Registration Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle Login with Passport (JSON Response)
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('🚨 Authentication Error:', err);
      return res.status(500).json({ error: 'Something went wrong. Try again.' });
    }
    if (!user) {
      console.log('❌ Invalid credentials:', req.body);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '4h' });

    console.log('✅ User logged in:', user.email);
    res.json({ token });
  })(req, res, next);
});

// Get User Profile (Protected Route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('🚨 Error fetching profile:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

module.exports = router;
