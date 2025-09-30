const router = require("express").Router();

const {
	getAllCourses,
	getCourseById,
	createCourse,
	updateCourse,
	deleteCourse,
} = require("../controllers/course");

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
