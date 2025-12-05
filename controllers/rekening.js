/**
 * OPTIMIZED Rekening Controller
 * - Uses catchAsync for error handling
 * - Uses standardized responses
 * - Uses cloudinary-helper for auto-cleanup
 * - Better error handling
 */

const { Rekening } = require("../models");
const { catchAsync } = require("../middleware/errorHandler");
const {
	successResponse,
	createdResponse,
	notFoundResponse,
	paginatedResponse,
} = require("../utils/response");
const { NotFoundError } = require("../utils/errors");
const { uploadToCloudinaryAndDelete } = require("../utils/cloudinary-helper");
const {
	getPaginated,
	getById,
	createRecord,
	updateRecord,
	deleteRecord,
} = require("../utils/dbService");
const logger = require("../config/logger");
const { Op } = require("sequelize");

/**
 * Get all rekening with pagination and search (OPTIMIZED)
 */
const getAllRekening = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, search } = req.query;

	const where = {};

	if (search) {
		where[Op.or] = [
			{ namaBank: { [Op.iLike]: `%${search}%` } },
			{ namaPemilik: { [Op.iLike]: `%${search}%` } },
			{ noRekening: { [Op.iLike]: `%${search}%` } },
		];
	}

	const result = await getPaginated(Rekening, {
		page,
		limit,
		where,
		order: [["createdAt", "DESC"]],
	});

	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Bank accounts retrieved successfully"
	);
});

/**
 * Get rekening by ID (OPTIMIZED)
 */
const getRekeningById = catchAsync(async (req, res) => {
	const { id } = req.params;

	const rekening = await getById(Rekening, id);

	if (!rekening) {
		throw new NotFoundError("Bank account not found");
	}

	return successResponse(res, rekening, "Bank account retrieved successfully");
});

/**
 * Create rekening (OPTIMIZED)
 */
const createRekening = catchAsync(async (req, res) => {
	const { namaBank, noRekening, namaPemilik } = req.body;

	let gambarUrl = null;

	// Handle logo upload
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/rekening",
		});
		gambarUrl = result.secure_url;
	}

	const newRekening = await createRecord(Rekening, {
		logo: gambarUrl,
		namaPemilik,
		namaBank,
		noRekening,
	});

	logger.info("Bank account created", {
		rekeningId: newRekening.id,
		createdBy: req.user?.id,
	});

	return createdResponse(res, newRekening, "Bank account created successfully");
});

/**
 * Update rekening (OPTIMIZED)
 */
const updateRekening = catchAsync(async (req, res) => {
	const { id } = req.params;
	const { namaBank, noRekening, namaPemilik } = req.body;

	// Check if rekening exists
	const rekening = await Rekening.findByPk(id);
	if (!rekening) {
		throw new NotFoundError("Bank account not found");
	}

	const updateData = { namaBank, noRekening, namaPemilik };

	// Handle logo upload
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/rekening",
		});
		updateData.logo = result.secure_url;
	}

	// Update rekening
	await rekening.update(updateData);

	logger.info("Bank account updated", {
		rekeningId: id,
		updatedBy: req.user?.id,
	});

	return successResponse(res, rekening, "Bank account updated successfully");
});

/**
 * Delete rekening (OPTIMIZED)
 */
const deleteRekening = catchAsync(async (req, res) => {
	const { id } = req.params;

	const deleted = await deleteRecord(Rekening, id);

	if (!deleted) {
		throw new NotFoundError("Bank account not found");
	}

	logger.info("Bank account deleted", {
		rekeningId: id,
		deletedBy: req.user?.id,
	});

	return successResponse(res, null, "Bank account deleted successfully");
});

/**
 * Get active rekening (NEW)
 */
const getActiveRekening = catchAsync(async (req, res) => {
	const rekeningList = await Rekening.findAll({
		order: [["createdAt", "DESC"]],
	});

	return successResponse(
		res,
		rekeningList,
		"Active bank accounts retrieved successfully"
	);
});

module.exports = {
	getAllRekening,
	getRekeningById,
	createRekening,
	updateRekening,
	deleteRekening,
	getActiveRekening,
};
