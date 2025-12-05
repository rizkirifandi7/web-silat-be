/**
 * OPTIMIZED Order Controller
 * - Uses catchAsync for error handling
 * - Uses standardized responses
 * - Uses transactions for data consistency
 * - Better error handling
 * - Eager loading for relations
 */

const { Order, OrderItem, Katalog } = require("../models");
const { catchAsync } = require("../middleware/errorHandler");
const {
	successResponse,
	createdResponse,
	notFoundResponse,
	paginatedResponse,
} = require("../utils/response");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const { getPaginated, getById } = require("../utils/dbService");
const logger = require("../config/logger");
const { Op } = require("sequelize");
const db = require("../models");

/**
 * Create order (OPTIMIZED)
 * - Uses transaction for consistency
 * - Validates product availability
 * - Calculates total automatically
 */
const createOrder = catchAsync(async (req, res) => {
	const { namaPembeli, email, alamat, noTelepon, items } = req.body;

	// Validate items
	if (!items || !Array.isArray(items) || items.length === 0) {
		throw new BadRequestError("Order items are required");
	}

	// Start transaction
	const transaction = await db.sequelize.transaction();

	try {
		// Calculate total and validate products
		let totalHarga = 0;
		const validatedItems = [];

		for (const item of items) {
			const katalog = await Katalog.findByPk(item.idKatalog, { transaction });

			if (!katalog) {
				await transaction.rollback();
				throw new NotFoundError(`Product ${item.idKatalog} not found`);
			}

			if (katalog.status !== "tersedia") {
				await transaction.rollback();
				throw new BadRequestError(`Product ${katalog.nama} is not available`);
			}

			const itemTotal = parseFloat(katalog.harga) * item.jumlah;
			totalHarga += itemTotal;

			validatedItems.push({
				katalog,
				jumlah: item.jumlah,
				hargaSatuan: katalog.harga,
			});
		}

		// Create order
		const order = await Order.create(
			{
				namaPembeli,
				email,
				alamat,
				noTelepon,
				totalHarga,
				statusPembayaran: "pending",
			},
			{ transaction }
		);

		// Create order items
		for (const item of validatedItems) {
			await OrderItem.create(
				{
					idOrder: order.id,
					idKatalog: item.katalog.id,
					jumlah: item.jumlah,
					hargaSatuan: item.hargaSatuan,
				},
				{ transaction }
			);
		}

		// Commit transaction
		await transaction.commit();

		// Fetch complete order with items
		const completeOrder = await Order.findByPk(order.id, {
			include: [
				{
					model: OrderItem,
					as: "orderItems",
					include: [{ model: Katalog, as: "katalog" }],
				},
			],
		});

		logger.info("Order created", { orderId: order.id, total: totalHarga });

		return createdResponse(res, completeOrder, "Order created successfully");
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
});

/**
 * Get all orders with pagination (NEW - OPTIMIZED)
 */
const getAllOrders = catchAsync(async (req, res) => {
	const { page = 1, limit = 10, statusPembayaran, search } = req.query;

	const where = {};

	if (statusPembayaran) {
		where.statusPembayaran = statusPembayaran;
	}

	if (search) {
		where[Op.or] = [
			{ namaPembeli: { [Op.iLike]: `%${search}%` } },
			{ email: { [Op.iLike]: `%${search}%` } },
			{ noTelepon: { [Op.iLike]: `%${search}%` } },
		];
	}

	const result = await getPaginated(Order, {
		page,
		limit,
		where,
		include: [
			{
				model: OrderItem,
				as: "orderItems",
				include: [
					{
						model: Katalog,
						as: "katalog",
						attributes: ["id", "nama", "harga"],
					},
				],
			},
		],
		order: [["createdAt", "DESC"]],
	});

	return paginatedResponse(
		res,
		result.data,
		result.pagination,
		"Orders retrieved successfully"
	);
});

/**
 * Get order by ID (OPTIMIZED)
 */
const getOrderById = catchAsync(async (req, res) => {
	const { id } = req.params;

	const order = await getById(Order, id, {
		include: [
			{
				model: OrderItem,
				as: "orderItems",
				include: [{ model: Katalog, as: "katalog" }],
			},
		],
	});

	if (!order) {
		throw new NotFoundError("Order not found");
	}

	return successResponse(res, order, "Order retrieved successfully");
});

/**
 * Update order status (NEW - OPTIMIZED)
 */
const updateOrderStatus = catchAsync(async (req, res) => {
	const { id } = req.params;
	const { statusPembayaran } = req.body;

	const validStatuses = [
		"pending",
		"paid",
		"processing",
		"shipped",
		"completed",
		"cancelled",
	];
	if (!validStatuses.includes(statusPembayaran)) {
		throw new BadRequestError("Invalid payment status");
	}

	const order = await Order.findByPk(id);
	if (!order) {
		throw new NotFoundError("Order not found");
	}

	await order.update({ statusPembayaran });

	logger.info("Order status updated", {
		orderId: id,
		newStatus: statusPembayaran,
		updatedBy: req.user?.id,
	});

	return successResponse(res, order, "Order status updated successfully");
});

/**
 * Get order statistics (NEW)
 */
const getOrderStats = catchAsync(async (req, res) => {
	const totalOrders = await Order.count();
	const pendingOrders = await Order.count({
		where: { statusPembayaran: "pending" },
	});
	const completedOrders = await Order.count({
		where: { statusPembayaran: "completed" },
	});

	const totalRevenue = await Order.sum("totalHarga", {
		where: { statusPembayaran: ["paid", "completed"] },
	});

	const stats = {
		totalOrders,
		pendingOrders,
		completedOrders,
		totalRevenue: totalRevenue || 0,
	};

	return successResponse(res, stats, "Order statistics retrieved successfully");
});

/**
 * Cancel order (NEW)
 */
const cancelOrder = catchAsync(async (req, res) => {
	const { id } = req.params;
	const { reason } = req.body;

	const order = await Order.findByPk(id);
	if (!order) {
		throw new NotFoundError("Order not found");
	}

	if (order.statusPembayaran !== "pending") {
		throw new BadRequestError("Only pending orders can be cancelled");
	}

	await order.update({
		statusPembayaran: "cancelled",
		cancelReason: reason,
	});

	logger.info("Order cancelled", {
		orderId: id,
		reason,
		cancelledBy: req.user?.id,
	});

	return successResponse(res, order, "Order cancelled successfully");
});

module.exports = {
	createOrder,
	getAllOrders,
	getOrderById,
	updateOrderStatus,
	getOrderStats,
	cancelOrder,
};
