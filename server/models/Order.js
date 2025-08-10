const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      title: String,
      qty: Number,
      price: Number
    }
  ],
  amount: { type: Number, required: true },
  paymentIntentId: { type: String },
  status: { type: String, enum: ['placed','processing','shipped','delivered','cancelled'], default: 'placed' },
  address: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);