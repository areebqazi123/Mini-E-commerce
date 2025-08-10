const express = require('express');
const Stripe = require('stripe');
const dotenv = require('dotenv');

dotenv.config();
const router = express.Router();

// Stripe secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body; // amount in smallest currency unit (e.g., cents)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // e.g., 50000 for ₹500.00
      currency: 'inr', // INR for Indian Rupee
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
