const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// Create product (admin)
exports.createProduct = async (req, res, next) => {
  try {
    const payload = req.body;
    
    // Handle image uploads if files are present
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { 
          folder: 'products',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path); // Clean up local file
      }
      payload.images = imageUrls;
    }
    
    const p = await Product.create(payload);
    res.json(p);
  } catch (err) { next(err); }
};

// Update
exports.updateProduct = async (req, res, next) => {
  try {
    const payload = req.body;
    
    // Debug logging
    console.log('Update product request:');
    console.log('Files received:', req.files?.length || 0);
    console.log('Existing images from frontend:', payload.existingImages);
    
    // Handle image uploads
    if (req.files && req.files.length > 0) {
      // If new files are uploaded, upload them to cloudinary
      const imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { 
          folder: 'products',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        });
        imageUrls.push(result.secure_url);
        fs.unlinkSync(file.path); // Clean up local file
      }
      
      // If we have existing images to keep, combine them with new ones
      if (payload.existingImages) {
        const existingImages = JSON.parse(payload.existingImages);
        payload.images = [...existingImages, ...imageUrls];
      } else {
        // Replace all images with new ones
        payload.images = imageUrls;
      }
    } else if (payload.existingImages) {
      // No new images uploaded, just use existing images (which may have been reduced)
      payload.images = JSON.parse(payload.existingImages);
    } else {
      // No new images and no existing images means remove all images
      payload.images = [];
    }
    
    // Clean up the existingImages field
    delete payload.existingImages;
    
    console.log('Final images array:', payload.images);
    
    const p = await Product.findByIdAndUpdate(req.params.id, payload, { new: true });
    res.json(p);
  } catch (err) { next(err); }
};

// Delete
exports.deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

// Get all products for admin (includes inactive products)
exports.getAllProductsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Higher limit for admin view
    const skip = (page - 1) * limit;

    const q = {}; // No status filter - show all products
    if (req.query.category) q.category = req.query.category;
    if (req.query.minPrice || req.query.maxPrice) q.price = {};
    if (req.query.minPrice) q.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) q.price.$lte = Number(req.query.maxPrice);
    if (req.query.search) q.title = { $regex: req.query.search, $options: 'i' };

    const [items, total] = await Promise.all([
      Product.find(q).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(q)
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// Get list with search, filter, pagination (public - only active products)
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const q = { status: 'active' };
    if (req.query.category) q.category = req.query.category;
    if (req.query.minPrice || req.query.maxPrice) q.price = {};
    if (req.query.minPrice) q.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) q.price.$lte = Number(req.query.maxPrice);
    if (req.query.search) q.title = { $regex: req.query.search, $options: 'i' };

    const [items, total] = await Promise.all([
      Product.find(q).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(q)
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

exports.getProductById = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (err) { next(err); }
};