import React, { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import api from '../api/axios'
import { useNavigate, Link } from 'react-router-dom'

// Stripe publishable key
const stripePromise = loadStripe('pk_test_51RufIfQoXXKR220NLmoc9Lsskoy6UjR3VvdD70BlE7aZEkUWusRMJvz3siZKPZTgL4lkmYx1rN3RnXZBYeoNWKLK00azJafYJF')

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cartLoading, setCartLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      setCart(response.data)
      if (response.data.items.length === 0) {
        navigate('/cart')
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCart({ items: [], total: 0 })
    } finally {
      setCartLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    if (!address.trim()) {
      setError('Please enter a shipping address')
      return
    }

    if (cart.items.length === 0) {
      setError('Your cart is empty')
      return
    }

    setLoading(true)
    setError('')

    try {
      // 1. Create payment intent with cart total
      const { data } = await api.post('/orders/create-payment-intent', {
        amount: cart.total
      })

      // 2. Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      })

      if (stripeError) {
        setError(stripeError.message)
        setLoading(false)
        return
      }

      if (paymentIntent.status === 'succeeded') {
        // 3. Create order in backend
        await api.post('/orders', {
          paymentIntentId: paymentIntent.id,
          address: address.trim()
        })

        // 4. Navigate to orders page
        navigate('/orders')
      } else {
        setError('Payment was not completed. Please try again.')
      }

    } catch (err) {
      setError(err?.response?.data?.message || 'Payment failed. Please try again.')
    }

    setLoading(false)
  }

  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-6"></div>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-64 rounded-xl"></div>
            <div className="bg-gray-300 h-64 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/cart" 
          className="text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Cart
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {cart.items.map(item => (
              <div key={item.product._id} className="flex gap-4">
                <img 
                  src={item.product.images?.[0] || 'https://via.placeholder.com/60x60?text=No+Image'} 
                  alt={item.product.title}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product.title}</h3>
                  <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                  <p className="text-sm font-medium text-gray-900">₹{(item.qty * item.price).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cart.items.length} items)</span>
              <span>₹{cart.total?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span>₹{cart.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Details</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Address *
              </label>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete shipping address..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>

            {/* Card Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Details *
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

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!stripe || loading || cart.items.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pay ₹{cart.total?.toLocaleString()}
                </>
              )}
            </button>

            {/* Security Notice */}
            <div className="text-center text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2 mb-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Your payment information is secure and encrypted
              </div>
              <p>Powered by Stripe</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Checkout() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
