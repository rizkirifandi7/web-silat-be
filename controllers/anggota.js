/**
 * OPTIMIZED Anggota Controller
 * - Uses catchAsync for error handling
 * - Uses standardized responses
 * - Uses custom error classes
 * - Uses cloudinary-helper for auto-cleanup
 * - Uses dbService for database operations
 * - Pagination support
 */

const { Anggota } = require("../models");
const bcrypt = require("bcrypt");
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
	updateRecord,
	deleteRecord,
} = require("../utils/dbService");
const logger = require("../config/logger");
const { Op } = require("sequelize");

/**
 * Get all members with pagination and search (OPTIMIZED)
 */
const getAllAnggota = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, search, role = "anggota" } = req.query;

	const where = { role };

	// Add search functionality
	if (search) {
		where[Op.or] = [
			{ nama: { [Op.iLike]: `%${search}%` } },
			{ email: { [Op.iLike]: `%${search}%` } },
			{ id_token: { [Op.iLike]: `%${search}%` } },
		];
	}

	const result = await getPaginated(Anggota, {
		page,
		limit,
		where,
		attributes: { exclude: ["password"] },
		order: [["createdAt", "DESC"]],
	});

	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Members retrieved successfully"
	);
});

/**
 * Get all admin members (OPTIMIZED)
 */
const getAllAnggotaAdmin = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, search } = req.query;

	const where = { role: "admin" };

	if (search) {
		where[Op.or] = [
			{ nama: { [Op.iLike]: `%${search}%` } },
			{ email: { [Op.iLike]: `%${search}%` } },
		];
	}

	const result = await getPaginated(Anggota, {
		page,
		limit,
		where,
		attributes: { exclude: ["password"] },
		order: [["createdAt", "DESC"]],
	});

	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Admin members retrieved successfully"
	);
});

/**
 * Get member by ID (OPTIMIZED)
 */
const getAnggotaById = catchAsync(async (req, res) => {
	const { id } = req.params;

	const anggota = await getById(Anggota, id, {
		attributes: { exclude: ["password"] },
	});

	if (!anggota) {
		throw new NotFoundError("Anggota not found");
	}

	return successResponse(res, anggota, "Member retrieved successfully");
});

/**
 * Get member by ID Token (OPTIMIZED)
 */
const getAnggotaByIdToken = catchAsync(async (req, res) => {
	const { id_token } = req.params;

	const anggota = await Anggota.findOne({
		where: { id_token },
		attributes: { exclude: ["password"] },
	});

	if (!anggota) {
		throw new NotFoundError("Anggota not found");
	}

	return successResponse(res, anggota, "Member retrieved successfully");
});

/**
 * Update member (OPTIMIZED)
 */
const updateAnggota = catchAsync(async (req, res) => {
	const { id } = req.params;
	const updateData = { ...req.body };

	// Check if member exists
	const anggota = await Anggota.findByPk(id);
	if (!anggota) {
		throw new NotFoundError("Anggota not found");
	}

	// Handle password update separately
	if (updateData.password) {
		updateData.password = await bcrypt.hash(updateData.password, 10);
	}

	// Handle image upload
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/anggota/fotos",
		});
		updateData.foto = result.secure_url;
	}

	// Update member
	await anggota.update(updateData);

	// Get updated data without password
	const { password: _, ...anggotaData } = anggota.toJSON();

	logger.info("Member updated", { id, updatedBy: req.user?.id });

	return successResponse(res, anggotaData, "Member updated successfully");
});

/**
 * Delete member (OPTIMIZED)
 */
const deleteAnggota = catchAsync(async (req, res) => {
	const { id } = req.params;

	const deleted = await deleteRecord(Anggota, id);

	if (!deleted) {
		throw new NotFoundError("Anggota not found");
	}

	logger.info("Member deleted", { id, deletedBy: req.user?.id });

	return successResponse(res, null, "Member deleted successfully");
});

/**
 * Get member statistics (NEW)
 */
const getAnggotaStats = catchAsync(async (req, res) => {
	const totalMembers = await Anggota.count({ where: { role: "anggota" } });
	const totalAdmins = await Anggota.count({
		where: {
			role: {
				[Op.in]: ["admin", "superadmin"],
			},
		},
	});
	const activeMembers = await Anggota.count({
		where: {
			role: "anggota",
			status_keanggotaan: "Aktif",
		},
	});

	// Statistik sabuk - yang punya sabuk adalah yang bukan "Belum punya", null, atau empty
	const membersWithBelt = await Anggota.count({
		where: {
			role: "anggota",
			tingkatan_sabuk: {
				[Op.and]: [
					{ [Op.not]: null },
					{ [Op.ne]: "" },
					{ [Op.ne]: "Belum punya" },
				],
			},
		},
	});

	const membersWithoutBelt = totalMembers - membersWithBelt;

	const stats = {
		totalMembers,
		totalAdmins,
		activeMembers,
		inactiveMembers: totalMembers - activeMembers,
		membersWithBelt,
		membersWithoutBelt,
	};

	return successResponse(res, stats, "Statistics retrieved successfully");
});

/**
 * Get admin statistics (NEW)
 */
const getAdminStats = catchAsync(async (req, res) => {
	const totalAdmins = await Anggota.count({
		where: {
			role: {
				[Op.in]: ["admin", "superadmin"],
			},
		},
	});

	const superAdmins = await Anggota.count({
		where: { role: "superadmin" },
	});

	const regularAdmins = await Anggota.count({
		where: { role: "admin" },
	});

	const totalMembers = await Anggota.count({ where: { role: "anggota" } });

	const stats = {
		totalAdmins,
		superAdmins,
		regularAdmins,
		totalMembers,
	};

	return successResponse(res, stats, "Admin statistics retrieved successfully");
});

/**
 * Bulk update member status (NEW)
 */
const bulkUpdateStatus = catchAsync(async (req, res) => {
	const { memberIds, status } = req.body;

	if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
		throw new BadRequestError("Member IDs are required");
	}

	if (!["aktif", "tidak aktif", "alumni"].includes(status)) {
		throw new BadRequestError("Invalid status");
	}

	const [updatedCount] = await Anggota.update(
		{ status_keanggotaan: status },
		{
			where: {
				id: memberIds,
			},
		}
	);

	logger.info("Bulk member status update", {
		count: updatedCount,
		status,
		updatedBy: req.user?.id,
	});

	return successResponse(
		res,
		{ updatedCount },
		`${updatedCount} members updated successfully`
	);
});

module.exports = {
	getAllAnggota,
	getAllAnggotaAdmin,
	getAnggotaById,
	getAnggotaByIdToken,
	updateAnggota,
	deleteAnggota,
	getAnggotaStats,
	getAdminStats,
	bulkUpdateStatus,
};
