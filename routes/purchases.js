// routes/purchases.js
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const Purchase = require('../models/Purchase');
const User = require('../models/User');

const router = express.Router();

// Create a New Purchase
router.post('/create', authenticateToken, async (req, res) => {
  try {
    let { items } = req.body;

    // Ensure `items` is an array
    if (typeof items === 'string') {
      items = JSON.parse(items);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Purchase items must be a non-empty array' });
    }

    // Calculate total price safely
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.orderQty || 0), 0);

    // ✅ Create a new purchase
    const newPurchase = new Purchase({
      userId: req.user.id, // Extract user ID from JWT
      items: items.map(({ id, title, price, orderQty, selectedSize, thumbnail }) => ({
        productId: id,
        title,
        price,
        orderQty,
        selectedSize,
        thumbnail
      })),
      totalAmount
    });

    await newPurchase.save();

    // ✅ Update the User with the purchase reference
    await User.findByIdAndUpdate(req.user.id, { $push: { purchases: newPurchase._id } });

    res.status(201).json({ message: 'Purchase created successfully', purchaseId: newPurchase._id });
  } catch (err) {
    console.error('🚨 Purchase Creation Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

module.exports = router;
