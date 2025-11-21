const axios = require("axios");

async function testCheckStatus() {
	console.log("\n📊 TESTING CHECK STATUS WITH MIDTRANS SYNC");
	console.log("=".repeat(80));

	// Ganti dengan transaction_id yang valid
	const TRANSACTION_ID = "DONATE-1-1763631591273-kjofog7gs";

	try {
		console.log("📤 Checking status for:", TRANSACTION_ID);
		console.log("");

		const response = await axios.get(
			`http://localhost:8015/payment/donation/status/${TRANSACTION_ID}`
		);

		console.log("✅ SUCCESS!");
		console.log("=".repeat(80));

		const donation = response.data.data.donation;

		console.log("Transaction ID:", donation.transaction_id);
		console.log("Payment Status:", donation.payment_status);
		console.log("Payment Date:", donation.payment_date || "Not paid yet");
		console.log("Donation Amount:", donation.donation_amount);
		console.log("Total Amount:", donation.total_amount);
		console.log("");
		console.log("Campaign:", donation.campaign.title);
		console.log("");

		if (donation.payment_status === "pending") {
			console.log("💡 Status masih PENDING");
			console.log("   - Ini normal untuk Sandbox Midtrans");
			console.log("   - Gunakan Midtrans Simulator untuk complete payment");
			console.log("   - Atau test webhook manual dengan: node test-webhook.js");
		} else if (donation.payment_status === "settlement") {
			console.log("✅ Payment SUCCESSFUL!");
		} else {
			console.log("⚠️ Payment status:", donation.payment_status);
		}
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

testCheckStatus();
