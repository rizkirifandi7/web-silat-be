const midtransClient = require("midtrans-client");

// Initialize Snap API
const snap = new midtransClient.Snap({
	isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
	serverKey: process.env.MIDTRANS_SERVER_KEY,
	clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * Create Snap Transaction
 * @param {Object} params - Transaction parameters
 * @returns {Promise<Object>}
 */
const createSnapTransaction = async (params) => {
	try {
		const transaction = await snap.createTransaction(params);
		return {
			token: transaction.token,
			redirect_url: transaction.redirect_url,
		};
	} catch (error) {
		console.error("Midtrans Error:", error.message);
		throw new Error(error.message || "Payment gateway error");
	}
};

/**
 * Get Transaction Status
 * @param {String} orderId
 * @returns {Promise<Object>}
 */
const getTransactionStatus = async (orderId) => {
	try {
		return await snap.transaction.status(orderId);
	} catch (error) {
		console.error("Get Status Error:", error.message);
		throw new Error("Failed to get transaction status");
	}
};

module.exports = {
	createSnapTransaction,
	getTransactionStatus,
};
