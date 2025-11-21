"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("donation_statistics", {
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
			date: {
				type: Sequelize.DATEONLY,
				allowNull: false,
			},
			total_donations: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
			},
			total_amount: {
				type: Sequelize.DECIMAL(15, 2),
				defaultValue: 0,
			},
			new_donors: {
				type: Sequelize.INTEGER,
				defaultValue: 0,
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

		// Add unique constraint
		await queryInterface.addConstraint("donation_statistics", {
			fields: ["campaign_id", "date"],
			type: "unique",
			name: "unique_campaign_date",
		});

		await queryInterface.addIndex("donation_statistics", ["date"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("donation_statistics");
	},
};
