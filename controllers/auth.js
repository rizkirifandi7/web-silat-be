const { User, Anggota } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../middleware/cloudinary");
const fs = require("fs");
const { nanoid } = require("nanoid");

const Register = async (req, res) => {
	// Ambil semua data yang mungkin dikirim dari form registrasi
	const {
		// Data User
		nama,
		email,
		password,
		role,
		// Data Anggota
		id_token, // Tambahkan id_token di sini
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

		// 2. Buat User baru
		const newUser = await User.create({
			nama,
			email,
			password: hashedPassword,
			role: role || "anggota", // Default role ke 'anggota' jika tidak disediakan
		});

		// 3. Jika rolenya adalah 'anggota', buat juga data Anggota
		if (newUser.role === "anggota") {
			// Gunakan id_token manual jika ada, jika tidak, generate dengan nanoid
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

			// Buat Anggota baru
			await Anggota.create({
				id_user: newUser.id,
				id_token: final_id_token, // Gunakan id_token yang sudah ditentukan
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
		}

		res
			.status(201)
			.json({ message: "User registered successfully", user: newUser });
	} catch (error) {
		// Log error lengkap di server untuk debugging
		console.error("Registration Error:", error);

		// Cek apakah ini error validasi dari Sequelize
		if (error.name === "SequelizeValidationError") {
			const messages = error.errors.map((err) => err.message);
			return res
				.status(400)
				.json({ message: "Validation error", errors: messages });
		}

		// Handle error umum
		res
			.status(500)
			.json({ message: "Error registering user", error: error.message });
	}
};

const Login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({
			where: { email },
			include: [{ model: Anggota, as: "anggota" }], // Sertakan data anggota
		});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid password" });
		}

		// Sertakan id_token dari anggota di dalam payload token JWT jika ada
		const payload = {
			id: user.id,
			role: user.role,
			nama: user.nama,
			id_token: user.anggota ? user.anggota.id_token : null,
		};

		const token = jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: "24h", // Perpanjang durasi token
		});

		res.status(200).json({ message: "Login successful", token });
	} catch (error) {
		res.status(500).json({ message: "Error logging in", error: error.message });
	}
};

const changePassword = async (req, res) => {
	// Asumsi: ID pengguna didapat dari token JWT yang sudah diverifikasi oleh middleware
	const userId = req.userId; // Pastikan middleware Anda menyimpan id ke req.userId atau req.user.id

	const { oldPassword, newPassword } = req.body;

	// Validasi input
	if (!oldPassword || !newPassword) {
		return res
			.status(400)
			.json({ message: "Password lama dan password baru harus diisi" });
	}

	try {
		// 1. Cari pengguna berdasarkan ID dari token
		const user = await User.findByPk(userId);
		if (!user) {
			return res.status(404).json({ message: "User tidak ditemukan" });
		}

		// 2. Verifikasi password lama
		const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ message: "Password lama salah" });
		}

		// 3. Hash password baru
		const hashedNewPassword = await bcrypt.hash(newPassword, 10);

		// 4. Update password di database
		user.password = hashedNewPassword;
		await user.save();

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
