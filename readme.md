# 🛒 Vistaar Store - Mini E-Commerce Platform

A modern, full-stack e-commerce application built with React and Node.js, featuring a complete admin dashboard, payment integration, and responsive design.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)

## ✨ Features

### 🛍️ Customer Features
- **Product Catalog** with search, filtering, and pagination
- **Multi-image Product Gallery** 
- **Shopping Cart** with quantity management
- **Secure Checkout** with Stripe payment integration
- **Order Tracking** with real-time status updates
- **User Authentication** (register/login)
- **Responsive Design** for all devices

### 👨‍💼 Admin Features
- **Product Management** (CRUD operations)
- **Image Upload** with Cloudinary integration
- **Order Management** with status updates
- **Statistics Dashboard** with sales analytics
- **User Management** and role-based access
- **Inventory Tracking** with stock management

### 🔧 Technical Features
- **RESTful API** with Express.js
- **JWT Authentication** with role-based authorization
- **File Upload** with Multer and Cloudinary
- **Payment Processing** with Stripe
- **Database** with MongoDB and Mongoose
- **Modern UI** with Tailwind CSS
- **Responsive Design** with mobile-first approach

## 🖼️ Screenshots

### Homepage & Product Catalog
<!-- Add homepage screenshot here -->
*Product catalog with search and filtering capabilities*

### Product Details
<!-- Add product detail page screenshot here -->
*Detailed product view with image gallery and add to cart*

### Shopping Cart
<!-- Add shopping cart screenshot here -->
*Interactive shopping cart with quantity controls*

### Checkout Process
<!-- Add checkout page screenshot here -->
*Secure checkout with Stripe payment integration*

### Admin Dashboard
<!-- Add admin dashboard screenshot here -->
*Comprehensive admin panel for managing products and orders*

### Order Management
<!-- Add order management screenshot here -->
*Real-time order tracking and status updates*

## 🚀 Live Demo

- **🌐 Frontend:** [https://mini-e-commerce-ebon.vercel.app/](https://mini-e-commerce-ebon.vercel.app/)
- **🔗 Backend API:** [https://mini-e-commerce-qnng.onrender.com/api](https://mini-e-commerce-qnng.onrender.com/api)

### Test Accounts
```
Admin Account:
Email: admin@gmai.com
Password: 12345

Customer Account:
Email: user1@example.com
Password: 12345
```

### Test Payment
Use Stripe test cards:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
Zip: Any 6 digits
```

## �️ Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Stripe Elements** - Payment UI

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **Cloudinary** - Image storage
- **Stripe** - Payment processing

## 📁 Project Structure

```
Mini-E-commerce/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/           # API configuration
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context
│   │   ├── pages/         # Page components
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── seed/             # Database seeding
│   ├── uploads/          # File uploads
│   ├── utils/            # Utility functions
│   ├── package.json
│   └── index.js          # Entry point
│
└── README.md
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/areebqazi123/Mini-E-commerce.git
cd Mini-E-commerce
```

### 2. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Environment Variables (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce
JWT_SECRET=your_super_secret_jwt_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

### 3. Frontend Setup
```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Environment Variables (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

```bash
# Start the development server
npm run dev
```

### 4. Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 🚀 Deployment

### Frontend (Vercel)
### Backend (Render)
