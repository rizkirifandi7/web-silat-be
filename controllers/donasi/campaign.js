const {
	DonationCampaign,
	CampaignBenefit,
	CampaignUpdate,
	CampaignGallery,
	Donation,
	DonationStatistic,
} = require("../../models");
const { Op } = require("sequelize");
const cloudinary = require("../../middleware/cloudinary");
const {
	uploadToCloudinaryAndDelete,
} = require("../../utils/cloudinary-helper");

// Get all campaigns with filters
const getAllCampaigns = async (req, res) => {
	try {
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

		const where = {};

		if (status) where.status = status;
		if (category) where.category = category;
		if (is_published !== undefined)
			where.is_published = is_published === "true";

		if (search) {
			where[Op.or] = [
				{ title: { [Op.like]: `%${search}%` } },
				{ description: { [Op.like]: `%${search}%` } },
			];
		}

		const offset = (parseInt(page) - 1) * parseInt(limit);

		const { count, rows } = await DonationCampaign.findAndCountAll({
			where,
			include: [
				{
					model: CampaignBenefit,
					as: "benefits",
					attributes: ["id", "benefit_text", "sort_order"],
				},
			],
			limit: parseInt(limit),
			offset: offset,
			order: [[sort_by, sort_order]],
			distinct: true,
		});

		// Calculate progress percentage for each campaign
		const campaignsWithProgress = rows.map((campaign) => {
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

		res.status(200).json({
			status: "success",
			data: {
				campaigns: campaignsWithProgress,
				pagination: {
					total: count,
					page: parseInt(page),
					limit: parseInt(limit),
					total_pages: Math.ceil(count / parseInt(limit)),
				},
			},
		});
	} catch (error) {
		console.error("Error getting campaigns:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get campaigns",
			error: error.message,
		});
	}
};

// Get campaign by ID or slug
const getCampaignBySlug = async (req, res) => {
	try {
		const { slug } = req.params;

		const campaign = await DonationCampaign.findOne({
			where: { slug },
			include: [
				{
					model: CampaignBenefit,
					as: "benefits",
					attributes: ["id", "benefit_text", "sort_order"],
					order: [["sort_order", "ASC"]],
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
					order: [["created_at", "DESC"]],
				},
				{
					model: CampaignGallery,
					as: "gallery",
					attributes: ["id", "image_url", "caption", "sort_order"],
					order: [["sort_order", "ASC"]],
				},
				{
					model: Donation,
					as: "donations",
					attributes: [
						"id",
						"donor_name",
						"donation_amount",
						"donor_message",
						"is_anonymous",
						"created_at",
					],
					where: {
						payment_status: "settlement",
						is_anonymous: false,
					},
					required: false,
					limit: 10,
					order: [["created_at", "DESC"]],
				},
			],
		});

		if (!campaign) {
			return res.status(404).json({
				status: "error",
				message: "Campaign not found",
			});
		}

		const campaignData = campaign.toJSON();
		campaignData.progress_percentage =
			campaignData.target_amount > 0
				? (
						(campaignData.collected_amount / campaignData.target_amount) *
						100
				  ).toFixed(2)
				: 0;

		// Calculate days remaining
		const today = new Date();
		const endDate = new Date(campaign.end_date);
		const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
		campaignData.days_remaining = daysRemaining > 0 ? daysRemaining : 0;

		res.status(200).json({
			status: "success",
			data: campaignData,
		});
	} catch (error) {
		console.error("Error getting campaign:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get campaign",
			error: error.message,
		});
	}
};

// Create new campaign
const createCampaign = async (req, res) => {
	try {
		const {
			title,
			slug,
			description,
			story,
			full_description,
			category,
			target_amount,
			start_date,
			end_date,
			organizer_name,
			organizer_description,
			benefits,
			image_url: bodyImageUrl,
			urgency_level,
			is_published,
			is_urgent,
		} = req.body;

		// Use story as full_description if provided (frontend sends 'story')
		const finalFullDescription = story || full_description || description;

		let image_url = bodyImageUrl || null;
		let organizer_image_url = null;

		// Upload campaign image if exists (for multipart/form-data)
		if (req.files && req.files.image) {
			const result = await uploadToCloudinaryAndDelete(
				req.files.image[0].path,
				{ folder: "donation_campaigns" }
			);
			image_url = result.secure_url;
		}

		// Upload organizer image if exists
		if (req.files && req.files.organizer_image) {
			const result = await uploadToCloudinaryAndDelete(
				req.files.organizer_image[0].path,
				{ folder: "donation_campaigns/organizers" }
			);
			organizer_image_url = result.secure_url;
		}

		// Auto-generate slug if not provided
		const campaignSlug =
			slug ||
			title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");

		// Debug log
		console.log("Creating campaign with image_url:", image_url);

		// Create campaign
		const campaign = await DonationCampaign.create({
			title,
			slug: campaignSlug,
			description,
			full_description: finalFullDescription,
			image_url,
			category,
			target_amount,
			urgency_level: urgency_level || "medium",
			is_published: is_published !== undefined ? is_published : false,
			is_urgent: is_urgent !== undefined ? is_urgent : false,
			start_date,
			end_date,
			organizer_name,
			organizer_image_url,
			organizer_description,
			created_by: req.user?.id, // Dari auth middleware
		});

		console.log(
			"Campaign created with ID:",
			campaign.id,
			"image_url:",
			campaign.image_url
		);

		// Create benefits if provided
		if (benefits && Array.isArray(benefits)) {
			const benefitData = benefits.map((benefit, index) => ({
				campaign_id: campaign.id,
				benefit_text: benefit.benefit_text || benefit.text || benefit,
				sort_order:
					benefit.sort_order !== undefined ? benefit.sort_order : index,
			}));
			await CampaignBenefit.bulkCreate(benefitData);
		}

		const createdCampaign = await DonationCampaign.findByPk(campaign.id, {
			include: [
				{
					model: CampaignBenefit,
					as: "benefits",
				},
			],
		});

		res.status(201).json({
			status: "success",
			message: "Campaign created successfully",
			data: createdCampaign,
		});
	} catch (error) {
		console.error("Error creating campaign:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to create campaign",
			error: error.message,
		});
	}
};

