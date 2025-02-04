require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');

// Passport configuration
require('./config/passport'); // Ensure this file sets up the LocalStrategy

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize()); // Make sure Passport is initialized

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/clothing-store')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Clothing Store API');
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes); // Use auth routes for handling registration and login

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('http://localhost:5001');
});
