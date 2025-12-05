const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const {
	Register,
	Login,
	GetProfile,
	UpdateProfile,
	ChangePassword,
	Logout,
	RefreshAccessToken,
	LogoutAll,
} = require("../controllers/auth");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/multer");

// Rate Limiting - Auth endpoints (stricter)
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // Increased from 5 to 50 to avoid blocking during development
	message: "Terlalu banyak percobaan login, coba lagi dalam 15 menit",
	standardHeaders: true,
	legacyHeaders: false,
});

router.post("/login", authLimiter, Login);
router.post("/register", authLimiter, upload.single("foto"), Register);
router.post("/refresh", RefreshAccessToken); // NEW
router.get("/profile", verifyToken, GetProfile);
router.put("/profile", verifyToken, upload.single("foto"), UpdateProfile);
router.post("/change-password", verifyToken, ChangePassword);
router.post("/logout", verifyToken, Logout);
router.post("/logout-all", verifyToken, LogoutAll); // NEW

module.exports = router;
