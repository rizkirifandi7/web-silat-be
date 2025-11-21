"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class CampaignUpdate extends Model {
		static associate(models) {
			CampaignUpdate.belongsTo(models.DonationCampaign, {
				foreignKey: "campaign_id",
				as: "campaign",
			});
		}
	}

	CampaignUpdate.init(
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
			title: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			content: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			image_url: {
				type: DataTypes.TEXT,
			},
			update_type: {
				type: DataTypes.STRING(50),
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			created_by: {
				type: DataTypes.INTEGER,
			},
		},
		{
			sequelize,
			modelName: "CampaignUpdate",
			tableName: "campaign_updates",
			timestamps: true,
			underscored: true,
			createdAt: "created_at",
			updatedAt: false,
			indexes: [{ fields: ["campaign_id"] }, { fields: ["created_at"] }],
		}
	);

	return CampaignUpdate;
};
