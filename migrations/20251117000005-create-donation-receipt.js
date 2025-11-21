"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("donation_receipts", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			donation_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: "donations",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			receipt_number: {
				type: Sequelize.STRING(100),
				allowNull: false,
				unique: true,
			},
			receipt_url: {
				type: Sequelize.TEXT,
			},
			email_sent: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			email_sent_at: {
				type: Sequelize.DATE,
			},
			email_error: {
				type: Sequelize.TEXT,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		// Add indexes
		await queryInterface.addIndex("donation_receipts", ["donation_id"]);
		await queryInterface.addIndex("donation_receipts", ["receipt_number"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("donation_receipts");
	},
};
