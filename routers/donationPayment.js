const express = require("express");
const router = express.Router();
const donationPayment = require("../controllers/payment/donationPayment");

// Create donation & payment
router.post("/", donationPayment.createDonation);

// Webhook
router.post("/webhook", donationPayment.handleWebhook);

// Check status
router.get("/status/:transaction_id", donationPayment.checkStatus);

module.exports = router;
