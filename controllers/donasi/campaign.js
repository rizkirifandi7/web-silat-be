/**
 * OPTIMIZED Campaign Controller Example
 * Demonstrates best practices with new utilities
 */

const {
	DonationCampaign,
	CampaignBenefit,
	CampaignUpdate,
	CampaignGallery,
	Donation,
} = require("../../models");
const { catchAsync } = require("../../middleware/errorHandler");
const {
	successResponse,
	createdResponse,
	notFoundResponse,
	paginatedResponse,
} = require("../../utils/response");
const { NotFoundError, BadRequestError } = require("../../utils/errors");
const { getPaginated, getOne, createRecord } = require("../../utils/dbService");
const {
	uploadToCloudinaryAndDelete,
} = require("../../utils/cloudinary-helper");
const { Op } = require("sequelize");
const db = require("../../models");

/**
 * Get All Campaigns (OPTIMIZED)
 * Uses dbService for pagination and eager loading
 */
const getAllCampaignsOptimized = catchAsync(async (req, res) => {
	const {
		status,
		category,
		search,
		is_published,
		page = 1,
		limit = 10,
		sort_by = "created_at",
		sort_order = "DESC",
	} = req.query;

	// Build where conditions
	const where = {};
	if (status) where.status = status;
	if (category) where.category = category;
	if (is_published !== undefined) where.is_published = is_published === "true";

	if (search) {
		where[Op.or] = [
			{ title: { [Op.iLike]: `%${search}%` } },
			{ full_description: { [Op.iLike]: `%${search}%` } },
		];
	}

	// Use dbService for optimized query
	const result = await getPaginated(DonationCampaign, {
		page,
		limit,
		where,
		include: [
			{
				model: CampaignBenefit,
				as: "benefits",
				attributes: ["id", "benefit_text", "sort_order"],
			},
		],
		order: [[sort_by, sort_order]],
	});

	// Calculate progress percentage
	const campaignsWithProgress = result.data.map((campaign) => {
		const campaignData = campaign.toJSON();
		campaignData.progress_percentage =
			campaignData.target_amount > 0
				? (
						(campaignData.collected_amount / campaignData.target_amount) *
						100
				  ).toFixed(2)
				: 0;
		return campaignData;
	});

	// Return paginated response
	return paginatedResponse(
		res,
		campaignsWithProgress,
		result.pagination,
		"Campaigns retrieved successfully"
	);
});

/**
 * Get Campaign by Slug (OPTIMIZED)
 * Single query with all relations using eager loading
 */
const getCampaignBySlugOptimized = catchAsync(async (req, res) => {
	const { slug } = req.params;

	// Single query with all relations
	const campaign = await getOne(DonationCampaign, {
		where: { slug },
		include: [
			{
				model: CampaignBenefit,
				as: "benefits",
				attributes: ["id", "benefit_text", "sort_order"],
			},
			{
				model: CampaignUpdate,
				as: "updates",
				attributes: [
					"id",
					"title",
					"content",
					"image_url",
					"update_type",
					"created_at",
				],
				limit: 5,
			},
			{
				model: CampaignGallery,
				as: "gallery",
				attributes: ["id", "image_url", "caption", "sort_order"],
			},
			{
				model: Donation,
				as: "donations",
				attributes: [
					"id",
					"donor_name",
					"donation_amount",
					"donor_message",
					"created_at",
				],
				where: {
					payment_status: "settlement",
					is_anonymous: false,
				},
				required: false,
				limit: 10,
			},
		],
	});

	if (!campaign) {
		throw new NotFoundError("Campaign not found");
	}

	// Calculate progress
	const campaignData = campaign.toJSON();
	campaignData.progress_percentage =
		campaignData.target_amount > 0
			? (
					(campaignData.collected_amount / campaignData.target_amount) *
					100
			  ).toFixed(2)
			: 0;

	return successResponse(res, campaignData, "Campaign retrieved successfully");
});

/**
 * Create Campaign (OPTIMIZED)
 * Uses transaction for data consistency
 */
