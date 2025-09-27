const express = require("express");
const router = express.Router();
const { createOrder, getOrderById } = require("../controllers/order");

router.post("/", createOrder);
router.get("/:id", getOrderById);

module.exports = router;
