const Order = require('../models/Order');
const Cart = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// create payment intent (client calls this to start payment)
exports.createPaymentIntent = async (req, res, next) => {
  try {
    let { amount, currency = 'inr' } = req.body;
    
    // If no amount provided, get it from user's cart
    if (!amount) {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      amount = cart.total;
    }
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount required' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to smallest currency unit (paise)
      currency,
      metadata: { 
        integration_check: 'accept_a_payment',
        user_id: req.user._id.toString()
      }
    });
    
    res.json({ 
      clientSecret: paymentIntent.client_secret, 
      id: paymentIntent.id,
      amount: amount
    });
  } catch (err) { next(err); }
};

// create order after payment verification
exports.createOrder = async (req, res, next) => {
  try {
    const { paymentIntentId, address } = req.body;
    // optional: verify payment intent status with stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!pi || !['succeeded','requires_capture','requires_confirmation'].includes(pi.status)) {
      // In test flows, you may accept 'requires_capture' depending on integration. Keep simple:
      // We'll accept if status is at least not 'canceled'.
      // For stricter check, only accept 'succeeded'.
      if (pi.status !== 'succeeded') return res.status(400).json({ message: 'Payment not completed yet', status: pi.status });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart empty' });

    const items = cart.items.map(i => ({ product: i.product._id, title: i.product.title, qty: i.qty, price: i.price }));
    const order = await Order.create({ user: req.user._id, items, amount: cart.total, paymentIntentId, status: 'placed', address });

    // clear cart
    await Cart.findOneAndDelete({ user: req.user._id });

    res.json(order);
  } catch (err) { next(err); }
};

// get user orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .populate('items.product', 'title images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user._id })
    ]);

    res.json({ 
      orders, 
      total, 
      page, 
      pages: Math.ceil(total / limit) 
    });
  } catch (err) { next(err); }
};

// admin: get all orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) {
      filter.$or = [
        { _id: { $regex: req.query.search, $options: 'i' } },
        { 'items.title': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('items.product', 'title images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    // Calculate statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({ 
      orders, 
      total, 
      page, 
      pages: Math.ceil(total / limit),
      stats 
    });
  } catch (err) { next(err); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'title images');
      
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Prevent certain status transitions
    if (order.status === 'delivered' && status !== 'delivered') {
      return res.status(400).json({ message: 'Cannot change status of delivered order' });
    }
    
    if (order.status === 'cancelled' && status !== 'cancelled') {
      return res.status(400).json({ message: 'Cannot change status of cancelled order' });
    }

    order.status = status;
    await order.save();
    
    res.json(order);
  } catch (err) { next(err); }
};

// Get order details by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'title images price');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Check if user owns this order (unless admin)
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (err) { next(err); }
};