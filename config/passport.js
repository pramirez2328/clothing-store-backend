// cofig/passport.js

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Setup the local strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // specify the field you want to use for username (email in this case)
      passwordField: 'password' // specify the field for password
    },
    async (email, password, done) => {
      try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // Compare the password with the hashed password stored in the database
        console.log('user.password', user.password);
        console.log('first password', password);
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // If authentication is successful, return the user
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize the user to store in the session (if using sessions)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize the user from the session (if using sessions)
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
