const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : true,
  credentials: true,
};
app.use(cors(corsOptions));

// Webhook route requires raw body for Stripe signature verification
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

// Routes
app.use("/api", require("./routes/index.routes"));

// Error Middleware (Always last)
app.use(errorHandler);

module.exports = app;
