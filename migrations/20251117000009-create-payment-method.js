"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("payment_methods", {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.INTEGER,
			},
			name: {
				type: Sequelize.STRING(100),
				allowNull: false,
			},
			channel: {
				type: Sequelize.STRING(50),
				allowNull: false,
			},
			midtrans_code: {
				type: Sequelize.STRING(50),
			},
			icon_url: {
				type: Sequelize.TEXT,
			},
			description: {
				type: Sequelize.TEXT,
			},
			admin_fee_type: {
				type: Sequelize.STRING(20),
				defaultValue: "fixed",
			},
			admin_fee_value: {
				type: Sequelize.DECIMAL(10, 2),
				defaultValue: 0,
			},
			is_active: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
			},
			sort_order: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});

		// Add indexes
		await queryInterface.addIndex("payment_methods", ["channel"]);
		await queryInterface.addIndex("payment_methods", ["is_active"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("payment_methods");
	},
};
