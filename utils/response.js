/**
 * Standardized API Response Helper
 * Ensures consistent response format across all endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (
	res,
	data = null,
	message = "Success",
	statusCode = 200
) => {
	return res.status(statusCode).json({
		status: "success",
		message,
		data,
	});
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {Object} errors - Validation errors (optional)
 */
const errorResponse = (
	res,
	message = "Internal Server Error",
	statusCode = 500,
	errors = null
) => {
	const response = {
		status: "error",
		message,
	};

	if (errors) {
		response.errors = errors;
	}

	// In development, include error details
	if (process.env.NODE_ENV === "development" && errors) {
		response.stack = errors.stack;
	}

	return res.status(statusCode).json(response);
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination metadata
 * @param {String} message - Success message
 */
const paginatedResponse = (res, data, pagination, message = "Success") => {
	return res.status(200).json({
		success: true,
		status: "success",
		message,
		data,
		pagination: {
			currentPage: pagination.currentPage || pagination.page || 1,
			totalPages: pagination.totalPages || pagination.total_pages || 0,
			totalItems: pagination.totalItems || pagination.total || 0,
			itemsPerPage: pagination.itemsPerPage || pagination.limit || 10,
		},
	});
};

/**
 * Created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {String} message - Success message
 */
const createdResponse = (
	res,
	data,
	message = "Resource created successfully"
) => {
	return successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
	return res.status(204).send();
};

/**
 * Not found response (404)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const notFoundResponse = (res, message = "Resource not found") => {
	return errorResponse(res, message, 404);
};

/**
 * Unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const unauthorizedResponse = (res, message = "Unauthorized access") => {
	return errorResponse(res, message, 401);
};

/**
 * Forbidden response (403)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
const forbiddenResponse = (res, message = "Access forbidden") => {
	return errorResponse(res, message, 403);
};

/**
 * Bad request response (400)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Object} errors - Validation errors
 */
const badRequestResponse = (res, message = "Bad request", errors = null) => {
	return errorResponse(res, message, 400, errors);
};

module.exports = {
	successResponse,
	errorResponse,
	paginatedResponse,
	createdResponse,
	noContentResponse,
	notFoundResponse,
	unauthorizedResponse,
	forbiddenResponse,
	badRequestResponse,
};
