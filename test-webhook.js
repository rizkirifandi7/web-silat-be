const axios = require("axios");

async function testWebhook() {
	console.log("\n🔔 TESTING DONATION WEBHOOK");
	console.log("=".repeat(80));

	// Ganti dengan transaction_id yang baru dibuat
	const TRANSACTION_ID = "DONATE-1-1763520356727-thif4pdhy"; // Ganti dengan transaction_id Anda

	// Simulate Midtrans webhook notification for SETTLEMENT
	const webhookPayload = {
		transaction_time: "2025-11-20 10:30:00",
		transaction_status: "settlement", // or "capture" for credit card
		transaction_id: "test-transaction-123",
		status_message: "Success",
		status_code: "200",
		signature_key: "dummy-signature",
		payment_type: "bank_transfer",
		order_id: TRANSACTION_ID,
		merchant_id: "M123456",
		gross_amount: "54000.00",
		fraud_status: "accept",
		currency: "IDR",
	};

	try {
		console.log("📤 Sending webhook to backend...");
		console.log("Transaction ID:", TRANSACTION_ID);
		console.log("Status:", webhookPayload.transaction_status);
		console.log("");

		const response = await axios.post(
			"http://localhost:8015/payment/donation/webhook",
			webhookPayload
		);

		console.log("✅ WEBHOOK SUCCESS!");
		console.log("=".repeat(80));
		console.log("Response:", response.data);
		console.log("");

		// Check status after webhook
		console.log("📊 Checking donation status...");
		const statusResponse = await axios.get(
			`http://localhost:8015/payment/donation/status/${TRANSACTION_ID}`
		);

		console.log(
			"Payment Status:",
			statusResponse.data.data.donation.payment_status
		);
		console.log(
			"Payment Date:",
			statusResponse.data.data.donation.payment_date
		);
		console.log("");
		console.log(
			"Full donation data:",
			JSON.stringify(statusResponse.data, null, 2)
		);
	} catch (error) {
		console.error("\n❌ ERROR!");
		console.error("=".repeat(80));
		if (error.response) {
			console.error("Response:", error.response.data);
		} else {
			console.error("Error:", error.message);
		}
	}
}

testWebhook();
