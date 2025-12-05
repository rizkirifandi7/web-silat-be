/**
 * OPTIMIZED Katalog Controller
 * - Uses catchAsync for error handling
 * - Uses standardized responses
 * - Pagination and filtering
 */

const { Katalog } = require("../models");
const { catchAsync } = require("../middleware/errorHandler");
const {
	successResponse,
	notFoundResponse,
	paginatedResponse,
} = require("../utils/response");
const { NotFoundError } = require("../utils/errors");
const { getPaginated, getById } = require("../utils/dbService");
const { Op } = require("sequelize");

/**
 * Get all katalog with pagination and filters (OPTIMIZED)
 */
const getAllKatalog = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, search, status = "tersedia" } = req.query;

	const where = { status };

	if (search) {
		where[Op.or] = [
			{ nama: { [Op.iLike]: `%${search}%` } },
			{ deskripsi: { [Op.iLike]: `%${search}%` } },
		];
	}

	const result = await getPaginated(Katalog, {
		page,
		limit,
		where,
		order: [["createdAt", "DESC"]],
	});

	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Products retrieved successfully"
	);
});

/**
 * Get katalog by ID (OPTIMIZED)
 */
const getKatalogById = catchAsync(async (req, res) => {
	const { id } = req.params;

	const katalog = await getById(Katalog, id);

	if (!katalog) {
		throw new NotFoundError("Product not found");
	}

	return successResponse(res, katalog, "Product retrieved successfully");
});

/**
 * Get available products (NEW)
 */
const getAvailableKatalog = catchAsync(async (req, res) => {
	const { limit = 10 } = req.query;

	const katalogList = await Katalog.findAll({
		where: { status: "tersedia" },
		limit: parseInt(limit),
		order: [["createdAt", "DESC"]],
	});

	return successResponse(
		res,
		katalogList,
		"Available products retrieved successfully"
	);
});

module.exports = {
	getAllKatalog,
	getKatalogById,
	getAvailableKatalog,
};
