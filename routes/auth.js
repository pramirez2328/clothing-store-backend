const bcrypt = require('bcryptjs');
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Render Register Page
router.get('/register', (req, res) => {
  res.render('register');
});

// Render Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle Registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.render('register', { error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'User already exists' });
    }

    // Create user (Password hashing is handled in User model)
    const user = new User({ username, email, password });
    await user.save();

    console.log('✅ User registered:', email);
    res.redirect('/api/auth/login');
  } catch (err) {
    console.error('🚨 Error during registration:', err);
    res.render('register', { error: err.message });
  }
});

// Handle Login with Passport
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('🚨 Authentication Error:', err);
      return res.render('login', { error: 'Something went wrong. Try again.' });
    }
    if (!user) {
      console.log('❌ Invalid credentials:', req.body);
      return res.render('login', { error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const secretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '4h' });

    console.log('✅ User logged in:', user.email);
    res.redirect(`/api/auth/profile?token=${token}`);
  })(req, res, next);
});

// Render Profile Page
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.render('profile', { error: 'User not found' });
    }

    res.render('profile', { user: user.toObject() });
  } catch (err) {
    console.error('🚨 Error fetching profile:', err);
    res.render('profile', { error: 'Something went wrong.' });
  }
});

module.exports = router;
