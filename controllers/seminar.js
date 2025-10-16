const { Seminar } = require("../models");
const cloudinary = require("../middleware/cloudinary");
const fs = require("fs");

const getAllSeminars = async (req, res) => {
	try {
		const seminars = await Seminar.findAll();
		res.status(200).json(seminars);
	} catch (error) {
		console.error(error.stack || error);
		res.status(500).json({ message: error.message });
	}
};

const getSeminarById = async (req, res) => {
	try {
		const { id } = req.params;
		const seminar = await Seminar.findByPk(id);
		if (seminar) {
			res.status(200).json(seminar);
		} else {
			res.status(404).json({ message: "Seminar not found" });
		}
	} catch (error) {
		console.error(error.stack || error);
		res.status(500).json({ message: error.message });
	}
};

const createSeminar = async (req, res) => {
	try {
		const {
			judul,
			deskripsi,
			tanggal_mulai,
			tanggal_selesai,
			waktu_mulai,
			waktu_selesai,
			lokasi,
			link_acara,
			harga,
			kuota,
			status,
		} = req.body;

		let gambar = null;
		let gambar_banner = null;
		if (req.files) {
			if (req.files.gambar) {
				const result = await cloudinary.uploader.upload(
					req.files.gambar[0].path,
					{ folder: "seminar_images" }
				);
				gambar = result.secure_url;
				fs.unlinkSync(req.files.gambar[0].path);
			}
			if (req.files.gambar_banner) {
				const result = await cloudinary.uploader.upload(
					req.files.gambar_banner[0].path,
					{ folder: "seminar_banners" }
				);
				gambar_banner = result.secure_url;
				fs.unlinkSync(req.files.gambar_banner[0].path);
			}
		}
		const newSeminar = await Seminar.create({
			gambar,
			judul,
			deskripsi,
			tanggal_mulai,
			tanggal_selesai,

			waktu_mulai,
			waktu_selesai,
			lokasi,
			link_acara,
			harga,
			kuota,
			status,
			gambar_banner,
		});
		res.status(201).json(newSeminar);
	} catch (error) {
		console.error(error.stack || error);
		res.status(500).json({ message: error.message });
	}
};

const updateSeminar = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			judul,
			deskripsi,
			tanggal_mulai,
			tanggal_selesai,
			waktu_mulai,
			waktu_selesai,
			lokasi,
			link_acara,
			harga,
			kuota,
			status,
		} = req.body;

		const seminar = await Seminar.findByPk(id);
		if (!seminar) {
			return res.status(404).json({ message: "Seminar not found" });
		}
		let gambar = seminar.gambar;
		let gambar_banner = seminar.gambar_banner;
		if (req.files) {
			if (req.files.gambar) {
				const result = await cloudinary.uploader.upload(
					req.files.gambar[0].path,
					{ folder: "seminar_images" }
				);
				gambar = result.secure_url;
				fs.unlinkSync(req.files.gambar[0].path);
			}
			if (req.files.gambar_banner) {
				const result = await cloudinary.uploader.upload(
					req.files.gambar_banner[0].path,
					{ folder: "seminar_banners" }
				);
				gambar_banner = result.secure_url;
				fs.unlinkSync(req.files.gambar_banner[0].path);
			}
		}
		await seminar.update({
			gambar,
			judul,
			deskripsi,
			tanggal_mulai,
			tanggal_selesai,
			waktu_mulai,
			waktu_selesai,
			lokasi,
			link_acara,
			harga,
			kuota,
			status,
			gambar_banner,
		});
		res.status(200).json(seminar);
	} catch (error) {
		console.error(error.stack || error);
		res.status(500).json({ message: error.message });
	}
};

const deleteSeminar = async (req, res) => {
	try {
		const { id } = req.params;
		const seminar = await Seminar.findByPk(id);
		if (!seminar) {
			return res.status(404).json({ message: "Seminar not found" });
		}
		if (seminar.gambar) {
			// Extract public ID from the URL
			const publicId = seminar.gambar.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(publicId);
		}
		if (seminar.gambar_banner) {
			const publicId = seminar.gambar_banner.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(publicId);
		}

		await seminar.destroy();
		res.status(200).json({ message: "Seminar deleted successfully" });
	} catch (error) {
		console.error(error.stack || error);
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getAllSeminars,
	getSeminarById,
	createSeminar,
	updateSeminar,
	deleteSeminar,
};
