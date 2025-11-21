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
router.get("/campaigns", campaignController.getAllCampaigns);
router.get("/campaigns/:slug", campaignController.getCampaignBySlug);
router.get(
	"/campaigns/:id/statistics",
	campaignController.getCampaignStatistics
);

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
	campaignController.createCampaign
);

router.put(
	"/campaigns/:id",
	verifyToken,
	optionalMulter,
	campaignController.updateCampaign
);

router.delete("/campaigns/:id", verifyToken, campaignController.deleteCampaign);

// Upload campaign image
router.post(
	"/campaigns/upload",
	verifyToken,
	multer.fields([{ name: "image", maxCount: 1 }]),
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
