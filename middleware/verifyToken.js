const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const {
	unauthorizedResponse,
	forbiddenResponse,
} = require("../utils/response");
dotenv.config();

/**
 * Verify JWT Token Middleware (OPTIMIZED)
 * Validates Authorization header and extracts user data
 */
const verifyToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	// Check if authorization header exists
	if (!authHeader) {
		return unauthorizedResponse(res, "No token provided");
	}

	// Extract token from "Bearer <token>" format
	const token = authHeader.split(" ")[1];

	if (!token) {
		return unauthorizedResponse(res, "Invalid token format");
	}

	// Verify token
	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			if (err.name === "TokenExpiredError") {
				return unauthorizedResponse(res, "Token has expired");
			}
			return forbiddenResponse(res, "Invalid token");
		}

		// Attach user data to request object
		req.user = user;
		next();
	});
};

module.exports = verifyToken;
