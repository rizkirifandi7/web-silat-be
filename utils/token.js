/**
 * Token Utility Functions
 * Handle JWT access tokens and refresh tokens
 */

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { RefreshToken, Anggota } = require("../models");
const { Op } = require("sequelize");

/**
 * Generate access token (short-lived: 15 minutes)
 */
const generateAccessToken = (user) => {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			role: user.role,
		},
		process.env.JWT_SECRET,
		{ expiresIn: "15m" }
	);
};

/**
 * Generate refresh token (long-lived: 30 days)
 */
const generateRefreshToken = () => {
	return crypto.randomBytes(64).toString("hex");
};

/**
 * Store refresh token in database
 */
const storeRefreshToken = async (userId, token, ipAddress, userAgent) => {
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

	await RefreshToken.create({
		token,
		user_id: userId,
		expires_at: expiresAt,
		ip_address: ipAddress,
		user_agent: userAgent,
	});
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (token) => {
	const refreshToken = await RefreshToken.findOne({
		where: { token },
		include: [
			{
				model: Anggota,
				as: "user",
				attributes: { exclude: ["password"] },
			},
		],
	});

	if (!refreshToken) {
		throw new Error("Invalid refresh token");
	}

	if (refreshToken.revoked) {
		throw new Error("Refresh token has been revoked");
	}

	if (new Date() > refreshToken.expires_at) {
		throw new Error("Refresh token has expired");
	}

	return refreshToken;
};

/**
 * Revoke refresh token
 */
const revokeRefreshToken = async (token) => {
	await RefreshToken.update(
		{
			revoked: true,
			revoked_at: new Date(),
		},
		{ where: { token } }
	);
};

/**
 * Revoke all user refresh tokens (logout from all devices)
 */
const revokeAllUserTokens = async (userId) => {
	await RefreshToken.update(
		{
			revoked: true,
			revoked_at: new Date(),
		},
		{
			where: {
				user_id: userId,
				revoked: false,
			},
		}
	);
};

/**
 * Cleanup expired tokens (run as cron job)
 */
const cleanupExpiredTokens = async () => {
	await RefreshToken.destroy({
		where: {
			expires_at: {
				[Op.lt]: new Date(),
			},
		},
	});
};

module.exports = {
	generateAccessToken,
	generateRefreshToken,
	storeRefreshToken,
	verifyRefreshToken,
	revokeRefreshToken,
	revokeAllUserTokens,
	cleanupExpiredTokens,
};
