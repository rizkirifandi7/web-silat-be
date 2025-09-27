const router = require("express").Router();
const {
  getAllSeminar,
  getSeminarById,
  createSeminar,
  updateSeminar,
  deleteSeminar,
} = require("../controllers/seminar");
const upload = require("../middleware/multer");

router.get("/", getAllSeminar);
router.get("/:id", getSeminarById);
router.post("/", upload.single("gambar"), createSeminar);
router.put("/:id", upload.single("gambar"), updateSeminar);
router.delete("/:id", deleteSeminar);

module.exports = router;
