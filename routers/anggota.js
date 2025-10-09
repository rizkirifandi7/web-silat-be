const router = require("express").Router();
const {
	getAllAnggota,
	getAllAnggotaAdmin,
	getAnggotaById,
	updateAnggota,
	deleteAnggota,
	getAnggotaByIdToken,
} = require("../controllers/anggota");

const upload = require("../middleware/multer");

router.get("/", getAllAnggota);
router.get("/admins", getAllAnggotaAdmin);
router.get("/:id", getAnggotaById);
router.put("/:id", upload.single("foto"), updateAnggota);
router.delete("/:id", deleteAnggota);
router.get("/token/:id_token", getAnggotaByIdToken);

module.exports = router;
