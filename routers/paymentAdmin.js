const express = require("express");
const router = express.Router();
const PaymentCleanupService = require("../services/paymentCleanup");
const { verifyToken, isAdmin } = require("../middleware/verifyToken");

/**
 * @route   POST /api/admin/payments/cleanup
 * @desc    Manually trigger payment cleanup (Admin only)
 * @access  Admin
 */
router.post("/cleanup", verifyToken, isAdmin, async (req, res, next) => {
	try {
		const result = await PaymentCleanupService.cancelExpiredPayments();

		res.status(200).json({
			success: true,
			message: "Payment cleanup completed",
			data: result,
		});
	} catch (error) {
		next(error);
	}
});

/**
 * @route   GET /api/admin/payments/expiring
 * @desc    Get list of payments that will expire soon (Admin only)
 * @access  Admin
 */
router.get("/expiring", verifyToken, isAdmin, async (req, res, next) => {
	try {
		const payments = await PaymentCleanupService.getExpiringPayments();

		res.status(200).json({
			success: true,
			message: "Expiring payments retrieved",
			data: payments,
		});
	} catch (error) {
		next(error);
	}
});

module.exports = router;
