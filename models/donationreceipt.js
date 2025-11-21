"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class DonationReceipt extends Model {
		static associate(models) {
			DonationReceipt.belongsTo(models.Donation, {
				foreignKey: "donation_id",
				as: "donation",
			});
		}
	}

	DonationReceipt.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			donation_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			receipt_number: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: true,
			},
			receipt_url: {
				type: DataTypes.TEXT,
			},
			email_sent: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			email_sent_at: {
				type: DataTypes.DATE,
			},
			email_error: {
				type: DataTypes.TEXT,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: "DonationReceipt",
			tableName: "donation_receipts",
			timestamps: true,
			underscored: true,
			createdAt: "created_at",
			updatedAt: false,
			indexes: [{ fields: ["donation_id"] }, { fields: ["receipt_number"] }],
		}
	);

	return DonationReceipt;
};
