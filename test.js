const bcrypt = require('bcryptjs');

// 🔹 Replace this with the stored hash from MongoDB
const storedHash = '$2a$10$8mLx3Y.kjh04B7FrKOEaZ.ZqC6BAgqd3yrF8izyyQAsX23gyGdf9q';
const enteredPassword = 'pass2'; // The password you used

bcrypt.compare(enteredPassword, storedHash, (err, isMatch) => {
  if (err) throw err;
  console.log('✅ Password Match:', isMatch);
});
