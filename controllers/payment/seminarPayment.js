const { Order, Seminar } = require("../../models");
const { createSnapTransaction } = require("../../utils/payment");

/**
 * Create Seminar Order & Payment
 */
const createOrder = async (req, res) => {
	try {
		const {
			seminar_id,
			customer_name,
			customer_email,
			customer_phone,
			customer_address,
			quantity,
		} = req.body;

		// Validate seminar
		const seminar = await Seminar.findByPk(seminar_id);
		if (!seminar) {
			return res.status(404).json({
				status: "error",
				message: "Seminar not found",
			});
		}

		// Check availability
		if (seminar.current_participants + quantity > seminar.max_participants) {
			return res.status(400).json({
				status: "error",
				message: "Not enough seats available",
			});
		}

		// Calculate total
		const pricePerSeat = parseFloat(seminar.price);
		const totalAmount = pricePerSeat * quantity;

		// Generate order ID
		const orderId = `SEMINAR-${seminar_id}-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		// Create order
		const order = await Order.create({
			seminar_id,
			order_id: orderId,
			customer_name,
			customer_email,
			customer_phone,
			customer_address,
			quantity,
			price: pricePerSeat,
			total_amount: totalAmount,
			payment_status: "pending",
		});

		// Prepare Midtrans parameters
		const midtransParams = {
			transaction_details: {
				order_id: orderId,
				gross_amount: Math.round(totalAmount),
			},
			customer_details: {
				first_name: customer_name,
				email: customer_email,
				phone: customer_phone,
			},
			item_details: [
				{
					id: `seminar-${seminar_id}`,
					price: Math.round(pricePerSeat),
					quantity: quantity,
					name: seminar.title.substring(0, 50),
				},
			],
			callbacks: {
				finish: `${process.env.FRONTEND_URL}/seminar/payment/success`,
			},
		};

		// Create payment transaction
		const payment = await createSnapTransaction(midtransParams);

		// Update order with snap token
		await order.update({
			snap_token: payment.token,
		});

		res.status(201).json({
			status: "success",
			message: "Order created successfully",
			data: {
				order_id: orderId,
				snap_token: payment.token,
				redirect_url: payment.redirect_url,
				total_amount: totalAmount,
			},
		});
	} catch (error) {
		console.error("Create Order Error:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to create order",
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

		// Find order
		const order = await Order.findOne({
			where: { order_id: orderId },
		});

		if (!order) {
			return res.status(404).json({ status: "error", message: "Not found" });
		}

		// Update status based on transaction status
		let paymentStatus = "pending";

		if (transactionStatus === "capture" || transactionStatus === "settlement") {
			paymentStatus = "settlement";
			await order.update({
				payment_status: paymentStatus,
				payment_date: new Date(),
			});

			// Update seminar participants
			const seminar = await Seminar.findByPk(order.seminar_id);
			await seminar.update({
				current_participants: seminar.current_participants + order.quantity,
			});
		} else if (
			transactionStatus === "cancel" ||
			transactionStatus === "deny" ||
			transactionStatus === "expire"
		) {
			paymentStatus = "failed";
			await order.update({ payment_status: paymentStatus });
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
		const { order_id } = req.params;

		const order = await Order.findOne({
			where: { order_id },
			include: [
				{
					model: Seminar,
					as: "seminar",
					attributes: ["id", "title"],
				},
			],
		});

		if (!order) {
			return res.status(404).json({
				status: "error",
				message: "Order not found",
			});
		}

		res.json({
			status: "success",
			data: { order },
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
	createOrder,
	handleWebhook,
	checkStatus,
};
