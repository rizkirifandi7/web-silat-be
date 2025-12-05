/**
 * OPTIMIZED Course Controller
 * - Uses catchAsync for error handling
 * - Uses standardized responses
 * - Uses eager loading for materi relations
 * - Pagination support
 * - Search functionality
 */

const { Course, Materi } = require("../models");
const { catchAsync } = require("../middleware/errorHandler");
const {
	successResponse,
	createdResponse,
	notFoundResponse,
	paginatedResponse,
} = require("../utils/response");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const {
	getPaginated,
	getById,
	getOne,
	createRecord,
	updateRecord,
	deleteRecord,
} = require("../utils/dbService");
const logger = require("../config/logger");
const { Op } = require("sequelize");
const db = require("../models");

/**
 * Get all courses with pagination and search (OPTIMIZED)
 */
const getAllCourses = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, search } = req.query;

	const where = {};

	if (search) {
		where[Op.or] = [
			{ judul: { [Op.iLike]: `%${search}%` } },
			{ deskripsi: { [Op.iLike]: `%${search}%` } },
		];
	}

	const result = await getPaginated(Course, {
		page,
		limit,
		where,
		include: [
			{
				model: Materi,
				attributes: ["id", "judul", "tipeKonten", "tingkatan"],
			},
		],
		order: [["createdAt", "DESC"]],
	});

	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Courses retrieved successfully"
	);
});

/**
 * Get course by ID with all materi (OPTIMIZED)
 */
const getCourseById = catchAsync(async (req, res) => {
	const { id } = req.params;

	const course = await getById(Course, id, {
		include: [
			{
				model: Materi,
				order: [["tingkatan", "ASC"]],
			},
		],
	});

	if (!course) {
		throw new NotFoundError("Course not found");
	}

	return successResponse(res, course, "Course retrieved successfully");
});

/**
 * Get all courses for user (with locking info) (OPTIMIZED)
 */
const getAllCoursesForUser = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, search } = req.query;

	const where = {};

	if (search) {
		where[Op.or] = [
			{ judul: { [Op.iLike]: `%${search}%` } },
			{ deskripsi: { [Op.iLike]: `%${search}%` } },
		];
	}

	const result = await getPaginated(Course, {
		page,
		limit,
		where,
		include: [
			{
				model: Materi,
				attributes: ["id", "judul", "tipeKonten", "tingkatan"],
			},
		],
		order: [["createdAt", "DESC"]],
	});

	// Frontend will handle locking logic based on user level
	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Courses retrieved successfully"
	);
});

/**
 * Get course by ID for user (OPTIMIZED)
 */
const getCourseByIdForUser = catchAsync(async (req, res) => {
	const { id } = req.params;

	const course = await getById(Course, id, {
		include: [
			{
				model: Materi,
				order: [["tingkatan", "ASC"]],
			},
		],
	});

	if (!course) {
		throw new NotFoundError("Course not found");
	}

	// Frontend will handle locking logic
	return successResponse(res, course, "Course retrieved successfully");
});

/**
 * Get all materi by course ID (OPTIMIZED)
 */
const getAllMateriByCourseId = catchAsync(async (req, res) => {
	const { id_course } = req.params;

	// Check if course exists
	const course = await Course.findByPk(id_course);
	if (!course) {
		throw new NotFoundError("Course not found");
	}

	const materi = await Materi.findAll({
		where: { id_course },
		order: [["tingkatan", "ASC"]],
	});

	return successResponse(
		res,
		materi,
		"Course materials retrieved successfully"
	);
});

/**
 * Create course (OPTIMIZED)
 */
const createCourse = catchAsync(async (req, res) => {
	const { judul, deskripsi } = req.body;

	const newCourse = await createRecord(Course, {
		judul,
		deskripsi,
	});

	logger.info("Course created", {
		courseId: newCourse.id,
		createdBy: req.user?.id,
	});

	return createdResponse(res, newCourse, "Course created successfully");
});

/**
 * Update course (OPTIMIZED)
 */
const updateCourse = catchAsync(async (req, res) => {
	const { id } = req.params;
	const { judul, deskripsi } = req.body;

	const course = await updateRecord(Course, id, {
		judul,
		deskripsi,
	});

	if (!course) {
		throw new NotFoundError("Course not found");
	}

	logger.info("Course updated", { courseId: id, updatedBy: req.user?.id });

	return successResponse(res, course, "Course updated successfully");
});

/**
 * Delete course (OPTIMIZED)
 */
const deleteCourse = catchAsync(async (req, res) => {
	const { id } = req.params;

	// Use transaction for cascading deletes
	const transaction = await db.sequelize.transaction();

	try {
		const course = await Course.findByPk(id);
		if (!course) {
			await transaction.rollback();
			throw new NotFoundError("Course not found");
		}

		// Delete all associated materi first
		await Materi.destroy({
			where: { id_course: id },
			transaction,
		});

		// Delete course
		await course.destroy({ transaction });

		await transaction.commit();

		logger.info("Course deleted", { courseId: id, deletedBy: req.user?.id });

		return successResponse(res, null, "Course deleted successfully");
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
});

/**
 * Get course statistics (NEW)
 */
const getCourseStats = catchAsync(async (req, res) => {
	const totalCourses = await Course.count();
	const totalMateri = await Materi.count();

	const materiByType = await Materi.findAll({
		attributes: [
			"tipeKonten",
			[db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
		],
		group: ["tipeKonten"],
	});

	const stats = {
		totalCourses,
		totalMateri,
		materiByType: materiByType.map((m) => ({
			type: m.tipeKonten,
			count: parseInt(m.dataValues.count),
		})),
	};

	return successResponse(res, stats, "Statistics retrieved successfully");
});

module.exports = {
	getAllCourses,
	getCourseById,
	getAllCoursesForUser,
	getCourseByIdForUser,
	getAllMateriByCourseId,
	createCourse,
	updateCourse,
	deleteCourse,
	getCourseStats,
};
