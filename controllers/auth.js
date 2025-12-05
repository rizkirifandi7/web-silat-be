/**
 * OPTIMIZED Auth Controller
 * - Uses catchAsync for error handling
 * - Uses standardized responses
 * - Uses custom error classes
 * - Uses cloudinary-helper for auto-cleanup
 * - Input validation via middleware
 */

const { Anggota } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { nanoid } = require("nanoid");
const { catchAsync } = require("../middleware/errorHandler");
const {
	successResponse,
	createdResponse,
	unauthorizedResponse,
	badRequestResponse,
} = require("../utils/response");
const { BadRequestError, UnauthorizedError } = require("../utils/errors");
const { uploadToCloudinaryAndDelete } = require("../utils/cloudinary-helper");
const { createRecord, getOne } = require("../utils/dbService");
const logger = require("../config/logger");
const {
	generateAccessToken,
	generateRefreshToken,
	storeRefreshToken,
	verifyRefreshToken,
	revokeRefreshToken,
	revokeAllUserTokens,
} = require("../utils/token");

/**
 * Register new member (OPTIMIZED)
 * - Auto-cleanup uploaded files
 * - Structured logging
 * - Consistent error responses
 */
const Register = catchAsync(async (req, res) => {
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

	// Check if email already exists
	const existingUser = await getOne(Anggota, { where: { email } });
	if (existingUser) {
		throw new BadRequestError("Email sudah terdaftar");
	}

	// Hash password
	const hashedPassword = await bcrypt.hash(password, 10);

	// Generate ID token if not provided
	const final_id_token = id_token || nanoid();

	// Handle image upload
	let fotoUrl = null;
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/anggota/fotos",
		});
		fotoUrl = result.secure_url;
	}

	// Create new member
	const newAnggota = await createRecord(Anggota, {
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

	// Remove password from response
	const { password: _, ...anggotaData } = newAnggota.toJSON();

	logger.info("New member registered", {
		id: newAnggota.id,
		email: newAnggota.email,
	});

	return createdResponse(res, anggotaData, "Registration successful");
});

/**
 * Login
 */
const Login = catchAsync(async (req, res) => {
	const { email, password } = req.body;

	// Validate input
	if (!email || !password) {
		throw new BadRequestError("Email dan password harus diisi");
	}

	// Find user and verify password
	const user = await getOne(Anggota, { where: { email } });

	if (!user || !(await bcrypt.compare(password, user.password))) {
		throw new UnauthorizedError("Email atau password salah");
	}

	// Generate tokens
	const accessToken = generateAccessToken(user);
	const refreshToken = generateRefreshToken();

	// Remove password from response
	const { password: _, ...userData } = user.toJSON();

	// Store refresh token asynchronously (non-blocking)
	const ipAddress = req.ip || req.connection.remoteAddress;
	const userAgent = req.headers["user-agent"];

	storeRefreshToken(user.id, refreshToken, ipAddress, userAgent).catch(
		(error) =>
			logger.error("Failed to store refresh token", { error: error.message })
	);

	logger.info("User logged in", { userId: user.id, email: user.email });

	// Set refresh token in HTTP-only cookie
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
	});

	return successResponse(
		res,
		{
			accessToken,
			user: userData,
		},
		"Login successful"
	);
});

/**
 * Get current user profile (OPTIMIZED)
 */
const GetProfile = catchAsync(async (req, res) => {
	// req.user comes from verifyToken middleware
	const user = await getOne(Anggota, {
		where: { id: req.user.id },
		attributes: { exclude: ["password"] },
	});

	if (!user) {
		throw new UnauthorizedError("User not found");
	}

	return successResponse(res, user, "Profile retrieved successfully");
});

/**
 * Update profile (OPTIMIZED)
 */
const UpdateProfile = catchAsync(async (req, res) => {
	const userId = req.user.id;
	const updateData = { ...req.body };

	// Remove sensitive fields that shouldn't be updated via this endpoint
	delete updateData.password;
	delete updateData.email;
	delete updateData.role;

	// Handle image upload
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/anggota/fotos",
		});
		updateData.foto = result.secure_url;
	}

	// Update user
	const user = await Anggota.findByPk(userId);
	if (!user) {
		throw new UnauthorizedError("User not found");
	}

	await user.update(updateData);

	// Get updated user without password
	const { password: _, ...userData } = user.toJSON();

	logger.info("User profile updated", { userId });

	return successResponse(res, userData, "Profile updated successfully");
});

/**
 * Change password (OPTIMIZED)
 */
const ChangePassword = catchAsync(async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	const userId = req.user.id;

	// Get user with password
	const user = await Anggota.findByPk(userId);
	if (!user) {
		throw new UnauthorizedError("User not found");
	}

	// Verify old password
	const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
	if (!isPasswordValid) {
		throw new BadRequestError("Password lama tidak sesuai");
	}

	// Hash new password
	const hashedPassword = await bcrypt.hash(newPassword, 10);

	// Update password
	await user.update({ password: hashedPassword });

	logger.info("User password changed", { userId });

	return successResponse(res, null, "Password changed successfully");
});

/**
 * Logout (OPTIMIZED)
 * Revoke refresh token and clear cookie
 */
const Logout = catchAsync(async (req, res) => {
	const { refreshToken } = req.cookies;

	if (refreshToken) {
		await revokeRefreshToken(refreshToken);
	}

	res.clearCookie("refreshToken");

	logger.info("User logged out", { userId: req.user?.id });

	return successResponse(res, null, "Logout successful");
});

/**
 * Refresh Access Token (NEW)
 * Generate new access token using refresh token
 */
const RefreshAccessToken = catchAsync(async (req, res) => {
	const { refreshToken } = req.cookies;

	if (!refreshToken) {
		throw new UnauthorizedError("Refresh token not provided");
	}

	// Verify refresh token
	const tokenData = await verifyRefreshToken(refreshToken);

	// Generate new access token
	const accessToken = generateAccessToken(tokenData.user);

	logger.info("Access token refreshed", { userId: tokenData.user.id });

	return successResponse(res, { accessToken }, "Token refreshed successfully");
});

/**
 * Logout from all devices (NEW)
 * Revoke all refresh tokens for current user
 */
const LogoutAll = catchAsync(async (req, res) => {
	await revokeAllUserTokens(req.user.id);

	res.clearCookie("refreshToken");

	logger.info("User logged out from all devices", { userId: req.user.id });

	return successResponse(res, null, "Logged out from all devices");
});

module.exports = {
	Register,
	Login,
	GetProfile,
	UpdateProfile,
	ChangePassword,
	Logout,
	RefreshAccessToken,
	LogoutAll,
};
