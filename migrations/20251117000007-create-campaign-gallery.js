"use strict";

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable("campaign_gallery", {
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
			image_url: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			caption: {
				type: Sequelize.TEXT,
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

		await queryInterface.addIndex("campaign_gallery", ["campaign_id"]);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable("campaign_gallery");
	},
};
