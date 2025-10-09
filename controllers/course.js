const { Course, Materi } = require("../models");

const getAllCourses = async (req, res) => {
	try {
		const courses = await Course.findAll({
			include: [{ model: Materi }],
		});
		res.status(200).json(courses);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving courses", error });
	}
};

const getCourseById = async (req, res) => {
	const { id } = req.params;
	try {
		const course = await Course.findByPk(id, {
			include: [{ model: Materi }],
		});
		if (course) {
			res.status(200).json(course);
		} else {
			res.status(404).json({ message: "Course not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving course", error });
	}
};

const getAllMateriByCourseId = async (req, res) => {
	const { id_course } = req.params;
	try {
		const course = await Course.findByPk(id_course);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		const materi = await Materi.findAll({
			where: { courseId: id_course },
		});

		res.status(200).json(materi);
	} catch (error) {
		res.status(500).json({
			message: "Error retrieving materi for the course",
			error,
		});
	}
};

const createCourse = async (req, res) => {
	const { judul, deskripsi } = req.body;
	try {
		const newCourse = await Course.create({ judul, deskripsi });
		res.status(201).json(newCourse);
	} catch (error) {
		res.status(500).json({ message: "Error creating course", error });
	}
};

const updateCourse = async (req, res) => {
	const { id } = req.params;
	const { judul, deskripsi } = req.body;
	try {
		const course = await Course.findByPk(id);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}
		course.judul = judul || course.judul;
		course.deskripsi = deskripsi || course.deskripsi;
		await course.save();
		res.status(200).json(course);
	} catch (error) {
		res.status(500).json({ message: "Error updating course", error });
	}
};

const deleteCourse = async (req, res) => {
	const { id } = req.params;
	try {
		const course = await Course.findByPk(id);
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		await course.destroy();
		res.status(200).json({ message: "Course deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting course", error });
	}
};

module.exports = {
	getAllCourses,
	getCourseById,
	getAllMateriByCourseId,
	createCourse,
	updateCourse,
	deleteCourse,
};
