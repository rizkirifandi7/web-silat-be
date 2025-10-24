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

router.use("/course", courseRoutes);
router.use("/seminar", seminarRoutes);
router.use("/anggota", anggotaRoutes);
router.use("/auth", authRoutes);
router.use("/katalog", katalogRoutes);
router.use("/order", orderRoutes);
router.use("/galeri", galeriRoutes);
router.use("/materi", materiRoutes);
router.use("/rekening", require("./rekening"));

module.exports = router;
