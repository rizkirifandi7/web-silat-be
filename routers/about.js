const express = require("express");
const router = express.Router();
const AboutController = require("../controllers/about");
const verifyToken = require("../middleware/verifyToken");

// Public route - Get active about content
router.get("/active", AboutController.getActiveAbout);

// Admin routes - Protected
router.get("/", verifyToken, AboutController.getAllAbouts);
router.get("/:id", verifyToken, AboutController.getAboutById);
router.post("/", verifyToken, AboutController.createAbout);
router.put("/:id", verifyToken, AboutController.updateAbout);
router.delete("/:id", verifyToken, AboutController.deleteAbout);
router.patch("/:id/toggle", verifyToken, AboutController.toggleActive);

module.exports = router;
