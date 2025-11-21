const midtransClient = require("midtrans-client");

// Initialize Snap
let snap = new midtransClient.Snap({
	serverKey: "SB-Mid-server-4a51n5079iuyrK0cKhR0aJVJ",
	isProduction: false,
});

async function testSnapPayment() {
	console.log("\n🧪 TESTING MIDTRANS SNAP PAYMENT");
	console.log("=".repeat(80));

	// Dummy transaction data
	let parameter = {
		transaction_details: {
			// Order ID harus unik setiap transaksi. Kita gunakan timestamp.
			order_id: "ORDER-" + new Date().getTime(),
			gross_amount: 150000, // Total harga (IDR)
		},
		credit_card: {
			secure: true,
		},
		customer_details: {
			first_name: "Rizki",
			last_name: "Developer",
			email: "rizki@example.com",
			phone: "08111222333",
		},
		item_details: [
			{
				id: "ITEM-01",
				price: 100000,
				quantity: 1,
				name: "Sepatu Futsal Keren",
			},
			{
				id: "ITEM-02",
				price: 50000,
				quantity: 1,
				name: "Kaos Kaki Sport",
			},
		],
	};

	try {
		const transaction = await snap.createTransaction(parameter);

		console.log("✅ SUCCESS!");
		console.log("=".repeat(80));
		console.log("🔑 Snap Token:", transaction.token);
		console.log("🔗 Redirect URL:", transaction.redirect_url);
		console.log("");
		console.log("📱 Open this URL in browser to see Snap popup:");
		console.log(transaction.redirect_url);
		console.log("");
		console.log("💡 Or use snap.js with token:", transaction.token);

		return transaction;
	} catch (error) {
		console.error("\n❌ ERROR!");
		console.error("=".repeat(80));
		console.error("Message:", error.message);

		if (error.ApiResponse) {
			console.error(
				"API Response:",
				JSON.stringify(error.ApiResponse, null, 2)
			);
		}
	}
}

// Run test
testSnapPayment();
