const router = require("express").Router();
const {
  getAllRekening,
  getRekeningById,
  createRekening,
  updateRekening,
  deleteRekening,
} = require("../controllers/rekening");

const upload = require("../middleware/multer");

router.get("/", getAllRekening);
router.get("/:id", getRekeningById);
router.post("/", upload.single("logo"), createRekening);
router.put("/:id", upload.single("logo"), updateRekening);
router.delete("/:id", deleteRekening);

module.exports = router;