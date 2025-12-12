/**
 * OPTIMIZED Materi Controller
 * - Uses catchAsync for error handling
 * - Uses standardized responses
 * - Uses cloudinary-helper for auto-cleanup
 * - Better file upload handling
 */

const { Materi, Course } = require("../models");
const { catchAsync } = require("../middleware/errorHandler");
const {
	successResponse,
	createdResponse,
	notFoundResponse,
	paginatedResponse,
} = require("../utils/response");
const { NotFoundError, BadRequestError } = require("../utils/errors");
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
 * Get all materi with pagination (OPTIMIZED)
 */
const getAllMateri = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, search, id_course, tipeKonten } = req.query;

	const where = {};

	if (search) {
		where[Op.or] = [
			{ judul: { [Op.iLike]: `%${search}%` } },
			{ deskripsi: { [Op.iLike]: `%${search}%` } },
		];
	}

	if (id_course) {
		where.id_course = id_course;
	}

	if (tipeKonten) {
		where.tipeKonten = tipeKonten;
	}

	const result = await getPaginated(Materi, {
		page,
		limit,
		where,
		include: [
			{
				model: Course,
				attributes: ["id", "judul"],
			},
		],
		order: [["tingkatan", "ASC"]],
	});

	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Materi retrieved successfully"
	);
});

/**
 * Get materi by ID (OPTIMIZED)
 */
const getMateriById = catchAsync(async (req, res) => {
	const { id } = req.params;

	const materi = await getById(Materi, id, {
		include: [
			{
				model: Course,
				attributes: ["id", "judul"],
			},
		],
	});

	if (!materi) {
		throw new NotFoundError("Materi not found");
	}

	return successResponse(res, materi, "Materi retrieved successfully");
});

/**
 * Get all materi for user (OPTIMIZED)
 */
const getAllMateriForUser = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, id_course } = req.query;

	const where = {};
	if (id_course) {
		where.id_course = id_course;
	}

	const result = await getPaginated(Materi, {
		page,
		limit,
		where,
		include: [
			{
				model: Course,
				attributes: ["id", "judul"],
			},
		],
		order: [["tingkatan", "ASC"]],
	});

	// Frontend will handle locking logic
	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Materi retrieved successfully"
	);
});

/**
 * Get materi by ID for user (OPTIMIZED)
 */
const getMateriByIdForUser = catchAsync(async (req, res) => {
	const { id } = req.params;

	const materi = await getById(Materi, id, {
		include: [
			{
				model: Course,
				attributes: ["id", "judul"],
			},
		],
	});

	if (!materi) {
		throw new NotFoundError("Materi not found");
	}

	// Frontend will handle access control
	return successResponse(res, materi, "Materi retrieved successfully");
});

/**
 * Create materi (OPTIMIZED)
 */
const createMateri = catchAsync(async (req, res) => {
	const { id_course, judul, deskripsi, tipeKonten, konten } = req.body;

	// Verify course exists and get its tingkatan_sabuk
	const course = await Course.findByPk(id_course);
	if (!course) {
		throw new NotFoundError("Course not found");
	}

	// Get max urutan for this course and increment
	const maxUrutan = await Materi.max("urutan", { where: { id_course } });
	const nextUrutan = (maxUrutan || 0) + 1;

	let kontenValue = konten;

	// Handle file upload
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/materi",
			resource_type: "auto", // Auto-detect file type (PDF, image, video)
		});
		kontenValue = result.secure_url;
	}

	// Inherit tingkatan from course, fallback to 'Belum punya' if course has no tingkatan
	const tingkatan = course.tingkatan_sabuk || "Belum punya";

	const newMateri = await createRecord(Materi, {
		id_course,
		judul,
		deskripsi,
		tipeKonten,
		konten: kontenValue,
		tingkatan,
		urutan: nextUrutan,
	});

	logger.info("Materi created", {
		materiId: newMateri.id,
		courseId: id_course,
		createdBy: req.user?.id,
	});

	return createdResponse(res, newMateri, "Materi created successfully");
});

/**
 * Update materi (OPTIMIZED)
 */
const updateMateri = catchAsync(async (req, res) => {
	const { id } = req.params;
	const updateData = { ...req.body };

	// Check if materi exists
	const materi = await Materi.findByPk(id);
	if (!materi) {
		throw new NotFoundError("Materi not found");
	}

	// Handle file upload
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/materi",
			resource_type: "auto",
		});
		updateData.konten = result.secure_url;
	}

	// Update materi
	await materi.update(updateData);

	logger.info("Materi updated", { materiId: id, updatedBy: req.user?.id });

	return successResponse(res, materi, "Materi updated successfully");
});

/**
 * Delete materi (OPTIMIZED)
 */
const deleteMateri = catchAsync(async (req, res) => {
	const { id } = req.params;

	const deleted = await deleteRecord(Materi, id);

	if (!deleted) {
		throw new NotFoundError("Materi not found");
	}

	logger.info("Materi deleted", { materiId: id, deletedBy: req.user?.id });

	return successResponse(res, null, "Materi deleted successfully");
});

/**
 * Get materi by course ID (OPTIMIZED)
 */
const getMaterisByCourseId = catchAsync(async (req, res) => {
	const { id_course } = req.params;

	// Verify course exists
	const course = await Course.findByPk(id_course);
	if (!course) {
		throw new NotFoundError("Course not found");
	}

	const materiList = await Materi.findAll({
		where: { id_course },
		order: [["tingkatan", "ASC"]],
	});

	return successResponse(
		res,
		materiList,
		"Course materials retrieved successfully"
	);
});

/**
 * Reorder materi tingkatan (NEW)
 */
const reorderMateri = catchAsync(async (req, res) => {
	const { materiOrder } = req.body; // Array of { id, tingkatan }

	if (!Array.isArray(materiOrder) || materiOrder.length === 0) {
		throw new BadRequestError("Invalid materi order data");
	}

	// Update each materi's tingkatan
	const updatePromises = materiOrder.map((item) =>
		Materi.update({ tingkatan: item.tingkatan }, { where: { id: item.id } })
	);

	await Promise.all(updatePromises);

	logger.info("Materi reordered", {
		count: materiOrder.length,
		updatedBy: req.user?.id,
	});

	return successResponse(res, null, "Materi order updated successfully");
});

/**
 * Update materi order (NEW)
 */
const updateMateriOrder = catchAsync(async (req, res) => {
	const { orders } = req.body; // Array of {id, urutan}
	const db = require("../models");

	if (!Array.isArray(orders) || orders.length === 0) {
		throw new BadRequestError("Orders must be a non-empty array");
	}

	const transaction = await db.sequelize.transaction();

	try {
		// Update each materi's urutan
		await Promise.all(
			orders.map((item) =>
				Materi.update(
					{ urutan: item.urutan },
					{ where: { id: item.id }, transaction }
				)
			)
		);

		await transaction.commit();

		logger.info("Materi order updated", { updatedBy: req.user?.id });

		return successResponse(res, null, "Materi order updated successfully");
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
});

module.exports = {
	getAllMateri,
	getMateriById,
	getAllMateriForUser,
	getMateriByIdForUser,
	createMateri,
	updateMateri,
	updateMateriOrder,
	deleteMateri,
	getMaterisByCourseId,
	reorderMateri,
};
