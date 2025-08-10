const router = require('express').Router();
const { protect } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

router.use(protect);
router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/', cartController.updateCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;