const midtransClient = require("midtrans-client");
const crypto = require("crypto");

// Initialize Midtrans Snap with v1 API
const snap = new midtransClient.Snap({
	isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
	serverKey: process.env.MIDTRANS_SERVER_KEY,
	clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

// Initialize Midtrans Core API (for direct charge)
const core = new midtransClient.CoreApi({
	isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
	serverKey: process.env.MIDTRANS_SERVER_KEY,
	clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * Generate unique order ID
 */
const generateOrderId = () => {
	const timestamp = Date.now();
	const random = Math.floor(Math.random() * 1000);
	return `SEMINAR-${timestamp}-${random}`;
};

/**
 * Create Snap transaction (All payment methods)
 * @param {Object} parameter - Transaction parameter
 * @returns {Promise<Object>} Transaction result
 */
const createTransaction = async (parameter) => {
	try {
		console.log("\n🔧 [MIDTRANS UTILS] Creating transaction...");

		// parameter already in correct format from controller
		// Add callbacks if not provided
		if (!parameter.callbacks) {
			parameter.callbacks = {
				finish: `${process.env.FRONTEND_URL}/payment/success`,
				error: `${process.env.FRONTEND_URL}/payment/error`,
				pending: `${process.env.FRONTEND_URL}/payment/pending`,
			};
		}

		// Add expiry if not provided
		if (!parameter.expiry) {
			parameter.expiry = {
				unit: "hours",
				duration: 24,
			};
		}

		console.log("📤 Final parameter to Midtrans API:");
		console.log(JSON.stringify(parameter, null, 2));

		const transaction = await snap.createTransaction(parameter);

		console.log("✅ Transaction created successfully!");
		console.log("🔑 Snap Token:", transaction.token);
		console.log("🔗 Redirect URL:", transaction.redirect_url);

		return {
			token: transaction.token,
			redirect_url: transaction.redirect_url,
			transaction_id: parameter.transaction_details.order_id,
			expiry_time: null, // Midtrans doesn't return exact expiry time
		};
	} catch (error) {
		console.error("\n❌ [MIDTRANS UTILS] Create transaction error:");
		console.error("Error Message:", error.message);
		console.error("Error Stack:", error.stack);

		if (error.response) {
			console.error("API Response Status:", error.response.status);
			console.error(
				"API Response Data:",
				JSON.stringify(error.response.data, null, 2)
			);
		}

		if (error.httpStatusCode) {
			console.error("HTTP Status Code:", error.httpStatusCode);
		}

		if (error.ApiResponse) {
			console.error(
				"Midtrans API Response:",
				JSON.stringify(error.ApiResponse, null, 2)
			);
		}

		throw error;
	}
};

/**
 * Verify webhook notification signature
 * @param {Object} notification - Webhook notification from Midtrans
 * @returns {Boolean} Is signature valid
 */
const verifySignature = (notification) => {
	try {
		const { order_id, status_code, gross_amount, signature_key } = notification;
		const serverKey = process.env.MIDTRANS_SERVER_KEY;

		const string = order_id + status_code + gross_amount + serverKey;
		const hash = crypto.createHash("sha512").update(string).digest("hex");

		return hash === signature_key;
	} catch (error) {
		console.error("Verify signature error:", error);
		return false;
	}
};

/**
 * Create Bank Transfer (VA) transaction using Core API
 * This is more reliable for Virtual Account than Snap
 * @param {Object} parameter - Transaction parameter
 * @returns {Promise<Object>} Transaction result with VA number
 */
const createBankTransfer = async (parameter) => {
	try {
		console.log("\n🏦 [MIDTRANS CORE API] Creating Bank Transfer...");
		console.log("📤 Parameter:", JSON.stringify(parameter, null, 2));

		const chargeResponse = await core.charge(parameter);

		console.log("✅ Bank Transfer created successfully!");
		console.log(
			"🔢 VA Number:",
			chargeResponse.va_numbers?.[0]?.va_number || "N/A"
		);
		console.log("📦 Full Response:", JSON.stringify(chargeResponse, null, 2));

		return chargeResponse;
	} catch (error) {
		console.error("\n❌ [MIDTRANS CORE API] Create bank transfer error:");
		console.error("Error Message:", error.message);

		if (error.ApiResponse) {
			console.error(
				"Midtrans API Response:",
				JSON.stringify(error.ApiResponse, null, 2)
			);
		}

		// Create a clean error object without circular references
		const cleanError = new Error(
			error.message || "Failed to create bank transfer"
		);
		cleanError.statusCode = error.httpStatusCode || 500;
		cleanError.apiResponse = error.ApiResponse;

		throw cleanError;
	}
};

/**
 * Check transaction status from Midtrans
 * @param {String} orderId - Order ID to check
 * @returns {Promise<Object>} Transaction status
 */
const getTransactionStatus = async (orderId) => {
	try {
		const status = await snap.transaction.status(orderId);
		return status;
	} catch (error) {
		console.error("Check transaction status error:", error);
		throw new Error(error.message || "Failed to get transaction status");
	}
};

module.exports = {
	generateOrderId,
	createTransaction,
	createBankTransfer,
	verifySignature,
	getTransactionStatus,
};
