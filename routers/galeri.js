const router = require("express").Router();
const {
	getAllGaleri,
	getGaleriById,
	createGaleri,
	updateGaleri,
	deleteGaleri,
} = require("../controllers/galeri");

const upload = require("../middleware/multer");

router.get("/", getAllGaleri);
router.get("/:id", getGaleriById);
router.post("/", upload.single("gambar"), createGaleri);
router.put("/:id", upload.single("gambar"), updateGaleri);
router.delete("/:id", deleteGaleri);

module.exports = router;
