"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class DonationCampaign extends Model {
		static associate(models) {
			// Association with CampaignBenefit
			DonationCampaign.hasMany(models.CampaignBenefit, {
				foreignKey: "campaign_id",
				as: "benefits",
				onDelete: "CASCADE",
			});

			// Association with Donation
			DonationCampaign.hasMany(models.Donation, {
				foreignKey: "campaign_id",
				as: "donations",
			});

			// Association with CampaignUpdate
			DonationCampaign.hasMany(models.CampaignUpdate, {
				foreignKey: "campaign_id",
				as: "updates",
				onDelete: "CASCADE",
			});

			// Association with CampaignGallery
			DonationCampaign.hasMany(models.CampaignGallery, {
				foreignKey: "campaign_id",
				as: "gallery",
				onDelete: "CASCADE",
			});

			// Association with DonationStatistic
			DonationCampaign.hasMany(models.DonationStatistic, {
				foreignKey: "campaign_id",
				as: "statistics",
			});
		}
	}

	DonationCampaign.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			title: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			slug: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: true,
			},
			description: {
				type: DataTypes.TEXT,
			},
			full_description: {
				type: DataTypes.TEXT,
			},
			image_url: {
				type: DataTypes.TEXT,
			},
			category: {
				type: DataTypes.STRING(100),
			},
			target_amount: {
				type: DataTypes.DECIMAL(15, 2),
				allowNull: false,
			},
			collected_amount: {
				type: DataTypes.DECIMAL(15, 2),
				defaultValue: 0,
			},
			total_supporters: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			start_date: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			end_date: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING(50),
				defaultValue: "active",
			},
			urgency_level: {
				type: DataTypes.STRING(50),
				defaultValue: "medium",
			},
			is_urgent: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			is_published: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			organizer_name: {
				type: DataTypes.STRING(255),
			},
			organizer_image_url: {
				type: DataTypes.TEXT,
			},
			organizer_description: {
				type: DataTypes.TEXT,
			},
			created_by: {
				type: DataTypes.INTEGER,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: "DonationCampaign",
			tableName: "donation_campaigns",
			timestamps: true,
			underscored: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			indexes: [
				{ fields: ["status"] },
				{ fields: ["category"] },
				{ fields: ["end_date"] },
			],
		}
	);

	return DonationCampaign;
};
