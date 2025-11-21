"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class DonationStatistic extends Model {
		static associate(models) {
			DonationStatistic.belongsTo(models.DonationCampaign, {
				foreignKey: "campaign_id",
				as: "campaign",
			});
		}
	}

	DonationStatistic.init(
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
			date: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			total_donations: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			total_amount: {
				type: DataTypes.DECIMAL(15, 2),
				defaultValue: 0,
			},
			new_donors: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
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
			modelName: "DonationStatistic",
			tableName: "donation_statistics",
			timestamps: true,
			underscored: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			indexes: [
				{
					unique: true,
					fields: ["campaign_id", "date"],
					name: "unique_campaign_date",
				},
				{ fields: ["date"] },
			],
		}
	);

	return DonationStatistic;
};
