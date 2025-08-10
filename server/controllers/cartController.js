const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) cart = { items: [], total: 0 };
    res.json(cart);
  } catch (err) { next(err); }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [], total: 0 });
    }

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) {
      cart.items[idx].qty = (cart.items[idx].qty || 0) + (qty || 1);
      cart.items[idx].price = product.price;
    } else {
      cart.items.push({ product: productId, qty: qty || 1, price: product.price });
    }

    cart.total = cart.items.reduce((s, it) => s + it.qty * it.price, 0);
    await cart.save();
    
    // Re-populate the cart with product details before returning
    cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    res.json(cart);
  } catch (err) { next(err); }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    
    // Debug logging
    console.log('Updating cart item:', { productId, qty, userId: req.user._id });
    
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      console.log('Cart not found for user:', req.user._id);
      return res.status(404).json({ message: 'Cart not found' });
    }

    let product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Convert productId to string for comparison (in case it's an ObjectId)
    const productIdStr = productId.toString();
    const item = cart.items.find(i => i.product.toString() === productIdStr);
    
    if (!item) {
      console.log('Item not found in cart. Available items:', cart.items.map(i => ({ productId: i.product.toString(), qty: i.qty })));
      return res.status(404).json({ message: 'Item not in cart' });
    }
    
    if (qty <= 0) {
      console.log('Removing item from cart');
      cart.items = cart.items.filter(i => i.product.toString() !== productIdStr);
    } else if(qty > product.stock) {
      console.log('Requested quantity exceeds stock');
      return res.status(400).json({ message: 'Requested quantity exceeds stock' });
    } else {
      console.log('Updating item quantity from', item.qty, 'to', qty);
      item.qty = qty;
    }
    
    cart.total = cart.items.reduce((s, it) => s + it.qty * it.price, 0);
    await cart.save();
    
    // Re-populate the cart with product details before returning
    cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    console.log('Updated cart returned');
    res.json(cart);
  } catch (err) { 
    console.error('Error updating cart item:', err);
    next(err); 
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: 'Cart cleared' });
  } catch (err) { next(err); }
};