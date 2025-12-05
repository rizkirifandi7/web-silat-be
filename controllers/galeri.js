/**
 * OPTIMIZED Galeri Controller
 * - Uses catchAsync for error handling
 * - Uses standardized responses
 * - Uses cloudinary-helper for auto-cleanup
 * - Pagination and search support
 */

const { Galeri } = require("../models");
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
 * Get all galeri with pagination and search (OPTIMIZED)
 */
const getAllGaleri = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, search } = req.query;

	const where = {};

	if (search) {
		where[Op.or] = [
			{ judul: { [Op.iLike]: `%${search}%` } },
			{ deskripsi: { [Op.iLike]: `%${search}%` } },
		];
	}

	const result = await getPaginated(Galeri, {
		page,
		limit,
		where,
		order: [["createdAt", "DESC"]],
	});

	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Gallery items retrieved successfully"
	);
});

/**
 * Get galeri by ID (OPTIMIZED)
 */
const getGaleriById = catchAsync(async (req, res) => {
	const { id } = req.params;

	const galeri = await getById(Galeri, id);

	if (!galeri) {
		throw new NotFoundError("Gallery item not found");
	}

	return successResponse(res, galeri, "Gallery item retrieved successfully");
});

/**
 * Create galeri (OPTIMIZED)
 */
const createGaleri = catchAsync(async (req, res) => {
	const { judul, deskripsi, gambar } = req.body;

	let gambarUrl = gambar || null; // Use gambar from body if provided (upload-first approach)

	// Fallback: Handle image upload if file provided (backward compatible)
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/galeri",
		});
		gambarUrl = result.secure_url;
	}

	const newGaleri = await createRecord(Galeri, {
		gambar: gambarUrl,
		judul,
		deskripsi,
	});

	logger.info("Gallery item created", {
		galeriId: newGaleri.id,
		createdBy: req.user?.id,
	});

	return createdResponse(res, newGaleri, "Gallery item created successfully");
});

/**
 * Update galeri (OPTIMIZED)
 */
const updateGaleri = catchAsync(async (req, res) => {
	const { id } = req.params;
	const { judul, deskripsi, gambar } = req.body;

	// Check if galeri exists
	const galeri = await Galeri.findByPk(id);
	if (!galeri) {
		throw new NotFoundError("Gallery item not found");
	}

	const updateData = { judul, deskripsi };

	// Use gambar from body if provided (upload-first approach)
	if (gambar) {
		updateData.gambar = gambar;
	}

	// Fallback: Handle image upload if file provided (backward compatible)
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/galeri",
		});
		updateData.gambar = result.secure_url;
	}

	// Update galeri
	await galeri.update(updateData);

	logger.info("Gallery item updated", {
		galeriId: id,
		updatedBy: req.user?.id,
	});

	return successResponse(res, galeri, "Gallery item updated successfully");
});

/**
 * Delete galeri (OPTIMIZED)
 */
const deleteGaleri = catchAsync(async (req, res) => {
	const { id } = req.params;

	const deleted = await deleteRecord(Galeri, id);

	if (!deleted) {
		throw new NotFoundError("Gallery item not found");
	}

	logger.info("Gallery item deleted", {
		galeriId: id,
		deletedBy: req.user?.id,
	});

	return successResponse(res, null, "Gallery item deleted successfully");
});

/**
 * Get recent galeri items (NEW)
 */
const getRecentGaleri = catchAsync(async (req, res) => {
	const { limit = 6 } = req.query;

	const galeriList = await Galeri.findAll({
		limit: parseInt(limit),
		order: [["createdAt", "DESC"]],
	});

	return successResponse(
		res,
		galeriList,
		"Recent gallery items retrieved successfully"
	);
});

/**
 * Upload Galeri Image (NEW)
 * Separate endpoint for uploading gallery images before form submission
 */
const uploadGaleriImage = catchAsync(async (req, res) => {
	if (!req.file) {
		throw new NotFoundError("No image file provided");
	}

	const result = await uploadToCloudinaryAndDelete(req.file.path, {
		folder: "pencak-silat/galeri",
	});

	logger.info("Gallery image uploaded", {
		imageUrl: result.secure_url,
		uploadedBy: req.user?.id,
	});

	return successResponse(
		res,
		{
			gambar_url: result.secure_url,
		},
		"Image uploaded successfully"
	);
});

module.exports = {
	getAllGaleri,
	getGaleriById,
	createGaleri,
	updateGaleri,
	deleteGaleri,
	getRecentGaleri,
	uploadGaleriImage,
};
