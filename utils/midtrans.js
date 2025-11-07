const midtransClient = require("midtrans-client");
const crypto = require("crypto");

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
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
 * @param {Object} data - Payment data
 * @returns {Promise<Object>} Transaction result
 */
const createTransaction = async (data) => {
	try {
		const parameter = {
			transaction_details: {
				order_id: data.order_id,
				gross_amount: Math.round(data.amount), // Must be integer
			},
			customer_details: {
				first_name: data.customer_name,
				email: data.customer_email,
				phone: data.customer_phone,
			},
			item_details: [
				{
					id: data.seminar_id,
					price: Math.round(data.amount),
					quantity: 1,
					name: data.seminar_name,
				},
			],
			callbacks: {
				finish: `${process.env.FRONTEND_URL}/payment/success`,
				error: `${process.env.FRONTEND_URL}/payment/error`,
				pending: `${process.env.FRONTEND_URL}/payment/pending`,
			},
			expiry: {
				unit: "hours",
				duration: 24,
			},
		};

		const transaction = await snap.createTransaction(parameter);
		return {
			success: true,
			token: transaction.token,
			redirect_url: transaction.redirect_url,
		};
	} catch (error) {
		console.error("Midtrans create transaction error:", error);
		return {
			success: false,
			error: error.message,
		};
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
 * Check transaction status from Midtrans
 * @param {String} orderId - Order ID to check
 * @returns {Promise<Object>} Transaction status
 */
const checkTransactionStatus = async (orderId) => {
	try {
		const status = await snap.transaction.status(orderId);
		return {
			success: true,
			data: status,
		};
	} catch (error) {
		console.error("Check transaction status error:", error);
		return {
			success: false,
			error: error.message,
		};
	}
};

module.exports = {
	generateOrderId,
	createTransaction,
	verifySignature,
	checkTransactionStatus,
};
