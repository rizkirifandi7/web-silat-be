"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class DonationNotification extends Model {
		static associate(models) {
			DonationNotification.belongsTo(models.Donation, {
				foreignKey: "donation_id",
				as: "donation",
			});
		}
	}

	DonationNotification.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			donation_id: {
				type: DataTypes.INTEGER,
			},
			transaction_id: {
				type: DataTypes.STRING(255),
			},
			notification_body: {
				type: DataTypes.TEXT,
			},
			transaction_status: {
				type: DataTypes.STRING(100),
			},
			fraud_status: {
				type: DataTypes.STRING(100),
			},
			status_code: {
				type: DataTypes.STRING(10),
			},
			gross_amount: {
				type: DataTypes.DECIMAL(15, 2),
			},
			signature_key: {
				type: DataTypes.TEXT,
			},
			is_verified: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			is_processed: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			processed_at: {
				type: DataTypes.DATE,
			},
			error_message: {
				type: DataTypes.TEXT,
			},
			received_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			sequelize,
			modelName: "DonationNotification",
			tableName: "donation_notifications",
			timestamps: false,
			underscored: true,
			indexes: [{ fields: ["transaction_id"] }, { fields: ["is_processed"] }],
		}
	);

	return DonationNotification;
};
