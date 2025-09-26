const { Anggota, User } = require("../models");
const cloudinary = require("../middleware/cloudinary");
const fs = require("fs");

const getAllAnggota = async (req, res) => {
	try {
		// Sertakan model User saat mengambil data Anggota
		const anggota = await Anggota.findAll({
			include: [{ model: User, as: "user", attributes: ["nama", "email"] }],
		});
		res.status(200).json(anggota);
	} catch (error) {
		res.status(500).json({ message: "Error retrieving anggota", error });
	}
};

const getAnggotaById = async (req, res) => {
	const { id } = req.params;
	try {
		// Sertakan model User saat mengambil data Anggota
		const anggota = await Anggota.findByPk(id, {
			include: [{ model: User, as: "user", attributes: ["nama", "email"] }],
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
		// Sertakan model User saat mengambil data Anggota
		const anggota = await Anggota.findOne({
			where: { id_token },
			include: [{ model: User, as: "user", attributes: ["nama", "email"] }],
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
	const { id } = req.params; // id di sini adalah id Anggota
	try {
		const anggota = await Anggota.findByPk(id, {
			include: [{ model: User, as: "user" }],
		});
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
			// Data User
			nama,
			email,
			// Data Anggota
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

		// Update data User jika ada
		if (nama || email) {
			await anggota.user.update({ nama, email });
		}

		// Update data Anggota
		await anggota.update({
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

		// Ambil data terbaru untuk response
		const updatedAnggota = await Anggota.findByPk(id, {
			include: [{ model: User, as: "user", attributes: ["nama", "email"] }],
		});

		res.status(200).json(updatedAnggota);
	} catch (error) {
		res.status(500).json({ message: "Error updating anggota", error });
	}
};

const deleteAnggota = async (req, res) => {
	const { id } = req.params; // id di sini adalah id Anggota
	try {
		const anggota = await Anggota.findByPk(id);
		if (anggota) {
			const id_user = anggota.id_user;

			// Hapus foto dari Cloudinary jika ada
			if (anggota.foto) {
				const publicId = anggota.foto.split("/").pop().split(".")[0];
				await cloudinary.uploader.destroy(`anggota_fotos/${publicId}`);
			}

			// Hapus data Anggota
			await anggota.destroy();

			// Hapus data User yang terkait
			const user = await User.findByPk(id_user);
			if (user) {
				await user.destroy();
			}

			res
				.status(200)
				.json({ message: "Anggota and associated User deleted successfully" });
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
	updateAnggota,
	deleteAnggota,
	getAnggotaByIdToken,
};
