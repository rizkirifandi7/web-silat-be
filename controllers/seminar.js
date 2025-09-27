const { Seminar } = require("../models");
const fs = require("fs");
const cloudinary = require("../middleware/cloudinary");

const getAllSeminar = async (req, res) => {
	try {
		const seminar = await Seminar.findAll();
		res.status(200).json(seminar);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving seminar", error });
	}
};

const getSeminarById = async (req, res) => {
	const { id } = req.params;
	try {
		const seminar = await Seminar.findByPk(id);
		if (seminar) {
			res.status(200).json(seminar);
		} else {
			res.status(404).json({ message: "Seminar not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving seminar", error });
	}
};

const createSeminar = async (req, res) => {
	const { judul, deskripsi } = req.body;
	try {
		let gambarUrl = null;
		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "seminar",
				use_filename: true,
				unique_filename: false,
				overwrite: true,
			});
			gambarUrl = result.secure_url;
		}
		const newSeminar = await Seminar.create({
			gambar: gambarUrl,
			judul,
			deskripsi,
		});
		res.status(201).json(newSeminar);
	} catch (error) {
		res.status(500).json({ message: "Error creating seminar", error });
	}
};

const updateSeminar = async (req, res) => {
	const { id } = req.params;
	const { judul, deskripsi } = req.body;
	try {
		const seminar = await Seminar.findByPk(id);
		if (!seminar) {
			return res.status(404).json({ message: "Seminar not found" });
		}

		// Handle file upload
		if (req.file) {
			try {
				if (seminar.gambar) {
					const publicId = seminar.gambar.split("/").pop().split(".")[0];
					await cloudinary.uploader.destroy(`seminar/${publicId}`);
				}

				const result = await cloudinary.uploader.upload(req.file.path, {
					folder: "seminar",
					use_filename: true,
					unique_filename: false,
					overwrite: true,
				});

				req.body.gambar = result.secure_url;
			} catch (uploadError) {
				fs.unlinkSync(req.file.path);
				return res
					.status(500)
					.json({ message: "Error uploading image", error: uploadError });
			}
			seminar.gambar = req.body.gambar;
			await seminar.save();
		}
		seminar.judul = judul || seminar.judul;
		seminar.deskripsi = deskripsi || seminar.deskripsi;
		await seminar.save();
		res.status(200).json(seminar);
	} catch (error) {
		res.status(500).json({ message: "Error updating seminar", error });
	}
};

const deleteSeminar = async (req, res) => {
	const { id } = req.params;
	try {
		const seminar = await Seminar.findByPk(id);
		if (!seminar) {
			return res.status(404).json({ message: "Seminar not found" });
		}
		if (seminar.gambar) {
			const publicId = seminar.gambar.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(`seminar/${publicId}`);
		}
		await seminar.destroy();
		res.status(200).json({ message: "Seminar deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting seminar", error });
	}
};

module.exports = {
	getAllSeminar,
	getSeminarById,
	createSeminar,
	updateSeminar,
	deleteSeminar,
};
