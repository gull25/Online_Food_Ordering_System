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

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/restaurants', require('./restaurant.routes'));
router.use('/orders', require('./order.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/public', require('./public.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/reviews', require('./review.routes'));

module.exports = router;
