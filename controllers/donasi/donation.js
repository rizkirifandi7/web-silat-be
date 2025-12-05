const {
	Donation,
	DonationCampaign,
	DonationNotification,
	DonationReceipt,
	PaymentMethod,
	DonationStatistic,
} = require("../../models");
const {
	createTransaction,
	createBankTransfer,
	getTransactionStatus,
} = require("../../utils/midtrans");
const { Op } = require("sequelize");
const crypto = require("crypto");
const logger = require("../../config/logger");

// Create donation transaction
const createDonation = async (req, res) => {
	try {
		const {
			campaign_id,
			donor_name,
			donor_email,
			donor_phone,
			donor_message,
			is_anonymous,
			donation_amount,
			payment_method_id,
		} = req.body;

		// Validate campaign
		const campaign = await DonationCampaign.findByPk(campaign_id);
		if (!campaign) {
			return res.status(404).json({
				status: "error",
				message: "Campaign not found",
			});
		}

		if (campaign.status !== "active") {
			return res.status(400).json({
				status: "error",
				message: "Campaign is not active",
			});
		}

		// Check if campaign is still running
		const now = new Date();
		if (now > new Date(campaign.end_date)) {
			return res.status(400).json({
				status: "error",
				message: "Campaign has ended",
			});
		}

		// Get payment method and calculate admin fee
		const paymentMethod = await PaymentMethod.findByPk(payment_method_id);
		if (!paymentMethod || !paymentMethod.is_active) {
			return res.status(400).json({
				status: "error",
				message: "Invalid payment method",
			});
		}

		let admin_fee = 0;
		if (paymentMethod.admin_fee_type === "percentage") {
			admin_fee =
				(parseFloat(donation_amount) *
					parseFloat(paymentMethod.admin_fee_value)) /
				100;
		} else {
			admin_fee = parseFloat(paymentMethod.admin_fee_value);
		}

		const total_amount = parseFloat(donation_amount) + admin_fee;

		// Generate unique transaction ID
		const transaction_id = `DONATE-${campaign_id}-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		// Create donation record
		const donation = await Donation.create({
			campaign_id,
			donor_name,
			donor_email,
			donor_phone,
			donor_message,
			is_anonymous: is_anonymous || false,
			donation_amount,
			admin_fee,
			total_amount,
			payment_method: paymentMethod.name,
			payment_channel: paymentMethod.channel,
			transaction_id,
			payment_status: "pending",
		});

		// Create Midtrans transaction
		try {
			// Build Midtrans parameter with bank_transfer specific config
			const midtransParams = {
				transaction_details: {
					order_id: transaction_id,
					gross_amount: Math.round(total_amount),
				},
				customer_details: {
					first_name: donor_name,
					email: donor_email,
					phone: donor_phone,
				},
				credit_card: {
					secure: true,
				},
				item_details: [
					{
						id: `campaign-${campaign_id}`,
						price: Math.round(parseFloat(donation_amount)),
						quantity: 1,
						name: campaign.title.substring(0, 50), // Limit to 50 chars
					},
					{
						id: "admin-fee",
						price: Math.round(admin_fee),
						quantity: 1,
						name: "Biaya Admin",
					},
				],
			};

			// Configure enabled_payments based on payment method
			// IMPORTANT: Don't use enabled_payments for Snap - let Midtrans show all methods
			// This is more reliable and avoids "Failed to Load" issues

			const midtransResponse = await createTransaction(midtransParams);

			// Update donation with Midtrans data
			await donation.update({
				snap_token: midtransResponse.token,
				midtrans_transaction_id:
					midtransResponse.transaction_id || transaction_id,
				expired_at: midtransResponse.expiry_time
					? new Date(midtransResponse.expiry_time)
					: null,
			});

			res.status(201).json({
				status: "success",
				message: "Donation created successfully",
				data: {
					donation_id: donation.id,
					transaction_id: donation.transaction_id,
					snap_token: midtransResponse.token,
					redirect_url: midtransResponse.redirect_url,
					va_numbers: midtransResponse.va_numbers,
					payment_type: midtransResponse.payment_type,
					total_amount: donation.total_amount,
				},
			});
		} catch (midtransError) {
			logger.error("Midtrans transaction failed", {
				message: midtransError.message,
				response: midtransError.response?.data,
			});

			// Update donation status to failed
			await donation.update({
				payment_status: "failed",
			});

			res.status(500).json({
				status: "error",
				message: "Failed to create payment transaction",
				error: midtransError.message,
				details: midtransError.response?.data || null,
			});
		}
	} catch (error) {
		logger.error("Failed to create donation", { error: error.message });
		res.status(500).json({
			status: "error",
			message: "Failed to create donation",
			error: error.message,
		});
	}
};

// Midtrans notification webhook
const handleMidtransNotification = async (req, res) => {
	try {
		const notification = req.body;

		// Save notification to database
		const notificationRecord = await DonationNotification.create({
			transaction_id: notification.order_id,
			notification_body: JSON.stringify(notification),
			transaction_status: notification.transaction_status,
			fraud_status: notification.fraud_status,
			status_code: notification.status_code,
			gross_amount: notification.gross_amount,
			signature_key: notification.signature_key,
			received_at: new Date(),
		});

		// Verify signature
		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		const orderId = notification.order_id;
		const statusCode = notification.status_code;
		const grossAmount = notification.gross_amount;
		const signatureKey = notification.signature_key;

		const hash = crypto
			.createHash("sha512")
			.update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
			.digest("hex");

		if (hash !== signatureKey) {
			await notificationRecord.update({
				is_verified: false,
				error_message: "Invalid signature",
			});

			return res.status(403).json({
				status: "error",
				message: "Invalid signature",
			});
		}

		await notificationRecord.update({ is_verified: true });

		// Find donation
		const donation = await Donation.findOne({
			where: { transaction_id: orderId },
			include: [
				{
					model: DonationCampaign,
					as: "campaign",
				},
			],
		});

		if (!donation) {
			await notificationRecord.update({
				is_processed: false,
				error_message: "Donation not found",
			});

			return res.status(404).json({
				status: "error",
				message: "Donation not found",
			});
		}

		await notificationRecord.update({ donation_id: donation.id });

		// Update donation status based on transaction status
		const transactionStatus = notification.transaction_status;
		const fraudStatus = notification.fraud_status;

		let paymentStatus = "pending";

		if (transactionStatus === "capture") {
			paymentStatus = fraudStatus === "accept" ? "settlement" : "pending";
		} else if (transactionStatus === "settlement") {
			paymentStatus = "settlement";
		} else if (
			transactionStatus === "cancel" ||
			transactionStatus === "deny" ||
			transactionStatus === "expire"
		) {
			paymentStatus = "failed";
		} else if (transactionStatus === "pending") {
			paymentStatus = "pending";
		}

		const updateData = {
			payment_status: paymentStatus,
			midtrans_transaction_status: transactionStatus,
			midtrans_fraud_status: fraudStatus,
			payment_type: notification.payment_type,
		};

		if (paymentStatus === "settlement") {
			updateData.payment_date = new Date();

			// Update campaign collected amount and supporters
			const campaign = donation.campaign;
			await campaign.update({
				collected_amount:
					parseFloat(campaign.collected_amount) +
					parseFloat(donation.donation_amount),
				total_supporters: campaign.total_supporters + 1,
			});

			// Update or create daily statistics
			const today = new Date().toISOString().split("T")[0];
			const [statistic, created] = await DonationStatistic.findOrCreate({
				where: {
					campaign_id: donation.campaign_id,
					date: today,
				},
				defaults: {
					total_donations: 1,
					total_amount: donation.donation_amount,
					new_donors: 1,
				},
			});

			if (!created) {
				await statistic.update({
					total_donations: statistic.total_donations + 1,
					total_amount:
						parseFloat(statistic.total_amount) +
						parseFloat(donation.donation_amount),
				});
			}

			// Generate receipt
			const receiptNumber = `RCP-${donation.id}-${Date.now()}`;
			await DonationReceipt.create({
				donation_id: donation.id,
				receipt_number: receiptNumber,
			});
		}

		await donation.update(updateData);

		await notificationRecord.update({
			is_processed: true,
			processed_at: new Date(),
		});

		res.status(200).json({
			status: "success",
			message: "Notification processed",
		});
	} catch (error) {
		logger.error("Error handling notification:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to process notification",
			error: error.message,
		});
	}
};

// Check donation status
const checkDonationStatus = async (req, res) => {
	try {
		const { transaction_id } = req.params;

		const donation = await Donation.findOne({
			where: { transaction_id },
			include: [
				{
					model: DonationCampaign,
					as: "campaign",
					attributes: ["id", "title", "slug"],
				},
			],
		});

		if (!donation) {
			return res.status(404).json({
				status: "error",
				message: "Donation not found",
			});
		}

		// Get latest status from Midtrans
		try {
			const midtransStatus = await getTransactionStatus(transaction_id);

			res.status(200).json({
				status: "success",
				data: {
					donation,
					midtrans_status: midtransStatus,
				},
			});
		} catch (midtransError) {
			res.status(200).json({
				status: "success",
				data: {
					donation,
				},
			});
		}
	} catch (error) {
		logger.error("Error checking donation status:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to check donation status",
			error: error.message,
		});
	}
};

// Get donation list (admin)
const getDonations = async (req, res) => {
	try {
		const {
			campaign_id,
			payment_status,
			search,
			page = 1,
			limit = 20,
			sort_by = "created_at",
			sort_order = "DESC",
		} = req.query;

		const where = {};

		if (campaign_id) where.campaign_id = campaign_id;
		if (payment_status) where.payment_status = payment_status;

		if (search) {
			where[Op.or] = [
				{ donor_name: { [Op.like]: `%${search}%` } },
				{ donor_email: { [Op.like]: `%${search}%` } },
				{ transaction_id: { [Op.like]: `%${search}%` } },
			];
		}

		const offset = (parseInt(page) - 1) * parseInt(limit);

		const { count, rows } = await Donation.findAndCountAll({
			where,
			include: [
				{
					model: DonationCampaign,
					as: "campaign",
					attributes: ["id", "title", "slug"],
				},
			],
			limit: parseInt(limit),
			offset: offset,
			order: [[sort_by, sort_order]],
		});

		res.status(200).json({
			status: "success",
			data: {
				donations: rows,
				pagination: {
					total: count,
					page: parseInt(page),
					limit: parseInt(limit),
					total_pages: Math.ceil(count / parseInt(limit)),
				},
			},
		});
	} catch (error) {
		logger.error("Error getting donations:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get donations",
			error: error.message,
		});
	}
};

// Get donation by ID with full details (admin)
const getDonationById = async (req, res) => {
	try {
		const { id } = req.params;

		const donation = await Donation.findByPk(id, {
			include: [
				{
					model: DonationCampaign,
					as: "campaign",
					attributes: ["id", "title", "slug", "category", "target_amount"],
				},
			],
		});

		if (!donation) {
			return res.status(404).json({
				status: "error",
				message: "Donation not found",
			});
		}

		// Transform the data to include paymentMethod structure
		const result = {
			...donation.toJSON(),
			paymentMethod: {
				id: null,
				name: donation.payment_method || "Unknown",
				channel: donation.payment_channel || "Unknown",
				icon_url: null,
			},
		};

		res.status(200).json({
			status: "success",
			data: result,
		});
	} catch (error) {
		logger.error("Error getting donation by ID:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get donation",
			error: error.message,
		});
	}
};

// Get donors list for specific campaign (admin)
const getDonorsByCampaign = async (req, res) => {
	try {
		const { campaign_id } = req.params;
		const { page = 1, limit = 50, payment_status = "settlement" } = req.query;

		const offset = (parseInt(page) - 1) * parseInt(limit);

		const { count, rows } = await Donation.findAndCountAll({
			where: {
				campaign_id,
				payment_status,
			},
			attributes: [
				"id",
				"donor_name",
				"donor_email",
				"donor_phone",
				"donor_message",
				"donation_amount",
				"admin_fee",
				"total_amount",
				"is_anonymous",
				"payment_status",
				"payment_method",
				"payment_channel",
				"transaction_id",
				"created_at",
			],
			limit: parseInt(limit),
			offset: offset,
			order: [["created_at", "DESC"]],
		});

		// Transform the data to match the expected frontend structure
		const donors = rows.map((donor) => ({
			id: donor.id,
			donor_name: donor.donor_name,
			donor_email: donor.donor_email,
			donor_phone: donor.donor_phone,
			donor_message: donor.donor_message,
			donation_amount: donor.donation_amount,
			admin_fee: donor.admin_fee,
			total_amount: donor.total_amount,
			is_anonymous: donor.is_anonymous,
			payment_status: donor.payment_status,
			transaction_id: donor.transaction_id,
			created_at: donor.created_at,
			paymentMethod: {
				name: donor.payment_method || "Unknown",
				channel: donor.payment_channel || "Unknown",
			},
		}));

		res.status(200).json({
			status: "success",
			data: {
				donors: donors,
				pagination: {
					total: count,
					page: parseInt(page),
					limit: parseInt(limit),
					total_pages: Math.ceil(count / parseInt(limit)),
				},
			},
		});
	} catch (error) {
		logger.error("Error getting donors by campaign:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get donors",
			error: error.message,
		});
	}
};

// Get donation statistics summary (admin)
const getDonationStatistics = async (req, res) => {
	try {
		const { start_date, end_date, campaign_id } = req.query;

		const where = {
			payment_status: "settlement", // Only count successful payments
		};

		if (campaign_id) where.campaign_id = campaign_id;

		if (start_date && end_date) {
			where.created_at = {
				[Op.between]: [new Date(start_date), new Date(end_date)],
			};
		}

		// Total donations and amount
		const totalStats = await Donation.findOne({
			where,
			attributes: [
				[
					Donation.sequelize.fn("COUNT", Donation.sequelize.col("id")),
					"total_donations",
				],
				[
					Donation.sequelize.fn(
						"SUM",
						Donation.sequelize.col("donation_amount")
					),
					"total_amount",
				],
				[
					Donation.sequelize.fn(
						"AVG",
						Donation.sequelize.col("donation_amount")
					),
					"average_donation",
				],
			],
			raw: true,
		});

		// Donations by status
		const statusBreakdown = await Donation.findAll({
			where: campaign_id ? { campaign_id } : {},
			attributes: [
				"payment_status",
				[Donation.sequelize.fn("COUNT", Donation.sequelize.col("id")), "count"],
				[
					Donation.sequelize.fn("SUM", Donation.sequelize.col("total_amount")),
					"amount",
				],
			],
			group: ["payment_status"],
			raw: true,
		});

		// Top donors (not anonymous)
		const topDonors = await Donation.findAll({
			where: {
				...where,
				is_anonymous: false,
			},
			attributes: [
				"donor_name",
				"donor_email",
				[
					Donation.sequelize.fn(
						"SUM",
						Donation.sequelize.col("donation_amount")
					),
					"total_donated",
				],
				[
					Donation.sequelize.fn("COUNT", Donation.sequelize.col("id")),
					"donation_count",
				],
			],
			group: ["donor_email", "donor_name"],
			order: [
				[
					Donation.sequelize.fn(
						"SUM",
						Donation.sequelize.col("donation_amount")
					),
					"DESC",
				],
			],
			limit: 10,
			raw: true,
		});

		// Donations by payment method
		const paymentMethodStats = await Donation.findAll({
			where,
			attributes: [
				"payment_method",
				"payment_channel",
				[Donation.sequelize.fn("COUNT", Donation.sequelize.col("id")), "count"],
				[
					Donation.sequelize.fn("SUM", Donation.sequelize.col("total_amount")),
					"amount",
				],
			],
			group: ["payment_method", "payment_channel"],
			raw: true,
		});

		// Daily donations trend (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const dailyTrend = await Donation.findAll({
			where: {
				...where,
				created_at: {
					[Op.gte]: thirtyDaysAgo,
				},
			},
			attributes: [
				[
					Donation.sequelize.fn("DATE", Donation.sequelize.col("created_at")),
					"date",
				],
				[Donation.sequelize.fn("COUNT", Donation.sequelize.col("id")), "count"],
				[
					Donation.sequelize.fn(
						"SUM",
						Donation.sequelize.col("donation_amount")
					),
					"amount",
				],
			],
			group: [
				Donation.sequelize.fn("DATE", Donation.sequelize.col("created_at")),
			],
			order: [
				[
					Donation.sequelize.fn("DATE", Donation.sequelize.col("created_at")),
					"ASC",
				],
			],
			raw: true,
		});

		res.status(200).json({
			status: "success",
			data: {
				summary: {
					total_donations: parseInt(totalStats.total_donations) || 0,
					total_amount: parseFloat(totalStats.total_amount) || 0,
					average_donation: parseFloat(totalStats.average_donation) || 0,
				},
				status_breakdown: statusBreakdown,
				top_donors: topDonors,
				payment_methods: paymentMethodStats,
				daily_trend: dailyTrend,
			},
		});
	} catch (error) {
		logger.error("Error getting donation statistics:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get statistics",
			error: error.message,
		});
	}
};

// Export donation data to CSV (admin)
const exportDonations = async (req, res) => {
	try {
		const { campaign_id, payment_status, start_date, end_date } = req.query;

		const where = {};

		if (campaign_id) where.campaign_id = campaign_id;
		if (payment_status) where.payment_status = payment_status;

		if (start_date && end_date) {
			where.created_at = {
				[Op.between]: [new Date(start_date), new Date(end_date)],
			};
		}

		const donations = await Donation.findAll({
			where,
			include: [
				{
					model: DonationCampaign,
					as: "campaign",
					attributes: ["title"],
				},
			],
			order: [["created_at", "DESC"]],
		});

		// Format as CSV
		const csvHeader = [
			"Transaction ID",
			"Date",
			"Campaign",
			"Donor Name",
			"Email",
			"Phone",
			"Amount",
			"Admin Fee",
			"Total",
			"Payment Method",
			"Status",
			"Anonymous",
			"Message",
		].join(",");

		const csvRows = donations.map((d) => {
			const date = new Date(d.created_at).toLocaleDateString("id-ID");
			return [
				d.transaction_id,
				date,
				`"${d.campaign?.title || ""}"`,
				`"${d.donor_name}"`,
				d.donor_email,
				d.donor_phone || "",
				d.donation_amount,
				d.admin_fee,
				d.total_amount,
				d.payment_method || "",
				d.payment_status,
				d.is_anonymous ? "Yes" : "No",
				`"${d.donor_message || ""}"`,
			].join(",");
		});

		const csv = [csvHeader, ...csvRows].join("\n");

		res.setHeader("Content-Type", "text/csv");
		res.setHeader(
			"Content-Disposition",
			`attachment; filename=donations_${Date.now()}.csv`
		);
		res.send(csv);
	} catch (error) {
		logger.error("Error exporting donations:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to export donations",
			error: error.message,
		});
	}
};

// Get recent donations (for dashboard widget)
const getRecentDonations = async (req, res) => {
	try {
		const { limit = 10 } = req.query;

		const donations = await Donation.findAll({
			where: {
				payment_status: "settlement",
			},
			include: [
				{
					model: DonationCampaign,
					as: "campaign",
					attributes: ["title", "slug"],
				},
			],
			attributes: [
				"id",
				"donor_name",
				"donation_amount",
				"is_anonymous",
				"created_at",
			],
			limit: parseInt(limit),
			order: [["created_at", "DESC"]],
		});

		res.status(200).json({
			status: "success",
			data: donations,
		});
	} catch (error) {
		logger.error("Error getting recent donations:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get recent donations",
			error: error.message,
		});
	}
};

// Update donation status manually (admin)
const updateDonationStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { payment_status, notes } = req.body;

		const donation = await Donation.findByPk(id);

		if (!donation) {
			return res.status(404).json({
				status: "error",
				message: "Donation not found",
			});
		}

		const oldStatus = donation.payment_status;

		await donation.update({
			payment_status,
			updated_at: new Date(),
		});

		logger.info(
			`Donation ${id} status changed from ${oldStatus} to ${payment_status}`,
			{
				admin_notes: notes,
			}
		);

		res.status(200).json({
			status: "success",
			message: "Donation status updated",
			data: donation,
		});
	} catch (error) {
		logger.error("Error updating donation status:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to update donation status",
			error: error.message,
		});
	}
};

module.exports = {
	createDonation,
	handleMidtransNotification,
	checkDonationStatus,
	getDonations,
	getDonationById,
	getDonorsByCampaign,
	getDonationStatistics,
	exportDonations,
	getRecentDonations,
	updateDonationStatus,
};

