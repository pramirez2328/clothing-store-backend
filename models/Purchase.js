const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // For unique purchase IDs

const PurchaseSchema = new mongoose.Schema({
  purchaseId: { type: String, default: uuidv4, unique: true }, // Unique Purchase ID
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Relationship
  items: [
    {
      productId: Number,
      title: String,
      price: Number,
      orderQty: Number,
      selectedSize: String,
      thumbnail: String
    }
  ],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
