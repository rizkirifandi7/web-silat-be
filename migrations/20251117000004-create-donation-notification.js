"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("donation_notifications", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			donation_id: {
				type: Sequelize.INTEGER,
				references: {
					model: "donations",
					key: "id",
				},
			},
			transaction_id: {
				type: Sequelize.STRING(255),
			},
			notification_body: {
				type: Sequelize.TEXT,
			},
			transaction_status: {
				type: Sequelize.STRING(100),
			},
			fraud_status: {
				type: Sequelize.STRING(100),
			},
			status_code: {
				type: Sequelize.STRING(10),
			},
			gross_amount: {
				type: Sequelize.DECIMAL(15, 2),
			},
			signature_key: {
				type: Sequelize.TEXT,
			},
			is_verified: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			is_processed: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			processed_at: {
				type: Sequelize.DATE,
			},
			error_message: {
				type: Sequelize.TEXT,
			},
			received_at: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		// Add indexes
		await queryInterface.addIndex("donation_notifications", ["transaction_id"]);
		await queryInterface.addIndex("donation_notifications", ["is_processed"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("donation_notifications");
	},
};
