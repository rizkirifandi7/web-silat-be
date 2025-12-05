/**
 * Custom Error Classes
 * For better error handling and consistent error responses
 */

class AppError extends Error {
	constructor(message, statusCode = 500, errors = null) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.isOperational = true;
		this.errors = errors;

		Error.captureStackTrace(this, this.constructor);
	}
}

class ValidationError extends AppError {
	constructor(message = "Validation failed", errors = null) {
		super(message, 400, errors);
	}
}

class NotFoundError extends AppError {
	constructor(message = "Resource not found") {
		super(message, 404);
	}
}

class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized access") {
		super(message, 401);
	}
}

class ForbiddenError extends AppError {
	constructor(message = "Access forbidden") {
		super(message, 403);
	}
}

class ConflictError extends AppError {
	constructor(message = "Resource already exists") {
		super(message, 409);
	}
}

class BadRequestError extends AppError {
	constructor(message = "Bad request", errors = null) {
		super(message, 400, errors);
	}
}

module.exports = {
	AppError,
	ValidationError,
	NotFoundError,
	UnauthorizedError,
	ForbiddenError,
	ConflictError,
	BadRequestError,
};
