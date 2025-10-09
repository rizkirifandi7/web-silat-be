const { Anggota } = require("../models");
const cloudinary = require("../middleware/cloudinary");
const fs = require("fs");
const bcrypt = require("bcrypt");

const getAllAnggota = async (req, res) => {
	try {
		const anggota = await Anggota.findAll({
			where: { role: "anggota" },
			attributes: { exclude: ["password"] },
		});
		res.status(200).json(anggota);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving anggota", error });
	}
};

const getAllAnggotaAdmin = async (req, res) => {
	try {
		const anggota = await Anggota.findAll({
			where: { role: "admin" },
			attributes: { exclude: ["password"] },
		});
		res.status(200).json(anggota);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving anggota", error });
	}
};

const getAnggotaById = async (req, res) => {
	const { id } = req.params;
	try {
		const anggota = await Anggota.findByPk(id, {
			attributes: { exclude: ["password"] },
		});
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
		const anggota = await Anggota.findOne({
			where: { id_token },
			attributes: { exclude: ["password"] },
		});
		if (anggota) {
			res.status(200).json(anggota);
		} else {
			res.status(404).json({ message: "Anggota not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving anggota", error });
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
				if (anggota.foto) {
					const publicId = anggota.foto.split("/").pop().split(".")[0];
					await cloudinary.uploader.destroy(`anggota_fotos/${publicId}`);
				}
				const result = await cloudinary.uploader.upload(req.file.path, {
					folder: "anggota_fotos",
				});
				req.body.foto = result.secure_url;
				fs.unlinkSync(req.file.path);
			} catch (uploadError) {
				fs.unlinkSync(req.file.path);
				return res
					.status(500)
					.json({ message: "Error uploading to Cloudinary", uploadError });
			}
		}

		const {
			nama,
			email,
			password,
			role,
			id_token,
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

		// Prepare update data
		const updateData = {
			nama,
			email,
			role,
			id_token,
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
		};

		// Hash password if provided
		if (password) {
			updateData.password = await bcrypt.hash(password, 10);
		}

		// Update data Anggota
		await anggota.update(updateData);

		// Ambil data terbaru untuk response
		const updatedAnggota = await Anggota.findByPk(id);

		res.status(200).json(updatedAnggota);
	} catch (error) {
		res.status(500).json({ message: "Error updating anggota", error });
	}
};

const deleteAnggota = async (req, res) => {
	const { id } = req.params;
	try {
		const anggota = await Anggota.findByPk(id);
		if (anggota) {
			// Hapus foto dari Cloudinary jika ada
			if (anggota.foto) {
				const publicId = anggota.foto.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy(`anggota_fotos/${publicId}`);
			}

			// Hapus data Anggota
			await anggota.destroy();

			res.status(200).json({ message: "Anggota deleted successfully" });
		} else {
			res.status(404).json({ message: "Anggota not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error deleting anggota", error });
	}
};

const getProfile = async (req, res) => {
	const userId = req.user.id;
	try {
		const anggota = await Anggota.findByPk(userId, {
			attributes: { exclude: ["password"] },
		});
		if (anggota) {
			res.status(200).json(anggota);
		} else {
			res.status(404).json({ message: "Anggota not found" });
		}
	} catch (error) {
		res.status(500).json({ message: "Error retrieving anggota", error });
	}
};

module.exports = {
	getAllAnggota,
	getAllAnggotaAdmin,
	getAnggotaById,
	updateAnggota,
	deleteAnggota,
	getAnggotaByIdToken,
	getProfile,
};
