"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
	class PaymentMethod extends Model {
		static associate(models) {
			// No associations for now
		}
	}

	PaymentMethod.init(
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			name: {
				type: DataTypes.STRING(100),
				allowNull: false,
			},
			channel: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			midtrans_code: {
				type: DataTypes.STRING(50),
			},
			icon_url: {
				type: DataTypes.TEXT,
			},
			description: {
				type: DataTypes.TEXT,
			},
			admin_fee_type: {
				type: DataTypes.STRING(20),
				defaultValue: "fixed",
			},
			admin_fee_value: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			is_active: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
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
			modelName: "PaymentMethod",
			tableName: "payment_methods",
			timestamps: true,
			underscored: true,
			createdAt: "created_at",
			updatedAt: false,
			indexes: [{ fields: ["channel"] }, { fields: ["is_active"] }],
		}
	);

	return PaymentMethod;
};
