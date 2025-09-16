const router = require("express").Router();

const anggotaRoutes = require("./anggota");
const authRoutes = require("./auth");

router.use("/anggota", anggotaRoutes);
router.use("/auth", authRoutes);

module.exports = router;
