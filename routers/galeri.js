const router = require("express").Router();
const {
	getAllGaleri,
	getGaleriById,
	createGaleri,
	updateGaleri,
	deleteGaleri,
	uploadGaleriImage,
} = require("../controllers/galeri");

const upload = require("../middleware/multer");
const verifyToken = require("../middleware/verifyToken");

// Optional multer - accepts both JSON and multipart/form-data
const optionalUpload = (req, res, next) => {
	if (req.is("multipart/form-data")) {
		return upload.single("gambar")(req, res, next);
	}
	next();
};

router.get("/", getAllGaleri);
router.get("/:id", getGaleriById);
router.post("/", optionalUpload, createGaleri);
router.put("/:id", optionalUpload, updateGaleri);
router.delete("/:id", deleteGaleri);

// Upload galeri image (separate endpoint like donation campaign)
router.post("/upload", verifyToken, upload.single("gambar"), uploadGaleriImage);

module.exports = router;
