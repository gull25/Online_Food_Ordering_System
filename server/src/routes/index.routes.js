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

module.exports = router;
