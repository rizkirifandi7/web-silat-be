const { Materi } = require("../models");
const cloudinary = require("../middleware/cloudinary");
const fs = require("fs");

// =================================================================================
// FUNGSI ORIGINAL (Untuk Admin atau akses tanpa filter)
// =================================================================================

const getAllMateri = async (req, res) => {
	try {
		const materi = await Materi.findAll();
		res.status(200).json(materi);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving materi", error });
	}
};

const getMateriById = async (req, res) => {
	const { id } = req.params;
	try {
		const materi = await Materi.findByPk(id);
		if (materi) {
			res.status(200).json(materi);
		} else {
			res.status(404).json({ message: "Materi not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving materi", error });
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

/**
 * @description (BARU) Mengambil semua materi dengan status 'isLocked' untuk pengguna.
 */
const getAllMateriForUser = async (req, res) => {
	try {
		const userTingkatan = req.user.tingkatan;
		const userLevel = tingkatanHierarchy[userTingkatan] || 0;

		const materiList = await Materi.findAll();

		const materiWithLockStatus = materiList.map((materi) => {
			const materiData = materi.get({ plain: true });
			const materiLevel = tingkatanHierarchy[materiData.tingkatan];
			const isLocked = userLevel < materiLevel;

			materiData.isLocked = isLocked;
			if (isLocked) {
				materiData.konten = null;
			}
			return materiData;
		});

		res.status(200).json(materiWithLockStatus);
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error retrieving materi for user", error });
	}
};

/**
 * @description (BARU) Mengambil satu materi by ID dan memvalidasi akses pengguna.
 */
const getMateriByIdForUser = async (req, res) => {
	const { id } = req.params;
	try {
		const userTingkatan = req.user.tingkatan;
		const userLevel = tingkatanHierarchy[userTingkatan] || 0;

		const materi = await Materi.findByPk(id);
		if (materi) {
			const materiLevel = tingkatanHierarchy[materi.tingkatan];
			if (userLevel < materiLevel) {
				return res
					.status(403)
					.json({ message: "Access denied. Your level is not high enough." });
			}
			res.status(200).json(materi);
		} else {
			res.status(404).json({ message: "Materi not found" });
		}
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error retrieving materi for user", error });
	}
};

// =================================================================================
// FUNGSI MANAJEMEN DATA (Create, Update, Delete)
// =================================================================================

const createMateri = async (req, res) => {
	const { id_course, judul, deskripsi, tipeKonten, konten, tingkatan } =
		req.body;
	try {
		let kontenValue = konten; // Default ke nilai dari body

		// Jika ada file yang diunggah, proses dan gunakan URL-nya
		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "materi",
				resource_type: "auto", // Otomatis deteksi tipe file (baik untuk PDF, gambar, dll)
				use_filename: true,
				unique_filename: false,
				overwrite: true,
			});
			kontenValue = result.secure_url; // Timpa nilai konten dengan URL dari Cloudinary
			fs.unlinkSync(req.file.path); // Hapus file sementara setelah diunggah
		}

		const newMateri = await Materi.create({
			id_course,
			judul,
			deskripsi,
			tipeKonten,
			konten: kontenValue, // Gunakan nilai konten yang sudah diproses
			tingkatan,
		});
		res.status(201).json(newMateri);
	} catch (error) {
		// Jika ada error dan file sementara masih ada, hapus
		if (req.file && fs.existsSync(req.file.path)) {
			fs.unlinkSync(req.file.path);
		}
		res.status(500).json({ message: "Error creating materi", error });
	}
};

const updateMateri = async (req, res) => {
	const { id } = req.params;
	const { id_course, judul, deskripsi, tipeKonten, tingkatan } = req.body;
	try {
		const materi = await Materi.findByPk(id);
		if (!materi) {
			return res.status(404).json({ message: "Materi not found" });
		}
		if (req.file) {
			try {
				if (materi.konten && materi.tipeKonten !== "video") {
					const publicId = materi.konten.split("/").pop().split(".")[0];
					await cloudinary.uploader.destroy(`materi/${publicId}`);
				}
				const result = await cloudinary.uploader.upload(req.file.path, {
					folder: "materi",
					use_filename: true,
					unique_filename: false,
					overwrite: true,
				});
				req.body.konten = result.secure_url;
				fs.unlinkSync(req.file.path);
			} catch (uploadError) {
				if (req.file && fs.existsSync(req.file.path)) {
					fs.unlinkSync(req.file.path);
				}
				return res
					.status(500)
					.json({ message: "Error uploading file", uploadError });
			}
		}
		materi.id_course = id_course || materi.id_course;
		materi.judul = judul || materi.judul;
		materi.deskripsi = deskripsi || materi.deskripsi;
		materi.tipeKonten = tipeKonten || materi.tipeKonten;
		materi.konten = req.body.konten || materi.konten;
		materi.tingkatan = tingkatan || materi.tingkatan;
		await materi.save();
		res.status(200).json(materi);
	} catch (error) {
		res.status(500).json({ message: "Error updating materi", error });
	}
};

const deleteMateri = async (req, res) => {
	const { id } = req.params;
	try {
		const materi = await Materi.findByPk(id);
		if (!materi) {
			return res.status(404).json({ message: "Materi not found" });
		}
		if (materi.konten && materi.tipeKonten !== "video") {
			const publicId = materi.konten.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(`materi/${publicId}`);
		}
		await materi.destroy();
		res.status(200).json({ message: "Materi deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting materi", error });
	}
};

module.exports = {
	// Fungsi original untuk admin
	getAllMateri,
	getMateriById,

	// Fungsi baru untuk user
	getAllMateriForUser,
	getMateriByIdForUser,

	// Fungsi manajemen
	createMateri,
	updateMateri,
	deleteMateri,
};
