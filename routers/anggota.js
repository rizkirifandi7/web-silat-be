const router = require("express").Router();
const {
	getAllAnggota,
	getAnggotaById,
	createAnggota,
	updateAnggota,
	deleteAnggota,
	getAnggotaByIdToken,
} = require("../controllers/anggota");

const upload = require("../middleware/multer");

router.get("/", getAllAnggota);
router.get("/:id", getAnggotaById);
router.post("/", upload.single("foto"), createAnggota);
router.put("/:id", upload.single("foto"), updateAnggota);
router.delete("/:id", deleteAnggota);
router.get("/token/:id_token", getAnggotaByIdToken);

module.exports = router;
