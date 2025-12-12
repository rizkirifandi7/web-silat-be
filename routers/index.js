const router = require("express").Router();

const anggotaRoutes = require("./anggota");
const authRoutes = require("./auth");
const katalogRoutes = require("./katalog");
const orderRoutes = require("./order");
const galeriRoutes = require("./galeri");
const materiRoutes = require("./materi");
const courseRoutes = require("./course");
const rekeningRoutes = require("./rekening");
const donasiRoutes = require("./donasi");
const aboutRoutes = require("./about");
const uploadRoutes = require("./upload");

// Payment routes
const donationPaymentRoutes = require("./donationPayment");

// Existing Routes
router.use("/course", courseRoutes);
router.use("/anggota", anggotaRoutes);
router.use("/auth", authRoutes);
router.use("/katalog", katalogRoutes);
router.use("/order", orderRoutes);
router.use("/galeri", galeriRoutes);
router.use("/materi", materiRoutes);
router.use("/rekening", rekeningRoutes);
router.use("/donasi", donasiRoutes);
router.use("/about", aboutRoutes);
router.use("/upload", uploadRoutes);
router.use("/payment/donation", donationPaymentRoutes);

module.exports = router;
