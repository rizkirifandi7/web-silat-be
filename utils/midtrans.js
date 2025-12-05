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
	return `ORDER-${timestamp}-${random}`;
};

/**
 * Create Snap transaction (All payment methods)
 * @param {Object} parameter - Transaction parameter
 * @returns {Promise<Object>} Transaction result
 */
const createTransaction = async (parameter) => {
	try {
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

		const transaction = await snap.createTransaction(parameter);

		return {
			token: transaction.token,
			redirect_url: transaction.redirect_url,
			transaction_id: parameter.transaction_details.order_id,
			expiry_time: null, // Midtrans doesn't return exact expiry time
		};
	} catch (error) {
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
		const chargeResponse = await core.charge(parameter);
		return chargeResponse;
	} catch (error) {
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

