const { PaymentMethod } = require("../../models");
const cloudinary = require("../../middleware/cloudinary");
const {
	uploadToCloudinaryAndDelete,
} = require("../../utils/cloudinary-helper");

// Get all payment methods
const getAllPaymentMethods = async (req, res) => {
	try {
		const { channel, is_active } = req.query;

		const where = {};
		if (channel) where.channel = channel;
		if (is_active !== undefined) where.is_active = is_active === "true";

		const paymentMethods = await PaymentMethod.findAll({
			where,
			order: [
				["sort_order", "ASC"],
				["name", "ASC"],
			],
		});

		res.status(200).json({
			status: "success",
			data: paymentMethods,
		});
	} catch (error) {
		console.error("Error getting payment methods:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get payment methods",
			error: error.message,
		});
	}
};

// Get payment method by ID
const getPaymentMethodById = async (req, res) => {
	try {
		const { id } = req.params;

		const paymentMethod = await PaymentMethod.findByPk(id);
		if (!paymentMethod) {
			return res.status(404).json({
				status: "error",
				message: "Payment method not found",
			});
		}

		res.status(200).json({
			status: "success",
			data: paymentMethod,
		});
	} catch (error) {
		console.error("Error getting payment method:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get payment method",
			error: error.message,
		});
	}
};

// Create payment method
const createPaymentMethod = async (req, res) => {
	try {
		const {
			name,
			channel,
			midtrans_code,
			description,
			admin_fee_type,
			admin_fee_value,
			is_active,
			sort_order,
		} = req.body;

		let icon_url = null;
		if (req.file) {
			const result = await uploadToCloudinaryAndDelete(req.file.path, {
				folder: "payment_methods",
			});
			icon_url = result.secure_url;
		}

		const paymentMethod = await PaymentMethod.create({
			name,
			channel,
			midtrans_code,
			icon_url,
			description,
			admin_fee_type: admin_fee_type || "fixed",
			admin_fee_value: admin_fee_value || 0,
			is_active: is_active !== undefined ? is_active : true,
			sort_order: sort_order || 0,
		});

		res.status(201).json({
			status: "success",
			message: "Payment method created successfully",
			data: paymentMethod,
		});
	} catch (error) {
		console.error("Error creating payment method:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to create payment method",
			error: error.message,
		});
	}
};

// Update payment method
const updatePaymentMethod = async (req, res) => {
	try {
		const { id } = req.params;
		const updateData = { ...req.body };

		const paymentMethod = await PaymentMethod.findByPk(id);
		if (!paymentMethod) {
			return res.status(404).json({
				status: "error",
				message: "Payment method not found",
			});
		}

		if (req.file) {
			const result = await uploadToCloudinaryAndDelete(req.file.path, {
				folder: "payment_methods",
			});
			updateData.icon_url = result.secure_url;
		}

		await paymentMethod.update(updateData);

		res.status(200).json({
			status: "success",
			message: "Payment method updated successfully",
			data: paymentMethod,
		});
	} catch (error) {
		console.error("Error updating payment method:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to update payment method",
			error: error.message,
		});
	}
};

// Delete payment method
const deletePaymentMethod = async (req, res) => {
	try {
		const { id } = req.params;

		const paymentMethod = await PaymentMethod.findByPk(id);
		if (!paymentMethod) {
			return res.status(404).json({
				status: "error",
				message: "Payment method not found",
			});
		}

		await paymentMethod.destroy();

		res.status(200).json({
			status: "success",
			message: "Payment method deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting payment method:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to delete payment method",
			error: error.message,
		});
	}
};

// Upload payment method icon
const uploadPaymentMethodIcon = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				status: "error",
				message: "No icon file provided",
			});
		}

		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "payment_methods",
		});

		res.status(200).json({
			status: "success",
			data: {
				icon_url: result.secure_url,
			},
		});
	} catch (error) {
		console.error("Error uploading icon:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to upload icon",
			error: error.message,
		});
	}
};

module.exports = {
	getAllPaymentMethods,
	getPaymentMethodById,
	createPaymentMethod,
	updatePaymentMethod,
	deletePaymentMethod,
	uploadPaymentMethodIcon,
};
