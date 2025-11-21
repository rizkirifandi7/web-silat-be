const { Donation, DonationCampaign, PaymentMethod } = require("../../models");
const {
	createSnapTransaction,
	getTransactionStatus,
} = require("../../utils/payment");

/**
 * Create Donation & Payment
 */
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
		if (!campaign || campaign.status !== "active") {
			return res.status(404).json({
				status: "error",
				message: "Campaign not available",
			});
		}

		// Validate payment method
		const paymentMethod = await PaymentMethod.findByPk(payment_method_id);
		if (!paymentMethod || !paymentMethod.is_active) {
			return res.status(400).json({
				status: "error",
				message: "Invalid payment method",
			});
		}

		// Calculate fees
		const donationAmount = parseFloat(donation_amount);
		const adminFee =
			paymentMethod.admin_fee_type === "percentage"
				? (donationAmount * parseFloat(paymentMethod.admin_fee_value)) / 100
				: parseFloat(paymentMethod.admin_fee_value);
		const totalAmount = donationAmount + adminFee;

		// Generate transaction ID
		const transactionId = `DONATE-${campaign_id}-${Date.now()}-${Math.random()
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
			donation_amount: donationAmount,
			admin_fee: adminFee,
			total_amount: totalAmount,
			payment_method: paymentMethod.name,
			payment_channel: paymentMethod.channel,
			transaction_id: transactionId,
			payment_status: "pending",
		});

		// Prepare Midtrans parameters
		const midtransParams = {
			transaction_details: {
				order_id: transactionId,
				gross_amount: Math.round(totalAmount),
			},
			customer_details: {
				first_name: donor_name,
				email: donor_email,
				phone: donor_phone,
			},
			item_details: [
				{
					id: `campaign-${campaign_id}`,
					price: Math.round(donationAmount),
					quantity: 1,
					name: campaign.title.substring(0, 50),
				},
				{
					id: "admin-fee",
					price: Math.round(adminFee),
					quantity: 1,
					name: "Admin Fee",
				},
			],
			callbacks: {
				finish: `${process.env.FRONTEND_URL}/donasi/payment/success`,
			},
		};

		// Create payment transaction
		const payment = await createSnapTransaction(midtransParams);

		// Update donation with snap token
		await donation.update({
			snap_token: payment.token,
			midtrans_transaction_id: transactionId,
		});

		res.status(201).json({
			status: "success",
			message: "Donation created successfully",
			data: {
				donation_id: donation.id,
				transaction_id: transactionId,
				snap_token: payment.token,
				redirect_url: payment.redirect_url,
				total_amount: totalAmount,
			},
		});
	} catch (error) {
		console.error("Create Donation Error:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to create donation",
			error: error.message,
		});
	}
};

/**
 * Midtrans Webhook Handler
 */
const handleWebhook = async (req, res) => {
	try {
		const notification = req.body;
		const orderId = notification.order_id;
		const transactionStatus = notification.transaction_status;

		// Find donation
		const donation = await Donation.findOne({
			where: { transaction_id: orderId },
		});

		if (!donation) {
			return res.status(404).json({ status: "error", message: "Not found" });
		}

		// Update status based on transaction status
		let paymentStatus = "pending";

		if (transactionStatus === "capture" || transactionStatus === "settlement") {
			paymentStatus = "settlement";
			await donation.update({
				payment_status: paymentStatus,
				payment_date: new Date(),
			});

			// Update campaign
			const campaign = await DonationCampaign.findByPk(donation.campaign_id);
			await campaign.update({
				collected_amount:
					parseFloat(campaign.collected_amount) +
					parseFloat(donation.donation_amount),
				total_supporters: campaign.total_supporters + 1,
			});
		} else if (
			transactionStatus === "cancel" ||
			transactionStatus === "deny" ||
			transactionStatus === "expire"
		) {
			paymentStatus = "failed";
			await donation.update({ payment_status: paymentStatus });
		}

		res.json({ status: "success" });
	} catch (error) {
		console.error("Webhook Error:", error);
		res.status(500).json({ status: "error" });
	}
};

/**
 * Check Payment Status
 */
const checkStatus = async (req, res) => {
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

		// Query Midtrans for real-time status
		try {
			const midtransStatus = await getTransactionStatus(transaction_id);
			const transactionStatus = midtransStatus.transaction_status;

			console.log("Midtrans Status:", transactionStatus);

			// Update donation status if changed
			let shouldUpdate = false;
			let newStatus = donation.payment_status;

			if (
				transactionStatus === "capture" ||
				transactionStatus === "settlement"
			) {
				if (donation.payment_status !== "settlement") {
					newStatus = "settlement";
					shouldUpdate = true;
				}
			} else if (
				transactionStatus === "cancel" ||
				transactionStatus === "deny" ||
				transactionStatus === "expire"
			) {
				if (donation.payment_status !== "failed") {
					newStatus = "failed";
					shouldUpdate = true;
				}
			}

			// Update database if status changed
			if (shouldUpdate) {
				await donation.update({
					payment_status: newStatus,
					payment_date: newStatus === "settlement" ? new Date() : null,
				});

				// Update campaign if settled
				if (newStatus === "settlement") {
					const campaign = await DonationCampaign.findByPk(
						donation.campaign_id
					);
					await campaign.update({
						collected_amount:
							parseFloat(campaign.collected_amount) +
							parseFloat(donation.donation_amount),
						total_supporters: campaign.total_supporters + 1,
					});
				}

				// Reload donation with updated data
				await donation.reload();
			}
		} catch (midtransError) {
			console.warn("Failed to query Midtrans status:", midtransError.message);
			// Continue with database status if Midtrans query fails
		}

		res.json({
			status: "success",
			data: { donation },
		});
	} catch (error) {
		console.error("Check Status Error:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to check status",
		});
	}
};

module.exports = {
	createDonation,
	handleWebhook,
	checkStatus,
};