// Update campaign
const updateCampaign = async (req, res) => {
	try {
		const { id } = req.params;
		const { benefits, ...updateData } = req.body;

		const campaign = await DonationCampaign.findByPk(id);
		if (!campaign) {
			return res.status(404).json({
				status: "error",
				message: "Campaign not found",
			});
		}

		// Upload new images if provided (for multipart/form-data)
		if (req.files && req.files.image) {
			const result = await uploadToCloudinaryAndDelete(
				req.files.image[0].path,
				{ folder: "donation_campaigns" }
			);
			updateData.image_url = result.secure_url;
		}

		if (req.files && req.files.organizer_image) {
			const result = await uploadToCloudinaryAndDelete(
				req.files.organizer_image[0].path,
				{ folder: "donation_campaigns/organizers" }
			);
			updateData.organizer_image_url = result.secure_url;
		}

		// Support story field (frontend sends 'story', backend uses 'full_description')
		if (updateData.story) {
			updateData.full_description = updateData.story;
			delete updateData.story; // Remove story as it's not a DB column
		}

		await campaign.update(updateData);

		// Update benefits if provided
		if (benefits && Array.isArray(benefits)) {
			await CampaignBenefit.destroy({ where: { campaign_id: id } });
			const benefitData = benefits.map((benefit, index) => ({
				campaign_id: id,
				benefit_text: benefit.benefit_text || benefit.text || benefit,
				sort_order:
					benefit.sort_order !== undefined ? benefit.sort_order : index,
			}));
			await CampaignBenefit.bulkCreate(benefitData);
		}

		const updatedCampaign = await DonationCampaign.findByPk(id, {
			include: [
				{
					model: CampaignBenefit,
					as: "benefits",
				},
			],
		});

		res.status(200).json({
			status: "success",
			message: "Campaign updated successfully",
			data: updatedCampaign,
		});
	} catch (error) {
		console.error("Error updating campaign:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to update campaign",
			error: error.message,
		});
	}
};

// Delete campaign
const deleteCampaign = async (req, res) => {
	try {
		const { id } = req.params;

		const campaign = await DonationCampaign.findByPk(id);
		if (!campaign) {
			return res.status(404).json({
				status: "error",
				message: "Campaign not found",
			});
		}

		await campaign.destroy();

		res.status(200).json({
			status: "success",
			message: "Campaign deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting campaign:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to delete campaign",
			error: error.message,
		});
	}
};

// Get campaign statistics
const getCampaignStatistics = async (req, res) => {
	try {
		const { id } = req.params;
		const { start_date, end_date } = req.query;

		const where = { campaign_id: id };

		if (start_date && end_date) {
			where.date = {
				[Op.between]: [start_date, end_date],
			};
		}

		const statistics = await DonationStatistic.findAll({
			where,
			order: [["date", "ASC"]],
		});

		res.status(200).json({
			status: "success",
			data: statistics,
		});
	} catch (error) {
		console.error("Error getting statistics:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to get statistics",
			error: error.message,
		});
	}
};

// Upload campaign image
const uploadCampaignImage = async (req, res) => {
	try {
		if (!req.files || !req.files.image) {
			return res.status(400).json({
				status: "error",
				message: "No image file provided",
			});
		}

		const result = await uploadToCloudinaryAndDelete(req.files.image[0].path, {
			folder: "campaigns",
		});

		res.status(200).json({
			status: "success",
			data: {
				image_url: result.secure_url,
			},
		});
	} catch (error) {
		console.error("Error uploading image:", error);
		res.status(500).json({
			status: "error",
			message: "Failed to upload image",
			error: error.message,
		});
	}
};

module.exports = {
	getAllCampaigns,
	getCampaignBySlug,
	createCampaign,
	updateCampaign,
	deleteCampaign,
	getCampaignStatistics,
	uploadCampaignImage,
};
