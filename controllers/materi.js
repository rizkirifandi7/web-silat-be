const { Materi } = require("../models");
const cloudinary = require("../middleware/cloudinary");
const fs = require("fs");

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

const createMateri = async (req, res) => {
	const { id_course, judul, deskripsi, tipeKonten } = req.body;
	try {
		let kontenUrl = null;
		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "materi",
				use_filename: true,
				unique_filename: false,
				overwrite: true,
			});

			kontenUrl = result.secure_url;
			// Hapus file lokal setelah upload berhasil
			fs.unlinkSync(req.file.path);
		}
		const newMateri = await Materi.create({
			id_course,
			judul,
			deskripsi,
			tipeKonten,
			konten: kontenUrl,
		});
		res.status(201).json(newMateri);
	} catch (error) {
		res.status(500).json({ message: "Error creating materi", error });
	}
};

const updateMateri = async (req, res) => {
	const { id } = req.params;
	const { id_course, judul, deskripsi, tipeKonten } = req.body;
	try {
		const materi = await Materi.findByPk(id);
		if (!materi) {
			return res.status(404).json({ message: "Materi not found" });
		}
		// Handle file upload
		if (req.file) {
			try {
				if (materi.konten) {
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
				fs.unlinkSync(req.file.path);
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
		if (materi.konten) {
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
	getAllMateri,
	getMateriById,
	createMateri,
	updateMateri,
	deleteMateri,
};
