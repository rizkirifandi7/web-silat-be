const router = require("express").Router();
const {
	getAllAnggota,
	getAllAnggotaAdmin,
	getAnggotaById,
	updateAnggota,
	deleteAnggota,
	getAnggotaByIdToken,
	getAnggotaStats,
	bulkUpdateStatus,
} = require("../controllers/anggota");

const upload = require("../middleware/multer");
const verifyToken = require("../middleware/verifyToken");

router.get("/", getAllAnggota);
router.get("/admins", getAllAnggotaAdmin);
router.get("/stats", verifyToken, getAnggotaStats); // NEW - Statistics endpoint
router.get("/:id", getAnggotaById);
router.put("/:id", upload.single("foto"), updateAnggota);
router.post("/bulk-update-status", verifyToken, bulkUpdateStatus); // NEW - Bulk update
router.delete("/:id", deleteAnggota);
router.get("/token/:id_token", getAnggotaByIdToken);

module.exports = router;
