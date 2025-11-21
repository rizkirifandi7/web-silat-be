"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("campaign_updates", {
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
				onDelete: "CASCADE",
			},
			title: {
				type: Sequelize.STRING(255),
				allowNull: false,
			},
			content: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			image_url: {
				type: Sequelize.TEXT,
			},
			update_type: {
				type: Sequelize.STRING(50),
			},
			created_at: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			created_by: {
				type: Sequelize.INTEGER,
			},
		});

		// Add indexes
		await queryInterface.addIndex("campaign_updates", ["campaign_id"]);
		await queryInterface.addIndex("campaign_updates", ["created_at"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("campaign_updates");
	},
};
