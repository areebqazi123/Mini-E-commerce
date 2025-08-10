import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublishableKey);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState(50000); // Default ₹500.00

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      // 1️⃣ Create payment intent from backend
      const { data } = await api.post('/payment/create-payment-intent', {
        amount: amount // amount in paise
      });

      // 2️⃣ Confirm payment on client side
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        setMessage(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          setMessage('✅ Payment successful!');
          // Optional: redirect to success page
          setTimeout(() => {
            navigate('/orders');
          }, 2000);
        }
      }
    } catch (error) {
      setMessage('Payment failed. Please try again.');
      console.error('Payment error:', error);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Test Payment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₹)
          </label>
          <input
            type="number"
            value={amount / 100}
            onChange={(e) => setAmount(Math.round(e.target.value * 100))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Processing...' : `Pay ₹${(amount / 100).toFixed(2)}`}
        </button>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-600 border border-green-200' 
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </form>

      <div className="mt-6 text-sm text-gray-500">
        <p className="font-medium mb-2">Test Card Numbers:</p>
        <ul className="space-y-1">
          <li>• 4242 4242 4242 4242 (Visa)</li>
          <li>• 5555 5555 5555 4444 (Mastercard)</li>
          <li>• Any future expiry date</li>
          <li>• Any 3-digit CVC</li>
        </ul>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}
