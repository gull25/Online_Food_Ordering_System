const express = require("express");
const cors = require("cors");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", require("./routes/index.routes"));

// Error Middleware (Always last)
app.use(errorHandler);

module.exports = app;
