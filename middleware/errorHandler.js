/**
 * Centralized Error Handling Middleware
 * Catches all errors and sends consistent error responses
 */

const { AppError } = require("../utils/errors");

/**
 * Development error response - includes stack trace
 */
const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
		errors: err.errors,
	});
};

/**
 * Production error response - minimal info for security
 */
const sendErrorProd = (err, res) => {
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		const response = {
			status: err.status,
			message: err.message,
		};

		if (err.errors) {
			response.errors = err.errors;
		}

		res.status(err.statusCode).json(response);
	}
	// Programming or unknown error: don't leak error details
	else {
		console.error("💥 ERROR:", err);

		res.status(500).json({
			status: "error",
			message: "Something went wrong!",
		});
	}
};

/**
 * Handle Sequelize Validation Errors
 */
const handleSequelizeValidationError = (err) => {
	const errors = err.errors.map((e) => ({
		field: e.path,
		message: e.message,
	}));

	const message = "Invalid input data";
	return new AppError(message, 400, errors);
};

/**
 * Handle Sequelize Unique Constraint Errors
 */
const handleSequelizeUniqueError = (err) => {
	const field = err.errors[0].path;
	const message = `Duplicate value for field: ${field}`;
	return new AppError(message, 409);
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => {
	return new AppError("Invalid token. Please log in again.", 401);
};

const handleJWTExpiredError = () => {
	return new AppError("Your token has expired. Please log in again.", 401);
};

/**
 * Main Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, res);
	} else if (process.env.NODE_ENV === "production") {
		let error = { ...err };
		error.message = err.message;

		// Handle specific error types
		if (err.name === "SequelizeValidationError")
			error = handleSequelizeValidationError(err);
		if (err.name === "SequelizeUniqueConstraintError")
			error = handleSequelizeUniqueError(err);
		if (err.name === "JsonWebTokenError") error = handleJWTError();
		if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

		sendErrorProd(error, res);
	}
};

/**
 * Catch Async Errors (wraps async functions)
 */
const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch(next);
	};
};

/**
 * 404 Handler - Route not found
 */
const notFoundHandler = (req, res, next) => {
	const err = new AppError(
		`Can't find ${req.originalUrl} on this server!`,
		404
	);
	next(err);
};

module.exports = {
	errorHandler,
	catchAsync,
	notFoundHandler,
};
