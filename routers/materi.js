const router = require("express").Router();

const {
	getAllMateri,
	getMateriById,
	createMateri,
	updateMateri,
	deleteMateri,
} = require("../controllers/materi");

const upload = require("../middleware/multer");

router.get("/", getAllMateri);
router.get("/:id", getMateriById);
router.post("/", upload.single("konten"), createMateri);
router.put("/:id", upload.single("konten"), updateMateri);
router.delete("/:id", deleteMateri);

module.exports = router;
