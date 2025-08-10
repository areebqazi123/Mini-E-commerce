// client/src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import Product from './pages/Product'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminProductForm from './pages/AdminProductForm'
import PaymentPage from './pages/PaymentPage'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { user } = useAuth()
  const userRole = user ? user.role : null
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>

          {user && userRole === 'admin' && <Route path='/' element={
            <ProtectedRoute adminOnly={true}>
              <AdminOrders />
            </ProtectedRoute>
          } />}
          
          
            <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          <Route path="/admin/products/new" 
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminProductForm /> 
              </ProtectedRoute>
            }
          />
          <Route path="/admin/products/edit/:id"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminProductForm />
              </ProtectedRoute>
            }
          />

          <Route path="/payment" element={<PaymentPage />} />

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
