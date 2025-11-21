"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class CampaignBenefit extends Model {
		static associate(models) {
			CampaignBenefit.belongsTo(models.DonationCampaign, {
				foreignKey: "campaign_id",
				as: "campaign",
			});
		}
	}

	CampaignBenefit.init(
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
			benefit_text: {
				type: DataTypes.STRING(500),
				allowNull: false,
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
			modelName: "CampaignBenefit",
			tableName: "campaign_benefits",
			timestamps: true,
			underscored: true,
			createdAt: "created_at",
			updatedAt: false,
			indexes: [{ fields: ["campaign_id"] }],
		}
	);

	return CampaignBenefit;
};
