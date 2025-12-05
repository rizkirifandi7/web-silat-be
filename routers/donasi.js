const express = require("express");
const router = express.Router();
const multer = require("../middleware/multer");
const verifyToken = require("../middleware/verifyToken");

// Import controllers
const campaignController = require("../controllers/donasi/campaign");
const donationController = require("../controllers/donasi/donation");
const paymentMethodController = require("../controllers/donasi/paymentmethod");

// ============== CAMPAIGN ROUTES ==============

// Public routes
router.get("/campaigns", campaignController.getAllCampaignsOptimized);
router.get("/campaigns/:slug", campaignController.getCampaignBySlugOptimized);

// Protected routes (require authentication)
// Create and update support both JSON and multipart/form-data
const optionalMulter = (req, res, next) => {
	if (req.is("multipart/form-data")) {
		return multer.fields([
			{ name: "image", maxCount: 1 },
			{ name: "organizer_image", maxCount: 1 },
		])(req, res, next);
	}
	next();
};

router.post(
	"/campaigns",
	verifyToken,
	optionalMulter,
	campaignController.createCampaignOptimized
);

router.put(
	"/campaigns/:id",
	verifyToken,
	optionalMulter,
	campaignController.updateCampaignOptimized
);

router.delete(
	"/campaigns/:id",
	verifyToken,
	campaignController.deleteCampaignOptimized
);

// Upload campaign image
router.post(
	"/campaigns/upload",
	verifyToken,
	multer.single("image"),
	campaignController.uploadCampaignImage
);

// ============== DONATION ROUTES ==============

// Public routes
router.post("/donations", donationController.createDonation);
router.get(
	"/donations/check/:transaction_id",
	donationController.checkDonationStatus
);

// Midtrans webhook
router.post(
	"/donations/notification",
	donationController.handleMidtransNotification
);

// Protected routes (admin)
router.get("/donations", verifyToken, donationController.getDonations);
router.get(
	"/donations/recent",
	verifyToken,
	donationController.getRecentDonations
);
router.get(
	"/donations/statistics",
	verifyToken,
	donationController.getDonationStatistics
);
router.get(
	"/donations/export",
	verifyToken,
	donationController.exportDonations
);
router.get("/donations/:id", verifyToken, donationController.getDonationById);
router.patch(
	"/donations/:id/status",
	verifyToken,
	donationController.updateDonationStatus
);

// Get donors by campaign
router.get(
	"/campaigns/:campaign_id/donors",
	verifyToken,
	donationController.getDonorsByCampaign
);

// ============== PAYMENT METHOD ROUTES ==============

// Public routes
router.get("/payment-methods", paymentMethodController.getAllPaymentMethods);
router.get(
	"/payment-methods/:id",
	paymentMethodController.getPaymentMethodById
);

// Protected routes (admin)
router.post(
	"/payment-methods",
	verifyToken,
	multer.single("icon"),
	paymentMethodController.createPaymentMethod
);
router.put(
	"/payment-methods/:id",
	verifyToken,
	multer.single("icon"),
	paymentMethodController.updatePaymentMethod
);
router.delete(
	"/payment-methods/:id",
	verifyToken,
	paymentMethodController.deletePaymentMethod
);

// Upload payment method icon
router.post(
	"/payment-methods/upload",
	verifyToken,
	multer.single("icon"),
	paymentMethodController.uploadPaymentMethodIcon
);

module.exports = router;
