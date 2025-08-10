import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import { Link, useNavigate } from 'react-router-dom'

export default function Cart(){
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const nav = useNavigate()
  
  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      setCart(response.data)
    } catch (error) {
      console.error('Error fetching cart:', error)
      setCart({ items: [], total: 0 })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1) return removeItem(productId)
    
    console.log('Updating quantity:', { productId, newQty })
    setUpdating({ ...updating, [productId]: true })
    try {
      const response = await api.put('/cart', { productId, qty: newQty })
      console.log('Update response:', response.data)
      setCart(response.data)
    } catch (error) {
      console.error('Error updating quantity:', error)
      console.error('Error details:', error.response?.data)
      // Refetch cart on error to ensure UI is in sync
      await fetchCart()
    } finally {
      setUpdating({ ...updating, [productId]: false })
    }
  }

  const removeItem = async (productId) => {
    console.log('Removing item:', productId)
    setUpdating({ ...updating, [productId]: true })
    try {
      const response = await api.put('/cart', { productId, qty: 0 })
      console.log('Remove response:', response.data)
      setCart(response.data)
    } catch (error) {
      console.error('Error removing item:', error)
      console.error('Error details:', error.response?.data)
      // Refetch cart on error to ensure UI is in sync
      await fetchCart()
    } finally {
      setUpdating({ ...updating, [productId]: false })
    }
  }

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return
    
    try {
      await api.delete('/cart')
      setCart({ items: [], total: 0 })
    } catch (error) {
      console.error('Error clearing cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-32 mb-6"></div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-gray-300 h-32 rounded-xl"></div>
              ))}
            </div>
            <div className="bg-gray-300 h-64 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <Link 
          to="/" 
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      {cart.items?.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-6">
            <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet</p>
          <Link 
            to="/" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cart Items ({cart.items.length})
                  </h2>
                  <button 
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cart.items.map(item => (
                  <div key={item.product._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img 
                          src={item.product.images?.[0] || 'https://via.placeholder.com/120x120?text=No+Image'} 
                          alt={item.product.title}
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.product.title}
                            </h3>
                            <p className="text-sm text-gray-500">{item.product.category}</p>
                          </div>
                          <button
                            onClick={() => removeItem(item.product._id)}
                            disabled={updating[item.product._id]}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Qty:</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product._id, item.qty - 1)}
                                disabled={updating[item.product._id] || item.qty <= 1}
                                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-12 text-center font-medium text-lg">
                                {updating[item.product._id] ? '...' : item.qty}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product._id, item.qty + 1)}
                                disabled={updating[item.product._id]}
                                className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ₹{(item.qty * item.price).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              ₹{item.price} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{cart.total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{cart.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => nav('/checkout')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Proceed to Checkout
              </button>
              
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Free shipping on all orders
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure checkout
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  30-day return policy
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
