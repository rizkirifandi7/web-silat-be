/**
 * Database Service Layer
 * Provides optimized database operations with eager loading
 */

const { Op } = require("sequelize");

/**
 * Generic function to get paginated results
 * @param {Model} model - Sequelize model
 * @param {Object} options - Query options
 * @returns {Object} Paginated data with metadata
 */
const getPaginated = async (
	model,
	{
		page = 1,
		limit = 10,
		where = {},
		include = [],
		order = [["createdAt", "DESC"]],
		attributes = null,
	} = {}
) => {
	const offset = (page - 1) * limit;

	const { count, rows } = await model.findAndCountAll({
		where,
		include,
		order,
		limit: parseInt(limit),
		offset: parseInt(offset),
		attributes,
		distinct: true, // Prevents duplicate counting when using joins
	});

	return {
		data: rows,
		pagination: {
			total: count,
			page: parseInt(page),
			limit: parseInt(limit),
			total_pages: Math.ceil(count / limit),
		},
	};
};

/**
 * Get single record with eager loading
 * @param {Model} model - Sequelize model
 * @param {Object} options - Query options
 * @returns {Object|null} Record or null
 */
const getOne = async (
	model,
	{ where, include = [], attributes = null } = {}
) => {
	return await model.findOne({
		where,
		include,
		attributes,
	});
};

/**
 * Get record by primary key with eager loading
 * @param {Model} model - Sequelize model
 * @param {Number} id - Primary key
 * @param {Object} options - Query options
 * @returns {Object|null} Record or null
 */
const getById = async (model, id, { include = [], attributes = null } = {}) => {
	return await model.findByPk(id, {
		include,
		attributes,
	});
};

/**
 * Create new record
 * @param {Model} model - Sequelize model
 * @param {Object} data - Record data
 * @param {Object} transaction - Optional transaction
 * @returns {Object} Created record
 */
const createRecord = async (model, data, transaction = null) => {
	return await model.create(data, { transaction });
};

/**
 * Update record
 * @param {Model} model - Sequelize model
 * @param {Number} id - Primary key
 * @param {Object} data - Update data
 * @param {Object} transaction - Optional transaction
 * @returns {Object|null} Updated record or null
 */
const updateRecord = async (model, id, data, transaction = null) => {
	const record = await model.findByPk(id);

	if (!record) {
		return null;
	}

	await record.update(data, { transaction });
	return record;
};

/**
 * Delete record
 * @param {Model} model - Sequelize model
 * @param {Number} id - Primary key
 * @param {Object} transaction - Optional transaction
 * @returns {Boolean} Success status
 */
const deleteRecord = async (model, id, transaction = null) => {
	const record = await model.findByPk(id);

	if (!record) {
		return false;
	}

	await record.destroy({ transaction });
	return true;
};

/**
 * Bulk create records
 * @param {Model} model - Sequelize model
 * @param {Array} data - Array of record data
 * @param {Object} transaction - Optional transaction
 * @returns {Array} Created records
 */
const bulkCreate = async (model, data, transaction = null) => {
	return await model.bulkCreate(data, { transaction });
};

/**
 * Search with multiple conditions
 * @param {Model} model - Sequelize model
 * @param {Object} options - Search options
 * @returns {Array} Matching records
 */
const search = async (
	model,
	{
		searchFields = [],
		searchTerm = "",
		where = {},
		include = [],
		order = [["createdAt", "DESC"]],
		limit = null,
	} = {}
) => {
	// Build search conditions
	const searchConditions =
		searchTerm && searchFields.length > 0
			? {
					[Op.or]: searchFields.map((field) => ({
						[field]: {
							[Op.iLike]: `%${searchTerm}%`,
						},
					})),
			  }
			: {};

	// Merge with additional where conditions
	const finalWhere = {
		...where,
		...searchConditions,
	};

	const queryOptions = {
		where: finalWhere,
		include,
		order,
	};

	if (limit) {
		queryOptions.limit = parseInt(limit);
	}

	return await model.findAll(queryOptions);
};

/**
 * Count records
 * @param {Model} model - Sequelize model
 * @param {Object} where - Where conditions
 * @returns {Number} Count
 */
const count = async (model, where = {}) => {
	return await model.count({ where });
};

/**
 * Check if record exists
 * @param {Model} model - Sequelize model
 * @param {Object} where - Where conditions
 * @returns {Boolean} Exists status
 */
const exists = async (model, where) => {
	const count = await model.count({ where });
	return count > 0;
};

module.exports = {
	getPaginated,
	getOne,
	getById,
	createRecord,
	updateRecord,
	deleteRecord,
	bulkCreate,
	search,
	count,
	exists,
};
