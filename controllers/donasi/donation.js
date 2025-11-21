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
			console.log("\n" + "=".repeat(80));
			console.log("🔵 CREATING MIDTRANS TRANSACTION");
			console.log("=".repeat(80));
			console.log("📋 Payment Method Details:");
			console.log(
				JSON.stringify(
					{
						id: paymentMethod.id,
						name: paymentMethod.name,
						channel: paymentMethod.channel,
						midtrans_code: paymentMethod.midtrans_code,
					},
					null,
					2
				)
			);

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

			console.log("📤 Sending to Midtrans Snap API:");
			console.log(JSON.stringify(midtransParams, null, 2));
			console.log("=".repeat(80) + "\n");

			const midtransResponse = await createTransaction(midtransParams);

			console.log("✅ Midtrans Response:");
			console.log(JSON.stringify(midtransResponse, null, 2));

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
			console.error("\n" + "=".repeat(80));
			console.error("❌ MIDTRANS ERROR");
			console.error("=".repeat(80));
			console.error("Error Message:", midtransError.message);
			console.error("Error Details:", JSON.stringify(midtransError, null, 2));
			if (midtransError.response) {
				console.error(
					"Midtrans Response:",
					JSON.stringify(
						midtransError.response.data || midtransError.response,
						null,
						2
					)
				);
			}
			console.error("=".repeat(80) + "\n");

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
		console.error("Error creating donation:", error);
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
		console.error("Error handling notification:", error);
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
		console.error("Error checking donation status:", error);
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
		console.error("Error getting donations:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get donations",
			error: error.message,
		});
	}
};

module.exports = {
	createDonation,
	handleMidtransNotification,
	checkDonationStatus,
	getDonations,
};
