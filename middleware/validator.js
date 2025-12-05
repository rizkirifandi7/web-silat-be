/**
 * Input Validation Middleware using Joi
 * Validates request body, params, and query against schemas
 */

const Joi = require("joi");
const { badRequestResponse } = require("../utils/response");

/**
 * Generic validation middleware
 * @param {Object} schema - Joi validation schema object with body/params/query
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
	return (req, res, next) => {
		const validationOptions = {
			abortEarly: false, // Return all errors, not just the first one
			allowUnknown: true, // Allow unknown keys that will be ignored
			stripUnknown: true, // Remove unknown keys from validated data
		};

		const dataToValidate = {
			body: req.body,
			params: req.params,
			query: req.query,
		};

		// Validate against the schema
		const { error, value } = Joi.object(schema).validate(
			dataToValidate,
			validationOptions
		);

		if (error) {
			// Format validation errors
			const errors = error.details.map((detail) => ({
				field: detail.path.join("."),
				message: detail.message.replace(/['"]/g, ""),
			}));

			return badRequestResponse(res, "Validation failed", errors);
		}

		// Replace request data with validated data
		req.body = value.body || req.body;
		req.params = value.params || req.params;
		req.query = value.query || req.query;

		next();
	};
};

// ============================================
// Common Validation Schemas
// ============================================

/**
 * Campaign Validation Schemas
 */
const campaignSchemas = {
	create: {
		body: Joi.object({
			title: Joi.string().required().min(5).max(200),
			full_description: Joi.string().required().min(20),
			category: Joi.string()
				.valid("pendidikan", "kesehatan", "bencana", "sosial", "lainnya")
				.required(),
			target_amount: Joi.number().positive().required(),
			start_date: Joi.date().iso().required(),
			end_date: Joi.date().iso().greater(Joi.ref("start_date")).required(),
			urgency_level: Joi.string()
				.valid("low", "medium", "high", "critical")
				.optional(),
			is_urgent: Joi.boolean().optional(),
		}),
	},

	update: {
		params: Joi.object({
			id: Joi.number().positive().required(),
		}),
		body: Joi.object({
			title: Joi.string().min(5).max(200).optional(),
			full_description: Joi.string().min(20).optional(),
			category: Joi.string()
				.valid("pendidikan", "kesehatan", "bencana", "sosial", "lainnya")
				.optional(),
			target_amount: Joi.number().positive().optional(),
			start_date: Joi.date().iso().optional(),
			end_date: Joi.date().iso().optional(),
			urgency_level: Joi.string()
				.valid("low", "medium", "high", "critical")
				.optional(),
			is_urgent: Joi.boolean().optional(),
		}),
	},

	getById: {
		params: Joi.object({
			id: Joi.number().positive().required(),
		}),
	},
};

/**
 * Payment Method Validation Schemas
 */
const paymentMethodSchemas = {
	create: {
		body: Joi.object({
			name: Joi.string().required().min(3).max(100),
			type: Joi.string()
				.valid("bank_transfer", "e_wallet", "virtual_account", "retail")
				.required(),
			admin_fee_type: Joi.string().valid("fixed", "percentage").required(),
			admin_fee_value: Joi.number().min(0).required(),
			is_active: Joi.boolean().optional(),
		}),
	},

	update: {
		params: Joi.object({
			id: Joi.number().positive().required(),
		}),
		body: Joi.object({
			name: Joi.string().min(3).max(100).optional(),
			type: Joi.string()
				.valid("bank_transfer", "e_wallet", "virtual_account", "retail")
				.optional(),
			admin_fee_type: Joi.string().valid("fixed", "percentage").optional(),
			admin_fee_value: Joi.number().min(0).optional(),
			is_active: Joi.boolean().optional(),
		}),
	},
};

/**
 * Donation Validation Schemas
 */
const donationSchemas = {
	create: {
		body: Joi.object({
			campaign_id: Joi.number().positive().required(),
			donor_name: Joi.string().required().min(2).max(100),
			donor_email: Joi.string().email().required(),
			donor_phone: Joi.string()
				.pattern(/^[0-9+]{10,15}$/)
				.optional(),
			amount: Joi.number().positive().min(10000).required(),
			payment_method_id: Joi.number().positive().required(),
			is_anonymous: Joi.boolean().optional(),
			message: Joi.string().max(500).optional(),
		}),
	},
};

/**
 * Auth Validation Schemas
 */
const authSchemas = {
	login: {
		body: Joi.object({
			email: Joi.string().email().required(),
			password: Joi.string().required().min(6),
		}),
	},

	register: {
		body: Joi.object({
			nama: Joi.string().required().min(2).max(100),
			email: Joi.string().email().required(),
			password: Joi.string().required().min(6),
			no_telp: Joi.string()
				.pattern(/^[0-9+]{10,15}$/)
				.optional(),
		}),
	},
};

/**
 * Pagination Validation Schema
 */
const paginationSchema = {
	query: Joi.object({
		page: Joi.number().integer().min(1).default(1),
		limit: Joi.number().integer().min(1).max(100).default(10),
		sort: Joi.string().optional(),
		order: Joi.string().valid("ASC", "DESC").default("DESC"),
	}),
};

module.exports = {
	validate,
	campaignSchemas,
	paymentMethodSchemas,
	donationSchemas,
	authSchemas,
	paginationSchema,
};
