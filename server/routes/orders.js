const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { createPaymentIntent, createOrder, getMyOrders, getOrderById } = require('../controllers/orderController');
const { paymentLimiter } = require('../middleware/rateLimiter');

router.use(protect);
router.post('/create-payment-intent', paymentLimiter, createPaymentIntent);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;