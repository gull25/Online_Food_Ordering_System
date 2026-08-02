const router = require("express").Router();

router.get("/", (req, res) => {
    res.send("Backend is working");
});

router.get("/status", (req, res) => {
    res.json({
        status: "ok",
        db: "connected",
        message: "MERN Architecture API Running",
    });
});

const categoryRoutes = require('./category.routes');

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/restaurants', require('./restaurant.routes'));
router.use('/orders', require('./order.routes'));
router.use('/rider', require('./rider.routes'));

router.use('/public', require('./public.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/stripe', require('./stripe.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/categories', categoryRoutes);
router.use('/offers', require('./offer.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
