"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class CampaignGallery extends Model {
		static associate(models) {
			CampaignGallery.belongsTo(models.DonationCampaign, {
				foreignKey: "campaign_id",
				as: "campaign",
			});
		}
	}

	CampaignGallery.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			campaign_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			image_url: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			caption: {
				type: DataTypes.TEXT,
			},
			sort_order: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: "CampaignGallery",
			tableName: "campaign_gallery",
			timestamps: true,
			underscored: true,
			createdAt: "created_at",
			updatedAt: false,
			indexes: [{ fields: ["campaign_id"] }],
		}
	);

	return CampaignGallery;
};
