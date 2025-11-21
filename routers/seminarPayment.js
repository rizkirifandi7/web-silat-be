const express = require("express");
const router = express.Router();
const seminarPayment = require("../controllers/payment/seminarPayment");

// Create order & payment
router.post("/", seminarPayment.createOrder);

// Webhook
router.post("/webhook", seminarPayment.handleWebhook);

// Check status
router.get("/status/:order_id", seminarPayment.checkStatus);

module.exports = router;
