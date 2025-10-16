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

// Definisikan hierarki tingkatan
const tingkatanHierarchy = {
	"Belum punya": 0,
	"LULUS Binfistal": 1,
	"Sabuk Putih": 2,
	"Sabuk Kuning": 3,
	"Sabuk Hijau": 4,
	"Sabuk Merah": 5,
	"Sabuk Hitam Wiraga 1": 6,
	"Sabuk Hitam Wiraga 2": 7,
	"Sabuk Hitam Wiraga 3": 8,
};

// Fungsi bantuan untuk memproses status kunci materi
const processMateriLockStatus = (materiList, userLevel) => {
	if (!materiList || materiList.length === 0) return [];
	return materiList.map((materi) => {
		const materiData = materi.get({ plain: true });
		const materiLevel = tingkatanHierarchy[materiData.tingkatan];
		const isLocked = userLevel < materiLevel;

		materiData.isLocked = isLocked;
		if (isLocked) {
			materiData.konten = null;
		}
		return materiData;
	});
};

/**
 * @description (BARU) Mengambil semua course beserta materi dengan status 'isLocked' untuk pengguna.
 * Jika user level < level materi, maka Materi akan dikembalikan sebagai array kosong.
 */
const getAllCoursesForUser = async (req, res) => {
	try {
		const userTingkatan = req.user.tingkatan_sabuk;
		const userLevel = tingkatanHierarchy[userTingkatan] || 0;

		const courses = await Course.findAll({
			include: { model: Materi },
		});

		const coursesWithLockStatus = courses.map((course) => {
			const courseData = course.get({ plain: true });

			// Jika user tidak punya tingkatan, Materi dikosongkan
			if (userLevel === 0) {
				courseData.Materi = [];
			} else {
				courseData.Materi = processMateriLockStatus(course.Materi, userLevel);
			}
			// Hapus properti duplikat 'Materis' jika ada untuk membersihkan output
			delete courseData.Materis;

			return courseData;
		});

		console.log(coursesWithLockStatus);

		res.status(200).json(coursesWithLockStatus);
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
		const userTingkatan = req.user.tingkatan;
		const userLevel = tingkatanHierarchy[userTingkatan] || 0;

		const course = await Course.findByPk(id, {
			include: { model: Materi },
		});

		if (course) {
			const courseData = course.get({ plain: true });
			courseData.Materi = processMateriLockStatus(course.Materi, userLevel);
			res.status(200).json(courseData);
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