const createCampaignOptimized = catchAsync(async (req, res) => {
	let {
		title,
		description,
		full_description,
		story,
		category,
		target_amount,
		start_date,
		end_date,
		urgency_level,
		is_urgent,
		is_published,
		image_url,
		benefits,
	} = req.body;

	// Parse benefits if it's a string (from multipart/form-data)
	if (typeof benefits === "string") {
		try {
			benefits = JSON.parse(benefits);
		} catch (e) {
			benefits = [];
		}
	}

	// Validate required fields (would be done by validator middleware)
	if (!title || !target_amount) {
		throw new BadRequestError("Missing required fields");
	}

	// Handle image upload if present
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/campaigns",
		});
		image_url = result.secure_url;
	}

	// Use transaction for data consistency
	const transaction = await db.sequelize.transaction();

	try {
		// Generate slug from title
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)/g, "");

		// Use story or full_description
		const finalDescription = story || full_description || description;

		// Create campaign
		const campaign = await createRecord(
			DonationCampaign,
			{
				title,
				slug,
				description: description || title,
				full_description: finalDescription,
				category,
				target_amount,
				start_date,
				end_date,
				urgency_level,
				is_urgent: is_urgent || false,
				is_published: is_published !== undefined ? is_published : true,
				image_url,
				status: "active",
			},
			transaction
		);

		// Create benefits if provided
		if (benefits && Array.isArray(benefits) && benefits.length > 0) {
			const benefitPromises = benefits.map((benefit) =>
				CampaignBenefit.create(
					{
						campaign_id: campaign.id,
						benefit_text: benefit.benefit_text,
						sort_order: benefit.sort_order || 0,
					},
					{ transaction }
				)
			);
			await Promise.all(benefitPromises);
		}

		// Commit transaction
		await transaction.commit();

		// Fetch campaign with benefits
		const createdCampaign = await getOne(DonationCampaign, {
			where: { id: campaign.id },
			include: [
				{
					model: CampaignBenefit,
					as: "benefits",
				},
			],
		});

		return createdResponse(
			res,
			createdCampaign,
			"Campaign created successfully"
		);
	} catch (error) {
		// Rollback on error
		await transaction.rollback();
		throw error;
	}
});

/**
 * Update Campaign (OPTIMIZED)
 * Uses transaction and optimized queries
 */
const updateCampaignOptimized = catchAsync(async (req, res) => {
	const { id } = req.params;
	let { benefits, story, full_description, description, ...updateData } =
		req.body;

	// Parse benefits if it's a string (from multipart/form-data)
	if (typeof benefits === "string") {
		try {
			benefits = JSON.parse(benefits);
		} catch (e) {
			benefits = null;
		}
	}

	// Handle image upload if present
	if (req.file) {
		const result = await uploadToCloudinaryAndDelete(req.file.path, {
			folder: "pencak-silat/campaigns",
		});
		updateData.image_url = result.secure_url;
	}

	// Handle description fields
	if (story) {
		updateData.full_description = story;
	} else if (full_description) {
		updateData.full_description = full_description;
	}
	if (description) {
		updateData.description = description;
	}

	// Use transaction
	const transaction = await db.sequelize.transaction();

	try {
		// Find campaign
		const campaign = await DonationCampaign.findByPk(id);

		if (!campaign) {
			await transaction.rollback();
			throw new NotFoundError("Campaign not found");
		}

		// Update campaign
		await campaign.update(updateData, { transaction });

		// Update benefits if provided
		if (benefits && Array.isArray(benefits)) {
			// Delete existing benefits
			await CampaignBenefit.destroy({
				where: { campaign_id: id },
				transaction,
			});

			// Create new benefits
			if (benefits.length > 0) {
				const benefitPromises = benefits.map((benefit) =>
					CampaignBenefit.create(
						{
							campaign_id: id,
							benefit_text: benefit.benefit_text,
							sort_order: benefit.sort_order || 0,
						},
						{ transaction }
					)
				);
				await Promise.all(benefitPromises);
			}
		}

		// Commit transaction
		await transaction.commit();

		// Fetch updated campaign with relations
		const updatedCampaign = await getOne(DonationCampaign, {
			where: { id },
			include: [
				{
					model: CampaignBenefit,
					as: "benefits",
				},
			],
		});

		return successResponse(
			res,
			updatedCampaign,
			"Campaign updated successfully"
		);
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
});

/**
 * Delete Campaign (OPTIMIZED)
 * Uses transaction for cascading deletes
 */
const deleteCampaignOptimized = catchAsync(async (req, res) => {
	const { id } = req.params;

	const transaction = await db.sequelize.transaction();

	try {
		const campaign = await DonationCampaign.findByPk(id);

		if (!campaign) {
			await transaction.rollback();
			throw new NotFoundError("Campaign not found");
		}

		// Delete campaign (cascade will handle related records)
		await campaign.destroy({ transaction });

		await transaction.commit();

		return successResponse(res, null, "Campaign deleted successfully");
	} catch (error) {
		await transaction.rollback();
		throw error;
	}
});

/**
 * Upload Campaign Image (NEW)
 * Separate endpoint for uploading campaign images
 */
const uploadCampaignImage = catchAsync(async (req, res) => {
	if (!req.file) {
		throw new BadRequestError("No image file provided");
	}

	const result = await uploadToCloudinaryAndDelete(req.file.path, {
		folder: "pencak-silat/campaigns",
	});

	return successResponse(
		res,
		{
			image_url: result.secure_url,
		},
		"Image uploaded successfully"
	);
});

module.exports = {
	getAllCampaignsOptimized,
	getCampaignBySlugOptimized,
	createCampaignOptimized,
	updateCampaignOptimized,
	deleteCampaignOptimized,
	uploadCampaignImage,
};
