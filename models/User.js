const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  purchases: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' }],
});

// Prevent Double Hashing Before Saving
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    // Check if the password is already hashed
    if (!this.password.startsWith('$2a$')) {
      this.password = await bcrypt.hash(this.password, 10);
    } else {
      console.log('🚨 WARNING: Password is already hashed. Skipping re-hashing.');
    }
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
