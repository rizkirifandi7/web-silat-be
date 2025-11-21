const router = require("express").Router();

const anggotaRoutes = require("./anggota");
const authRoutes = require("./auth");
const katalogRoutes = require("./katalog");
const orderRoutes = require("./order");
const galeriRoutes = require("./galeri");
const materiRoutes = require("./materi");
const seminarRoutes = require("./seminar");
const courseRoutes = require("./course");
const rekeningRoutes = require("./rekening");
const donasiRoutes = require("./donasi");

// Payment routes (NEW - Simplified)
const donationPaymentRoutes = require("./donationPayment");
const seminarPaymentRoutes = require("./seminarPayment");

router.use("/course", courseRoutes);
router.use("/seminar", seminarRoutes);
router.use("/anggota", anggotaRoutes);
router.use("/auth", authRoutes);
router.use("/katalog", katalogRoutes);
router.use("/order", orderRoutes);
router.use("/galeri", galeriRoutes);
router.use("/materi", materiRoutes);
router.use("/rekening", rekeningRoutes);
router.use("/donasi", donasiRoutes);

// Payment endpoints
router.use("/payment/donation", donationPaymentRoutes);
router.use("/payment/seminar", seminarPaymentRoutes);

module.exports = router;
