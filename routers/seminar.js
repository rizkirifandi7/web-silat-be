const router = require("express").Router();
const {
	getAllSeminars,
	getSeminarById,
	createSeminar,
	updateSeminar,
	deleteSeminar,
} = require("../controllers/seminar");
const upload = require("../middleware/multer");

router.get("/", getAllSeminars);
router.get("/:id", getSeminarById);
router.post("/", upload.fields([{ name: "gambar" }, { name: "gambar_banner" }]), createSeminar);
router.put("/:id", upload.fields([{ name: "gambar" }, { name: "gambar_banner" }]), updateSeminar);
router.delete("/:id", deleteSeminar);

module.exports = router;
