// /routes/auth.js

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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // ✅ Prevent double hashing
    if (password.startsWith('$2a$')) {
      console.warn('🚨 WARNING: Password is already hashed. Skipping hashing.');
      return res.status(400).json({ error: 'Invalid password format' });
    }

    // ✅ Ensure password is properly hashed
    console.log(`🔍 Raw Password Before Hashing: ${password}`);

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`🔑 Hashed Password for ${email}: ${hashedPassword}`);

    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    console.log('✅ User registered successfully:', user);

    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '4h' });

    res.status(201).json({ message: 'Registration successful!', token });
  } catch (err) {
    console.error('🚨 Registration Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle Login with Passport (JSON Response)
router.post('/login', async (req, res, next) => {
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
