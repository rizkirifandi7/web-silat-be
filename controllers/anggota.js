const { Anggota } = require("../models");
const cloudinary = require("../middleware/cloudinary");
const fs = require("fs");
const { Op } = require("sequelize");

const getAllAnggota = async (req, res) => {
	try {
		const anggota = await Anggota.findAll();
		res.status(200).json(anggota);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving anggota", error });
	}
};

const getAnggotaById = async (req, res) => {
	const { id } = req.params;
	try {
		const anggota = await Anggota.findByPk(id);
		if (anggota) {
			res.status(200).json(anggota);
		} else {
			res.status(404).json({ message: "Anggota not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving anggota", error });
	}
};

const getAnggotaByIdToken = async (req, res) => {
	const { id_token } = req.params;
	try {
		const anggota = await Anggota.findOne({ where: { id_token } });
		if (anggota) {
			res.status(200).json(anggota);
		} else {
			res.status(404).json({ message: "Anggota not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving anggota", error });
	}
};

const createAnggota = async (req, res) => {
	try {
		const {
			nama_lengkap,
			nama_panggilan,
			email,
			tempat_lahir,
			tanggal_lahir,
			jenis_kelamin,
			alamat,
			agama,
			no_telepon,
			angkatan_unit,
			status_keanggotaan,
			status_perguruan,
			tingkatan_sabuk,
		} = req.body;

		// Generate id_token
		const currentYear = new Date().getFullYear();
		const lastAnggota = await Anggota.findOne({
			where: {
				id_token: {
					[Op.like]: `${currentYear}%`,
				},
			},
			order: [["id_token", "DESC"]],
		});

		let newIdTokenNumber = 1;
		if (lastAnggota) {
			const lastIdToken = lastAnggota.id_token;
			const lastNumber = parseInt(lastIdToken.substring(4), 10);
			newIdTokenNumber = lastNumber + 1;
		}

		const id_token = `${currentYear}${String(newIdTokenNumber).padStart(
			4,
			"0"
		)}`;

		const foto = req.file;
		if (foto) {
			try {
				const result = await cloudinary.uploader.upload(foto.path, {
					folder: "anggota_fotos",
				});
				req.body.foto = result.secure_url;
				// Hapus file dari folder uploads setelah berhasil diunggah ke Cloudinary
				fs.unlinkSync(foto.path);
			} catch (uploadError) {
				// Jika upload gagal, hapus file sementara dan kirim error
				fs.unlinkSync(foto.path);
				return res
					.status(500)
					.json({ message: "Error uploading to Cloudinary", uploadError });
			}
		}

		const newAnggota = await Anggota.create({
			id_token,
			nama_lengkap,
			nama_panggilan,
			email,
			tempat_lahir,
			tanggal_lahir,
			jenis_kelamin,
			alamat,
			agama,
			no_telepon,
			angkatan_unit,
			status_keanggotaan,
			status_perguruan,
			tingkatan_sabuk,
			foto: req.body.foto || null,
		});
		res.status(201).json(newAnggota);
	} catch (error) {
		res.status(500).json({ message: "Error creating anggota", error });
	}
};

const updateAnggota = async (req, res) => {
	const { id } = req.params;
	try {
		const anggota = await Anggota.findByPk(id);
		if (!anggota) {
			return res.status(404).json({ message: "Anggota not found" });
		}

		// Handle file upload
		if (req.file) {
			try {
				// If there's an old photo, delete it from Cloudinary
				if (anggota.foto) {
					const publicId = anggota.foto.split("/").pop().split(".")[0];
					await cloudinary.uploader.destroy(`anggota_fotos/${publicId}`);
				}

				// Upload the new photo
				const result = await cloudinary.uploader.upload(req.file.path, {
					folder: "anggota_fotos",
				});
				req.body.foto = result.secure_url;
				// Hapus file dari folder uploads setelah berhasil diunggah ke Cloudinary
				fs.unlinkSync(req.file.path);
			} catch (uploadError) {
				// Jika upload gagal, hapus file sementara dan kirim error
				fs.unlinkSync(req.file.path);
				return res
					.status(500)
					.json({ message: "Error uploading to Cloudinary", uploadError });
			}
		}

		const {
			id_token,
			nama_lengkap,
			nama_panggilan,
			email,
			tempat_lahir,
			tanggal_lahir,
			jenis_kelamin,
			alamat,
			agama,
			no_telepon,
			angkatan_unit,
			status_keanggotaan,
			status_perguruan,
			tingkatan_sabuk,
		} = req.body;

		await anggota.update({
			id_token,
			nama_lengkap,
			nama_panggilan,
			email,
			tempat_lahir,
			tanggal_lahir,
			jenis_kelamin,
			alamat,
			agama,
			no_telepon,
			angkatan_unit,
			status_keanggotaan,
			status_perguruan,
			tingkatan_sabuk,
			foto: req.body.foto || anggota.foto,
		});
		res.status(200).json(anggota);
	} catch (error) {
		res.status(500).json({ message: "Error updating anggota", error });
	}
};

const deleteAnggota = async (req, res) => {
	const { id } = req.params;
	try {
		const anggota = await Anggota.findByPk(id);
		if (anggota) {
			// If there's a photo, delete it from Cloudinary
			if (anggota.foto) {
				const publicId = anggota.foto.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy(`anggota_fotos/${publicId}`);
			}
			await anggota.destroy();
			res.status(200).json({ message: "Anggota deleted successfully" });
		} else {
			res.status(404).json({ message: "Anggota not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error deleting anggota", error });
	}
};

module.exports = {
	getAllAnggota,
	getAnggotaById,
	createAnggota,
	updateAnggota,
	deleteAnggota,
	getAnggotaByIdToken,
};
