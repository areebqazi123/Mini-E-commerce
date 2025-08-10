const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');

async function seed() {
  await connectDB();
  // await Product.deleteMany({});
  const products = [
    {
      title: 'Wireless Headphones',
      description: 'Premium Bluetooth over-ear headphones with noise cancellation and superior sound quality. Perfect for music lovers and professionals.',
      price: 1999,
      category: 'electronics',
      images: [
        'https://res.cloudinary.com/dexhxbqse/image/upload/v1754854472/products/xdhtkiimkixhykdysz6w.webp'
      ],
      stock: 10,
      status: 'active'
    },
    {
      title: 'Running Shoes',
      description: 'Comfortable running shoes with advanced cushioning technology. Designed for performance and durability.',
      price: 2999,
      category: 'footwear',
      images: [
        'https://res.cloudinary.com/dexhxbqse/image/upload/v1754854218/products/iza2nnhbzw0med6wmq9f.jpg',
        'https://res.cloudinary.com/dexhxbqse/image/upload/v1754854219/products/xlsihko6pnmw9jv5gzsd.jpg'
      ],
      stock: 20,
      status: 'active'
    },
    {
      title: 'Classic Watch',
      description: 'Elegant analog watch with leather strap. Timeless design that complements any outfit.',
      price: 4999,
      category: 'accessories',
      images: [
        'https://res.cloudinary.com/dexhxbqse/image/upload/v1754854122/products/jcnpcsp1vxk6ifdkm2cv.jpg',
        'https://res.cloudinary.com/dexhxbqse/image/upload/v1754854123/products/tt8y6kjm3psc3u9xgusq.jpg'
      ],
      stock: 5,
      status: 'active'
    },
    {
      title: 'T-Shirt',
      description: 'Premium cotton t-shirt with comfortable fit. Available in multiple colors and sizes.',
      price: 699,
      category: 'clothing',
      images: [
        'https://res.cloudinary.com/dexhxbqse/image/upload/v1754854360/products/juhomdehwrdjfhg4smny.jpg'
      ],
      stock: 50,
      status: 'active'
    },
    {
      title: 'Backpack',
      description: 'Durable travel backpack with multiple compartments. Perfect for hiking, travel, and daily use.',
      price: 1299,
      category: 'bag',
      images: [
        'https://res.cloudinary.com/dexhxbqse/image/upload/v1754854162/products/qnfyoszpik6kp8sid27o.jpg',
        'https://res.cloudinary.com/dexhxbqse/image/upload/v1754854186/products/khj1cvmiq72vyiaecq8p.webp'
      ],
      stock: 30,
      status: 'active'
    }
  ];
  await Product.insertMany(products);
  console.log('Seeded products with real images');
  process.exit();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});