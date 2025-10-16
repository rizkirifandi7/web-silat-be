const router = require("express").Router();

const {
	// Fungsi original untuk admin
	getAllMateri,
	getMateriById,

	// Fungsi baru untuk user
	getAllMateriForUser,
	getMateriByIdForUser,

	// Fungsi manajemen
	createMateri,
	updateMateri,
	deleteMateri,
} = require("../controllers/materi");

const upload = require("../middleware/multer");

router.get("/", getAllMateri);
router.get("/anggota", getAllMateriForUser);
router.get("/anggota/:id", getMateriByIdForUser);
router.get("/:id", getMateriById);
router.post("/", upload.single("konten"), createMateri);
router.put("/:id", upload.single("konten"), updateMateri);
router.delete("/:id", deleteMateri);

module.exports = router;
