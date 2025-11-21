"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class Donation extends Model {
		static associate(models) {
			Donation.belongsTo(models.DonationCampaign, {
				foreignKey: "campaign_id",
				as: "campaign",
			});

			Donation.hasMany(models.DonationNotification, {
				foreignKey: "donation_id",
				as: "notifications",
			});

			Donation.hasOne(models.DonationReceipt, {
				foreignKey: "donation_id",
				as: "receipt",
				onDelete: "CASCADE",
			});
		}
	}

	Donation.init(
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
			donor_name: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			donor_email: {
				type: DataTypes.STRING(255),
				allowNull: false,
			},
			donor_phone: {
				type: DataTypes.STRING(20),
			},
			donor_message: {
				type: DataTypes.TEXT,
			},
			is_anonymous: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			donation_amount: {
				type: DataTypes.DECIMAL(15, 2),
				allowNull: false,
			},
			admin_fee: {
				type: DataTypes.DECIMAL(15, 2),
				defaultValue: 0,
			},
			total_amount: {
				type: DataTypes.DECIMAL(15, 2),
				allowNull: false,
			},
			payment_method: {
				type: DataTypes.STRING(100),
			},
			payment_channel: {
				type: DataTypes.STRING(100),
			},
			transaction_id: {
				type: DataTypes.STRING(255),
				unique: true,
			},
			payment_status: {
				type: DataTypes.STRING(50),
				defaultValue: "pending",
			},
			snap_token: {
				type: DataTypes.TEXT,
			},
			midtrans_transaction_id: {
				type: DataTypes.STRING(255),
			},
			midtrans_transaction_status: {
				type: DataTypes.STRING(100),
			},
			midtrans_fraud_status: {
				type: DataTypes.STRING(100),
			},
			payment_type: {
				type: DataTypes.STRING(100),
			},
			payment_date: {
				type: DataTypes.DATE,
			},
			expired_at: {
				type: DataTypes.DATE,
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
			modelName: "Donation",
			tableName: "donations",
			timestamps: true,
			underscored: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			indexes: [
				{ fields: ["campaign_id"] },
				{ fields: ["transaction_id"] },
				{ fields: ["payment_status"] },
				{ fields: ["donor_email"] },
				{ fields: ["created_at"] },
			],
		}
	);

	return Donation;
};
