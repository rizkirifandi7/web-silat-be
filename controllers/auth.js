const { Anggota } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../middleware/cloudinary");
const fs = require("fs");
const { nanoid } = require("nanoid");

const Register = async (req, res) => {
	// Ambil semua data yang mungkin dikirim dari form registrasi
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

	try {
		// 1. Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// 2. Gunakan id_token manual jika ada, jika tidak, generate dengan nanoid
		const final_id_token = id_token || nanoid();

		let fotoUrl = null;
		if (req.file) {
			try {
				const result = await cloudinary.uploader.upload(req.file.path, {
					folder: "anggota_fotos",
				});
				fotoUrl = result.secure_url;
				fs.unlinkSync(req.file.path);
			} catch (uploadError) {
				fs.unlinkSync(req.file.path);
				console.error("Cloudinary upload failed:", uploadError);
			}
		}

		// 3. Buat Anggota baru
		const newAnggota = await Anggota.create({
			nama,
			email,
			password: hashedPassword,
			role: role || "anggota",
			id_token: final_id_token,
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
			foto: fotoUrl,
		});

		res
			.status(201)
			.json({ message: "Registration successful", anggota: newAnggota });
	} catch (error) {
		console.error("Registration Error:", error);
		if (error.name === "SequelizeValidationError") {
			const messages = error.errors.map((err) => err.message);
			return res
				.status(400)
				.json({ message: "Validation error", errors: messages });
		}
		res
			.status(500)
			.json({ message: "Error registering user", error: error.message });
	}
};

const Login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await Anggota.findOne({
			where: { email },
		});

		// Gunakan pesan error yang sama untuk keamanan
		const invalidCredentialsMessage = "Email atau password salah.";

		if (!user) {
			return res.status(401).json({ message: invalidCredentialsMessage });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ message: invalidCredentialsMessage });
		}

		// Buat payload JWT yang minimalis
		const jwtPayload = {
			id: user.id,
			role: user.role,
		};

		const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
			expiresIn: "24h", // Token berlaku selama 24 jam
		});

		// Buat objek user yang akan dikirim ke frontend (tanpa password)
		const userForFrontend = {
			id: user.id,
			nama: user.nama,
			email: user.email,
			role: user.role,
			foto: user.foto,
			id_token: user.id_token,
			tingkatan_sabuk: user.tingkatan_sabuk,
		};

		// Kirim respons dengan struktur yang sesuai dengan frontend
		res.status(200).json({
			message: "Login berhasil",
			data: {
				token: token,
				user: userForFrontend, // Ganti nama dari userData menjadi user
			},
		});
	} catch (error) {
		console.error("Login Error:", error);
		res
			.status(500)
			.json({ message: "Terjadi kesalahan pada server", error: error.message });
	}
};
const changePassword = async (req, res) => {
	const userId = req.userId;

	const { oldPassword, newPassword } = req.body;

	if (!oldPassword || !newPassword) {
		return res
			.status(400)
			.json({ message: "Password lama dan password baru harus diisi" });
	}

	try {
		const anggota = await Anggota.findByPk(userId);
		if (!anggota) {
			return res.status(404).json({ message: "User tidak ditemukan" });
		}

		const isPasswordValid = await bcrypt.compare(oldPassword, anggota.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Password lama salah" });
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 10);

		anggota.password = hashedNewPassword;
		await anggota.save();

		res.status(200).json({ message: "Password berhasil diubah" });
	} catch (error) {
		res.status(500).json({
			message: "Terjadi kesalahan saat mengubah password",
			error: error.message,
		});
	}
};

module.exports = {
	Register,
	Login,
	changePassword, // Ekspor fungsi baru
};
