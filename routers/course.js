const router = require("express").Router();

const {
	// Fungsi original untuk admin/akses penuh
	getAllCourses,
	getCourseById,

	// Fungsi baru untuk user dengan logika kunci
	getAllCoursesForUser,
	getCourseByIdForUser,
	getAllMateriByCourseId,

	// Fungsi utilitas lainnya
	createCourse,
	updateCourse,
	deleteCourse,
	getCourseStats,
} = require("../controllers/course");

const verifyToken = require("../middleware/verifyToken");

router.get("/", getAllCourses);
router.get("/stats", verifyToken, getCourseStats); // NEW - Statistics
router.get("/anggota", verifyToken, getAllCoursesForUser);
router.get("/anggota/:id", verifyToken, getCourseByIdForUser);
router.get("/materi/:id_course", getAllMateriByCourseId);
router.get("/:id", getCourseById);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
