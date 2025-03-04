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

    // Ensure password is NOT already hashed
    if (password.startsWith('$2a$')) {
      console.log('🚨 WARNING: Password is already hashed. Skipping hashing.');
      return res.status(400).json({ error: 'Invalid password format' });
    }

    // Hash the password only once
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`🔑 Hashed Password for ${email}: ${hashedPassword}`);

    // Save the exact hash
    const user = new User({ username, email, password: hashedPassword });
    console.log('New User', user);
    await user.save();

    // Fetch user again to verify correct storage
    const storedUser = await User.findOne({ email });
    console.log(`✅ Stored Hash in DB: ${storedUser.password}`);

    if (storedUser.password !== hashedPassword) {
      console.error('🚨 ERROR: Hashed password was modified before saving!');
      return res.status(500).json({ error: 'Password was altered after hashing.' });
    }

    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '4h' });

    res.status(201).json({ message: 'Registration successful!', token });
  } catch (err) {
    console.error('🚨 Registration Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle Login with Passport (JSON Response)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ No user found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password match: ${isMatch}`);

    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ Generate JWT Token
    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '4h' });

    console.log('✅ User logged in:', email);
    res.json({ token });
  } catch (err) {
    console.error('🚨 Authentication Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
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
