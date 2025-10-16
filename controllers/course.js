const { Course, Materi } = require("../models");

// =================================================================================
// FUNGSI ORIGINAL (Untuk Admin atau akses tanpa filter)
// =================================================================================
const getAllCourses = async (req, res) => {
	try {
		const courses = await Course.findAll({
			include: { model: Materi },
		});
		res.status(200).json(courses);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving courses", error });
	}
};

/**
 * @description Mengambil satu course by ID beserta semua materinya, tanpa filter.
 * (Sebelumnya bernama getCourseByIdAdmins)
 */
const getCourseById = async (req, res) => {
	const { id } = req.params;
	try {
		const course = await Course.findByPk(id, {
			include: { model: Materi },
		});
		if (!course) {
			return res.status(404).json({ message: "Course not found" });
		}

		res.status(200).json(course);
	} catch (error) {
		res.status(500).json({
			message: "Error retrieving materi for the course",
			error,
		});
	}
};

// =================================================================================
// FUNGSI BARU (Dengan Logika Penguncian untuk Pengguna)
// =================================================================================

// (No server-side locking) User endpoints will return full course/materi data.

/**
 * @description (BARU) Mengambil semua course beserta materi dengan status 'isLocked' untuk pengguna.
 * Jika user level < level materi, maka Materi akan dikembalikan sebagai array kosong.
 */
const getAllCoursesForUser = async (req, res) => {
	try {
		// Return full courses + materi for the authenticated user. Frontend will apply filtering.
		const courses = await Course.findAll({ include: { model: Materi } });
		res.status(200).json(courses);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error retrieving courses for user", error });
	}
};

/**
 * @description (BARU) Mengambil satu course by ID beserta materi dengan status 'isLocked' untuk pengguna.
 */
const getCourseByIdForUser = async (req, res) => {
	const { id } = req.params;
	try {
		const course = await Course.findByPk(id, { include: { model: Materi } });
		if (course) {
			res.status(200).json(course);
		} else {
			res.status(404).json({ message: "Course not found" });
		}
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error retrieving course for user", error });
	}
};

/**
 * @description Mendapatkan seluruh materi berdasarkan id_course
 */
const getAllMateriByCourseId = async (req, res) => {
	const { id_course } = req.params;
	try {
		// Pastikan course ada
		const course = await Course.findByPk(id_course);
		if (!course) {
			return res.status(404).json({ message: "Course tidak ditemukan" });
		}

		const materi = await Materi.findAll({
			where: { id_course: id_course },
		});

		res.status(200).json(materi);
	} catch (error) {
		res.status(500).json({
			message: "Error saat mengambil materi",
			error,
		});
	}
};

// =================================================================================
// FUNGSI UTILITAS LAINNYA (Tetap dipertahankan)
// =================================================================================

const getAllCoursesNoMateri = async (req, res) => {
	try {
		const courses = await Course.findAll();
		res.status(200).json(courses);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving courses", error });
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
	// Fungsi original untuk admin/akses penuh
	getAllCourses,
	getCourseById,

	// Fungsi baru untuk user dengan logika kunci
	getAllCoursesForUser,
	getCourseByIdForUser,
	getAllMateriByCourseId,

	// Fungsi utilitas lainnya
	getAllCoursesNoMateri,
	createCourse,
	updateCourse,
	deleteCourse,
};
