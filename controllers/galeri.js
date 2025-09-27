const { Galeri } = require("../models");
const fs = require("fs");
const cloudinary = require("../middleware/cloudinary");

const getAllGaleri = async (req, res) => {
	try {
		const galeri = await Galeri.findAll();
		res.status(200).json(galeri);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving galeri", error });
	}
};

const getGaleriById = async (req, res) => {
	const { id } = req.params;
	try {
		const galeri = await Galeri.findByPk(id);
		if (galeri) {
			res.status(200).json(galeri);
		} else {
			res.status(404).json({ message: "Galeri not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving galeri", error });
	}
};

const createGaleri = async (req, res) => {
	const { judul, deskripsi } = req.body;
	try {
		let gambarUrl = null;
		if (req.file) {
			const result = await cloudinary.uploader.upload(req.file.path, {
				folder: "galeri",
				use_filename: true,
				unique_filename: false,
				overwrite: true,
			});

			gambarUrl = result.secure_url;
			// Hapus file lokal setelah upload berhasil
			fs.unlinkSync(req.file.path);
		}
		const newGaleri = await Galeri.create({
			gambar: gambarUrl,
			judul,
			deskripsi,
		});
		res.status(201).json(newGaleri);
	} catch (error) {
		res.status(500).json({ message: "Error creating galeri", error });
	}
};

const updateGaleri = async (req, res) => {
	const { id } = req.params;
	const { judul, deskripsi } = req.body;
	try {
		const galeri = await Galeri.findByPk(id);
		if (!galeri) {
			return res.status(404).json({ message: "Galeri not found" });
		}

		// Handle file upload
		if (req.file) {
			try {
				if (galeri.gambar) {
					const publicId = galeri.gambar.split("/").pop().split(".")[0];
					await cloudinary.uploader.destroy(`galeri/${publicId}`);
				}
				const result = await cloudinary.uploader.upload(req.file.path, {
					folder: "galeri",
					use_filename: true,
					unique_filename: false,
					overwrite: true,
				});
				req.body.gambar = result.secure_url;
			} catch (uploadError) {
				fs.unlinkSync(req.file.path);
				return res
					.status(500)
					.json({ message: "Error uploading image", uploadError });
			}
			galeri.set(req.body);
			await galeri.save();
			// Hapus file lokal setelah save berhasil
			fs.unlinkSync(req.file.path);

			res.status(200).json(galeri);
		} else {
			// Jika tidak ada file yang diunggah, perbarui hanya judul dan deskripsi
			galeri.judul = judul;
			galeri.deskripsi = deskripsi;
			await galeri.save();
			res.status(200).json(galeri);
		}
	} catch (error) {
		res.status(500).json({ message: "Error updating galeri", error });
	}
};

const deleteGaleri = async (req, res) => {
	const { id } = req.params;
	try {
		const galeri = await Galeri.findByPk(id);
		if (!galeri) {
			return res.status(404).json({ message: "Galeri not found" });
		}
		// Hapus gambar dari Cloudinary jika ada
		if (galeri.gambar) {
			const publicId = galeri.gambar.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(`galeri/${publicId}`);
		}
		await galeri.destroy();
		res.status(200).json({ message: "Galeri deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Error deleting galeri", error });
	}
};

module.exports = {
	getAllGaleri,
	getGaleriById,
	createGaleri,
	updateGaleri,
	deleteGaleri,
};
