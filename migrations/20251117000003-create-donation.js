"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("donations", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			campaign_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "donation_campaigns",
					key: "id",
				},
			},
			donor_name: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			donor_email: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			donor_phone: {
				type: Sequelize.STRING(20),
			},
			donor_message: {
				type: Sequelize.TEXT,
			},
			is_anonymous: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			donation_amount: {
				type: Sequelize.DECIMAL(15, 2),
				allowNull: false,
			},
			admin_fee: {
				type: Sequelize.DECIMAL(15, 2),
				defaultValue: 0,
			},
			total_amount: {
				type: Sequelize.DECIMAL(15, 2),
				allowNull: false,
			},
			payment_method: {
				type: Sequelize.STRING(100),
			},
			payment_channel: {
				type: Sequelize.STRING(100),
			},
			transaction_id: {
				type: Sequelize.STRING(255),
				unique: true,
			},
			payment_status: {
				type: Sequelize.STRING(50),
				defaultValue: "pending",
			},
			snap_token: {
				type: Sequelize.TEXT,
			},
			midtrans_transaction_id: {
				type: Sequelize.STRING(255),
			},
			midtrans_transaction_status: {
				type: Sequelize.STRING(100),
			},
			midtrans_fraud_status: {
				type: Sequelize.STRING(100),
			},
			payment_type: {
				type: Sequelize.STRING(100),
			},
			payment_date: {
				type: Sequelize.DATE,
			},
			expired_at: {
				type: Sequelize.DATE,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updated_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		// Add indexes
		await queryInterface.addIndex("donations", ["campaign_id"]);
		await queryInterface.addIndex("donations", ["transaction_id"]);
		await queryInterface.addIndex("donations", ["payment_status"]);
		await queryInterface.addIndex("donations", ["donor_email"]);
		await queryInterface.addIndex("donations", ["created_at"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("donations");
	},
};
