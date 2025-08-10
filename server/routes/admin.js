const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// image upload helper (stores file then uploads to Cloudinary)
const upload = multer({ dest: 'uploads/' });

// admin product CRUD
router.use(protect, adminOnly);
router.get('/products', productController.getAllProductsAdmin);
router.post('/products', upload.array('images', 5), productController.createProduct);
router.put('/products/:id', upload.array('images', 5), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// admin orders
router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.patch('/orders/:id', orderController.updateOrderStatus);

// upload image endpoint
router.post('/upload', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'vistaar' });
    fs.unlinkSync(req.file.path);
    res.json({ url: result.secure_url });
  } catch (err) { next(err); }
});

module.exports = router;