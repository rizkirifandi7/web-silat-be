const express = require("express");
const router = express.Router();
const { Register, Login, changePassword } = require("../controllers/auth");
const verifyToken = require("../middleware/verifyToken");
const upload = require("../middleware/multer");

router.post("/login", Login);
router.post("/register", upload.single("foto"), Register);
router.post("/change-password", verifyToken, changePassword);

module.exports = router;
