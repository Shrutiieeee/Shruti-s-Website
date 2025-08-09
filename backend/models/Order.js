// backend/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, required: true },
  details: { type: String },
  referenceImageUrl: { type: String } // 🔁 New field
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);