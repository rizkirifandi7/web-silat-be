const router = require("express").Router();

const anggotaRoutes = require("./anggota");
const authRoutes = require("./auth");
const katalogRoutes = require("./katalog");
const orderRoutes = require("./order");
const galeriRoutes = require("./galeri");

router.use("/anggota", anggotaRoutes);
router.use("/auth", authRoutes);
router.use("/katalog", katalogRoutes);
router.use("/order", orderRoutes);
router.use("/galeri", galeriRoutes);

module.exports = router;
